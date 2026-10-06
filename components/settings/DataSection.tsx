'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRef, useState, type ChangeEvent } from 'react';
import { BottomSheet, SheetHeader } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { IconCheck, IconDownload, IconInfo, IconTrash, IconUpload, IconWarning } from '@/components/ui/icons';
import { ListGroup, Notice, SectionLabel } from '@/components/ui/layout';
import { STORAGE_KEYS } from '@/lib/config';
import { clearAllData, exportBackup, importBackup } from '@/lib/db/repo';
import { backupFileName, parseBackup, type BackupCounts, type BackupFile } from '@/lib/domain/backup';
import { useFormatters } from '@/lib/hooks/useFormatters';
import { ActionRow } from './rows';

type Status = { tone: 'ok' | 'error'; text: string } | null;
type Pending = { backup: BackupFile; counts: BackupCounts } | null;

function downloadJson(data: unknown, fileName: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function clearMirrors() {
  try {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
  } catch {
    // brak dostępu do storage – nic do czyszczenia
  }
}

export function DataSection() {
  const t = useTranslations('data');
  const tc = useTranslations('common');
  const format = useFormatters();
  const router = useRouter();
  const fileInput = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>(null);
  const [pending, setPending] = useState<Pending>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  const onExport = async () => {
    const now = Date.now();
    const backup = await exportBackup(now);
    downloadJson(backup, backupFileName(now));
    setStatus({ tone: 'ok', text: t('exportDone') });
  };

  const onFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const result = parseBackup(await file.text());
    if (!result.ok) {
      const key = result.error === 'json' ? 'errorJson' : result.error === 'version' ? 'errorVersion' : 'errorFormat';
      setStatus({ tone: 'error', text: t(key) });
      return;
    }
    setStatus(null);
    setPending({ backup: result.backup, counts: result.counts });
  };

  const confirmImport = async () => {
    if (!pending) return;
    setBusy(true);
    try {
      await importBackup(pending.backup);
      setPending(null);
      setStatus({ tone: 'ok', text: t('importDone') });
    } catch {
      setStatus({ tone: 'error', text: tc('error') });
      setPending(null);
    } finally {
      setBusy(false);
    }
  };

  const confirmDeleteAll = async () => {
    setBusy(true);
    try {
      await clearAllData();
      clearMirrors();
      setConfirmDelete(false);
      router.replace('/welcome');
    } finally {
      setBusy(false);
    }
  };

  const exportedAt = pending?.backup.exportedAt ? Date.parse(pending.backup.exportedAt) : NaN;

  return (
    <section aria-labelledby="data-title" className="flex flex-col gap-1.5">
      <SectionLabel id="data-title">{t('title')}</SectionLabel>
      <ListGroup>
        <ActionRow
          onClick={() => void onExport()}
          icon={<IconDownload size={20} />}
          label={t('export')}
          sub={t('exportSub')}
        />
        <ActionRow
          onClick={() => fileInput.current?.click()}
          icon={<IconUpload size={20} />}
          label={t('import')}
          sub={t('importSub')}
        />
        <ActionRow
          onClick={() => setConfirmDelete(true)}
          icon={<IconTrash size={20} />}
          label={t('deleteAll')}
          sub={t('deleteAllSub')}
          danger
          haspopup
        />
      </ListGroup>
      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        onChange={(event) => void onFile(event)}
        className="sr-only"
        tabIndex={-1}
        aria-label={t('import')}
        data-testid="import-file"
      />
      {status ? (
        <Notice
          role={status.tone === 'error' ? 'alert' : 'status'}
          tone={status.tone === 'error' ? 'accent' : 'water'}
          icon={
            status.tone === 'error' ? (
              <IconInfo size={20} className="text-accent-text" />
            ) : (
              <IconCheck size={20} className="text-water-text" />
            )
          }
        >
          {status.text}
        </Notice>
      ) : null}

      <BottomSheet open={pending !== null} onClose={() => setPending(null)} titleId="import-title">
        {pending ? (
          <>
            <SheetHeader titleId="import-title" title={t('importTitle')} description={t('importDescription')} />
            <Notice tone="neutral" icon={<IconInfo size={20} />}>
              <p className="m-0 font-bold">{t('importSummary', pending.counts)}</p>
              {Number.isFinite(exportedAt) ? (
                <p className="m-0 text-muted">{t('importExportedAt', { date: format.mediumDate(exportedAt) })}</p>
              ) : null}
            </Notice>
            <div className="grid grid-cols-2 gap-2.5">
              <Button variant="outline" onClick={() => setPending(null)}>
                {tc('cancel')}
              </Button>
              <Button aria-disabled={busy} onClick={busy ? undefined : () => void confirmImport()}>
                {t('importConfirm')}
              </Button>
            </div>
          </>
        ) : null}
      </BottomSheet>

      <BottomSheet open={confirmDelete} onClose={() => setConfirmDelete(false)} titleId="delete-all-title">
        <span
          aria-hidden="true"
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent-text"
        >
          <IconWarning size={26} />
        </span>
        <SheetHeader titleId="delete-all-title" title={t('deleteTitle')} description={t('deleteDescription')} />
        <p className="m-0 text-sm leading-[1.45] font-bold">{t('deleteHint')}</p>
        <div className="grid grid-cols-2 gap-2.5">
          <Button variant="outline" onClick={() => setConfirmDelete(false)}>
            {tc('cancel')}
          </Button>
          <Button variant="danger" aria-disabled={busy} onClick={busy ? undefined : () => void confirmDeleteAll()}>
            {t('deleteConfirm')}
          </Button>
        </div>
      </BottomSheet>
    </section>
  );
}
