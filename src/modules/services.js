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
      servicesConfigPath: "/config/services.json",
      storageKey: "mserv_services",
      maxRecentServices: 5,
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

  /**
   * Charge la configuration des services à partir du fichier JSON
   */
  async loadServicesConfiguration() {
    try {
      // Charger le fichier de configuration
      const response = await fetch(this.config.servicesConfigPath);
      if (!response.ok) {
        throw new Error("Impossible de charger la configuration des services");
      }
      const serviceConfig = await response.json();

      // Fusionner les services par défaut et personnalisés
      this.services = [
        ...serviceConfig.default_services,
        ...this.loadCustomServices(serviceConfig.custom_services),
      ];

      // Indexer les services pour une recherche rapide
      this.indexServices();
    } catch (error) {
      console.error(
        "Erreur lors du chargement de la configuration des services",
        error
      );
      // Charger une configuration minimale en cas d'erreur
      this.services = [];
    }
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
      return customServices.filter((service) =>
        this.validateServiceConfig(service)
      );
    } catch (error) {
      console.error(
        "Erreur lors du chargement des services personnalisés",
        error
      );
      return [];
    }
  }

  /**
   * Valide la configuration d'un service
   * @param {Object} serviceConfig - Configuration du service
   * @returns {boolean} Indique si la configuration est valide
   */
  validateServiceConfig(serviceConfig) {
    const requiredFields = [
      "id",
      "name",
      "description",
      "url",
      "icon",
      "category",
    ];

    // Vérifier la présence de tous les champs requis
    const hasAllFields = requiredFields.every(
      (field) => serviceConfig.hasOwnProperty(field) && serviceConfig[field]
    );

    // Vérifier que la catégorie existe
    const isValidCategory = this.config.categories.some(
      (category) => category.id === serviceConfig.category
    );

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
      console.warn("Configuration de service invalide", serviceConfig);
      return false;
    }

    // Vérifier que le service n'existe pas déjà
    const existingService = this.services.find(
      (s) => s.id === serviceConfig.id
    );
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
      const customServices = this.services.filter(
        (service) => !this.isDefaultService(service)
      );

      localStorage.setItem(
        this.config.storageKey,
        JSON.stringify(customServices)
      );
    } catch (error) {
      console.error(
        "Erreur lors de la sauvegarde des services personnalisés",
        error
      );
    }
  }

  /**
   * Supprime un service personnalisé
   * @param {string} serviceId - ID du service à supprimer
   * @returns {boolean} Indique si la suppression a réussi
   */
  removeCustomService(serviceId) {
    // Trouver l'index du service
    const serviceIndex = this.services.findIndex((s) => s.id === serviceId);

    // Vérifier si le service existe
    if (serviceIndex === -1) {
      console.warn(`Aucun service trouvé avec l'ID ${serviceId}`);
      return false;
    }

    // Empêcher la suppression des services par défaut
    if (this.isDefaultService(this.services[serviceIndex])) {
      console.warn("Impossible de supprimer un service par défaut");
      return false;
    }

    // Supprimer le service
    this.services.splice(serviceIndex, 1);

    // Réindexer les services
    this.indexServices();

    // Sauvegarder les services personnalisés
    this.saveCustomServices();

    // Mettre à jour l'affichage
    this.renderServices();

    return true;
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
