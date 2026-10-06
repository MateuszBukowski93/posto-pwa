# Zadanie: zbuduj aplikację PWA „Posto” do postu przerywanego (Next.js + React)

Zbuduj od zera kompletną, gotową do wdrożenia aplikację PWA **Posto**: timer postu przerywanego z historią, pomiarami wagi i wody oraz ustawieniami. Poniżej masz pełną specyfikację produktu, wyglądu i zachowania. Projekt graficzny już istnieje. Pliki źródłowe makiet (HTML) są w folderze `design/` (patrz sekcja 3) i to one są źródłem prawdy dla wyglądu.

Pracuj etapami (sekcja 14). Po każdym etapie aplikacja ma się budować, przechodzić lint i testy. Jeśli coś w specyfikacji jest niejasne albo sprzeczne, zapytaj, zamiast zgadywać. Wszystko, co oznaczyłem jako **[DO DECYZJI]**, zrób w zaproponowany sposób, ale tak, żeby łatwo było to zmienić.

---

## 1. Produkt w skrócie

- **Czym jest:** lekka aplikacja do postu przerywanego. Odmierza czas postu i okna jedzenia, pokazuje fazy postu, historię i statystyki, pozwala zapisywać wagę i wypitą wodę.
- **Dla kogo:** dorośli w Polsce i za granicą, korzystający głównie z telefonu.
- **Kluczowe założenia (nie łam ich):**
  - **Bez logowania i bez kont.** Żadnej rejestracji, żadnego backendu dla danych użytkownika.
  - **Dane tylko na urządzeniu.** Posty, waga, woda i ustawienia zapisują się wyłącznie lokalnie (IndexedDB). Nic nie jest wysyłane na serwer.
  - **Bezpłatna.** Bez subskrypcji i reklam. Jest tylko dobrowolne wsparcie przez Buy Me a Coffee (link zewnętrzny).
  - **PWA.** Instalowana z przeglądarki na ekran główny, bez sklepu z aplikacjami.
  - **Analityka wyłącznie bez cookies** (Vercel Web Analytics). Bez Google Analytics, bez banera cookies.
- **Właściciel:** DeveloArt (dane firmy jako placeholdery, sekcja 13).
- **Hosting:** Vercel.

## 2. Stack techniczny

- **Next.js** (najnowsza stabilna, App Router) + **React** + **TypeScript** (strict).
- **Tailwind CSS** (najnowsza wersja). Tokeny kolorów jako zmienne CSS (sekcja 4), motyw przez atrybut `data-theme` na `<html>`.
- **Fonty:** `next/font/google`: **Bricolage Grotesque** (wagi 500 i 700, oś `opsz`) do nagłówków i cyfr oraz **Manrope** (400–700) do tekstu. Subset `latin` + `latin-ext` (polskie znaki), a także `cyrillic` dla ukraińskiego, jeśli font go wspiera. W przeciwnym razie fallback systemowy.
- **Dane lokalne:** **Dexie** (IndexedDB) + `dexie-react-hooks` (`useLiveQuery`). Wszystkie operacje na danych w jednej warstwie `lib/db`.
- **PWA:**
  - `app/manifest.ts` (natywne wsparcie Next.js), ikony 192/512, wersja maskable i `apple-touch-icon`.
  - Service worker do cache'owania aplikacji: **Serwist** (`@serwist/next`) albo ręczny `public/sw.js` zgodnie z oficjalnym przewodnikiem PWA w dokumentacji Next.js. Sprawdź w aktualnej dokumentacji, co działa z bieżącą wersją Next.js i bundlerem (Turbopack/webpack), i wybierz prostsze rozwiązanie.
  - `theme-color` osobno dla trybu jasnego i ciemnego.
- **i18n:** **next-intl** w trybie bez routingu językowego (jeden zestaw URL-i, język z ustawień użytkownika lub z `navigator.languages`), komunikaty w `messages/<locale>.json`.
- **Animacje:** CSS lub pakiet `motion`. Zawsze respektuj `prefers-reduced-motion`.
- **Ikony:** `lucide-react` (styl obrysowy, `strokeWidth` ~1.9) albo własne SVG o tym samym charakterze. **Zero emoji w UI.**
- **Wykresy:** proste własne komponenty SVG/div (słupki tygodnia, linia trendu wagi), bez ciężkich bibliotek.
- **Analityka:** `@vercel/analytics`.
- **Testy:** Vitest dla logiki (obliczenia czasu, faz, serii, statystyk) i Playwright dla kilku testów E2E (sekcja 15).
- **Jakość:** ESLint + Prettier, bez błędów TypeScript.

## 3. Projekt graficzny – pliki referencyjne

