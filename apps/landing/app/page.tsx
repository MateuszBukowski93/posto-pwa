import type { ReactNode } from 'react';

/** Placeholdery w nawiasach kwadratowych – jak w apps/pwa/lib/config.ts. */
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://pwa.postofasting.app/';
const APP_HOST = APP_URL.replace(/^https?:\/\//, '').replace(/\/$/, '');
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const COMPANY = '[NAZWA FIRMY]';
const EMAIL = '[E-MAIL]';
const BUY_ME_A_COFFEE = '[LINK BUY ME A COFFEE]';

const appLink = (path = '') => new URL(path, APP_URL.endsWith('/') ? APP_URL : `${APP_URL}/`).toString();

const svgProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

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

const cards: { title: string; text: string; icon: ReactNode }[] = [
  {
    title: 'Bez logowania',
    text: 'Nie zakładasz konta i nie podajesz e-maila. Otwierasz i od razu startujesz post.',
    icon: (
      <>
        <rect x="5" y="11" width="14" height="9.5" rx="2.5" />
        <path d="M8.5 11V7.5a3.5 3.5 0 0 1 6.8-1.2" />
      </>
    ),
  },
  {
    title: 'Całkowicie bezpłatna',
    text: 'Bez subskrypcji, ukrytych opłat i reklam. Wszystkie funkcje są dostępne od razu.',
    icon: (
      <>
        <rect x="4" y="9" width="16" height="11.5" rx="2" />
        <path d="M12 9v11.5M3.5 9h17M12 9C10.5 5.5 6.5 5 6.5 7.5S10 9 12 9zM12 9c1.5-3.5 5.5-4 5.5-1.5S14 9 12 9z" />
      </>
    ),
  },
  {
    title: 'Na Twój telefon',
    text: 'Instalujesz Posto prosto z przeglądarki, bez sklepu z aplikacjami. Działa na iPhonie i Androidzie.',
    icon: (
      <>
        <rect x="6.5" y="2.5" width="11" height="19" rx="2.5" />
        <path d="M12 7.5v7M9 11.5l3 3 3-3" />
      </>
    ),
  },
];

const steps = [
  ['Wybierz protokół', '16:8, 18:6, a może łagodne 13:11 na początek. Zmienisz go w każdej chwili.'],
  ['Rozpocznij post', 'Jedno stuknięcie. Zapomniałeś? Ustawisz godzinę ostatniego posiłku wstecz.'],
  ['Śledź postęp', 'Timer pokazuje czas do celu i bieżącą fazę postu, a historia buduje Twoją serię dni.'],
];

const features = [
  {
    src: 'timer',
    title: 'Timer i fazy postu',
    text: 'Czas do celu, godzina końca i faza, w której jesteś: od trawienia po ketozę.',
  },
  {
    src: 'historia',
    title: 'Historia i seria dni',
    text: 'Tydzień na wykresie, średnia długość postu i liczba dni z rzędu, która motywuje.',
  },
  {
    src: 'pomiary',
    title: 'Woda i waga',
    text: 'Szklanka po szklance do dziennego celu i trend wagi z ostatnich 30 dni.',
  },
];

const protocols: [string, number][] = [
  ['13:11', 54],
  ['14:10', 58],
  ['16:8', 67],
  ['18:6', 75],
  ['20:4', 83],
  ['23:1', 96],
];

const privacy = [
  [
    'Nic nie wysyłamy',
    'Posty, waga i woda zapisują się tylko w pamięci Twojej przeglądarki. Nie mamy do nich dostępu.',
  ],
  ['Bez plików cookies', 'Zbieramy tylko anonimowe statystyki odwiedzin, bez cookies i bez banera zgód.'],
  ['Pełna kontrola', 'Eksportujesz dane do pliku albo usuwasz je jednym przyciskiem w Ustawieniach.'],
];

const install: { os: string; steps: ReactNode[] }[] = [
  {
    os: 'iPhone',
    steps: [
      <>
        Otwórz <strong>{APP_HOST}</strong> w Safari.
      </>,
      <>
        Stuknij <strong>„Udostępnij”</strong> – kwadrat ze strzałką w górę.
      </>,
      <>
        Wybierz <strong>„Do ekranu początkowego”</strong>.
      </>,
      <>
        Stuknij <strong>„Dodaj”</strong>. Gotowe.
      </>,
    ],
  },
  {
    os: 'Android',
    steps: [
      <>
        Otwórz <strong>{APP_HOST}</strong> w Chrome.
      </>,
      <>
        Stuknij menu <strong>⋮</strong> w prawym górnym rogu.
      </>,
      <>
        Wybierz <strong>„Zainstaluj aplikację”</strong>.
      </>,
      <>
        Potwierdź <strong>„Zainstaluj”</strong>. Gotowe.
      </>,
    ],
  },
];

const faq = [
  [
    'Czy Posto jest naprawdę darmowe?',
    'Tak. Nie ma subskrypcji, płatnych funkcji ani reklam. Jeśli chcesz, możesz dobrowolnie wesprzeć rozwój aplikacji.',
  ],
  ['Czy muszę zakładać konto?', 'Nie. Posto działa bez logowania i bez podawania e-maila.'],
  [
    'Gdzie są zapisane moje dane?',
    'Wyłącznie na Twoim telefonie, w pamięci przeglądarki. Nie wysyłamy ich na serwer i nie mamy do nich dostępu.',
  ],
  [
    'Co, jeśli zmienię telefon?',
    'Wyeksportuj dane do pliku w Ustawieniach na starym telefonie i zaimportuj je na nowym.',
  ],
  [
    'Czy Posto działa na iPhonie i Androidzie?',
    'Tak, w Safari, Chrome i innych nowoczesnych przeglądarkach. Na iPhonie powiadomienia działają po dodaniu Posto do ekranu początkowego.',
  ],
  [
    'Czy post przerywany jest dla każdego?',
    'Nie. Posto nie zastępuje porady lekarza. Skonsultuj się z lekarzem, zwłaszcza jeśli jesteś w ciąży, karmisz piersią, chorujesz przewlekle, przyjmujesz leki lub nie masz ukończonych 18 lat.',
  ],
];

export default function Home() {
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
          <nav aria-label="Sekcje strony" className="nav">
            <a href="#jak-dziala">Jak działa</a>
            <a href="#funkcje">Funkcje</a>
            <a href="#instalacja">Instalacja</a>
            <a href="#faq">Pytania</a>
            <a href={APP_URL} className="nav-cta">
              Otwórz aplikację
            </a>
          </nav>
        </div>
      </header>

      <main>
        <section id="top" className="wrap hero">
          <div className="hero-copy">
            <span className="pill">Darmowa · Bez logowania · Aplikacja PWA</span>
            <h1>Post przerywany, po prostu.</h1>
            <p className="hero-lead">
              Posto to prosty timer postu przerywanego. Wybierasz protokół, startujesz post i od razu widzisz, ile
              zostało do celu i w jakiej fazie jesteś.
            </p>
            <div className="row">
              <a href={APP_URL} className="btn btn-dark">
                Otwórz Posto za darmo
              </a>
              <a href="#instalacja" className="btn btn-ghost">
                Jak zainstalować
              </a>
            </div>
            <ul className="checks">
              {['Bez konta i e-maila', 'Bez reklam', 'Dane zostają na telefonie'].map((t) => (
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
              Spalanie tłuszczu
            </div>
            <div className="chip chip-br">
              <svg width="16" height="16" viewBox="0 0 24 24" {...svgProps} stroke="#2F7FC1" strokeWidth="2.2">
                <path d="M12 3.5c3.2 3.7 5.5 6.9 5.5 9.8a5.5 5.5 0 0 1-11 0c0-2.9 2.3-6.1 5.5-9.8z" />
              </svg>
              +250 ml
            </div>
          </div>
        </section>

        <section aria-label="Najważniejsze" className="wrap cards">
          {cards.map((c) => (
            <div key={c.title} className="card">
              <span className="icon-box" aria-hidden="true">
                <svg width="26" height="26" viewBox="0 0 24 24" {...svgProps} strokeWidth="1.9">
                  {c.icon}
                </svg>
              </span>
              <h2>{c.title}</h2>
              <p className="muted">{c.text}</p>
            </div>
          ))}
        </section>

        <section id="jak-dziala" className="band">
          <div className="wrap stack">
            <h2 className="h-section">Jak to działa</h2>
            <ol className="steps">
              {steps.map(([title, text], i) => (
                <li key={title}>
                  <span className="step-no">{String(i + 1).padStart(2, '0')}</span>
                  <h3>{title}</h3>
                  <p className="muted">{text}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="funkcje" className="wrap stack" style={{ gap: 48 }}>
          <div className="intro">
            <h2 className="h-section">Wszystko, czego potrzebujesz. Nic ponad to.</h2>
            <p className="lead">Trzy ekrany, które robią swoje. Jasny i ciemny motyw do wyboru.</p>
          </div>
          <div className="features">
            {features.map((f) => (
              <div key={f.src} className="feature">
                <Screen src={f.src} alt={`Ekran aplikacji: ${f.title}`} small />
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
                Nie musisz zaczynać od <span style={{ color: '#F0784C' }}>16:8</span>.
              </h2>
              <p className="lead" style={{ color: '#C4CDC8' }}>
                Zacznij łagodnie i wydłużaj post stopniowo. Posto obsługuje sześć popularnych protokołów.
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
                  post
                </span>
                <span>
                  <span className="swatch" style={{ background: '#14273A', border: '1px solid #2B4258' }} />
                  okno jedzenia
                </span>
              </div>
            </div>
          </div>
        </section>

        <section aria-labelledby="prywatnosc-h" className="wrap privacy">
          <div className="privacy-box">
            <h2 id="prywatnosc-h">Twoje dane zostają na Twoim telefonie.</h2>
            <div className="grid-3">
              {privacy.map(([title, text]) => (
                <div key={title}>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="instalacja" className="band">
          <div className="wrap stack">
            <div className="intro">
              <h2 className="h-section">Zainstaluj w 30 sekund</h2>
              <p className="lead">
                Posto to aplikacja PWA. Instalujesz ją z przeglądarki, a potem uruchamiasz z ekranu głównego jak każdą
                inną.
              </p>
            </div>
            <div className="install-grid">
              {install.map((card) => (
                <div key={card.os} className="install-card">
                  <h3>{card.os}</h3>
                  <ol>
                    {card.steps.map((step, i) => (
                      <li key={i}>
                        <span className="num">{i + 1}</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="faq" className="faq">
          <h2 className="h-section">Częste pytania</h2>
          <div className="faq-list">
            {faq.map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </section>

        <section aria-label="Zacznij" className="wrap cta-wrap">
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
            <h2>Zacznij swój pierwszy post jeszcze dziś.</h2>
            <p>Za darmo, bez logowania, prosto z przeglądarki.</p>
            <a href={APP_URL} className="btn btn-accent">
              Otwórz Posto
            </a>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="wrap footer-inner">
          <div className="footer-brand">
            <span className="footer-name">
              Posto <small>od DeveloArt</small>
            </span>
            <span>Posto nie jest wyrobem medycznym i nie zastępuje porady lekarza.</span>
            <span>© 2026 {COMPANY}</span>
          </div>
          <nav aria-label="Stopka">
            <a href={appLink('terms/')}>Regulamin</a>
            <a href={appLink('privacy/')}>Polityka prywatności</a>
            <a href={BUY_ME_A_COFFEE}>Wesprzyj Posto</a>
            <a href={`mailto:${EMAIL}`}>Kontakt</a>
          </nav>
        </div>
      </footer>
    </>
  );
}
