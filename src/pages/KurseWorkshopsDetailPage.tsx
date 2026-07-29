import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LivingAppsService, extractRecordId } from '@/services/livingAppsService';
import type { KurseWorkshops, Dozenten, Raeume } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { Button } from '@/components/ui/button';
import { IconArrowLeft, IconTrash } from '@tabler/icons-react';
import {
  RecordView, RecordHeader, RecordKeyFacts, RecordSection, RecordField,
  RecordAttachments, RecordViewSkeleton, RecordViewEmpty,
} from '@/components/widgets/RecordView';
import { KurseWorkshopsDialog } from '@/components/dialogs/KurseWorkshopsDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { AI_PHOTO_SCAN, AI_PHOTO_LOCATION } from '@/config/ai-features';
import { formEnhancements } from '@/config/form-enhancements/KurseWorkshops';
import { evalComputed } from '@/config/form-enhancements/types';

export default function KurseWorkshopsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<KurseWorkshops | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [dozentenList, setDozentenList] = useState<Dozenten[]>([]);
  const [raeumeList, setRaeumeList] = useState<Raeume[]>([]);

  useEffect(() => { loadData(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  async function loadData() {
    setLoading(true);
    try {
      const [mainData, dozentenData, raeumeData] = await Promise.all([
        LivingAppsService.getKurseWorkshops(),
        LivingAppsService.getDozenten(),
        LivingAppsService.getRaeume(),
      ]);
      setDozentenList(dozentenData);
      setRaeumeList(raeumeData);
      setRecord(mainData.find(r => r.record_id === id) ?? null);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(fields: KurseWorkshops['fields']) {
    if (!record) return;
    await LivingAppsService.updateKurseWorkshop(record.record_id, fields);
    await loadData();
    setEditing(false);
  }

  async function handleDelete() {
    if (!record) return;
    await LivingAppsService.deleteKurseWorkshop(record.record_id);
    setDeleteOpen(false);
    navigate('/kurse-&-workshops');
  }

  function getDozentenDisplayName(url?: unknown) {
    if (!url) return '—';
    const refId = extractRecordId(url);
    return dozentenList.find(r => r.record_id === refId)?.fields.vorname ?? '—';
  }

  function getRaeumeDisplayName(url?: unknown) {
    if (!url) return '—';
    const refId = extractRecordId(url);
    return raeumeList.find(r => r.record_id === refId)?.fields.raumname ?? '—';
  }

  if (loading) {
    return <RecordViewSkeleton />;
  }

  if (!record) {
    return (
      <RecordViewEmpty
        title="Eintrag nicht gefunden"
        action={
          <Button variant="ghost" onClick={() => navigate('/kurse-&-workshops')}>
            <IconArrowLeft className="h-4 w-4 mr-1.5" />
            Zurück
          </Button>
        }
      />
    );
  }

  return (
    <RecordView
      onBack={() => navigate('/kurse-&-workshops')}
      onEdit={() => setEditing(true)}
      backLabel="Zurück"
      editLabel="Bearbeiten"
    >
      <RecordHeader title={record.fields.titel ?? 'Kurse & Workshops'} />

      {(() => {
        const lookupLists: Record<string, unknown> = {
          dozent: dozentenList,
          raum: raeumeList,
        };
        const fmtComputed = (k: string, n: number) =>
          /(?:kosten|preis|betrag|gesamt|netto|brutto|summe|mwst|rabatt|anzahlung|umsatz|saldo)/i.test(k)
            ? n.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : n.toLocaleString('de-DE', { maximumFractionDigits: 2 });
        const computedFacts = Object.entries(formEnhancements.computed)
          .map(([key, formula]) => {
            const v = evalComputed(formula, record!.fields as Record<string, unknown>, { lookupLists });
            return v != null
              ? { label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '), value: fmtComputed(key, v) }
              : null;
          })
          .filter((f): f is { label: string; value: string } => f !== null);
        return computedFacts.length > 0 ? <RecordKeyFacts items={computedFacts} /> : null;
      })()}

      <RecordSection title="Details" cols={2}>
        <RecordField label="Titel" value={record.fields.titel} format="text" />
        <RecordField label="Typ" value={record.fields.kurstyp} format="pill" />
        <RecordField label="Beschreibung" value={record.fields.beschreibung} format="longtext" className="md:col-span-2" />
        <RecordField label="Niveau" value={record.fields.niveau} format="pill" />
        <RecordField label="Dozent" value={getDozentenDisplayName(record.fields.dozent)} format="text" />
        <RecordField label="Raum" value={getRaeumeDisplayName(record.fields.raum)} format="text" />
        <RecordField label="Startdatum und -uhrzeit" value={record.fields.startdatum} format="datetime" />
        <RecordField label="Enddatum und -uhrzeit" value={record.fields.enddatum} format="datetime" />
        <RecordField label="Wochentag & Uhrzeit (regelmäßig)" value={record.fields.wochentag_uhrzeit} format="text" />
        <RecordField label="Maximale Teilnehmerzahl" value={record.fields.max_teilnehmer} format="text" />
        <RecordField label="Preis (€)" value={record.fields.preis} format="text" />
        <RecordField label="Status" value={record.fields.status_kurs} format="pill" />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.KURSE_WORKSHOPS} recordId={record.record_id} />

      <div className="flex justify-end pt-2">
        <Button variant="ghost" onClick={() => setDeleteOpen(true)} className="text-destructive hover:text-destructive">
          <IconTrash className="h-4 w-4 mr-1.5" />
          Löschen
        </Button>
      </div>

      <KurseWorkshopsDialog
        open={editing}
        onClose={() => setEditing(false)}
        onSubmit={handleUpdate}
        defaultValues={record.fields}
        recordId={record.record_id}
        dozentenList={dozentenList}
        raeumeList={raeumeList}
        enablePhotoScan={AI_PHOTO_SCAN['KurseWorkshops']}
        enablePhotoLocation={AI_PHOTO_LOCATION['KurseWorkshops']}
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Kurse & Workshops löschen"
        description="Soll dieser Eintrag wirklich gelöscht werden? Diese Aktion kann nicht rückgängig gemacht werden."
      />
    </RecordView>
  );
}
