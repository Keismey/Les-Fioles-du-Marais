// La lanterne : ce qu'elle éclaire, et son dessin.
const PI2 = Math.PI * 2;

export function lanterneEtat(n) {
  const b = n.bat;
  let f = 0.5 + 0.5 * Math.min(1, n.huile / 30);        // huile basse : la lumière rétrécit
  let force = n.eteint > 0 ? 0.08 : 1;                   // lanterne soufflée
  if (n.fin) { const k = Math.max(0, 1 - n.fin / 1.4); f *= k; force *= k; }
  if (n.huile < 22) force *= 0.82 + 0.18 * Math.sin(n.t * 23) * Math.sin(n.t * 7.3);
  const R = 235 * f;
  return { x: b.x + Math.cos(b.cap) * 16, y: b.y + Math.sin(b.cap) * 16, cap: b.cap, R, Rc: 46 + 0.12 * R, demi: 0.62, force };
}

// éclairage du faisceau seul (0 à 1)
export function cone(L, x, y) {
  if (L.force <= 0.01 || L.R < 5) return 0;
  const dx = x - L.x, dy = y - L.y, d = Math.hypot(dx, dy);
  if (d >= L.R) return 0;
  let a = Math.atan2(dy, dx) - L.cap;
  a = Math.atan2(Math.sin(a), Math.cos(a));
  const u = Math.abs(a) / L.demi;
  if (u >= 1) return 0;
  return Math.min(1, (1 - d / L.R) * (1 - u * u) * 1.7) * L.force;
}

// éclairage total : faisceau + petit halo autour de la barque
export function eclairage(L, x, y) {
  const d = Math.hypot(x - L.x, y - L.y);
  const c = d < L.Rc ? (1 - d / L.Rc) * L.force : 0;
  return Math.max(c, cone(L, x, y));
}

export function dessinerLumiere(ctx, L) {
  if (L.force <= 0.01 || L.R < 5) return;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  let g = ctx.createRadialGradient(L.x, L.y, 0, L.x, L.y, L.Rc * 1.4);
  g.addColorStop(0, `rgba(255,200,120,${0.28 * L.force})`); g.addColorStop(1, 'rgba(255,170,70,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(L.x, L.y, L.Rc * 1.4, 0, PI2); ctx.fill();
  for (const k of [1, 0.72, 0.45]) {   // trois secteurs emboîtés = bords doux
    g = ctx.createRadialGradient(L.x, L.y, 0, L.x, L.y, L.R);
    g.addColorStop(0, `rgba(255,205,125,${0.15 * L.force})`);
    g.addColorStop(0.55, `rgba(255,185,90,${0.08 * L.force})`);
    g.addColorStop(1, 'rgba(255,170,60,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(L.x, L.y);
    ctx.arc(L.x, L.y, L.R, L.cap - L.demi * k, L.cap + L.demi * k); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}
