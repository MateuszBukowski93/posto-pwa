import type { ReactNode } from 'react';
import { APP_HOST, APP_URL, BASE, BUY_ME_A_COFFEE, COMPANY, EMAIL } from '@/lib/config';
import { type Dict, type Locale } from '@/lib/dictionaries';
import { LanguageMenu } from './LanguageMenu';

const svgProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

/** Ikony kart „Najważniejsze” – kolejność jak w `dict.cards`. */
const cardIcons: ReactNode[] = [
  <>
    <rect x="5" y="11" width="14" height="9.5" rx="2.5" />
    <path d="M8.5 11V7.5a3.5 3.5 0 0 1 6.8-1.2" />
  </>,
  <>
    <rect x="4" y="9" width="16" height="11.5" rx="2" />
    <path d="M12 9v11.5M3.5 9h17M12 9C10.5 5.5 6.5 5 6.5 7.5S10 9 12 9zM12 9c1.5-3.5 5.5-4 5.5-1.5S14 9 12 9z" />
  </>,
  <>
    <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
    <path d="M12 7.5v7M9 11.5l3 3 3-3" />
  </>,
];

/** Pliki ekranów w `public/screens` – kolejność jak w `dict.features.items`. */
const featureScreens = ['timer', 'historia', 'pomiary'];

const protocols: [string, number][] = [
  ['13:11', 54],
  ['14:10', 58],
  ['16:8', 67],
  ['18:6', 75],
  ['20:4', 83],
  ['23:1', 96],
];

/** `**tekst**` → <strong>, a w trybie `accent` – akcent kolorem (nagłówki). */
function Rich({ text, accent }: { text: string; accent?: boolean }) {
  return text.split('**').map((part, i) => {
    if (i % 2 === 0) return part;
    return accent ? (
      <span key={i} style={{ color: '#F0784C' }}>
        {part}
      </span>
    ) : (
      <strong key={i}>{part}</strong>
    );
  });
}

function Check() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" {...svgProps} stroke="#B0441C" strokeWidth="2.6" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

function Screen({ src, alt, small }: { src: string; alt: string; small?: boolean }) {
  return (
    <div className={small ? 'phone phone-sm' : 'phone'}>
      {/* eslint-disable-next-line @next/next/no-img-element -- statyczny eksport, obraz już w docelowym rozmiarze */}
      <img src={`${BASE}/screens/${src}.png`} alt={alt} loading={small ? 'lazy' : 'eager'} />
    </div>
  );
}

