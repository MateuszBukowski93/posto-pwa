import { STORAGE_KEYS } from './config';
import { FALLBACK_LOCALE } from './domain/settings';
import { LOCALES } from './domain/types';

/**
 * Skrypt inline uruchamiany przed hydratacją:
 * - ustawia motyw bez mignięcia,
 * - ustawia <html lang> i ukrywa treść, dopóki nie wczytają się komunikaty w innym języku niż PL
 *   (prerenderowany HTML jest po polsku), z bezpiecznikiem 3 s,
 * - przechwytuje beforeinstallprompt, zanim React zdąży się zamontować.
 */
export const BOOT_SCRIPT = `(function(){try{
var d=document.documentElement,s=localStorage;
var t=s.getItem(${JSON.stringify(STORAGE_KEYS.theme)})||'system';
var dark=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);
d.setAttribute('data-theme',dark?'dark':'light');d.style.colorScheme=dark?'dark':'light';
var L=${JSON.stringify(LOCALES)},p=s.getItem(${JSON.stringify(STORAGE_KEYS.locale)})||'system',l=null;
if(p!=='system'&&L.indexOf(p)>=0){l=p}else{var n=navigator.languages||[navigator.language];for(var i=0;i<n.length;i++){var b=String(n[i]||'').toLowerCase().split('-')[0];if(L.indexOf(b)>=0){l=b;break}}}
l=l||${JSON.stringify(FALLBACK_LOCALE)};d.lang=l;
if(l!=='pl'){d.setAttribute('data-i18n-pending','');setTimeout(function(){d.removeAttribute('data-i18n-pending')},3000)}
}catch(e){}
window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__postoInstallPrompt=e});
})();`;
