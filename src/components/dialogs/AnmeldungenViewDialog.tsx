import type { Anmeldungen, Teilnehmer, KurseWorkshops } from '@/types/app';
import { extractRecordId } from '@/services/livingAppsService';
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { APP_IDS } from '@/types/app';
import { AttachmentsSection } from '@/components/AttachmentsSection';
import { Badge } from '@/components/ui/badge';
import { IconPencil } from '@tabler/icons-react';
import { t, appLabel, fieldLabel, lookupLabel, dateFnsLocale, dateFormat } from '@/i18n';
import { format, parseISO } from 'date-fns';

function formatDate(d?: string) {
  if (!d) return '—';
  try { return format(parseISO(d), dateFormat(), { locale: dateFnsLocale() }); } catch { return d; }
}

interface AnmeldungenViewDialogProps {
  open: boolean;
  onClose: () => void;
  record: Anmeldungen | null;
  onEdit: (record: Anmeldungen) => void;
  teilnehmerList: Teilnehmer[];
  kurseWorkshopsList: KurseWorkshops[];
}

export function AnmeldungenViewDialog({ open, onClose, record, onEdit, teilnehmerList, kurseWorkshopsList }: AnmeldungenViewDialogProps) {
  function getTeilnehmerDisplayName(url?: unknown) {
    if (!url) return '—';
    const id = extractRecordId(url);
    return teilnehmerList.find(r => r.record_id === id)?.fields.vorname ?? '—';
  }

  function getKurseWorkshopsDisplayName(url?: unknown) {
    if (!url) return '—';
    const id = extractRecordId(url);
    return kurseWorkshopsList.find(r => r.record_id === id)?.fields.titel ?? '—';
  }

  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('view_entity', { entity: appLabel('anmeldungen') })}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-end">
          <Button size="sm" onClick={() => { onClose(); onEdit(record); }}>
            <IconPencil className="h-3.5 w-3.5 mr-1.5" />
            {t('edit_button')}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('anmeldungen', 'teilnehmer')}</Label>
            <p className="text-sm">{getTeilnehmerDisplayName(record.fields.teilnehmer)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('anmeldungen', 'kurs')}</Label>
            <p className="text-sm">{getKurseWorkshopsDisplayName(record.fields.kurs)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('anmeldungen', 'anmeldedatum')}</Label>
            <p className="text-sm">{formatDate(record.fields.anmeldedatum)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('anmeldungen', 'status_anmeldung')}</Label>
            <Badge variant="secondary">{lookupLabel('anmeldungen', 'status_anmeldung', record.fields.status_anmeldung?.key) ?? record.fields.status_anmeldung?.label ?? '—'}</Badge>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('anmeldungen', 'bemerkungen_anmeldung')}</Label>
            <p className="text-sm whitespace-pre-wrap">{record.fields.bemerkungen_anmeldung ?? '—'}</p>
          </div>
          <div className="pt-2 border-t border-border">
            <AttachmentsSection appId={APP_IDS.ANMELDUNGEN} recordId={record.record_id} readOnly />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}