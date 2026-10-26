import fr from './lang/fr.js';
import en from './lang/en.js';

const D = { fr, en };
let L = 'fr';

export function langue() { return L; }

export function t(cle, vars) {
  let s = (D[L] && D[L][cle]) || D.fr[cle] || cle;
  if (vars) for (const k in vars) s = s.replace('{' + k + '}', vars[k]);
  return s;
}

function appliquer(l) {
  L = l;
  try {
    document.documentElement.lang = l;
    document.title = t('doc');
    const m = document.getElementById('manifest');
    if (m) m.href = l === 'en' ? 'manifest-en.webmanifest' : 'manifest.webmanifest';
  } catch (e) {}
}

// ?lang= du hub > langue mémorisée > langue du téléphone
export function initLangue(save) {
  let p = null;
  try { p = new URLSearchParams(location.search).get('lang'); } catch (e) {}
  if (p === 'fr' || p === 'en') save.settings.lang = p;
  let l = save.settings.lang;
  if (l !== 'fr' && l !== 'en') l = ((navigator.language || 'en').toLowerCase().indexOf('fr') === 0) ? 'fr' : 'en';
  appliquer(l);
}

export function setLang(l, save) {
  save.settings.lang = l;
  appliquer(l);
  try { const u = new URL(location.href); u.searchParams.set('lang', l); history.replaceState(history.state, '', u); } catch (e) {}
}
