# Les Fioles du Marais — GDD

**Jeu** : navigateur mobile, portrait, bilingue FR/EN (`?lang=`). Jeu long et évolutif : jamais de partie identique.
**Hôte** : hub keismey.github.io (`/Les-Fioles-du-Marais/`).
**Pitch** : tu es l'apothicaire d'un village au bord d'un marais dangereux. La nuit tu cueilles, le jour tu brasses et tu soignes.

## Principes
- Gestes d'abord (glisser, maintenir, tracer), boutons rares.
- Visuel et vivant : lumière, couleurs, animations qui réagissent au doigt.
- Chaque phase a un gameplay différent des deux autres.

## Boucle (3 phases qui se nourrissent)
1. **Cueillette nocturne** : exploration du marais en barque. Rapporte des ingrédients (rareté et qualité variables).
2. **Brassage** : dosage au doigt. La qualité dépend des ingrédients et de la précision.
3. **Diagnostic** : des patients aux symptômes troubles. Il faut deviner le mal, puis soigner avec la bonne potion.

Liens : les patients indiquent quoi chercher ; les recettes débloquées changent ce qu'on peut cueillir ; une potion réussie fait monter la réputation, donc ouvre de nouveaux patients et de nouveaux marais.

## Choix de design (phase par phase)
- **Cueillette** : on glisse le doigt pour ramer et orienter la lanterne de la barque. Les plantes n'apparaissent que dans le cercle de lumière (elles brillent) ; on les cueille d'un trait de faucille au doigt. Les créatures (sangsues, feux follets, eaux profondes) réagissent à la lumière ; la lanterne a une réserve d'huile qui limite la nuit.
- **Dosage** : on maintient le doigt sur une fiole pour verser dans le chaudron, on relâche pour arrêter. Le liquide change de couleur et de niveau en direct ; on touille en cercles pour mélanger et contrôler la chaleur. Cible = une couleur et un niveau à atteindre ; trop verser gâche la potion.
- **Diagnostic** : le patient est dessiné en grand ; on promène une loupe dessus et on agit au geste (tirer la paupière, sortir la langue, sentir le pouls en suivant un rythme). Les indices se notent seuls dans un carnet qui élimine les maladies possibles ; on désigne la maladie en la glissant sur le patient.

## Cueillette : règles actuelles (phase 1 codée)
- **Commandes** : joystick flottant. Là où le doigt se pose = centre ; on glisse vers la direction voulue (plus on glisse, plus la barque va vite, jusqu'à ~50 px). La barque répond vite, la lanterne pointe dans la direction de la barque. Doigt levé = elle ralentit et s'arrête. Caméra douce qui regarde un peu devant.
- **Faucille** : geste *rapide* du doigt (> 380 px/s) sur une plante à portée (~105 px) et éclairée. Pendant 0,3 s après un coup de faucille, la barque garde son cap ; ensuite le doigt redevient le centre du joystick (la barque s'arrête jusqu'au prochain glissement).
- **Qualité** : les plantes pulsent ; plus elle brille fort au moment du trait, meilleure est la qualité (★ à ★★★). Une ★★★ rend +4 d'huile.
- **Lumière** : faisceau devant la barque + petit halo autour. Diminue avec l'huile. Les plantes ne se voient que dans la lumière ; hors lumière elles scintillent faiblement de loin (plus fort pour les rares) pour indiquer où aller.
- **Huile** : 100 au départ, baisse en continu (~2 min de nuit). Vide = l'aube se lève : bilan, ingrédients ajoutés au stock et sauvegardés. Pause (retour du téléphone) : reprendre ou rentrer au village.
- **Sangsue** : invisible dans le noir (juste des rides), recûle devant le faisceau, attaque par derrière/côtés : -12 huile. Un trait la tue (50 % de bave de sangsue).
- **Feu follet** : visible de loin, attiré par la lumière ; s'il touche la barque il souffle la lanterne 3 s. Un trait le tue (40 % de poussière de feu follet).
- **Marais** : 1400 × 2000 px, généré au hasard à chaque nuit (îlots-obstacles, 34 plantes, plus rares quand on s'éloigne du ponton).
- **Ingrédients** : 6 plantes (nénuphar lunaire, jonc fiévreux, mousse-lueur, ciguë d'eau, chapeau-cendre, fleur du pendu) + 2 butins de créatures (bave de sangsue, poussière de feu follet). Stock : `stock[id] = [★, ★★, ★★★]`.
- Pas encore : eaux profondes, sons, vrais visuels, plusieurs marais.

## Évolution (méta)
- Nouveaux marais (dangers et ingrédients propres)
- Maladies rares, à symptômes ambigus
- Réputation : patients plus exigeants, plus de variété
- Génération aléatoire pour que deux parties ne se ressemblent pas

## Contraintes du hub
Portrait, FR/EN via `?lang=`, `ks-back.js` (copié d'un autre jeu du hub), clé localStorage unique `fioles_save_v1`, icône 192, couverture, entrée dans `games.js`, hors ligne.

## Fichiers
- `index.html`, `manifest*.webmanifest`, `sw.js` (hors ligne), `commun/ks-back.js`, `icons/icon-192.svg`, `couverture.svg` (provisoires)
- `js/main.js` (démarrage, boucle) · `canvas.js` (écran) · `input.js` (doigt) · `i18n.js` + `lang/fr.js`, `lang/en.js` (textes)
- `js/save.js` (sauvegarde) · `ingredients.js` (données) · `hasard.js` (hasard à graine)
- `js/marais.js` (génération du marais) · `lumiere.js` (lanterne) · `dessin.js` (formes provisoires) · `barque.js` (pilotage)
- `js/cueillette.js` (phase 1) · `titre.js` · `bilan.js` (écrans)
- Ajouter un fichier JS : l'ajouter aussi à la liste `FILES` de `sw.js`.

## Méthode
Une seule boucle jouable d'abord, puis une phase ou fonctionnalité à la fois.

## État
- Phase 1 (cueillette) codée, visuels provisoires. 2e version du pilotage (joystick flottant) à tester sur téléphone ; retour utilisateur v1 : pilotage peu agréable, gameplay pas assez enthousiasmant.
- Pas encore dans `games.js` du hub. Icône et couverture en SVG provisoires : à remplacer par de vraies images (PNG 192 / WebP).
- Prochaine étape : valider la cueillette, puis brassage (phase 2), puis diagnostic (phase 3).
