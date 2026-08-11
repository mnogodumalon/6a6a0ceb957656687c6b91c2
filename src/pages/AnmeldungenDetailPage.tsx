import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LivingAppsService, extractRecordId } from '@/services/livingAppsService';
import type { Anmeldungen, Teilnehmer, KurseWorkshops } from '@/types/app';
import { APP_IDS } from '@/types/app';
import { Button } from '@/components/ui/button';
import { IconArrowLeft, IconTrash } from '@tabler/icons-react';
import {
  RecordView, RecordHeader, RecordKeyFacts, RecordSection, RecordField,
  RecordAttachments, RecordViewSkeleton, RecordViewEmpty,
} from '@/components/widgets/RecordView';
import { AnmeldungenDialog } from '@/components/dialogs/AnmeldungenDialog';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { AI_PHOTO_SCAN, AI_PHOTO_LOCATION } from '@/config/ai-features';
import { formEnhancements } from '@/config/form-enhancements/Anmeldungen';
import { evalComputed } from '@/config/form-enhancements/types';
import { t, appLabel, fieldLabel, localeTag, CURRENCY } from '@/i18n';

export default function AnmeldungenDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<Anmeldungen | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [teilnehmerList, setTeilnehmerList] = useState<Teilnehmer[]>([]);
  const [kurseWorkshopsList, setKurseWorkshopsList] = useState<KurseWorkshops[]>([]);

  useEffect(() => { loadData(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [id]);

  async function loadData() {
    setLoading(true);
    try {
      const [mainData, teilnehmerData, kurseWorkshopsData] = await Promise.all([
        LivingAppsService.getAnmeldungen(),
        LivingAppsService.getTeilnehmer(),
        LivingAppsService.getKurseWorkshops(),
      ]);
      setTeilnehmerList(teilnehmerData);
      setKurseWorkshopsList(kurseWorkshopsData);
      setRecord(mainData.find(r => r.record_id === id) ?? null);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(fields: Anmeldungen['fields']) {
    if (!record) return;
    await LivingAppsService.updateAnmeldungenEntry(record.record_id, fields);
    await loadData();
    setEditing(false);
  }

  async function handleDelete() {
    if (!record) return;
    await LivingAppsService.deleteAnmeldungenEntry(record.record_id);
    setDeleteOpen(false);
    navigate('/anmeldungen');
  }

  function getTeilnehmerDisplayName(url?: unknown) {
    if (!url) return '—';
    const refId = extractRecordId(url);
    return teilnehmerList.find(r => r.record_id === refId)?.fields.vorname ?? '—';
  }

  function getKurseWorkshopsDisplayName(url?: unknown) {
    if (!url) return '—';
    const refId = extractRecordId(url);
    return kurseWorkshopsList.find(r => r.record_id === refId)?.fields.titel ?? '—';
  }

  if (loading) {
    return <RecordViewSkeleton />;
  }

  if (!record) {
    return (
      <RecordViewEmpty
        title={t('not_found')}
        action={
          <Button variant="ghost" onClick={() => navigate('/anmeldungen')}>
            <IconArrowLeft className="h-4 w-4 mr-1.5" />
            {t('back')}
          </Button>
        }
      />
    );
  }

  return (
    <RecordView
      onBack={() => navigate('/anmeldungen')}
      onEdit={() => setEditing(true)}
      backLabel={t('back')}
      editLabel={t('edit_button')}
    >
      <RecordHeader title={appLabel('anmeldungen')} />

      {(() => {
        const lookupLists: Record<string, unknown> = {
          teilnehmer: teilnehmerList,
          kurs: kurseWorkshopsList,
        };
        const fmtComputed = (k: string, n: number) =>
          /(?:kosten|preis|betrag|gesamt|netto|brutto|summe|mwst|rabatt|anzahlung|umsatz|saldo)/i.test(k)
            ? n.toLocaleString(localeTag(), { style: 'currency', currency: CURRENCY, minimumFractionDigits: 2, maximumFractionDigits: 2 })
            : n.toLocaleString(localeTag(), { maximumFractionDigits: 2 });
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

      <RecordSection title={t('details')} cols={2}>
        <RecordField label={fieldLabel('anmeldungen', 'teilnehmer')} value={getTeilnehmerDisplayName(record.fields.teilnehmer)} format="text" />
        <RecordField label={fieldLabel('anmeldungen', 'kurs')} value={getKurseWorkshopsDisplayName(record.fields.kurs)} format="text" />
        <RecordField label={fieldLabel('anmeldungen', 'anmeldedatum')} value={record.fields.anmeldedatum} format="date" />
        <RecordField label={fieldLabel('anmeldungen', 'status_anmeldung')} value={record.fields.status_anmeldung} format="pill" />
        <RecordField label={fieldLabel('anmeldungen', 'bemerkungen_anmeldung')} value={record.fields.bemerkungen_anmeldung} format="longtext" className="md:col-span-2" />
      </RecordSection>

      <RecordAttachments appId={APP_IDS.ANMELDUNGEN} recordId={record.record_id} />

      <div className="flex justify-end pt-2">
        <Button variant="ghost" onClick={() => setDeleteOpen(true)} className="text-destructive hover:text-destructive">
          <IconTrash className="h-4 w-4 mr-1.5" />
          {t('delete')}
        </Button>
      </div>

      <AnmeldungenDialog
        open={editing}
        onClose={() => setEditing(false)}
        onSubmit={handleUpdate}
        defaultValues={record.fields}
        recordId={record.record_id}
        teilnehmerList={teilnehmerList}
        kurseWorkshopsList={kurseWorkshopsList}
        enablePhotoScan={AI_PHOTO_SCAN['Anmeldungen']}
        enablePhotoLocation={AI_PHOTO_LOCATION['Anmeldungen']}
      />

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title={t('delete_entity', { entity: appLabel('anmeldungen') })}
        description={t('confirm_delete_desc')}
      />
    </RecordView>
  );
}
