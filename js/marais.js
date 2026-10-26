import { hasard } from './hasard.js';
import { PLANTES } from './ingredients.js';

export const LARGEUR = 1400;
export const HAUTEUR = 2000;
const PORTEE = 1700;   // distance du ponton à partir de laquelle on est « tout au fond »
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// 0 = au ponton, 1 = tout au fond du marais
export function profondeur(m, x, y) { return Math.min(1, Math.hypot(x - m.depart.x, y - m.depart.y) / PORTEE); }

function pesee(r, liste) {
  let tot = 0; for (const p of liste) tot += p.poids;
  let v = r() * tot;
  for (const p of liste) { v -= p.poids; if (v <= 0) return p.id; }
  return liste[0].id;
}

// Un marais différent à chaque nuit : îlots, plantes, décor tirés au hasard.
export function genererMarais(graine) {
  const r = hasard(graine);
  const m = { graine, w: LARGEUR, h: HAUTEUR, depart: { x: LARGEUR / 2, y: HAUTEUR - 140 }, ilots: [], plantes: [], lilas: [], bord: [] };
  for (let i = 0; i < 90 && m.ilots.length < 18; i++) {
    const o = { x: r.entre(120, LARGEUR - 120), y: r.entre(120, HAUTEUR - 380), r: r.entre(34, 92) };
    if (dist(o, m.depart) < o.r + 240) continue;
    if (m.ilots.some((p) => dist(o, p) < o.r + p.r + 110)) continue;
    o.pts = [];
    for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2, d = o.r * r.entre(0.82, 1.08); o.pts.push([Math.cos(a) * d, Math.sin(a) * d]); }
    o.joncs = [];
    const nj = 5 + Math.floor(r() * 5);
    for (let k = 0; k < nj; k++) o.joncs.push({ a: r.entre(0, Math.PI * 2), h: r.entre(10, 20), pen: r.entre(-4, 4) });
    m.ilots.push(o);
  }
  for (let essais = 0; m.plantes.length < 34 && essais < 800; essais++) {
    let x, y;
    if (m.ilots.length && r() < 0.6) {
      const o = r.choix(m.ilots), a = r.entre(0, Math.PI * 2), d = o.r + r.entre(18, 46);
      x = o.x + Math.cos(a) * d; y = o.y + Math.sin(a) * d;
    } else { x = r.entre(80, LARGEUR - 80); y = r.entre(80, HAUTEUR - 200); }
    if (x < 70 || x > LARGEUR - 70 || y < 70 || y > HAUTEUR - 120) continue;
    const p = { x, y };
    if (dist(p, m.depart) < 170) continue;
    if (m.ilots.some((o) => dist(p, o) < o.r + 14)) continue;
    if (m.plantes.some((q) => dist(p, q) < 46)) continue;
    const d = profondeur(m, x, y);
    m.plantes.push({ id: pesee(r, PLANTES.filter((q) => q.min <= d)), x, y, ph: r.entre(0, Math.PI * 2), vivante: true });
  }
  for (let i = 0; i < 60; i++) m.lilas.push({ x: r.entre(0, LARGEUR), y: r.entre(0, HAUTEUR), s: r.entre(7, 15), a: r.entre(0, 3) });
  const roseau = (x, y) => m.bord.push({ x, y, h: r.entre(14, 30), pen: r.entre(-5, 5) });
  for (let x = 0; x <= LARGEUR; x += 26) { roseau(x + r.entre(-6, 6), r.entre(28, 60)); roseau(x + r.entre(-6, 6), HAUTEUR - r.entre(10, 40)); }
  for (let y = 0; y <= HAUTEUR; y += 26) { roseau(r.entre(28, 60), y + r.entre(-6, 6)); roseau(LARGEUR - r.entre(28, 60), y + r.entre(-6, 6)); }
  return m;
}
