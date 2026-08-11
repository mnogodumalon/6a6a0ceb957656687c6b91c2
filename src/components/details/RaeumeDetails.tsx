import type { Raeume, KurseWorkshops } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { t, appLabel, fieldLabel } from '@/i18n';
import { SatelliteSection } from '@/components/SatelliteSection';

export interface RaeumeDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Raeume;
  /** 1:N „Kurse & Workshops": VOLLE Liste — der Block filtert auf diesen Record. */
  kurseWorkshopsList: KurseWorkshops[];
  /** Zeilen-Klick → overlay.push auf das KurseWorkshops-Detail (nie der Edit-Dialog). */
  onOpenKurseWorkshops: (record: KurseWorkshops) => void;
  /** Kontextuelles „+": öffnet den KurseWorkshops-Dialog mit diesem Record vorgesetzt. */
  onAddKurseWorkshops: () => void;
}

export function RaeumeDetails({
  record,
  kurseWorkshopsList,
  onOpenKurseWorkshops,
  onAddKurseWorkshops,
}: RaeumeDetailsProps) {
  return (
    <>
      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('raeume', 'raumname')} value={record.fields.raumname} format="text" />
        <RecordField label={fieldLabel('raeume', 'raumnummer')} value={record.fields.raumnummer} format="text" />
        <RecordField label={fieldLabel('raeume', 'etage')} value={record.fields.etage} format="text" />
        <RecordField label={fieldLabel('raeume', 'kapazitaet')} value={record.fields.kapazitaet} format="text" />
        <RecordField label={fieldLabel('raeume', 'ausstattung')} value={Array.isArray(record.fields.ausstattung) ? record.fields.ausstattung.map((v: unknown) => (v && typeof v === 'object' && 'label' in v) ? (v as {label: unknown}).label : v).join(', ') : null} format="text" />
        <RecordField label={fieldLabel('raeume', 'bemerkungen_raum')} value={record.fields.bemerkungen_raum} format="longtext" className="md:col-span-2" />
        <RecordField label={fieldLabel('raeume', 'verfuegbar')} value={record.fields.verfuegbar} format="bool" />
      </RecordSection>

      <SatelliteSection
        title={appLabel('kurse_workshops')}
        items={kurseWorkshopsList.filter(r => extractRecordId(r.fields.raum) === record.record_id)}
        map={r => ({ name: r.fields.titel ?? appLabel('kurse_workshops'), meta: r.fields.startdatum })}
        onOpen={onOpenKurseWorkshops}
        onAdd={onAddKurseWorkshops}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.RAEUME} recordId={record.record_id} />
    </>
  );
}
