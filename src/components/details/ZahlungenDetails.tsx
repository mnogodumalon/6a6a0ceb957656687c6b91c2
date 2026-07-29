import type { Zahlungen, Anmeldungen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';

export interface ZahlungenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Zahlungen;
  /** N:1-Ziel „Anmeldungen": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  anmeldungenList: Anmeldungen[];
  /** Klick auf die Anmeldungen-Relation → overlay.push auf dessen Detail. */
  onOpenAnmeldungen?: (record: Anmeldungen) => void;
}

export function ZahlungenDetails({
  record,
  anmeldungenList,
  onOpenAnmeldungen,
}: ZahlungenDetailsProps) {
  const anmeldungTarget = anmeldungenList.find(r => r.record_id === extractRecordId(record.fields.anmeldung));
  return (
    <>
      <RecordSection title="Details" cols={2}>
        <RecordField label="Rechnungsnummer" value={record.fields.rechnungsnummer} format="text" />
        <RecordField label="Betrag (€)" value={record.fields.betrag} format="text" />
        <RecordField label="Zahlungsdatum" value={record.fields.zahlungsdatum} format="date" />
        <RecordField label="Zahlungsart" value={record.fields.zahlungsart} format="pill" />
        <RecordField label="Zahlungsstatus" value={record.fields.zahlungsstatus} format="pill" />
        <RecordField label="Notizen" value={record.fields.notizen_zahlung} format="longtext" className="md:col-span-2" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title="Verknüpft" cols={1}>
        <RecordRelation
          label="Anmeldung"
          name={anmeldungTarget?.fields.bemerkungen_anmeldung ?? '—'}
          meta={undefined}
          onClick={anmeldungTarget && onOpenAnmeldungen ? () => onOpenAnmeldungen!(anmeldungTarget!) : undefined}
        />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.ZAHLUNGEN} recordId={record.record_id} />
    </>
  );
}
