// Le pavé de navigation : fixe, en bas à gauche. Le doigt qui commence dedans rame ; tout le reste de l'écran sert à couper.
import { ecran } from './canvas.js';

const PI2 = Math.PI * 2;
export const RAYON = 52;     // anneau dessiné = glissement qui donne la pleine vitesse
const ZONE = 92;             // le doigt qui se pose à cette distance du centre prend le pavé

export const pave = () => ({ x: 74, y: ecran.H - 104 });
export function dansPave(x, y) { const p = pave(); return Math.hypot(x - p.x, y - p.y) <= ZONE; }

// doigt = { x, y } (position du doigt qui tient le pavé) ou null
export function dessinerPave(ctx, doigt) {
  const p = pave(), actif = !!doigt;
  let kx = p.x, ky = p.y;
  if (doigt) { const dx = doigt.x - p.x, dy = doigt.y - p.y, l = Math.hypot(dx, dy) || 1, k = Math.min(1, RAYON / l); kx += dx * k; ky += dy * k; }
  ctx.fillStyle = actif ? 'rgba(255,230,180,.10)' : 'rgba(255,230,180,.06)';
  ctx.beginPath(); ctx.arc(p.x, p.y, RAYON + 6, 0, PI2); ctx.fill();
  ctx.strokeStyle = actif ? 'rgba(255,230,180,.5)' : 'rgba(255,230,180,.28)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(p.x, p.y, RAYON + 6, 0, PI2); ctx.stroke();
  ctx.fillStyle = actif ? 'rgba(255,230,180,.55)' : 'rgba(255,230,180,.3)';
  ctx.beginPath(); ctx.arc(kx, ky, 20, 0, PI2); ctx.fill();
}
