import type { Zahlungen, Anmeldungen } from '@/types/app';
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

interface ZahlungenViewDialogProps {
  open: boolean;
  onClose: () => void;
  record: Zahlungen | null;
  onEdit: (record: Zahlungen) => void;
  anmeldungenList: Anmeldungen[];
}

export function ZahlungenViewDialog({ open, onClose, record, onEdit, anmeldungenList }: ZahlungenViewDialogProps) {
  function getAnmeldungenDisplayName(url?: unknown) {
    if (!url) return '—';
    const id = extractRecordId(url);
    return anmeldungenList.find(r => r.record_id === id)?.fields.bemerkungen_anmeldung ?? '—';
  }

  if (!record) return null;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t('view_entity', { entity: appLabel('zahlungen') })}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-end">
          <Button size="sm" onClick={() => { onClose(); onEdit(record); }}>
            <IconPencil className="h-3.5 w-3.5 mr-1.5" />
            {t('edit_button')}
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('zahlungen', 'anmeldung')}</Label>
            <p className="text-sm">{getAnmeldungenDisplayName(record.fields.anmeldung)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('zahlungen', 'rechnungsnummer')}</Label>
            <p className="text-sm">{record.fields.rechnungsnummer ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('zahlungen', 'betrag')}</Label>
            <p className="text-sm">{record.fields.betrag ?? '—'}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('zahlungen', 'zahlungsdatum')}</Label>
            <p className="text-sm">{formatDate(record.fields.zahlungsdatum)}</p>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('zahlungen', 'zahlungsart')}</Label>
            <Badge variant="secondary">{lookupLabel('zahlungen', 'zahlungsart', record.fields.zahlungsart?.key) ?? record.fields.zahlungsart?.label ?? '—'}</Badge>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('zahlungen', 'zahlungsstatus')}</Label>
            <Badge variant="secondary">{lookupLabel('zahlungen', 'zahlungsstatus', record.fields.zahlungsstatus?.key) ?? record.fields.zahlungsstatus?.label ?? '—'}</Badge>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">{fieldLabel('zahlungen', 'notizen_zahlung')}</Label>
            <p className="text-sm whitespace-pre-wrap">{record.fields.notizen_zahlung ?? '—'}</p>
          </div>
          <div className="pt-2 border-t border-border">
            <AttachmentsSection appId={APP_IDS.ZAHLUNGEN} recordId={record.record_id} readOnly />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}