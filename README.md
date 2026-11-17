# Prépa CFD

Jeu d'entraînement sur téléphone pour réviser la CFD appliquée à la dispersion atmosphérique : 87 questions, avec une explication après chaque réponse.

| Thème | Type de jeu | Questions |
|---|---|---|
| QCM CFD | QCM (solveurs, schémas, turbulence, dispersion, seuils toxiques) | 29 |
| Comprendre le code | « Que va afficher ce Python ? » | 16 |
| Corriger le code | Toucher la ligne fautive, puis choisir la correction | 10 |
| Discrétiser | Compléter des formules (différences finies, volumes finis, panache gaussien) | 12 |
| Add-on Blender | Remettre du code `bpy` dans l'ordre, trouver des bugs, QCM | 10 |
| Bash OpenFOAM | Remettre les commandes dans l'ordre (avec des pièges), QCM | 10 |

L'accueil propose aussi un **défi mixte** (10 questions de tous les thèmes) et un mode **Revoir mes erreurs** (les questions ratées, jusqu'à ce qu'elles soient réussies). Les scores et les erreurs restent enregistrés dans le navigateur du téléphone.

C'est une appli web installable (PWA) : une fois ajoutée à l'écran d'accueil, elle s'ouvre en plein écran comme une vraie appli et fonctionne hors ligne. Elle n'a aucune dépendance.

| Fichier | Rôle |
|---|---|
| `index.html` | L'appli (interface et moteur de jeu) |
| `questions.js` | Toutes les questions, à modifier pour en ajouter |
| `manifest.json` | Nom, couleurs et icônes de l'appli installée |
| `sw.js` | Service worker : fonctionnement hors ligne |
| `icons/` | Icônes de l'appli (Android, iPhone) |

## Mettre en ligne avec GitHub Pages

1. Crée un dépôt sur GitHub, par exemple `prepa-cfd`.
2. Ajoute tous les fichiers et le dossier `icons/` à la racine du dépôt (bouton **Add file → Upload files**, ou `git push`).
3. Va dans **Settings → Pages**. Sous *Build and deployment*, choisis **Deploy from a branch**, branche `main`, dossier `/ (root)`, puis **Save**.
4. Au bout d'une minute environ, le site est disponible sur `https://<ton-pseudo>.github.io/prepa-cfd/`.

Sur le téléphone, ouvre ce lien puis choisis **Partager → Sur l'écran d'accueil** (iPhone) ou **Ajouter à l'écran d'accueil** (Android) pour l'utiliser comme une application.

En ligne de commande :

```bash
cd prepa-cfd
git init
git add .
git commit -m "Prépa CFD : jeu d'entraînement"
git branch -M main
git remote add origin https://github.com/<ton-pseudo>/prepa-cfd.git
git push -u origin main
```

## Ajouter des questions

Tout se trouve dans `questions.js`. Copie un bloc existant du même type et modifie-le. Le format est expliqué en haut du fichier :

- `mcq` : `choices` contient les réponses et `answer` l'index de la bonne (0 = la première). L'ordre des réponses est mélangé à l'affichage.
- `bug` : `code` contient le programme, `bug` le ou les numéros de ligne fautifs (1 = la première ligne), puis `choices`/`answer` pour la correction.
- `order` : `lines` contient les lignes **dans le bon ordre**, et `distractors` les lignes pièges. Les lignes notées `{t: "...", g: n}` qui ont le même `g` peuvent être placées dans n'importe quel ordre entre elles.
- `fill` : `template` contient la formule avec des trous `[[0]]`, `[[1]]`…, et `blanks` les options de chaque trou.

Après une modification, ouvre `index.html` dans un navigateur pour vérifier que tout s'affiche. Une erreur de syntaxe dans `questions.js` donne une page blanche. Une fois en ligne, l'appli installée récupère la nouvelle version dès que le téléphone a du réseau.
