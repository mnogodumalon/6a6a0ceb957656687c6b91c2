/**
 * Anmeldung & Zahlung — 4-Schritt-Wizard für eine Bildungsplattform.
 * Steps:
 *   1) Teilnehmer auswählen (oder neu anlegen)
 *   2) Kurs auswählen (gefiltert: status_kurs ≠ abgeschlossen)
 *   3) Anmeldung bestätigen & speichern (erstellt Anmeldungen-Record)
 *   4) Zahlung erfassen (erstellt Zahlungen-Record, verknüpft mit Anmeldung)
 * Reads: teilnehmer, kurseWorkshops.
 * Writes: anmeldungen (createAnmeldungenEntry), zahlungen (createZahlungenEntry).
 * Composes: IntentWizardShell, EntitySelectStep, StatusBadge.
 * Deep-linking: ?teilnehmerId=xxx überspringt zu Schritt 2, ?kursId=xxx zu Schritt 2 mit vorausgewähltem Kurs.
 */

import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { IntentWizardShell } from '@/components/blocks/IntentWizardShell';
import { EntitySelectStep } from '@/components/blocks/EntitySelectStep';
import { StatusBadge } from '@/components/blocks/StatusBadge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDashboardData } from '@/hooks/useDashboardData';
import { LivingAppsService, createRecordUrl } from '@/services/livingAppsService';
import { APP_IDS, LOOKUP_OPTIONS } from '@/types/app';
import type { Teilnehmer, KurseWorkshops } from '@/types/app';
import {
  IconUserPlus,
  IconUser,
  IconBook,
  IconCheck,
  IconCurrencyEuro,
  IconCalendar,
  IconNotes,
  IconArrowRight,
  IconRefresh,
} from '@tabler/icons-react';

const TODAY = format(new Date(), 'yyyy-MM-dd');

const WIZARD_STEPS = [
  { label: 'Teilnehmer' },
  { label: 'Kurs' },
  { label: 'Anmeldung' },
  { label: 'Zahlung' },
];

const STATUS_ANMELDUNG_OPTIONS = LOOKUP_OPTIONS['anmeldungen']?.['status_anmeldung'] ?? [];
const ZAHLUNGSART_OPTIONS = LOOKUP_OPTIONS['zahlungen']?.['zahlungsart'] ?? [];
const ZAHLUNGSSTATUS_OPTIONS = LOOKUP_OPTIONS['zahlungen']?.['zahlungsstatus'] ?? [];

