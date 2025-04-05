/**
 * Classe principale de gestion du tableau de bord
 */
import EventManager from './event-manager.js';
import ThemeManager from './theme-manager.js';
import SearchManager from './search-manager.js';
import ServicesManager from '../modules/services.js';
import FavoritesManager from '../modules/favorites.js';
import ConfigurationManager from '../modules/configuration-manager.js';
import PerformanceMonitor from '../utils/performance.js';

export default class Dashboard {
  /**
   * Constructeur du tableau de bord
   * @param {Application} app - Instance de l'application
   */
  constructor(app) {
    // Référence à l'application
    this.app = app;

    // Gestionnaires de modules
    this.modules = {
      events: null,
      theme: null,
      search: null,
      services: null,
      favorites: null,
      configuration: null,
      performance: null,
    };

    // État du tableau de bord
    this.state = {
      initialized: false,
      currentView: 'dashboard',
      activeModals: [],
      systemHealth: {
        cpu: 0,
        memory: 0,
        temperature: 0,
        services: { total: 0, active: 0 },
      },
    };
  }

  /**
   * Initialisation du tableau de bord
   */
  initialize() {
    try {
      // Initialiser les gestionnaires de modules
      this.initializeModules();

      // Configuration des événements
      this.setupEvents();

      // Initialiser la vue initiale
      this.initializeView();

      // Surveiller la santé du système
      this.startSystemMonitoring();

      // Marquer comme initialisé
      this.state.initialized = true;

      console.log('Dashboard initialisé avec succès');
    } catch (error) {
      console.error("Erreur lors de l'initialisation du dashboard", error);
      this.handleInitializationError(error);
    }
  }

  /**
   * Initialisation des modules
   */
  initializeModules() {
    // Création des gestionnaires de modules
    this.modules.events = new EventManager(this);
    this.modules.theme = new ThemeManager(this);
    this.modules.search = new SearchManager(this);
    this.modules.services = new ServicesManager(this);
    this.modules.favorites = new FavoritesManager(this);
    this.modules.configuration = new ConfigurationManager(this);
    this.modules.performance = new PerformanceMonitor(this);

    // Initialisation de chaque module
    Object.values(this.modules).forEach((module) => {
      if (typeof module.initialize === 'function') {
        module.initialize();
      }
    });
  }

  /**
   * Configuration des événements
   */
  setupEvents() {
    const eventManager = this.modules.events;

    // Événements de changement de vue
    eventManager.on('view:change', this.handleViewChange.bind(this));

    // Événements de recherche
    eventManager.on('search:performed', this.handleSearch.bind(this));

    // Événements de thème
    eventManager.on('theme:change', this.handleThemeChange.bind(this));
  }

  /**
   * Initialisation de la vue initiale
   */
  initializeView() {
    // Charger la dernière vue
    const lastView = localStorage.getItem('last_dashboard_view') || 'dashboard';
    this.changeView(lastView);
  }

  /**
   * Démarrage du monitoring système
   */
  startSystemMonitoring() {
    // Simulation de métriques système
    setInterval(() => {
      this.updateSystemHealth();
    }, 5000);
  }

  /**
   * Met à jour les métriques de santé système
   */
  updateSystemHealth() {
    // Simulation de métriques système
    this.state.systemHealth = {
      cpu: this.generateRandomMetric(5, 30),
      memory: this.generateRandomMetric(20, 80),
      temperature: this.generateRandomMetric(30, 50),
      services: {
        total: this.modules.services.getTotalServices(),
        active: this.modules.services.getActiveServices(),
      },
    };

    // Mettre à jour l'interface
    this.updateSystemHealthDisplay();
  }

