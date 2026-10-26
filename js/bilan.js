import { ecran } from './canvas.js';
import * as D from './dessin.js';
import { t } from './i18n.js';
import { ORDRE } from './ingredients.js';
import { terminerNuit } from './save.js';

export function bilan(jeu) {
  const S = {};
  let lignes = [], tt = 0;

  S.entrer = (butin) => {
    tt = 0; butin = butin || {};
    lignes = ORDRE.filter((id) => butin[id]).map((id) => ({ id, q: butin[id], tot: butin[id][0] + butin[id][1] + butin[id][2] })).filter((l) => l.tot > 0);
    terminerNuit(jeu.save, butin);   // ingrédients rangés dans le stock et sauvegardés
  };
  S.maj = (dt) => { tt += dt; };
  S.tap = () => { if (tt > 0.8) jeu.aller('titre'); };
  S.retour = () => { jeu.aller('titre'); return null; };

  S.dessiner = (ctx) => {
    const { W, H } = ecran, hs = ecran.hautSur;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#16303a'); g.addColorStop(0.6, '#3b4b4a'); g.addColorStop(1, '#8a5f45');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    D.ecrire(ctx, t('bilan.titre'), W / 2, hs + H * 0.12, 30, '#f6e7c4', 'center', '700', 'Georgia, serif');
    D.ecrire(ctx, t('bilan.sous'), W / 2, hs + H * 0.12 + 28, 14, '#d9cdb0');
    if (!lignes.length) D.ecrire(ctx, t('bilan.vide'), W / 2, H * 0.4, 15, '#f1e6cf');
    lignes.forEach((l, i) => {
      const a = Math.min(1, Math.max(0, (tt - 0.3 - i * 0.35) * 3));
      if (a <= 0) return;
      const y = hs + H * 0.22 + i * 46;
      ctx.globalAlpha = a;
      D.icone(ctx, l.id, 40, y, 1.1);
      D.ecrire(ctx, t('ing.' + l.id), 66, y - 2, 15, '#f6efd8', 'left');
      const det = l.q.map((c, k) => (c ? '★'.repeat(k + 1) + ' ×' + c : null)).filter(Boolean).join('   ');
      D.ecrire(ctx, det, 66, y + 15, 12, '#cdbf9f', 'left', '500');
      D.ecrire(ctx, '×' + l.tot, W - 30, y + 5, 18, '#ffe9c2', 'right');
      ctx.globalAlpha = 1;
    });
    if (tt > 0.8) { ctx.globalAlpha = 0.55 + 0.45 * Math.sin(tt * 2.5); D.ecrire(ctx, t('bilan.suite'), W / 2, H - 50, 15, '#ffe9c2'); ctx.globalAlpha = 1; }
  };
  return S;
}