W repo jest folder `design/` z makietami w formacie `.dc.html` (zwykły HTML z inline'owymi stylami i małym skryptem logiki). Odwzoruj z nich dokładnie kolory, rozmiary, odstępy, promienie, typografię i układ. Nie zaokrąglaj wartości do siatki 4/8 px. Pliki:

| Plik | Ekran |
|---|---|
| `Powitanie.dc.html` | Ekran powitalny z animacjami |
| `Instalacja.dc.html` | Instrukcja instalacji PWA (iPhone/Android) |
| `Main.dc.html` | Timer (ekran główny) + arkusz edycji początku postu |
| `Protokoly.dc.html` | Wybór protokołu postu |
| `Historia.dc.html` | Historia i statystyki |
| `Pomiary.dc.html` | Waga i woda |
| `Ustawienia.dc.html` | Ustawienia + arkusz wyboru języka |
| `Regulamin.dc.html`, `Polityka.dc.html` | Dokumenty prawne |
| `*Dark.dc.html`, `TimerStart*.dc.html`, `UstawieniaJezyk*.dc.html` | Te same ekrany w trybie ciemnym lub z otwartym arkuszem (tylko podgląd) |

Makiety mają 390×844 px (telefon). Aplikacja ma być responsywna: na szerszych ekranach treść wyśrodkowana w kolumnie o `max-width` ok. 480 px, tło na pełną szerokość. Nie rysuj sztucznego paska statusu telefonu. Uwzględnij `env(safe-area-inset-*)` (notch, home indicator), zwłaszcza dla dolnej nawigacji.

## 4. System wizualny (tokeny)

Kierunek: spokojny, czysty, „wellness” bez infantylizmu. Chłodne szarozielone tło, jeden ciepły akcent (pomarańcz = post) i niebieski dla wody.

### Kolory

| Token | Jasny | Ciemny | Użycie |
|---|---|---|---|
| `bg` | `#F2F4F1` | `#0E1311` | tło ekranu |
| `surface` | `#FFFFFF` | `#171E1B` | karty, dolna nawigacja, arkusze |
| `line` | `#DCE2DD` | `#26302C` | obramowania, separatory |
| `track` | `#E3E8E4` | `#232C28` | tor pierścienia, tło segmentów |
| `below` | `#BCC6BF` | `#4A5650` | słupki poniżej celu |
| `off` | `#AEB8B1` | `#4A5650` | wyłączony przełącznik |
| `ink` | `#141B18` | `#EDF1EE` | tekst główny |
| `muted` | `#56615B` | `#9BA7A1` | tekst pomocniczy |
| `accent` | `#E8673A` | `#F0784C` | pierścień postu, aktywne elementy |
| `accentText` | `#B0441C` | `#F5916B` | tekst w kolorze akcentu (kontrast AA) |
| `accentSoft` | `#FBE4DA` | `#33221A` | tła wyróżnień |
| `water` | `#2F7FC1` | `#3D8FD1` | woda |
| `waterBtn` | `#226BA8` | `#2F7FC1` | przycisk „+250 ml” (biały tekst) |
| `waterText` | `#1F5F96` | `#7DB8EA` | tekst w kolorze wody |
| `waterSoft` | `#DDEBF7` | `#14273A` | tło karty wody |
| `waterEmpty` | `#C2DAEE` | `#1F3A52` | pusta „szklanka” |
| `btn` | `#141B18` | `#EDF1EE` | główny przycisk (tło) |
| `btnText` | `#FFFFFF` | `#0E1311` | główny przycisk (tekst) |
| `segOn` | `#FFFFFF` | `#2E3934` | aktywny segment przełącznika |

### Typografia

- Logo „Posto”: Bricolage Grotesque 700, 26 px, `letter-spacing: -0.03em`.
- Tytuły ekranów: Bricolage 700, 30 px. Tytuł powitania: 34 px. Tytuły arkuszy: 26 px.
- Cyfry timera: Bricolage 700, 54 px, `font-variant-numeric: tabular-nums`. Wszystkie liczby mają `tabular-nums`.
- Tekst: Manrope 14–16 px. Podpisy: 12–13 px w kolorze `muted`. Etykiety sekcji: 13 px, 700, wersaliki, `letter-spacing: 0.04em`.

### Kształty i rozmiary

- Promienie: karty 16–20 px, przyciski główne 18 px (wysokość 56 px), chipy 999 px, przełączniki segmentowe 16 px (wewnętrzne 12 px), arkusze 28 px u góry.
- Margines ekranu 20 px. Odstępy między sekcjami 12–16 px.
- **Każdy element klikalny ma co najmniej 44×44 px.**
- Arkusze (bottom sheet): wysuwane od dołu, przyciemnione tło `rgba(8,12,10,0.5)`, uchwyt 40×5 px, zamykanie kliknięciem w tło, przyciskiem „Anuluj” i klawiszem Esc. Fokus zamknięty w arkuszu.

## 5. Model danych (Dexie)

```ts
type Fast = {
  id: string;               // uuid
  startedAt: number;        // epoch ms (UTC)
  endedAt?: number;         // brak = post trwa
  goalHours: number;        // cel w chwili startu (np. 16)
  protocolId: ProtocolId;
};

type WeightEntry = { id: string; at: number; kg: number };
type WaterEntry  = { id: string; at: number; ml: number }; // +250 / -250 (cofnięcie usuwa ostatni wpis z dnia)

type Settings = {
  id: 'settings';
  onboardingDone: boolean;
  protocolId: ProtocolId;          // domyślnie '16:8'
  lastMealTime: string;            // 'HH:MM', domyślnie '20:00'
  theme: 'light' | 'dark' | 'system';   // domyślnie 'system'
  locale: 'system' | 'pl' | 'en' | 'de' | 'es' | 'fr' | 'it' | 'pt' | 'uk'; // domyślnie 'system'
  notifications: { beforeEnd: boolean; end: boolean; eatingWindowEnd: boolean; water: boolean };
  waterGoalMl: number;             // domyślnie 2500
  weightGoalKg?: number;
  startWeightKg?: number;          // pierwszy pomiar albo ustawiony ręcznie
};
```

Zasady:

- **Czas liczony z timestampów, nigdy z licznika.** `elapsed = now - startedAt`. Po zamknięciu i ponownym otwarciu aplikacji timer pokazuje poprawny czas.
- Trwa najwyżej jeden post naraz (`endedAt` puste). Okno jedzenia trwa od `endedAt` ostatniego postu do startu kolejnego.
- Przechowuj czas w UTC, wyświetlaj lokalnie. Obsłuż zmianę czasu letniego (post przez noc zmiany czasu ma poprawną długość).
- Wersjonuj schemat Dexie, żeby dało się robić migracje.

## 6. Logika domenowa

### Protokoły

| id | Post | Jedzenie | Etykieta (PL) |
|---|---|---|---|
| `13:11` | 13 h | 11 h | Łagodny start |
| `14:10` | 14 h | 10 h | Dla początkujących |
| `16:8` | 16 h | 8 h | Najpopularniejszy (domyślny) |
| `18:6` | 18 h | 6 h | Zaawansowany |
| `20:4` | 20 h | 4 h | Wojownik |
| `23:1` | 23 h | 1 h | Jeden posiłek (OMAD) |

### Fazy postu (wg godzin od startu)

| Od–do | Nazwa | Opis |
|---|---|---|
| 0–4 h | Trawienie | Organizm trawi ostatni posiłek i korzysta z bieżącej energii. |
| 4–12 h | Stabilizacja | Poziom insuliny spada, organizm przestawia się na zapasy. |
| 12–18 h | Spalanie tłuszczu | Organizm coraz chętniej sięga po zapasy tłuszczu. |
| 18 h+ | Ketoza | Rośnie produkcja ciał ketonowych. |

Pasek faz to 4 segmenty o szerokości proporcjonalnej do zakresu (4, 8, 6, 6). Ukończone i bieżący segment mają kolor `accent`, pozostałe `track`. W oknie jedzenia pokazuj jeden segment w kolorze `water`, nazwę „Okno jedzenia” i opis „Jedz spokojnie i pełnowartościowo. Kolejny post zacznie się o HH:MM.”.

### Statystyki (Historia)

- **Seria (streak):** liczba kolejnych dni (licząc wstecz od dziś lub wczoraj), w których zakończył się post ≥ swojego celu. Pokazuj też najdłuższą serię w historii.
- **Ten tydzień:** pon–niedz, długość postu (h) przypisana do dnia zakończenia. Słupek ≥ celu ma kolor `accent`, poniżej celu `below`, dzisiejszy trwający post `accentSoft`. Przerywana linia celu.
- **Kafelki (ostatnie 28 dni):** średnia długość, najdłuższy post, liczba ukończonych / wszystkich.
- **Ostatnie posty:** data, zakres godzin, długość, status „Cel osiągnięty” / „Poniżej celu”. Status ma inną ikonę i tekst, nie tylko inny kolor.

### Waga i woda

- Waga: aktualna (ostatni pomiar), zmiana w ostatnich 30 dniach, linia trendu z 30 dni (SVG, punkt na ostatnim pomiarze), pasek postępu od wagi startowej do docelowej. Jednostka kg, jedno miejsce po przecinku, format liczb zgodny z językiem (PL: `82,4`).
- Woda: dzienny licznik, krok 250 ml, cel z ustawień (domyślnie 2,5 l), siatka „szklanek” (cel / 250 ml), przyciski „−” i „+ 250 ml”. Licznik zeruje się o północy czasu lokalnego.

## 7. Ekrany i nawigacja

Trasy (slugi po angielsku, bo aplikacja jest wielojęzyczna):

| Trasa | Ekran | Dolna nawigacja |
|---|---|---|
| `/welcome` | Powitanie | nie |
| `/install` | Jak zainstalować | nie |
| `/protocol` | Wybór protokołu | nie (strzałka wstecz) |
| `/` | Timer | tak |
| `/history` | Historia | tak |
| `/measurements` | Pomiary | tak |
| `/settings` | Ustawienia | tak |
| `/terms` | Regulamin | nie |
| `/privacy` | Polityka prywatności | nie |

Przy pierwszym uruchomieniu (`onboardingDone = false`) przekieruj z `/` na `/welcome`. Flow onboardingu: Powitanie → „Zaczynamy” → Wybór protokołu → „Zapisz protokół” → Timer (ustaw `onboardingDone = true`).

**Dolna nawigacja** (4 pozycje, ikona + podpis 11 px): Timer, Historia, Pomiary, Ustawienia. Aktywna pozycja ma kolor `accentText` i `aria-current="page"`. Tło `surface`, górna linia `line`, dolny padding na safe-area.

### 7.1 Powitanie (`/welcome`)

- Logo „Posto”.
- Ilustracja: pierścień (tor `track`, łuk `accent` do ok. 72%) z napisem „16:8” i „POSZCZĘ” w środku. Obok dwa małe pływające chipy: „+250 ml” (ikona kropli) i „● Spalanie tłuszczu”.
- H1: **„Post przerywany, po prostu.”**, pod nim „Timer postu, fazy, woda i waga w jednej lekkiej aplikacji.”
- Lista 3 zalet (kafelek 44 px z ikoną na `accentSoft`):
  1. **Bez logowania i zakładania konta**: „Twoje dane zostają na Twoim telefonie.”
  2. **Aplikacja PWA na Twój telefon**: „Instalujesz ją z przeglądarki, bez sklepu z aplikacjami.”
  3. **Całkowicie bezpłatna**: „Bez subskrypcji i ukrytych opłat.”
- Przycisk główny „Zaczynamy” → `/protocol`. Link „Jak zainstalować Posto na telefonie?” → `/install`.
- Stopka 12 px: „Korzystając z Posto, akceptujesz **Regulamin** i **Politykę prywatności**.” (linki).
- **Animacje (lekkie, jednorazowe przy wejściu):**
  - logo: fade-in 500 ms;
  - ilustracja: fade + scale 0.94→1 (700 ms, opóźnienie 100 ms);
  - łuk pierścienia rysuje się od 0 do 72% (`stroke-dashoffset`, 1400 ms, opóźnienie 350 ms);
  - tekst, lista i przyciski wjeżdżają od dołu (translateY 14 px → 0 + fade, 600 ms) kolejno co ~150 ms;
  - chipy unoszą się w pętli o ±6–7 px (ok. 4 s, ease-in-out);
  - easing `cubic-bezier(0.2, 0.7, 0.2, 1)`.
  
  Przy `prefers-reduced-motion: reduce` animacje są wyłączone.

### 7.2 Jak zainstalować (`/install`)

- Tytuł „Zainstaluj Posto”. Opis: „Posto to aplikacja PWA. Instalujesz ją prosto z przeglądarki, bez sklepu z aplikacjami. Potem uruchamiasz ją z ekranu głównego jak każdą inną.”
- Zakładki **iPhone / Android** (`role="tablist"`). Domyślną wybierz po user agencie.
- iPhone (Safari):
  1. **Otwórz Posto w Safari**: „Wejdź na [ADRES APLIKACJI]. Na nowszych iPhone'ach działa to też w Chrome.”
  2. **Stuknij „Udostępnij”**: „Kwadrat ze strzałką w górę, na dolnym lub górnym pasku.”
  3. **Wybierz „Do ekranu początkowego”**: „Nie widzisz tej opcji? Przewiń listę w dół.”
  4. **Stuknij „Dodaj”**: „Ikona Posto pojawi się na ekranie głównym.”
  
  Wskazówka: „Powiadomienia o końcu postu działają na iPhonie tylko po dodaniu Posto do ekranu początkowego.”
- Android (Chrome):
  1. **Otwórz Posto w Chrome**: „Wejdź na [ADRES APLIKACJI].”
  2. **Stuknij menu ⋮**: „Trzy kropki w prawym górnym rogu.”
  3. **Wybierz „Zainstaluj aplikację”**: „W niektórych wersjach: „Dodaj do ekranu głównego”.”
  4. **Potwierdź „Zainstaluj”**: „Ikona Posto pojawi się na ekranie głównym.”
  
  Wskazówka: „Chrome może sam zaproponować instalację. Wtedy wystarczy stuknąć „Zainstaluj” na dole ekranu.”
- Jeśli przeglądarka wspiera `beforeinstallprompt`, pokaż dodatkowo przycisk „Zainstaluj teraz”. Jeśli aplikacja już działa jako zainstalowana (`display-mode: standalone`), pokaż komunikat, że jest zainstalowana.
- Przycisk „Rozumiem” wraca do poprzedniego ekranu.

### 7.3 Timer (`/`)

Od góry:

1. **Nagłówek:** logo „Posto” + data (np. „Poniedziałek, 5 października”, format zależny od języka). Po prawej chip z aktualnym protokołem („16:8 ⌄”) → `/protocol`.
2. **Pierścień 280×280 px:** tor `track` grubości 18 px, łuk postępu (`accent` w trakcie postu, `water` w oknie jedzenia), zaokrąglone końce, start na godzinie 12. W środku:
   - etykieta „POSZCZĘ” / „OKNO JEDZENIA”;
   - czas `HH:MM:SS` (54 px, odświeżany co sekundę);
   - „cel 16 h · zostało 1 h 27 min” albo „cel osiągnięty”.
3. **Dwie karty godzin:**
   - „Początek” (np. „Wczoraj, 20:00”). W trakcie postu karta jest przyciskiem z ikoną ołówka i otwiera arkusz edycji startu (7.3.1).
   - „Cel postu” / „Następny post” (np. „Dziś, 12:00”).
   - Dni opisuj względnie: Dziś / Wczoraj / Jutro, starsze jako `d.MM`.
4. **Karta fazy:** nazwa fazy, zakres godzin, opis, pasek 4 segmentów.
5. **Dwie karty szybkie:**
   - „Woda” (tło `waterSoft`, wartość, „z 2,5 l”, kwadratowy przycisk „+” z `aria-label="Dodaj 250 ml wody"`);
   - „Waga” (ostatni pomiar i zmiana od poprzedniego, link do `/measurements`).
6. **Przycisk główny:**
   - w trakcie postu: „Zakończ post”;
   - w oknie jedzenia: „Rozpocznij teraz” + obok drugi przycisk „Zacząłem wcześniej”, który otwiera arkusz edycji startu.

#### 7.3.1 Edycja początku postu (arkusz)

Przypadek użycia: „Nie jadłem od wczoraj 19:00, ale zapomniałem kliknąć start. Dziś o 9:00 ustawiam start wstecz.”

- Tytuł „Kiedy zacząłeś post?”, opis „Podaj, kiedy zjadłeś ostatni posiłek. Od tej chwili policzymy czas postu.”
- Wybór dnia: 3 przyciski radio „Przedwczoraj / Wczoraj / Dziś” z datą pod spodem (`d.MM`).
- Godzina: `<input type="time">` z etykietą „Godzina”.
- Podgląd na żywo (`role="status"`): „Post trwa już 14 h 05 min” (+ „· cel 16 h osiągnięty”, jeśli dotyczy).
- **Walidacja:** start nie może być w przyszłości. Wtedy komunikat „Ta godzina jeszcze nie nadeszła. Wybierz wcześniejszą.” i nieaktywny „Zapisz start”. Start nie może też być wcześniejszy niż koniec poprzedniego postu (komunikat analogiczny).
- „Anuluj” / „Zapisz start”. Zapis aktualizuje `startedAt` trwającego postu albo, gdy trwa okno jedzenia, tworzy nowy post z podanym startem.
- **[DO DECYZJI]** Analogiczny arkusz „Kiedy zakończyłeś post?” przy kończeniu postu (ktoś zjadł o 12:00, a kliknął o 14:00). Zrób go jako opcję w potwierdzeniu zakończenia: „Zakończ teraz” / „Ustaw inną godzinę”.

#### 7.3.2 Po przekroczeniu celu **[DO DECYZJI – zaproponowany wariant]**

- Pierścień dochodzi do 100%, po czym rysuje się **drugie okrążenie** cieńszym łukiem w ciemniejszym odcieniu akcentu (`accentText`), które pokazuje nadwyżkę.
- W środku etykieta „CEL OSIĄGNIĘTY” (`accentText`), pod licznikiem „+1 h 24 min ponad cel”.
- Przycisk zmienia się na „Zakończ post · cel osiągnięty”.
- Jednorazowa, subtelna animacja w momencie osiągnięcia celu (pulsujący pierścień), wyłączona przy reduced motion.

#### 7.3.3 Zakończenie postu

Po kliknięciu „Zakończ post” przed osiągnięciem celu pokaż arkusz potwierdzenia z aktualnym czasem i informacją, ile brakuje do celu. Po zakończeniu post trafia do historii, a timer przechodzi w okno jedzenia z celem `24 − godziny postu`.

### 7.4 Wybór protokołu (`/protocol`)

- Strzałka wstecz + „Timer”. Tytuł „Protokół postu”, opis „Wybierz rytm, który pasuje do Twojego dnia. Możesz go zmienić w każdej chwili.”
- Lista 6 protokołów (`role="radiogroup"`). Każdy to przycisk 64 px z kółkiem radio, nazwą (Bricolage 22 px), etykietą, mini-paskiem proporcji post/jedzenie (`accent` na tle `waterSoft`) i opisem „16 h postu · 8 h jedzenia”. Zaznaczony ma ramkę 2 px `accent`.
- Karta „Ostatni posiłek” z `<input type="time">` i podsumowaniem „Post: 20:00 → 12:00 następnego dnia”.
- „Zapisz protokół 16:8”. Zmiana protokołu w trakcie postu zmienia cel bieżącego postu (zapytaj w arkuszu: „Zmienić cel bieżącego postu?”).

### 7.5 Historia (`/history`)

- Tytuł „Historia”.
- Karta serii (tło `accentSoft`): duża liczba (56 px, `accentText`) + „dni z rzędu” + „Najdłuższa seria: N dni”.
- Karta „Ten tydzień” z wykresem słupkowym (wysokość 120 px, skala 0–24 h, linia celu) i podpisami dni (Pn…Nd) z wartościami („16,2”).
- 3 kafelki: Średnio / Najdłuższy / Ukończone.
- „OSTATNIE POSTY”: lista z ikoną statusu (✓ na `accentSoft` albo „–” na `track`). Kliknięcie otwiera edycję lub usuwanie wpisu (arkusz).
- Stan pusty (brak postów): krótki komunikat i przycisk „Rozpocznij pierwszy post”.

### 7.6 Pomiary (`/measurements`)

- Tytuł „Pomiary”, po prawej chip „+ Dodaj wagę” (arkusz z polem liczbowym kg, `inputmode="decimal"`, data i godzina domyślnie „teraz”).
- Karta „Waga”: wartość 40 px + „kg”, chip „−2,1 kg w 30 dni”, linia trendu, pasek „Start 84,5 kg → Cel 78 kg”.
- Karta „Woda dziś” (tło `waterSoft`): „1,25 l / 2,5 l”, siatka szklanek, przyciski „−” i „+ 250 ml”.
- „OSTATNIE POMIARY”: data, różnica, waga. Pomiar można usunąć.
- Stany puste dla wagi.

### 7.7 Ustawienia (`/settings`)

1. **POWIADOMIENIA:** 4 przełączniki (`role="switch"`, tor 48×28 px, wł. = `accent`, wył. = `off`):
   - „Przed końcem postu”: „30 min wcześniej”;
   - „Koniec postu”: „Gdy osiągniesz cel”;
   - „Koniec okna jedzenia”: „1 h przed startem postu”;
   - „Picie wody”: „Co 2 h, od 8:00 do 20:00”.
   
   Pierwsze włączenie prosi o zgodę przeglądarki (`Notification.requestPermission`). Przy odmowie pokaż wyjaśnienie, a na iOS informację o konieczności instalacji.
2. **WYGLĄD I JĘZYK:**
   - przełącznik segmentowy motywu „Jasny / Ciemny / Systemowy” (natychmiastowa zmiana, bez mignięcia przy ładowaniu: ustaw motyw skryptem inline przed hydratacją);
   - pod nim wiersz „Język aplikacji › Polski” z ikoną globusa, który otwiera arkusz z listą języków (7.7.1).
3. **CELE:** wiersze z wartością i chevronem: „Protokół postu › 16:8” (→ `/protocol`), „Dzienny cel wody › 2,5 l”, „Docelowa waga › 78 kg” (edycja w arkuszach).
4. **DANE:**
   - „Eksportuj dane” (plik JSON z wersją schematu);
   - „Importuj dane” (walidacja, podgląd liczby rekordów, potwierdzenie);
   - „Usuń wszystkie dane” (arkusz potwierdzenia z jasnym ostrzeżeniem, że operacji nie da się cofnąć; po usunięciu powrót do `/welcome`).
   
   Polityka prywatności odwołuje się do tej opcji, więc musi istnieć.
5. **Karta instalacji** (tło `accentSoft`, ikona pobierania na `accent`): „Zainstaluj Posto”, „Szybki dostęp z ekranu głównego.”, przycisk „Zainstaluj”. Na Androidzie/desktopie wywołuje `beforeinstallprompt`, na iOS prowadzi do `/install`. Ukryj ją, gdy aplikacja jest już zainstalowana.
6. **Stopka:** „Wesprzyj Posto” (link do [LINK BUY ME A COFFEE], `rel="noopener"`, nowa karta), linki „Regulamin”, „Polityka prywatności”, „Jak zainstalować” oraz numer wersji aplikacji.

Ekran może się przewijać. Makieta pokazuje górną część, nowe sekcje (Dane, stopka) dodaj poniżej w tym samym stylu.

#### 7.7.1 Wybór języka (arkusz)

- Tytuł „Język aplikacji”, lista radio (52 px na wiersz):
  - „Jak w telefonie” (podpis „Teraz: polski” – nazwa wykrytego języka);
  - Polski, English, Deutsch, Español, Français, Italiano, Português, Українська.
- Nazwa każdego języka jest zapisana w tym języku (z atrybutem `lang`), pod nią nazwa w bieżącym języku UI. Zaznaczony wiersz ma tło `accentSoft` i ptaszek na `accent`.
- Wybór od razu zmienia język i zamyka arkusz. Przy więcej niż ~12 językach dodaj pole wyszukiwania.

### 7.8 Regulamin (`/terms`) i Polityka prywatności (`/privacy`)

Treść jest w **Załącznikach A i B** na końcu tego promptu. Renderuj je jako czytelne strony:

- strzałka wstecz;
- tytuł 32 px, „Obowiązuje od [DATA]”;
- nagłówki sekcji Bricolage 19 px;
- tekst 14 px, `line-height: 1.55`;
- §3 Regulaminu („To nie jest porada medyczna”) i sekcja „W skrócie” w Polityce w wyróżnionej karcie `accentSoft`.

Treść trzymaj w plikach MDX lub Markdown (`content/legal/<locale>/terms.md`) i ładuj według języka. Polską wersję masz poniżej, angielską przetłumacz. Pozostałe języki pokazują angielską wersję z adnotacją, że wersja wiążąca to polska.

## 8. Powiadomienia **[DO DECYZJI – ważne]**

Niezawodne powiadomienia przy zamkniętej aplikacji wymagają **Web Push z serwera**: subskrypcja push i zaplanowane godziny muszą być zapisane na serwerze, a to łamie zasadę „dane tylko na urządzeniu” i wymaga zmiany polityki prywatności (jest w niej miejsce oznaczone „DO UZUPEŁNIENIA”).

- **Etap 1 (zrób teraz):** UI przełączników, prośba o zgodę i powiadomienia przez service worker (`registration.showNotification`), planowane, gdy aplikacja jest otwarta lub w tle (timery sprawdzane przy `visibilitychange` i w SW, gdy to możliwe). Wszystko za interfejsem `NotificationScheduler`, żeby później podmienić implementację.
- **Etap 2 (nie implementuj bez mojej zgody):** backend Web Push (VAPID, Route Handler do zapisu subskrypcji, zadanie cykliczne Vercel Cron, magazyn np. Upstash/Supabase), z minimalnym zakresem danych: anonimowa subskrypcja i godziny powiadomień, bez danych o wadze.

## 9. Wielojęzyczność

- Języki: `pl` (domyślny i bazowy), `en`, `de`, `es`, `fr`, `it`, `pt`, `uk`.
- **Wszystkie** teksty UI w plikach komunikatów. Zero tekstu na sztywno w komponentach (poza nazwami języków w ich własnym języku).
- Przetłumacz UI na wszystkie języki naturalnym, krótkim językiem. Sprawdź, czy dłuższe teksty (np. niemieckie) mieszczą się w przyciskach i kartach.
- Liczby, daty, dni tygodnia i nazwy miesięcy formatuj przez `Intl` według języka (PL: przecinek dziesiętny, „5 października”).
- Polskie formy liczby mnogiej (1 dzień, 2 dni, 5 dni) przez ICU plural w next-intl.
- Ustaw `<html lang>` dynamicznie.

## 10. PWA – wymagania

- Manifest:
  - `name: "Posto"`, `short_name: "Posto"`;
  - `description`: „Prosty timer postu przerywanego. Bez logowania, dane zostają na Twoim telefonie.”;
  - `start_url: "/"`, `display: "standalone"`;
  - `background_color` / `theme_color`: `#F2F4F1`;
  - `lang: "pl"`, `orientation: "portrait"`, `categories: ["health", "lifestyle"]`.
- **Ikona:** zaprojektuj prostą ikonę SVG w duchu makiet (pierścień z łukiem w kolorze `#E8673A` na tle `#F2F4F1`, ewentualnie litera „P” w Bricolage). Wygeneruj PNG 192, 512, maskable 512 (z bezpieczną strefą) i `apple-touch-icon` 180. Dodaj też favicon.
- Meta: `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style`, `viewport-fit=cover`, `theme-color` dla jasnego i ciemnego.
- Service worker: precache powłoki aplikacji i fontów. Aplikacja ma się uruchamiać i działać bez sieci, choć nie reklamujemy tego w treściach.
- Lighthouse: PWA installable, Accessibility ≥ 95, Performance ≥ 90 na mobile.

## 11. Dostępność

- Prawdziwe elementy: `<button>`, `<a href>`, `<input>` + `<label>`. Nigdy klikalne `div`.
- `aria-label` dla przycisków z samą ikoną. `role="radiogroup"` / `radio` / `switch` / `tablist` z poprawnymi `aria-checked` / `aria-selected`.
- Kontrast tekstu ≥ 4.5:1 (tokeny już to spełniają, nie używaj `accent` jako koloru małego tekstu, tylko `accentText`).
- Arkusze: `role="dialog"`, `aria-modal`, pułapka fokusu, Esc, powrót fokusu.
- Timer: nie ogłaszaj każdej sekundy czytnikowi ekranu (`aria-live` tylko dla zmian faz lub celu).
- Obsługa klawiatury na desktopie.

## 12. Struktura projektu (propozycja)

```
app/
  (main)/layout.tsx          # dolna nawigacja
  (main)/page.tsx            # Timer
  (main)/history/page.tsx
  (main)/measurements/page.tsx
  (main)/settings/page.tsx
  welcome/page.tsx
  install/page.tsx
  protocol/page.tsx
  terms/page.tsx
  privacy/page.tsx
  manifest.ts
  layout.tsx                 # fonty, motyw, i18n provider, Analytics
components/                  # Ring, PhaseBar, BottomSheet, SegmentedControl, Switch, StatTile, WeekChart, Sparkline, BottomNav...
lib/
  db/                        # Dexie: schema, repo functions, export/import
  domain/                    # protocols, phases, time math, stats (czyste funkcje + testy)
  notifications/             # NotificationScheduler
  pwa/                       # install prompt hook, standalone detection
messages/                    # pl.json, en.json, ...
content/legal/               # pl/terms.md, pl/privacy.md, en/...
design/                      # makiety referencyjne (nie są częścią buildu)
```

Aplikacja działa w całości po stronie klienta (dane w IndexedDB). Strony mogą być statyczne. Uważaj na hydratację: wartości zależne od czasu i danych renderuj dopiero po zamontowaniu (bez błędów hydration mismatch).

## 13. Placeholdery do zostawienia (nie wymyślaj wartości)

`[NAZWA FIRMY]`, `[ADRES]`, `[NIP]`, `[E-MAIL]`, `[ADRES APLIKACJI]`, `[DATA]`, `[LINK BUY ME A COFFEE]`, `[NAZWA NARZĘDZIA]`, `[NAZWA HOSTINGU]`, `[OKRES]`.

Zbierz je w jednym pliku konfiguracyjnym (`lib/config.ts`) tam, gdzie to możliwe, i wypisz w README listę miejsc do uzupełnienia.

## 14. Kolejność prac

1. Szkielet: Next.js + TS + Tailwind, tokeny, fonty, motyw jasny/ciemny/systemowy, i18n (pl + en), layout z dolną nawigacją, Dexie z modelem danych.
2. Logika domenowa w `lib/domain` + testy Vitest (czas, fazy, serie, statystyki, DST, walidacja edycji startu).
3. Timer z pełnym cyklem: start, zakończenie, okno jedzenia, edycja startu, stan po przekroczeniu celu.
4. Wybór protokołu + onboarding (Powitanie z animacjami → Protokół → Timer) + ekran instalacji.
5. Historia i Pomiary (z edycją i usuwaniem wpisów, stany puste).
6. Ustawienia: motyw, język (arkusz), cele, dane (eksport/import/usuwanie), karta instalacji, stopka.
7. PWA: manifest, ikony, service worker, install prompt, test offline.
8. Powiadomienia – Etap 1.
9. Regulamin i Polityka, tłumaczenia pozostałych języków, Vercel Analytics.
10. Testy E2E, Lighthouse, README (uruchomienie, wdrożenie na Vercel, lista placeholderów, otwarte decyzje).

## 15. Kryteria akceptacji (E2E)

- Pierwsze uruchomienie → Powitanie → wybór 18:6 → Timer pokazuje cel 18 h.
- Start postu → przeładowanie strony → czas liczy się dalej poprawnie.
- Edycja startu na „Wczoraj 19:00” daje poprawny czas trwania. Godzina w przyszłości jest zablokowana.
- Zakończenie postu ≥ celu: wpis w Historii ze statusem „Cel osiągnięty”, seria +1.
- „+ 250 ml” ×5 = „1,25 l”, następnego dnia licznik od zera.
- Zmiana motywu na Ciemny i języka na English działa natychmiast i jest zapamiętana.
- Eksport → Usuń wszystkie dane → Import przywraca dane.
- Aplikacja uruchamia się offline po pierwszej wizycie. Manifest przechodzi walidację instalowalności.

## 16. Czego NIE robić

- Żadnego logowania, kont ani wysyłania danych użytkownika na serwer.
- Żadnych cookies, banera cookies, Google Analytics ani reklam.
- Żadnych emoji w UI, sztucznych pasków statusu ani gradientowych teł.
- Nie wymyślaj danych firmy, cen ani statystyk. Zostaw placeholdery.
- Nie przedstawiaj aplikacji jako porady medycznej. Opisy faz są orientacyjne.
- Nie dodawaj funkcji spoza specyfikacji bez pytania. Jeśli uważasz, że coś warto dodać, zaproponuj to w podsumowaniu.

---

## Załącznik A – Regulamin (treść PL)

```markdown
# Regulamin

Obowiązuje od [DATA]
## §1. Postanowienia ogólne

1. Regulamin określa zasady korzystania z aplikacji Posto dostępnej pod adresem [ADRES APLIKACJI] („Aplikacja”).
2. Usługodawcą jest [NAZWA FIRMY], działająca pod marką DeveloArt, [ADRES], NIP [NIP], e-mail: [E-MAIL] („Usługodawca”).
3. Regulamin jest regulaminem, o którym mowa w art. 8 ustawy z dnia 18 lipca 2002 r. o świadczeniu usług drogą elektroniczną.
4. Użytkownikiem jest każda osoba korzystająca z Aplikacji.

## §2. Czym jest Posto

1. Posto to bezpłatna aplikacja internetowa (PWA) wspierająca post przerywany. Odmierza czas postu i okna jedzenia, pokazuje historię postów oraz pozwala zapisywać wagę i ilość wypitej wody.
2. Korzystanie z Aplikacji nie wymaga rejestracji ani logowania.
3. Z Aplikacji można korzystać w przeglądarce albo zainstalować ją na urządzeniu jako PWA. Instalacja jest bezpłatna i dobrowolna.

## §3. To nie jest porada medyczna

1. Posto nie jest wyrobem medycznym i nie zastępuje konsultacji z lekarzem ani dietetykiem.
2. Opisy faz postu mają charakter ogólny i orientacyjny. Organizm każdej osoby reaguje inaczej.
3. Przed rozpoczęciem postu przerywanego skonsultuj się z lekarzem, zwłaszcza jeśli jesteś w ciąży lub karmisz piersią, chorujesz przewlekle (np. na cukrzycę), przyjmujesz leki, masz lub miałeś zaburzenia odżywiania albo nie masz ukończonych 18 lat.
4. Jeśli w trakcie postu poczujesz się źle, przerwij go.

## §4. Wymagania techniczne

1. Do korzystania z Aplikacji potrzebujesz urządzenia z aktualną przeglądarką internetową (np. Safari, Chrome, Edge lub Firefox) z włączoną obsługą JavaScript oraz dostępu do internetu przy pierwszym uruchomieniu.
2. Dostępność niektórych funkcji, takich jak instalacja na ekranie głównym czy powiadomienia, zależy od systemu i przeglądarki.
3. Korzystanie z internetu wiąże się z typowymi zagrożeniami, np. złośliwym oprogramowaniem. Dbaj o aktualność systemu i przeglądarki.

## §5. Zawarcie i zakończenie umowy

1. Umowa o świadczenie usługi drogą elektroniczną zostaje zawarta z chwilą rozpoczęcia korzystania z Aplikacji, na czas nieokreślony.
2. Możesz zakończyć korzystanie z Aplikacji w każdej chwili i bez podawania przyczyny. Wystarczy, że usuniesz jej dane i odinstalujesz ją z urządzenia.
3. Usługodawca może zakończyć udostępnianie Aplikacji, informując o tym w Aplikacji z co najmniej 30-dniowym wyprzedzeniem.

## §6. Twoje dane w Aplikacji

1. Dane wpisywane w Aplikacji (m.in. godziny postów, waga, ilość wody, ustawienia) są przechowywane wyłącznie w pamięci przeglądarki na Twoim urządzeniu. Usługodawca nie ma do nich dostępu i nie tworzy ich kopii.
2. Wyczyszczenie danych przeglądarki, odinstalowanie Aplikacji lub zmiana urządzenia mogą spowodować trwałą utratę danych.
3. Szczegóły znajdziesz w Polityce prywatności.

## §7. Zasady korzystania

1. Z Aplikacji należy korzystać zgodnie z prawem i Regulaminem.
2. Zabronione jest dostarczanie treści o charakterze bezprawnym, ingerowanie w działanie Aplikacji oraz próby obchodzenia jej zabezpieczeń.

## §8. Dobrowolne wsparcie

1. Aplikacja jest bezpłatna. Możesz dobrowolnie wesprzeć jej rozwój za pośrednictwem zewnętrznego serwisu Buy Me a Coffee.
2. Wsparcie nie daje dostępu do dodatkowych funkcji i nie jest warunkiem korzystania z Aplikacji.
3. Płatności obsługuje Buy Me a Coffee na zasadach określonych w swoim regulaminie i polityce prywatności.

## §9. Odpowiedzialność

1. Usługodawca dokłada starań, aby Aplikacja działała poprawnie, ale nie gwarantuje jej nieprzerwanej dostępności. Możliwe są przerwy techniczne.
2. Usługodawca odpowiada wobec Użytkownika w zakresie wynikającym z bezwzględnie obowiązujących przepisów prawa. Regulamin nie wyłącza ani nie ogranicza praw konsumenta.

## §10. Reklamacje

1. Reklamacje dotyczące działania Aplikacji można zgłaszać na adres [E-MAIL], opisując problem i podając adres e-mail do odpowiedzi.
2. Usługodawca odpowiada na reklamację w ciągu 14 dni od jej otrzymania.
3. Konsument może skorzystać z pozasądowych sposobów rozwiązywania sporów, np. z pomocy miejskiego lub powiatowego rzecznika konsumentów albo wojewódzkiego inspektoratu Inspekcji Handlowej.

## §11. Postanowienia końcowe

1. Usługodawca może zmienić Regulamin z ważnych przyczyn, np. zmiany przepisów lub funkcji Aplikacji. O zmianach poinformuje w Aplikacji co najmniej 7 dni przed ich wejściem w życie.
2. W sprawach nieuregulowanych stosuje się prawo polskie. Wybór prawa nie pozbawia konsumenta ochrony wynikającej z bezwzględnie obowiązujących przepisów państwa jego zwykłego pobytu.
3. Regulamin obowiązuje od [DATA].
```

## Załącznik B – Polityka prywatności (treść PL)

```markdown
# Polityka prywatności

Obowiązuje od [DATA]
## W skrócie

- Posto działa bez konta i logowania.
- Twoje posty, waga i woda zostają na Twoim telefonie. Nie wysyłamy ich na żaden serwer i nie mamy do nich dostępu.
- Zbieramy tylko anonimowe statystyki odwiedzin, bez plików cookies.
- Nie sprzedajemy danych i nie wyświetlamy reklam.

## 1. Administrator danych

Administratorem danych osobowych jest [NAZWA FIRMY], działająca pod marką DeveloArt, [ADRES], NIP [NIP]. W sprawach prywatności napisz do nas: [E-MAIL].

## 2. Dane, które zostają na Twoim urządzeniu

Wszystko, co wpisujesz w Posto, jest zapisywane wyłącznie w pamięci przeglądarki na Twoim urządzeniu. Dotyczy to m.in.:

- godzin rozpoczęcia i zakończenia postów oraz wybranego protokołu,
- pomiarów wagi i ilości wypitej wody,
- ustawień, takich jak język, motyw i powiadomienia.

Te dane nie są przesyłane do nas ani do nikogo innego. Nie mamy do nich dostępu, dlatego nie możemy ich odczytać, odzyskać ani przenieść na inne urządzenie.

Możesz je usunąć w każdej chwili w Ustawieniach (Usuń wszystkie dane), czyszcząc dane strony w przeglądarce lub odinstalowując aplikację. Usunięcia nie da się cofnąć.

## 3. Statystyki odwiedzin

Aby wiedzieć, jak rozwijać Posto, korzystamy z narzędzia [NAZWA NARZĘDZIA, np. Vercel Web Analytics]. Działa ono bez plików cookies i pokazuje nam tylko zbiorcze statystyki, takie jak liczba odwiedzin, odwiedzane ekrany, źródło wejścia, kraj, typ urządzenia i przeglądarka. Nie pozwala nam zidentyfikować konkretnej osoby.

Podstawą prawną jest nasz prawnie uzasadniony interes, czyli analiza i rozwój aplikacji (art. 6 ust. 1 lit. f RODO). Dane statystyczne przechowujemy przez [OKRES].

## 4. Hosting i logi serwera

Posto jest udostępniane z serwerów [NAZWA HOSTINGU, np. Vercel Inc.]. Przy każdym wejściu do aplikacji serwer automatycznie zapisuje dane techniczne: adres IP, datę i godzinę, adres strony oraz informacje o przeglądarce i systemie.

Te dane są potrzebne, aby dostarczyć aplikację i chronić ją przed nadużyciami (art. 6 ust. 1 lit. f RODO). Są przechowywane przez [OKRES], zgodnie z zasadami dostawcy hostingu.

## 5. Powiadomienia

Powiadomienia włączasz sam w Ustawieniach, po wyrażeniu zgody w przeglądarce. Możesz je wyłączyć w każdej chwili w aplikacji lub w ustawieniach telefonu.

[DO UZUPEŁNIENIA: jeśli powiadomienia będą wysyłane z serwera (Web Push), opisz tu przechowywanie identyfikatora subskrypcji i godzin powiadomień, cel, podstawę prawną i okres przechowywania.]

## 6. Kontakt z nami

Jeśli napiszesz do nas, przetwarzamy Twój adres e-mail i treść wiadomości, aby odpowiedzieć (art. 6 ust. 1 lit. f RODO). Przechowujemy je przez czas potrzebny do załatwienia sprawy, a następnie przez okres przedawnienia ewentualnych roszczeń.

## 7. Wsparcie przez Buy Me a Coffee

Jeśli zdecydujesz się wesprzeć Posto, płatność obsługuje serwis Buy Me a Coffee jako odrębny administrator danych, na zasadach swojej polityki prywatności. Od serwisu możemy otrzymać informacje, które sam w nim podasz, np. imię lub pseudonim i wiadomość.

## 8. Przekazywanie danych poza EOG

Nasi dostawcy (hosting, statystyki) mogą przetwarzać dane techniczne poza Europejskim Obszarem Gospodarczym, np. w USA. Odbywa się to na podstawie decyzji Komisji Europejskiej o odpowiednim stopniu ochrony (EU-US Data Privacy Framework) lub standardowych klauzul umownych.

## 9. Pliki cookies i pamięć przeglądarki

Posto nie używa plików cookies. Korzysta z pamięci przeglądarki (np. IndexedDB) wyłącznie po to, by zapisać Twoje dane na Twoim urządzeniu. Bez tego aplikacja nie mogłaby działać.

## 10. Twoje prawa

W zakresie danych, które przetwarzamy, masz prawo do:

- dostępu do danych i otrzymania ich kopii,
- sprostowania i usunięcia danych,
- ograniczenia przetwarzania,
- wniesienia sprzeciwu wobec przetwarzania opartego na prawnie uzasadnionym interesie,
- wniesienia skargi do Prezesa Urzędu Ochrony Danych Osobowych (ul. Stawki 2, 00-193 Warszawa).

Statystyki są anonimowe, więc zwykle nie jesteśmy w stanie przypisać ich do Ciebie. Danych zapisanych na Twoim urządzeniu nie widzimy. Zarządzasz nimi sam.

## 11. Zmiany polityki

Jeśli zmienimy sposób działania Posto lub przepisy się zmienią, zaktualizujemy tę politykę i poinformujemy o tym w aplikacji. Aktualna wersja obowiązuje od [DATA].
```
