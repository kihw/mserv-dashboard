# MServ Dashboard

Tableau de bord moderne pour gérer les services auto-hébergés sur un serveur domestique.

![Screenshot du Dashboard](screenshots/dashboard.png)

## Fonctionnalités

- Interface utilisateur moderne et réactive
- Thème clair/sombre adaptatif
- Organisation des services par catégories
- Moniteur d'état du système en temps réel
- Vue favoris pour un accès rapide
- Recherche instantanée de services
- Indicateurs de statut pour chaque service
- Compatible avec tous les appareils

## Services pris en charge

- Médias : Jellyfin, Jellyseerr, Navidrome
- Gestion des médias : Sonarr, Radarr, Lidarr, Bazarr, Prowlarr, MDBListarr
- Téléchargement : qBittorrent
- Sécurité : Vaultwarden
- Utilitaires : Gitea, Meilisearch, File Browser
- Surveillance : Portainer, Uptime Kuma, Dozzle

## Installation

1. Clonez ce dépôt dans votre environnement d'hébergement :
```bash
git clone https://github.com/kihw/mserv-dashboard.git
```

2. Personnalisez le fichier `js/services.js` avec vos propres services.

3. Déployez les fichiers sur votre serveur web ou dans un conteneur.

4. Accédez à l'interface via votre navigateur.

## Configuration

Modifiez le fichier `js/services.js` pour ajouter, supprimer ou modifier les services affichés sur le tableau de bord.

## Technologies utilisées

- HTML5 / CSS3
- JavaScript (ES6+)
- Font Awesome pour les icônes
- Responsive design (mobile-first)

## Développement

Pour contribuer au développement :

1. Forkez le dépôt
2. Créez une branche pour votre fonctionnalité
3. Soumettez une pull request

## Licence

MIT

## Auteur

- kihw
