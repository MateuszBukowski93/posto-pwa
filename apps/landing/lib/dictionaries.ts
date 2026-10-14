/**
 * Teksty landingu. Każdy język ma pełny obiekt `Dict` – TypeScript pilnuje, że żaden klucz nie zniknie.
 * `{host}`, `{title}`, `{company}` to placeholdery podstawiane w komponencie.
 * `**tekst**` w treści to pogrubienie (w sekcji protokołów – akcent kolorem).
 */

export const locales = ['pl', 'en', 'uk', 'de', 'fr', 'es'] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  pl: 'Polski',
  en: 'English',
  uk: 'Українська',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
};

type Item = { title: string; text: string };

export type Dict = {
  meta: { title: string; description: string };
  aria: { sections: string; highlights: string; start: string; footer: string; language: string };
  nav: { how: string; features: string; install: string; faq: string; open: string };
  hero: {
    pill: string;
    title: string;
    lead: string;
    cta: string;
    howInstall: string;
    checks: string[];
    chipFat: string;
    chipWater: string;
  };
  cards: Item[];
  how: { title: string; steps: Item[] };
  features: { title: string; lead: string; screenAlt: string; items: Item[] };
  protocols: { title: string; lead: string; legendFast: string; legendWindow: string };
  privacy: { title: string; items: Item[] };
  install: { title: string; lead: string; ios: string[]; android: string[] };
  faq: { title: string; items: { q: string; a: string }[] };
  cta: { title: string; text: string; button: string };
  footer: {
    madeBy: string;
    disclaimer: string;
    copyright: string;
    terms: string;
    privacy: string;
    support: string;
    contact: string;
  };
};

const pl: Dict = {
  meta: {
    title: 'Posto – darmowy timer postu przerywanego',
    description:
      'Posto to prosty timer postu przerywanego. Bez logowania, bez reklam, dane zostają na Twoim telefonie.',
  },
  aria: {
    sections: 'Sekcje strony',
    highlights: 'Najważniejsze',
    start: 'Zacznij',
    footer: 'Stopka',
    language: 'Język',
  },
  nav: { how: 'Jak działa', features: 'Funkcje', install: 'Instalacja', faq: 'Pytania', open: 'Otwórz aplikację' },
  hero: {
    pill: 'Darmowa · Bez logowania · Aplikacja PWA',
    title: 'Post przerywany, po prostu.',
    lead: 'Posto to prosty timer postu przerywanego. Wybierasz protokół, startujesz post i od razu widzisz, ile zostało do celu i w jakiej fazie jesteś.',
    cta: 'Otwórz Posto za darmo',
    howInstall: 'Jak zainstalować',
    checks: ['Bez konta i e-maila', 'Bez reklam', 'Dane zostają na telefonie'],
    chipFat: 'Spalanie tłuszczu',
    chipWater: '+250 ml',
  },
  cards: [
    {
      title: 'Bez logowania',
      text: 'Nie zakładasz konta i nie podajesz e-maila. Otwierasz i od razu startujesz post.',
    },
    {
      title: 'Całkowicie bezpłatna',
      text: 'Bez subskrypcji, ukrytych opłat i reklam. Wszystkie funkcje są dostępne od razu.',
    },
    {
      title: 'Na Twój telefon',
      text: 'Instalujesz Posto prosto z przeglądarki, bez sklepu z aplikacjami. Działa na iPhonie i Androidzie.',
    },
  ],
  how: {
    title: 'Jak to działa',
    steps: [
      {
        title: 'Wybierz protokół',
        text: '16:8, 18:6, a może łagodne 13:11 na początek. Zmienisz go w każdej chwili.',
      },
      {
        title: 'Rozpocznij post',
        text: 'Jedno stuknięcie. Zapomniałeś? Ustawisz godzinę ostatniego posiłku wstecz.',
      },
      {
        title: 'Śledź postęp',
        text: 'Timer pokazuje czas do celu i bieżącą fazę postu, a historia buduje Twoją serię dni.',
      },
    ],
  },
  features: {
    title: 'Wszystko, czego potrzebujesz. Nic ponad to.',
    lead: 'Trzy ekrany, które robią swoje. Jasny i ciemny motyw do wyboru.',
    screenAlt: 'Ekran aplikacji: {title}',
    items: [
      {
        title: 'Timer i fazy postu',
        text: 'Czas do celu, godzina końca i faza, w której jesteś: od trawienia po ketozę.',
      },
      {
        title: 'Historia i seria dni',
        text: 'Tydzień na wykresie, średnia długość postu i liczba dni z rzędu, która motywuje.',
      },
      {
        title: 'Woda i waga',
        text: 'Szklanka po szklance do dziennego celu i trend wagi z ostatnich 30 dni.',
      },
    ],
  },
  protocols: {
    title: 'Nie musisz zaczynać od **16:8**.',
    lead: 'Zacznij łagodnie i wydłużaj post stopniowo. Posto obsługuje sześć popularnych protokołów.',
    legendFast: 'post',
    legendWindow: 'okno jedzenia',
  },
  privacy: {
    title: 'Twoje dane zostają na Twoim telefonie.',
    items: [
      {
        title: 'Nic nie wysyłamy',
        text: 'Posty, waga i woda zapisują się tylko w pamięci Twojej przeglądarki. Nie mamy do nich dostępu.',
      },
      {
        title: 'Bez plików cookies',
        text: 'Zbieramy tylko anonimowe statystyki odwiedzin, bez cookies i bez banera zgód.',
      },
      {
        title: 'Pełna kontrola',
        text: 'Eksportujesz dane do pliku albo usuwasz je jednym przyciskiem w Ustawieniach.',
      },
    ],
  },
  install: {
    title: 'Zainstaluj w 30 sekund',
    lead: 'Posto to aplikacja PWA. Instalujesz ją z przeglądarki, a potem uruchamiasz z ekranu głównego jak każdą inną.',
    ios: [
      'Otwórz **{host}** w Safari.',
      'Stuknij **„Udostępnij”** – kwadrat ze strzałką w górę.',
      'Wybierz **„Do ekranu początkowego”**.',
      'Stuknij **„Dodaj”**. Gotowe.',
    ],
    android: [
      'Otwórz **{host}** w Chrome.',
      'Stuknij menu **⋮** w prawym górnym rogu.',
      'Wybierz **„Zainstaluj aplikację”**.',
      'Potwierdź **„Zainstaluj”**. Gotowe.',
    ],
  },
  faq: {
    title: 'Częste pytania',
    items: [
      {
        q: 'Czy Posto jest naprawdę darmowe?',
        a: 'Tak. Nie ma subskrypcji, płatnych funkcji ani reklam. Jeśli chcesz, możesz dobrowolnie wesprzeć rozwój aplikacji.',
      },
      { q: 'Czy muszę zakładać konto?', a: 'Nie. Posto działa bez logowania i bez podawania e-maila.' },
      {
        q: 'Gdzie są zapisane moje dane?',
        a: 'Wyłącznie na Twoim telefonie, w pamięci przeglądarki. Nie wysyłamy ich na serwer i nie mamy do nich dostępu.',
      },
      {
        q: 'Co, jeśli zmienię telefon?',
        a: 'Wyeksportuj dane do pliku w Ustawieniach na starym telefonie i zaimportuj je na nowym.',
      },
      {
        q: 'Czy Posto działa na iPhonie i Androidzie?',
        a: 'Tak, w Safari, Chrome i innych nowoczesnych przeglądarkach. Na iPhonie powiadomienia działają po dodaniu Posto do ekranu początkowego.',
      },
      {
        q: 'Czy post przerywany jest dla każdego?',
        a: 'Nie. Posto nie zastępuje porady lekarza. Skonsultuj się z lekarzem, zwłaszcza jeśli jesteś w ciąży, karmisz piersią, chorujesz przewlekle, przyjmujesz leki lub nie masz ukończonych 18 lat.',
      },
    ],
  },
  cta: {
    title: 'Zacznij swój pierwszy post jeszcze dziś.',
    text: 'Za darmo, bez logowania, prosto z przeglądarki.',
    button: 'Otwórz Posto',
  },
  footer: {
    madeBy: 'od DeveloArt',
    disclaimer: 'Posto nie jest wyrobem medycznym i nie zastępuje porady lekarza.',
    copyright: '© 2026',
    terms: 'Regulamin',
    privacy: 'Polityka prywatności',
    support: 'Wesprzyj Posto',
    contact: 'Kontakt',
  },
};

