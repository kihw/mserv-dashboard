/**
 * Gestionnaire de services avancé et complet
 */
export default class ServicesManager {
  constructor(dashboard) {
    this.dashboard = dashboard;

    // Liste des services
    this.services = [];

    // Cache pour optimisation
    this.serviceCache = new Map();

    // Configuration des services
    this.config = {
      storageKey: "mserv_services",
      maxRecentServices: 5,
      categories: [
        {
          id: "media",
          name: "Médias",
          icon: "play-circle",
        },
        {
          id: "admin",
          name: "Administration",
          icon: "settings",
        },
        {
          id: "dev",
          name: "Développement",
          icon: "code",
        },
        {
          id: "tools",
          name: "Outils",
          icon: "tool",
        },
      ],
    };

    // Historique des services récents
    this.recentServices = [];
  }

  /**
   * Initialisation du gestionnaire de services
   */
  initialize() {
    // Charger la liste des services
    this.loadServices();

    // Configuration des événements
    this.setupEventListeners();

    // Initialiser le rendu des services
    this.renderServices();
  }

  /**
   * Charge les services à partir de différentes sources
   */
  loadServices() {
    try {
      // Services par défaut
      const defaultServices = [
        {
          id: "jellyfin",
          name: "Jellyfin",
          description: "Serveur multimédia",
          url: "jellyfin.mserv.wtf",
          icon: "jellyfin",
          category: "media",
        },
        {
          id: "portainer",
          name: "Portainer",
          description: "Gestion Docker",
          url: "portainer.mserv.wtf",
          icon: "portainer",
          category: "admin",
        },
        {
          id: "gitea",
          name: "Gitea",
          description: "Dépôts Git",
          url: "git.mserv.wtf",
          icon: "gitea",
          category: "dev",
        },
        {
          id: "vaultwarden",
          name: "Vaultwarden",
          description: "Gestion de mots de passe",
          url: "vault.mserv.wtf",
          icon: "bitwarden",
          category: "tools",
        },
      ];

      // Charger les services personnalisés
      const customServices = this.loadCustomServices();

      // Fusionner les services
      this.services = [...defaultServices, ...customServices];

      // Indexer les services pour une recherche rapide
      this.indexServices();
    } catch (error) {
      console.error("Erreur lors du chargement des services", error);
    }
  }

  /**
   * Indexe les services pour une recherche rapide
   */
  indexServices() {
    this.serviceCache.clear();
    this.services.forEach((service) => {
      // Indexer par différents critères
      this.serviceCache.set(service.id, service);
      this.serviceCache.set(service.name.toLowerCase(), service);
    });
  }

