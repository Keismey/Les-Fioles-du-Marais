// Phase 1 : la cueillette nocturne en barque.
import { genererMarais, profondeur } from './marais.js';
import { lanterneEtat, cone, eclairage, dessinerLumiere } from './lumiere.js';
import * as D from './dessin.js';
import { INGREDIENTS, ORDRE } from './ingredients.js';
import { t } from './i18n.js';
import { ecran } from './canvas.js';
import { piloter } from './barque.js';
import { pave, dansPave, dessinerPave } from './pave.js';

const PORTEE = 105;          // portée de la faucille autour de la barque
const VITESSE_TRAIT = 200;   // vitesse minimale du doigt pour que ce soit un coup de faucille
const HUILE_PAR_S = 0.85;    // une nuit dure environ 2 minutes
const MORSURE = 12;          // huile perdue par morsure de sangsue
const PI2 = Math.PI * 2;
const alea = (a, b) => a + Math.random() * (b - a);
const borne = (v, a, b) => Math.max(a, Math.min(b, v));

function distSeg(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1, l = dx * dx + dy * dy;
  const u = l ? borne(((px - x1) * dx + (py - y1) * dy) / l, 0, 1) : 0;
  return Math.hypot(px - (x1 + u * dx), py - (y1 + u * dy));
}

