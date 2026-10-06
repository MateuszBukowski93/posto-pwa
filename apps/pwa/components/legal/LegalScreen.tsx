'use client';

import { useTranslations } from 'next-intl';
import { useLocaleInfo } from '@/components/providers/I18nProvider';
import { useSettings } from '@/components/providers/SettingsProvider';
import { BackLink } from '@/components/ui/BackLink';
import { IconInfo } from '@/components/ui/icons';
import { Notice } from '@/components/ui/layout';
import { useDocumentTitle } from '@/lib/hooks/useDocumentTitle';
import type { LegalDocuments } from '@/lib/legal/load';
import type { LegalBlock } from '@/lib/legal/markdown';

const listClass = 'm-0 flex flex-col gap-1.5 pl-5';

function Block({ block }: { block: LegalBlock }) {
  if (block.type !== 'p') {
    const List = block.type;
    return (
      <List className={`${listClass} ${block.type === 'ol' ? 'list-decimal' : 'list-disc gap-1'}`}>
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </List>
    );
  }
  if (block.note) {
    return (
      <p className="m-0 rounded-xl border-[1.5px] border-dashed border-muted px-3 py-2.5 text-[13px] text-muted">
        {block.text}
      </p>
    );
  }
  return <p className="m-0">{block.text}</p>;
}

export function LegalScreen({ documents }: { documents: LegalDocuments }) {
  const t = useTranslations('legal');
  const { locale } = useLocaleInfo();
  const { settings, loaded } = useSettings();
  const docLocale = locale === 'pl' ? 'pl' : 'en';
  const doc = documents[docLocale];
  useDocumentTitle(doc.title);

  return (
    <main
      className="mx-auto flex w-full max-w-[480px] flex-1 flex-col gap-[22px] px-5 pb-12 text-sm leading-[1.55]"
      style={{ paddingTop: 'max(16px, env(safe-area-inset-top))' }}
    >
      <BackLink fallback={loaded && settings.onboardingDone ? '/settings' : '/welcome'} label={t('back')} />

      <div lang={docLocale} className="flex flex-col gap-1.5">
        <h1 className="m-0 font-display text-[32px] leading-[1.1] font-bold tracking-[-0.03em]">{doc.title}</h1>
        <span className="text-[13px] text-muted">{doc.meta}</span>
      </div>

      {locale !== 'pl' ? (
        <Notice icon={<IconInfo size={20} className="text-water-text" />}>{t('bindingNote')}</Notice>
      ) : null}

      <div lang={docLocale} className="flex flex-col gap-[22px]">
        {doc.sections.map((section) => (
          <section
            key={section.heading}
            className={`flex flex-col ${section.highlight ? 'gap-2.5 rounded-[18px] bg-accent-soft p-4' : 'gap-2'}`}
          >
            <h2 className="m-0 font-display text-[19px] font-bold tracking-[-0.02em]">{section.heading}</h2>
            {section.blocks.map((block, i) => (
              <Block key={i} block={block} />
            ))}
          </section>
        ))}
      </div>
    </main>
  );
}
