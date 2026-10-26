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

## Évolution (méta)
- Nouveaux marais (dangers et ingrédients propres)
- Maladies rares, à symptômes ambigus
- Réputation : patients plus exigeants, plus de variété
- Génération aléatoire pour que deux parties ne se ressemblent pas

## Contraintes du hub
Portrait, FR/EN via `?lang=`, `ks-back.js` (copié depuis un autre jeu du hub), clé localStorage unique `fioles_save_v1`, icône 192, couverture, entrée dans `games.js`, hors ligne.
**Aucun déploiement sur le hub par Claude** : Claude ne touche jamais au dépôt keismey.github.io (ni `games.js`). Keismey intègre le jeu lui-même ; Claude peut au plus fournir le bloc `games.js` à copier.

## Méthode
Une seule boucle jouable d'abord, puis une phase ou fonctionnalité à la fois.

## État
Rien de codé. Prochaine étape : une première boucle minimale (une cueillette, un dosage, un patient).