export default function AnmeldungZahlungPage() {
  const [searchParams] = useSearchParams();
  const { teilnehmer, kurseWorkshops, loading, error, fetchAll } = useDashboardData();

  // Wizard step state — initialized from URL
  const [step, setStep] = useState<number>(() => {
    const urlStep = parseInt(searchParams.get('step') ?? '', 10);
    if (urlStep >= 1 && urlStep <= 4) return urlStep;
    return 1;
  });

  // Step 1 — Teilnehmer
  const [selectedTeilnehmerId, setSelectedTeilnehmerId] = useState<string | null>(
    searchParams.get('teilnehmerId') ?? null,
  );
  const [showCreateTeilnehmer, setShowCreateTeilnehmer] = useState(false);
  const [newVorname, setNewVorname] = useState('');
  const [newNachname, setNewNachname] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newTelefon, setNewTelefon] = useState('');
  const [createTeilnehmerLoading, setCreateTeilnehmerLoading] = useState(false);
  const [createTeilnehmerError, setCreateTeilnehmerError] = useState<string | null>(null);

  // Step 2 — Kurs
  const [selectedKursId, setSelectedKursId] = useState<string | null>(
    searchParams.get('kursId') ?? null,
  );

  // Step 3 — Anmeldung
  const [anmeldedatum, setAnmeldedatum] = useState(TODAY);
  const [statusAnmeldung, setStatusAnmeldung] = useState(STATUS_ANMELDUNG_OPTIONS[0]?.key ?? 'angemeldet');
  const [bemerkungenAnmeldung, setBemerkungenAnmeldung] = useState('');
  const [saveAnmeldungLoading, setSaveAnmeldungLoading] = useState(false);
  const [saveAnmeldungError, setSaveAnmeldungError] = useState<string | null>(null);
  const [newAnmeldungId, setNewAnmeldungId] = useState<string | null>(null);

  // Step 4 — Zahlung
  const [rechnungsnummer, setRechnungsnummer] = useState('');
  const [betrag, setBetrag] = useState('');
  const [zahlungsdatum, setZahlungsdatum] = useState(TODAY);
  const [zahlungsart, setZahlungsart] = useState(ZAHLUNGSART_OPTIONS[0]?.key ?? 'ueberweisung');
  const [zahlungsstatus, setZahlungsstatus] = useState(ZAHLUNGSSTATUS_OPTIONS[0]?.key ?? 'offen');
  const [notizenZahlung, setNotizenZahlung] = useState('');
  const [saveZahlungLoading, setSaveZahlungLoading] = useState(false);
  const [saveZahlungError, setSaveZahlungError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Deep-linking: if teilnehmerId is set, skip to step 2
  useEffect(() => {
    const tid = searchParams.get('teilnehmerId');
    const kid = searchParams.get('kursId');
    if (tid && !selectedTeilnehmerId) {
      setSelectedTeilnehmerId(tid);
    }
    if (kid && !selectedKursId) {
      setSelectedKursId(kid);
    }
    if (tid) {
      setStep(prev => (prev === 1 ? 2 : prev));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Derived: selected records
  const selectedTeilnehmer: Teilnehmer | undefined = useMemo(
    () => (selectedTeilnehmerId ? teilnehmer.find(t => t.record_id === selectedTeilnehmerId) : undefined),
    [teilnehmer, selectedTeilnehmerId],
  );

  const selectedKurs: KurseWorkshops | undefined = useMemo(
    () => (selectedKursId ? kurseWorkshops.find(k => k.record_id === selectedKursId) : undefined),
    [kurseWorkshops, selectedKursId],
  );

  // Filtered courses: exclude 'abgeschlossen'
  const availableKurse = useMemo(
    () => kurseWorkshops.filter(k => k.fields.status_kurs?.key !== 'abgeschlossen'),
    [kurseWorkshops],
  );

  // Pre-fill betrag when kurs is selected
  useEffect(() => {
    if (selectedKurs?.fields.preis != null) {
      setBetrag(String(selectedKurs.fields.preis));
    }
  }, [selectedKurs]);

  // --- Step 1 actions ---
  const handleSelectTeilnehmer = (id: string) => {
    setSelectedTeilnehmerId(id);
    setStep(2);
  };

  const handleCreateTeilnehmer = async () => {
    if (!newVorname.trim() || !newNachname.trim()) {
      setCreateTeilnehmerError('Vorname und Nachname sind Pflichtfelder.');
      return;
    }
    setCreateTeilnehmerLoading(true);
    setCreateTeilnehmerError(null);
    try {
      const result = await LivingAppsService.createTeilnehmerEntry({
        vorname: newVorname.trim(),
        nachname: newNachname.trim(),
        email: newEmail.trim() || undefined,
        telefon: newTelefon.trim() || undefined,
      });
      await fetchAll();
      setSelectedTeilnehmerId(result.record_id);
      setShowCreateTeilnehmer(false);
      setNewVorname('');
      setNewNachname('');
      setNewEmail('');
      setNewTelefon('');
      setStep(2);
    } catch (err) {
      setCreateTeilnehmerError(err instanceof Error ? err.message : 'Fehler beim Anlegen des Teilnehmers.');
    } finally {
      setCreateTeilnehmerLoading(false);
    }
  };

  // --- Step 2 actions ---
  const handleSelectKurs = (id: string) => {
    setSelectedKursId(id);
    setStep(3);
  };

  // --- Step 3 actions ---
  const handleSaveAnmeldung = async () => {
    if (!selectedTeilnehmerId || !selectedKursId) return;
    setSaveAnmeldungLoading(true);
    setSaveAnmeldungError(null);
    try {
      const result = await LivingAppsService.createAnmeldungenEntry({
        teilnehmer: createRecordUrl(APP_IDS.TEILNEHMER, selectedTeilnehmerId),
        kurs: createRecordUrl(APP_IDS.KURSE_WORKSHOPS, selectedKursId),
        anmeldedatum,
        status_anmeldung: statusAnmeldung,
        bemerkungen_anmeldung: bemerkungenAnmeldung.trim() || undefined,
      });
      setNewAnmeldungId(result.record_id);
      await fetchAll();
      setStep(4);
    } catch (err) {
      setSaveAnmeldungError(err instanceof Error ? err.message : 'Fehler beim Speichern der Anmeldung.');
    } finally {
      setSaveAnmeldungLoading(false);
    }
  };

  // --- Step 4 actions ---
  const handleSaveZahlung = async () => {
    if (!newAnmeldungId) return;
    setSaveZahlungLoading(true);
    setSaveZahlungError(null);
    try {
      await LivingAppsService.createZahlungenEntry({
        anmeldung: createRecordUrl(APP_IDS.ANMELDUNGEN, newAnmeldungId),
        rechnungsnummer: rechnungsnummer.trim() || undefined,
        betrag: betrag ? parseFloat(betrag) : undefined,
        zahlungsdatum,
        zahlungsart,
        zahlungsstatus,
        notizen_zahlung: notizenZahlung.trim() || undefined,
      });
      await fetchAll();
      setSuccess(true);
    } catch (err) {
      setSaveZahlungError(err instanceof Error ? err.message : 'Fehler beim Erfassen der Zahlung.');
    } finally {
      setSaveZahlungLoading(false);
    }
  };

  // --- Reset ---
  const handleReset = () => {
    setStep(1);
    setSelectedTeilnehmerId(null);
    setSelectedKursId(null);
    setAnmeldedatum(TODAY);
    setStatusAnmeldung(STATUS_ANMELDUNG_OPTIONS[0]?.key ?? 'angemeldet');
    setBemerkungenAnmeldung('');
    setNewAnmeldungId(null);
    setRechnungsnummer('');
    setBetrag('');
    setZahlungsdatum(TODAY);
    setZahlungsart(ZAHLUNGSART_OPTIONS[0]?.key ?? 'ueberweisung');
    setZahlungsstatus(ZAHLUNGSSTATUS_OPTIONS[0]?.key ?? 'offen');
    setNotizenZahlung('');
    setSaveAnmeldungError(null);
    setSaveZahlungError(null);
    setSuccess(false);
  };

  return (
    <IntentWizardShell
      title="Anmeldung & Zahlung"
      subtitle="Teilnehmer anmelden und Zahlung erfassen — in einem Schritt"
      steps={WIZARD_STEPS}
      currentStep={step}
      onStepChange={setStep}
      loading={loading}
      error={error}
      onRetry={fetchAll}
    >
      {/* ── SCHRITT 1: Teilnehmer auswählen ── */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Teilnehmer auswählen</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Wähle einen bestehenden Teilnehmer oder lege einen neuen an.
            </p>
          </div>
          <EntitySelectStep
            items={teilnehmer.map(t => ({
              id: t.record_id,
              title: `${t.fields.vorname ?? ''} ${t.fields.nachname ?? ''}`.trim(),
              subtitle: t.fields.email,
              stats: t.fields.ort ? [{ label: 'Ort', value: t.fields.ort }] : undefined,
              icon: <IconUser size={18} className="text-primary" />,
            }))}
            onSelect={handleSelectTeilnehmer}
            searchPlaceholder="Teilnehmer suchen..."
            emptyText="Kein Teilnehmer gefunden."
            createLabel="Neuen Teilnehmer anlegen"
            onCreateNew={() => setShowCreateTeilnehmer(prev => !prev)}
            createDialog={
              showCreateTeilnehmer ? (
                <div className="rounded-2xl border bg-card p-4 space-y-3 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <IconUserPlus size={16} className="text-primary" />
                    </div>
                    <p className="font-medium text-sm">Neuen Teilnehmer anlegen</p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Vorname *</label>
                      <Input
                        value={newVorname}
                        onChange={e => setNewVorname(e.target.value)}
                        placeholder="Vorname"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Nachname *</label>
                      <Input
                        value={newNachname}
                        onChange={e => setNewNachname(e.target.value)}
                        placeholder="Nachname"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">E-Mail</label>
                      <Input
                        type="email"
                        value={newEmail}
                        onChange={e => setNewEmail(e.target.value)}
                        placeholder="email@beispiel.de"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-muted-foreground">Telefon</label>
                      <Input
                        type="tel"
                        value={newTelefon}
                        onChange={e => setNewTelefon(e.target.value)}
                        placeholder="+49 ..."
                      />
                    </div>
                  </div>
                  {createTeilnehmerError && (
                    <p className="text-sm text-destructive">{createTeilnehmerError}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCreateTeilnehmer}
                      disabled={createTeilnehmerLoading}
                      size="sm"
                      className="gap-1.5"
                    >
                      {createTeilnehmerLoading ? (
                        <IconRefresh size={14} className="animate-spin" />
                      ) : (
                        <IconCheck size={14} />
                      )}
                      Anlegen & auswählen
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setShowCreateTeilnehmer(false);
                        setCreateTeilnehmerError(null);
                      }}
                    >
                      Abbrechen
                    </Button>
                  </div>
                </div>
              ) : null
            }
          />
        </div>
      )}

      {/* ── SCHRITT 2: Kurs auswählen ── */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-lg font-semibold">Kurs auswählen</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Wähle den Kurs, für den{' '}
                <span className="font-medium text-foreground">
                  {selectedTeilnehmer
                    ? `${selectedTeilnehmer.fields.vorname ?? ''} ${selectedTeilnehmer.fields.nachname ?? ''}`.trim()
                    : 'der Teilnehmer'}
                </span>{' '}
                angemeldet werden soll.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setStep(1)}
              className="shrink-0 text-muted-foreground"
            >
              Teilnehmer ändern
            </Button>
          </div>

          {selectedTeilnehmer && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary text-sm overflow-hidden">
              <IconUser size={14} className="text-primary shrink-0" />
              <span className="font-medium truncate">
                {`${selectedTeilnehmer.fields.vorname ?? ''} ${selectedTeilnehmer.fields.nachname ?? ''}`.trim()}
              </span>
              {selectedTeilnehmer.fields.email && (
                <span className="text-muted-foreground truncate">· {selectedTeilnehmer.fields.email}</span>
              )}
            </div>
          )}

          <EntitySelectStep
            items={availableKurse.map(k => ({
              id: k.record_id,
              title: k.fields.titel ?? '(Kein Titel)',
              subtitle: [
                k.fields.startdatum ? k.fields.startdatum.slice(0, 10) : null,
                k.fields.max_teilnehmer != null ? `${k.fields.max_teilnehmer} Plätze` : null,
              ]
                .filter(Boolean)
                .join(' | '),
              status: k.fields.status_kurs
                ? { key: k.fields.status_kurs.key, label: k.fields.status_kurs.label }
                : undefined,
              stats: [
                { label: 'Preis', value: k.fields.preis != null ? `${k.fields.preis} €` : '–' },
                ...(k.fields.niveau ? [{ label: 'Niveau', value: k.fields.niveau.label }] : []),
              ],
              icon: <IconBook size={18} className="text-primary" />,
            }))}
            onSelect={handleSelectKurs}
            searchPlaceholder="Kurs suchen..."
            emptyText="Keine aktiven Kurse gefunden."
          />
        </div>
      )}

      {/* ── SCHRITT 3: Anmeldung bestätigen ── */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Anmeldung bestätigen</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Prüfe die Auswahl und ergänze die Anmeldedaten.
            </p>
          </div>

          {/* Summary card */}
          <div className="rounded-2xl border bg-card p-4 space-y-3 overflow-hidden">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Zusammenfassung</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <IconUser size={15} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Teilnehmer</p>
                  <p className="text-sm font-semibold truncate">
                    {selectedTeilnehmer
                      ? `${selectedTeilnehmer.fields.vorname ?? ''} ${selectedTeilnehmer.fields.nachname ?? ''}`.trim()
                      : '–'}
                  </p>
                  {selectedTeilnehmer?.fields.email && (
                    <p className="text-xs text-muted-foreground truncate">{selectedTeilnehmer.fields.email}</p>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <IconBook size={15} className="text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Kurs</p>
                  <p className="text-sm font-semibold truncate">{selectedKurs?.fields.titel ?? '–'}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedKurs?.fields.preis != null ? `${selectedKurs.fields.preis} €` : ''}
                    {selectedKurs?.fields.status_kurs && (
                      <>
                        {' '}
                        <StatusBadge
                          statusKey={selectedKurs.fields.status_kurs.key}
                          label={selectedKurs.fields.status_kurs.label}
                        />
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Form fields */}
          <div className="rounded-2xl border bg-card p-4 space-y-4 overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <IconCalendar size={13} />
                  Anmeldedatum
                </label>
                <Input
                  type="date"
                  value={anmeldedatum}
                  onChange={e => setAnmeldedatum(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Status der Anmeldung</label>
              <div className="flex flex-wrap gap-2">
                {STATUS_ANMELDUNG_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setStatusAnmeldung(opt.key)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      statusAnmeldung === opt.key
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card border-border text-foreground hover:bg-accent'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <IconNotes size={13} />
                Bemerkungen (optional)
              </label>
              <textarea
                value={bemerkungenAnmeldung}
                onChange={e => setBemerkungenAnmeldung(e.target.value)}
                rows={3}
                placeholder="Bemerkungen zur Anmeldung..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>
          </div>

          {saveAnmeldungError && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {saveAnmeldungError}
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleSaveAnmeldung}
              disabled={saveAnmeldungLoading || !selectedTeilnehmerId || !selectedKursId}
              className="gap-1.5"
            >
              {saveAnmeldungLoading ? (
                <IconRefresh size={15} className="animate-spin" />
              ) : (
                <IconCheck size={15} />
              )}
              Anmeldung speichern
            </Button>
            <Button variant="outline" onClick={() => setStep(2)}>
              Zurück
            </Button>
          </div>
        </div>
      )}

      {/* ── SCHRITT 4: Zahlung erfassen ── */}
      {step === 4 && !success && (
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Zahlung erfassen</h2>
            <p className="text-sm text-muted-foreground mt-0.5">
              Erfasse die Zahlungsdaten für die soeben erstellte Anmeldung.
            </p>
          </div>

          {/* Summary banner */}
          <div className="rounded-2xl border bg-card p-4 overflow-hidden">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2 min-w-0">
                <IconUser size={14} className="text-muted-foreground shrink-0" />
                <span className="text-sm font-medium truncate">
                  {selectedTeilnehmer
                    ? `${selectedTeilnehmer.fields.vorname ?? ''} ${selectedTeilnehmer.fields.nachname ?? ''}`.trim()
                    : '–'}
                </span>
              </div>
              <span className="text-muted-foreground text-sm hidden sm:inline">·</span>
              <div className="flex items-center gap-2 min-w-0">
                <IconBook size={14} className="text-muted-foreground shrink-0" />
                <span className="text-sm truncate">{selectedKurs?.fields.titel ?? '–'}</span>
              </div>
              {selectedKurs?.fields.preis != null && (
                <>
                  <span className="text-muted-foreground text-sm hidden sm:inline">·</span>
                  <div className="flex items-center gap-1.5">
                    <IconCurrencyEuro size={14} className="text-amber-600 shrink-0" />
                    <span className="text-sm font-semibold text-amber-700">
                      {selectedKurs.fields.preis} € ausstehend
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment form */}
          <div className="rounded-2xl border bg-card p-4 space-y-4 overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">Rechnungsnummer</label>
                <Input
                  value={rechnungsnummer}
                  onChange={e => setRechnungsnummer(e.target.value)}
                  placeholder="z. B. RE-2025-001"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <IconCurrencyEuro size={13} />
                  Betrag (€)
                </label>
                <Input
                  type="number"
                  min={0}
                  step={0.01}
                  value={betrag}
                  onChange={e => setBetrag(e.target.value)}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                  <IconCalendar size={13} />
                  Zahlungsdatum
                </label>
                <Input
                  type="date"
                  value={zahlungsdatum}
                  onChange={e => setZahlungsdatum(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Zahlungsart</label>
              <div className="flex flex-wrap gap-2">
                {ZAHLUNGSART_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setZahlungsart(opt.key)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      zahlungsart === opt.key
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card border-border text-foreground hover:bg-accent'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Zahlungsstatus</label>
              <div className="flex flex-wrap gap-2">
                {ZAHLUNGSSTATUS_OPTIONS.map(opt => (
                  <button
                    key={opt.key}
                    onClick={() => setZahlungsstatus(opt.key)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                      zahlungsstatus === opt.key
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card border-border text-foreground hover:bg-accent'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <IconNotes size={13} />
                Notizen (optional)
              </label>
              <textarea
                value={notizenZahlung}
                onChange={e => setNotizenZahlung(e.target.value)}
                rows={3}
                placeholder="Zahlungshinweise oder Notizen..."
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>
          </div>

          {saveZahlungError && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {saveZahlungError}
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleSaveZahlung}
              disabled={saveZahlungLoading || !newAnmeldungId}
              className="gap-1.5"
            >
              {saveZahlungLoading ? (
                <IconRefresh size={15} className="animate-spin" />
              ) : (
                <IconCurrencyEuro size={15} />
              )}
              Zahlung erfassen
            </Button>
          </div>
        </div>
      )}

      {/* ── ERFOLG ── */}
      {step === 4 && success && (
        <div className="space-y-6">
          <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <IconCheck size={32} className="text-green-600" stroke={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Anmeldung & Zahlung erfolgreich gespeichert!
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedTeilnehmer
                  ? `${selectedTeilnehmer.fields.vorname ?? ''} ${selectedTeilnehmer.fields.nachname ?? ''}`.trim()
                  : 'Der Teilnehmer'}{' '}
                wurde für{' '}
                <span className="font-medium text-foreground">
                  {selectedKurs?.fields.titel ?? 'den Kurs'}
                </span>{' '}
                angemeldet und die Zahlung wurde erfasst.
              </p>
            </div>

            <div className="flex gap-3 flex-wrap justify-center mt-2">
              <Button onClick={handleReset} variant="outline" className="gap-1.5">
                <IconRefresh size={15} />
                Neue Anmeldung
              </Button>
              <a href="#/">
                <Button className="gap-1.5">
                  <IconArrowRight size={15} />
                  Zurück zum Dashboard
                </Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </IntentWizardShell>
  );
}
