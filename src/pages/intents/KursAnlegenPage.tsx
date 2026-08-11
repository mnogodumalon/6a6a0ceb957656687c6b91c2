/**
 * Kurs anlegen — 4-Schritt-Wizard für eine Bildungsplattform.
 * Schritte: 1) Kursdaten eingeben → 2) Dozent auswählen → 3) Raum auswählen → 4) Zusammenfassung & erstellen.
 * Liest: dozenten, raeume. Schreibt: kurse_&_workshops (createKurseWorkshop).
 * Komponiert: IntentWizardShell, EntitySelectStep.
 */

import { useState } from 'react';
import { IntentWizardShell } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { useDashboardData } from '@/hooks/useDashboardData';
import { LivingAppsService, createRecordUrl } from '@/services/livingAppsService';
import { APP_IDS, LOOKUP_OPTIONS } from '@/types/app';
import type { Dozenten, Raeume } from '@/types/app';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  IconBook,
  IconUser,
  IconBuilding,
  IconCheck,
  IconChevronRight,
  IconAlertTriangle,
  IconRefresh,
  IconCalendar,
  IconClock,
  IconUsers,
  IconCurrencyEuro,
  IconMapPin,
} from '@tabler/icons-react';

import { makeT } from '@/i18n';

const tt = makeT({
  de: {
    uhr: '{p0}.{p1}.{p2} · {p3} Uhr',
    kursdetails_eingeben: 'Kursdetails eingeben',
    titel: 'Titel *',
    z_b_klavier_fuer_anfaenger: 'z. B. Klavier für Anfänger',
    kurstyp: 'Kurstyp *',
    niveau: 'Niveau *',
    beschreibung: 'Beschreibung',
    was_lernen_die_teilnehmer_in_die: 'Was lernen die Teilnehmer in diesem Kurs?',
    startdatum_uhrzeit: 'Startdatum & -uhrzeit *',
    enddatum_uhrzeit: 'Enddatum & -uhrzeit *',
    wochentag_uhrzeit: 'Wochentag & Uhrzeit',
    z_b_montags_18_00_20_00_uhr: 'z. B. Montags 18:00–20:00 Uhr',
    max_teilnehmer: 'Max. Teilnehmer',
    preis: 'Preis (€)',
    status: 'Status *',
    weiter_dozent_auswaehlen: 'Weiter: Dozent auswählen',
    kursuebersicht: 'Kursübersicht',
    titel_2: 'Titel',
    noch_nicht_eingegeben: 'Noch nicht eingegeben',
    typ_niveau: 'Typ & Niveau',
    zeitraum: 'Zeitraum',
    wochentag_uhrzeit_2: 'Wochentag / Uhrzeit',
    personen: '{p0} Personen',
    preis_2: 'Preis',
    dozent_auswaehlen: 'Dozent auswählen',
    unbekannt: 'Unbekannt',
    ausgewaehlt: 'Ausgewählt',
    e_mail: 'E-Mail',
    tel: 'Tel.',
    dozent_suchen: 'Dozent suchen...',
    kein_dozent_gefunden: 'Kein Dozent gefunden.',
    zurueck: 'Zurück',
    raum_auswaehlen: 'Raum auswählen',
    kurs_hat_max: 'Kurs hat max.',
    teilnehmer: 'Teilnehmer',
    nur_raeume_mit_ausreichender_kap: '— nur Räume mit ausreichender Kapazität empfohlen.',
    kapazitaet_des_gewaehlten_raums: 'Kapazität des gewählten Raums (',
    ist_kleiner_als_die_maximale_tei: ') ist kleiner als die maximale Teilnehmerzahl (',
    raum: 'Raum {p0}',
    nr: 'Nr. {p0}',
    etage: 'Etage: {p0}',
    zu_klein: 'Zu klein',
    kapazitaet: 'Kapazität',
    ausstattung: 'Ausstattung',
    raum_suchen: 'Raum suchen...',
    keine_verfuegbaren_raeume_gefund: 'Keine verfügbaren Räume gefunden.',
    zusammenfassung: 'Zusammenfassung',
    kursdetails: 'Kursdetails',
    typ: 'Typ',
    niveau_2: 'Niveau',
    status_2: 'Status',
    startdatum: 'Startdatum',
    enddatum: 'Enddatum',
    wochentag_uhrzeit_3: 'Wochentag/Uhrzeit',
    dozent: 'Dozent',
    name_txt: 'Name',
    telefon: 'Telefon',
    beschaeftigungsart: 'Beschäftigungsart',
    fachbereiche: 'Fachbereiche',
    kein_dozent_ausgewaehlt: 'Kein Dozent ausgewählt',
    raum_2: 'Raum',
    raumname: 'Raumname',
    raumnummer: 'Raumnummer',
    etage_2: 'Etage',
    kein_raum_ausgewaehlt: 'Kein Raum ausgewählt',
    wird_erstellt: 'Wird erstellt…',
    kurs_anlegen: 'Kurs anlegen',
    kurs_erfolgreich_angelegt: 'Kurs erfolgreich angelegt!',
    wurde_erfolgreich_erstellt_und_i: 'wurde erfolgreich erstellt und ist jetzt verfügbar.',
    weiteren_kurs_anlegen: 'Weiteren Kurs anlegen',
    zurueck_zum_dashboard: 'Zurück zum Dashboard',
    kursdaten: 'Kursdaten',
    bestaetigen: 'Bestätigen',
    neuen_kurs_anlegen: 'Neuen Kurs anlegen',
    schritt_fuer_schritt_zum_fertige: 'Schritt für Schritt zum fertigen Kurs',
  },
  en: {
    uhr: '{p0}.{p1}.{p2} · {p3}',
    kursdetails_eingeben: 'Enter Course Details',
    titel: 'Title *',
    z_b_klavier_fuer_anfaenger: 'e.g. Piano for Beginners',
    kurstyp: 'Course Type *',
    niveau: 'Level *',
    beschreibung: 'Description',
    was_lernen_die_teilnehmer_in_die: 'What will participants learn in this course?',
    startdatum_uhrzeit: 'Start Date & Time *',
    enddatum_uhrzeit: 'End Date & Time *',
    wochentag_uhrzeit: 'Day of Week & Time',
    z_b_montags_18_00_20_00_uhr: 'e.g. Mondays 18:00–20:00',
    max_teilnehmer: 'Max. Participants',
    preis: 'Price (€)',
    status: 'Status *',
    weiter_dozent_auswaehlen: 'Next: Select Instructor',
    kursuebersicht: 'Course Overview',
    titel_2: 'Title',
    noch_nicht_eingegeben: 'Not yet entered',
    typ_niveau: 'Type & Level',
    zeitraum: 'Period',
    wochentag_uhrzeit_2: 'Day / Time',
    personen: '{p0} Persons',
    preis_2: 'Price',
    dozent_auswaehlen: 'Select Instructor',
    unbekannt: 'Unknown',
    ausgewaehlt: 'Selected',
    e_mail: 'Email',
    tel: 'Tel.',
    dozent_suchen: 'Search instructor...',
    kein_dozent_gefunden: 'No instructor found.',
    zurueck: 'Back',
    raum_auswaehlen: 'Select Room',
    kurs_hat_max: 'Course has max.',
    teilnehmer: 'Participants',
    nur_raeume_mit_ausreichender_kap: '— only rooms with sufficient capacity recommended.',
    kapazitaet_des_gewaehlten_raums: 'Capacity of the selected room (',
    ist_kleiner_als_die_maximale_tei: ') is less than the maximum number of participants (',
    raum: 'Room {p0}',
    nr: 'No. {p0}',
    etage: 'Floor: {p0}',
    zu_klein: 'Too Small',
    kapazitaet: 'Capacity',
    ausstattung: 'Equipment',
    raum_suchen: 'Search room...',
    keine_verfuegbaren_raeume_gefund: 'No available rooms found.',
    zusammenfassung: 'Summary',
    kursdetails: 'Course Details',
    typ: 'Type',
    niveau_2: 'Level',
    status_2: 'Status',
    startdatum: 'Start Date',
    enddatum: 'End Date',
    wochentag_uhrzeit_3: 'Weekday/Time',
    dozent: 'Instructor',
    name_txt: 'Name',
    telefon: 'Phone',
    beschaeftigungsart: 'Employment Type',
    fachbereiche: 'Departments',
    kein_dozent_ausgewaehlt: 'No instructor selected',
    raum_2: 'Room',
    raumname: 'Room Name',
    raumnummer: 'Room Number',
    etage_2: 'Floor',
    kein_raum_ausgewaehlt: 'No room selected',
    wird_erstellt: 'Creating…',
    kurs_anlegen: 'Create Course',
    kurs_erfolgreich_angelegt: 'Course successfully created!',
    wurde_erfolgreich_erstellt_und_i: 'was successfully created and is now available.',
    weiteren_kurs_anlegen: 'Add Another Course',
    zurueck_zum_dashboard: 'Back to Dashboard',
    kursdaten: 'Course Data',
    bestaetigen: 'Confirm',
    neuen_kurs_anlegen: 'Create New Course',
    schritt_fuer_schritt_zum_fertige: 'Step by Step to the Finished Course',
  },
});

