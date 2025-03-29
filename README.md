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
- `Dockerfile` - Pour construire un conteneur Docker
- `docker-compose.yml` - Configuration Docker Compose standard
- `docker-compose.traefik.yml` - Configuration avec Traefik
- `docker-compose.caddy.yml` - Configuration avec Caddy

## Installation

### Option 1 : Serveur web traditionnel

1. Clonez ce dépôt sur votre serveur web :
```bash
git clone https://github.com/kihw/mserv-dashboard.git
```

2. Modifiez le fichier `js/data.js` pour inclure vos propres services et informations.

3. Déployez les fichiers sur votre serveur web.

### Option 2 : Docker

1. Clonez ce dépôt :
```bash
git clone https://github.com/kihw/mserv-dashboard.git
cd mserv-dashboard
```

2. Personnalisez vos services dans `js/data.js`.

3. Construisez et démarrez le conteneur :
```bash
docker-compose up -d
```

4. Accédez au tableau de bord sur `http://localhost:8080`

### Option 3 : Avec Traefik

1. Assurez-vous que Traefik est déjà en cours d'exécution avec un réseau nommé `proxy`.

2. Configurez votre domaine dans `docker-compose.traefik.yml`.

3. Démarrez le service :
```bash
docker-compose -f docker-compose.traefik.yml up -d
```

### Option 4 : Avec Caddy

1. Assurez-vous que Caddy est déjà en cours d'exécution avec un réseau approprié.

2. Ajoutez la configuration indiquée dans le fichier `docker-compose.caddy.yml` à votre Caddyfile.

3. Démarrez le service :
```bash
docker-compose -f docker-compose.caddy.yml up -d
```

## Personnalisation

Vous pouvez personnaliser ce tableau de bord de plusieurs façons :

- Modifier les couleurs et thèmes dans `css/variables.css`
- Ajouter ou supprimer des services dans `js/data.js`
- Créer de nouveaux groupes ou catégories de services
- Connecter à de vraies API système pour des métriques réelles

## Connecter à des API réelles

Pour remplacer les données simulées par des données réelles :

1. Modifiez `js/system.js` pour appeler des API externes, par exemple :

```javascript
async function updateSystemStatus() {
    try {
        // Récupérer des données réelles depuis une API
        const response = await fetch('https://your-monitoring-api.com/status');
        const data = await response.json();
        
        // Mettre à jour l'interface
        document.querySelector('.weather-temp').textContent = `${data.system.health}%`;
        // ...
    } catch (error) {
        console.error('Erreur lors de la récupération des métriques:', error);
    }
    
    setTimeout(updateSystemStatus, 10000);
}
```

2. Pour les statuts de service, utilisez une API comme Uptime Kuma :

```javascript
async function checkServicesStatus() {
    try {
        const response = await fetch('https://status.mserv.wtf/api/status');
        const statuses = await response.json();
        
        // Mettre à jour les statuts des services
        services.forEach(service => {
            const serviceStatus = statuses.find(s => s.name === service.name);
            if (serviceStatus) {
                service.status = serviceStatus.status;
            }
        });
        
        generateServiceCards();
    } catch (error) {
        console.error('Erreur lors de la vérification des statuts:', error);
    }
    
    setTimeout(checkServicesStatus, 60000);
}
```

## Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

© 2025 mserv.wtf | Dashboard personnalisé
