// Écran : largeur logique fixe (360), hauteur logique selon le téléphone. Portrait uniquement (colonne centrée sur ordinateur).
export const ecran = { W: 360, H: 640, k: 1, hautSur: 0 };
let cv, sonde;

export function initCanvas(el) {
  cv = el;
  sonde = document.createElement('div');
  sonde.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;padding-top:env(safe-area-inset-top,0px)';
  document.body.appendChild(sonde);
  redim();
  addEventListener('resize', redim);
  addEventListener('orientationchange', () => setTimeout(redim, 150));
  return cv.getContext('2d');
}

export function redim() {
  const cssH = innerHeight, cssW = Math.min(innerWidth, innerHeight * 0.62);
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.style.width = cssW + 'px'; cv.style.height = cssH + 'px';
  cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
  ecran.H = Math.max(480, 360 * cssH / cssW);
  ecran.k = cv.width / ecran.W;
  ecran.hautSur = (parseFloat(getComputedStyle(sonde).paddingTop) || 0) * 360 / cssW;
}