export function LandingPage({ lang, dict }: { lang: Locale; dict: Dict }) {
  const withHost = (text: string) => text.replace('{host}', APP_HOST);
  const install = [
    { os: 'iPhone', steps: dict.install.ios },
    { os: 'Android', steps: dict.install.android },
  ];

  return (
    <>
      <header className="header">
        <div className="wrap header-inner">
          <a href="#top" className="logo">
            <svg width="30" height="30" viewBox="0 0 44 44" aria-hidden="true">
              <circle cx="22" cy="22" r="16" fill="none" stroke="#E3E8E4" strokeWidth="7" />
              <circle
                cx="22"
                cy="22"
                r="16"
                fill="none"
                stroke="#E8673A"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray="100.53"
                strokeDashoffset="28.15"
                transform="rotate(-90 22 22)"
              />
            </svg>
            Posto
          </a>
          <nav aria-label={dict.aria.sections} className="nav">
            <a href="#jak-dziala">{dict.nav.how}</a>
            <a href="#funkcje">{dict.nav.features}</a>
            <a href="#instalacja">{dict.nav.install}</a>
            <a href="#faq">{dict.nav.faq}</a>
            <a href={APP_URL} className="nav-cta">
              {dict.nav.open}
            </a>
          </nav>
          <LanguageMenu lang={lang} label={dict.aria.language} />
        </div>
      </header>

      <main>
        <section id="top" className="wrap hero">
          <div className="hero-copy">
            <span className="pill">{dict.hero.pill}</span>
            <h1>{dict.hero.title}</h1>
            <p className="hero-lead">{dict.hero.lead}</p>
            <div className="row">
              <a href={APP_URL} className="btn btn-dark">
                {dict.hero.cta}
              </a>
              <a href="#instalacja" className="btn btn-ghost">
                {dict.hero.howInstall}
              </a>
            </div>
            <ul className="checks">
              {dict.hero.checks.map((t) => (
                <li key={t}>
                  <Check />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="hero-visual" aria-hidden="true">
            <svg viewBox="0 0 600 600" className="hero-ring">
              <circle cx="300" cy="300" r="250" fill="none" stroke="#FBE4DA" strokeWidth="60" />
              <circle
                cx="300"
                cy="300"
                r="250"
                fill="none"
                stroke="#E8673A"
                strokeWidth="60"
                strokeLinecap="round"
                strokeDasharray="1570.8"
                strokeDashoffset="440"
                transform="rotate(-90 300 300)"
              />
            </svg>
            <Screen src="timer" alt="" />
            <div className="chip chip-tl">
              <span className="dot" />
              {dict.hero.chipFat}
            </div>
            <div className="chip chip-br">
              <svg width="16" height="16" viewBox="0 0 24 24" {...svgProps} stroke="#2F7FC1" strokeWidth="2.2">
                <path d="M12 3.5c3.2 3.7 5.5 6.9 5.5 9.8a5.5 5.5 0 0 1-11 0c0-2.9 2.3-6.1 5.5-9.8z" />
              </svg>
              {dict.hero.chipWater}
            </div>
          </div>
        </section>

        <section aria-label={dict.aria.highlights} className="wrap cards">
          {dict.cards.map((c, i) => (
            <div key={c.title} className="card">
              <span className="icon-box" aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 24 24" {...svgProps} strokeWidth="1.9">
                  {cardIcons[i]}
                </svg>
              </span>
              <h2>{c.title}</h2>
              <p className="muted">{c.text}</p>
            </div>
          ))}
        </section>

        <section id="jak-dziala" className="band">
          <div className="wrap stack">
            <h2 className="h-section">{dict.how.title}</h2>
            <ol className="steps">
              {dict.how.steps.map((step, i) => (
                <li key={step.title}>
                  <span className="step-no">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{step.title}</h3>
                  <p className="muted">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="funkcje" className="wrap stack" style={{ gap: 48 }}>
          <div className="intro">
            <h2 className="h-section">{dict.features.title}</h2>
            <p className="lead">{dict.features.lead}</p>
          </div>
          <div className="features">
            {dict.features.items.map((f, i) => (
              <div key={f.title} className="feature">
                <Screen src={featureScreens[i]} alt={dict.features.screenAlt.replace('{title}', f.title)} small />
                <div className="feature-text">
                  <h3>{f.title}</h3>
                  <p className="muted">{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="protokoly-h" className="protocols">
          <div className="wrap protocols-inner">
            <div className="intro" style={{ gap: 16 }}>
              <h2 id="protokoly-h" className="h-section">
                <Rich text={dict.protocols.title} accent />
              </h2>
              <p className="lead" style={{ color: '#C4CDC8' }}>
                {dict.protocols.lead}
              </p>
            </div>
            <div className="bars">
              {protocols.map(([name, pct]) => (
                <div key={name} className="bar-row">
                  <span>{name}</span>
                  <div className="bar">
                    <div style={{ width: `${pct}%` }} />
                  </div>
                </div>
              ))}
              <div className="legend">
                <span>
                  <span className="swatch" style={{ background: '#F0784C' }} />
                  {dict.protocols.legendFast}
                </span>
                <span>
                  <span className="swatch" style={{ background: '#14273A', border: '1px solid #2B4258' }} />
                  {dict.protocols.legendWindow}
                </span>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="prywatnosc-h" className="wrap privacy">
          <div className="privacy-box">
            <h2 id="prywatnosc-h">{dict.privacy.title}</h2>
            <div className="grid-3">
              {dict.privacy.items.map((item) => (
                <div key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="instalacja" className="band">
          <div className="wrap stack">
            <div className="intro">
              <h2 className="h-section">{dict.install.title}</h2>
              <p className="lead">{dict.install.lead}</p>
            </div>
            <div className="install-grid">
              {install.map((card) => (
                <div key={card.os} className="install-card">
                  <h3>{card.os}</h3>
                  <ol>
                    {card.steps.map((step, i) => (
                      <li key={i}>
                        <span className="num">{i + 1}</span>
                        <span>
                          <Rich text={withHost(step)} />
                        </span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="faq">
          <h2 className="h-section">{dict.faq.title}</h2>
          <div className="faq-list">
            {dict.faq.items.map(({ q, a }) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section aria-label={dict.aria.start} className="wrap cta-wrap">
          <div className="cta">
            <svg viewBox="0 0 400 400" aria-hidden="true">
              <circle cx="200" cy="200" r="150" fill="none" stroke="#232C28" strokeWidth="44" />
              <circle
                cx="200"
                cy="200"
                r="150"
                fill="none"
                stroke="#F0784C"
                strokeWidth="44"
                strokeLinecap="round"
                strokeDasharray="942.48"
                strokeDashoffset="264"
                transform="rotate(-90 200 200)"
              />
            </svg>
            <h2>{dict.cta.title}</h2>
            <p>{dict.cta.text}</p>
            <a href={APP_URL} className="btn btn-accent">
              {dict.cta.button}
            </a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap footer-inner">
          <div className="footer-brand">
            <span className="footer-name">
              Posto <small>{dict.footer.madeBy}</small>
            </span>
            <span>{dict.footer.disclaimer}</span>
            <span>
              {dict.footer.copyright} {COMPANY}
            </span>
          </div>
          <nav aria-label={dict.aria.footer}>
            <a href={`${BASE}/terms/`}>{dict.footer.terms}</a>
            <a href={`${BASE}/privacy-policy/`}>{dict.footer.privacy}</a>
            <a href={BUY_ME_A_COFFEE}>{dict.footer.support}</a>
            <a href={`mailto:${EMAIL}`}>{dict.footer.contact}</a>
          </nav>
        </div>
      </footer>
    </>
  );
}