// ─── Lookup-Keys (sicher aus LOOKUP_OPTIONS, nie geraten) ─────────────────────
const KURSTYP_OPTIONS = LOOKUP_OPTIONS['kurse_&_workshops']?.['kurstyp'] ?? [];
const NIVEAU_OPTIONS = LOOKUP_OPTIONS['kurse_&_workshops']?.['niveau'] ?? [];
const STATUS_KURS_OPTIONS = LOOKUP_OPTIONS['kurse_&_workshops']?.['status_kurs'] ?? [];

// Standard-Status ist "geplant" (existiert laut Schema)
const DEFAULT_STATUS_KEY = STATUS_KURS_OPTIONS.find(o => o.key === 'geplant')?.key ?? STATUS_KURS_OPTIONS[0]?.key ?? '';

// ─── Wizard-Schritte ─────────────────────────────────────────────────────────
// ─── Hilfsfunktionen ─────────────────────────────────────────────────────────
function formatPreis(val: number | '') {
  if (val === '' || isNaN(Number(val))) return '–';
  return Number(val).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' });
}

function formatDatumZeit(val: string) {
  if (!val) return '–';
  try {
    const [date, time] = val.split('T');
    const [y, m, d] = date.split('-');
    return (time ? tt('uhr', { p0: d, p1: m, p2: y, p3: time }) : `${d}.${m}.${y}`);
  } catch {
    return val;
  }
}

