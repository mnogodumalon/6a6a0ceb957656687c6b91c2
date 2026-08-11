import type { Zahlungen, Anmeldungen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';

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
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('zahlungen', 'rechnungsnummer')} value={record.fields.rechnungsnummer} format="text" />
        <RecordField label={fieldLabel('zahlungen', 'betrag')} value={record.fields.betrag} format="text" />
        <RecordField label={fieldLabel('zahlungen', 'zahlungsdatum')} value={record.fields.zahlungsdatum} format="date" />
        <RecordField label={fieldLabel('zahlungen', 'zahlungsart')} value={record.fields.zahlungsart} format="pill" />
        <RecordField label={fieldLabel('zahlungen', 'zahlungsstatus')} value={record.fields.zahlungsstatus} format="pill" />
        <RecordField label={fieldLabel('zahlungen', 'notizen_zahlung')} value={record.fields.notizen_zahlung} format="longtext" className="md:col-span-2" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={1}>
        <RecordRelation
          label={fieldLabel('zahlungen', 'anmeldung')}
          name={anmeldungTarget?.fields.bemerkungen_anmeldung ?? '—'}
          meta={undefined}
          onClick={anmeldungTarget && onOpenAnmeldungen ? () => onOpenAnmeldungen!(anmeldungTarget!) : undefined}
        />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.ZAHLUNGEN} recordId={record.record_id} />
    </>
  );
}
