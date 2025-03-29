/**
 * Données des services du serveur domestique
 */
const services = [
    {
        id: 'jellyfin',
        name: 'Jellyfin',
        description: 'Serveur multimédia pour vos films, séries et vidéos personnelles',
        category: 'media',
        icon: 'fas fa-film',
        url: 'https://jellyfin.mserv.wtf',
        status: 'online',
        priority: 'high',
        color: '#8b5cf6'
    },
    {
        id: 'jellyseerr',
        name: 'Jellyseerr',
        description: 'Demandes de nouveaux films et séries',
        category: 'media',
        icon: 'fas fa-list-alt',
        url: 'https://jellyseerr.mserv.wtf',
        status: 'online',
        color: '#8b5cf6'
    },
    {
        id: 'navidrome',
        name: 'Navidrome',
        description: 'Serveur de streaming pour votre musique',
        category: 'media',
        icon: 'fas fa-music',
        url: 'https://music.mserv.wtf',
        status: 'online',
        color: '#8b5cf6'
    },
    {
        id: 'sonarr',
        name: 'Sonarr',
        description: 'Gestion automatisée des séries TV',
        category: 'management',
        icon: 'fas fa-tv',
        url: 'https://sonarr.mserv.wtf',
        status: 'online',
        color: '#3b82f6'
    },
    {
        id: 'radarr',
        name: 'Radarr',
        description: 'Gestion automatisée des films',
        category: 'management',
        icon: 'fas fa-film',
        url: 'https://radarr.mserv.wtf',
        status: 'online',
        color: '#3b82f6'
    },
    {
        id: 'lidarr',
        name: 'Lidarr',
        description: 'Gestion automatisée de la musique',
        category: 'management',
        icon: 'fas fa-headphones',
        url: 'https://lidarr.mserv.wtf',
        status: 'online',
        color: '#3b82f6'
    },
    {
        id: 'bazarr',
        name: 'Bazarr',
        description: 'Téléchargement automatique de sous-titres',
        category: 'management',
        icon: 'fas fa-closed-captioning',
        url: 'https://bazarr.mserv.wtf',
        status: 'online',
        color: '#3b82f6'
    },
    {
        id: 'prowlarr',
        name: 'Prowlarr',
        description: 'Gestion centralisée des indexeurs',
        category: 'management',
        icon: 'fas fa-search',
        url: 'https://prowlarr.mserv.wtf',
        status: 'online',
        color: '#3b82f6'
    },
    {
        id: 'mdblistarr',
        name: 'MDBListarr',
        description: 'Intégration de listes avec les applications *arr',
        category: 'management',
        icon: 'fas fa-list',
        url: 'https://mdblist.mserv.wtf',
        status: 'online',
        color: '#3b82f6'
    },
    {
        id: 'qbittorrent',
        name: 'qBittorrent',
        description: 'Client torrent avec interface web',
        category: 'downloads',
        icon: 'fas fa-download',
        url: 'https://qbit.mserv.wtf',
        status: 'online',
        color: '#10b981'
    },
    {
        id: 'vaultwarden',
        name: 'Vaultwarden',
        description: 'Gestionnaire de mots de passe sécurisé',
        category: 'security',
        icon: 'fas fa-key',
        url: 'https://vault.mserv.wtf',
        status: 'online',
        priority: 'high',
        color: '#6366f1'
    },
    {
        id: 'gitea',
        name: 'Gitea',
        description: 'Service git autohébergé',
        category: 'utilities',
        icon: 'fas fa-code-branch',
        url: 'https://git.mserv.wtf',
        status: 'online',
        color: '#f59e0b'
    },
    {
        id: 'filebrowser',
        name: 'File Browser',
        description: 'Explorateur de fichiers via navigateur',
        category: 'utilities',
        icon: 'fas fa-folder-open',
        url: 'https://files.mserv.wtf',
        status: 'online',
        color: '#f59e0b'
    },
    {
        id: 'meilisearch',
        name: 'Meilisearch',
        description: 'Moteur de recherche puissant',
        category: 'utilities',
        icon: 'fas fa-search',
        url: 'https://search.mserv.wtf',
        status: 'online',
        color: '#f59e0b'
    },
    {
        id: 'portainer',
        name: 'Portainer',
        description: 'Gestion des conteneurs Docker',
        category: 'monitoring',
        icon: 'fas fa-boxes',
        url: 'https://portainer.mserv.wtf',
        status: 'online',
        priority: 'high',
        color: '#ef4444'
    },
    {
        id: 'uptimekuma',
        name: 'Uptime Kuma',
        description: 'Surveillance et monitoring des services',
        category: 'monitoring',
        icon: 'fas fa-chart-line',
        url: 'https://status.mserv.wtf',
        status: 'online',
        color: '#ef4444'
    },
    {
        id: 'dozzle',
        name: 'Dozzle',
        description: 'Visualisation des logs des conteneurs',
        category: 'monitoring',
        icon: 'fas fa-clipboard-list',
        url: 'https://logs.mserv.wtf',
        status: 'online',
        color: '#ef4444'
    }
];

/**
 * Configuration des groupes de services
 */
const serviceGroups = [
    {
        id: 'media',
        name: 'Médias',
        icon: 'fas fa-film',
        services: ['jellyfin', 'jellyseerr', 'navidrome']
    },
    {
        id: 'management',
        name: 'Gestion des Médias',
        icon: 'fas fa-cogs',
        services: ['sonarr', 'radarr', 'lidarr', 'bazarr', 'prowlarr', 'mdblistarr']
    },
    {
        id: 'utilities',
        name: 'Utilitaires',
        icon: 'fas fa-tools',
        services: ['vaultwarden', 'gitea', 'filebrowser', 'meilisearch', 'qbittorrent']
    },
    {
        id: 'monitoring',
        name: 'Surveillance & Administration',
        icon: 'fas fa-chart-line',
        services: ['portainer', 'uptimekuma', 'dozzle']
    }
];

/**
 * Services favoris
 */
const favoritesServices = ['jellyfin', 'vaultwarden', 'sonarr', 'radarr', 'qbittorrent', 'portainer'];