// ─── Schritt 1: Kursdaten ─────────────────────────────────────────────────────
interface KursDaten {
  titel: string;
  kurstyp: string;
  niveau: string;
  beschreibung: string;
  max_teilnehmer: number | '';
  preis: number | '';
  startdatum: string;
  enddatum: string;
  wochentag_uhrzeit: string;
  status_kurs: string;
}

interface KursdatenStepProps {
  data: KursDaten;
  onChange: (data: KursDaten) => void;
  onWeiter: () => void;
}

function KursdatenStep({ data, onChange, onWeiter }: KursdatenStepProps) {
  const set = <K extends keyof KursDaten>(key: K, val: KursDaten[K]) =>
    onChange({ ...data, [key]: val });

  const isValid =
    data.titel.trim().length > 0 &&
    data.kurstyp !== '' &&
    data.niveau !== '' &&
    data.status_kurs !== '' &&
    data.startdatum !== '' &&
    data.enddatum !== '';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Formular */}
      <div className="lg:col-span-3 space-y-4">
        <div className="rounded-2xl border bg-card p-5 space-y-4">
          <h2 className="text-base font-semibold text-foreground">{tt('kursdetails_eingeben')}</h2>

          {/* Titel */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">{tt('titel')}</label>
            <Input
              value={data.titel}
              onChange={e => set('titel', e.target.value)}
              placeholder={tt('z_b_klavier_fuer_anfaenger')}
            />
          </div>

          {/* Kurstyp (Radio) */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">{tt('kurstyp')}</label>
            <div className="flex gap-2 flex-wrap">
              {KURSTYP_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => set('kurstyp', opt.key)}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
                    data.kurstyp === opt.key
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-foreground border-border hover:border-primary/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Niveau */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">{tt('niveau')}</label>
            <div className="flex gap-2 flex-wrap">
              {NIVEAU_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => set('niveau', opt.key)}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
                    data.niveau === opt.key
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-foreground border-border hover:border-primary/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Beschreibung */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">{tt('beschreibung')}</label>
            <Textarea
              value={data.beschreibung}
              onChange={e => set('beschreibung', e.target.value)}
              placeholder={tt('was_lernen_die_teilnehmer_in_die')}
              rows={3}
            />
          </div>

          {/* Datum/Zeit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">{tt('startdatum_uhrzeit')}</label>
              <Input
                type="datetime-local"
                value={data.startdatum}
                onChange={e => set('startdatum', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">{tt('enddatum_uhrzeit')}</label>
              <Input
                type="datetime-local"
                value={data.enddatum}
                onChange={e => set('enddatum', e.target.value)}
              />
            </div>
          </div>

          {/* Wochentag / Uhrzeit */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">{tt('wochentag_uhrzeit')}</label>
            <Input
              value={data.wochentag_uhrzeit}
              onChange={e => set('wochentag_uhrzeit', e.target.value)}
              placeholder={tt('z_b_montags_18_00_20_00_uhr')}
            />
          </div>

          {/* Max. Teilnehmer & Preis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">{tt('max_teilnehmer')}</label>
              <Input
                type="number"
                min={1}
                value={data.max_teilnehmer}
                onChange={e => set('max_teilnehmer', e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="z. B. 12"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">{tt('preis')}</label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={data.preis}
                onChange={e => set('preis', e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="z. B. 120.00"
              />
            </div>
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">{tt('status')}</label>
            <div className="flex gap-2 flex-wrap">
              {STATUS_KURS_OPTIONS.map(opt => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => set('status_kurs', opt.key)}
                  className={`px-4 py-2 rounded-xl border text-sm font-medium transition-colors ${
                    data.status_kurs === opt.key
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-foreground border-border hover:border-primary/50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button
          onClick={onWeiter}
          disabled={!isValid}
          className="w-full gap-2"
          size="lg"
        >
          {tt('weiter_dozent_auswaehlen')}
          <IconChevronRight size={16} />
        </Button>
      </div>

      {/* Live-Vorschau */}
      <div className="lg:col-span-2">
        <div className="rounded-2xl border bg-card p-5 space-y-3 sticky top-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{tt('kursuebersicht')}</h3>

          <div className="space-y-2.5">
            <div className="flex items-start gap-3">
              <IconBook size={16} className="text-primary mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{tt('titel_2')}</p>
                <p className="text-sm font-medium text-foreground truncate">
                  {data.titel || <span className="text-muted-foreground italic">{tt('noch_nicht_eingegeben')}</span>}
                </p>
              </div>
            </div>

            {data.kurstyp && (
              <div className="flex items-start gap-3">
                <IconBook size={16} className="text-primary mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{tt('typ_niveau')}</p>
                  <p className="text-sm font-medium text-foreground">
                    {KURSTYP_OPTIONS.find(o => o.key === data.kurstyp)?.label ?? data.kurstyp}
                    {data.niveau && ` · ${NIVEAU_OPTIONS.find(o => o.key === data.niveau)?.label ?? data.niveau}`}
                  </p>
                </div>
              </div>
            )}

            {data.startdatum && (
              <div className="flex items-start gap-3">
                <IconCalendar size={16} className="text-primary mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{tt('zeitraum')}</p>
                  <p className="text-sm font-medium text-foreground">
                    {formatDatumZeit(data.startdatum)}
                    {data.enddatum && ` – ${formatDatumZeit(data.enddatum)}`}
                  </p>
                </div>
              </div>
            )}

            {data.wochentag_uhrzeit && (
              <div className="flex items-start gap-3">
                <IconClock size={16} className="text-primary mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">{tt('wochentag_uhrzeit_2')}</p>
                  <p className="text-sm font-medium text-foreground">{data.wochentag_uhrzeit}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <IconUsers size={16} className="text-primary mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{tt('max_teilnehmer')}</p>
                <p className="text-sm font-medium text-foreground">
                  {data.max_teilnehmer !== '' ? tt('personen', { p0: data.max_teilnehmer }) : <span className="text-muted-foreground italic">–</span>}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <IconCurrencyEuro size={16} className="text-primary mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{tt('preis_2')}</p>
                <p className="text-sm font-medium text-foreground">{formatPreis(data.preis)}</p>
              </div>
            </div>

            {data.status_kurs && (
              <div className="mt-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                  {STATUS_KURS_OPTIONS.find(o => o.key === data.status_kurs)?.label ?? data.status_kurs}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Schritt 2: Dozent auswählen ──────────────────────────────────────────────
interface DozentStepProps {
  dozenten: Dozenten[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onZurueck: () => void;
}

function DozentStep({ dozenten, selectedId, onSelect, onZurueck }: DozentStepProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground mb-4">{tt('dozent_auswaehlen')}</h2>
        <EntitySelectStep
          items={dozenten.map(d => ({
            id: d.record_id,
            title: `${d.fields.vorname ?? ''} ${d.fields.nachname ?? ''}`.trim() || tt('unbekannt'),
            subtitle: [
              d.fields.fachbereiche?.map(f => f.label).join(', '),
              d.fields.beschaeftigungsart?.label,
            ].filter(Boolean).join(' · '),
            status: selectedId === d.record_id
              ? { key: 'aktiv', label: tt('ausgewaehlt') }
              : undefined,
            stats: [
              ...(d.fields.email ? [{ label: tt('e_mail'), value: d.fields.email }] : []),
              ...(d.fields.telefon ? [{ label: tt('tel'), value: d.fields.telefon }] : []),
            ],
            icon: <IconUser size={18} className="text-primary" />,
          }))}
          onSelect={id => onSelect(id)}
          searchPlaceholder={tt('dozent_suchen')}
          emptyIcon={<IconUser size={32} />}
          emptyText={tt('kein_dozent_gefunden')}
        />
      </div>

      <Button variant="outline" onClick={onZurueck} className="gap-2">
        {tt('zurueck')}
      </Button>
    </div>
  );
}

// ─── Schritt 3: Raum auswählen ────────────────────────────────────────────────
interface RaumStepProps {
  raeume: Raeume[];
  selectedId: string | null;
  maxTeilnehmer: number | '';
  onSelect: (id: string) => void;
  onZurueck: () => void;
}

function RaumStep({ raeume, selectedId, maxTeilnehmer, onSelect, onZurueck }: RaumStepProps) {
  const verfuegbareRaeume = raeume.filter(r => r.fields.verfuegbar !== false);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card p-5">
        <h2 className="text-base font-semibold text-foreground mb-1">{tt('raum_auswaehlen')}</h2>
        {maxTeilnehmer !== '' && (
          <p className="text-sm text-muted-foreground mb-4">
            {tt('kurs_hat_max')} <span className="font-medium text-foreground">{maxTeilnehmer} {tt('teilnehmer')}</span> {tt('nur_raeume_mit_ausreichender_kap')}
          </p>
        )}

        {/* Kapazitätswarnung wenn ausgewählter Raum zu klein */}
        {selectedId && maxTeilnehmer !== '' && (() => {
          const r = raeume.find(x => x.record_id === selectedId);
          if (r && r.fields.kapazitaet != null && r.fields.kapazitaet < Number(maxTeilnehmer)) {
            return (
              <div className="flex items-center gap-2 p-3 mb-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <IconAlertTriangle size={16} className="shrink-0" />
                <span>
                  {tt('kapazitaet_des_gewaehlten_raums')}{r.fields.kapazitaet}{tt('ist_kleiner_als_die_maximale_tei')}{maxTeilnehmer}).
                </span>
              </div>
            );
          }
          return null;
        })()}

        <EntitySelectStep
          items={verfuegbareRaeume.map(r => {
            const tooSmall = maxTeilnehmer !== '' && r.fields.kapazitaet != null && r.fields.kapazitaet < Number(maxTeilnehmer);
            return {
              id: r.record_id,
              title: r.fields.raumname ?? tt('raum', { p0: r.fields.raumnummer ?? r.record_id }),
              subtitle: [
                r.fields.raumnummer ? tt('nr', { p0: r.fields.raumnummer }) : null,
                r.fields.etage ? tt('etage', { p0: r.fields.etage }) : null,
              ].filter(Boolean).join(' · '),
              status: selectedId === r.record_id
                ? { key: 'aktiv', label: tt('ausgewaehlt') }
                : tooSmall
                ? { key: 'storniert', label: tt('zu_klein') }
                : undefined,
              stats: [
                ...(r.fields.kapazitaet != null ? [{ label: tt('kapazitaet'), value: tt('personen', { p0: r.fields.kapazitaet }) }] : []),
                ...(r.fields.ausstattung?.length ? [{ label: tt('ausstattung'), value: r.fields.ausstattung.map(a => a.label).join(', ') }] : []),
              ],
              icon: <IconBuilding size={18} className={tooSmall ? 'text-destructive' : 'text-primary'} />,
            };
          })}
          onSelect={id => onSelect(id)}
          searchPlaceholder={tt('raum_suchen')}
          emptyIcon={<IconBuilding size={32} />}
          emptyText={tt('keine_verfuegbaren_raeume_gefund')}
        />
      </div>

      <Button variant="outline" onClick={onZurueck} className="gap-2">
        {tt('zurueck')}
      </Button>
    </div>
  );
}

// ─── Schritt 4: Zusammenfassung & Erstellen ───────────────────────────────────
interface ZusammenfassungStepProps {
  kursDaten: KursDaten;
  dozent: Dozenten | null;
  raum: Raeume | null;
  onZurueck: () => void;
  onErstellen: () => void;
  submitting: boolean;
  submitError: string | null;
}

function ZusammenfassungStep({
  kursDaten,
  dozent,
  raum,
  onZurueck,
  onErstellen,
  submitting,
  submitError,
}: ZusammenfassungStepProps) {
  const dozentName = dozent
    ? `${dozent.fields.vorname ?? ''} ${dozent.fields.nachname ?? ''}`.trim()
    : '–';

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card p-5 space-y-5">
        <h2 className="text-base font-semibold text-foreground">{tt('zusammenfassung')}</h2>

        {/* Kursdetails */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <IconBook size={14} />
            {tt('kursdetails')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SummaryRow label={tt('titel_2')} value={kursDaten.titel} />
            <SummaryRow
              label={tt('typ')}
              value={KURSTYP_OPTIONS.find(o => o.key === kursDaten.kurstyp)?.label ?? kursDaten.kurstyp}
            />
            <SummaryRow
              label={tt('niveau_2')}
              value={NIVEAU_OPTIONS.find(o => o.key === kursDaten.niveau)?.label ?? kursDaten.niveau}
            />
            <SummaryRow
              label={tt('status_2')}
              value={STATUS_KURS_OPTIONS.find(o => o.key === kursDaten.status_kurs)?.label ?? kursDaten.status_kurs}
            />
            <SummaryRow label={tt('startdatum')} value={formatDatumZeit(kursDaten.startdatum)} />
            <SummaryRow label={tt('enddatum')} value={formatDatumZeit(kursDaten.enddatum)} />
            {kursDaten.wochentag_uhrzeit && (
              <SummaryRow label={tt('wochentag_uhrzeit_3')} value={kursDaten.wochentag_uhrzeit} />
            )}
            <SummaryRow
              label={tt('max_teilnehmer')}
              value={(kursDaten.max_teilnehmer !== '' ? tt('personen', { p0: kursDaten.max_teilnehmer }) : "–")}
            />
            <SummaryRow label={tt('preis_2')} value={formatPreis(kursDaten.preis)} />
          </div>
          {kursDaten.beschreibung && (
            <div className="pt-1">
              <p className="text-xs text-muted-foreground mb-1">{tt('beschreibung')}</p>
              <p className="text-sm text-foreground">{kursDaten.beschreibung}</p>
            </div>
          )}
        </div>

        <div className="border-t" />

        {/* Dozent */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <IconUser size={14} />
            {tt('dozent')}
          </h3>
          {dozent ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SummaryRow label={tt('name_txt')} value={dozentName} />
              {dozent.fields.email && <SummaryRow label={tt('e_mail')} value={dozent.fields.email} />}
              {dozent.fields.telefon && <SummaryRow label={tt('telefon')} value={dozent.fields.telefon} />}
              {dozent.fields.beschaeftigungsart && (
                <SummaryRow label={tt('beschaeftigungsart')} value={dozent.fields.beschaeftigungsart.label} />
              )}
              {dozent.fields.fachbereiche && dozent.fields.fachbereiche.length > 0 && (
                <SummaryRow label={tt('fachbereiche')} value={dozent.fields.fachbereiche.map(f => f.label).join(', ')} />
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">{tt('kein_dozent_ausgewaehlt')}</p>
          )}
        </div>

        <div className="border-t" />

        {/* Raum */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <IconMapPin size={14} />
            {tt('raum_2')}
          </h3>
          {raum ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SummaryRow label={tt('raumname')} value={raum.fields.raumname ?? '–'} />
              {raum.fields.raumnummer && <SummaryRow label={tt('raumnummer')} value={raum.fields.raumnummer} />}
              {raum.fields.etage && <SummaryRow label={tt('etage_2')} value={raum.fields.etage} />}
              {raum.fields.kapazitaet != null && (
                <SummaryRow label={tt('kapazitaet')} value={tt('personen', { p0: raum.fields.kapazitaet })} />
              )}
              {raum.fields.ausstattung && raum.fields.ausstattung.length > 0 && (
                <SummaryRow label={tt('ausstattung')} value={raum.fields.ausstattung.map(a => a.label).join(', ')} />
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">{tt('kein_raum_ausgewaehlt')}</p>
          )}
        </div>
      </div>

      {submitError && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <IconAlertTriangle size={16} className="shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" onClick={onZurueck} disabled={submitting} className="gap-2 sm:w-auto w-full">
          {tt('zurueck')}
        </Button>
        <Button
          onClick={onErstellen}
          disabled={submitting}
          size="lg"
          className="gap-2 flex-1"
        >
          {submitting ? (
            <>
              <IconRefresh size={16} className="animate-spin" />
              {tt('wird_erstellt')}
            </>
          ) : (
            <>
              <IconCheck size={16} />
              {tt('kurs_anlegen')}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="overflow-hidden">
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-medium text-foreground truncate">{value || '–'}</p>
    </div>
  );
}

// ─── Erfolgszustand ──────────────────────────────────────────────────────────
interface ErfolgProps {
  kursTitle: string;
  onReset: () => void;
}

function ErfolgView({ kursTitle, onReset }: ErfolgProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-5 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        <IconCheck size={28} className="text-primary" stroke={2.5} />
      </div>
      <div>
        <h2 className="text-xl font-bold text-foreground">{tt('kurs_erfolgreich_angelegt')}</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          <span className="font-medium text-foreground">„{kursTitle}"</span> {tt('wurde_erfolgreich_erstellt_und_i')}
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onReset} variant="outline" className="gap-2">
          <IconRefresh size={16} />
          {tt('weiteren_kurs_anlegen')}
        </Button>
        <a href="#/">
          <Button className="gap-2 w-full">
            {tt('zurueck_zum_dashboard')}
          </Button>
        </a>
      </div>
    </div>
  );
}

// ─── Hauptkomponente ─────────────────────────────────────────────────────────
export default function KursAnlegenPage() {
  const WIZARD_STEPS = [
  { label: tt('kursdaten') },
  { label: tt('dozent') },
  { label: tt('raum_2') },
  { label: tt('bestaetigen') },
];

  const { dozenten, raeume, loading, error, fetchAll } = useDashboardData();

  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [successTitle, setSuccessTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [kursDaten, setKursDaten] = useState<KursDaten>({
    titel: '',
    kurstyp: '',
    niveau: '',
    beschreibung: '',
    max_teilnehmer: '',
    preis: '',
    startdatum: '',
    enddatum: '',
    wochentag_uhrzeit: '',
    status_kurs: DEFAULT_STATUS_KEY,
  });

  const [selectedDozentId, setSelectedDozentId] = useState<string | null>(null);
  const [selectedRaumId, setSelectedRaumId] = useState<string | null>(null);

  const selectedDozent = dozenten.find(d => d.record_id === selectedDozentId) ?? null;
  const selectedRaum = raeume.find(r => r.record_id === selectedRaumId) ?? null;

  const handleDozentSelect = (id: string) => {
    setSelectedDozentId(id);
    setStep(3);
  };

  const handleRaumSelect = (id: string) => {
    setSelectedRaumId(id);
    setStep(4);
  };

  const handleErstellen = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Datum-Format sicherstellen: YYYY-MM-DDTHH:MM (keine Sekunden)
      const formatDt = (val: string) => {
        if (!val) return undefined;
        // datetime-local liefert "YYYY-MM-DDTHH:MM" — aber zur Sicherheit kürzen
        const clean = val.slice(0, 16);
        return clean.length === 16 ? clean : undefined;
      };

      await LivingAppsService.createKurseWorkshop({
        titel: kursDaten.titel,
        kurstyp: kursDaten.kurstyp || undefined,
        niveau: kursDaten.niveau || undefined,
        beschreibung: kursDaten.beschreibung || undefined,
        max_teilnehmer: kursDaten.max_teilnehmer !== '' ? Number(kursDaten.max_teilnehmer) : undefined,
        preis: kursDaten.preis !== '' ? Number(kursDaten.preis) : undefined,
        startdatum: formatDt(kursDaten.startdatum),
        enddatum: formatDt(kursDaten.enddatum),
        wochentag_uhrzeit: kursDaten.wochentag_uhrzeit || undefined,
        status_kurs: kursDaten.status_kurs || undefined,
        dozent: selectedDozentId
          ? createRecordUrl(APP_IDS.DOZENTEN, selectedDozentId)
          : undefined,
        raum: selectedRaumId
          ? createRecordUrl(APP_IDS.RAEUME, selectedRaumId)
          : undefined,
      });

      setSuccessTitle(kursDaten.titel);
      setSuccess(true);
      await fetchAll();
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Beim Anlegen des Kurses ist ein Fehler aufgetreten.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setKursDaten({
      titel: '',
      kurstyp: '',
      niveau: '',
      beschreibung: '',
      max_teilnehmer: '',
      preis: '',
      startdatum: '',
      enddatum: '',
      wochentag_uhrzeit: '',
      status_kurs: DEFAULT_STATUS_KEY,
    });
    setSelectedDozentId(null);
    setSelectedRaumId(null);
    setSubmitError(null);
    setSuccess(false);
    setStep(1);
  };

  if (success) {
    return (
      <div className="max-w-4xl mx-auto">
        <ErfolgView kursTitle={successTitle} onReset={handleReset} />
      </div>
    );
  }

  return (
    <IntentWizardShell
      title={tt('neuen_kurs_anlegen')}
      subtitle={tt('schritt_fuer_schritt_zum_fertige')}
      steps={WIZARD_STEPS}
      currentStep={step}
      onStepChange={setStep}
      loading={loading}
      error={error}
      onRetry={fetchAll}
    >
      {step === 1 && (
        <KursdatenStep
          data={kursDaten}
          onChange={setKursDaten}
          onWeiter={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <DozentStep
          dozenten={dozenten}
          selectedId={selectedDozentId}
          onSelect={handleDozentSelect}
          onZurueck={() => setStep(1)}
        />
      )}

      {step === 3 && (
        <RaumStep
          raeume={raeume}
          selectedId={selectedRaumId}
          maxTeilnehmer={kursDaten.max_teilnehmer}
          onSelect={handleRaumSelect}
          onZurueck={() => setStep(2)}
        />
      )}

      {step === 4 && (
        <ZusammenfassungStep
          kursDaten={kursDaten}
          dozent={selectedDozent}
          raum={selectedRaum}
          onZurueck={() => setStep(3)}
          onErstellen={handleErstellen}
          submitting={submitting}
          submitError={submitError}
        />
      )}
    </IntentWizardShell>
  );
}
