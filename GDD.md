# Les Fioles du Marais — GDD

**Jeu** : navigateur mobile, portrait, bilingue FR/EN (`?lang=`). Jeu long et évolutif : jamais de partie identique.
**Hôte** : hub keismey.github.io (`/Les-Fioles-du-Marais/`).
**Pitch** : tu es l'apothicaire d'un village au bord d'un marais dangereux. La nuit tu cueilles, le jour tu brasses et tu soignes.

## Boucle (3 phases qui se nourrissent)
1. **Cueillette nocturne** : exploration du marais, risques (dangers, obscurité). Rapporte des ingrédients (rareté et qualité variables).
2. **Brassage** : mini-jeu de dosage. La qualité du résultat dépend des ingrédients et de la précision.
3. **Diagnostic** : des patients aux symptômes troubles. Il faut deviner le mal, puis choisir la bonne potion.

Liens : les patients indiquent quoi chercher ; les recettes débloquées changent ce qu'on peut cueillir ; une potion réussie fait monter la réputation, donc ouvre de nouveaux patients et de nouveaux marais.

## Évolution (méta)
- Nouveaux marais (dangers et ingrédients propres)
- Maladies rares, à symptômes ambigus
- Réputation : patients plus exigeants, plus de variété
- Génération aléatoire pour que deux parties ne se ressemblent pas

## Contraintes du hub
Portrait, FR/EN via `?lang=`, `ks-back.js` (copié depuis un autre jeu du hub), clé localStorage unique `fioles_save_v1`, icône 192, couverture, entrée dans `games.js`, hors ligne.

## Méthode
Une seule boucle jouable d'abord, puis une phase ou fonctionnalité à la fois.

## État
Rien de codé. Prochaine étape : une première boucle minimale (une cueillette, un brassage, un patient).

## À trancher
- Forme de la cueillette (explorer à la torche, tap sur des plantes, ou choix risqués) ?
- Forme du mini-jeu de dosage (jauges, curseurs, ordre d'ajout) ?
- Comment le joueur déduit-il la maladie (indices, examen, questions) ?
