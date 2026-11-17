/*
  Banque de questions — Prépa CFD
  ----------------------------------------------------------------
  Pour ajouter une question, copie un bloc existant du même type.
  Types disponibles :
    mcq   : QCM.  choices = liste, answer = index de la bonne réponse (0 = première)
    bug   : chasse au bug. code = texte, bug = numéro(s) de ligne fautive(s) (1 = première),
            puis choices/answer pour choisir la correction
    order : remise en ordre. lines = lignes dans le BON ordre.
            Une ligne peut être un objet {t:"texte", g:n} : les lignes de même groupe g
            peuvent être placées dans n'importe quel ordre entre elles.
            distractors = lignes pièges à ne pas utiliser
    fill  : formule à trous. template contient [[0]], [[1]]... ;
            blanks = [{options:[...], answer:index}, ...]
            steps (optionnel) = développement mathématique affiché avec la solution
  Champs communs : q (énoncé), explain (explication affichée après la réponse),
  code / lang ("python", "bash") pour afficher du code.
*/

/* Aides pour écrire les développements mathématiques (champ « steps » des formules à trous) :
   _fr(numérateur, dénominateur) → fraction ;  _C("i+1", "n") → C indice i+1, exposant n
   steps = liste de [texte de l'étape, formule] ; la formule peut être vide "". */
const _fr = (a, b) => `<span class="fr"><span>${a}</span><span>${b}</span></span>`;
const _C = (sub, sup) => `C<sub>${sub}</sub>` + (sup ? `<sup>${sup}</sup>` : "");

