# Posto – aplikacja mobilna (React Native + Expo)

Natywna wersja Posto na iOS i Androida: ta sama funkcjonalność i wygląd co PWA z katalogu głównego
(timer postu i okna jedzenia, fazy, historia i statystyki, waga i woda, ustawienia), bez logowania i bez backendu.
Dane zostają na telefonie (SQLite).

Specyfikacja produktu i makiety są wspólne: [`../docs/SPEC.md`](../docs/SPEC.md), [`../design/`](../design/).

## Stack

- Expo SDK 57 (React Native 0.86, React 19.2, New Architecture), TypeScript (strict), React Compiler
- expo-router (Stack + zakładki), chronione trasy dla onboardingu
- expo-sqlite – wersjonowany schemat (`PRAGMA user_version`), jedyna warstwa zapisu w `src/lib/db/repo.ts`
- use-intl (rdzeń next-intl) – te same komunikaty ICU co w PWA, 8 języków w `messages/`, klucze sprawdzane przez TypeScript
- expo-notifications – lokalne powiadomienia planowane w systemie (działają przy zamkniętej aplikacji)
- react-native-svg (pierścień, wykresy, ikony), Reanimated (animacje, z poszanowaniem „ogranicz ruch”)
- Fonty Bricolage Grotesque i Manrope (`@expo-google-fonts`)
- Vitest – logika domenowa, repozytorium na wbudowanym `node:sqlite`, spójność tłumaczeń, dokumenty prawne

## Uruchomienie

Wymagany Node.js 22.13+ (CI używa 24).

```bash
cd mobile
npm install
npm start            # Expo Go: zeskanuj kod QR telefonem
```

Wszystkie użyte moduły natywne są w Expo Go, więc do testów nie trzeba budować aplikacji.
Na symulatorze: `npm run ios` (wymaga Xcode) albo `npm run android` (wymaga Android Studio).

| Skrypt                 | Opis                                                  |
| ---------------------- | ----------------------------------------------------- |
| `npm run typecheck`    | `tsc --noEmit`                                        |
| `npm run lint`         | ESLint (`eslint-config-expo`)                         |
| `npm test`             | testy Vitest                                          |
| `npm run format:check` | Prettier                                              |
| `npm run doctor`       | `expo-doctor` – zgodność zależności z SDK             |
| `npm run icons`        | ponowne wygenerowanie ikon i splasha (z projektu PWA) |

Wersje sklepowe buduje się w chmurze przez EAS (`npx eas-cli@latest build`), bez lokalnego Xcode i Android Studio.

## Struktura

```
src/app/                  trasy expo-router: (tabs) z dolną nawigacją, welcome, protocol, terms, privacy
src/components/           ekrany i komponenty UI (BottomSheet, Ring, WeekChart, PickerFields, Switch…)
src/lib/domain/           czyste funkcje – kopia lib/domain z PWA (+ planowanie powiadomień na kilka dni)
src/lib/db/               SQLite: schemat i migracje, kolejka zapytań, repozytorium, odświeżanie widoków
src/lib/notifications/    NotificationScheduler na expo-notifications
src/lib/i18n/             komunikaty, polyfille Intl dla Hermesa, nazwy języków
src/lib/legal/            Regulamin i Polityka (pl, en) dla aplikacji mobilnej
messages/                 komunikaty (jak w PWA, bez tekstów o instalacji z przeglądarki)
```

## Różnice względem PWA

- **Brak ekranu „Jak zainstalować” i karty instalacji** – aplikację instaluje się ze sklepu. Druga zaleta na ekranie
  powitalnym to „Działa bez internetu” zamiast „Aplikacja PWA”.
- **Powiadomienia** planowane są w systemie na 3 dni do przodu (`NOTIFICATION_HORIZON_MS`), więc przychodzą też przy
  zamkniętej aplikacji. Plan odświeża się przy każdym otwarciu i zmianie danych.
- **Pola daty i godziny**: systemowy picker (Android – okno, iOS – kółka rozwijane pod polem).
- **Eksport danych** przez systemowe „Udostępnij” (Pliki, Dysk, mail), import z pliku. Format kopii jest ten sam co w
  PWA, więc dane można przenieść z wersji web do aplikacji (i z powrotem).
- **Wszystkie języki są w paczce** – zmiana języka i motywu jest natychmiastowa, bez ładowania.
- **Brak analityki** (w PWA i tak wyłączonej).
- Bricolage Grotesque jest ładowany jako font statyczny (bez osi `opsz`), więc duże cyfry mogą wyglądać minimalnie
  inaczej niż w przeglądarce.

## Do uzupełnienia przed publikacją

| Co                                                        | Gdzie                                                                                                                                                                                            |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `[NAZWA FIRMY]`, `[ADRES]`, `[NIP]`, `[E-MAIL]`, `[DATA]` | `src/lib/config.ts` (trafiają do Regulaminu i Polityki)                                                                                                                                          |
| `[LINK BUY ME A COFFEE]`                                  | `src/lib/config.ts` (dopóki to nie jest URL, przycisk jest nieaktywny)                                                                                                                           |
| Identyfikator aplikacji `com.develoart.posto`             | `app.json` (`ios.bundleIdentifier`, `android.package`) – do potwierdzenia, po publikacji nie da się go zmienić                                                                                   |
| Regulamin i Polityka prywatności                          | `src/lib/legal/content/*.ts` – dostosowane technicznie do aplikacji mobilnej (sklep zamiast przeglądarki, brak statystyk i hostingu), oznaczone „[DO WERYFIKACJI]”; wymagają weryfikacji prawnej |
| Wsparcie przez Buy Me a Coffee                            | sprawdź zgodność z zasadami App Store / Google Play dotyczącymi płatności i darowizn                                                                                                             |

## Co zostało sprawdzone

Typecheck, ESLint, Prettier, testy Vitest, `expo-doctor` i zbudowanie paczek JS dla iOS i Androida (`expo export`).
Przepływy (onboarding, start i edycja postu, cel osiągnięty, zakończenie, historia, woda, waga, motyw, język, usunięcie
danych) sprawdzone w podglądzie react-native-web. Na prawdziwym urządzeniu (pickery, powiadomienia, eksport/import,
klawiatura w arkuszach) aplikacja nie była jeszcze uruchamiana.
