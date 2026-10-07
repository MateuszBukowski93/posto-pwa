import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslations } from 'use-intl';
import { useColors } from '@/components/providers/ThemeProvider';
import { ErrorLine, SheetActions } from '@/components/timer/FastSheets';
import { BottomSheet, SheetHeader } from '@/components/ui/BottomSheet';
import { IconCheck, IconDownload, IconInfo, IconTrash, IconUpload, IconWarning } from '@/components/ui/icons';
import { ListGroup, Notice, SectionLabel } from '@/components/ui/layout';
import { Text } from '@/components/ui/Text';
import { clearAllData, exportBackup, importBackup } from '@/lib/db/repo';
import { backupFileName, parseBackup, type BackupCounts, type BackupFile } from '@/lib/domain/backup';
import { useFormatters } from '@/lib/hooks/useFormatters';
import { ActionRow } from './rows';

type Status = { tone: 'ok' | 'error'; text: string } | null;
type Pending = { backup: BackupFile; counts: BackupCounts } | null;

/**
 * Eksport (plik JSON przez systemowe „Udostępnij”: Pliki, Dysk, mail…), import z pliku
 * (ten sam format co w wersji PWA) i usunięcie wszystkich danych.
 */
export function DataSection() {
  const t = useTranslations('data');
  const tc = useTranslations('common');
  const format = useFormatters();
  const colors = useColors();
  const [status, setStatus] = useState<Status>(null);
  const [pending, setPending] = useState<Pending>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  const onExport = async () => {
    setStatus(null);
    try {
      if (!(await Sharing.isAvailableAsync())) {
        setStatus({ tone: 'error', text: t('exportUnavailable') });
        return;
      }
      const now = Date.now();
      const backup = await exportBackup(now);
      const file = new File(Paths.cache, backupFileName(now));
      file.create({ overwrite: true });
      file.write(JSON.stringify(backup, null, 2));
      await Sharing.shareAsync(file.uri, {
        mimeType: 'application/json',
        UTI: 'public.json',
        dialogTitle: t('export'),
      });
    } catch {
      setStatus({ tone: 'error', text: tc('error') });
    }
  };

  const onImport = async () => {
    setStatus(null);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/json', 'text/plain', 'application/octet-stream'],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const parsed = parseBackup(await new File(result.assets[0].uri).text());
      if (!parsed.ok) {
        const key = parsed.error === 'json' ? 'errorJson' : parsed.error === 'version' ? 'errorVersion' : 'errorFormat';
        setStatus({ tone: 'error', text: t(key) });
        return;
      }
      setPending({ backup: parsed.backup, counts: parsed.counts });
    } catch {
      setStatus({ tone: 'error', text: tc('error') });
    }
  };

  const confirmImport = async () => {
    if (!pending) return;
    setBusy(true);
    try {
      await importBackup(pending.backup);
      setStatus({ tone: 'ok', text: t('importDone') });
    } catch {
      setStatus({ tone: 'error', text: tc('error') });
    } finally {
      setPending(null);
      setBusy(false);
    }
  };

  const confirmDeleteAll = async () => {
    setBusy(true);
    setDeleteError(false);
    try {
      // Po usunięciu onboarding znów jest nieukończony – router sam przejdzie do Powitania.
      await clearAllData();
      setConfirmDelete(false);
    } catch {
      setDeleteError(true);
    } finally {
      setBusy(false);
    }
  };

  const exportedAt = pending?.backup.exportedAt ? Date.parse(pending.backup.exportedAt) : NaN;

  return (
    <View style={styles.section}>
      <SectionLabel>{t('title')}</SectionLabel>
      <ListGroup>
        <ActionRow
          onPress={() => void onExport()}
          icon={<IconDownload size={20} color={colors.muted} />}
          label={t('export')}
          sub={t('exportSub')}
        />
        <ActionRow
          onPress={() => void onImport()}
          icon={<IconUpload size={20} color={colors.muted} />}
          label={t('import')}
          sub={t('importSub')}
        />
        <ActionRow
          onPress={() => setConfirmDelete(true)}
          icon={<IconTrash size={20} color={colors.accentText} />}
          label={t('deleteAll')}
          sub={t('deleteAllSub')}
          danger
        />
      </ListGroup>
      {status ? (
        <Notice
          live={status.tone === 'error' ? 'assertive' : 'polite'}
          tone={status.tone === 'error' ? 'accent' : 'water'}
          icon={
            status.tone === 'error' ? (
              <IconInfo size={20} color={colors.accentText} />
            ) : (
              <IconCheck size={20} color={colors.waterText} />
            )
          }
        >
          {status.text}
        </Notice>
      ) : null}

      <BottomSheet open={pending !== null} onClose={() => setPending(null)}>
        {pending ? (
          <>
            <SheetHeader title={t('importTitle')} description={t('importDescription')} />
            <Notice tone="neutral" icon={<IconInfo size={20} />}>
              <Text size={13} weight="bold" leading={1.45}>
                {t('importSummary', pending.counts)}
              </Text>
              {Number.isFinite(exportedAt) ? (
                <Text size={13} leading={1.45} color="muted">
                  {t('importExportedAt', { date: format.mediumDate(exportedAt) })}
                </Text>
              ) : null}
            </Notice>
            <SheetActions
              onCancel={() => setPending(null)}
              onSave={() => void confirmImport()}
              saveLabel={t('importConfirm')}
              disabled={busy}
            />
          </>
        ) : null}
      </BottomSheet>

      <BottomSheet open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <View style={[styles.warning, { backgroundColor: colors.accentSoft }]}>
          <IconWarning size={26} color={colors.accentText} />
        </View>
        <SheetHeader title={t('deleteTitle')} description={t('deleteDescription')} />
        <Text size={14} weight="bold" leading={1.45}>
          {t('deleteHint')}
        </Text>
        {deleteError ? <ErrorLine>{tc('error')}</ErrorLine> : null}
        <SheetActions
          onCancel={() => setConfirmDelete(false)}
          onSave={() => void confirmDeleteAll()}
          saveLabel={t('deleteConfirm')}
          disabled={busy}
          danger
        />
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 6 },
  warning: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
