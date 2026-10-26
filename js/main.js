import { initCanvas, ecran } from './canvas.js';
import { brancherEntrees } from './input.js';
import { charger, sauver } from './save.js';
import { initLangue, langue } from './i18n.js';
import { titre } from './titre.js';
import { cueillette } from './cueillette.js';
import { bilan } from './bilan.js';

const cv = document.getElementById('jeu');
const ctx = initCanvas(cv);
const save = charger();
initLangue(save);

let scene = null;
const jeu = {
  save,
  sauver: () => sauver(save),
  aller(nom, arg) { scene = scenes[nom]; if (scene.entrer) scene.entrer(arg); },
  vib(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) {} },
};
const scenes = { titre: titre(jeu), cueillette: cueillette(jeu), bilan: bilan(jeu) };

brancherEntrees(cv, () => scene);
KSBack.init({ back: () => (scene.retour ? scene.retour() : null), lang: () => langue() });
document.addEventListener('visibilitychange', () => { if (document.hidden && scene.auto) scene.auto(); });
if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));

jeu.aller('titre');
let dernier = performance.now();
function boucle(now) {
  const dt = Math.min(0.05, (now - dernier) / 1000); dernier = now;
  if (scene.maj) scene.maj(dt);
  ctx.setTransform(ecran.k, 0, 0, ecran.k, 0, 0);
  ctx.clearRect(0, 0, ecran.W, ecran.H);
  scene.dessiner(ctx);
  requestAnimationFrame(boucle);
}
requestAnimationFrame(boucle);
