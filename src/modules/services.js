/**
 * Gestionnaire de services avancé et complet
 */
export default class ServicesManager {
  constructor(dashboard) {
    this.dashboard = dashboard;

    // Liste des services
    this.services = [];

    // Configuration des services
    this.config = {
      servicesConfigPath: '../../config/services.json',
      storageKey: 'mserv_services',
      maxRecentServices: 5,
      categories: [
        { id: 'media', name: 'Médias', icon: 'play-circle' },
        { id: 'admin', name: 'Administration', icon: 'settings' },
        { id: 'dev', name: 'Développement', icon: 'code' },
        { id: 'tools', name: 'Outils', icon: 'tool' },
      ],
    };

    // Historique des services récents
    this.recentServices = [];
  }

  /**
   * Initialisation du gestionnaire de services
   */
  async initialize() {
    try {
      // Charger la configuration des services
      await this.loadServicesConfiguration();

      // Initialiser le rendu des services
      this.renderServices();

      console.log('Services manager initialized successfully');
    } catch (error) {
      console.error("Erreur lors de l'initialisation des services", error);
      // Utiliser une configuration par défaut
      this.services = this.getFallbackConfig().default_services;
      this.renderServices();
    }
  }

  /**
   * Charge la configuration des services
   */
  async loadServicesConfiguration() {
    try {
      // Tentatives avec différents chemins
      const configPaths = ['../../config/services.json'];

      let serviceConfig = null;

      for (const path of configPaths) {
        try {
          const response = await fetch(path);
          if (response.ok) {
            serviceConfig = await response.json();
            console.log(`Services chargés depuis: ${path}`);
            break;
          }
        } catch (err) {
          console.warn(`Échec du chargement depuis ${path}`);
        }
      }

      // Si tous les chemins échouent, utiliser la configuration de secours
      if (!serviceConfig) {
        console.warn('Utilisation de la configuration de secours pour les services');
        serviceConfig = this.getFallbackConfig();
      }

      // Fusion des services par défaut et personnalisés
      this.services = [
        ...(serviceConfig.default_services || []),
        ...(this.loadCustomServices(serviceConfig.custom_services) || []),
      ];

      // Rendre les services
      this.renderServices();
    } catch (error) {
      console.error('Erreur de chargement des services:', error);
      // Configurer des services fallback si nécessaire
    }
  }
  /**
   * Rend les services dans l'interface
   */
  renderServices() {
    // Attendre que le DOM soit complètement chargé
    if (document.readyState !== 'complete') {
      document.addEventListener('DOMContentLoaded', () => this.renderServices());
      return;
    }

    // Sélectionner le conteneur de catégories
    let categoriesGrid = document.querySelector('.categories-grid');

    // Créer le conteneur s'il n'existe pas
    if (!categoriesGrid) {
      categoriesGrid = document.createElement('div');
      categoriesGrid.className = 'categories-grid';

      // Trouver un conteneur parent approprié
      const parentContainer =
        document.querySelector('.dashboard-content') || document.querySelector('main') || document.body;
      parentContainer.appendChild(categoriesGrid);
    }

    // Vider le conteneur existant
    categoriesGrid.innerHTML = '';

    // Vérifier si des services sont disponibles
    if (this.services.length === 0) {
      console.warn('Aucun service disponible pour le rendu');
      categoriesGrid.innerHTML = `
        <div class="no-services-message">
          <p>Aucun service n'est actuellement configuré.</p>
        </div>
      `;
      return;
    }

    // Grouper les services par catégorie
    const servicesByCategory = this.groupServicesByCategory();

    // Créer les sections de catégories
    Object.entries(servicesByCategory).forEach(([categoryId, services]) => {
      const category = this.createCategoryElement(categoryId, services);
      categoriesGrid.appendChild(category);
    });

    console.log(`Rendu de ${this.services.length} services dans ${Object.keys(servicesByCategory).length} catégories`);
  }

  /**
   * Groupe les services par catégorie
   * @returns {Object} Services groupés par catégorie
   */
  groupServicesByCategory() {
    return this.services.reduce((acc, service) => {
      if (!acc[service.category]) {
        acc[service.category] = [];
      }
      acc[service.category].push(service);
      return acc;
    }, {});
  }

  /**
   * Crée un élément de catégorie
   * @param {string} categoryId - ID de la catégorie
   * @param {Array} services - Services de la catégorie
   * @returns {HTMLElement} Élément de catégorie
   */
  createCategoryElement(categoryId, services) {
    const category = document.createElement('section');
    category.className = 'category';
    category.dataset.categoryId = categoryId;

    // En-tête de catégorie
    const header = document.createElement('div');
    header.className = 'category-header';
    header.innerHTML = `
      <h2>${this.getCategoryName(categoryId)}</h2>
    `;
    category.appendChild(header);

    // Liste des services
    const servicesList = document.createElement('div');
    servicesList.className = 'services';

    services.forEach((service) => {
      const serviceElement = this.createServiceElement(service);
      servicesList.appendChild(serviceElement);
    });

    category.appendChild(servicesList);

    return category;
  }