export function cueillette(jeu) {
  const S = {};
  let n = null;

  S.entrer = () => {
    const m = genererMarais((Math.random() * 4294967296) >>> 0);
    n = {
      m, bat: { x: m.depart.x, y: m.depart.y, vx: 0, vy: 0, cap: -Math.PI / 2 }, vit: 0,
      huile: 100, t: 0, eteint: 0, fin: 0, pause: false, trembler: 0, doigt: null, faux: null,
      cam: { x: 0, y: 0 }, cr: [], butin: {}, fx: [], textes: [], traits: [], rides: [], sillage: 0,
      prochSang: 9, prochFeu: 24, aide: jeu.save.nuits < 2,
    };
    camera(true); n.L = lanterneEtat(n);
  };

  // la caméra suit en douceur et regarde un peu devant la barque
  const camera = (snap, dt) => {
    const { W, H } = ecran, b = n.bat;
    const tx = borne(b.x + b.vx * 0.35 - W / 2, 0, n.m.w - W), ty = borne(b.y + b.vy * 0.35 - H * 0.6, 0, n.m.h - H);
    const k = snap ? 1 : Math.min(1, dt * 5);
    n.cam.x += (tx - n.cam.x) * k; n.cam.y += (ty - n.cam.y) * k;
  };

  function ajouter(id, q) { (n.butin[id] || (n.butin[id] = [0, 0, 0]))[q - 1]++; }
  function gerbe(x, y, col, k) {
    for (let i = 0; i < k; i++) { const a = alea(0, PI2), v = alea(30, 110), l = alea(0.5, 0.9); n.fx.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, l, m: l, col, r: alea(1.5, 3.5) }); }
  }
  const texte = (x, y, txt, col) => n.textes.push({ x, y, txt, col, l: 1.3 });

  // ---------- barque ----------
  function barque(dt) {
    const d = n.doigt, b = n.bat, p = pave();
    piloter(b, dt, d && !n.fin ? { dx: d.x - p.x, dy: d.y - p.y } : null, n.m);
    n.vit = b.vit;
    n.sillage -= dt;
    if (b.vit > 40 && n.sillage <= 0) { n.sillage = 0.14; n.rides.push({ x: b.x - Math.cos(b.cap) * 16, y: b.y - Math.sin(b.cap) * 16, l: 0.9, m: 0.9 }); }
    camera(false, dt);
  }

  // ---------- faucille ----------
  const pulse = (p) => 0.5 + 0.5 * Math.sin(n.t * 2.4 + p.ph);

  function couper(p) {
    p.vivante = false;
    const pu = pulse(p), q = pu > 0.82 ? 3 : pu > 0.45 ? 2 : 1;   // plus elle brille fort, meilleure elle est
    ajouter(p.id, q);
    const col = INGREDIENTS[p.id].couleur;
    if (q === 3) { n.huile = Math.min(100, n.huile + 4); texte(p.x + 26, p.y - 26, '+4', '#ffc861'); }   // une cueillette parfaite rallonge la nuit
    gerbe(p.x, p.y, col, 8 + q * 4);
    texte(p.x, p.y - 14, t('ing.' + p.id) + ' ' + '★'.repeat(q), col);
    jeu.vib(q === 3 ? [12, 30, 12] : 12);
  }

  function tuer(c) {
    c.mort = true;
    const sang = c.type === 'sangsue', id = sang ? 'bave' : 'poussiere';
    gerbe(c.x, c.y, INGREDIENTS[id].couleur, 12);
    if (Math.random() < (sang ? 0.5 : 0.4)) {
      const q = Math.random() < 0.3 ? 3 : 2;
      ajouter(id, q); texte(c.x, c.y - 14, t('ing.' + id) + ' ' + '★'.repeat(q), INGREDIENTS[id].couleur);
    }
    jeu.vib(20);
  }

  function trait(x1, y1, x2, y2, dt) {
    const v = Math.hypot(x2 - x1, y2 - y1) / Math.max(dt, 0.008);
    if (v < VITESSE_TRAIT) return;
    n.traits.push({ x1, y1, x2, y2, a: 1 });
    const cx = n.cam.x, cy = n.cam.y, b = n.bat;
    for (const p of n.m.plantes) {
      if (!p.vivante || Math.hypot(p.x - b.x, p.y - b.y) > PORTEE) continue;
      if (eclairage(n.L, p.x, p.y) < 0.12) continue;
      if (distSeg(p.x - cx, p.y - cy, x1, y1, x2, y2) <= 30) couper(p);
    }
    for (const c of n.cr) {
      if (c.mort || !c.vu || Math.hypot(c.x - b.x, c.y - b.y) > PORTEE + 10) continue;
      if (distSeg(c.x - cx, c.y - cy, x1, y1, x2, y2) <= 24) tuer(c);
    }
  }

  // ---------- créatures ----------
  const compte = (type) => n.cr.filter((c) => c.type === type).length;

  function apparaitre(type) {
    const b = n.bat, m = n.m;
    for (let i = 0; i < 14; i++) {
      const a = alea(0, PI2), d = alea(380, 470), x = b.x + Math.cos(a) * d, y = b.y + Math.sin(a) * d;
      if (x < 50 || x > m.w - 50 || y < 50 || y > m.h - 50) continue;
      if (m.ilots.some((o) => Math.hypot(x - o.x, y - o.y) < o.r + 12)) continue;
      n.cr.push({ type, x, y, ang: 0, ph: alea(0, PI2), etat: 'chasse', mem: 0, vu: false, lum: 0, mort: false });
      return;
    }
  }

  function creatures(dt) {
    const b = n.bat, prof = profondeur(n.m, b.x, b.y);
    n.prochSang -= dt;
    if (n.prochSang <= 0) { n.prochSang = alea(6.5, 10) - prof * 3.5; if (compte('sangsue') < 2 + Math.floor(prof * 4)) apparaitre('sangsue'); }
    n.prochFeu -= dt;
    if (n.prochFeu <= 0) { n.prochFeu = alea(20, 30) - prof * 8; if (compte('feu') < (prof > 0.5 ? 2 : 1) && (prof > 0.15 || n.t > 45)) apparaitre('feu'); }
    for (const c of n.cr) {
      const dx = b.x - c.x, dy = b.y - c.y, d = Math.hypot(dx, dy) || 1;
      c.lum = eclairage(n.L, c.x, c.y);
      c.vu = c.type === 'feu' || c.lum > 0.12;
      if (c.type === 'sangsue') {
        let v, ux, uy;
        if (c.etat === 'fuite') { c.mem -= dt; v = 70; ux = -dx / d; uy = -dy / d; if (c.mem <= 0) c.etat = 'chasse'; }
        else if (cone(n.L, c.x, c.y) > 0.25) { v = 42; ux = -dx / d; uy = -dy / d; }   // elle recule devant le faisceau
        else { v = 80; ux = dx / d; uy = dy / d; }                                      // mais rôde dans le noir
        const lat = Math.sin(n.t * 3 + c.ph) * 18;
        c.x += (ux * v - uy * lat) * dt; c.y += (uy * v + ux * lat) * dt;
        c.ang = Math.atan2(uy, ux);
        for (const o of n.m.ilots) {
          const ox = c.x - o.x, oy = c.y - o.y, od = Math.hypot(ox, oy), min = o.r + 8;
          if (od < min && od > 0) { c.x = o.x + ox / od * min; c.y = o.y + oy / od * min; }
        }
        if (d < 24 && c.etat === 'chasse') {
          n.huile = Math.max(0, n.huile - MORSURE); c.etat = 'fuite'; c.mem = 2.6; n.trembler = 0.35;
          gerbe(b.x, b.y, '#c0445a', 10); texte(b.x, b.y - 22, t('mord'), '#ff8a9c'); jeu.vib(60);
        }
        if (d > 700) c.mort = true;
      } else {
        const ang = Math.atan2(dy, dx) + Math.sin(n.t * 1.7 + c.ph) * 0.9;   // attiré par la lumière
        c.x += Math.cos(ang) * 36 * dt; c.y += Math.sin(ang) * 36 * dt;
        if (d < 26) {
          n.eteint = 3.2; c.mort = true; n.trembler = 0.2;
          gerbe(c.x, c.y, '#8ac4ff', 14); texte(b.x, b.y - 22, t('eteint'), '#9fd0ff'); jeu.vib(40);
        }
        if (d > 800) c.mort = true;
      }
    }
    n.cr = n.cr.filter((c) => !c.mort);
  }

  function effets(dt) {
    for (const f of n.fx) { f.x += f.vx * dt; f.y += f.vy * dt; f.vx *= 0.94; f.vy *= 0.94; f.l -= dt; }
    n.fx = n.fx.filter((f) => f.l > 0);
    for (const x of n.textes) { x.y -= 18 * dt; x.l -= dt; }
    n.textes = n.textes.filter((x) => x.l > 0);
    for (const x of n.rides) x.l -= dt;
    n.rides = n.rides.filter((x) => x.l > 0);
    for (const x of n.traits) x.a -= dt * 5;
    n.traits = n.traits.filter((x) => x.a > 0);
  }

  // ---------- boucle ----------
  S.maj = (dt) => {
    if (!n || n.pause) return;
    n.t += dt;
    n.trembler = Math.max(0, n.trembler - dt);
    n.eteint = Math.max(0, n.eteint - dt);
    if (n.fin) {
      n.doigt = null; n.faux = null; n.fin += dt;
      barque(dt); effets(dt); n.L = lanterneEtat(n);
      if (n.fin > 2.2) jeu.aller('bilan', n.butin);
      return;
    }
    n.huile -= HUILE_PAR_S * dt;
    if (n.huile <= 0) { n.huile = 0; n.fin = 0.001; jeu.vib(40); }
    barque(dt);
    n.L = lanterneEtat(n);
    creatures(dt);
    effets(dt);
  };

  // Un doigt qui se pose sur le pavé (en bas à gauche) rame ; un doigt posé ailleurs = faucille.
  S.down = (x, y, id) => {
    if (!n || n.pause || n.fin) return;
    if (dansPave(x, y)) { if (!n.doigt) n.doigt = { id, x, y }; }
    else if (n.faux === null) n.faux = id;
  };
  S.move = (x, y, px, py, dt, id) => {
    if (!n || n.pause || n.fin) return;
    if (n.doigt && id === n.doigt.id) { n.doigt.x = x; n.doigt.y = y; }
    else if (id === n.faux) trait(px, py, x, y, dt);
  };
  S.up = (x, y, id) => {
    if (!n) return;
    if (n.doigt && id === n.doigt.id) n.doigt = null;
    if (id === n.faux) n.faux = null;
  };
  S.retour = () => { if (n && !n.fin) { n.pause = !n.pause; n.doigt = null; n.faux = null; } return null; };
  S.auto = () => { if (n && !n.fin) { n.pause = true; n.doigt = null; n.faux = null; } };

  const boutons = () => {
    const w = 230, x = (ecran.W - w) / 2, y = ecran.H * 0.42;
    return [{ x, y, w, h: 50, id: 'reprendre' }, { x, y: y + 70, w, h: 50, id: 'rentrer' }];
  };
  S.tap = (x, y) => {
    if (!n || !n.pause) return;
    for (const b of boutons()) {
      if (x < b.x || x > b.x + b.w || y < b.y || y > b.y + b.h) continue;
      n.pause = false;
      if (b.id === 'rentrer') n.fin = 0.001;
    }
  };

  // ---------- dessin ----------
  S.dessiner = (ctx) => {
    const { W, H } = ecran;
    D.fondEau(ctx, W, H);
    if (!n) return;
    const L = n.L, sh = n.trembler > 0 ? n.trembler * 14 : 0;
    ctx.save();
    ctx.translate(-n.cam.x + (sh ? (Math.random() - 0.5) * sh : 0), -n.cam.y + (sh ? (Math.random() - 0.5) * sh : 0));
    D.decor(ctx, n.m, n.cam, W, H);
    dessinerLumiere(ctx, L);
    for (const p of n.m.plantes) {                       // les plantes n'existent que dans la lumière
      if (!p.vivante) continue;
      const lum = eclairage(L, p.x, p.y);
      if (lum < 0.03) { balise(ctx, p); continue; }
      const pu = pulse(p), br = lum * (0.4 + 0.6 * pu), col = INGREDIENTS[p.id].couleur;
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; D.lueur(ctx, p.x, p.y, 24 + 12 * pu, col, 0.55 * br); ctx.restore();
      D.icone(ctx, p.id, p.x, p.y, 1.1 + 0.12 * pu, Math.min(1, lum * 1.6));
      if (lum > 0.12 && Math.hypot(p.x - n.bat.x, p.y - n.bat.y) <= PORTEE) {   // à portée de faucille
        ctx.strokeStyle = `rgba(255,255,255,${0.22 * lum})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(p.x, p.y, 20, 0, PI2); ctx.stroke();
      }
    }
    for (const c of n.cr) {
      if (c.type === 'feu') { D.feuFollet(ctx, c, n.t); continue; }
      if (c.vu) D.sangsue(ctx, c, n.t, borne(c.lum * 2, 0.25, 1));
      else {                                              // dans le noir : seulement des rides sur l'eau
        const ph = (n.t * 1.3 + c.ph) % 1;
        ctx.strokeStyle = `rgba(127,184,200,${0.2 * (1 - ph)})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(c.x, c.y, 4 + ph * 14, 0, PI2); ctx.stroke();
      }
    }
    for (const r of n.rides) { const u = r.l / r.m; ctx.strokeStyle = `rgba(170,210,220,${0.22 * u})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(r.x, r.y, 3 + (1 - u) * 16, 0, PI2); ctx.stroke(); }
    D.barque(ctx, n.bat, n.t, n.vit, n.eteint <= 0 && n.huile > 0);
    for (const f of n.fx) { ctx.globalAlpha = f.l / f.m; ctx.fillStyle = f.col; ctx.beginPath(); ctx.arc(f.x, f.y, f.r * (f.l / f.m) + 0.5, 0, PI2); ctx.fill(); }
    ctx.globalAlpha = 1;
    for (const x of n.textes) { ctx.globalAlpha = Math.min(1, x.l / 0.5); D.ecrire(ctx, x.txt, x.x, x.y, 12, x.col); }
    ctx.globalAlpha = 1;
    ctx.restore();
    for (const x of n.traits) {                           // trait de faucille (écran)
      ctx.strokeStyle = `rgba(235,245,255,${x.a})`; ctx.lineWidth = 1 + 3 * x.a; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x.x1, x.y1); ctx.lineTo(x.x2, x.y2); ctx.stroke();
    }
    dessinerPave(ctx, n.doigt);
    if (n.fin > 0.8) { ctx.fillStyle = D.rgba('#16303a', borne((n.fin - 0.8) / 1.2, 0, 1)); ctx.fillRect(0, 0, W, H); }
    hud(ctx); aide(ctx);
    if (n.pause) pause(ctx);
  };

  // plante hors lumière : un scintillement lointain qui montre où aller (plus fort pour les rares)
  function balise(ctx, p) {
    const d = Math.hypot(p.x - n.bat.x, p.y - n.bat.y);
    if (d > 560) return;
    const rare = INGREDIENTS[p.id].rare, a = (0.2 + 0.15 * Math.sin(n.t * 3 + p.ph)) * (1 - d / 560) * (1 + rare * 0.8);
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; D.lueur(ctx, p.x, p.y, 5 + rare * 3, INGREDIENTS[p.id].couleur, Math.min(1, a * 2.2)); ctx.restore();
  }

  function hud(ctx) {
    const { W } = ecran, y = ecran.hautSur + 14, f = borne(n.huile / 100, 0, 1);
    ctx.fillStyle = 'rgba(0,0,0,.45)'; D.rect(ctx, 16, y, W - 32, 8, 4); ctx.fill();
    ctx.fillStyle = n.huile < 25 && Math.floor(n.t * 4) % 2 ? '#ff7a4a' : '#ffc861';
    if (f > 0.01) { D.rect(ctx, 16, y, (W - 32) * f, 8, 4); ctx.fill(); }
    let x = 16; const y2 = y + 28;
    for (const id of ORDRE) {
      const q = n.butin[id]; if (!q) continue;
      D.icone(ctx, id, x + 8, y2, 0.75); D.ecrire(ctx, String(q[0] + q[1] + q[2]), x + 20, y2 + 4, 12, '#e8efe0', 'left'); x += 44;
    }
  }

  function aide(ctx) {
    if (!n.aide || n.t > 16 || n.fin) return;
    const i = Math.floor(n.t / 4), fr = (n.t % 4) / 4;
    const a = Math.min(1, fr * 8, (1 - fr) * 8);
    ctx.globalAlpha = a * 0.9;
    D.ecrire(ctx, t('aide' + (i + 1)), ecran.W / 2, ecran.H - 200, 15, '#f6efd8');
    ctx.globalAlpha = 1;
  }

  function pause(ctx) {
    const { W, H } = ecran;
    ctx.fillStyle = 'rgba(3,10,12,.74)'; ctx.fillRect(0, 0, W, H);
    D.ecrire(ctx, t('pause'), W / 2, H * 0.32, 26, '#f6efd8');
    for (const b of boutons()) D.bouton(ctx, b.x, b.y, b.w, b.h, t(b.id));
  }

  return S;
}
