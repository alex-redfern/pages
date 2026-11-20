// Translations. The English text in the code is the key; fr.js and es.js map it to French and Spanish.
// Anything missing from a translation file falls back to English, so the game never shows a blank.
// The chosen language is kept on this device under its own key, separate from progress.

import fr from './lang/fr.js';
import es from './lang/es.js';

export const LANGS = {
  en: { label: 'English', flag: '🇬🇧', locale: 'en-GB', dict: {} },
  fr: { label: 'Français', flag: '🇫🇷', locale: 'fr-FR', dict: fr },
  es: { label: 'Español', flag: '🇪🇸', locale: 'es-ES', dict: es },
};

const KEY = 'critter-classroom-lang';

function initial() {
  try {
    const saved = localStorage.getItem(KEY);
    if (LANGS[saved]) return saved;
  } catch { /* ignore */ }
  const nav = (navigator.language || 'en').slice(0, 2).toLowerCase();
  return LANGS[nav] ? nav : 'en';
}

let lang = initial();
document.documentElement.lang = LANGS[lang].locale;

export const getLang = () => lang;
export const locale = () => LANGS[lang].locale;

export function setLang(l) {
  if (!LANGS[l]) return;
  lang = l;
  try { localStorage.setItem(KEY, l); } catch { /* ignore */ }
  document.documentElement.lang = LANGS[l].locale;
}

// tr('Hi, {name}!', { name }) → the text in the current language, with {placeholders} filled in.
export function tr(text, vars) {
  let s = LANGS[lang].dict[text] ?? text;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? vars[k] : m));
  return s;
}

// Lists (praise, greetings, name ideas) are stored under a key, with the English list as the fallback.
export const trList = (key, english) => LANGS[lang].dict[key] ?? english;

// Pick the singular or plural form. French treats 0 as singular.
export const plural = (n, one, many, vars = {}) => tr((lang === 'fr' ? n <= 1 : n === 1) ? one : many, { n, ...vars });