const en: Dict = {
  meta: {
    title: 'Posto – free intermittent fasting timer',
    description: 'Posto is a simple intermittent fasting timer. No sign-up, no ads, your data stays on your phone.',
  },
  aria: {
    sections: 'Page sections',
    highlights: 'Highlights',
    start: 'Get started',
    footer: 'Footer',
    language: 'Language',
  },
  nav: { how: 'How it works', features: 'Features', install: 'Install', faq: 'FAQ', open: 'Open the app' },
  hero: {
    pill: 'Free · No sign-up · PWA app',
    title: 'Intermittent fasting, simply.',
    lead: 'Posto is a simple intermittent fasting timer. Pick a protocol, start your fast, and see right away how much time is left and which phase you are in.',
    cta: 'Open Posto for free',
    howInstall: 'How to install',
    checks: ['No account or email', 'No ads', 'Your data stays on your phone'],
    chipFat: 'Fat burning',
    chipWater: '+250 ml',
  },
  cards: [
    {
      title: 'No sign-up',
      text: "You don't need an account or an email. Open it and start your fast right away.",
    },
    {
      title: 'Completely free',
      text: 'No subscription, hidden fees or ads. All features are available straight away.',
    },
    {
      title: 'On your phone',
      text: 'Install Posto straight from your browser, no app store needed. Works on iPhone and Android.',
    },
  ],
  how: {
    title: 'How it works',
    steps: [
      {
        title: 'Choose a protocol',
        text: '16:8, 18:6, or a gentle 13:11 to start. You can change it any time.',
      },
      {
        title: 'Start your fast',
        text: 'One tap. Forgot to start? Set the time of your last meal back in time.',
      },
      {
        title: 'Track your progress',
        text: 'The timer shows time to your goal and your current fasting phase, and your history builds your streak of days.',
      },
    ],
  },
  features: {
    title: 'Everything you need. Nothing more.',
    lead: 'Three screens that do their job. Choose the light or dark theme.',
    screenAlt: 'App screen: {title}',
    items: [
      {
        title: 'Timer and fasting phases',
        text: 'Time to your goal, end time and the phase you are in: from digestion to ketosis.',
      },
      {
        title: 'History and day streak',
        text: 'A week on a chart, your average fast length and the number of days in a row that keeps you going.',
      },
      {
        title: 'Water and weight',
        text: 'One glass at a time toward your daily goal and your weight trend over the last 30 days.',
      },
    ],
  },
  protocols: {
    title: "You don't have to start with **16:8**.",
    lead: 'Start gently and extend your fast gradually. Posto supports six popular protocols.',
    legendFast: 'fast',
    legendWindow: 'eating window',
  },
  privacy: {
    title: 'Your data stays on your phone.',
    items: [
      {
        title: 'Nothing is sent anywhere',
        text: "Fasts, weight and water are saved only in your browser's memory. We have no access to them.",
      },
      {
        title: 'No cookies',
        text: 'We collect only anonymous visit statistics, with no cookies and no consent banner.',
      },
      {
        title: 'Full control',
        text: 'Export your data to a file or delete it with one button in Settings.',
      },
    ],
  },
  install: {
    title: 'Install in 30 seconds',
    lead: 'Posto is a PWA app. You install it from your browser and then launch it from your home screen like any other app.',
    ios: [
      'Open **{host}** in Safari.',
      'Tap **"Share"** – the square with an up arrow.',
      'Choose **"Add to Home Screen"**.',
      'Tap **"Add"**. Done.',
    ],
    android: [
      'Open **{host}** in Chrome.',
      'Tap the **⋮** menu in the top right corner.',
      'Choose **"Install app"**.',
      'Confirm **"Install"**. Done.',
    ],
  },
  faq: {
    title: 'Frequently asked questions',
    items: [
      {
        q: 'Is Posto really free?',
        a: "Yes. There's no subscription, no paid features and no ads. If you like, you can voluntarily support the app's development.",
      },
      { q: 'Do I need to create an account?', a: 'No. Posto works without signing in and without an email.' },
      {
        q: 'Where is my data stored?',
        a: "Only on your phone, in the browser's memory. We don't send it to a server and have no access to it.",
      },
      {
        q: 'What if I change my phone?',
        a: 'Export your data to a file in Settings on the old phone and import it on the new one.',
      },
      {
        q: 'Does Posto work on iPhone and Android?',
        a: 'Yes, in Safari, Chrome and other modern browsers. On iPhone, notifications work after you add Posto to your home screen.',
      },
      {
        q: 'Is intermittent fasting right for everyone?',
        a: 'No. Posto does not replace medical advice. Talk to your doctor, especially if you are pregnant, breastfeeding, have a chronic condition, take medication or are under 18.',
      },
    ],
  },
  cta: {
    title: 'Start your first fast today.',
    text: 'Free, no sign-up, straight from your browser.',
    button: 'Open Posto',
  },
  footer: {
    madeBy: 'by DeveloArt',
    disclaimer: 'Posto is not a medical device and does not replace medical advice.',
    copyright: '© 2026',
    terms: 'Terms of use',
    privacy: 'Privacy policy',
    support: 'Support Posto',
    contact: 'Contact',
  },
};

