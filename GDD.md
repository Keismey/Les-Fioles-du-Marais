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
- **Cueillette** : deux pouces. Un pavé de navigation fixe en bas à gauche pour ramer ; tout le reste de l'écran sert à couper d'un trait de faucille. Les plantes n'apparaissent que dans le cercle de lumière de la lanterne (elles brillent). Les créatures (sangsues, feux follets, eaux profondes) réagissent à la lumière ; la lanterne a une réserve d'huile qui limite la nuit.
- **Dosage** : on maintient le doigt sur une fiole pour verser dans le chaudron, on relâche pour arrêter. Le liquide change de couleur et de niveau en direct ; on touille en cercles pour mélanger et contrôler la chaleur. Cible = une couleur et un niveau à atteindre ; trop verser gâche la potion.
- **Diagnostic** : le patient est dessiné en grand ; on promène une loupe dessus et on agit au geste (tirer la paupière, sortir la langue, sentir le pouls en suivant un rythme). Les indices se notent seuls dans un carnet qui élimine les maladies possibles ; on désigne la maladie en la glissant sur le patient.

## Cueillette : règles actuelles (phase 1 codée)
- **Commandes (deux pouces)** : un **pavé de navigation fixe, toujours affiché, en bas à gauche** (anneau + poignée). Un doigt qui se pose dessus (zone ~92 px) rame : direction = poignée par rapport au centre du pavé, pleine vitesse à ~52 px. La barque répond vite, la lanterne pointe dans sa direction, elle s'arrête quand on lève le doigt. **Tout doigt posé ailleurs = faucille**, sur tout le reste de l'écran. Les deux marchent en même temps. Caméra douce qui regarde un peu devant.
- **Faucille** : trait rapide (> 200 px/s) qui croise une plante à portée de la barque (~105 px) et éclairée.
- **Qualité** : les plantes pulsent ; plus elle brille fort au moment du trait, meilleure est la qualité (★ à ★★★). Une ★★★ rend +4 d'huile.
- **Lumière** : faisceau devant la barque + petit halo autour. Diminue avec l'huile. Les plantes ne se voient que dans la lumière ; hors lumière elles scintillent faiblement de loin (plus fort pour les rares) pour indiquer où aller.
- **Huile** : 100 au départ, baisse en continu (~2 min de nuit). Vide = l'aube se lève : bilan, ingrédients ajoutés au stock et sauvegardés. Pause (retour du téléphone) : reprendre ou rentrer au village.
- **Sangsue** : invisible dans le noir (juste des rides), recûle devant le faisceau, attaque par derrière/côtés : -12 huile. Un trait la tue (50 % de bave de sangsue).
- **Feu follet** : visible de loin, attiré par la lumière ; s'il touche la barque il souffle la lanterne 3 s. Un trait le tue (40 % de poussière de feu follet).
- **Marais** : 1400 × 2000 px, généré au hasard à chaque nuit (îlots-obstacles, 34 plantes, plus rares quand on s'éloigne du ponton).
- **Ingrédients** : 6 plantes (nénuphar lunaire, jonc fiévreux, mousse-lueur, ciguë d'eau, chapeau-cendre, fleur du pendu) + 2 butins de créatures (bave de sangsue, poussière de feu follet). Stock : `stock[id] = [★, ★★, ★★★]`.
- Pas encore : eaux profondes, sons, vrais visuels, plusieurs marais, option gaucher (pavé en bas à droite).

## Évolution (méta)
- Nouveaux marais (dangers et ingrédients propres)
- Maladies rares, à symptômes ambigus
- Réputation : patients plus exigeants, plus de variété
- Génération aléatoire pour que deux parties ne se ressemblent pas

## Contraintes du hub
Portrait, FR/EN via `?lang=`, `ks-back.js` (copié d'un autre jeu du hub), clé localStorage unique `fioles_save_v1`, icône 192, couverture, entrée dans `games.js`, hors ligne.

## Fichiers
- `index.html`, `manifest*.webmanifest`, `sw.js` (hors ligne), `commun/ks-back.js`, `icons/icon-192.svg`, `couverture.svg` (provisoires)
- `js/main.js` (démarrage, boucle) · `canvas.js` (écran) · `input.js` (doigts, multi-touch) · `i18n.js` + `lang/fr.js`, `lang/en.js` (textes)
- `js/save.js` (sauvegarde) · `ingredients.js` (données) · `hasard.js` (hasard à graine)
- `js/marais.js` (génération du marais) · `lumiere.js` (lanterne) · `dessin.js` (formes provisoires) · `barque.js` (pilotage) · `pave.js` (pavé de navigation)
- `js/cueillette.js` (phase 1) · `titre.js` · `bilan.js` (écrans)
- Ajouter un fichier JS : l'ajouter aussi à la liste `FILES` de `sw.js`.

## Méthode
Une seule boucle jouable d'abord, puis une phase ou fonctionnalité à la fois.

## État
- Phase 1 (cueillette) codée, visuels provisoires. Version 4 : pavé fixe en bas à gauche + faucille sur tout le reste de l'écran (v1 : pilotage peu agréable ; v2 : impossible de ramer et couper d'un seul doigt ; v3 : moitiés gauche/droite, mais rien à couper à gauche). À tester sur téléphone.
- Pas encore dans `games.js` du hub. Icône et couverture en SVG provisoires : à remplacer par de vraies images (PNG 192 / WebP).
- Prochaine étape : valider la cueillette, puis brassage (phase 2), puis diagnostic (phase 3).
