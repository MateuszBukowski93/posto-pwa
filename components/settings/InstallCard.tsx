'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { IconDownload } from '@/components/ui/icons';
import { useInstallPrompt, useIsStandalone } from '@/lib/pwa/install';

/** Karta „Zainstaluj Posto” – ukryta, gdy aplikacja działa jako zainstalowana. */
export function InstallCard() {
  const t = useTranslations('settings');
  const router = useRouter();
  const standalone = useIsStandalone();
  const { canPrompt, promptInstall } = useInstallPrompt();

  if (standalone !== false) return null;

  const onInstall = async () => {
    // Android/desktop: natywny prompt; iOS i przeglądarki bez promptu: instrukcja.
    if (canPrompt) await promptInstall();
    else router.push('/install');
  };

  return (
    <section
      aria-labelledby="install-card-title"
      className="flex items-center gap-3.5 rounded-[18px] bg-accent-soft py-3.5 pr-3.5 pl-4"
    >
      <span
        aria-hidden="true"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-white"
      >
        <IconDownload size={22} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-px">
        <h2 id="install-card-title" className="m-0 text-sm font-bold">
          {t('installTitle')}
        </h2>
        <span className="text-xs leading-[1.35] text-muted">{t('installText')}</span>
      </div>
      <button
        type="button"
        onClick={() => void onInstall()}
        className="min-h-11 shrink-0 rounded-[14px] border-none bg-btn px-4 font-sans text-sm font-bold text-btn-text"
      >
        {t('installButton')}
      </button>
    </section>
  );
}