const DECKS = [
/* =====================================================================
   1. QCM CFD & MÉTHODES NUMÉRIQUES
   ===================================================================== */
{
  id: "qcm",
  title: "QCM CFD",
  sub: "Solveurs, schémas, turbulence, dispersion",
  color: "#2a78d6",
  questions: [
  { type: "mcq",
    q: "En LES, qu'est-ce qui est résolu et qu'est-ce qui est modélisé ?",
    choices: [
      "Les grands tourbillons sont résolus, les petites échelles (sous-maille) sont modélisées",
      "Toutes les échelles sont modélisées par un modèle k-epsilon",
      "Toutes les échelles sont résolues, aucun modèle",
      "Les petites échelles sont résolues, les grandes sont modélisées"],
    answer: 0,
    explain: "La LES filtre les équations : les grandes structures, porteuses de l'énergie et du transport, sont calculées ; l'effet des petites échelles passe par un modèle sous-maille (WALE, Smagorinsky). « Toutes les échelles résolues », c'est la DNS ; « tout modélisé en moyenne », c'est le RANS." },

  { type: "mcq",
    q: "Ton calcul LES diverge sur un maillage grossier de tétraèdres alors que k-epsilon passe. Cause la plus probable ?",
    choices: [
      "La LES utilise des schémas peu dissipatifs (centrés, ordre 2 en temps) qui n'amortissent plus les oscillations sur un maillage trop grossier",
      "La LES ne supporte pas les conditions de symétrie",
      "La LES impose un pas de temps nul",
      "Le modèle WALE ne fonctionne qu'en 2D"],
    answer: 0,
    explain: "Vu en vrai sur Code_Saturne : choisir la LES force le schéma centré sans test de pente et Crank-Nicolson (θ = 0,5). C'est voulu pour ne pas tuer la turbulence résolue, mais ça exige un maillage fin et régulier. Démarche saine : RANS d'abord, LES ensuite." },

  { type: "mcq",
    q: "Le nombre de Courant (CFL) vaut :",
    choices: ["u·Δt / Δx", "u·Δx / Δt", "Δx / (u·Δt²)", "ν·Δt / Δx"],
    answer: 0,
    explain: "CFL = u·Δt/Δx : de combien de mailles le fluide avance pendant un pas de temps. En schéma explicite il faut CFL ≤ 1. ν·Δt/Δx² (avec un carré) est le nombre de Fourier, pour la diffusion." },

  { type: "mcq",
    q: "Quel couple solveur / algorithme convient à un écoulement STATIONNAIRE incompressible dans OpenFOAM ?",
    choices: ["simpleFoam / SIMPLE", "pimpleFoam / PISO", "icoFoam / PISO", "rhoCentralFoam / Kurganov"],
    answer: 0,
    explain: "simpleFoam (algorithme SIMPLE, avec sous-relaxation) cherche directement l'état stationnaire. pimpleFoam (PIMPLE = PISO + SIMPLE) sert au transitoire, par exemple en LES. rhoCentralFoam traite le compressible à haute vitesse." },

  { type: "mcq",
    q: "À quoi sert la sous-relaxation dans l'algorithme SIMPLE ?",
    choices: [
      "À freiner la mise à jour de p et U d'une itération à l'autre pour éviter la divergence",
      "À augmenter l'ordre du schéma en espace",
      "À réduire le nombre de mailles",
      "À rendre le calcul transitoire"],
    answer: 0,
    explain: "En SIMPLE, les corrections de pression et de vitesse sont approximatives : on n'en applique qu'une fraction (par exemple p 0,3 et U 0,7). Sans ça, le calcul stationnaire oscille et diverge. Oublier relaxationFactors avec simpleFoam fait partie des causes de SIGFPE." },

  { type: "mcq",
    q: "Avec une loi de paroi (k-epsilon standard), dans quelle plage doit se trouver le y+ de la première maille ?",
    choices: ["Environ 30 à 300", "y+ < 1", "Exactement 5", "Plus de 1000"],
    answer: 0,
    explain: "La loi de paroi suppose que le centre de la première maille est dans la zone logarithmique (y+ ≈ 30 à 300). y+ < 1 correspond à une résolution complète de la couche limite (bas-Reynolds), sans loi de paroi. On le vérifie avec le champ Yplus en post-traitement." },

  { type: "mcq",
    q: "Quel est le principal défaut du schéma upwind d'ordre 1 ?",
    choices: [
      "Il introduit beaucoup de diffusion numérique : il étale les gradients, donc le panache",
      "Il crée des oscillations non physiques",
      "Il est instable quel que soit le pas de temps",
      "Il ne conserve pas la masse"],
    answer: 0,
    explain: "L'upwind est robuste et borné, mais il diffuse : un panache sort plus large et moins concentré qu'en réalité. Le schéma centré est plus précis mais oscille si le Péclet de maille dépasse 2. On choisit souvent un compromis, par exemple linearUpwind ou un limiteur." },

  { type: "mcq",
    q: "Pourquoi utilise-t-on souvent un solveur multigrille (GAMG) pour la pression ?",
    choices: [
      "L'équation de pression est elliptique (type Poisson) : le multigrille élimine efficacement les erreurs à grande longueur d'onde",
      "Parce que la pression est toujours positive",
      "Parce que GAMG est le seul solveur parallèle",
      "Pour rendre le calcul explicite"],
    answer: 0,
    explain: "Une équation de Poisson couple tout le domaine : les solveurs itératifs simples tuent vite les erreurs locales mais très lentement les erreurs globales. Le multigrille corrige ces dernières sur des grilles grossières. C'est pour ça que la pression coûte souvent le plus cher." },

  { type: "mcq",
    q: "Domaine de dispersion atmosphérique : quelle condition pour le HAUT et les CÔTÉS du domaine ?",
    choices: [
      "Symétrie / glissement (pas de flux traversant)",
      "Sortie (outlet) à pression imposée",
      "Paroi avec non-glissement",
      "Entrée à vitesse imposée"],
    answer: 0,
    explain: "Vu en vrai : des faces parallèles à l'écoulement mises en outlet laissent l'air ressortir puis rentrer (« Incoming flow detained ») et le calcul diverge. On met symmetry ou slip sur le haut et les côtés, outlet seulement en aval." },

  { type: "mcq",
    q: "Le profil de vitesse logarithmique d'une couche limite atmosphérique neutre s'écrit :",
    choices: [
      "U(z) = (u*/κ) · ln((z + z₀)/z₀)",
      "U(z) = U_ref · (z / z_ref)²",
      "U(z) = u* · exp(−z/z₀)",
      "U(z) = κ · z / u*"],
    answer: 0,
    explain: "u* est la vitesse de frottement, κ ≈ 0,41 la constante de von Kármán et z₀ la rugosité aérodynamique. C'est ce qu'impose atmBoundaryLayerInletVelocity dans OpenFOAM. On utilise aussi parfois une loi puissance (z/z_ref)^α, mais pas au carré." },

  { type: "mcq",
    q: "Classes de stabilité de Pasquill : nuit claire et vent faible, c'est en général…",
    choices: ["Classe F (très stable)", "Classe A (très instable)", "Classe D (neutre)", "Classe B (instable)"],
    answer: 0,
    explain: "La nuit, le sol se refroidit et l'air près du sol devient stable : la turbulence est faible et le panache se disperse peu. Les concentrations au sol restent donc fortes loin de la source. C'est souvent le cas dimensionnant. A correspond à une journée très ensoleillée avec peu de vent, D au ciel couvert ou au vent fort." },

  { type: "mcq",
    q: "Dans quel cas le modèle gaussien devient-il clairement insuffisant ?",
    choices: [
      "Rejet au milieu de bâtiments, avec recirculations et canalisation de l'écoulement",
      "Rejet continu en terrain plat et dégagé",
      "Besoin d'une réponse en quelques secondes",
      "Vent stationnaire et homogène"],
    answer: 0,
    explain: "Le gaussien suppose un terrain plat, un vent homogène et stationnaire, sans obstacle. Autour de bâtiments (sillages, rues canyons), il faut la CFD. À l'inverse, quand il faut répondre très vite, le gaussien reste l'outil d'urgence : c'est tout l'arbitrage entre rapidité et précision." },

  { type: "mcq",
    q: "Le chlore (M ≈ 71 g/mol) est rejeté en grande quantité. Peut-on le traiter comme un scalaire passif ?",
    choices: [
      "Non : il est plus lourd que l'air (29 g/mol), c'est un gaz lourd qui modifie l'écoulement (effet de densité)",
      "Oui, toujours, un gaz est toujours passif",
      "Oui, car il est toxique",
      "Non, car il est plus léger que l'air"],
    answer: 0,
    explain: "Un scalaire passif est transporté sans rétroagir sur l'écoulement. Un nuage dense de chlore s'effondre, s'étale au sol et suit les creux : il faut un modèle à densité variable (ou un modèle de gaz lourd). Une fois très dilué, il redevient passif." },

  { type: "mcq",
    q: "Quelle affirmation sur Code_Saturne est correcte ?",
    choices: [
      "Volumes finis colocalisés (variables au centre des cellules), maillages non structurés quelconques, développé par EDF",
      "Éléments finis sur maillages tétraédriques uniquement",
      "Différences finies sur grille cartésienne uniquement",
      "Méthode de Boltzmann sur réseau"],
    answer: 0,
    explain: "Code_Saturne est un code volumes finis colocalisé, qui accepte des cellules polyédriques quelconques. Il est open source (GPL) et développé par EDF R&D. Il possède un module atmosphérique : profils météo, stratification thermique, humidité." },

  { type: "mcq",
    q: "Tu importes un maillage Gmsh (.msh) dans Code_Saturne et la zone de sélection INLET trouve 0 face. Pourquoi ?",
    choices: [
      "Le lecteur Gmsh ne garde que les NUMÉROS des groupes physiques, pas leurs noms : il faut sélectionner « 1 », « 2 »…",
      "Code_Saturne ne lit pas du tout le format Gmsh",
      "Il faut écrire inlet en minuscules",
      "Les faces d'entrée doivent être des triangles"],
    answer: 0,
    explain: "Vu en vrai : le log du préprocesseur affiche « Color 1 : 44 », etc. Les noms sont perdus. Deux solutions : sélectionner par numéro, ou passer par le format MED (Salomé), qui conserve les noms de groupes." },

  { type: "mcq",
    q: "La longueur de Monin-Obukhov L est négative. L'atmosphère est :",
    choices: ["Instable (convective)", "Stable", "Neutre", "Impossible, L est toujours positive"],
    answer: 0,
    explain: "L < 0 : instable (le sol chauffe l'air, les panaches montent et se mélangent). L > 0 : stable. |L| → ∞ : neutre. On relie souvent 1/L aux classes de Pasquill." },

  { type: "mcq",
    q: "Comment s'enchaînent les trois étapes de snappyHexMesh ?",
    choices: [
      "castellatedMesh → snap → addLayers",
      "snap → castellatedMesh → addLayers",
      "addLayers → snap → castellatedMesh",
      "blockMesh → snap → decomposePar"],
    answer: 0,
    explain: "1) castellated : raffinement près des surfaces et suppression des cellules dans les solides, ce qui donne des marches d'escalier. 2) snap : les sommets sont projetés sur les STL pour épouser la géométrie. 3) addLayers : des couches prismatiques sont ajoutées en paroi pour la couche limite." },

  { type: "mcq",
    q: "Comment savoir qu'un calcul a vraiment convergé ? (meilleure réponse)",
    choices: [
      "Résidus qui baissent ET grandeurs suivies (sondes) stabilisées ET bilan de masse entrée = sortie",
      "Le calcul ne plante pas",
      "Les résidus sont sous 1",
      "Le temps de calcul dépasse une heure"],
    answer: 0,
    explain: "Les résidus seuls peuvent tromper. Lors du premier calcul Code_Saturne, ils étaient à 0 parce que rien ne bougeait (zones vides) ! Il faut croiser avec des sondes qui deviennent plates et un bilan de masse : 23,5724 kg/s en entrée comme en sortie sur le cas test." },

  { type: "mcq",
    q: "Nombre de Schmidt turbulent Sc_t : quelle relation pour la diffusivité turbulente d'un scalaire ?",
    choices: ["D_t = ν_t / Sc_t (Sc_t ≈ 0,7 typiquement)", "D_t = ν_t · Sc_t²", "D_t = Sc_t / ν_t", "D_t = 0 en RANS"],
    answer: 0,
    explain: "La turbulence mélange le polluant comme la quantité de mouvement, au facteur Sc_t près. On prend souvent 0,7 (plage courante 0,5 à 1). C'est un paramètre sensible en dispersion : il élargit ou resserre le panache." },

  { type: "mcq",
    q: "Schéma en temps implicite (Euler implicite) : quelle affirmation est juste ?",
    choices: [
      "Stable pour tout Δt (au sens linéaire), mais un grand Δt dégrade la précision du transitoire",
      "Instable dès que CFL > 1",
      "Il ne nécessite aucune résolution de système linéaire",
      "Il est d'ordre 2 en temps"],
    answer: 0,
    explain: "L'implicite demande de résoudre un système à chaque pas, mais il reste stable avec de grands pas de temps. Stable ne veut pas dire précis : pour suivre une bouffée de gaz, il faut tout de même un Δt adapté. Euler implicite est d'ordre 1, Crank-Nicolson d'ordre 2." },

  { type: "mcq",
    q: "Seuils toxiques réglementaires français : que signifie SELS ?",
    choices: [
      "Seuil des Effets Létaux Significatifs (environ 5 % de létalité)",
      "Seuil d'Exposition Limite de Sécurité",
      "Seuil des Effets Légers et Sans séquelles",
      "Seuil Environnemental de Libération Standard"],
    answer: 0,
    explain: "Dans l'ordre croissant de gravité : SEI (effets irréversibles), SEL ou SPEL (premiers effets létaux, ~1 %), SELS (effets létaux significatifs, ~5 %). Ces seuils dépendent de la durée d'exposition et servent à tracer les zones d'effets pour le décideur." },

  { type: "mcq",
    q: "Pour une exposition toxique variable dans le temps, on utilise souvent la « charge toxique » :",
    choices: ["∫ Cⁿ dt (loi de Haber généralisée, n dépend du produit)", "max(C) uniquement", "C moyenne spatiale", "C × surface du nuage"],
    answer: 0,
    explain: "Avec n = 1, on retrouve la loi de Haber (C × t). Pour beaucoup de produits n > 1 : un pic court et intense est plus dangereux qu'une longue exposition faible à dose égale. D'où l'intérêt de sortir des historiques C(t) aux points sensibles." },

  { type: "mcq",
    q: "Rejet instantané (explosion d'un conteneur) vs rejet continu (fuite). Quel modèle gaussien ?",
    choices: [
      "Bouffée (puff) pour l'instantané, panache (plume) pour le continu",
      "Panache pour les deux",
      "Bouffée pour le continu, panache pour l'instantané",
      "Aucun, seul la CFD peut traiter un rejet instantané"],
    answer: 0,
    explain: "Le panache gaussien suppose une source continue et un état stationnaire. Un rejet bref forme une bouffée qui se déplace avec le vent en grossissant (σx, σy, σz). Pour le décideur, c'est la différence entre « zone exposée durablement » et « nuage qui passe »." },

  { type: "mcq",
    q: "Pourquoi faire une étude de convergence en maillage ?",
    choices: [
      "Vérifier que le résultat ne dépend plus (ou peu) de la taille des mailles",
      "Pour que le calcul aille plus vite",
      "Parce que checkMesh l'exige",
      "Pour supprimer le modèle de turbulence"],
    answer: 0,
    explain: "On compare trois maillages (grossier, moyen, fin) sur les grandeurs d'intérêt, par exemple la concentration en un point sensible. Si le moyen et le fin donnent presque la même chose, le maillage moyen suffit. On peut aussi estimer l'erreur par extrapolation de Richardson." },

  { type: "mcq",
    q: "En sortie de domaine OpenFOAM, quelle condition limite évite que du fluide rentre par la sortie ?",
    choices: ["inletOutlet sur U (et sur les scalaires)", "fixedValue 0 sur U", "symmetryPlane sur la pression", "noSlip"],
    answer: 0,
    explain: "inletOutlet se comporte comme un zeroGradient quand le fluide sort, et impose une valeur (souvent 0) s'il tente de rentrer. Ça stabilise les sorties où apparaissent des reflux. Sur p, on garde en général fixedValue en sortie." },

  { type: "mcq",
    q: "Rugosité aérodynamique z₀ typique d'une zone urbaine dense ?",
    choices: ["De l'ordre de 1 m", "De l'ordre de 0,0002 m", "De l'ordre de 0,03 m", "De l'ordre de 50 m"],
    answer: 0,
    explain: "Ordres de grandeur : mer environ 0,0002 m, herbe rase environ 0,03 m, banlieue 0,5 à 1 m, ville dense 1 à 2 m. Si les bâtiments sont maillés explicitement, on prend la rugosité du sol entre eux, pas celle de la ville entière." },

  { type: "mcq",
    q: "Tu lances « mpirun -np 8 simpleFoam » sans l'option -parallel. Que se passe-t-il ?",
    choices: [
      "8 copies indépendantes du même calcul séquentiel tournent sur le cas complet",
      "Le calcul tourne 8 fois plus vite",
      "OpenFOAM ajoute -parallel automatiquement",
      "Le maillage est décomposé automatiquement"],
    answer: 0,
    explain: "Sans -parallel, chaque processus MPI ignore les dossiers processor* et calcule tout le cas, dans les mêmes fichiers. La bonne chaîne : decomposePar, puis mpirun -np N solveur -parallel, puis reconstructPar. Et c'est bien du MPI, pas de l'OpenMP." },

  { type: "mcq",
    q: "Péclet de maille Pe = u·Δx/D = 10 avec un schéma centré pour la convection. Risque ?",
    choices: [
      "Oscillations non physiques (concentrations négatives, dépassements)",
      "Diffusion numérique excessive",
      "Aucun, le centré est toujours parfait",
      "Le calcul devient stationnaire"],
    answer: 0,
    explain: "Le schéma centré n'est borné que si Pe ≤ 2. Au-delà, il produit des « wiggles » (concentrations négatives, par exemple). Solutions : raffiner, passer en upwind ou en schéma limité (TVD), ou garder le centré avec un test de pente comme dans Code_Saturne." },

  { type: "mcq",
    q: "Pourquoi un maillage hexaédrique structuré a-t-il convergé là où des tétraèdres grossiers divergeaient ?",
    choices: [
      "Cellules plus régulières (faible non-orthogonalité, alignées avec l'écoulement) et plus fines, donc gradients mieux calculés",
      "Les hexaèdres suppriment la turbulence",
      "Code_Saturne interdit les tétraèdres",
      "Les hexaèdres n'ont pas de faces de bord"],
    answer: 0,
    explain: "Vu sur le cas test : 1 818 tétraèdres de 0,5 m divergeaient au coin sortie/sol, alors que 10 000 hexaèdres alignés ont convergé, avec un bilan de masse exact. La qualité des cellules (non-orthogonalité, déformation) pèse autant que leur nombre. checkMesh et le log de Code_Saturne la quantifient." },
  ]
},

/* =====================================================================
   2. COMPRENDRE DU PYTHON
   ===================================================================== */
{
  id: "comprendre",
  title: "Comprendre le code",
  sub: "Que va afficher ce Python ?",
  color: "#1baf7a",
  questions: [
  { type: "mcq", lang: "python",
    q: "Qu'affiche ce code ?",
    code: `C = [0.2, 1.5, 0.8, 3.1, 0.05]
seuil = 1.0
n = len([c for c in C if c > seuil])
print(n)`,
    choices: ["2", "3", "5", "[1.5, 3.1]"], answer: 0,
    explain: "La compréhension de liste garde les valeurs strictement supérieures à 1.0, soit 1.5 et 3.1. len() en compte 2. C'est le schéma typique pour compter les points qui dépassent un seuil toxique." },

  { type: "mcq", lang: "python",
    q: "Qu'affiche ce code ?",
    code: `import numpy as np
C = np.zeros(10)
print(C[1:-1].shape)`,
    choices: ["(8,)", "(10,)", "(9,)", "(8, 1)"], answer: 0,
    explain: "1:-1 enlève le premier et le dernier élément : il reste 8 valeurs. C'est la tranche des « points intérieurs » qu'on met à jour dans un schéma aux différences finies, les bords portant les conditions limites." },

  { type: "mcq", lang: "python",
    q: "Qu'affiche ce code ?",
    code: `coef = {"A": 0.22, "B": 0.16, "D": 0.08, "F": 0.04}
print(max(coef, key=coef.get))`,
    choices: ["A", "0.22", "F", "D"], answer: 0,
    explain: "max() parcourt les CLÉS, mais les compare selon coef.get(clé), c'est-à-dire selon la valeur. Il renvoie la clé de plus grande valeur, ici \"A\"." },

  { type: "mcq", lang: "python",
    q: "Qu'affiche ce code ?",
    code: `print(7 // 2, 7 / 2, -7 // 2)`,
    choices: ["3 3.5 -4", "3 3.5 -3", "3.5 3.5 -3.5", "3 3 -3"], answer: 0,
    explain: "// est la division entière arrondie vers le bas (floor) : -7 // 2 = -4, pas -3. / donne toujours un float en Python 3. C'est un piège classique quand on calcule un nombre de mailles ou d'itérations." },

  { type: "mcq", lang: "python",
    q: "Qu'affiche ce code ?",
    code: `a = [0, 0, 0]
b = a
b[0] = 5
print(a)`,
    choices: ["[5, 0, 0]", "[0, 0, 0]", "Erreur", "[5]"], answer: 0,
    explain: "b = a ne copie pas la liste : a et b désignent le même objet. Pour une vraie copie : b = a.copy() (ou C.copy() avec NumPy). C'est la source du bug « diffusion en place »." },

  { type: "mcq", lang: "python",
    q: "Qu'affiche ce code ?",
    code: `import numpy as np
x = np.linspace(0, 1, 5)
print(x[1])`,
    choices: ["0.25", "0.2", "0.1", "1"], answer: 0,
    explain: "linspace(0, 1, 5) donne 5 POINTS, bornes comprises : 0, 0.25, 0.5, 0.75, 1. Il y a donc 4 intervalles de 0.25. Retenir : n points = n−1 mailles en 1D." },

  { type: "mcq", lang: "python",
    q: "Qu'affiche ce code ?",
    code: `print(f"{0.000123:.2e}")`,
    choices: ["1.23e-04", "0.00", "0.000123", "1.2e-4"], answer: 0,
    explain: "Le format .2e affiche la notation scientifique avec 2 décimales et un exposant sur 2 chiffres. C'est pratique pour afficher des résidus ou des concentrations." },

  { type: "mcq", lang: "python",
    q: "Qu'affiche ce code ?",
    code: `import numpy as np
A = np.arange(3)[:, None] + np.arange(2)
print(A.shape, A[2, 1])`,
    choices: ["(3, 2) 3", "(2, 3) 3", "(3,) 2", "Erreur de dimensions"], answer: 0,
    explain: "Broadcasting : une colonne (3,1) plus une ligne (2,) donnent un tableau (3,2), avec A[i,j] = i + j. Donc A[2,1] = 3. C'est la technique pour évaluer une formule sur une grille (x, z) sans boucle." },

  { type: "mcq", lang: "python",
    q: "Qu'affiche ce code ?",
    code: `zones = [("INLET", 44), ("WALL", 210), ("OUTLET", 42)]
print(sorted(zones, key=lambda z: z[1])[0][0])`,
    choices: ["OUTLET", "INLET", "WALL", "42"], answer: 0,
    explain: "Le tri se fait sur le 2e élément (nombre de faces), par ordre croissant : OUTLET (42) arrive en premier. [0][0] prend le nom de ce premier tuple." },

  { type: "mcq", lang: "python",
    q: "Qu'affiche ce code (dans l'ordre) ?",
    code: `def f():
    try:
        print("a")
        return "b"
    finally:
        print("c")
print(f())`,
    choices: ["a, c, b", "a, b, c", "a, b", "c, a, b"], answer: 0,
    explain: "Le bloc finally s'exécute toujours, même après un return, et juste avant que la fonction ne rende la main. On voit donc a, puis c, puis print() affiche la valeur renvoyée b. Utile pour toujours fermer un fichier ou libérer un processus." },

  { type: "mcq", lang: "python",
    q: "Qu'affiche ce code ?",
    code: `residus = [1e-1, 5e-3, 8e-4, 2e-5]
it = next(i for i, r in enumerate(residus) if r < 1e-3)
print(it)`,
    choices: ["2", "3", "8e-04", "1"], answer: 0,
    explain: "next() renvoie le premier élément du générateur : le premier indice dont le résidu passe sous 1e-3. C'est 8e-4, à l'indice 2 (on compte depuis 0). C'est une façon compacte de trouver l'itération de convergence." },

  { type: "mcq", lang: "python",
    q: "Qu'affiche ce code ?",
    code: `bc = {"inlet": "fixedValue", "outlet": "zeroGradient"}
print(bc.get("top", "symmetry"), len(bc))`,
    choices: ["symmetry 2", "symmetry 3", "None 2", "KeyError"], answer: 0,
    explain: "get(clé, défaut) renvoie la valeur par défaut si la clé n'existe pas, sans l'ajouter au dictionnaire, qui garde 2 entrées. bc[\"top\"] aurait levé une KeyError." },

  { type: "mcq", lang: "python",
    q: "Qu'affiche ce code ?",
    code: `import numpy as np
C = np.array([0.0, 2.0, 4.0, 6.0])
print(C[C > 1].mean())`,
    choices: ["4.0", "3.0", "12.0", "2.0"], answer: 0,
    explain: "C > 1 donne un masque booléen ; C[masque] garde 2, 4 et 6, dont la moyenne vaut 4.0. Par exemple : la concentration moyenne dans la zone où le seuil est dépassé." },

  { type: "mcq", lang: "python",
    q: "Qu'affiche ce code ?",
    code: `ligne = "Courant Number mean: 0.12 max: 0.87"
print(float(ligne.split()[-1]) < 1)`,
    choices: ["True", "False", "0.87", "ValueError"], answer: 0,
    explain: "split() découpe sur les espaces et [-1] prend le dernier morceau, \"0.87\". Converti en float, il est bien inférieur à 1. On extrait ainsi le Courant max d'un log OpenFOAM pour le surveiller automatiquement." },

  { type: "mcq", lang: "python",
    q: "Qu'affiche ce code ?",
    code: `import numpy as np
C = np.zeros(5, dtype=int)
C[2] = 0.75
print(C.sum())`,
    choices: ["0", "0.75", "1", "Erreur de type"], answer: 0,
    explain: "Le tableau est de type entier : 0.75 est tronqué en 0 sans aucun avertissement. Pour des concentrations, il faut des float : np.zeros(5)." },

  { type: "mcq", lang: "python",
    q: "Qu'affiche ce code ?",
    code: `u = [1.0, 2.0, 3.0]
u2 = [x**2 for x in u if x > 1]
print(sum(u2))`,
    choices: ["13.0", "14.0", "5.0", "9.0"], answer: 0,
    explain: "On garde 2.0 et 3.0 (strictement supérieurs à 1), puis on les met au carré : 4 + 9 = 13.0. Le résultat est un float parce que les valeurs le sont." },
  ]
},

/* =====================================================================
   3. CORRIGER DU PYTHON
   ===================================================================== */
{
  id: "corriger",
  title: "Corriger le code",
  sub: "Trouve la ligne fautive, puis la correction",
  color: "#d64545",
  questions: [
  { type: "bug", lang: "python",
    q: "Cette fonction doit renvoyer le nombre de Courant.",
    code: `def courant(u, dt, dx):
    return u * dx / dt`,
    bug: [2],
    choices: ["return u * dt / dx", "return dx / (u * dt)", "return u / (dt * dx)", "return abs(u) * dx / dt"],
    answer: 0,
    explain: "CFL = u·Δt/Δx (sans dimension). Contrôle d'unités : (m/s)·s / m = 1. La version fautive donne des m²/s², ce qui n'a aucun sens." },

  { type: "bug", lang: "python",
    q: "Diffusion 1D explicite (FTCS). Le pic devrait s'étaler symétriquement… mais il part d'un seul côté.",
    code: `import numpy as np

def diffuse(C, r, n_steps):
    for _ in range(n_steps):
        for i in range(1, len(C) - 1):
            C[i] = C[i] + r * (C[i+1] - 2*C[i] + C[i-1])
    return C`,
    bug: [6],
    choices: [
      "Ajouter Cold = C.copy() avant la boucle sur i, puis C[i] = Cold[i] + r*(Cold[i+1] - 2*Cold[i] + Cold[i-1])",
      "Remplacer range(1, len(C) - 1) par range(len(C))",
      "Remplacer 2*C[i] par C[i]",
      "Mettre r au carré"],
    answer: 0,
    explain: "En mettant à jour C sur place, C[i-1] a déjà la valeur du nouveau pas quand on calcule C[i]. On mélange donc n et n+1, et le schéma devient asymétrique. Il faut lire l'ancien état : une copie, ou la version vectorisée C[1:-1] += r*(C[2:] - 2*C[1:-1] + C[:-2]), où NumPy calcule tout le second membre avant d'écrire." },

  { type: "bug", lang: "python",
    q: "Panache gaussien. Le terme latéral vaut 0 dès que y ≠ 0…",
    code: `import math

def panache(Q, u, y, z, H, sy, sz):
    lat = math.exp(-y**2 / 2*sy**2)
    vert = (math.exp(-(z-H)**2 / (2*sz**2))
            + math.exp(-(z+H)**2 / (2*sz**2)))
    return Q / (2*math.pi*u*sy*sz) * lat * vert`,
    bug: [4],
    choices: [
      "lat = math.exp(-y**2 / (2*sy**2))",
      "lat = math.exp(y**2 / 2*sy**2)",
      "lat = math.exp(-y / (2*sy))",
      "lat = -math.exp(y**2 / (2*sy**2))"],
    answer: 0,
    explain: "Priorité des opérateurs : -y**2 / 2*sy**2 se lit (-y²/2)·σy², un exposant énorme, d'où exp ≈ 0. Il faut des parenthèses : -y²/(2σy²). Avec y = 10 m et σy = 20 m, on passe de 0.0 à 0.88. Le terme vertical, lui, était correct (la source image en z+H modélise la réflexion au sol)." },

  { type: "bug", lang: "python",
    q: "Conversion ppm vers mg/m³ (25 °C, 1 atm). Pour le chlore (71 g/mol), 1 ppm devrait donner ≈ 2,9 mg/m³.",
    code: `def ppm_vers_mg_m3(c_ppm, M):
    """M en g/mol"""
    return c_ppm * 24.45 / M`,
    bug: [3],
    choices: ["return c_ppm * M / 24.45", "return c_ppm / (M * 24.45)", "return c_ppm * M * 24.45", "return M / (c_ppm * 24.45)"],
    answer: 0,
    explain: "24,45 L/mol est le volume molaire d'un gaz à 25 °C et 1 atm. C(mg/m³) = C(ppm) × M / 24,45. Pour le chlore : 71/24,45 ≈ 2,9 mg/m³. Erreur fréquente et dangereuse quand on compare aux seuils toxiques, qui sont donnés tantôt en ppm, tantôt en mg/m³." },

  { type: "bug", lang: "python",
    q: "Cette boucle en temps ne s'arrête jamais.",
    code: `t, dt, t_end = 0.0, 0.1, 1.0
n = 0
while t != t_end:
    t += dt
    n += 1
print(n)`,
    bug: [3],
    choices: [
      "while t < t_end - 1e-12:",
      "while t == t_end:",
      "while t != round(t_end):",
      "while t > t_end:"],
    answer: 0,
    explain: "0,1 n'est pas représentable exactement en binaire : après 10 pas, t vaut 0.9999999999999999, jamais exactement 1.0. Il ne faut jamais tester l'égalité de flottants. Mieux encore : boucler sur un nombre de pas entier, for n in range(round(t_end/dt))." },

  { type: "bug", lang: "python",
    q: "La classe lue dans un fichier vaut bien \"stable\", mais la fonction renvoie 0.08.",
    code: `def sigma_coef(classe):
    if classe is "stable":
        return 0.04
    return 0.08`,
    bug: [2],
    choices: ['if classe == "stable":', 'if classe is not "stable":', 'if "stable" in classe is True:', 'if classe = "stable":'],
    answer: 0,
    explain: "is teste l'identité (même objet en mémoire), == teste l'égalité de valeur. Une chaîne construite à l'exécution (lecture de fichier, concaténation) est un autre objet que le littéral \"stable\" : is renvoie False. Python affiche d'ailleurs un SyntaxWarning." },

  { type: "bug", lang: "python",
    q: "depasse([0.1, 5.0], 1.0) devrait renvoyer True…",
    code: `def depasse(concentrations, seuil):
    for c in concentrations:
        if c > seuil:
            return True
        return False`,
    bug: [5],
    choices: [
      "Désindenter return False au niveau de la fonction (après la boucle)",
      "Remplacer return False par break",
      "Remplacer > par >=",
      "Supprimer le return True"],
    answer: 0,
    explain: "return False est dans la boucle : la fonction s'arrête dès le premier élément (0.1 n'est pas au-dessus du seuil, donc False). Il ne faut conclure « pas de dépassement » qu'après avoir tout parcouru. On peut aussi écrire return any(c > seuil for c in concentrations)." },

  { type: "bug", lang: "python",
    q: "Appelée deux fois sans 2e argument, la fonction renvoie [1, 2] au lieu de [2].",
    code: `def ajoute_sonde(point, sondes=[]):
    sondes.append(point)
    return sondes`,
    bug: [1],
    choices: [
      "def ajoute_sonde(point, sondes=None):  puis  if sondes is None: sondes = []",
      "def ajoute_sonde(point, sondes=()):",
      "def ajoute_sonde(sondes=[], point):",
      "Remplacer append par extend"],
    answer: 0,
    explain: "La valeur par défaut est créée une seule fois, à la définition de la fonction : la même liste est réutilisée à chaque appel. Pour un défaut mutable (liste, dict), on utilise None comme sentinelle." },

  { type: "bug", lang: "python",
    q: "Lecture de residuals.csv (1re ligne : « t, velocity, pressure »). Ça plante avec ValueError.",
    code: `def lire_residus(fichier):
    valeurs = []
    for ligne in open(fichier):
        t, u, p = ligne.split(",")
        valeurs.append(float(u))
    return valeurs`,
    bug: [3, 5],
    choices: [
      "Sauter l'en-tête : with open(fichier) as f: next(f) puis boucler sur f",
      "Remplacer float(u) par int(u)",
      "Remplacer split(\",\") par split()",
      "Entourer avec try/except: pass"],
    answer: 0,
    explain: "La première ligne contient du texte : float(' velocity') échoue. Il faut sauter l'en-tête, avec next(f) ou le paramètre skiprows=1 de np.loadtxt. Le with ferme aussi proprement le fichier. Un try/except: pass masquerait l'erreur au lieu de la corriger." },

  { type: "bug", lang: "python",
    q: "Le champ de concentration reste à 0 alors qu'on vient d'y écrire 0.75.",
    code: `import numpy as np
C = np.zeros(5, dtype=int)
C[2] = 0.75
print(C.sum())`,
    bug: [2],
    choices: ["C = np.zeros(5)", "C = np.zeros(5, dtype=bool)", "C = [0] * 5", "C = np.zeros((5, 1), dtype=int)"],
    answer: 0,
    explain: "dtype=int tronque silencieusement 0.75 en 0. np.zeros(5) est en float64 par défaut. On peut vérifier le type avec C.dtype." },
  ]
},

/* =====================================================================
   4. DISCRÉTISER UNE ÉQUATION
   ===================================================================== */
{
  id: "discretiser",
  title: "Discrétiser",
  sub: "Complète les formules (différences / volumes finis)",
  color: "#8a5cd6",
  questions: [
  { type: "fill",
    q: "Dérivée en temps, Euler explicite (avancé en temps) :",
    template: "∂C/∂t ≈ ( C<sub>i</sub><sup>n+1</sup> − [[0]] ) / [[1]]",
    blanks: [
      { options: ["C<sub>i</sub><sup>n</sup>", "C<sub>i−1</sub><sup>n</sup>", "C<sub>i</sub><sup>n+1</sup>"], answer: 0 },
      { options: ["Δt", "Δx", "2Δt"], answer: 0 }],
    steps: [
      ["Développement de Taylor de C en temps, au point x<sub>i</sub> :",
       `C(t + Δt) = C(t) + Δt ${_fr("∂C", "∂t")} + ${_fr("Δt²", "2")} ${_fr("∂²C", "∂t²")} + O(Δt³)`],
      ["On isole la dérivée en temps :",
       `${_fr("∂C", "∂t")} = ${_fr("C(t + Δt) − C(t)", "Δt")} − ${_fr("Δt", "2")} ${_fr("∂²C", "∂t²")} + O(Δt²)`],
      ["En notation discrète (t = nΔt, x = iΔx), on garde le premier terme :",
       `${_fr("∂C", "∂t")} ≈ ${_fr(_C("i", "n+1") + " − " + _C("i", "n"), "Δt")} + O(Δt)`],
      ["Le premier terme négligé est proportionnel à Δt : schéma d'ordre 1 en temps. Diviser Δt par 2 divise l'erreur par 2.", ""]
    ],
    explain: "Différence avant en temps entre le même point i aux instants n+1 et n, divisée par Δt. Elle est d'ordre 1 en temps." },

  { type: "fill",
    q: "Convection 1D, schéma upwind, avec u > 0 (le vent vient de la gauche) :",
    template: "u · ∂C/∂x ≈ u · ( C<sub>i</sub> − [[0]] ) / [[1]]",
    blanks: [
      { options: ["C<sub>i−1</sub>", "C<sub>i+1</sub>", "C<sub>i</sub>"], answer: 0 },
      { options: ["Δx", "2Δx", "Δx²"], answer: 0 }],
    steps: [
      ["Taylor vers le point amont i−1 (situé à −Δx) :",
       `${_C("i−1")} = ${_C("i")} − Δx ${_fr("∂C", "∂x")} + ${_fr("Δx²", "2")} ${_fr("∂²C", "∂x²")} − …`],
      ["On isole ∂C/∂x :",
       `${_fr("∂C", "∂x")} = ${_fr(_C("i") + " − " + _C("i−1"), "Δx")} + ${_fr("Δx", "2")} ${_fr("∂²C", "∂x²")} + O(Δx²)`],
      ["Pourquoi le point amont ? Avec u > 0, l'information arrive de la gauche : on n'utilise que des points d'où vient le fluide.", ""],
      ["Ce que calcule réellement le schéma :",
       `u ${_fr(_C("i") + " − " + _C("i−1"), "Δx")} = u ${_fr("∂C", "∂x")} − ${_fr("uΔx", "2")} ${_fr("∂²C", "∂x²")} + O(Δx²)`],
      ["L'équation effectivement résolue (« équation modifiée ») contient donc un terme de diffusion en plus :",
       `${_fr("∂C", "∂t")} + u ${_fr("∂C", "∂x")} = <b>${_fr("uΔx", "2")}</b> ${_fr("∂²C", "∂x²")}`],
      ["Conclusion : ordre 1, avec une diffusion numérique D<sub>num</sub> = uΔx/2 proportionnelle à la taille de maille. C'est elle qui élargit artificiellement le panache.", ""]
    ],
    explain: "Upwind = on prend l'information du côté d'où vient l'écoulement. Avec u > 0, c'est le point amont i−1. Si u < 0, on utilise C_{i+1} − C_i. Le schéma est d'ordre 1, robuste mais diffusif." },

  { type: "fill",
    q: "Dérivée première, différence centrée :",
    template: "∂C/∂x ≈ ( C<sub>i+1</sub> − [[0]] ) / [[1]]   → précision d'ordre [[2]]",
    blanks: [
      { options: ["C<sub>i−1</sub>", "C<sub>i</sub>", "2C<sub>i</sub>"], answer: 0 },
      { options: ["2Δx", "Δx", "Δx²"], answer: 0 },
      { options: ["2", "1", "3"], answer: 0 }],
    steps: [
      ["Notation : C′ = ∂C/∂x, C″ = ∂²C/∂x², C‴ = ∂³C/∂x³. Taylor vers i+1 et vers i−1 :",
       `${_C("i+1")} = ${_C("i")} + Δx C′ + ${_fr("Δx²", "2")} C″ + ${_fr("Δx³", "6")} C‴ + O(Δx⁴)`],
      ["", `${_C("i−1")} = ${_C("i")} − Δx C′ + ${_fr("Δx²", "2")} C″ − ${_fr("Δx³", "6")} C‴ + O(Δx⁴)`],
      ["On soustrait la 2e ligne de la 1re : C<sub>i</sub> et C″ s'annulent.",
       `${_C("i+1")} − ${_C("i−1")} = 2Δx C′ + ${_fr("Δx³", "3")} C‴ + O(Δx⁵)`],
      ["On divise par 2Δx :",
       `C′ = ${_fr(_C("i+1") + " − " + _C("i−1"), "2Δx")} − ${_fr("Δx²", "6")} C‴ + O(Δx⁴)`],
      ["L'erreur est en Δx² : schéma d'ordre 2. Diviser Δx par 2 divise l'erreur par 4.", ""]
    ],
    explain: "On relie les deux voisins, distants de 2Δx. Les termes d'ordre 1 des développements de Taylor s'annulent : l'erreur est en Δx², donc d'ordre 2. En contrepartie, le schéma oscille si le Péclet de maille dépasse 2." },

  { type: "fill",
    q: "Dérivée seconde (diffusion), différence centrée :",
    template: "∂²C/∂x² ≈ ( C<sub>i+1</sub> − [[0]] + C<sub>i−1</sub> ) / [[1]]",
    blanks: [
      { options: ["2C<sub>i</sub>", "C<sub>i</sub>", "4C<sub>i</sub>"], answer: 0 },
      { options: ["Δx²", "2Δx", "Δx"], answer: 0 }],
    steps: [
      ["Taylor vers i+1 et vers i−1, poussé jusqu'à l'ordre 4 (C⁗ = ∂⁴C/∂x⁴) :",
       `${_C("i+1")} = ${_C("i")} + Δx C′ + ${_fr("Δx²", "2")} C″ + ${_fr("Δx³", "6")} C‴ + ${_fr("Δx⁴", "24")} C⁗ + …`],
      ["", `${_C("i−1")} = ${_C("i")} − Δx C′ + ${_fr("Δx²", "2")} C″ − ${_fr("Δx³", "6")} C‴ + ${_fr("Δx⁴", "24")} C⁗ − …`],
      ["Cette fois on ADDITIONNE : les termes impairs (C′, C‴) s'annulent.",
       `${_C("i+1")} + ${_C("i−1")} = 2${_C("i")} + Δx² C″ + ${_fr("Δx⁴", "12")} C⁗ + O(Δx⁶)`],
      ["On isole C″ :",
       `C″ = ${_fr(_C("i+1") + " − 2" + _C("i") + " + " + _C("i−1"), "Δx²")} − ${_fr("Δx²", "12")} C⁗ + O(Δx⁴)`],
      ["Stencil (1, −2, 1)/Δx², d'ordre 2.", ""]
    ],
    explain: "C'est le stencil (1, −2, 1)/Δx², qu'on retrouve partout en diffusion. Vérification : pour C constant, la dérivée vaut bien 0, puisque 1 − 2 + 1 = 0." },

  { type: "fill",
    q: "Diffusion 1D explicite (FTCS) : mise à jour, avec r le nombre de Fourier",
    template: "C<sub>i</sub><sup>n+1</sup> = [[0]] + r ( C<sub>i+1</sub><sup>n</sup> − 2C<sub>i</sub><sup>n</sup> + C<sub>i−1</sub><sup>n</sup> ),   r = D·[[1]] / [[2]]",
    blanks: [
      { options: ["C<sub>i</sub><sup>n</sup>", "C<sub>i</sub><sup>n+1</sup>", "0"], answer: 0 },
      { options: ["Δt", "Δx", "u"], answer: 0 },
      { options: ["Δx²", "Δx", "Δt²"], answer: 0 }],
    steps: [
      ["Équation de diffusion 1D :", `${_fr("∂C", "∂t")} = D ${_fr("∂²C", "∂x²")}`],
      ["Temps : Euler explicite (différence avant). Espace : différence centrée d'ordre 2, évaluée au temps n :",
       `${_fr(_C("i", "n+1") + " − " + _C("i", "n"), "Δt")} = D ${_fr(_C("i+1", "n") + " − 2" + _C("i", "n") + " + " + _C("i−1", "n"), "Δx²")}`],
      ["On multiplie par Δt :",
       `${_C("i", "n+1")} − ${_C("i", "n")} = ${_fr("D Δt", "Δx²")} ( ${_C("i+1", "n")} − 2${_C("i", "n")} + ${_C("i−1", "n")} )`],
      ["On pose r = DΔt/Δx² (nombre de Fourier) et on isole l'inconnue :",
       `${_C("i", "n+1")} = ${_C("i", "n")} + r ( ${_C("i+1", "n")} − 2${_C("i", "n")} + ${_C("i−1", "n")} )`],
      ["Tout le second membre est connu (temps n) : c'est pour ça qu'on parle de schéma « explicite ». Erreur de troncature : O(Δt) + O(Δx²).", ""]
    ],
    explain: "On combine Euler explicite en temps et la dérivée seconde centrée en espace. Tout le second membre est pris au temps n, c'est pour ça qu'il faut une copie de l'ancien champ en Python." },

  { type: "fill",
    q: "Conditions de stabilité des schémas explicites :",
    template: "Diffusion (FTCS) : D·Δt/Δx² ≤ [[0]]      Convection (upwind) : u·Δt/Δx ≤ [[1]]",
    blanks: [
      { options: ["1/2", "1", "2"], answer: 0 },
      { options: ["1", "1/2", "10"], answer: 0 }],
    steps: [
      ["Méthode de von Neumann : on injecte un mode de Fourier d'angle θ = kΔx (j = indice de maille, i = √−1). Le schéma est stable si le facteur d'amplification vérifie |G| ≤ 1 pour tout θ.",
       `${_C("j", "n")} = G<sup>n</sup> e<sup>i j θ</sup>`],
      ["Diffusion FTCS : on remplace dans le schéma, puis on divise par G<sup>n</sup>e<sup>ijθ</sup> :",
       `G = 1 + r ( e<sup>iθ</sup> − 2 + e<sup>−iθ</sup> ) = 1 + r ( 2 cos θ − 2 )`],
      ["Avec 1 − cos θ = 2 sin²(θ/2) :", `G = 1 − 4r sin²(θ/2)`],
      ["Pire cas, sin²(θ/2) = 1. On veut G ≥ −1 :", `1 − 4r ≥ −1  ⇔  <b>r = ${_fr("D Δt", "Δx²")} ≤ ${_fr("1", "2")}</b>`],
      ["Convection upwind, avec σ = uΔt/Δx :", `G = 1 − σ ( 1 − e<sup>−iθ</sup> )`],
      ["Module au carré :", `|G|² = (1 − σ + σ cos θ)² + (σ sin θ)² = 1 − 2σ(1 − σ)(1 − cos θ)`],
      ["|G| ≤ 1 pour tout θ :", `σ(1 − σ) ≥ 0  ⇔  <b>0 ≤ σ = ${_fr("u Δt", "Δx")} ≤ 1</b>   (condition CFL)`]
    ],
    explain: "Si on dépasse ces bornes, l'erreur est amplifiée à chaque pas et le calcul explose. Attention : la contrainte de diffusion varie en Δx². Diviser la maille par 2 oblige à diviser le pas de temps par 4." },

  { type: "fill",
    q: "Diffusion 1D, Euler IMPLICITE : système à résoudre à chaque pas",
    template: "−r C<sub>i−1</sub><sup>n+1</sup> + [[0]] C<sub>i</sub><sup>n+1</sup> − r C<sub>i+1</sub><sup>n+1</sup> = [[1]]    → matrice [[2]]",
    blanks: [
      { options: ["(1 + 2r)", "(1 − 2r)", "2r"], answer: 0 },
      { options: ["C<sub>i</sub><sup>n</sup>", "0", "C<sub>i</sub><sup>n+1</sup>"], answer: 0 },
      { options: ["tridiagonale", "diagonale", "pleine"], answer: 0 }],
    steps: [
      ["Euler implicite : le laplacien est évalué au temps n+1 (inconnu) :",
       `${_fr(_C("i", "n+1") + " − " + _C("i", "n"), "Δt")} = D ${_fr(_C("i+1", "n+1") + " − 2" + _C("i", "n+1") + " + " + _C("i−1", "n+1"), "Δx²")}`],
      ["On multiplie par Δt, avec r = DΔt/Δx² :",
       `${_C("i", "n+1")} − ${_C("i", "n")} = r ( ${_C("i+1", "n+1")} − 2${_C("i", "n+1")} + ${_C("i−1", "n+1")} )`],
      ["On regroupe toutes les inconnues (n+1) à gauche :",
       `−r ${_C("i−1", "n+1")} + (1 + 2r) ${_C("i", "n+1")} − r ${_C("i+1", "n+1")} = ${_C("i", "n")}`],
      ["En écrivant cette ligne pour tous les points, on obtient un système linéaire :",
       `A C<sup>n+1</sup> = C<sup>n</sup>,   A = tridiag( −r , 1 + 2r , −r )`],
      ["A est à diagonale strictement dominante (1 + 2r > r + r) : le système a une solution unique, calculée en O(N) opérations par l'algorithme de Thomas.", ""],
      ["Stabilité (von Neumann, mêmes notations que pour FTCS) :",
       `G = ${_fr("1", "1 + 4r sin²(θ/2)")} ≤ 1   quel que soit r : schéma inconditionnellement stable`]
    ],
    explain: "On écrit le laplacien au temps n+1 : C_i^{n+1} − C_i^n = r(C_{i+1} − 2C_i + C_{i−1})^{n+1}, puis on passe les inconnues à gauche. Chaque ligne ne couple que 3 voisins, d'où la matrice tridiagonale (algorithme de Thomas). Le schéma est stable pour tout Δt." },

  { type: "fill",
    q: "Schéma θ en temps (Crank-Nicolson) :",
    template: "Crank-Nicolson ⇔ θ = [[0]]   → ordre [[1]] en temps",
    blanks: [
      { options: ["0,5", "1", "0"], answer: 0 },
      { options: ["2", "1", "4"], answer: 0 }],
    steps: [
      ["Écriture générale pour dC/dt = L(C), où L est l'opérateur spatial discrétisé :",
       `${_fr("C<sup>n+1</sup> − C<sup>n</sup>", "Δt")} = θ L(C<sup>n+1</sup>) + (1 − θ) L(C<sup>n</sup>)`],
      ["Cas particuliers :", `θ = 0 : Euler explicite    θ = 1 : Euler implicite    θ = ½ : Crank-Nicolson`],
      ["On développe autour du milieu t<sup>n+½</sup> = t<sup>n</sup> + Δt/2. Le quotient de gauche y est centré :",
       `${_fr("C<sup>n+1</sup> − C<sup>n</sup>", "Δt")} = ${_fr("dC", "dt")}(t<sup>n+½</sup>) + ${_fr("Δt²", "24")} ${_fr("d³C", "dt³")} + …`],
      [`À droite, avec L<sup>n+1</sup> = L<sup>n+½</sup> + (Δt/2) L′ + … et L<sup>n</sup> = L<sup>n+½</sup> − (Δt/2) L′ + … :`,
       `θ L<sup>n+1</sup> + (1 − θ) L<sup>n</sup> = L<sup>n+½</sup> + (θ − ½) Δt L′ + O(Δt²)`],
      ["Le terme (θ − ½)ΔtL′ est d'ordre 1. Il ne disparaît que pour θ = ½ : Crank-Nicolson est d'ordre 2, tous les autres choix d'ordre 1.", ""]
    ],
    explain: "θ = 0 donne Euler explicite, θ = 1 Euler implicite, θ = 0,5 la moyenne des deux, soit Crank-Nicolson, d'ordre 2. C'est le « theta = 0.5 » vu dans le log Code_Saturne quand la LES était activée." },

  { type: "fill",
    q: "Volumes finis : valeur à la face f entre la cellule P et sa voisine N, en upwind",
    template: "si (u·n)<sub>f</sub> > 0 :  C<sub>f</sub> = [[0]]      sinon :  C<sub>f</sub> = [[1]]",
    blanks: [
      { options: ["C<sub>P</sub>", "C<sub>N</sub>", "(C<sub>P</sub>+C<sub>N</sub>)/2"], answer: 0 },
      { options: ["C<sub>N</sub>", "C<sub>P</sub>", "0"], answer: 0 }],
    steps: [
      ["Équation de transport sous forme conservative :", `${_fr("∂C", "∂t")} + ∇·(<b>u</b> C) = 0`],
      ["On intègre sur le volume V<sub>P</sub> de la cellule P :",
       `∫<sub>VP</sub> ${_fr("∂C", "∂t")} dV + ∫<sub>VP</sub> ∇·(<b>u</b> C) dV = 0`],
      ["Théorème de la divergence : l'intégrale de volume devient une somme de flux à travers les faces f :",
       `V<sub>P</sub> ${_fr("dC<sub>P</sub>", "dt")} + Σ<sub>f</sub> F<sub>f</sub> C<sub>f</sub> = 0,   F<sub>f</sub> = (<b>u</b>·<b>n</b>)<sub>f</sub> S<sub>f</sub>`],
      ["On ne connaît C qu'aux centres (C<sub>P</sub>, C<sub>N</sub>), mais il faut une valeur C<sub>f</sub> sur la face. Upwind : on prend la cellule d'où vient le flux.",
       `C<sub>f</sub> = C<sub>P</sub>  si F<sub>f</sub> > 0 (le fluide sort de P),    C<sub>f</sub> = C<sub>N</sub>  si F<sub>f</sub> < 0`],
      ["Conservation : le flux F<sub>f</sub>C<sub>f</sub> qui sort de P est exactement celui qui entre dans N. La masse totale est conservée, quelle que soit la forme des cellules.", ""]
    ],
    explain: "n pointe de P vers N. Si le flux sort de P, on transporte la valeur de P, sinon celle de N. La moyenne (C_P + C_N)/2, c'est l'interpolation linéaire, l'équivalent du centré. En volumes finis, on somme ensuite les flux sur toutes les faces : Σ_f (u·S)_f C_f." },

  { type: "fill",
    q: "Nombre de Péclet de maille :",
    template: "Pe = [[0]] / D      Schéma centré non oscillant si Pe ≤ [[1]]",
    blanks: [
      { options: ["u·Δx", "u·Δt", "D·Δx"], answer: 0 },
      { options: ["2", "1", "100"], answer: 0 }],
    steps: [
      ["Convection-diffusion 1D stationnaire :", `u ${_fr("dC", "dx")} = D ${_fr("d²C", "dx²")}`],
      ["Différences centrées pour les deux termes :",
       `u ${_fr(_C("i+1") + " − " + _C("i−1"), "2Δx")} = D ${_fr(_C("i+1") + " − 2" + _C("i") + " + " + _C("i−1"), "Δx²")}`],
      ["On multiplie par Δx²/D et on pose Pe = uΔx/D :",
       `${_fr("Pe", "2")} ( ${_C("i+1")} − ${_C("i−1")} ) = ${_C("i+1")} − 2${_C("i")} + ${_C("i−1")}`],
      ["On isole C<sub>i</sub> :",
       `${_C("i")} = ${_fr("(1 − Pe/2) " + _C("i+1") + " + (1 + Pe/2) " + _C("i−1"), "2")}`],
      ["C<sub>i</sub> est une moyenne pondérée de ses voisins (donc bornée, sans oscillation) seulement si les deux poids sont positifs :",
       `1 − ${_fr("Pe", "2")} ≥ 0  ⇔  <b>Pe ≤ 2</b>`],
      ["Si Pe > 2, le poids de C<sub>i+1</sub> devient négatif : C<sub>i</sub> peut sortir de l'intervalle formé par ses voisins. Ce sont les oscillations (« wiggles »), par exemple des concentrations négatives.", ""]
    ],
    explain: "Pe compare la convection à la diffusion à l'échelle d'une maille. Dans un écoulement atmosphérique, Pe est très grand, d'où l'usage d'upwind, de schémas limités ou du test de pente." },

  { type: "fill",
    q: "Panache gaussien (source continue de hauteur H, réflexion au sol) :",
    template: "C = Q / (2π [[0]] σ<sub>y</sub> σ<sub>z</sub>) · exp(−y²/2σ<sub>y</sub>²) · [ exp(−(z−H)²/2σ<sub>z</sub>²) + exp(−[[1]]²/2σ<sub>z</sub>²) ]",
    blanks: [
      { options: ["u", "u²", "D"], answer: 0 },
      { options: ["(z+H)", "(z−H)", "z"], answer: 0 }],
    steps: [
      ["Hypothèses : vent u constant selon x, diffusivités turbulentes K<sub>y</sub> et K<sub>z</sub> constantes, diffusion selon x négligée devant le transport par le vent :",
       `u ${_fr("∂C", "∂x")} = K<sub>y</sub> ${_fr("∂²C", "∂y²")} + K<sub>z</sub> ${_fr("∂²C", "∂z²")}`],
      ["Changement de variable t = x/u (temps de vol depuis la source) :",
       `${_fr("∂C", "∂t")} = K<sub>y</sub> ${_fr("∂²C", "∂y²")} + K<sub>z</sub> ${_fr("∂²C", "∂z²")}`],
      ["C'est une diffusion 2D à partir d'un point. Pendant dt, la source émet Q dt, réparti sur dx = u dt : la quantité par unité de longueur vaut Q/u. Solution fondamentale (source en z = H) :",
       `C = ${_fr("Q / u", "2π σ<sub>y</sub> σ<sub>z</sub>")} <span class="nw">exp(− ${_fr("y²", "2σ<sub>y</sub>²")})</span> <span class="nw">exp(− ${_fr("(z − H)²", "2σ<sub>z</sub>²")})</span><br>avec σ² = 2Kt = ${_fr("2Kx", "u")}`],
      ["Le sol ne laisse rien passer : flux nul en z = 0, soit ∂C/∂z = 0. On l'impose en ajoutant une source image symétrique en z = −H :",
       `<span class="nw">exp(− ${_fr("(z − H)²", "2σ<sub>z</sub>²")})</span> + <span class="nw">exp(− ${_fr("(z + H)²", "2σ<sub>z</sub>²")})</span>`],
      ["Vérification en z = 0 : les dérivées des deux exponentielles valent +H/σ<sub>z</sub>² et −H/σ<sub>z</sub>² fois le même facteur e<sup>−H²/2σ<sub>z</sub>²</sup>. Elles s'annulent, la condition est respectée.", ""],
      ["Résultat :",
       `C = ${_fr("Q", "2π u σ<sub>y</sub> σ<sub>z</sub>")} <span class="nw">exp(− ${_fr("y²", "2σ<sub>y</sub>²")})</span><br>× [ <span class="nw">exp(− ${_fr("(z − H)²", "2σ<sub>z</sub>²")})</span> + <span class="nw">exp(− ${_fr("(z + H)²", "2σ<sub>z</sub>²")})</span> ]`],
      ["En pratique, σ<sub>y</sub>(x) et σ<sub>z</sub>(x) ne sont pas calculés à partir de K, mais tirés de corrélations empiriques selon la classe de stabilité de Pasquill.", ""]
    ],
    explain: "Le débit Q est dilué par le vent u : plus de vent, moins de concentration. Le 2e terme est une source image à −H qui « réfléchit » le panache sur le sol (pas d'absorption). σy et σz dépendent de la distance et de la classe de Pasquill." },

  { type: "fill",
    q: "Profil de vent logarithmique (couche limite neutre) :",
    template: "U(z) = [[0]] / κ · ln( (z + z<sub>0</sub>) / [[1]] ),    κ ≈ [[2]]",
    blanks: [
      { options: ["u*", "U<sub>ref</sub>", "z<sub>0</sub>"], answer: 0 },
      { options: ["z<sub>0</sub>", "z", "H"], answer: 0 },
      { options: ["0,41", "1", "9,81"], answer: 0 }],
    steps: [
      ["Près du sol (couche de surface), la contrainte de cisaillement est quasi constante. Elle définit la vitesse de frottement u* :",
       `τ / ρ = u*²`],
      ["Hypothèse de longueur de mélange de Prandtl, ℓ = κz, avec ν<sub>t</sub> = ℓ² |dU/dz| :",
       `τ / ρ = ν<sub>t</sub> ${_fr("dU", "dz")} = (κ z)² ( ${_fr("dU", "dz")} )²`],
      ["On égalise les deux expressions et on prend la racine :",
       `u* = κ z ${_fr("dU", "dz")}   ⇒   ${_fr("dU", "dz")} = ${_fr("u*", "κ z")}`],
      ["On intègre en z :", `U(z) = ${_fr("u*", "κ")} ln z + constante`],
      ["La constante est fixée par U(z<sub>0</sub>) = 0, ce qui définit la rugosité z<sub>0</sub> :",
       `U(z) = ${_fr("u*", "κ")} ln ${_fr("z", "z<sub>0</sub>")}`],
      ["Forme décalée utilisée dans les codes, pour avoir U(0) = 0 (identique dès que z ≫ z<sub>0</sub>). κ ≈ 0,41 est mesuré expérimentalement :",
       `U(z) = ${_fr("u*", "κ")} ln ${_fr("z + z<sub>0</sub>", "z<sub>0</sub>")}`]
    ],
    explain: "u* est la vitesse de frottement, z₀ la rugosité et κ la constante de von Kármán. En z = 0, ln(1) = 0 et la vitesse est nulle au sol. C'est l'entrée « ABL » des cas de dispersion." },
  ]
},

/* =====================================================================
   5. ADD-ON BLENDER
   ===================================================================== */
{
  id: "addon",
  title: "Add-on Blender",
  sub: "Python bpy : opérateurs, panneaux, propriétés",
  color: "#e07b1f",
  questions: [
  { type: "order", lang: "python",
    q: "Remets dans l'ordre un add-on minimal : un opérateur « Lancer la simulation ».",
    lines: [
      "import bpy",
      "class PANACHE_OT_lancer(bpy.types.Operator):",
      { t: '    bl_idname = "panache.lancer"', g: 2 },
      { t: '    bl_label = "Lancer la simulation"', g: 2 },
      "    def execute(self, context):",
      "        self.report({'INFO'}, \"Simulation lancée\")",
      "        return {'FINISHED'}",
      "def register():",
      "    bpy.utils.register_class(PANACHE_OT_lancer)",
      "def unregister():",
      "    bpy.utils.unregister_class(PANACHE_OT_lancer)"],
    distractors: ["    return True", "bpy.ops.panache.lancer()"],
    explain: "Structure type : import, classe Operator (bl_idname au format « categorie.nom » en minuscules, bl_label), méthode execute qui renvoie un SET comme {'FINISHED'}, puis register/unregister. Appeler bpy.ops au chargement du module est une erreur : l'opérateur n'est pas encore enregistré." },

  { type: "bug", lang: "python",
    q: "À l'activation de l'add-on, Blender refuse d'enregistrer l'opérateur.",
    code: `import bpy

class PANACHE_OT_maillage(bpy.types.Operator):
    bl_idname = "PanacheMaillage"
    bl_label = "Générer le maillage"

    def execute(self, context):
        return {'FINISHED'}`,
    bug: [4],
    choices: ['bl_idname = "panache.maillage"', 'bl_idname = "PANACHE_OT_maillage"', 'bl_idname = "panache maillage"', 'bl_label = "panache.maillage"'],
    answer: 0,
    explain: "L'identifiant d'un opérateur doit être « categorie.nom », en minuscules, avec un point. Il devient alors appelable par bpy.ops.panache.maillage(). Le nom de CLASSE suit, lui, la convention PREFIXE_OT_nom." },

  { type: "mcq", lang: "python",
    q: "Que doit renvoyer la méthode execute() d'un opérateur ?",
    code: `def execute(self, context):
    ...
    return ???`,
    choices: ["Un set, par exemple {'FINISHED'} ou {'CANCELLED'}", "True ou False", "None", "Le contexte modifié"],
    answer: 0,
    explain: "Blender attend un ensemble de statuts : {'FINISHED'} quand l'action s'est faite (elle entre alors dans l'historique d'annulation), {'CANCELLED'} sinon. Renvoyer True provoque une erreur à l'exécution." },

  { type: "mcq", lang: "python",
    q: "Depuis Blender 2.80, comment déclare-t-on une propriété réglable dans une classe ?",
    choices: [
      "vitesse_vent: bpy.props.FloatProperty(name=\"Vent\", default=5.0, min=0.0)",
      "vitesse_vent = bpy.props.FloatProperty(name=\"Vent\", default=5.0)",
      "self.vitesse_vent = 5.0 dans __init__",
      "bpy.props.vitesse_vent = 5.0"],
    answer: 0,
    explain: "Depuis 2.80, les propriétés se déclarent par ANNOTATION (deux-points), pas par affectation (=, l'ancienne syntaxe 2.7x). Les arguments min et max bornent la saisie : utile pour empêcher un vent négatif dans l'interface." },

  { type: "bug", lang: "python",
    q: "Le panneau n'apparaît pas dans la barre latérale (touche N) de la vue 3D.",
    code: `class PANACHE_PT_panneau(bpy.types.Panel):
    bl_label = "Panache"
    bl_space_type = 'VIEW3D'
    bl_region_type = 'UI'
    bl_category = "Panache"

    def draw(self, context):
        self.layout.operator("panache.lancer")`,
    bug: [3],
    choices: ["bl_space_type = 'VIEW_3D'", "bl_space_type = 'SIDEBAR'", "bl_region_type = 'TOOLS'", "bl_category = 'VIEW_3D'"],
    answer: 0,
    explain: "L'identifiant exact est 'VIEW_3D', avec un tiret bas. Avec bl_region_type = 'UI', le panneau va dans la barre latérale N, et bl_category donne le nom de l'onglet." },

  { type: "order", lang: "python",
    q: "Remets dans l'ordre un panneau qui affiche le réglage du vent et le bouton de lancement.",
    lines: [
      "class PANACHE_PT_panneau(bpy.types.Panel):",
      { t: '    bl_label = "Panache"', g: 1 },
      { t: "    bl_space_type = 'VIEW_3D'", g: 1 },
      { t: "    bl_region_type = 'UI'", g: 1 },
      { t: '    bl_category = "Panache"', g: 1 },
      "    def draw(self, context):",
      "        layout = self.layout",
      { t: '        layout.prop(context.scene, "panache_vent")', g: 7 },
      { t: '        layout.operator("panache.lancer")', g: 7 }],
    distractors: ["    def execute(self, context):", '        return {"FINISHED"}'],
    explain: "Un Panel n'a pas d'execute : il a une méthode draw qui décrit l'interface. layout.prop affiche une propriété (ici stockée dans la scène) et layout.operator affiche un bouton qui lance l'opérateur. L'ordre des attributs bl_* entre eux est libre." },

  { type: "mcq",
    q: "Ton add-on doit lancer Code_Saturne (plusieurs minutes) depuis Blender sans geler l'interface. Meilleure approche ?",
    choices: [
      "subprocess.Popen pour lancer le calcul, puis bpy.app.timers (ou un opérateur modal) qui surveille le processus",
      "subprocess.run(...) directement dans execute()",
      "os.system(...) dans execute()",
      "Un thread Python qui modifie les objets bpy pendant le calcul"],
    answer: 0,
    explain: "subprocess.run et os.system bloquent jusqu'à la fin : Blender reste figé. Popen rend la main tout de suite, et un timer (bpy.app.timers.register) interroge proc.poll() régulièrement. Modifier les données bpy depuis un autre thread est dangereux, car l'API n'est pas thread-safe." },

  { type: "mcq", lang: "python",
    q: "Où stocker un réglage (vitesse du vent) pour qu'il soit sauvegardé dans le fichier .blend ?",
    code: `def register():
    ...`,
    choices: [
      "bpy.types.Scene.panache_vent = bpy.props.FloatProperty(...) dans register(), et del bpy.types.Scene.panache_vent dans unregister()",
      "Dans une variable globale Python",
      "Dans un fichier texte à côté de l'add-on",
      "Dans bl_info"],
    answer: 0,
    explain: "Une propriété ajoutée au type Scene existe dans chaque scène et est enregistrée avec le .blend. On y accède par context.scene.panache_vent. Une variable globale serait perdue à la fermeture." },

  { type: "mcq",
    q: "Dans unregister(), dans quel ordre désenregistrer les classes ?",
    choices: [
      "Dans l'ordre inverse de register()",
      "Dans le même ordre que register()",
      "Peu importe, et seulement si on a le temps",
      "On ne désenregistre jamais"],
    answer: 0,
    explain: "Une classe peut dépendre d'une autre, par exemple un panneau qui affiche un opérateur ou un PropertyGroup utilisé par une autre classe. On enregistre les dépendances d'abord, et on les retire en dernier : for c in reversed(classes): bpy.utils.unregister_class(c)." },

  { type: "mcq",
    q: "Blender 4.2+ : qu'est-ce qui change pour distribuer un add-on comme « extension » ?",
    choices: [
      "Les métadonnées passent dans un fichier blender_manifest.toml (au lieu du dictionnaire bl_info)",
      "Les add-ons doivent être écrits en C++",
      "Il n'y a plus de register()",
      "bpy est remplacé par une autre API"],
    answer: 0,
    explain: "Depuis 4.2, le système d'extensions décrit le paquet (nom, version, permissions…) dans blender_manifest.toml. Les add-ons « legacy » avec bl_info restent installables. register()/unregister() et l'API bpy ne changent pas." },
  ]
},

/* =====================================================================
   6. BASH : OPENFOAM & CODE_SATURNE
   ===================================================================== */
{
  id: "bash",
  title: "Bash OpenFOAM",
  sub: "Les bonnes commandes, dans le bon ordre",
  color: "#4a5568",
  questions: [
  { type: "order", lang: "bash",
    q: "Mailler un site industriel (bâtiments en STL) avec OpenFOAM ESI (v2606).",
    lines: [
      "cd ~/openfoam-exercice/site-industriel",
      "blockMesh",
      "surfaceFeatureExtract",
      "snappyHexMesh -overwrite",
      "checkMesh"],
    distractors: ["reconstructPar", "simpleFoam -overwrite"],
    explain: "blockMesh crée le maillage de fond. surfaceFeatureExtract extrait les arêtes vives des STL (fichiers .eMesh), indispensable pour un bon snap. snappyHexMesh découpe le maillage autour des bâtiments, et -overwrite écrit le résultat directement dans constant/polyMesh. checkMesh contrôle enfin la qualité. Dans la version Foundation, l'équivalent de surfaceFeatureExtract s'appelle surfaceFeatures." },

  { type: "order", lang: "bash",
    q: "Lancer un calcul en parallèle sur 8 cœurs puis recombiner le dernier pas de temps.",
    lines: [
      "decomposePar",
      "mpirun -np 8 simpleFoam -parallel > log.simpleFoam 2>&1",
      "reconstructPar -latestTime"],
    distractors: ["export OMP_NUM_THREADS=8", "mpirun -np 8 simpleFoam > log.simpleFoam"],
    explain: "OpenFOAM se parallélise avec MPI, pas OpenMP : OMP_NUM_THREADS ne sert à rien ici. decomposePar découpe le domaine en processor0…7 selon system/decomposeParDict (numberOfSubdomains doit valoir 8). Sans -parallel, on lancerait 8 calculs identiques. reconstructPar regroupe enfin les morceaux pour ParaView." },

  { type: "order", lang: "bash",
    q: "Cas de dispersion : du maillage au suivi du calcul LES en arrière-plan.",
    lines: [
      "blockMesh",
      "snappyHexMesh -overwrite",
      "topoSet",
      "pimpleFoam > log.pimpleFoam 2>&1 &",
      "tail -f log.pimpleFoam"],
    distractors: ["simpleFoam -LES", "topoSet -parallel -overwrite -LES"],
    explain: "topoSet crée l'ensemble de cellules de la source (la cheminée), utilisé ensuite par fvOptions pour injecter le scalaire C. pimpleFoam est le solveur transitoire de la LES. Le & le lance en arrière-plan, et tail -f suit le log en direct (Ctrl+C arrête le suivi, pas le calcul)." },

  { type: "order", lang: "bash",
    q: "Ouvrir la GUI Code_Saturne (Docker) sur Mac avec XQuartz.",
    lines: [
      "defaults write org.xquartz.X11 nolisten_tcp -bool false",
      "open -a XQuartz",
      "export DISPLAY=:0",
      "xhost + 127.0.0.1",
      'docker run --rm -it -v "$PWD":/home/code_saturne -e DISPLAY=host.docker.internal:0 simvia/code_saturne:9.0.0 gui'],
    distractors: ["xhost + 127.0.0.1   (tapé dans la fenêtre XQuartz)", "brew install code_saturne"],
    explain: "Vu en vrai : on autorise d'abord XQuartz à écouter en TCP (puis on le redémarre), on définit DISPLAY dans le Terminal (sinon xhost échoue avec « unable to open display »), on autorise la connexion locale, puis le conteneur affiche sur host.docker.internal:0. Il n'existe pas de formule Homebrew pour Code_Saturne." },

  { type: "order", lang: "bash",
    q: "Chaîne Code_Saturne en ligne de commande : créer l'étude, mailler avec Gmsh (conteneur Linux), lancer.",
    lines: [
      "cd ~/code-saturne-exercice",
      'docker run --rm -v "$PWD":/home/code_saturne simvia/code_saturne:9.0.0 create -s etude',
      'docker run --rm -v "$PWD":/data -w /data/etude/MESH debian:bookworm-slim bash -c "apt-get update -qq && apt-get install -y -qq gmsh && gmsh -3 box.geo -o box.msh -format msh2"',
      'docker run --rm -v "$PWD":/home/code_saturne -w /home/code_saturne/etude/CASE1/DATA simvia/code_saturne:9.0.0 run'],
    distractors: ["gmsh -3 box.geo   (gmsh Homebrew : plante sur libhvf.dylib)", "code_saturne run   (en natif sur le Mac : pas installé)"],
    explain: "L'étude doit exister avant d'y mettre le maillage (dossier MESH). Gmsh tourne dans un conteneur Debian, car le gmsh Homebrew plante sur macOS 15 < 15.4 (libhvf.dylib). Le run se lance depuis CASE1/DATA. Le setup.xml doit pointer sur le .msh, pas sur le .geo !" },

  { type: "mcq", lang: "bash",
    q: "Que fait « 2>&1 » dans cette commande ?",
    code: `simpleFoam > log.simpleFoam 2>&1`,
    choices: [
      "Redirige les erreurs (stderr) vers le même fichier que la sortie normale (stdout)",
      "Lance 2 calculs en parallèle",
      "Écrit seulement 1 ligne sur 2",
      "Supprime les erreurs"],
    answer: 0,
    explain: "1 désigne stdout, 2 stderr. > log envoie stdout dans le fichier, puis 2>&1 envoie stderr au même endroit. Les messages FOAM FATAL ERROR finissent donc aussi dans le log. L'ordre compte : 2>&1 > log n'aurait pas le même effet." },

  { type: "mcq", lang: "bash",
    q: "Ton dossier contient des centaines de dossiers de temps inutiles. Quelle commande OpenFOAM les supprime proprement ?",
    choices: ["foamListTimes -rm", "rm -rf *", "checkMesh -rm", "reconstructPar -clean"],
    answer: 0,
    explain: "foamListTimes liste les dossiers de temps, et -rm les supprime en gardant 0/ par défaut. rm -rf * effacerait aussi system/, constant/ et 0/, c'est-à-dire tout le cas ! Teste toujours d'abord sans -rm pour voir ce qui sera supprimé." },

  { type: "mcq", lang: "bash",
    q: "Changer endTime à 1000 sans ouvrir d'éditeur :",
    choices: [
      "foamDictionary system/controlDict -entry endTime -set 1000",
      "endTime=1000 simpleFoam",
      "echo 1000 > system/controlDict",
      "export endTime=1000"],
    answer: 0,
    explain: "foamDictionary lit et modifie une entrée d'un dictionnaire OpenFOAM en gardant le reste du fichier. echo > écraserait tout le controlDict, y compris l'en-tête FoamFile, ce qui provoque l'erreur « problem while reading header »." },

  { type: "mcq", lang: "bash",
    q: "Que renvoie cette commande ?",
    code: `grep "Courant Number" log.pimpleFoam | tail -1`,
    choices: [
      "La dernière ligne du log contenant « Courant Number » (le Courant du dernier pas)",
      "Le nombre de lignes contenant Courant",
      "La première ligne du log",
      "Toutes les lignes sauf la dernière"],
    answer: 0,
    explain: "grep filtre les lignes qui contiennent le motif, et tail -1 garde la dernière. C'est un réflexe pour surveiller la stabilité d'un calcul transitoire : on veut un Courant max sous environ 1 avec maxCo." },

  { type: "mcq", lang: "bash",
    q: "Pourquoi snappyHexMesh -overwrite ?",
    choices: [
      "Pour écrire le maillage final dans constant/polyMesh au lieu de créer des dossiers de temps 1/, 2/, 3/",
      "Pour écraser les fichiers STL",
      "Pour forcer l'ajout des couches limites",
      "Pour lancer le calcul après le maillage"],
    answer: 0,
    explain: "Sans -overwrite, chaque étape (castellated, snap, layers) écrit un dossier de temps. Ces dossiers polluent ensuite le cas et peuvent troubler le solveur ou ParaView." },
  ]
}
];
