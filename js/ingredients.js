// Les ingrédients du jeu. rare : 0 commun, 1 peu commun, 2 rare.
export const INGREDIENTS = {
  nenuphar:  { forme: 'lis',        couleur: '#9fd8ff', rare: 0 },
  jonc:      { forme: 'jonc',       couleur: '#e6ec84', rare: 0 },
  mousse:    { forme: 'mousse',     couleur: '#7dffb4', rare: 0 },
  cigue:     { forme: 'ombelle',    couleur: '#d6a2ff', rare: 1 },
  chapeau:   { forme: 'champignon', couleur: '#ffb36b', rare: 1 },
  pendu:     { forme: 'fleur',      couleur: '#ff6f91', rare: 2 },
  bave:      { forme: 'goutte',     couleur: '#8fbf6a', rare: 1 },
  poussiere: { forme: 'etoile',     couleur: '#8aa6ff', rare: 2 },
};
// Plantes qui poussent dans le marais. min = éloignement du ponton (0 à 1) à partir duquel elles apparaissent.
export const PLANTES = [
  { id: 'nenuphar', min: 0,    poids: 5 },
  { id: 'jonc',     min: 0,    poids: 5 },
  { id: 'mousse',   min: 0,    poids: 4 },
  { id: 'cigue',    min: 0.25, poids: 3 },
  { id: 'chapeau',  min: 0.3,  poids: 3 },
  { id: 'pendu',    min: 0.6,  poids: 2 },
];
export const ORDRE = Object.keys(INGREDIENTS);
