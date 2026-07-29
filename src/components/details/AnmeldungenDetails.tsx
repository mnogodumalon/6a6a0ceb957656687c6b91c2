import type { Anmeldungen, Teilnehmer, KurseWorkshops, Zahlungen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { SatelliteSection } from '@/components/SatelliteSection';

export interface AnmeldungenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Anmeldungen;
  /** N:1-Ziel „Teilnehmer": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  teilnehmerList: Teilnehmer[];
  /** Klick auf die Teilnehmer-Relation → overlay.push auf dessen Detail. */
  onOpenTeilnehmer?: (record: Teilnehmer) => void;
  /** N:1-Ziel „KurseWorkshops": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  kurseWorkshopsList: KurseWorkshops[];
  /** Klick auf die KurseWorkshops-Relation → overlay.push auf dessen Detail. */
  onOpenKurseWorkshops?: (record: KurseWorkshops) => void;
  /** 1:N „Zahlungen": VOLLE Liste — der Block filtert auf diesen Record. */
  zahlungenList: Zahlungen[];
  /** Zeilen-Klick → overlay.push auf das Zahlungen-Detail (nie der Edit-Dialog). */
  onOpenZahlungen: (record: Zahlungen) => void;
  /** Kontextuelles „+": öffnet den Zahlungen-Dialog mit diesem Record vorgesetzt. */
  onAddZahlungen: () => void;
}

export function AnmeldungenDetails({
  record,
  teilnehmerList,
  onOpenTeilnehmer,
  kurseWorkshopsList,
  onOpenKurseWorkshops,
  zahlungenList,
  onOpenZahlungen,
  onAddZahlungen,
}: AnmeldungenDetailsProps) {
  const teilnehmerTarget = teilnehmerList.find(r => r.record_id === extractRecordId(record.fields.teilnehmer));
  const kursTarget = kurseWorkshopsList.find(r => r.record_id === extractRecordId(record.fields.kurs));
  return (
    <>
      <RecordSection title="Details" cols={2}>
        <RecordField label="Anmeldedatum" value={record.fields.anmeldedatum} format="date" />
        <RecordField label="Anmeldestatus" value={record.fields.status_anmeldung} format="pill" />
        <RecordField label="Bemerkungen" value={record.fields.bemerkungen_anmeldung} format="longtext" className="md:col-span-2" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title="Verknüpft" cols={2}>
        <RecordRelation
          label="Teilnehmer"
          name={teilnehmerTarget?.fields.vorname ?? '—'}
          meta={[teilnehmerTarget?.fields.email, teilnehmerTarget?.fields.telefon].filter(Boolean).join(' · ') || undefined}
          onClick={teilnehmerTarget && onOpenTeilnehmer ? () => onOpenTeilnehmer!(teilnehmerTarget!) : undefined}
        />
        <RecordRelation
          label="Kurs / Workshop"
          name={kursTarget?.fields.titel ?? '—'}
          meta={[kursTarget?.fields.wochentag_uhrzeit].filter(Boolean).join(' · ') || undefined}
          onClick={kursTarget && onOpenKurseWorkshops ? () => onOpenKurseWorkshops!(kursTarget!) : undefined}
        />
      </RecordSection>

      <SatelliteSection
        title="Zahlungen"
        items={zahlungenList.filter(r => extractRecordId(r.fields.anmeldung) === record.record_id)}
        map={r => ({ name: r.fields.rechnungsnummer ?? 'Zahlungen', meta: r.fields.zahlungsdatum })}
        onOpen={onOpenZahlungen}
        onAdd={onAddZahlungen}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.ANMELDUNGEN} recordId={record.record_id} />
    </>
  );
}
