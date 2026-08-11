import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Raeume, Dozenten, KurseWorkshops, Teilnehmer, Anmeldungen, Zahlungen } from '@/types/app';
import { LivingAppsService } from '@/services/livingAppsService';
import { t } from '@/i18n';

/** Dashboard data + the OPTIMISTIC-WRITE API.
 *
 *  The per-entity setters (`set<Entity>`) are exported for exactly one job:
 *  optimistic updates on drag writes (onEventDrop / onEventResize /
 *  onCardMove). Call the setter FIRST — the bar/card lands instantly — then
 *  fire the PATCH in the background and call `fetchAll()` ONLY in the catch.
 *  Never await the PATCH before updating state (the UI freezes for the full
 *  round-trip on every drag) and never refetch after a successful write.
 *  There is no other mechanism (no `__optimistic`, no `mutate`).
 */
export function useDashboardData() {
  const [raeume, setRaeume] = useState<Raeume[]>([]);
  const [dozenten, setDozenten] = useState<Dozenten[]>([]);
  const [kurseWorkshops, setKurseWorkshops] = useState<KurseWorkshops[]>([]);
  const [teilnehmer, setTeilnehmer] = useState<Teilnehmer[]>([]);
  const [anmeldungen, setAnmeldungen] = useState<Anmeldungen[]>([]);
  const [zahlungen, setZahlungen] = useState<Zahlungen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAll = useCallback(async () => {
    setError(null);
    try {
      const [raeumeData, dozentenData, kurseWorkshopsData, teilnehmerData, anmeldungenData, zahlungenData] = await Promise.all([
        LivingAppsService.getRaeume(),
        LivingAppsService.getDozenten(),
        LivingAppsService.getKurseWorkshops(),
        LivingAppsService.getTeilnehmer(),
        LivingAppsService.getAnmeldungen(),
        LivingAppsService.getZahlungen(),
      ]);
      setRaeume(raeumeData);
      setDozenten(dozentenData);
      setKurseWorkshops(kurseWorkshopsData);
      setTeilnehmer(teilnehmerData);
      setAnmeldungen(anmeldungenData);
      setZahlungen(zahlungenData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(t('data_load_failed')));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Silent background refresh (no loading state change → no flicker)
  useEffect(() => {
    async function silentRefresh() {
      try {
        const [raeumeData, dozentenData, kurseWorkshopsData, teilnehmerData, anmeldungenData, zahlungenData] = await Promise.all([
          LivingAppsService.getRaeume(),
          LivingAppsService.getDozenten(),
          LivingAppsService.getKurseWorkshops(),
          LivingAppsService.getTeilnehmer(),
          LivingAppsService.getAnmeldungen(),
          LivingAppsService.getZahlungen(),
        ]);
        setRaeume(raeumeData);
        setDozenten(dozentenData);
        setKurseWorkshops(kurseWorkshopsData);
        setTeilnehmer(teilnehmerData);
        setAnmeldungen(anmeldungenData);
        setZahlungen(zahlungenData);
      } catch {
        // silently ignore — stale data is better than no data
      }
    }
    function handleRefresh() { void silentRefresh(); }
    window.addEventListener('dashboard-refresh', handleRefresh);
    return () => window.removeEventListener('dashboard-refresh', handleRefresh);
  }, []);

  const raeumeMap = useMemo(() => {
    const m = new Map<string, Raeume>();
    raeume.forEach(r => m.set(r.record_id, r));
    return m;
  }, [raeume]);

  const dozentenMap = useMemo(() => {
    const m = new Map<string, Dozenten>();
    dozenten.forEach(r => m.set(r.record_id, r));
    return m;
  }, [dozenten]);

  const kurseWorkshopsMap = useMemo(() => {
    const m = new Map<string, KurseWorkshops>();
    kurseWorkshops.forEach(r => m.set(r.record_id, r));
    return m;
  }, [kurseWorkshops]);

  const teilnehmerMap = useMemo(() => {
    const m = new Map<string, Teilnehmer>();
    teilnehmer.forEach(r => m.set(r.record_id, r));
    return m;
  }, [teilnehmer]);

  const anmeldungenMap = useMemo(() => {
    const m = new Map<string, Anmeldungen>();
    anmeldungen.forEach(r => m.set(r.record_id, r));
    return m;
  }, [anmeldungen]);

  return { raeume, setRaeume, dozenten, setDozenten, kurseWorkshops, setKurseWorkshops, teilnehmer, setTeilnehmer, anmeldungen, setAnmeldungen, zahlungen, setZahlungen, loading, error, fetchAll, raeumeMap, dozentenMap, kurseWorkshopsMap, teilnehmerMap, anmeldungenMap };
}