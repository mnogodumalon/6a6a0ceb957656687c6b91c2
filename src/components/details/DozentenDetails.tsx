import type { Dozenten, KurseWorkshops } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  RecordSection, RecordField, RecordRelation, RecordAttachments,
} from '@/components/widgets/RecordView';
import { SatelliteSection } from '@/components/SatelliteSection';

export interface DozentenDetailsProps {
  /** Der Record — enriched oder roh; alle Felder werden hier gerendert. */
  record: Dozenten;
  /** 1:N „Kurse & Workshops": VOLLE Liste — der Block filtert auf diesen Record. */
  kurseWorkshopsList: KurseWorkshops[];
  /** Zeilen-Klick → overlay.push auf das KurseWorkshops-Detail (nie der Edit-Dialog). */
  onOpenKurseWorkshops: (record: KurseWorkshops) => void;
  /** Kontextuelles „+": öffnet den KurseWorkshops-Dialog mit diesem Record vorgesetzt. */
  onAddKurseWorkshops: () => void;
}

export function DozentenDetails({
  record,
  kurseWorkshopsList,
  onOpenKurseWorkshops,
  onAddKurseWorkshops,
}: DozentenDetailsProps) {
  return (
    <>
      <RecordSection title="Details" cols={2}>
        <RecordField label="Vorname" value={record.fields.vorname} format="text" />
        <RecordField label="Nachname" value={record.fields.nachname} format="text" />
        <RecordField label="E-Mail-Adresse" value={record.fields.email} format="email" />
        <RecordField label="Telefonnummer" value={record.fields.telefon} format="text" />
        <RecordField label="Fachbereiche / Instrumente" value={Array.isArray(record.fields.fachbereiche) ? record.fields.fachbereiche.map((v: unknown) => (v && typeof v === 'object' && 'label' in v) ? (v as {label: unknown}).label : v).join(', ') : null} format="text" />
        <RecordField label="Qualifikationen" value={record.fields.qualifikationen} format="longtext" className="md:col-span-2" />
        <RecordField label="Beschäftigungsart" value={record.fields.beschaeftigungsart} format="pill" />
        <RecordField label="Eintrittsdatum" value={record.fields.eintrittsdatum} format="date" />
        <RecordField label="Bemerkungen" value={record.fields.bemerkungen_dozent} format="longtext" className="md:col-span-2" />
      </RecordSection>

      <SatelliteSection
        title="Kurse & Workshops"
        items={kurseWorkshopsList.filter(r => extractRecordId(r.fields.dozent) === record.record_id)}
        map={r => ({ name: r.fields.titel ?? 'Kurse & Workshops', meta: r.fields.startdatum })}
        onOpen={onOpenKurseWorkshops}
        onAdd={onAddKurseWorkshops}
        getKey={r => r.record_id}
      />

      <RecordAttachments appId={APP_IDS.DOZENTEN} recordId={record.record_id} />
    </>
  );
}