const uk: Dict = {
  meta: {
    title: 'Posto – безкоштовний таймер інтервального голодування',
    description:
      'Posto — простий таймер інтервального голодування. Без реєстрації, без реклами, дані лишаються на вашому телефоні.',
  },
  aria: {
    sections: 'Розділи сторінки',
    highlights: 'Головне',
    start: 'Почати',
    footer: 'Підвал сторінки',
    language: 'Мова',
  },
  nav: {
    how: 'Як працює',
    features: 'Функції',
    install: 'Встановлення',
    faq: 'Питання',
    open: 'Відкрити застосунок',
  },
  hero: {
    pill: 'Безкоштовно · Без реєстрації · PWA-застосунок',
    title: 'Інтервальне голодування — просто.',
    lead: 'Posto — простий таймер інтервального голодування. Обираєте протокол, починаєте голодування і одразу бачите, скільки лишилося до мети та в якій ви фазі.',
    cta: 'Відкрити Posto безкоштовно',
    howInstall: 'Як встановити',
    checks: ['Без акаунта й e-mail', 'Без реклами', 'Дані лишаються на телефоні'],
    chipFat: 'Спалювання жиру',
    chipWater: '+250 мл',
  },
  cards: [
    {
      title: 'Без реєстрації',
      text: 'Не створюєте акаунт і не вказуєте e-mail. Відкриваєте й одразу починаєте голодування.',
    },
    {
      title: 'Повністю безкоштовно',
      text: 'Без підписки, прихованих платежів і реклами. Усі функції доступні одразу.',
    },
    {
      title: 'На вашому телефоні',
      text: 'Встановлюйте Posto прямо з браузера, без магазину застосунків. Працює на iPhone та Android.',
    },
  ],
  how: {
    title: 'Як це працює',
    steps: [
      {
        title: 'Оберіть протокол',
        text: '16:8, 18:6 або м’яке 13:11 на початок. Змінити можна будь-коли.',
      },
      {
        title: 'Почніть голодування',
        text: 'Одне натискання. Забули? Встановіть час останнього прийому їжі заднім числом.',
      },
      {
        title: 'Відстежуйте прогрес',
        text: 'Таймер показує час до мети та поточну фазу голодування, а історія будує вашу серію днів.',
      },
    ],
  },
  features: {
    title: 'Усе, що потрібно. Нічого зайвого.',
    lead: 'Три екрани, які роблять свою справу. Можна обрати світлу або темну тему.',
    screenAlt: 'Екран застосунку: {title}',
    items: [
      {
        title: 'Таймер і фази голодування',
        text: 'Час до мети, час завершення і фаза, в якій ви зараз: від травлення до кетозу.',
      },
      {
        title: 'Історія і серія днів',
        text: 'Тиждень на графіку, середня тривалість голодування і кількість днів поспіль, що мотивує.',
      },
      {
        title: 'Вода і вага',
        text: 'Склянка за склянкою до денної норми та тренд ваги за останні 30 днів.',
      },
    ],
  },
  protocols: {
    title: 'Не обов’язково починати з **16:8**.',
    lead: 'Почніть м’яко і поступово подовжуйте голодування. Posto підтримує шість популярних протоколів.',
    legendFast: 'голодування',
    legendWindow: 'вікно їжі',
  },
  privacy: {
    title: 'Ваші дані лишаються на вашому телефоні.',
    items: [
      {
        title: 'Нічого не надсилаємо',
        text: 'Голодування, вага і вода зберігаються лише в пам’яті вашого браузера. Ми не маємо до них доступу.',
      },
      {
        title: 'Без cookie-файлів',
        text: 'Збираємо лише анонімну статистику відвідувань, без cookies і без банера згоди.',
      },
      {
        title: 'Повний контроль',
        text: 'Експортуйте дані у файл або видаліть їх однією кнопкою в Налаштуваннях.',
      },
    ],
  },
  install: {
    title: 'Встановіть за 30 секунд',
    lead: 'Posto — це PWA-застосунок. Встановлюєте його з браузера, а потім запускаєте з головного екрана, як і будь-який інший.',
    ios: [
      'Відкрийте **{host}** у Safari.',
      'Натисніть **«Поділитися»** — квадрат зі стрілкою вгору.',
      'Оберіть **«На початковий екран»**.',
      'Натисніть **«Додати»**. Готово.',
    ],
    android: [
      'Відкрийте **{host}** у Chrome.',
      'Натисніть меню **⋮** у правому верхньому куті.',
      'Оберіть **«Установити застосунок»**.',
      'Підтвердіть **«Установити»**. Готово.',
    ],
  },
  faq: {
    title: 'Часті запитання',
    items: [
      {
        q: 'Чи Posto справді безкоштовний?',
        a: 'Так. Немає підписки, платних функцій і реклами. За бажанням можна добровільно підтримати розвиток застосунку.',
      },
      { q: 'Чи потрібно створювати акаунт?', a: 'Ні. Posto працює без входу і без e-mail.' },
      {
        q: 'Де зберігаються мої дані?',
        a: 'Лише на вашому телефоні, у пам’яті браузера. Ми не надсилаємо їх на сервер і не маємо до них доступу.',
      },
      {
        q: 'Що робити, якщо я зміню телефон?',
        a: 'Експортуйте дані у файл у Налаштуваннях на старому телефоні та імпортуйте їх на новому.',
      },
      {
        q: 'Чи працює Posto на iPhone та Android?',
        a: 'Так, у Safari, Chrome та інших сучасних браузерах. На iPhone сповіщення працюють після додавання Posto на початковий екран.',
      },
      {
        q: 'Чи підходить інтервальне голодування всім?',
        a: 'Ні. Posto не замінює консультацію лікаря. Зверніться до лікаря, особливо якщо ви вагітні, годуєте груддю, маєте хронічні захворювання, приймаєте ліки або вам не виповнилося 18 років.',
      },
    ],
  },
  cta: {
    title: 'Почніть перше голодування вже сьогодні.',
    text: 'Безкоштовно, без реєстрації, прямо з браузера.',
    button: 'Відкрити Posto',
  },
  footer: {
    madeBy: 'від DeveloArt',
    disclaimer: 'Posto не є медичним виробом і не замінює консультацію лікаря.',
    copyright: '© 2026',
    terms: 'Умови використання',
    privacy: 'Політика конфіденційності',
    support: 'Підтримати Posto',
    contact: 'Контакт',
  },
};

