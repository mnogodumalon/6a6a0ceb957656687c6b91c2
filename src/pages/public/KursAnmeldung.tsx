import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  IconMusic,
  IconCalendar,
  IconUser,
  IconCheck,
  IconChevronLeft,
  IconArrowRight,
  IconAlertCircle,
} from '@tabler/icons-react';
import { PublicShell } from '@/components/PublicShell';
import {
  loadPublicPagesConfig,
  listPublicRecords,
  createPublicRecord,
  prepareChallenge,
  recordRef,
  type PublicPagesConfig,
  type PublicPageConfig,
} from '@/lib/publicClient';

type Step = 'kurs' | 'daten' | 'bestaetigung' | 'erfolg';

interface KursRecord {
  id: string;
  fields: {
    titel?: string;
    kurstyp?: string;
    beschreibung?: string;
    niveau?: string;
    startdatum?: string;
    enddatum?: string;
    preis?: number;
    max_teilnehmer?: number;
  };
}

const KURSTYP: Record<string, string> = { kurs: 'Kurs', workshop: 'Workshop' };
const NIVEAU: Record<string, string> = {
  anfaenger: 'Anfänger',
  fortgeschrittene: 'Fortgeschrittene',
  experten: 'Experten',
  alle_niveaus: 'Alle Niveaus',
};

function formatDatum(s: string): string {
  try {
    return format(new Date(s), 'dd. MMMM yyyy, HH:mm', { locale: de }) + ' Uhr';
  } catch {
    return s;
  }
}

const STEPS: Step[] = ['kurs', 'daten', 'bestaetigung'];
const STEP_LABELS: Record<Step, string> = {
  kurs: 'Kurs wählen',
  daten: 'Kontaktdaten',
  bestaetigung: 'Bestätigung',
  erfolg: '',
};

