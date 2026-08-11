import { useState, useMemo, useCallback } from 'react';
import { format, parseISO, isAfter, isBefore, startOfDay, addDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { useDashboardData } from '@/hooks/useDashboardData';
import { enrichKurseWorkshops, enrichAnmeldungen, enrichZahlungen } from '@/lib/enrich';
import type { EnrichedKurseWorkshops, EnrichedAnmeldungen } from '@/types/enriched';
import type { KurseWorkshops, Anmeldungen, Zahlungen } from '@/types/app';
import { APP_IDS, LOOKUP_OPTIONS } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { formatDate, formatCurrency, lookupKey } from '@/lib/formatters';
import { DashboardSkeleton, DashboardError } from '@/components/DashboardStates';
import { DashboardGrid } from '@/components/DashboardGrid';
import { StatStrip, StatStripItem } from '@/components/StatCard';
import { WorkList } from '@/components/WorkList';
import { HeroBanner } from '@/components/HeroBanner';
import { useClock, gruss, namen, undoToast } from '@/lib/polish';
import { AI_PHOTO_SCAN, AI_PHOTO_LOCATION } from '@/config/ai-features';
import {
  CalendarWidget,
  type CalendarEvent,
  type CalendarTone,
} from '@/components/widgets/CalendarWidget';
import {
  RecordOverlayHost,
  RecordHeader,
  useRecordOverlayStack,
} from '@/components/widgets/RecordView';
import { KurseWorkshopsDetails } from '@/components/details/KurseWorkshopsDetails';
import { AnmeldungenDetails } from '@/components/details/AnmeldungenDetails';
import { ZahlungenDetails } from '@/components/details/ZahlungenDetails';
import { DozentenDetails } from '@/components/details/DozentenDetails';
import { RaeumeDetails } from '@/components/details/RaeumeDetails';
import { TeilnehmerDetails } from '@/components/details/TeilnehmerDetails';
import { KurseWorkshopsDialog, type KurseWorkshopsDialogDefaults } from '@/components/dialogs/KurseWorkshopsDialog';
import { AnmeldungenDialog, type AnmeldungenDialogDefaults } from '@/components/dialogs/AnmeldungenDialog';
import { ZahlungenDialog, type ZahlungenDialogDefaults } from '@/components/dialogs/ZahlungenDialog';
import {
  IconCalendar,
  IconUsers,
  IconCurrencyEuro,
  IconAlertTriangle,
  IconPlus,
  IconCheck,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/button';

import { makeT } from '@/i18n';

const tt = makeT({
  de: {
    ohne_titel: 'Ohne Titel',
    abgeschlossen: 'Abgeschlossen',
    anmeldung: 'Anmeldung',
    bezahlt: 'Bezahlt',
    zahlung_als_bezahlt_markiert: 'Zahlung {p0} als bezahlt markiert',
    kurs: 'Kurs',
    noch_keine_bevorstehenden_kurse: 'Noch keine bevorstehenden Kurse geplant.',
    und_weitere_veranstaltungen: ' und {p0} weitere Veranstaltungen',
    und_weitere_veranstaltung: ' und {p0} weitere Veranstaltung',
    als_naechstes_mit_am: 'Als nächstes: „{p0}" mit {p1} am {p2}{p3}.',
    als_naechstes_am: 'Als nächstes: „{p0}" am {p1}{p2}.',
    als_bezahlt_markieren: 'Als bezahlt markieren',
    offene: 'offene',
    zahlung: 'Zahlung',
    zahlungen: 'Zahlungen',
    ueberfaellig: 'überfällig',
    rechnung: ' — Rechnung {p0}',
    neuer_kurs: 'Neuer Kurs',
    aktive_kurse: 'Aktive Kurse',
    neue_anmeldungen: 'Neue Anmeldungen',
    warteliste: 'Warteliste',
    offene_zahlungen: 'Offene Zahlungen',
    unbekannt: 'Unbekannt',
    angemeldet: 'Angemeldet',
    abschliessen: '✓ Abschließen',
    keine_neuen_anmeldungen: 'Keine neuen Anmeldungen',
    anmeldung_erfassen: 'Anmeldung erfassen',
    ohne_nummer: 'Ohne Nummer',
    ueberfaellig_2: 'Überfällig',
    offen: 'Offen',
    faellig: ' · Fällig: {p0}',
    bezahlt_2: '✓ Bezahlt',
    alle_zahlungen_beglichen: 'Alle Zahlungen beglichen',
    zahlung_erfassen: 'Zahlung erfassen',
    dozent: 'Dozent',
    raum: 'Raum',
    teilnehmer: 'Teilnehmer',
    abschliessen_2: 'Abschließen',
  },
  en: {
    ohne_titel: 'Untitled',
    abgeschlossen: 'Completed',
    anmeldung: 'Registration',
    bezahlt: 'Paid',
    zahlung_als_bezahlt_markiert: 'Payment {p0} marked as paid',
    kurs: 'Course',
    noch_keine_bevorstehenden_kurse: 'No upcoming courses scheduled yet.',
    und_weitere_veranstaltungen: ' and {p0} more events',
    und_weitere_veranstaltung: ' and {p0} more event',
    als_naechstes_mit_am: 'Up next: "{p0}" with {p1} on {p2}{p3}.',
    als_naechstes_am: 'Up next: "{p0}" on {p1}{p2}.',
    als_bezahlt_markieren: 'Mark as Paid',
    offene: 'open',
    zahlung: 'Payment',
    zahlungen: 'Payments',
    ueberfaellig: 'overdue',
    rechnung: ' — Invoice {p0}',
    neuer_kurs: 'New Course',
    aktive_kurse: 'Active Courses',
    neue_anmeldungen: 'New Registrations',
    warteliste: 'Waitlist',
    offene_zahlungen: 'Open Payments',
    unbekannt: 'Unknown',
    angemeldet: 'Registered',
    abschliessen: '✓ Complete',
    keine_neuen_anmeldungen: 'No New Registrations',
    anmeldung_erfassen: 'Add Registration',
    ohne_nummer: 'No Number',
    ueberfaellig_2: 'Overdue',
    offen: 'Open',
    faellig: ' · Due: {p0}',
    bezahlt_2: '✓ Paid',
    alle_zahlungen_beglichen: 'All Payments Settled',
    zahlung_erfassen: 'Add Payment',
    dozent: 'Instructor',
    raum: 'Room',
    teilnehmer: 'Participants',
    abschliessen_2: 'Complete',
  },
});

type OverlayItem =
  | { type: 'kurs'; id: string }
  | { type: 'anmeldung'; id: string }
  | { type: 'zahlung'; id: string }
  | { type: 'dozent'; id: string }
  | { type: 'raum'; id: string }
  | { type: 'teilnehmer'; id: string };

function toneForKurs(k: KurseWorkshops): CalendarTone {
  const key = lookupKey(k.fields.status_kurs);
  if (key === 'aktiv') return 'success';
  if (key === 'geplant') return 'primary';
  if (key === 'inaktiv') return 'warning';
  return 'default';
}

export default function DashboardOverview() {
  const clock = useClock();
  const {
    raeume, dozenten, kurseWorkshops, teilnehmer, anmeldungen, zahlungen,
    setKurseWorkshops, setAnmeldungen, setZahlungen,
    raeumeMap, dozentenMap, kurseWorkshopsMap, teilnehmerMap, anmeldungenMap,
    loading, error, fetchAll,
  } = useDashboardData();

  const enrichedKurse = useMemo(
    () => enrichKurseWorkshops(kurseWorkshops, { dozentenMap, raeumeMap }),
    [kurseWorkshops, dozentenMap, raeumeMap],
  );
  const enrichedAnmeldungen = useMemo(
    () => enrichAnmeldungen(anmeldungen, { teilnehmerMap, kurseWorkshopsMap }),
    [anmeldungen, teilnehmerMap, kurseWorkshopsMap],
  );
  const enrichedZahlungen = useMemo(
    () => enrichZahlungen(zahlungen, { anmeldungenMap }),
    [zahlungen, anmeldungenMap],
  );

  // Dialogs
  const [kursDialogOpen, setKursDialogOpen] = useState(false);
  const [kursDefaults, setKursDefaults] = useState<KurseWorkshopsDialogDefaults | undefined>();
  const [editingKurs, setEditingKurs] = useState<EnrichedKurseWorkshops | null>(null);

  const [anmeldungDialogOpen, setAnmeldungDialogOpen] = useState(false);
  const [anmeldungDefaults, setAnmeldungDefaults] = useState<AnmeldungenDialogDefaults | undefined>();
  const [editingAnmeldung, setEditingAnmeldung] = useState<Anmeldungen | null>(null);

  const [zahlungDialogOpen, setZahlungDialogOpen] = useState(false);
  const [zahlungDefaults, setZahlungDefaults] = useState<ZahlungenDialogDefaults | undefined>();
  const [editingZahlung, setEditingZahlung] = useState<Zahlungen | null>(null);

  // Overlay stack
  const overlay = useRecordOverlayStack<OverlayItem>();

  // KPI: offene Zahlungen (Zahlungsstatus = offen)
  const offeneZahlungen = useMemo(
    () => zahlungen.filter(z => lookupKey(z.fields.zahlungsstatus) === 'offen'),
    [zahlungen],
  );

  // KPI: neue Anmeldungen (Angemeldet)
  const neueAnmeldungen = useMemo(
    () => anmeldungen.filter(a => lookupKey(a.fields.status_anmeldung) === 'angemeldet'),
    [anmeldungen],
  );

  // Aktive Kurse
  const aktiveKurse = useMemo(
    () => kurseWorkshops.filter(k => lookupKey(k.fields.status_kurs) === 'aktiv'),
    [kurseWorkshops],
  );

  // Bald startende Kurse (geplant, Startdatum in nächsten 14 Tagen) — mögliches Alert-Signal
  const baldStartend = useMemo(() => {
    const today = startOfDay(clock);
    const in14 = addDays(today, 14);
    return kurseWorkshops.filter(k => {
      if (lookupKey(k.fields.status_kurs) !== 'geplant') return false;
      if (!k.fields.startdatum) return false;
      const start = parseISO(k.fields.startdatum);
      return !isBefore(start, today) && isBefore(start, in14);
    });
  }, [kurseWorkshops, clock]);

  // Überfällige Zahlungen als Hero-Signal
  const ueberfaelligeZahlungen = useMemo(() => {
    const today = format(clock, 'yyyy-MM-dd');
    return zahlungen.filter(z => {
      if (lookupKey(z.fields.zahlungsstatus) !== 'offen') return false;
      if (!z.fields.zahlungsdatum) return false;
      return z.fields.zahlungsdatum < today;
    });
  }, [zahlungen, clock]);

  // Warteliste-Anmeldungen
  const wartelisteAnmeldungen = useMemo(
    () => enrichedAnmeldungen.filter(a => lookupKey(a.fields.status_anmeldung) === 'warteliste'),
    [enrichedAnmeldungen],
  );

  // Calendar events
  const events = useMemo<CalendarEvent[]>(
    () =>
      enrichedKurse
        .filter(k => !!k.fields.startdatum)
        .map(k => ({
          id: `kurs:${k.record_id}`,
          start: k.fields.startdatum!,
          end: k.fields.enddatum,
          title: k.fields.titel ?? tt('ohne_titel'),
          subtitle: k.dozentName || k.raumName || undefined,
          tone: toneForKurs(k),
        })),
    [enrichedKurse],
  );

  // Advance-Anmeldung: angemeldet → abgeschlossen
  const advanceAnmeldung = useCallback(
    async (a: Anmeldungen) => {
      const prev = anmeldungen.map(x => x);
      setAnmeldungen(prev.map(x =>
        x.record_id === a.record_id
          ? { ...x, fields: { ...x.fields, status_anmeldung: { key: 'abgeschlossen', label: tt('abgeschlossen') } } }
          : x,
      ));
      try {
        await LivingAppsService.updateAnmeldungenEntry(a.record_id, { status_anmeldung: 'abgeschlossen' });
        undoToast(
          `${enrichedAnmeldungen.find(x => x.record_id === a.record_id)?.teilnehmerName ?? tt('anmeldung')} abgeschlossen`,
          async () => {
            await LivingAppsService.updateAnmeldungenEntry(a.record_id, { status_anmeldung: lookupKey(a.fields.status_anmeldung) ?? 'angemeldet' });
            fetchAll();
          },
        );
      } catch {
        fetchAll();
      }
    },
    [anmeldungen, setAnmeldungen, enrichedAnmeldungen, fetchAll],
  );

  // Zahlung als bezahlt markieren
  const markBezahlt = useCallback(
    async (z: Zahlungen) => {
      const prevZahlungsstatus = z.fields.zahlungsstatus;
      setZahlungen(zahlungen.map(x =>
        x.record_id === z.record_id
          ? { ...x, fields: { ...x.fields, zahlungsstatus: { key: 'bezahlt', label: tt('bezahlt') } } }
          : x,
      ));
      try {
        await LivingAppsService.updateZahlungenEntry(z.record_id, { zahlungsstatus: 'bezahlt' });
        undoToast(
          tt('zahlung_als_bezahlt_markiert', { p0: z.fields.rechnungsnummer ?? '' }),
          async () => {
            await LivingAppsService.updateZahlungenEntry(z.record_id, { zahlungsstatus: lookupKey(prevZahlungsstatus) ?? 'offen' });
            fetchAll();
          },
        );
      } catch {
        fetchAll();
      }
    },
    [zahlungen, setZahlungen, fetchAll],
  );

  // Kurs drag reschedule
  const reschedule = useCallback(
    async (eventId: string, newStart: string, newEnd?: string) => {
      const rid = eventId.split(':')[1];
      if (!rid) return;
      const prev = kurseWorkshops.find(k => k.record_id === rid);
      if (!prev) return;
      setKurseWorkshops(kurseWorkshops.map(k =>
        k.record_id === rid
          ? { ...k, fields: { ...k.fields, startdatum: newStart, ...(newEnd ? { enddatum: newEnd } : {}) } }
          : k,
      ));
      try {
        await LivingAppsService.updateKurseWorkshop(rid, { startdatum: newStart, ...(newEnd ? { enddatum: newEnd } : {}) });
        undoToast(
          `${prev.fields.titel ?? tt('kurs')} verschoben`,
          async () => {
            await LivingAppsService.updateKurseWorkshop(rid, { startdatum: prev.fields.startdatum, enddatum: prev.fields.enddatum });
            fetchAll();
          },
        );
      } catch {
        fetchAll();
      }
    },
    [kurseWorkshops, setKurseWorkshops, fetchAll],
  );

  // Context line
  const naechsteKurse = useMemo(() => {
    const today = format(clock, 'yyyy-MM-dd');
    return enrichedKurse
      .filter(k => k.fields.startdatum && k.fields.startdatum >= today && lookupKey(k.fields.status_kurs) !== 'abgeschlossen')
      .sort((a, b) => (a.fields.startdatum ?? '').localeCompare(b.fields.startdatum ?? ''))
      .slice(0, 3);
  }, [enrichedKurse, clock]);

  const contextLine = useMemo(() => {
    if (naechsteKurse.length === 0) return tt('noch_keine_bevorstehenden_kurse');
    const title = naechsteKurse[0].fields.titel ?? tt('kurs');
    const dozent = naechsteKurse[0].dozentName;
    const date = formatDate(naechsteKurse[0].fields.startdatum);
    const rest = (naechsteKurse.length > 1 ? naechsteKurse.length > 2 ? tt('und_weitere_veranstaltungen', { p0: naechsteKurse.length - 1 }) : tt('und_weitere_veranstaltung', { p0: naechsteKurse.length - 1 }) : "");
    return (dozent ? tt('als_naechstes_mit_am', { p0: title, p1: dozent, p2: date, p3: rest }) : tt('als_naechstes_am', { p0: title, p1: date, p2: rest }));
  }, [naechsteKurse]);

  if (loading) return <DashboardSkeleton />;
  if (error) return <DashboardError error={error} onRetry={fetchAll} />;

  // Hero: überfällige Zahlungen
  const heroNode = ueberfaelligeZahlungen.length > 0 ? (
    <HeroBanner
      icon={<IconAlertTriangle size={18} />}
      action={{
        label: tt('als_bezahlt_markieren'),
        onClick: () => markBezahlt(ueberfaelligeZahlungen[0]),
      }}
    >
      <b>{ueberfaelligeZahlungen.length} {tt('offene')} {(ueberfaelligeZahlungen.length === 1 ? tt('zahlung') : tt('zahlungen'))}</b> {tt('ueberfaellig')}
      {(ueberfaelligeZahlungen[0]?.fields.rechnungsnummer ? tt('rechnung', { p0: ueberfaelligeZahlungen[0].fields.rechnungsnummer }) : "")}.
      {ueberfaelligeZahlungen.length > 1 && ` +${ueberfaelligeZahlungen.length - 1} weitere.`}
    </HeroBanner>
  ) : undefined;

  return (
    <>
      {/* Page header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{gruss(clock)}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{contextLine}</p>
          </div>
          <Button
            size="sm"
            className="shrink-0"
            onClick={() => {
              setEditingKurs(null);
              setKursDefaults(undefined);
              setKursDialogOpen(true);
            }}
          >
            <IconPlus size={16} className="shrink-0 mr-1" />
            {tt('neuer_kurs')}
          </Button>
        </div>
      </div>

      <DashboardGrid
        variant="wide"
        hero={heroNode}
        kpis={
          <StatStrip>
            <StatStripItem
              title={tt('aktive_kurse')}
              value={aktiveKurse.length}
              icon={<IconCalendar size={16} />}
              tone={aktiveKurse.length > 0 ? 'success' : 'default'}
            />
            <StatStripItem
              title={tt('neue_anmeldungen')}
              value={neueAnmeldungen.length}
              icon={<IconUsers size={16} />}
              tone={neueAnmeldungen.length > 0 ? 'primary' : 'default'}
            />
            <StatStripItem
              title={tt('warteliste')}
              value={wartelisteAnmeldungen.length}
              icon={<IconUsers size={16} />}
              tone={wartelisteAnmeldungen.length > 0 ? 'warning' : 'default'}
            />
            <StatStripItem
              title={tt('offene_zahlungen')}
              value={offeneZahlungen.length}
              icon={<IconCurrencyEuro size={16} />}
              tone={offeneZahlungen.length > 0 ? 'destructive' : 'default'}
            />
          </StatStrip>
        }
        primary={
          <CalendarWidget
            events={events}
            locale={de}
            onEventClick={ev => {
              const id = ev.id.split(':')[1] ?? '';
              overlay.replace({ type: 'kurs', id });
            }}
            onEventDrop={reschedule}
            onEventResize={reschedule}
            onRangeCreate={(start, end) => {
              setEditingKurs(null);
              setKursDefaults({
                startdatum: format(start, "yyyy-MM-dd'T'HH:mm"),
                enddatum: format(end, "yyyy-MM-dd'T'HH:mm"),
              });
              setKursDialogOpen(true);
            }}
            onEmptyClick={date => {
              setEditingKurs(null);
              setKursDefaults({
                startdatum: format(date, "yyyy-MM-dd'T'HH:mm"),
              });
              setKursDialogOpen(true);
            }}
          />
        }
        aside={
          <>
            <WorkList
              title={tt('neue_anmeldungen')}
              items={enrichedAnmeldungen
                .filter(a => lookupKey(a.fields.status_anmeldung) === 'angemeldet')
                .sort((a, b) => (b.fields.anmeldedatum ?? '').localeCompare(a.fields.anmeldedatum ?? ''))
                .slice(0, 6)
                .map(a => ({
                  id: a.record_id,
                  title: a.teilnehmerName || tt('unbekannt'),
                  secondLine: (
                    <>
                      <span className="font-medium text-primary">{tt('angemeldet')}</span>
                      <span className="text-muted-foreground"> · {a.kursName || '—'}</span>
                    </>
                  ),
                  action: {
                    label: tt('abschliessen'),
                    onClick: () => advanceAnmeldung(a),
                  },
                }))}
              onItemClick={id => overlay.replace({ type: 'anmeldung', id })}
              empty={{
                text: tt('keine_neuen_anmeldungen'),
                action: {
                  label: tt('anmeldung_erfassen'),
                  onClick: () => {
                    setEditingAnmeldung(null);
                    setAnmeldungDefaults(undefined);
                    setAnmeldungDialogOpen(true);
                  },
                },
              }}
            />
            <WorkList
              title={tt('offene_zahlungen')}
              items={offeneZahlungen
                .sort((a, b) => (a.fields.zahlungsdatum ?? '').localeCompare(b.fields.zahlungsdatum ?? ''))
                .slice(0, 6)
                .map(z => {
                  const isUeberfaellig = ueberfaelligeZahlungen.some(u => u.record_id === z.record_id);
                  return {
                    id: z.record_id,
                    title: z.fields.rechnungsnummer ?? tt('ohne_nummer'),
                    secondLine: (
                      <>
                        <span className={isUeberfaellig ? 'font-medium text-destructive' : 'font-medium text-warning'}>
                          {(isUeberfaellig ? tt('ueberfaellig_2') : tt('offen'))}
                        </span>
                        <span className="text-muted-foreground">
                          {' · '}{z.fields.betrag != null ? formatCurrency(z.fields.betrag) : '—'}
                          {(z.fields.zahlungsdatum ? tt('faellig', { p0: formatDate(z.fields.zahlungsdatum) }) : "")}
                        </span>
                      </>
                    ),
                    action: {
                      label: tt('bezahlt_2'),
                      onClick: () => markBezahlt(z),
                    },
                  };
                })}
              onItemClick={id => overlay.replace({ type: 'zahlung', id })}
              empty={{
                text: tt('alle_zahlungen_beglichen'),
                action: {
                  label: tt('zahlung_erfassen'),
                  onClick: () => {
                    setEditingZahlung(null);
                    setZahlungDefaults(undefined);
                    setZahlungDialogOpen(true);
                  },
                },
              }}
            />
          </>
        }
      />

      {/* Record Overlay Host — single shell for all entity types */}
      <RecordOverlayHost
        overlay={overlay}
        render={top => {
          if (top.type === 'kurs') {
            const kurs = enrichedKurse.find(k => k.record_id === top.id);
            if (!kurs) return null;
            return (
              <>
                <RecordHeader
                  title={kurs.fields.titel ?? tt('kurs')}
                  subtitle={kurs.dozentName || undefined}
                  meta={<>{formatDate(kurs.fields.startdatum)}{kurs.fields.enddatum ? ` – ${formatDate(kurs.fields.enddatum)}` : ''}</>}
                  badges={<span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{kurs.fields.status_kurs?.label ?? '—'}</span>}
                />
                <KurseWorkshopsDetails
                  record={kurs}
                  dozentenList={dozenten}
                  onOpenDozenten={d => overlay.push({ type: 'dozent', id: d.record_id })}
                  raeumeList={raeume}
                  onOpenRaeume={r => overlay.push({ type: 'raum', id: r.record_id })}
                  anmeldungenList={anmeldungen}
                  onOpenAnmeldungen={a => overlay.push({ type: 'anmeldung', id: a.record_id })}
                  onAddAnmeldungen={() => {
                    setEditingAnmeldung(null);
                    setAnmeldungDefaults({ kurs: top.id });
                    setAnmeldungDialogOpen(true);
                  }}
                />
              </>
            );
          }
          if (top.type === 'anmeldung') {
            const anm = anmeldungen.find(a => a.record_id === top.id);
            if (!anm) return null;
            const enriched = enrichedAnmeldungen.find(a => a.record_id === top.id);
            return (
              <>
                <RecordHeader
                  title={enriched?.teilnehmerName ?? tt('anmeldung')}
                  subtitle={enriched?.kursName || undefined}
                  meta={formatDate(anm.fields.anmeldedatum)}
                  badges={<span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{anm.fields.status_anmeldung?.label ?? '—'}</span>}
                />
                <AnmeldungenDetails
                  record={anm}
                  teilnehmerList={teilnehmer}
                  onOpenTeilnehmer={t => overlay.push({ type: 'teilnehmer', id: t.record_id })}
                  kurseWorkshopsList={kurseWorkshops}
                  onOpenKurseWorkshops={k => overlay.push({ type: 'kurs', id: k.record_id })}
                  zahlungenList={zahlungen}
                  onOpenZahlungen={z => overlay.push({ type: 'zahlung', id: z.record_id })}
                  onAddZahlungen={() => {
                    setEditingZahlung(null);
                    setZahlungDefaults({ anmeldung: top.id });
                    setZahlungDialogOpen(true);
                  }}
                />
              </>
            );
          }
          if (top.type === 'zahlung') {
            const z = zahlungen.find(x => x.record_id === top.id);
            if (!z) return null;
            return (
              <>
                <RecordHeader
                  title={z.fields.rechnungsnummer ?? tt('zahlung')}
                  subtitle={z.fields.betrag != null ? formatCurrency(z.fields.betrag) : undefined}
                  meta={formatDate(z.fields.zahlungsdatum)}
                  badges={<span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{z.fields.zahlungsstatus?.label ?? '—'}</span>}
                />
                <ZahlungenDetails
                  record={z}
                  anmeldungenList={anmeldungen}
                  onOpenAnmeldungen={a => overlay.push({ type: 'anmeldung', id: a.record_id })}
                />
              </>
            );
          }
          if (top.type === 'dozent') {
            const d = dozenten.find(x => x.record_id === top.id);
            if (!d) return null;
            return (
              <>
                <RecordHeader
                  title={[d.fields.vorname, d.fields.nachname].filter(Boolean).join(' ') || tt('dozent')}
                  subtitle={d.fields.beschaeftigungsart?.label}
                />
                <DozentenDetails
                  record={d}
                  kurseWorkshopsList={kurseWorkshops}
                  onOpenKurseWorkshops={k => overlay.push({ type: 'kurs', id: k.record_id })}
                  onAddKurseWorkshops={() => {
                    setEditingKurs(null);
                    setKursDefaults({ dozent: top.id });
                    setKursDialogOpen(true);
                  }}
                />
              </>
            );
          }
          if (top.type === 'raum') {
            const r = raeume.find(x => x.record_id === top.id);
            if (!r) return null;
            return (
              <>
                <RecordHeader
                  title={r.fields.raumname ?? tt('raum')}
                  subtitle={r.fields.etage}
                />
                <RaeumeDetails
                  record={r}
                  kurseWorkshopsList={kurseWorkshops}
                  onOpenKurseWorkshops={k => overlay.push({ type: 'kurs', id: k.record_id })}
                  onAddKurseWorkshops={() => {
                    setEditingKurs(null);
                    setKursDefaults({ raum: top.id });
                    setKursDialogOpen(true);
                  }}
                />
              </>
            );
          }
          if (top.type === 'teilnehmer') {
            const t = teilnehmer.find(x => x.record_id === top.id);
            if (!t) return null;
            return (
              <>
                <RecordHeader
                  title={[t.fields.vorname, t.fields.nachname].filter(Boolean).join(' ') || tt('teilnehmer')}
                  subtitle={t.fields.email}
                />
                <TeilnehmerDetails
                  record={t}
                  anmeldungenList={anmeldungen}
                  onOpenAnmeldungen={a => overlay.push({ type: 'anmeldung', id: a.record_id })}
                  onAddAnmeldungen={() => {
                    setEditingAnmeldung(null);
                    setAnmeldungDefaults({ teilnehmer: top.id });
                    setAnmeldungDialogOpen(true);
                  }}
                />
              </>
            );
          }
          return null;
        }}
        onEdit={top => {
          if (top.type === 'kurs') {
            const k = enrichedKurse.find(x => x.record_id === top.id);
            if (k) {
              setEditingKurs(k);
              setKursDefaults(k.fields as KurseWorkshopsDialogDefaults);
              setKursDialogOpen(true);
            }
          }
          if (top.type === 'anmeldung') {
            const a = anmeldungen.find(x => x.record_id === top.id);
            if (a) {
              setEditingAnmeldung(a);
              setAnmeldungDefaults(a.fields as AnmeldungenDialogDefaults);
              setAnmeldungDialogOpen(true);
            }
          }
          if (top.type === 'zahlung') {
            const z = zahlungen.find(x => x.record_id === top.id);
            if (z) {
              setEditingZahlung(z);
              setZahlungDefaults(z.fields as ZahlungenDialogDefaults);
              setZahlungDialogOpen(true);
            }
          }
        }}
        footer={top => {
          if (top.type === 'anmeldung') {
            const a = anmeldungen.find(x => x.record_id === top.id);
            const status = lookupKey(a?.fields.status_anmeldung);
            if (a && status === 'angemeldet') {
              return {
                label: tt('abschliessen_2'),
                onClick: () => { advanceAnmeldung(a); overlay.close(); },
              };
            }
          }
          if (top.type === 'zahlung') {
            const z = zahlungen.find(x => x.record_id === top.id);
            const status = lookupKey(z?.fields.zahlungsstatus);
            if (z && status === 'offen') {
              return {
                label: tt('als_bezahlt_markieren'),
                onClick: () => { markBezahlt(z); overlay.close(); },
              };
            }
          }
          return undefined;
        }}
      />

      {/* Kurs Dialog */}
      <KurseWorkshopsDialog
        open={kursDialogOpen}
        onClose={() => { setKursDialogOpen(false); setEditingKurs(null); }}
        onSubmit={async fields => {
          if (editingKurs) {
            await LivingAppsService.updateKurseWorkshop(editingKurs.record_id, fields);
          } else {
            await LivingAppsService.createKurseWorkshop(fields);
          }
          fetchAll();
        }}
        defaultValues={kursDefaults}
        recordId={editingKurs?.record_id}
        dozentenList={dozenten}
        raeumeList={raeume}
        enablePhotoScan={AI_PHOTO_SCAN['KurseWorkshops']}
        enablePhotoLocation={AI_PHOTO_LOCATION['KurseWorkshops']}
      />

      {/* Anmeldung Dialog */}
      <AnmeldungenDialog
        open={anmeldungDialogOpen}
        onClose={() => { setAnmeldungDialogOpen(false); setEditingAnmeldung(null); }}
        onSubmit={async fields => {
          if (editingAnmeldung) {
            await LivingAppsService.updateAnmeldungenEntry(editingAnmeldung.record_id, fields);
          } else {
            await LivingAppsService.createAnmeldungenEntry(fields);
          }
          fetchAll();
        }}
        defaultValues={anmeldungDefaults}
        recordId={editingAnmeldung?.record_id}
        teilnehmerList={teilnehmer}
        kurseWorkshopsList={kurseWorkshops}
        enablePhotoScan={AI_PHOTO_SCAN['Anmeldungen']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Anmeldungen']}
      />

      {/* Zahlung Dialog */}
      <ZahlungenDialog
        open={zahlungDialogOpen}
        onClose={() => { setZahlungDialogOpen(false); setEditingZahlung(null); }}
        onSubmit={async fields => {
          if (editingZahlung) {
            await LivingAppsService.updateZahlungenEntry(editingZahlung.record_id, fields);
          } else {
            await LivingAppsService.createZahlungenEntry(fields);
          }
          fetchAll();
        }}
        defaultValues={zahlungDefaults}
        recordId={editingZahlung?.record_id}
        anmeldungenList={anmeldungen}
        enablePhotoScan={AI_PHOTO_SCAN['Zahlungen']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Zahlungen']}
      />
    </>
  );
}
