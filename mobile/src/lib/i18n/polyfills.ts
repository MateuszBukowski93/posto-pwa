/**
 * Polyfille Intl dla silnika Hermes (brak Intl.PluralRules / Intl.Locale na części wersji).
 * Każdy z nich sprawdza, czy natywna implementacja wystarcza, i wtedy nic nie robi.
 * Musi być zaimportowany przed use-intl (pierwsza linia app/_layout.tsx).
 */
import '@formatjs/intl-getcanonicallocales/polyfill.js';
import '@formatjs/intl-locale/polyfill.js';
import '@formatjs/intl-pluralrules/polyfill.js';
import '@formatjs/intl-pluralrules/locale-data/de.js';
import '@formatjs/intl-pluralrules/locale-data/en.js';
import '@formatjs/intl-pluralrules/locale-data/es.js';
import '@formatjs/intl-pluralrules/locale-data/fr.js';
import '@formatjs/intl-pluralrules/locale-data/it.js';
import '@formatjs/intl-pluralrules/locale-data/pl.js';
import '@formatjs/intl-pluralrules/locale-data/pt.js';
import '@formatjs/intl-pluralrules/locale-data/uk.js';
