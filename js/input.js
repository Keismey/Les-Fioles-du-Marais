import { ecran } from './canvas.js';

// Un seul doigt à la fois. Chaque scène reçoit down / move / up / tap (coordonnées logiques).
export function brancherEntrees(cv, scene) {
  let actif = null, dep = null;
  const pos = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * ecran.W, (e.clientY - r.top) / r.height * ecran.H]; };
  cv.addEventListener('pointerdown', (e) => {
    if (actif !== null) return;
    actif = e.pointerId;
    try { cv.setPointerCapture(actif); } catch (_) {}
    const [x, y] = pos(e);
    dep = { x, y, t: e.timeStamp, max: 0, px: x, py: y, pt: e.timeStamp };
    const s = scene(); if (s.down) s.down(x, y);
    e.preventDefault();
  });
  cv.addEventListener('pointermove', (e) => {
    if (e.pointerId !== actif) return;
    const [x, y] = pos(e);
    const dt = (e.timeStamp - dep.pt) / 1000;
    dep.max = Math.max(dep.max, Math.hypot(x - dep.x, y - dep.y));
    const s = scene(); if (s.move) s.move(x, y, dep.px, dep.py, dt);
    dep.px = x; dep.py = y; dep.pt = e.timeStamp;
  });
  const fin = (e) => {
    if (e.pointerId !== actif) return;
    const [x, y] = pos(e), s = scene(), court = dep.max < 14 && e.timeStamp - dep.t < 500;
    if (s.up) s.up(x, y);
    if (court && e.type === 'pointerup' && s.tap) s.tap(x, y);
    actif = null; dep = null;
  };
  cv.addEventListener('pointerup', fin);
  cv.addEventListener('pointercancel', fin);
  cv.addEventListener('contextmenu', (e) => e.preventDefault());
}
