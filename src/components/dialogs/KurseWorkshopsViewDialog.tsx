import type { KurseWorkshops, Dozenten, Raeume } from '@/types/app';
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

interface KurseWorkshopsViewDialogProps {
  open: boolean;
  onClose: () => void;
  record: KurseWorkshops | null;
  onEdit: (record: KurseWorkshops) => void;
  dozentenList: Dozenten[];
  raeumeList: Raeume[];
}

export function KurseWorkshopsViewDialog({ open, onClose, record, onEdit, dozentenList, raeumeList }: KurseWorkshopsViewDialogProps) {
  function getDozentenDisplayName(url?: unknown) {
    if (!url) return '—';
    const id = extractRecordId(url);
    return dozentenList.find(r => r.record_id === id)?.fields.vorname ?? '—';
  }

  function getRaeumeDisplayName(url?: unknown) {
    if (!url) return '—';
    const id = extractRecordId(url);
    return raeumeList.find(r => r.record_id === id)?.fields.raumname ?? '—';
  }

  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('view_entity', { entity: appLabel('kurse_workshops') })}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-end">
          <Button size="sm" onClick={() => { onClose(); onEdit(record); }}>
            <IconPencil className="h-3.5 w-3.5 mr-1.5" />
            {t('edit_button')}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('kurse_workshops', 'titel')}</Label>
            <p className="text-sm">{record.fields.titel ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('kurse_workshops', 'kurstyp')}</Label>
            <Badge variant="secondary">{lookupLabel('kurse_workshops', 'kurstyp', record.fields.kurstyp?.key) ?? record.fields.kurstyp?.label ?? '—'}</Badge>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('kurse_workshops', 'beschreibung')}</Label>
            <p className="text-sm whitespace-pre-wrap">{record.fields.beschreibung ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('kurse_workshops', 'niveau')}</Label>
            <Badge variant="secondary">{lookupLabel('kurse_workshops', 'niveau', record.fields.niveau?.key) ?? record.fields.niveau?.label ?? '—'}</Badge>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('kurse_workshops', 'dozent')}</Label>
            <p className="text-sm">{getDozentenDisplayName(record.fields.dozent)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('kurse_workshops', 'raum')}</Label>
            <p className="text-sm">{getRaeumeDisplayName(record.fields.raum)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('kurse_workshops', 'startdatum')}</Label>
            <p className="text-sm">{formatDate(record.fields.startdatum)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('kurse_workshops', 'enddatum')}</Label>
            <p className="text-sm">{formatDate(record.fields.enddatum)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('kurse_workshops', 'wochentag_uhrzeit')}</Label>
            <p className="text-sm">{record.fields.wochentag_uhrzeit ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('kurse_workshops', 'max_teilnehmer')}</Label>
            <p className="text-sm">{record.fields.max_teilnehmer ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('kurse_workshops', 'preis')}</Label>
            <p className="text-sm">{record.fields.preis ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('kurse_workshops', 'status_kurs')}</Label>
            <Badge variant="secondary">{lookupLabel('kurse_workshops', 'status_kurs', record.fields.status_kurs?.key) ?? record.fields.status_kurs?.label ?? '—'}</Badge>
          </div>
          <div className="pt-2 border-t border-border">
            <AttachmentsSection appId={APP_IDS.KURSE_WORKSHOPS} recordId={record.record_id} readOnly />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}