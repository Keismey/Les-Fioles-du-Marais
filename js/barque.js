// Pilotage de la barque : joystick flottant au doigt, réponse rapide, collisions avec les îlots.
const VMAX = 150;       // vitesse maxi (px/s)
const ZONE_MORTE = 10;  // glissement minimum avant que le doigt compte
const PLEINE = 50;      // glissement qui donne la pleine vitesse

const borne = (v, a, b) => Math.max(a, Math.min(b, v));

// stick = { dx, dy } : glissement du doigt depuis son point de départ (ou null)
export function piloter(b, dt, stick, m) {
  let tx = 0, ty = 0;
  const d = stick ? Math.hypot(stick.dx, stick.dy) : 0;
  if (d > ZONE_MORTE) {
    const ang = Math.atan2(stick.dy, stick.dx);
    let da = ang - b.cap; da = Math.atan2(Math.sin(da), Math.cos(da));
    b.cap += da * Math.min(1, dt * 14);
    const v = VMAX * borne(0.3 + 0.7 * (d - ZONE_MORTE) / (PLEINE - ZONE_MORTE), 0.3, 1);
    tx = Math.cos(ang) * v; ty = Math.sin(ang) * v;
  }
  const k = Math.min(1, dt * (d > ZONE_MORTE ? 9 : 3.5));
  b.vx += (tx - b.vx) * k; b.vy += (ty - b.vy) * k;
  b.x += b.vx * dt; b.y += b.vy * dt;
  for (const o of m.ilots) {
    const dx = b.x - o.x, dy = b.y - o.y, dd = Math.hypot(dx, dy), min = o.r + 16;
    if (dd < min && dd > 0) {
      b.x = o.x + dx / dd * min; b.y = o.y + dy / dd * min;
      const dot = (b.vx * dx + b.vy * dy) / dd;
      if (dot < 0) { b.vx -= dot * dx / dd; b.vy -= dot * dy / dd; }
    }
  }
  b.x = borne(b.x, 60, m.w - 60); b.y = borne(b.y, 60, m.h - 60);
  b.vit = Math.hypot(b.vx, b.vy);
}
