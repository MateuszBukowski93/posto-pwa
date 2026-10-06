# Posto

Lekka aplikacja PWA do postu przerywanego: timer postu i okna jedzenia, fazy postu, historia i statystyki, waga i woda.
Bez logowania i bez backendu – wszystkie dane zostają na urządzeniu (IndexedDB).

**Wersja na żywo:** https://mateuszbukowski93.github.io/posto-pwa/

Specyfikacja produktu: [`docs/SPEC.md`](docs/SPEC.md). Makiety (źródło prawdy dla wyglądu): [`design/`](design/).

**Aplikacja mobilna (iOS i Android):** natywna wersja w React Native + Expo jest w katalogu [`mobile/`](mobile/)
(osobny projekt z własnymi zależnościami, testami i workflow CI – zob. [`mobile/README.md`](mobile/README.md)).

## Stack

- Next.js 16 (App Router, statyczny eksport `output: 'export'`), React 19, TypeScript (strict)
- Tailwind CSS 4 – tokeny kolorów jako zmienne CSS, motyw przez `data-theme` na `<html>`
- `next/font`: Bricolage Grotesque (nagłówki, cyfry) i Manrope (tekst)
- Dexie + `dexie-react-hooks` (IndexedDB), cała warstwa danych w `lib/db`
- next-intl bez routingu językowego (język z ustawień albo `navigator.languages`), 8 języków w `messages/`
- Własny service worker generowany po buildzie (`scripts/generate-sw.mjs`) – precache całej aplikacji, działa offline
- Vitest (logika domenowa, Dexie na `fake-indexeddb`, spójność tłumaczeń) i Playwright (E2E)

## Uruchomienie

Wymagany Node.js 22+ (CI używa 24).

```bash
npm install
npm run dev          # http://localhost:3000 (bez service workera)
```

Build produkcyjny i podgląd tak jak na GitHub Pages:

```bash
NEXT_PUBLIC_BASE_PATH=/posto-pwa npm run build
NEXT_PUBLIC_BASE_PATH=/posto-pwa npm start   # http://localhost:4173/posto-pwa/
```

| Skrypt              | Opis                                                   |
| ------------------- | ------------------------------------------------------ |
| `npm run build`     | `next build` (eksport do `out/`) + generowanie `sw.js` |
| `npm start`         | serwer statyczny dla `out/` z obsługą ścieżki bazowej  |
| `npm run lint`      | ESLint                                                 |
| `npm run typecheck` | typy tras Next + `tsc --noEmit`                        |
| `npm test`          | testy Vitest                                           |
| `npm run test:e2e`  | testy Playwright (wymaga wcześniejszego buildu)        |
| `npm run format`    | Prettier                                               |
| `npm run icons`     | ponowne wygenerowanie ikon PWA i favicony              |

Przed pierwszym uruchomieniem E2E: `npx playwright install chromium`.

## Wdrożenie (GitHub Pages + GitHub Actions)

Workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) uruchamia się przy każdym pushu na `main` (oraz
`master`), przy pull requestach i ręcznie:

1. **build** – `npm ci`, Prettier, ESLint, typecheck, Vitest, `npm run build` ze ścieżką bazową z `actions/configure-pages`
   (`/posto-pwa`) i adresem aplikacji (`NEXT_PUBLIC_APP_URL`);
2. **e2e** – Playwright na zbudowanym `out/`;
3. **deploy** – publikacja na GitHub Pages (tylko push/ręczne uruchomienie, po zielonych testach).

W ustawieniach repozytorium (Settings → Pages) źródłem musi być **GitHub Actions** – jest już ustawione.
Przy własnej domenie ścieżka bazowa zmieni się automatycznie na pustą.

## Struktura

```
app/                 trasy (grupa (main) z dolną nawigacją), manifest, ikony, layout z fontami i skryptem motywu
components/          ekrany i komponenty UI (BottomSheet, Ring, WeekChart, SegmentedControl, Switch…)
lib/domain/          czyste funkcje: protokoły, fazy, czas (DST), serie i statystyki, woda, waga, plan powiadomień, kopia
lib/db/              Dexie: schemat (wersjonowany) i jedyna warstwa zapisu
lib/notifications/   NotificationScheduler (etap 1: lokalne powiadomienia z service workera)
lib/pwa/             install prompt, wykrywanie trybu standalone i platformy
messages/            komunikaty: pl (bazowy), en, de, es, fr, it, pt, uk
content/legal/       Regulamin i Polityka prywatności (pl, en) w Markdown
scripts/             generator service workera, ikon, serwer statyczny
e2e/                 testy Playwright
design/              makiety referencyjne (nie są częścią buildu)
mobile/              aplikacja React Native + Expo (osobny projekt, pomijany przez lint/typecheck/Prettier PWA)
```