  /**
   * Génère une métrique aléatoire
   * @param {number} min - Valeur minimale
   * @param {number} max - Valeur maximale
   * @returns {number} Métrique générée
   */
  generateRandomMetric(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Met à jour l'affichage de la santé système
   */
  updateSystemHealthDisplay() {
    const cpuElement = document.getElementById('cpu-usage');
    const memoryElement = document.getElementById('ram-usage');
    const tempElement = document.getElementById('temperature');
    const servicesElement = document.getElementById('active-services');

    if (cpuElement) cpuElement.textContent = this.state.systemHealth.cpu;
    if (memoryElement) memoryElement.textContent = this.state.systemHealth.memory;
    if (tempElement) tempElement.textContent = this.state.systemHealth.temperature;
    if (servicesElement) {
      const { active, total } = this.state.systemHealth.services;
      servicesElement.textContent = `${active}/${total}`;
    }
  }

  /**
   * Gère le changement de vue
   * @param {string} newView - Nouvelle vue
   */
  handleViewChange(newView) {
    this.changeView(newView);
  }

  /**
   * Change la vue actuelle
   * @param {string} view - Vue à afficher
   */
  changeView(view) {
    // Masquer toutes les vues
    const viewContainers = document.querySelectorAll('.view-container');
    viewContainers.forEach((container) => container.classList.remove('active'));

    // Afficher la nouvelle vue
    const newViewContainer = document.getElementById(`${view}-view`);
    if (newViewContainer) {
      newViewContainer.classList.add('active');
    }

    // Mettre à jour l'état
    this.state.currentView = view;

    // Sauvegarder la dernière vue
    localStorage.setItem('last_dashboard_view', view);

    // Déclencher un événement de changement de vue
    this.modules.events.emit('view:changed', view);
  }

  /**
   * Gère la recherche
   * @param {Object} searchData - Données de recherche
   */
  handleSearch(searchData) {
    // Filtrer les services
    const filteredServices = this.modules.services.filterServices(searchData.query);

    // Mettre à jour l'affichage
    this.updateSearchResults(filteredServices);
  }

  /**
   * Met à jour les résultats de recherche
   * @param {Array} services - Services filtrés
   */
  updateSearchResults(services) {
    const servicesContainer = document.getElementById('services-container');

    // Vider le conteneur
    servicesContainer.innerHTML = '';

    // Ajouter les services filtrés
    services.forEach((service) => {
      const serviceElement = this.createServiceElement(service);
      servicesContainer.appendChild(serviceElement);
    });
  }

  /**
   * Crée un élément de service
   * @param {Object} service - Informations du service
   * @returns {HTMLElement} Élément du service
   */
  createServiceElement(service) {
    const serviceElement = document.createElement('div');
    serviceElement.classList.add('service-card');
    serviceElement.innerHTML = `
      <div class="service-card__icon">
        <img src="https://cdn.jsdelivr.net/gh/selfhst/icons/svg/${service.icon}.svg" alt="${service.name}">
      </div>
      <div class="service-card__details">
        <h3 class="service-card__title">${service.name}</h3>
        <p class="service-card__description">${service.description}</p>
      </div>
    `;
    return serviceElement;
  }

  /**
   * Gère le changement de thème
   * @param {string} newTheme - Nouveau thème
   */
  handleThemeChange(newTheme) {
    // Mettre à jour le thème
    document.documentElement.setAttribute('data-theme', newTheme);

    // Sauvegarder le thème
    localStorage.setItem('app_theme', newTheme);

    // Déclencher un événement de changement de thème
    this.modules.events.emit('theme:changed', newTheme);
  }

  /**
   * Gère les erreurs d'initialisation
   * @param {Error} error - Erreur d'initialisation
   */
  handleInitializationError(error) {
    // Afficher une notification d'erreur
    this.createErrorNotification("Échec de l'initialisation du tableau de bord", error.message);

    // Enregistrer l'erreur
    console.error("Erreur d'initialisation:", error);
  }

  /**
   * Crée une notification d'erreur
   * @param {string} title - Titre de la notification
   * @param {string} message - Message de la notification
   */
  createErrorNotification(title, message) {
    const notification = document.createElement('div');
    notification.classList.add('error-notification');
    notification.innerHTML = `
      <div class="notification__content">
        <h3>${title}</h3>
        <p>${message}</p>
      </div>
    `;
    document.body.appendChild(notification);

    // Auto-fermeture
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 5000);
  }
}