  /**
   * Charge les services personnalisés du stockage local
   * @returns {Array} Liste des services personnalisés
   */
  loadCustomServices() {
    try {
      const stored = localStorage.getItem(this.config.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn(
        "Erreur lors du chargement des services personnalisés",
        error
      );
      return [];
    }
  }

  /**
   * Configuration des écouteurs d'événements
   */
  setupEventListeners() {
    // Écouter les événements de services
    document.addEventListener("service:add", this.handleServiceAdd.bind(this));
    document.addEventListener(
      "service:remove",
      this.handleServiceRemove.bind(this)
    );
    document.addEventListener(
      "service:click",
      this.handleServiceClick.bind(this)
    );
  }

  /**
   * Rendu des services dans l'interface
   */
  renderServices() {
    // Organiser les services par catégorie
    const servicesByCategory = this.groupServicesByCategory();

    // Récupérer le conteneur des catégories
    const categoriesContainer = document.querySelector(".categories-grid");
    if (!categoriesContainer) return;

    // Vider le conteneur existant
    categoriesContainer.innerHTML = "";

    // Générer le HTML pour chaque catégorie
    this.config.categories.forEach((category) => {
      const categoryServices = servicesByCategory[category.id] || [];

      if (categoryServices.length > 0) {
        const categoryElement = this.createCategoryElement(
          category,
          categoryServices
        );
        categoriesContainer.appendChild(categoryElement);
      }
    });
  }

  /**
   * Groupe les services par catégorie
   * @returns {Object} Services organisés par catégorie
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
   * @param {Object} category - Informations de la catégorie
   * @param {Array} services - Services de la catégorie
   * @returns {HTMLElement} Élément de catégorie
   */
  createCategoryElement(category, services) {
    const categoryDiv = document.createElement("div");
    categoryDiv.className = "category";

    // En-tête de catégorie
    const categoryHeader = document.createElement("div");
    categoryHeader.className = "category-header";
    categoryHeader.innerHTML = `
        <img src="https://cdn.jsdelivr.net/gh/selfhst/icons/svg/${category.icon}.svg" 
             alt="" width="24" height="24">
        <h2>${category.name}</h2>
      `;
    categoryDiv.appendChild(categoryHeader);

    // Conteneur des services
    const servicesContainer = document.createElement("div");
    servicesContainer.className = "services";

    // Générer les éléments de service
    services.forEach((service) => {
      const serviceElement = this.createServiceElement(service);
      servicesContainer.appendChild(serviceElement);
    });

    categoryDiv.appendChild(servicesContainer);

    return categoryDiv;
  }

  /**
   * Crée un élément de service
   * @param {Object} service - Informations du service
   * @returns {HTMLElement} Élément de service
   */
  createServiceElement(service) {
    const serviceLink = document.createElement("a");
    serviceLink.href = `https://${service.url}`;
    serviceLink.className = "service";
    serviceLink.dataset.serviceId = service.id;

    // Icône du service
    const iconDiv = document.createElement("div");
    iconDiv.className = "service-icon";
    const iconImg = document.createElement("img");
    iconImg.src = `https://cdn.jsdelivr.net/gh/selfhst/icons/svg/${service.icon}.svg`;
    iconImg.alt = service.name;
    iconImg.width = 20;
    iconImg.height = 20;
    iconDiv.appendChild(iconImg);

    // Nom du service
    const nameDiv = document.createElement("div");
    nameDiv.className = "service-name";
    nameDiv.textContent = service.name;

    // Description du service
    const descDiv = document.createElement("div");
    descDiv.className = "service-description";
    descDiv.textContent = service.description;

    // Ajouter les éléments au lien
    serviceLink.appendChild(iconDiv);
    serviceLink.appendChild(nameDiv);
    serviceLink.appendChild(descDiv);

    return serviceLink;
  }

  /**
   * Récupère un service par son identifiant
   * @param {string} id - Identifiant du service
   * @returns {Object|null} Service correspondant
   */
  getServiceById(id) {
    return this.serviceCache.get(id) || null;
  }

  /**
   * Récupère les services par catégorie
   * @param {string} category - Catégorie des services
   * @returns {Array} Liste des services de la catégorie
   */
  getServicesByCategory(category) {
    return this.services.filter((service) => service.category === category);
  }

  /**
   * Gère l'ajout d'un nouveau service
   * @param {Event} event - Événement d'ajout de service
   */
  handleServiceAdd(event) {
    const service = event.detail.service;

    // Valider le service
    if (!this.validateService(service)) {
      console.warn("Service invalide", service);
      return;
    }

    // Ajouter le service
    this.services.push(service);
    this.indexServices();
    this.saveCustomServices();
    this.renderServices();
  }

  /**
   * Gère la suppression d'un service
   * @param {Event} event - Événement de suppression de service
   */
  handleServiceRemove(event) {
    const serviceId = event.detail.serviceId;

    // Supprimer le service
    this.services = this.services.filter((s) => s.id !== serviceId);
    this.indexServices();
    this.saveCustomServices();
    this.renderServices();
  }

  /**
   * Gère le clic sur un service
   * @param {Event} event - Événement de clic
   */
  handleServiceClick(event) {
    const serviceId = event.detail.serviceId;
    const service = this.getServiceById(serviceId);

    if (service) {
      // Ajouter aux services récents
      this.addToRecentServices(service);
    }
  }

  /**
   * Ajoute un service aux services récents
   * @param {Object} service - Service à ajouter
   */
  addToRecentServices(service) {
    // Supprimer les doublons
    this.recentServices = this.recentServices.filter(
      (s) => s.id !== service.id
    );

    // Ajouter au début
    this.recentServices.unshift(service);

    // Limiter le nombre de services récents
    if (this.recentServices.length > this.config.maxRecentServices) {
      this.recentServices.pop();
    }

    // Sauvegarder
    localStorage.setItem(
      "recent_services",
      JSON.stringify(this.recentServices)
    );
  }

  /**
   * Sauvegarde les services personnalisés
   */
  saveCustomServices() {
    // Ne sauvegarde que les services personnalisés (non par défaut)
    const customServices = this.services.filter(
      (service) => !this.isDefaultService(service)
    );

    localStorage.setItem(
      this.config.storageKey,
      JSON.stringify(customServices)
    );
  }

  /**
   * Vérifie si un service est un service par défaut
   * @param {Object} service - Service à vérifier
   * @returns {boolean} Indique si le service est par défaut
   */
  isDefaultService(service) {
    const defaultServiceIds = ["jellyfin", "portainer", "gitea", "vaultwarden"];
    return defaultServiceIds.includes(service.id);
  }

  /**
   * Valide un service avant ajout
   * @param {Object} service - Service à valider
   * @returns {boolean} Indique si le service est valide
   */
  validateService(service) {
    // Vérifications de base
    return !!(
      service.id &&
      service.name &&
      service.url &&
      service.category &&
      this.config.categories.some((c) => c.id === service.category)
    );
  }
}