export default function KursAnmeldung() {
  const [cfg, setCfg] = useState<PublicPagesConfig | null>(null);
  const [page, setPage] = useState<PublicPageConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [kurse, setKurse] = useState<KursRecord[]>([]);

  const [step, setStep] = useState<Step>('kurs');
  const [selectedKurs, setSelectedKurs] = useState<KursRecord | null>(null);

  const [vorname, setVorname] = useState('');
  const [nachname, setNachname] = useState('');
  const [email, setEmail] = useState('');
  const [telefon, setTelefon] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    loadPublicPagesConfig()
      .then(c => {
        if (!c) { setLoading(false); return; }
        const p = c.pages['kurs-anmeldung'] ?? null;
        setCfg(c);
        setPage(p);
        setLoading(false);
        if (!p) return;
        const kursEp = p.endpoints?.find(ep => ep.entity === 'kurse_&_workshops' && ep.op === 'list');
        if (!kursEp) return;
        listPublicRecords(c, p, { appId: kursEp.app_id, limit: 50 })
          .then(map => {
            const records = Object.entries(map).map(([id, r]) => ({
              id,
              fields: r.fields as KursRecord['fields'],
            }));
            setKurse(records);
          })
          .catch(() => {});
      })
      .catch(() => { setLoading(false); });
  }, []);

  const handleKursSelect = (kurs: KursRecord) => {
    if (cfg && page) {
      const tnEp = page.endpoints?.find(ep => ep.entity === 'teilnehmer' && ep.op === 'create');
      if (tnEp) prepareChallenge(cfg, page, 'POST', `/apps/${tnEp.app_id}/records`);
    }
    setSelectedKurs(kurs);
    setStep('daten');
  };

  const handleDatenWeiter = () => {
    if (!vorname.trim() || !nachname.trim()) return;
    setStep('bestaetigung');
  };

  const handleSubmit = async () => {
    if (!cfg || !page || !selectedKurs) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const tnEp = page.endpoints?.find(ep => ep.entity === 'teilnehmer' && ep.op === 'create');
      const anEp = page.endpoints?.find(ep => ep.entity === 'anmeldungen' && ep.op === 'create');
      const kursEp = page.endpoints?.find(ep => ep.entity === 'kurse_&_workshops' && ep.op === 'list');
      if (!tnEp || !anEp || !kursEp) throw new Error('config');

      // 1. Teilnehmer anlegen
      const tn = await createPublicRecord(cfg, { ...page, app_id: tnEp.app_id }, {
        vorname: vorname.trim(),
        nachname: nachname.trim(),
        ...(email.trim() ? { email: email.trim() } : {}),
        ...(telefon.trim() ? { telefon: telefon.trim() } : {}),
      });

      // 2. Anmeldung erstellen
      await createPublicRecord(cfg, { ...page, app_id: anEp.app_id }, {
        teilnehmer: recordRef(cfg, page, tnEp.app_id, tn.id),
        kurs: recordRef(cfg, page, kursEp.app_id, selectedKurs.id),
        anmeldedatum: format(new Date(), 'yyyy-MM-dd'),
      });

      setStep('erfolg');
    } catch {
      setSubmitError('Die Anmeldung konnte leider nicht gespeichert werden. Bitte versuche es erneut.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setStep('kurs');
    setSelectedKurs(null);
    setVorname('');
    setNachname('');
    setEmail('');
    setTelefon('');
    setSubmitError(null);
  };

  if (loading) return <PublicShell loading />;
  if (!cfg || !page) return <PublicShell unavailable />;

  const currentStepIndex = STEPS.indexOf(step);

  return (
    <PublicShell
      title="Kursanmeldung"
      description="Melde dich jetzt für einen Kurs oder Workshop unserer Musikschule an."
    >
      {/* Schrittanzeige */}
      {step !== 'erfolg' && (
        <div className="flex items-center gap-1 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors
                ${step === s
                  ? 'bg-primary text-primary-foreground'
                  : currentStepIndex > i
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}>
                {currentStepIndex > i ? <IconCheck size={13} /> : i + 1}
              </div>
              <span className={`text-xs hidden sm:inline ${step === s ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                {STEP_LABELS[s]}
              </span>
              {i < STEPS.length - 1 && <div className="w-5 h-px bg-border mx-1 sm:mx-2" />}
            </div>
          ))}
        </div>
      )}

      {/* Schritt 1: Kursauswahl */}
      {step === 'kurs' && (
        <div>
          <h2 className="text-lg font-semibold mb-1">Kurs oder Workshop wählen</h2>
          <p className="text-sm text-muted-foreground mb-4">Wähle einen verfügbaren Kurs aus, um dich anzumelden.</p>

          {kurse.length === 0 ? (
            <div className="text-center py-12">
              <IconMusic size={48} className="mx-auto mb-3 text-muted-foreground" stroke={1.5} />
              <p className="text-muted-foreground">Aktuell sind keine Kurse verfügbar.</p>
              <p className="text-sm text-muted-foreground mt-1">Schau gerne bald wieder vorbei.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {kurse.map(k => (
                <button
                  key={k.id}
                  onClick={() => handleKursSelect(k)}
                  className="text-left w-full border rounded-xl p-4 hover:border-primary hover:bg-primary/5 transition-all active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-3 min-w-0">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className="font-semibold text-sm">{k.fields.titel ?? 'Kurs'}</span>
                        {k.fields.kurstyp && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                            {KURSTYP[k.fields.kurstyp] ?? k.fields.kurstyp}
                          </span>
                        )}
                        {k.fields.niveau && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                            {NIVEAU[k.fields.niveau] ?? k.fields.niveau}
                          </span>
                        )}
                      </div>
                      {k.fields.beschreibung && (
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{k.fields.beschreibung}</p>
                      )}
                      {k.fields.startdatum && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <IconCalendar size={12} className="shrink-0" />
                          <span>{formatDatum(k.fields.startdatum)}</span>
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      {k.fields.preis != null && (
                        <p className="font-bold text-primary text-sm">
                          {k.fields.preis.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                        </p>
                      )}
                      {k.fields.max_teilnehmer != null && (
                        <p className="text-xs text-muted-foreground mt-0.5">max. {k.fields.max_teilnehmer} TN</p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Schritt 2: Persönliche Daten */}
      {step === 'daten' && selectedKurs && (
        <div>
          <button
            onClick={() => setStep('kurs')}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <IconChevronLeft size={16} className="shrink-0" />
            Zurück zur Kursauswahl
          </button>

          <div className="mb-5 p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-center gap-2">
            <IconMusic size={16} className="shrink-0 text-primary" />
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Gewählter Kurs</p>
              <p className="font-medium text-sm truncate">{selectedKurs.fields.titel}</p>
            </div>
          </div>

          <h2 className="text-lg font-semibold mb-1">Deine Kontaktdaten</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Damit wir deine Anmeldung zuordnen und dich bei Fragen erreichen können.
          </p>

          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Vorname <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={vorname}
                  onChange={e => setVorname(e.target.value)}
                  placeholder="Max"
                  autoComplete="given-name"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">
                  Nachname <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={nachname}
                  onChange={e => setNachname(e.target.value)}
                  placeholder="Mustermann"
                  autoComplete="family-name"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">E-Mail-Adresse</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="max@beispiel.de"
                autoComplete="email"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Telefonnummer</label>
              <input
                type="tel"
                value={telefon}
                onChange={e => setTelefon(e.target.value)}
                placeholder="+49 123 456789"
                autoComplete="tel"
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              />
            </div>
          </div>

          <button
            onClick={handleDatenWeiter}
            disabled={!vorname.trim() || !nachname.trim()}
            className="mt-6 w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-medium disabled:opacity-40 hover:bg-primary/90 transition-colors"
          >
            Weiter zur Bestätigung
            <IconArrowRight size={16} className="shrink-0" />
          </button>
        </div>
      )}

      {/* Schritt 3: Bestätigung */}
      {step === 'bestaetigung' && selectedKurs && (
        <div>
          <button
            onClick={() => setStep('daten')}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <IconChevronLeft size={16} className="shrink-0" />
            Zurück
          </button>

          <h2 className="text-lg font-semibold mb-4">Anmeldung bestätigen</h2>

          <div className="space-y-3 mb-6">
            <div className="p-4 rounded-xl border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2 flex items-center gap-1.5">
                <IconMusic size={12} className="shrink-0" />
                Kurs
              </p>
              <p className="font-semibold">{selectedKurs.fields.titel}</p>
              {selectedKurs.fields.startdatum && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {formatDatum(selectedKurs.fields.startdatum)}
                </p>
              )}
              {selectedKurs.fields.preis != null && (
                <p className="text-sm font-semibold text-primary mt-1">
                  {selectedKurs.fields.preis.toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </p>
              )}
            </div>

            <div className="p-4 rounded-xl border">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium mb-2 flex items-center gap-1.5">
                <IconUser size={12} className="shrink-0" />
                Teilnehmer
              </p>
              <p className="font-semibold">{vorname} {nachname}</p>
              {email && <p className="text-sm text-muted-foreground mt-0.5">{email}</p>}
              {telefon && <p className="text-sm text-muted-foreground">{telefon}</p>}
            </div>
          </div>

          {submitError && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-sm text-destructive">
              <IconAlertCircle size={16} className="shrink-0" />
              {submitError}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground rounded-lg py-2.5 text-sm font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
          >
            {submitting ? 'Wird angemeldet …' : 'Jetzt verbindlich anmelden'}
            {!submitting && <IconCheck size={16} className="shrink-0" />}
          </button>

          <p className="text-xs text-muted-foreground text-center mt-3 leading-relaxed">
            Mit der Anmeldung stimmst du der Speicherung deiner Kontaktdaten für die Kursorganisation zu.
          </p>
        </div>
      )}

      {/* Erfolg */}
      {step === 'erfolg' && selectedKurs && (
        <div className="text-center py-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <IconCheck size={32} className="text-primary" />
          </div>
          <h2 className="text-xl font-bold mb-2">Anmeldung erfolgreich!</h2>
          <p className="text-muted-foreground mb-1">
            Danke, <strong>{vorname}</strong>! Deine Anmeldung für
          </p>
          <p className="font-semibold mb-4">{selectedKurs.fields.titel}</p>
          <p className="text-sm text-muted-foreground mb-8">
            ist eingegangen. Wir melden uns in Kürze bei dir.
          </p>
          <button
            onClick={resetForm}
            className="text-sm text-primary hover:underline"
          >
            Weitere Anmeldung vornehmen
          </button>
        </div>
      )}
    </PublicShell>
  );
}
