// Hasard à graine : même graine = même marais (pratique pour tester), graine différente = autre marais.
export function hasard(graine) {
  let a = graine >>> 0;
  const f = function () {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  f.entre = (min, max) => min + (max - min) * f();
  f.choix = (tab) => tab[Math.floor(f() * tab.length)];
  return f;
}