const de: Dict = {
  meta: {
    title: 'Posto – kostenloser Timer für Intervallfasten',
    description:
      'Posto ist ein einfacher Timer für intermittierendes Fasten. Ohne Anmeldung, ohne Werbung, deine Daten bleiben auf deinem Handy.',
  },
  aria: {
    sections: 'Seitenabschnitte',
    highlights: 'Highlights',
    start: 'Loslegen',
    footer: 'Fußzeile',
    language: 'Sprache',
  },
  nav: {
    how: 'So funktioniert’s',
    features: 'Funktionen',
    install: 'Installation',
    faq: 'Fragen',
    open: 'App öffnen',
  },
  hero: {
    pill: 'Kostenlos · Ohne Anmeldung · PWA-App',
    title: 'Intervallfasten, einfach gemacht.',
    lead: 'Posto ist ein einfacher Timer für intermittierendes Fasten. Wähle ein Protokoll, starte dein Fasten und sieh sofort, wie viel Zeit noch bleibt und in welcher Phase du bist.',
    cta: 'Posto kostenlos öffnen',
    howInstall: 'So installierst du es',
    checks: ['Kein Konto und keine E-Mail', 'Keine Werbung', 'Deine Daten bleiben auf dem Handy'],
    chipFat: 'Fettverbrennung',
    chipWater: '+250 ml',
  },
  cards: [
    {
      title: 'Ohne Anmeldung',
      text: 'Du brauchst weder Konto noch E-Mail-Adresse. Öffnen und sofort mit dem Fasten starten.',
    },
    {
      title: 'Völlig kostenlos',
      text: 'Ohne Abo, versteckte Gebühren oder Werbung. Alle Funktionen sind sofort verfügbar.',
    },
    {
      title: 'Auf dein Handy',
      text: 'Installiere Posto direkt aus dem Browser, ganz ohne App-Store. Funktioniert auf iPhone und Android.',
    },
  ],
  how: {
    title: 'So funktioniert’s',
    steps: [
      {
        title: 'Protokoll wählen',
        text: '16:8, 18:6 oder zum Einstieg das sanfte 13:11. Du kannst es jederzeit ändern.',
      },
      {
        title: 'Fasten starten',
        text: 'Ein Tipp. Vergessen zu starten? Stelle die Uhrzeit deiner letzten Mahlzeit rückwirkend ein.',
      },
      {
        title: 'Fortschritt verfolgen',
        text: 'Der Timer zeigt die Zeit bis zum Ziel und die aktuelle Fastenphase, der Verlauf baut deine Tagesserie auf.',
      },
    ],
  },
  features: {
    title: 'Alles, was du brauchst. Nichts darüber hinaus.',
    lead: 'Drei Bildschirme, die ihren Job machen. Wähle zwischen hellem und dunklem Design.',
    screenAlt: 'App-Bildschirm: {title}',
    items: [
      {
        title: 'Timer und Fastenphasen',
        text: 'Zeit bis zum Ziel, Endzeit und die Phase, in der du gerade bist: von der Verdauung bis zur Ketose.',
      },
      {
        title: 'Verlauf und Tagesserie',
        text: 'Eine Woche im Diagramm, deine durchschnittliche Fastendauer und die Anzahl der Tage in Folge, die motiviert.',
      },
      {
        title: 'Wasser und Gewicht',
        text: 'Glas für Glas zum Tagesziel und dein Gewichtstrend der letzten 30 Tage.',
      },
    ],
  },
  protocols: {
    title: 'Du musst nicht mit **16:8** anfangen.',
    lead: 'Starte sanft und verlängere dein Fasten schrittweise. Posto unterstützt sechs beliebte Protokolle.',
    legendFast: 'Fasten',
    legendWindow: 'Essensfenster',
  },
  privacy: {
    title: 'Deine Daten bleiben auf deinem Handy.',
    items: [
      {
        title: 'Nichts wird gesendet',
        text: 'Fasten, Gewicht und Wasser werden nur im Speicher deines Browsers gesichert. Wir haben keinen Zugriff darauf.',
      },
      {
        title: 'Keine Cookies',
        text: 'Wir erheben nur anonyme Besucherstatistiken, ohne Cookies und ohne Einwilligungsbanner.',
      },
      {
        title: 'Volle Kontrolle',
        text: 'Exportiere deine Daten in eine Datei oder lösche sie mit einem Knopfdruck in den Einstellungen.',
      },
    ],
  },
  install: {
    title: 'In 30 Sekunden installiert',
    lead: 'Posto ist eine PWA-App. Du installierst sie aus dem Browser und startest sie dann vom Startbildschirm wie jede andere App.',
    ios: [
      'Öffne **{host}** in Safari.',
      'Tippe auf **„Teilen“** – das Quadrat mit dem Pfeil nach oben.',
      'Wähle **„Zum Home-Bildschirm“**.',
      'Tippe auf **„Hinzufügen“**. Fertig.',
    ],
    android: [
      'Öffne **{host}** in Chrome.',
      'Tippe oben rechts auf das Menü **⋮**.',
      'Wähle **„App installieren“**.',
      'Bestätige mit **„Installieren“**. Fertig.',
    ],
  },
  faq: {
    title: 'Häufige Fragen',
    items: [
      {
        q: 'Ist Posto wirklich kostenlos?',
        a: 'Ja. Es gibt kein Abo, keine kostenpflichtigen Funktionen und keine Werbung. Wer möchte, kann die Entwicklung der App freiwillig unterstützen.',
      },
      { q: 'Brauche ich ein Konto?', a: 'Nein. Posto funktioniert ohne Anmeldung und ohne E-Mail.' },
      {
        q: 'Wo werden meine Daten gespeichert?',
        a: 'Nur auf deinem Handy, im Speicher des Browsers. Wir senden sie nicht an einen Server und haben keinen Zugriff darauf.',
      },
      {
        q: 'Was passiert, wenn ich mein Handy wechsle?',
        a: 'Exportiere die Daten in den Einstellungen auf dem alten Handy in eine Datei und importiere sie auf dem neuen.',
      },
      {
        q: 'Funktioniert Posto auf iPhone und Android?',
        a: 'Ja, in Safari, Chrome und anderen modernen Browsern. Auf dem iPhone funktionieren Benachrichtigungen, nachdem du Posto zum Home-Bildschirm hinzugefügt hast.',
      },
      {
        q: 'Ist Intervallfasten für jeden geeignet?',
        a: 'Nein. Posto ersetzt keine ärztliche Beratung. Sprich mit deiner Ärztin oder deinem Arzt, besonders wenn du schwanger bist, stillst, eine chronische Erkrankung hast, Medikamente einnimmst oder noch nicht 18 Jahre alt bist.',
      },
    ],
  },
  cta: {
    title: 'Starte heute dein erstes Fasten.',
    text: 'Kostenlos, ohne Anmeldung, direkt aus dem Browser.',
    button: 'Posto öffnen',
  },
  footer: {
    madeBy: 'von DeveloArt',
    disclaimer: 'Posto ist kein Medizinprodukt und ersetzt keine ärztliche Beratung.',
    copyright: '© 2026',
    terms: 'Nutzungsbedingungen',
    privacy: 'Datenschutzerklärung',
    support: 'Posto unterstützen',
    contact: 'Kontakt',
  },
};

