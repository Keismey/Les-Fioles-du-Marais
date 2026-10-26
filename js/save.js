// Sauvegarde : une seule clé (tous les jeux du hub partagent la même origine, donc la clé doit être unique).
const CLE = 'fioles_save_v1';

function neuf() { return { v: 1, settings: { lang: null }, nuits: 0, stock: {} }; }

export function charger() {
  try {
    const s = JSON.parse(localStorage.getItem(CLE) || 'null');
    if (s && s.v === 1) {
      const b = neuf();
      return { ...b, ...s, settings: { ...b.settings, ...(s.settings || {}) }, stock: s.stock || {} };
    }
  } catch (e) {}
  return neuf();
}

export function sauver(s) { try { localStorage.setItem(CLE, JSON.stringify(s)); } catch (e) {} }

// stock[id] = [nombre de qualité 1, qualité 2, qualité 3]
export function terminerNuit(s, butin) {
  s.nuits += 1;
  for (const id in butin) {
    const cur = s.stock[id] || (s.stock[id] = [0, 0, 0]);
    for (let i = 0; i < 3; i++) cur[i] += butin[id][i] | 0;
  }
  sauver(s);
}

export function total(s, id) { const a = s.stock[id]; return a ? a[0] + a[1] + a[2] : 0; }
