import type { KurseWorkshops, Dozenten, Raeume, Anmeldungen } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';

export interface KurseWorkshopsDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: KurseWorkshops;
  /** N:1-Ziel „Dozenten": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  dozentenList: Dozenten[];
  /** Klick auf die Dozenten-Relation → overlay.push auf dessen Detail. */
  onOpenDozenten?: (record: Dozenten) => void;
  /** N:1-Ziel „Raeume": volle Liste (Hook-Array) — der Block löst Name + Schlüsselfelder selbst auf. */
  raeumeList: Raeume[];
  /** Klick auf die Raeume-Relation → overlay.push auf dessen Detail. */
  onOpenRaeume?: (record: Raeume) => void;
  /** 1:N „Anmeldungen": VOLLE Liste — der Block filtert auf diesen Record. */
  anmeldungenList: Anmeldungen[];
  /** Zeilen-Klick → overlay.push auf das Anmeldungen-Detail (nie der Edit-Dialog). */
  onOpenAnmeldungen: (record: Anmeldungen) => void;
  /** Kontextuelles „+": öffnet den Anmeldungen-Dialog mit diesem Record vorgesetzt. */
  onAddAnmeldungen: () => void;
}

export function KurseWorkshopsDetails({
  record,
  dozentenList,
  onOpenDozenten,
  raeumeList,
  onOpenRaeume,
  anmeldungenList,
  onOpenAnmeldungen,
  onAddAnmeldungen,
}: KurseWorkshopsDetailsProps) {
  const dozentTarget = dozentenList.find(r => r.record_id === extractRecordId(record.fields.dozent));
  const raumTarget = raeumeList.find(r => r.record_id === extractRecordId(record.fields.raum));
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('kurse_workshops', 'titel')} value={record.fields.titel} format="text" />
        <RecordField label={fieldLabel('kurse_workshops', 'kurstyp')} value={record.fields.kurstyp} format="pill" />
        <RecordField label={fieldLabel('kurse_workshops', 'beschreibung')} value={record.fields.beschreibung} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('kurse_workshops', 'niveau')} value={record.fields.niveau} format="pill" />
        <RecordField label={fieldLabel('kurse_workshops', 'startdatum')} value={record.fields.startdatum} format="datetime" />
        <RecordField label={fieldLabel('kurse_workshops', 'enddatum')} value={record.fields.enddatum} format="datetime" />
        <RecordField label={fieldLabel('kurse_workshops', 'wochentag_uhrzeit')} value={record.fields.wochentag_uhrzeit} format="text" />
        <RecordField label={fieldLabel('kurse_workshops', 'max_teilnehmer')} value={record.fields.max_teilnehmer} format="text" />
        <RecordField label={fieldLabel('kurse_workshops', 'preis')} value={record.fields.preis} format="text" />
        <RecordField label={fieldLabel('kurse_workshops', 'status_kurs')} value={record.fields.status_kurs} format="pill" />
      </RecordSection>

      {/* N:1 — verknüpfte Records: IMMER klickbar, nie eine Text-Sackgasse. */}
      <RecordSection title={t('relations')} cols={2}>
        <RecordRelation
          label={fieldLabel('kurse_workshops', 'dozent')}
          name={dozentTarget?.fields.vorname ?? '—'}
          meta={[dozentTarget?.fields.email, dozentTarget?.fields.telefon].filter(Boolean).join(' · ') || undefined}
          onClick={dozentTarget && onOpenDozenten ? () => onOpenDozenten!(dozentTarget!) : undefined}
        />
        <RecordRelation
          label={fieldLabel('kurse_workshops', 'raum')}
          name={raumTarget?.fields.raumname ?? '—'}
          meta={[raumTarget?.fields.raumnummer, raumTarget?.fields.etage].filter(Boolean).join(' · ') || undefined}
          onClick={raumTarget && onOpenRaeume ? () => onOpenRaeume!(raumTarget!) : undefined}
        />
      </RecordSection>

      <SatelliteSection
        title={appLabel('anmeldungen')}
        items={anmeldungenList.filter(r => extractRecordId(r.fields.kurs) === record.record_id)}
        map={r => ({ name: appLabel('anmeldungen'), meta: r.fields.anmeldedatum })}
        onOpen={onOpenAnmeldungen}
        onAdd={onAddAnmeldungen}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.KURSE_WORKSHOPS} recordId={record.record_id} />
    </>
  );
}
