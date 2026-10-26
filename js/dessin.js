// Dessins provisoires (formes simples). Les vrais visuels viendront plus tard.
import { INGREDIENTS } from './ingredients.js';

const PI2 = Math.PI * 2;

export function rgba(hex, a) { const v = parseInt(hex.slice(1), 16); return `rgba(${v >> 16},${(v >> 8) & 255},${v & 255},${a})`; }

export function ecrire(ctx, txt, x, y, px, col, align = 'center', poids = '600', famille = 'system-ui, -apple-system, sans-serif') {
  ctx.font = `${poids} ${px}px ${famille}`; ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = 'alphabetic'; ctx.fillText(txt, x, y);
}

export function rect(ctx, x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

export function lueur(ctx, x, y, r, hex, a) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(hex, a)); g.addColorStop(1, rgba(hex, 0));
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, PI2); ctx.fill();
}

export function bouton(ctx, x, y, w, h, txt) {
  ctx.fillStyle = 'rgba(255,214,140,.14)'; rect(ctx, x, y, w, h, 14); ctx.fill();
  ctx.strokeStyle = 'rgba(255,214,140,.55)'; ctx.lineWidth = 1.5; ctx.stroke();
  ecrire(ctx, txt, x + w / 2, y + h / 2 + 5, 16, '#ffe9c2');
}

export function fondEau(ctx, W, H) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0b2126'); g.addColorStop(1, '#071418');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

const rond = (ctx, x, y, r) => { ctx.beginPath(); ctx.arc(x, y, r, 0, PI2); ctx.fill(); };

// icône d'un ingrédient, centrée en (x,y), taille s (1 = environ 24 px)
export function icone(ctx, id, x, y, s, a = 1) {
  const ing = INGREDIENTS[id]; if (!ing) return;
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a;
  ctx.fillStyle = ing.couleur; ctx.strokeStyle = ing.couleur; ctx.lineWidth = 1.8; ctx.lineCap = 'round';
  switch (ing.forme) {
    case 'lis':
      for (let i = 0; i < 6; i++) { ctx.save(); ctx.rotate(i * Math.PI / 3); ctx.beginPath(); ctx.ellipse(0, -6, 3, 6, 0, 0, PI2); ctx.fill(); ctx.restore(); }
      ctx.fillStyle = '#fff6c8'; rond(ctx, 0, 0, 2.4); break;
    case 'jonc':
      for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(i * 3, 10); ctx.lineTo(i * 4.5, -9); ctx.stroke(); }
      ctx.fillStyle = '#8a5a2b';
      for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.ellipse(i * 4.5, -10, 1.8, 4, 0, 0, PI2); ctx.fill(); }
      break;
    case 'mousse':
      for (const [px, py, pr] of [[-5, 2, 4], [2, -3, 4.5], [6, 4, 3.5], [-1, 6, 3.5], [-7, -3, 3]]) rond(ctx, px, py, pr);
      break;
    case 'ombelle':
      ctx.beginPath(); ctx.moveTo(0, 10); ctx.lineTo(0, -2); ctx.stroke();
      for (let i = 0; i < 5; i++) { const a = -Math.PI + 0.35 + i * (Math.PI - 0.7) / 4; ctx.beginPath(); ctx.moveTo(0, -2); ctx.lineTo(Math.cos(a) * 8, -2 + Math.sin(a) * 8); ctx.stroke(); rond(ctx, Math.cos(a) * 8, -2 + Math.sin(a) * 8, 2.4); }
      break;
    case 'champignon':
      ctx.fillRect(-2, 0, 4, 9);
      ctx.beginPath(); ctx.ellipse(0, 0, 8, 6, 0, Math.PI, 0); ctx.fill(); break;
    case 'fleur':
      for (let i = 0; i < 8; i++) { ctx.save(); ctx.rotate(i * Math.PI / 4); ctx.beginPath(); ctx.ellipse(0, -6.5, 2.8, 5.5, 0, 0, PI2); ctx.fill(); ctx.restore(); }
      ctx.fillStyle = '#3a0d1c'; rond(ctx, 0, 0, 3); break;
    case 'goutte':
      ctx.beginPath(); ctx.moveTo(0, -9); ctx.bezierCurveTo(7, 0, 7, 8, 0, 8); ctx.bezierCurveTo(-7, 8, -7, 0, 0, -9); ctx.fill(); break;
    case 'etoile':
      ctx.beginPath();
      for (let i = 0; i < 8; i++) { const r = i % 2 ? 3 : 9, a = i * Math.PI / 4 - Math.PI / 2; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
      ctx.closePath(); ctx.fill(); break;
  }
  ctx.restore();
}

