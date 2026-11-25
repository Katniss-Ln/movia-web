# Movia — version web installable

Version web indépendante, à publier dans un dépôt public GitHub (par exemple `movia-web`) et à déployer avec GitHub Pages. L’application conserve les réglages, les séances, les trajets GPS simplifiés et l’historique dans le stockage local de Safari. Le service worker garde les fichiers de l’application disponibles hors connexion après le premier chargement.

## Publication gratuite

1. Créer un dépôt public `movia-web` sur le profil GitHub.
2. Ajouter à sa branche `main` tous les fichiers de ce dossier, à la racine.
3. Dans **Settings → Pages**, choisir **GitHub Actions** comme source.
4. Après la première exécution réussie, l’adresse sera `https://katniss-ln.github.io/movia-web/`.
5. Sur l’iPhone, ouvrir l’adresse dans Safari, choisir **Partager → Ajouter à l’écran d’accueil** et activer **Ouvrir comme app web** si l’option apparaît.

> Le dépôt doit être public pour utiliser GitHub Pages avec l’offre gratuite. Les données d’entraînement ne sont pas envoyées à GitHub. Exporte une sauvegarde avant de vider les données de Safari ou de changer d’appareil.

## Limites de cette version web

- Le GPS utilise le navigateur pendant que la page est ouverte ; iOS peut suspendre la page lorsque l’écran est verrouillé. Le suivi GPS continu en arrière-plan n’est pas garanti.
- Cette version ne se connecte pas à Apple Santé, Apple Watch ou Decathlon/Kiprun.
- La bibliothèque musicale et la lecture en arrière-plan de l’app iPhone native ne sont pas reprises dans cette version web.
- Les programmes et activités sont conservés localement. L’import de programme utilise un CSV à séparateur point-virgule, comme le projet natif.
- Elle n’envoie aucune position ni donnée sportive à un serveur.
