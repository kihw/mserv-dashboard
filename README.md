# Dashboard mserv.wtf

Un tableau de bord moderne et réactif pour gérer l'accès à vos services auto-hébergés.

![Version](https://img.shields.io/badge/version-3.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Aperçu

Ce tableau de bord est conçu pour centraliser l'accès à tous vos services auto-hébergés dans une interface élégante et facile à utiliser. Il offre une vue d'ensemble de l'état de votre système et permet de naviguer rapidement entre vos différents services.

## Fonctionnalités

- **Design moderne et responsive** : S'adapte à tous les appareils (mobile, tablette, desktop)
- **Mode sombre/clair** : Bascule automatique selon les préférences système, avec option manuelle
- **Organisation intelligente** : Regroupement des services par catégorie fonctionnelle
- **Recherche instantanée** : Trouvez rapidement n'importe quel service
- **Favoris** : Accès rapide à vos services les plus utilisés
- **Monitoring système** : Visualisation de l'état de votre serveur
- **Indicateurs d'état** : Statut en temps réel de chaque service

## Structure

- `index.html` - Structure principale de la page
- `css/` - Styles répartis en modules
  - `variables.css` - Variables CSS et thème
  - `layout.css` - Mise en page principale
  - `components.css` - Styles des composants individuels
  - `responsive.css` - Adaptations pour différentes tailles d'écran
- `js/` - Scripts JavaScript modulaires
  - `data.js` - Données des services
  - `theme.js` - Gestion du thème sombre/clair
  - `services.js` - Fonctions de génération des services
  - `system.js` - Simulation des métriques système
  - `search.js` - Fonctionnalités de recherche
  - `main.js` - Script d'initialisation

## Installation

1. Clonez ce dépôt sur votre serveur web :
```bash
git clone https://github.com/kihw/mserv-dashboard.git
```

2. Modifiez le fichier `js/data.js` pour inclure vos propres services et informations.

3. Déployez les fichiers sur votre serveur web ou conteneur.

## Personnalisation

Vous pouvez personnaliser ce tableau de bord de plusieurs façons :

- Modifier les couleurs et thèmes dans `css/variables.css`
- Ajouter ou supprimer des services dans `js/data.js`
- Créer de nouveaux groupes ou catégories de services
- Connecter à de vraies API système pour des métriques réelles

## Usage avec Caddy

Voici un exemple de configuration avec Caddy :

```caddy
home.mserv.wtf {
    root * /var/www/mserv-dashboard
    file_server
    encode gzip
    log {
        output file /var/log/caddy/mserv-dashboard.log {
            roll_size 10MB
            roll_keep 10
        }
    }
}
```

---

© 2025 mserv.wtf | Dashboard personnalisé
