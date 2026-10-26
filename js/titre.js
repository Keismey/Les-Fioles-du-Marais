import { ecran } from './canvas.js';
import * as D from './dessin.js';
import { t, langue, setLang } from './i18n.js';
import { ORDRE } from './ingredients.js';
import { total } from './save.js';

export function titre(jeu) {
  const S = {};
  let tt = 0;
  const lucioles = Array.from({ length: 16 }, () => ({ x: Math.random(), y: 0.3 + Math.random() * 0.55, ph: Math.random() * 6.28, v: 0.02 + Math.random() * 0.03 }));
  const zl = () => ({ x: ecran.W - 66, y: ecran.hautSur + 10, w: 52, h: 28 });

  S.entrer = () => { tt = 0; };
  S.maj = (dt) => { tt += dt; };
  S.retour = () => 'hub';
  S.tap = (x, y) => {
    const z = zl();
    if (x >= z.x - 8 && x <= z.x + z.w + 8 && y >= z.y - 8 && y <= z.y + z.h + 8) { setLang(langue() === 'fr' ? 'en' : 'fr', jeu.save); jeu.sauver(); return; }
    jeu.aller('cueillette');
  };

  S.dessiner = (ctx) => {
    const { W, H } = ecran;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#07131a'); g.addColorStop(1, '#0d2b2a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; D.lueur(ctx, W * 0.78, H * 0.13, 90, '#cfe8ff', 0.25); ctx.restore();
    ctx.fillStyle = '#eef3d8'; ctx.beginPath(); ctx.arc(W * 0.78, H * 0.13, 22, 0, 6.2832); ctx.fill();
    // roseaux au premier plan
    ctx.strokeStyle = '#17352a'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath();
    for (let i = 0; i < 40; i++) { const x = (i * 37) % W, h = 30 + (i * 53) % 50; ctx.moveTo(x, H); ctx.lineTo(x + Math.sin(tt + i) * 4, H - h); }
    ctx.stroke();
    // barque et lanterne
    const bx = W / 2, by = H * 0.76 + Math.sin(tt * 1.4) * 2;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; D.lueur(ctx, bx, by - 10, 110, '#ffc46a', 0.3); ctx.restore();
    D.barque(ctx, { x: bx, y: by, cap: -Math.PI / 2 }, tt, 0, true);
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (const l of lucioles) { const a = 0.3 + 0.3 * Math.sin(tt * 2 + l.ph); D.lueur(ctx, ((l.x + Math.sin(tt * l.v * 6 + l.ph) * 0.05) % 1) * W, l.y * H + Math.cos(tt * 0.7 + l.ph) * 8, 7, '#d8ff8a', a); }
    ctx.restore();
    // titre
    const hs = ecran.hautSur;
    D.ecrire(ctx, t('titre1'), W / 2, hs + H * 0.2, 44, '#eaf3d2', 'center', '700', 'Georgia, serif');
    D.ecrire(ctx, t('titre2'), W / 2, hs + H * 0.2 + 46, 38, '#9fe3b4', 'center', '700', 'Georgia, serif');
    if ('letterSpacing' in ctx) ctx.letterSpacing = '2px';
    D.ecrire(ctx, t('sous'), W / 2, hs + H * 0.2 + 78, 14, '#b9c9bf', 'center', '500');
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    // réserve
    const ids = ORDRE.filter((id) => total(jeu.save, id) > 0);
    if (jeu.save.nuits > 0) {
      D.ecrire(ctx, t('nuit', { n: jeu.save.nuits + 1 }), W / 2, H * 0.43, 14, '#d9c9a0');
      ids.forEach((id, i) => {
        const col = i % 4, row = Math.floor(i / 4), x = W / 2 + (col - (Math.min(4, ids.length - row * 4) - 1) / 2) * 76, y = H * 0.48 + row * 36;
        D.icone(ctx, id, x - 14, y, 0.8); D.ecrire(ctx, String(total(jeu.save, id)), x - 2, y + 5, 14, '#e8efe0', 'left');
      });
    }
    ctx.globalAlpha = 0.55 + 0.45 * Math.sin(tt * 2.5);
    D.ecrire(ctx, t('jouer'), W / 2, H * 0.91, 17, '#ffe9c2');
    ctx.globalAlpha = 1;
    // langue
    const z = zl();
    ctx.fillStyle = 'rgba(255,255,255,.08)'; D.rect(ctx, z.x, z.y, z.w, z.h, 14); ctx.fill();
    D.ecrire(ctx, t('autre'), z.x + z.w / 2, z.y + 19, 13, '#cfd9d2');
  };
  return S;
}