  /**
   * Crée un élément de service
   * @param {Object} service - Informations du service
   * @returns {HTMLElement} Élément de service
   */
  createServiceElement(service) {
    const serviceLink = document.createElement('a');
    serviceLink.href = `https://${service.url}`;
    serviceLink.className = 'service';
    serviceLink.target = '_blank';
    serviceLink.rel = 'noopener noreferrer';
    serviceLink.dataset.serviceId = service.id;

    // Icône du service
    const icon = document.createElement('div');
    icon.className = 'service-icon';
    icon.innerHTML = `
  <img src="https://cdn.jsdelivr.net/gh/selfhst/icons/svg/${service.icon}.svg" 
       alt="${service.name}" width="24" height="24"
       onerror="this.onerror=null; this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2224%22 height=%2224%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22currentColor%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><rect x=%223%22 y=%223%22 width=%2218%22 height=%2218%22 rx=%222%22 ry=%222%22></rect><circle cx=%228.5%22 cy=%228.5%22 r=%221.5%22></circle><polyline points=%2221 15 16 10 5 21%22></polyline></svg>';">
`;

    // Informations du service
    const details = document.createElement('div');
    details.className = 'service-details';
    details.innerHTML = `
      <h3 class="service-name">${service.name}</h3>
      <p class="service-description">${service.description}</p>
    `;

    serviceLink.appendChild(icon);
    serviceLink.appendChild(details);

    return serviceLink;
  }

  /**
   * Récupère le nom lisible d'une catégorie
   * @param {string} categoryId - ID de la catégorie
   * @returns {string} Nom de la catégorie
   */
  getCategoryName(categoryId) {
    const category = this.config.categories.find((cat) => cat.id === categoryId);
    return category ? category.name : categoryId;
  }

  /**
   * Récupère un service par son ID
   * @param {string} serviceId - ID du service
   * @returns {Object|null} Service correspondant
   */
  getServiceById(serviceId) {
    return this.services.find((service) => service.id === serviceId) || null;
  }

  /**
   * Charge les services personnalisés
   * @param {Array} customServices - Services personnalisés à charger
   * @returns {Array} Liste des services personnalisés valides
   */
  loadCustomServices(customServices = []) {
    try {
      // Récupérer les services personnalisés du stockage local
      const storedCustomServices = localStorage.getItem(this.config.storageKey);

      if (storedCustomServices) {
        try {
          const parsedCustomServices = JSON.parse(storedCustomServices);
          customServices = [...customServices, ...parsedCustomServices];
        } catch (error) {
          console.warn('Erreur lors du parsing des services personnalisés stockés', error);
        }
      }

      // Valider et filtrer les services personnalisés
      return customServices.filter((service) => this.validateServiceConfig(service));
    } catch (error) {
      console.error('Erreur lors du chargement des services personnalisés', error);
      return [];
    }
  }

  /**
   * Valide la configuration d'un service
   * @param {Object} serviceConfig - Configuration du service
   * @returns {boolean} Indique si la configuration est valide
   */
  validateServiceConfig(serviceConfig) {
    // Vérifier que serviceConfig est un objet
    if (!serviceConfig || typeof serviceConfig !== 'object') {
      return false;
    }

    const requiredFields = ['id', 'name', 'description', 'url', 'icon', 'category'];

    // Vérifier la présence de tous les champs requis
    const hasAllFields = requiredFields.every((field) => serviceConfig.hasOwnProperty(field) && serviceConfig[field]);

    // Vérifier que la catégorie existe
    const isValidCategory = this.config.categories.some((category) => category.id === serviceConfig.category);

    return hasAllFields && isValidCategory;
  }

  /**
   * Ajoute un nouveau service personnalisé
   * @param {Object} serviceConfig - Configuration du service
   * @returns {boolean} Indique si l'ajout a réussi
   */
  addCustomService(serviceConfig) {
    // Valider la configuration du service
    if (!this.validateServiceConfig(serviceConfig)) {
      console.warn('Configuration de service invalide', serviceConfig);
      return false;
    }

    // Vérifier que le service n'existe pas déjà
    const existingService = this.services.find((s) => s.id === serviceConfig.id);
    if (existingService) {
      console.warn(`Un service avec l'ID ${serviceConfig.id} existe déjà`);
      return false;
    }

    // Ajouter le service
    this.services.push(serviceConfig);

    // Sauvegarder les services personnalisés
    this.saveCustomServices();

    // Mettre à jour l'affichage
    this.renderServices();

    return true;
  }

  /**
   * Sauvegarde les services personnalisés
   */
  saveCustomServices() {
    try {
      // Ne sauvegarder que les services personnalisés (non par défaut)
      const customServices = this.services.filter((service) => !this.isDefaultService(service));

      localStorage.setItem(this.config.storageKey, JSON.stringify(customServices));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des services personnalisés', error);
    }
  }
  getFallbackConfig() {
    return {
      categories: [
        { id: 'media', name: 'Médias', icon: 'play-circle' },
        { id: 'admin', name: 'Administration', icon: 'settings' },
        { id: 'dev', name: 'Développement', icon: 'code' },
        { id: 'tools', name: 'Outils', icon: 'tool' },
      ],
      default_services: [
        {
          id: 'jellyfin',
          name: 'Jellyfin',
          description: 'Serveur multimédia open-source',
          url: 'jellyfin.mserv.wtf',
          icon: 'jellyfin',
          category: 'media',
        },
        // Add other default services from your current config
      ],
      custom_services: [],
    };
  }
  /**
   * Vérifie si un service est un service par défaut
   * @param {Object} service - Service à vérifier
   * @returns {boolean} Indique si le service est par défaut
   */
  isDefaultService(service) {
    const defaultServiceIds = ['jellyfin', 'portainer', 'gitea', 'vaultwarden', 'nextcloud', 'home-assistant'];
    return defaultServiceIds.includes(service.id);
  }
}