## Placeholdery do uzupełnienia

Wszystkie są w [`lib/config.ts`](lib/config.ts) (`siteConfig`) i trafiają m.in. do Regulaminu i Polityki prywatności
(tokeny `{{…}}` w `content/legal/*/*.md`):

| Placeholder                                        | Gdzie                                                                               |
| -------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `[NAZWA FIRMY]`, `[ADRES]`, `[NIP]`, `[E-MAIL]`    | Regulamin §1, §10; Polityka pkt 1                                                   |
| `[DATA]`                                           | „Obowiązuje od” w obu dokumentach                                                   |
| `[ADRES APLIKACJI]`                                | Regulamin §1, ekran instalacji – w CI ustawiany automatycznie na adres GitHub Pages |
| `[LINK BUY ME A COFFEE]`                           | stopka Ustawień (dopóki to nie jest URL, przycisk jest nieaktywny)                  |
| `[NAZWA NARZĘDZIA]`, `[NAZWA HOSTINGU]`, `[OKRES]` | Polityka pkt 3 i 4                                                                  |
| `[DO UZUPEŁNIENIA …]` (Web Push)                   | Polityka pkt 5 – treść w `content/legal/*/privacy.md`                               |

## Decyzje i odstępstwa od specyfikacji

- **Hosting: GitHub Pages zamiast Vercel** (na prośbę właściciela). Skutki:
  - Vercel Web Analytics nie działa poza Vercelem, więc jest **wyłączona** (włącza ją `NEXT_PUBLIC_VERCEL_ANALYTICS=1`
    po przeniesieniu na Vercel). Obecnie aplikacja nie zbiera żadnych statystyk.
  - Polityka prywatności (pkt 3 i 4) wymaga uzupełnienia pod GitHub Pages (GitHub Inc. zapisuje logi serwera) albo
    usunięcia pkt 3, jeśli analityka zostanie wyłączona na stałe.
- **Service worker**: własny `sw.js` generowany po `next build` z listą wszystkich plików eksportu (prostsze niż Serwist
  przy Turbopacku i statycznym eksporcie). Nowa wersja aktywuje się od razu po wdrożeniu.
- **[DO DECYZJI] zrealizowane wg propozycji**: arkusz „Kiedy zakończyłeś post?” w potwierdzeniu zakończenia
  („Zakończ teraz” / „Ustaw inną godzinę”); po przekroczeniu celu drugie, cieńsze okrążenie w kolorze `accentText`,
  etykieta „CEL OSIĄGNIĘTY”, „+X ponad cel” i jednorazowy puls pierścienia (wyłączony przy reduced motion).
- **Powiadomienia – etap 1**: lokalne powiadomienia przez service worker, planowane gdy aplikacja jest otwarta lub w tle
  (`lib/notifications`). Etap 2 (Web Push z serwera) nie jest zaimplementowany.
- **Stan „przed pierwszym postem”** (brak w makietach): pierścień pusty, etykieta „Gotowy do postu”, „cel 16 h”, a „Następny
  post” wg godziny ostatniego posiłku z ekranu protokołu.
- **Język zapasowy** dla telefonów w innym języku niż obsługiwane: polski (stała `FALLBACK_LOCALE` w
  `lib/domain/settings.ts`; warto rozważyć `en`).
- **Godziny** formatowane wg regionu przeglądarki (np. 24 h dla `en-GB`, 12 h dla `en-US`).
- Regulamin i Polityka: polska wersja wiążąca, pozostałe języki pokazują angielskie tłumaczenie z adnotacją.

## Do rozważenia (poza zakresem)

- Etap 2 powiadomień (Web Push, VAPID) – wymaga backendu i zmiany polityki prywatności.
- Przypomnienie o eksporcie kopii danych (dane są tylko na jednym urządzeniu).
- Komunikat „Dostępna nowa wersja” zamiast cichej aktualizacji service workera.
