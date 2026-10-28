import { ecran } from './canvas.js';

// Plusieurs doigts à la fois (jusqu'à 3). Chaque scène reçoit, avec le numéro du doigt :
// down(x,y,id) / move(x,y,px,py,dt,id) / up(x,y,id) / tap(x,y)  (coordonnées logiques).
export function brancherEntrees(cv, scene) {
  const doigts = new Map();
  const pos = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * ecran.W, (e.clientY - r.top) / r.height * ecran.H]; };
  cv.addEventListener('pointerdown', (e) => {
    if (doigts.size >= 3 || doigts.has(e.pointerId)) return;
    try { cv.setPointerCapture(e.pointerId); } catch (_) {}
    const [x, y] = pos(e);
    doigts.set(e.pointerId, { x, y, t: e.timeStamp, max: 0, px: x, py: y, pt: e.timeStamp });
    const s = scene(); if (s.down) s.down(x, y, e.pointerId);
    e.preventDefault();
  });
  cv.addEventListener('pointermove', (e) => {
    const d = doigts.get(e.pointerId); if (!d) return;
    const [x, y] = pos(e);
    const dt = (e.timeStamp - d.pt) / 1000;
    d.max = Math.max(d.max, Math.hypot(x - d.x, y - d.y));
    const s = scene(); if (s.move) s.move(x, y, d.px, d.py, dt, e.pointerId);
    d.px = x; d.py = y; d.pt = e.timeStamp;
  });
  const fin = (e) => {
    const d = doigts.get(e.pointerId); if (!d) return;
    const [x, y] = pos(e), s = scene(), court = d.max < 14 && e.timeStamp - d.t < 500;
    if (s.up) s.up(x, y, e.pointerId);
    if (court && e.type === 'pointerup' && s.tap) s.tap(x, y);
    doigts.delete(e.pointerId);
  };
  cv.addEventListener('pointerup', fin);
  cv.addEventListener('pointercancel', fin);
  cv.addEventListener('contextmenu', (e) => e.preventDefault());
}
