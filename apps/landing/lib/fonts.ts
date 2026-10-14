import { Bricolage_Grotesque, Manrope } from 'next/font/google';

// Bricolage nie ma cyrylicy – dla ukraińskiego nagłówki spadają na font systemowy (--display w globals.css).
const bricolage = Bricolage_Grotesque({
  subsets: ['latin', 'latin-ext'],
  axes: ['opsz'],
  variable: '--font-bricolage',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  variable: '--font-manrope',
  display: 'swap',
});

export const fontClassName = `${bricolage.variable} ${manrope.variable}`;
