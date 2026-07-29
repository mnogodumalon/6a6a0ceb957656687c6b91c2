import type { EnrichedAnmeldungen, EnrichedKurseWorkshops, EnrichedZahlungen } from '@/types/enriched';
import type { Anmeldungen, Dozenten, KurseWorkshops, Raeume, Teilnehmer, Zahlungen } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function resolveDisplay(url: unknown, map: Map<string, any>, ...fields: string[]): string {
  if (!url) return '';
  const id = extractRecordId(url);
  if (!id) return '';
  const r = map.get(id);
  if (!r) return '';
  return fields.map(f => String(r.fields[f] ?? '')).join(' ').trim();
}

interface KurseWorkshopsMaps {
  dozentenMap: Map<string, Dozenten>;
  raeumeMap: Map<string, Raeume>;
}

export function enrichKurseWorkshops(
  kurseWorkshops: KurseWorkshops[],
  maps: KurseWorkshopsMaps
): EnrichedKurseWorkshops[] {
  return kurseWorkshops.map(r => ({
    ...r,
    dozentName: resolveDisplay(r.fields.dozent, maps.dozentenMap, 'vorname', 'nachname'),
    raumName: resolveDisplay(r.fields.raum, maps.raeumeMap, 'raumname'),
  }));
}

interface AnmeldungenMaps {
  teilnehmerMap: Map<string, Teilnehmer>;
  kurseWorkshopsMap: Map<string, KurseWorkshops>;
}

export function enrichAnmeldungen(
  anmeldungen: Anmeldungen[],
  maps: AnmeldungenMaps
): EnrichedAnmeldungen[] {
  return anmeldungen.map(r => ({
    ...r,
    teilnehmerName: resolveDisplay(r.fields.teilnehmer, maps.teilnehmerMap, 'vorname', 'nachname'),
    kursName: resolveDisplay(r.fields.kurs, maps.kurseWorkshopsMap, 'titel'),
  }));
}

interface ZahlungenMaps {
  anmeldungenMap: Map<string, Anmeldungen>;
}

export function enrichZahlungen(
  zahlungen: Zahlungen[],
  maps: ZahlungenMaps
): EnrichedZahlungen[] {
  return zahlungen.map(r => ({
    ...r,
    anmeldungName: resolveDisplay(r.fields.anmeldung, maps.anmeldungenMap, 'bemerkungen_anmeldung'),
  }));
}