function ilot(ctx, o) {
  ctx.fillStyle = '#0f1d16'; ctx.strokeStyle = '#1f3a2a'; ctx.lineWidth = 3;
  ctx.beginPath();
  o.pts.forEach(([x, y], i) => { if (i) ctx.lineTo(o.x + x, o.y + y); else ctx.moveTo(o.x + x, o.y + y); });
  ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#2c4a30'; ctx.lineWidth = 1.6; ctx.lineCap = 'round';
  ctx.beginPath();
  for (const j of o.joncs) {
    const bx = o.x + Math.cos(j.a) * o.r * 0.95, by = o.y + Math.sin(j.a) * o.r * 0.95;
    ctx.moveTo(bx, by); ctx.lineTo(bx + Math.cos(j.a) * 4 + j.pen, by + Math.sin(j.a) * 4 - j.h);
  }
  ctx.stroke();
}

// décor du marais : nénuphars, îlots, roseaux des bords, ponton (en coordonnées du monde)
export function decor(ctx, m, cam, W, H) {
  const x0 = cam.x - 80, x1 = cam.x + W + 80, y0 = cam.y - 80, y1 = cam.y + H + 80;
  ctx.fillStyle = '#10332b';
  for (const l of m.lilas) {
    if (l.x < x0 || l.x > x1 || l.y < y0 || l.y > y1) continue;
    ctx.beginPath(); ctx.ellipse(l.x, l.y, l.s, l.s * 0.7, l.a, 0, PI2); ctx.fill();
  }
  for (const o of m.ilots) {
    if (o.x + o.r < x0 || o.x - o.r > x1 || o.y + o.r < y0 || o.y - o.r > y1) continue;
    ilot(ctx, o);
  }
  ctx.strokeStyle = '#1d3d2b'; ctx.lineWidth = 2; ctx.lineCap = 'round';
  ctx.beginPath();
  for (const r of m.bord) {
    if (r.x < x0 || r.x > x1 || r.y < y0 || r.y > y1) continue;
    ctx.moveTo(r.x, r.y); ctx.lineTo(r.x + r.pen, r.y - r.h);
  }
  ctx.stroke();
  // ponton
  const d = m.depart;
  if (d.y + 100 > y0 && d.y - 100 < y1) {
    ctx.fillStyle = '#2a1d12'; ctx.fillRect(d.x - 34, m.h - 70, 68, 70);
    ctx.strokeStyle = '#3d2b1b'; ctx.lineWidth = 1.5; ctx.beginPath();
    for (let i = 1; i < 5; i++) { ctx.moveTo(d.x - 34, m.h - 70 + i * 14); ctx.lineTo(d.x + 34, m.h - 70 + i * 14); }
    ctx.stroke();
  }
}

export function barque(ctx, b, t, vit, allumee) {
  ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.cap);
  ctx.fillStyle = '#2b1c12'; ctx.strokeStyle = '#6a4a30'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(18, 0); ctx.quadraticCurveTo(8, -9, -14, -8); ctx.lineTo(-16, 0); ctx.lineTo(-14, 8); ctx.quadraticCurveTo(8, 9, 18, 0);
  ctx.fill(); ctx.stroke();
  const k = Math.sin(t * 6) * Math.min(1, vit / 60) * 0.5;
  ctx.strokeStyle = '#5a4430'; ctx.lineWidth = 1.8; ctx.beginPath();
  ctx.moveTo(-2, -6); ctx.lineTo(-8 - 6 * k, -17); ctx.moveTo(-2, 6); ctx.lineTo(-8 + 6 * k, 17); ctx.stroke();
  ctx.fillStyle = allumee ? '#ffd27a' : '#6a5a48'; rond(ctx, 14, 0, 3);
  ctx.restore();
}

export function sangsue(ctx, c, t, a) {
  ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.ang); ctx.globalAlpha = a;
  ctx.strokeStyle = '#5b2f3b'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.beginPath();
  for (let i = 0; i <= 6; i++) { const u = -9 + i * 3, v = Math.sin(t * 9 - i * 0.9 + c.ph) * 2.2; if (i) ctx.lineTo(u, v); else ctx.moveTo(u, v); }
  ctx.stroke(); ctx.fillStyle = '#8a4455'; rond(ctx, 9, 0, 3);
  ctx.restore();
}

export function feuFollet(ctx, c, t) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  lueur(ctx, c.x, c.y, 48, '#6fb4ff', 0.6);
  ctx.restore();
  ctx.fillStyle = 'rgba(140,200,255,.85)'; rond(ctx, c.x, c.y, 7);
  ctx.fillStyle = '#eef8ff'; rond(ctx, c.x, c.y, 4 + Math.sin(t * 12 + c.ph) * 0.8);
}