const fr: Dict = {
  meta: {
    title: 'Posto – minuteur gratuit de jeûne intermittent',
    description:
      'Posto est un minuteur simple pour le jeûne intermittent. Sans inscription, sans publicité, tes données restent sur ton téléphone.',
  },
  aria: {
    sections: 'Sections de la page',
    highlights: 'À retenir',
    start: 'Commencer',
    footer: 'Pied de page',
    language: 'Langue',
  },
  nav: {
    how: 'Comment ça marche',
    features: 'Fonctions',
    install: 'Installation',
    faq: 'Questions',
    open: 'Ouvrir l’app',
  },
  hero: {
    pill: 'Gratuit · Sans inscription · Application PWA',
    title: 'Le jeûne intermittent, simplement.',
    lead: 'Posto est un minuteur simple pour le jeûne intermittent. Choisis un protocole, lance ton jeûne et vois tout de suite le temps restant et la phase dans laquelle tu te trouves.',
    cta: 'Ouvrir Posto gratuitement',
    howInstall: 'Comment l’installer',
    checks: ['Sans compte ni e-mail', 'Sans publicité', 'Tes données restent sur ton téléphone'],
    chipFat: 'Brûlage des graisses',
    chipWater: '+250 ml',
  },
  cards: [
    {
      title: 'Sans inscription',
      text: 'Pas de compte à créer ni d’e-mail à donner. Ouvre l’app et commence ton jeûne tout de suite.',
    },
    {
      title: 'Entièrement gratuit',
      text: 'Sans abonnement, frais cachés ni publicité. Toutes les fonctions sont disponibles immédiatement.',
    },
    {
      title: 'Sur ton téléphone',
      text: 'Installe Posto directement depuis ton navigateur, sans boutique d’applications. Fonctionne sur iPhone et Android.',
    },
  ],
  how: {
    title: 'Comment ça marche',
    steps: [
      {
        title: 'Choisis un protocole',
        text: '16:8, 18:6 ou le doux 13:11 pour débuter. Tu peux le changer à tout moment.',
      },
      {
        title: 'Lance ton jeûne',
        text: 'Un seul geste. Oublié ? Règle l’heure de ton dernier repas dans le passé.',
      },
      {
        title: 'Suis tes progrès',
        text: 'Le minuteur affiche le temps restant jusqu’à l’objectif et ta phase actuelle, et l’historique construit ta série de jours.',
      },
    ],
  },
  features: {
    title: 'Tout ce dont tu as besoin. Rien de plus.',
    lead: 'Trois écrans qui font leur travail. Choisis le thème clair ou sombre.',
    screenAlt: 'Écran de l’app : {title}',
    items: [
      {
        title: 'Minuteur et phases du jeûne',
        text: 'Temps jusqu’à l’objectif, heure de fin et phase en cours : de la digestion à la cétose.',
      },
      {
        title: 'Historique et série de jours',
        text: 'Une semaine en graphique, la durée moyenne de tes jeûnes et les jours consécutifs qui te motivent.',
      },
      {
        title: 'Eau et poids',
        text: 'Un verre après l’autre vers ton objectif quotidien et la tendance de ton poids sur 30 jours.',
      },
    ],
  },
  protocols: {
    title: 'Pas besoin de commencer par **16:8**.',
    lead: 'Commence doucement et allonge progressivement ton jeûne. Posto prend en charge six protocoles populaires.',
    legendFast: 'jeûne',
    legendWindow: 'fenêtre alimentaire',
  },
  privacy: {
    title: 'Tes données restent sur ton téléphone.',
    items: [
      {
        title: 'Rien n’est envoyé',
        text: 'Jeûnes, poids et eau sont enregistrés uniquement dans la mémoire de ton navigateur. Nous n’y avons pas accès.',
      },
      {
        title: 'Sans cookies',
        text: 'Nous collectons seulement des statistiques de visite anonymes, sans cookies ni bandeau de consentement.',
      },
      {
        title: 'Contrôle total',
        text: 'Exporte tes données dans un fichier ou supprime-les d’un seul bouton dans les Réglages.',
      },
    ],
  },
  install: {
    title: 'Installe-la en 30 secondes',
    lead: 'Posto est une application PWA. Tu l’installes depuis ton navigateur, puis tu la lances depuis l’écran d’accueil comme n’importe quelle autre app.',
    ios: [
      'Ouvre **{host}** dans Safari.',
      'Touche **« Partager »** – le carré avec une flèche vers le haut.',
      'Choisis **« Sur l’écran d’accueil »**.',
      'Touche **« Ajouter »**. C’est fait.',
    ],
    android: [
      'Ouvre **{host}** dans Chrome.',
      'Touche le menu **⋮** en haut à droite.',
      'Choisis **« Installer l’application »**.',
      'Confirme avec **« Installer »**. C’est fait.',
    ],
  },
  faq: {
    title: 'Questions fréquentes',
    items: [
      {
        q: 'Posto est-il vraiment gratuit ?',
        a: 'Oui. Pas d’abonnement, pas de fonctions payantes ni de publicité. Si tu le souhaites, tu peux soutenir volontairement le développement de l’application.',
      },
      { q: 'Dois-je créer un compte ?', a: 'Non. Posto fonctionne sans connexion et sans e-mail.' },
      {
        q: 'Où sont stockées mes données ?',
        a: 'Uniquement sur ton téléphone, dans la mémoire du navigateur. Nous ne les envoyons à aucun serveur et n’y avons pas accès.',
      },
      {
        q: 'Que faire si je change de téléphone ?',
        a: 'Exporte tes données dans un fichier depuis les Réglages de l’ancien téléphone, puis importe-les sur le nouveau.',
      },
      {
        q: 'Posto fonctionne-t-il sur iPhone et Android ?',
        a: 'Oui, avec Safari, Chrome et les autres navigateurs modernes. Sur iPhone, les notifications fonctionnent une fois Posto ajouté à l’écran d’accueil.',
      },
      {
        q: 'Le jeûne intermittent convient-il à tout le monde ?',
        a: 'Non. Posto ne remplace pas un avis médical. Consulte un médecin, surtout si tu es enceinte, si tu allaites, si tu as une maladie chronique, si tu prends des médicaments ou si tu as moins de 18 ans.',
      },
    ],
  },
  cta: {
    title: 'Commence ton premier jeûne dès aujourd’hui.',
    text: 'Gratuit, sans inscription, directement depuis ton navigateur.',
    button: 'Ouvrir Posto',
  },
  footer: {
    madeBy: 'par DeveloArt',
    disclaimer: 'Posto n’est pas un dispositif médical et ne remplace pas un avis médical.',
    copyright: '© 2026',
    terms: 'Conditions d’utilisation',
    privacy: 'Politique de confidentialité',
    support: 'Soutenir Posto',
    contact: 'Contact',
  },
};

