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

// ─── Lookup-Keys (sicher aus LOOKUP_OPTIONS, nie geraten) ─────────────────────
const KURSTYP_OPTIONS = LOOKUP_OPTIONS['kurse_&_workshops']?.['kurstyp'] ?? [];
const NIVEAU_OPTIONS = LOOKUP_OPTIONS['kurse_&_workshops']?.['niveau'] ?? [];
const STATUS_KURS_OPTIONS = LOOKUP_OPTIONS['kurse_&_workshops']?.['status_kurs'] ?? [];

// Standard-Status ist "geplant" (existiert laut Schema)
const DEFAULT_STATUS_KEY = STATUS_KURS_OPTIONS.find(o => o.key === 'geplant')?.key ?? STATUS_KURS_OPTIONS[0]?.key ?? '';

// ─── Wizard-Schritte ─────────────────────────────────────────────────────────
const WIZARD_STEPS = [
  { label: 'Kursdaten' },
  { label: 'Dozent' },
  { label: 'Raum' },
  { label: 'Bestätigen' },
];

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
    return `${d}.${m}.${y}${time ? ` · ${time} Uhr` : ''}`;
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
          <h2 className="text-base font-semibold text-foreground">Kursdetails eingeben</h2>

          {/* Titel */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Titel *</label>
            <Input
              value={data.titel}
              onChange={e => set('titel', e.target.value)}
              placeholder="z. B. Klavier für Anfänger"
            />
          </div>

          {/* Kurstyp (Radio) */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Kurstyp *</label>
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
            <label className="text-sm font-medium text-foreground">Niveau *</label>
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
            <label className="text-sm font-medium text-foreground">Beschreibung</label>
            <Textarea
              value={data.beschreibung}
              onChange={e => set('beschreibung', e.target.value)}
              placeholder="Was lernen die Teilnehmer in diesem Kurs?"
              rows={3}
            />
          </div>

          {/* Datum/Zeit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Startdatum & -uhrzeit *</label>
              <Input
                type="datetime-local"
                value={data.startdatum}
                onChange={e => set('startdatum', e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Enddatum & -uhrzeit *</label>
              <Input
                type="datetime-local"
                value={data.enddatum}
                onChange={e => set('enddatum', e.target.value)}
              />
            </div>
          </div>

          {/* Wochentag / Uhrzeit */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Wochentag & Uhrzeit</label>
            <Input
              value={data.wochentag_uhrzeit}
              onChange={e => set('wochentag_uhrzeit', e.target.value)}
              placeholder="z. B. Montags 18:00–20:00 Uhr"
            />
          </div>

          {/* Max. Teilnehmer & Preis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Max. Teilnehmer</label>
              <Input
                type="number"
                min={1}
                value={data.max_teilnehmer}
                onChange={e => set('max_teilnehmer', e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="z. B. 12"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Preis (€)</label>
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
            <label className="text-sm font-medium text-foreground">Status *</label>
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
          Weiter: Dozent auswählen
          <IconChevronRight size={16} />
        </Button>
      </div>

      {/* Live-Vorschau */}
      <div className="lg:col-span-2">
        <div className="rounded-2xl border bg-card p-5 space-y-3 sticky top-6">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Kursübersicht</h3>

          <div className="space-y-2.5">
            <div className="flex items-start gap-3">
              <IconBook size={16} className="text-primary mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Titel</p>
                <p className="text-sm font-medium text-foreground truncate">
                  {data.titel || <span className="text-muted-foreground italic">Noch nicht eingegeben</span>}
                </p>
              </div>
            </div>

            {data.kurstyp && (
              <div className="flex items-start gap-3">
                <IconBook size={16} className="text-primary mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Typ & Niveau</p>
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
                  <p className="text-xs text-muted-foreground">Zeitraum</p>
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
                  <p className="text-xs text-muted-foreground">Wochentag / Uhrzeit</p>
                  <p className="text-sm font-medium text-foreground">{data.wochentag_uhrzeit}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <IconUsers size={16} className="text-primary mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Max. Teilnehmer</p>
                <p className="text-sm font-medium text-foreground">
                  {data.max_teilnehmer !== '' ? `${data.max_teilnehmer} Personen` : <span className="text-muted-foreground italic">–</span>}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <IconCurrencyEuro size={16} className="text-primary mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">Preis</p>
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
        <h2 className="text-base font-semibold text-foreground mb-4">Dozent auswählen</h2>
        <EntitySelectStep
          items={dozenten.map(d => ({
            id: d.record_id,
            title: `${d.fields.vorname ?? ''} ${d.fields.nachname ?? ''}`.trim() || 'Unbekannt',
            subtitle: [
              d.fields.fachbereiche?.map(f => f.label).join(', '),
              d.fields.beschaeftigungsart?.label,
            ].filter(Boolean).join(' · '),
            status: selectedId === d.record_id
              ? { key: 'aktiv', label: 'Ausgewählt' }
              : undefined,
            stats: [
              ...(d.fields.email ? [{ label: 'E-Mail', value: d.fields.email }] : []),
              ...(d.fields.telefon ? [{ label: 'Tel.', value: d.fields.telefon }] : []),
            ],
            icon: <IconUser size={18} className="text-primary" />,
          }))}
          onSelect={id => onSelect(id)}
          searchPlaceholder="Dozent suchen..."
          emptyIcon={<IconUser size={32} />}
          emptyText="Kein Dozent gefunden."
        />
      </div>

      <Button variant="outline" onClick={onZurueck} className="gap-2">
        Zurück
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
        <h2 className="text-base font-semibold text-foreground mb-1">Raum auswählen</h2>
        {maxTeilnehmer !== '' && (
          <p className="text-sm text-muted-foreground mb-4">
            Kurs hat max. <span className="font-medium text-foreground">{maxTeilnehmer} Teilnehmer</span> — nur Räume mit ausreichender Kapazität empfohlen.
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
                  Kapazität des gewählten Raums ({r.fields.kapazitaet}) ist kleiner als die maximale Teilnehmerzahl ({maxTeilnehmer}).
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
              title: r.fields.raumname ?? `Raum ${r.fields.raumnummer ?? r.record_id}`,
              subtitle: [
                r.fields.raumnummer ? `Nr. ${r.fields.raumnummer}` : null,
                r.fields.etage ? `Etage: ${r.fields.etage}` : null,
              ].filter(Boolean).join(' · '),
              status: selectedId === r.record_id
                ? { key: 'aktiv', label: 'Ausgewählt' }
                : tooSmall
                ? { key: 'storniert', label: 'Zu klein' }
                : undefined,
              stats: [
                ...(r.fields.kapazitaet != null ? [{ label: 'Kapazität', value: `${r.fields.kapazitaet} Personen` }] : []),
                ...(r.fields.ausstattung?.length ? [{ label: 'Ausstattung', value: r.fields.ausstattung.map(a => a.label).join(', ') }] : []),
              ],
              icon: <IconBuilding size={18} className={tooSmall ? 'text-destructive' : 'text-primary'} />,
            };
          })}
          onSelect={id => onSelect(id)}
          searchPlaceholder="Raum suchen..."
          emptyIcon={<IconBuilding size={32} />}
          emptyText="Keine verfügbaren Räume gefunden."
        />
      </div>

      <Button variant="outline" onClick={onZurueck} className="gap-2">
        Zurück
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
        <h2 className="text-base font-semibold text-foreground">Zusammenfassung</h2>

        {/* Kursdetails */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <IconBook size={14} />
            Kursdetails
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SummaryRow label="Titel" value={kursDaten.titel} />
            <SummaryRow
              label="Typ"
              value={KURSTYP_OPTIONS.find(o => o.key === kursDaten.kurstyp)?.label ?? kursDaten.kurstyp}
            />
            <SummaryRow
              label="Niveau"
              value={NIVEAU_OPTIONS.find(o => o.key === kursDaten.niveau)?.label ?? kursDaten.niveau}
            />
            <SummaryRow
              label="Status"
              value={STATUS_KURS_OPTIONS.find(o => o.key === kursDaten.status_kurs)?.label ?? kursDaten.status_kurs}
            />
            <SummaryRow label="Startdatum" value={formatDatumZeit(kursDaten.startdatum)} />
            <SummaryRow label="Enddatum" value={formatDatumZeit(kursDaten.enddatum)} />
            {kursDaten.wochentag_uhrzeit && (
              <SummaryRow label="Wochentag/Uhrzeit" value={kursDaten.wochentag_uhrzeit} />
            )}
            <SummaryRow
              label="Max. Teilnehmer"
              value={kursDaten.max_teilnehmer !== '' ? `${kursDaten.max_teilnehmer} Personen` : '–'}
            />
            <SummaryRow label="Preis" value={formatPreis(kursDaten.preis)} />
          </div>
          {kursDaten.beschreibung && (
            <div className="pt-1">
              <p className="text-xs text-muted-foreground mb-1">Beschreibung</p>
              <p className="text-sm text-foreground">{kursDaten.beschreibung}</p>
            </div>
          )}
        </div>

        <div className="border-t" />

        {/* Dozent */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <IconUser size={14} />
            Dozent
          </h3>
          {dozent ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SummaryRow label="Name" value={dozentName} />
              {dozent.fields.email && <SummaryRow label="E-Mail" value={dozent.fields.email} />}
              {dozent.fields.telefon && <SummaryRow label="Telefon" value={dozent.fields.telefon} />}
              {dozent.fields.beschaeftigungsart && (
                <SummaryRow label="Beschäftigungsart" value={dozent.fields.beschaeftigungsart.label} />
              )}
              {dozent.fields.fachbereiche && dozent.fields.fachbereiche.length > 0 && (
                <SummaryRow label="Fachbereiche" value={dozent.fields.fachbereiche.map(f => f.label).join(', ')} />
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">Kein Dozent ausgewählt</p>
          )}
        </div>

        <div className="border-t" />

        {/* Raum */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
            <IconMapPin size={14} />
            Raum
          </h3>
          {raum ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <SummaryRow label="Raumname" value={raum.fields.raumname ?? '–'} />
              {raum.fields.raumnummer && <SummaryRow label="Raumnummer" value={raum.fields.raumnummer} />}
              {raum.fields.etage && <SummaryRow label="Etage" value={raum.fields.etage} />}
              {raum.fields.kapazitaet != null && (
                <SummaryRow label="Kapazität" value={`${raum.fields.kapazitaet} Personen`} />
              )}
              {raum.fields.ausstattung && raum.fields.ausstattung.length > 0 && (
                <SummaryRow label="Ausstattung" value={raum.fields.ausstattung.map(a => a.label).join(', ')} />
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic">Kein Raum ausgewählt</p>
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
          Zurück
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
              Wird erstellt…
            </>
          ) : (
            <>
              <IconCheck size={16} />
              Kurs anlegen
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
        <h2 className="text-xl font-bold text-foreground">Kurs erfolgreich angelegt!</h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          <span className="font-medium text-foreground">„{kursTitle}"</span> wurde erfolgreich erstellt und ist jetzt verfügbar.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={onReset} variant="outline" className="gap-2">
          <IconRefresh size={16} />
          Weiteren Kurs anlegen
        </Button>
        <a href="#/">
          <Button className="gap-2 w-full">
            Zurück zum Dashboard
          </Button>
        </a>
      </div>
    </div>
  );
}

// ─── Hauptkomponente ─────────────────────────────────────────────────────────
export default function KursAnlegenPage() {
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
      title="Neuen Kurs anlegen"
      subtitle="Schritt für Schritt zum fertigen Kurs"
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
