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
      servicesConfigPath: '/config/services.json',
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

      // Configuration des événements
      this.setupEventListeners();

      // Initialiser le rendu des services
      this.renderServices();
    } catch (error) {
      console.error("Erreur lors de l'initialisation des services", error);
    }
  }

  async loadServicesConfiguration() {
    try {
      // Tentatives avec différents chemins
      const configPaths = [
        '/config/services.json',
        './config/services.json',
        '../config/services.json',
        'config/services.json',
      ];

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

      if (!serviceConfig) {
        throw new Error('Impossible de charger la configuration des services');
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
    const categoriesGrid = document.querySelector('.categories-grid');
    if (!categoriesGrid) return;

    // Vider le conteneur existant
    categoriesGrid.innerHTML = '';

    // Grouper les services par catégorie
    const servicesByCategory = this.groupServicesByCategory();

    // Créer les sections de catégories
    Object.entries(servicesByCategory).forEach(([categoryId, services]) => {
      const category = this.createCategoryElement(categoryId, services);
      categoriesGrid.appendChild(category);
    });
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
           alt="${service.name}" width="24" height="24">
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
        const parsedCustomServices = JSON.parse(storedCustomServices);
        customServices = [...customServices, ...parsedCustomServices];
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

    // Réindexer les services
    this.indexServices();

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