const es: Dict = {
  meta: {
    title: 'Posto – temporizador gratuito de ayuno intermitente',
    description:
      'Posto es un temporizador sencillo para el ayuno intermitente. Sin registro, sin anuncios, tus datos se quedan en tu móvil.',
  },
  aria: {
    sections: 'Secciones de la página',
    highlights: 'Lo más importante',
    start: 'Empezar',
    footer: 'Pie de página',
    language: 'Idioma',
  },
  nav: {
    how: 'Cómo funciona',
    features: 'Funciones',
    install: 'Instalación',
    faq: 'Preguntas',
    open: 'Abrir la app',
  },
  hero: {
    pill: 'Gratis · Sin registro · App PWA',
    title: 'Ayuno intermitente, sencillo.',
    lead: 'Posto es un temporizador sencillo para el ayuno intermitente. Elige un protocolo, empieza tu ayuno y ve al instante cuánto tiempo falta y en qué fase estás.',
    cta: 'Abrir Posto gratis',
    howInstall: 'Cómo instalarla',
    checks: ['Sin cuenta ni e-mail', 'Sin anuncios', 'Tus datos se quedan en tu móvil'],
    chipFat: 'Quema de grasa',
    chipWater: '+250 ml',
  },
  cards: [
    {
      title: 'Sin registro',
      text: 'No creas una cuenta ni das tu e-mail. Abres la app y empiezas tu ayuno al instante.',
    },
    {
      title: 'Totalmente gratis',
      text: 'Sin suscripción, cargos ocultos ni anuncios. Todas las funciones están disponibles desde el principio.',
    },
    {
      title: 'En tu móvil',
      text: 'Instala Posto directamente desde el navegador, sin tienda de apps. Funciona en iPhone y Android.',
    },
  ],
  how: {
    title: 'Cómo funciona',
    steps: [
      {
        title: 'Elige un protocolo',
        text: '16:8, 18:6 o el suave 13:11 para empezar. Puedes cambiarlo en cualquier momento.',
      },
      {
        title: 'Empieza el ayuno',
        text: 'Un toque. ¿Se te olvidó? Ajusta la hora de tu última comida hacia atrás.',
      },
      {
        title: 'Sigue tu progreso',
        text: 'El temporizador muestra el tiempo hasta tu meta y la fase actual, y el historial construye tu racha de días.',
      },
    ],
  },
  features: {
    title: 'Todo lo que necesitas. Nada más.',
    lead: 'Tres pantallas que hacen bien su trabajo. Elige el tema claro u oscuro.',
    screenAlt: 'Pantalla de la app: {title}',
    items: [
      {
        title: 'Temporizador y fases del ayuno',
        text: 'Tiempo hasta la meta, hora de fin y la fase en la que estás: desde la digestión hasta la cetosis.',
      },
      {
        title: 'Historial y racha de días',
        text: 'Una semana en gráfico, la duración media de tus ayunos y los días seguidos que te motivan.',
      },
      {
        title: 'Agua y peso',
        text: 'Un vaso tras otro hasta tu objetivo diario y la tendencia de tu peso de los últimos 30 días.',
      },
    ],
  },
  protocols: {
    title: 'No tienes que empezar con **16:8**.',
    lead: 'Empieza poco a poco y alarga el ayuno gradualmente. Posto admite seis protocolos populares.',
    legendFast: 'ayuno',
    legendWindow: 'ventana de comida',
  },
  privacy: {
    title: 'Tus datos se quedan en tu móvil.',
    items: [
      {
        title: 'No enviamos nada',
        text: 'Ayunos, peso y agua se guardan solo en la memoria de tu navegador. No tenemos acceso a ellos.',
      },
      {
        title: 'Sin cookies',
        text: 'Solo recogemos estadísticas de visitas anónimas, sin cookies y sin banner de consentimiento.',
      },
      {
        title: 'Control total',
        text: 'Exporta tus datos a un archivo o bórralos con un botón en Ajustes.',
      },
    ],
  },
  install: {
    title: 'Instálala en 30 segundos',
    lead: 'Posto es una app PWA. La instalas desde el navegador y luego la abres desde la pantalla de inicio como cualquier otra app.',
    ios: [
      'Abre **{host}** en Safari.',
      'Toca **«Compartir»** – el cuadrado con una flecha hacia arriba.',
      'Elige **«Añadir a pantalla de inicio»**.',
      'Toca **«Añadir»**. Listo.',
    ],
    android: [
      'Abre **{host}** en Chrome.',
      'Toca el menú **⋮** arriba a la derecha.',
      'Elige **«Instalar aplicación»**.',
      'Confirma con **«Instalar»**. Listo.',
    ],
  },
  faq: {
    title: 'Preguntas frecuentes',
    items: [
      {
        q: '¿Posto es realmente gratis?',
        a: 'Sí. No hay suscripción, funciones de pago ni anuncios. Si quieres, puedes apoyar voluntariamente el desarrollo de la app.',
      },
      { q: '¿Necesito crear una cuenta?', a: 'No. Posto funciona sin iniciar sesión y sin e-mail.' },
      {
        q: '¿Dónde se guardan mis datos?',
        a: 'Solo en tu móvil, en la memoria del navegador. No los enviamos a ningún servidor y no tenemos acceso a ellos.',
      },
      {
        q: '¿Qué pasa si cambio de móvil?',
        a: 'Exporta los datos a un archivo en Ajustes en el móvil antiguo e impórtalos en el nuevo.',
      },
      {
        q: '¿Posto funciona en iPhone y Android?',
        a: 'Sí, en Safari, Chrome y otros navegadores modernos. En iPhone, las notificaciones funcionan después de añadir Posto a la pantalla de inicio.',
      },
      {
        q: '¿El ayuno intermitente es para todo el mundo?',
        a: 'No. Posto no sustituye la consulta médica. Habla con tu médico, sobre todo si estás embarazada, das el pecho, tienes una enfermedad crónica, tomas medicación o eres menor de 18 años.',
      },
    ],
  },
  cta: {
    title: 'Empieza tu primer ayuno hoy mismo.',
    text: 'Gratis, sin registro, directamente desde el navegador.',
    button: 'Abrir Posto',
  },
  footer: {
    madeBy: 'de DeveloArt',
    disclaimer: 'Posto no es un producto sanitario y no sustituye la consulta médica.',
    copyright: '© 2026',
    terms: 'Términos de uso',
    privacy: 'Política de privacidad',
    support: 'Apoyar Posto',
    contact: 'Contacto',
  },
};

export const dictionaries: Record<Locale, Dict> = { pl, en, uk, de, fr, es };

export function hasLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}
