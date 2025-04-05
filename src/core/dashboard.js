/**
 * Classe principale du tableau de bord
 * Coordonne tous les modules et fonctionnalités
 */
import config from "../config.js";
import EventManager from "./event-manager.js";
import ThemeManager from "./theme-manager.js";
import SearchManager from "./search-manager.js";
import FavoritesManager from "../modules/favorites.js";
import ServicesManager from "../modules/services.js";
import WidgetManager from "../modules/widgets.js";

export default class Dashboard {
  constructor() {
    // Configuration
    this.config = config;

    // Gestionnaires de modules
    this.eventManager = null;
    this.themeManager = null;
    this.searchManager = null;
    this.favoritesManager = null;
    this.servicesManager = null;
    this.widgetManager = null;

    // État de l'application
    this.state = {
      initialized: false,
      activeModals: [],
      isEditMode: false,
    };

    // Initialisation
    this.initialize();
  }

  /**
   * Initialisation principale
   */
  initialize() {
    // Créer les gestionnaires de modules
    this.createManagers();

    // Configuration des gestionnaires
    this.setupManagers();

    // Marquer comme initialisé
    this.state.initialized = true;

    // Dispatch d'un événement d'initialisation
    this.eventManager.emit("dashboard:initialized");
  }

  /**
   * Création des gestionnaires de modules
   */
  createManagers() {
    this.eventManager = new EventManager(this);
    this.themeManager = new ThemeManager();
    this.searchManager = new SearchManager(this);
    this.servicesManager = new ServicesManager();
    this.favoritesManager = new FavoritesManager(this);
    this.widgetManager = new WidgetManager(this);
  }

  /**
   * Configuration des gestionnaires
   */
  setupManagers() {
    // Initialisation des gestionnaires
    this.themeManager.initialize();
    this.searchManager.initialize();
    this.servicesManager.initialize();
    this.favoritesManager.initialize();
    this.widgetManager.initialize();

    // Configuration des événements personnalisés
    this.setupCustomEvents();
  }

  /**
   * Configuration des événements personnalisés
   */
  setupCustomEvents() {
    // Exemple d'événements personnalisés
    this.eventManager.on("theme:change", this.handleThemeChange.bind(this));
    this.eventManager.on("search:performed", this.handleSearch.bind(this));
  }

  /**
   * Gestion du changement de thème
   * @param {string} newTheme - Nouveau thème
   */
  handleThemeChange(newTheme) {
    // Actions supplémentaires lors du changement de thème
    console.log(`Thème changé : ${newTheme}`);

    // Mise à jour des composants visuels si nécessaire
    this.updateUIForTheme(newTheme);
  }

  /**
   * Mise à jour de l'UI pour un thème
   * @param {string} theme - Thème actuel
   */
  updateUIForTheme(theme) {
    // Logique de mise à jour spécifique au thème
    document.body.classList.toggle("dark-theme", theme === "dark");
    document.body.classList.toggle("light-theme", theme === "light");
  }

  /**
   * Gestion de la recherche
   * @param {Object} searchData - Données de recherche
   */
  handleSearch(searchData) {
    // Traitement centralisé de la recherche
    console.log("Recherche effectuée", searchData);
  }

  /**
   * Adaptation dynamique de la mise en page
   */
  adaptLayout() {
    // Logique d'adaptation responsive
    const width = window.innerWidth;

    if (width < 600) {
      document.body.classList.add("mobile-layout");
    } else {
      document.body.classList.remove("mobile-layout");
    }

    // Notification des modules
    this.eventManager.emit("layout:changed", { width });
  }

  /**
   * Fermeture des panneaux/modaux ouverts
   */
  closeOpenPanels() {
    // Fermer les modaux actifs
    this.state.activeModals.forEach((modal) => modal.close());
    this.state.activeModals = [];

    // Événement de fermeture
    this.eventManager.emit("panels:closed");
  }

  /**
   * Affichage de l'aide
   */
  showHelp() {
    // Créer et afficher un modal d'aide
    const helpModal = this.createHelpModal();
    this.state.activeModals.push(helpModal);
  }

  /**
   * Crée un modal d'aide
   * @returns {Object} Modal d'aide
   */
  createHelpModal() {
    // Implémentation simplifiée d'un modal d'aide
    const modal = document.createElement("div");
    modal.className = "help-modal";
    modal.innerHTML = `
      <div class="help-modal-content">
        <h2>Raccourcis et aide</h2>
        <ul>
          <li><kbd>Ctrl+K</kbd> ou <kbd>Cmd+K</kbd> : Recherche rapide</li>
          <li><kbd>?</kbd> : Afficher cette aide</li>
          <li><kbd>Échap</kbd> : Fermer les panneaux</li>
        </ul>
        <button class="close-help">Fermer</button>
      </div>
    `;

    // Méthode de fermeture
    modal.close = () => {
      modal.remove();
    };

    // Gestionnaire de fermeture
    modal.querySelector(".close-help").addEventListener("click", () => {
      modal.close();
    });

    // Ajouter au body
    document.body.appendChild(modal);

    return modal;
  }

  /**
   * Point d'entrée principal
   */
  static start() {
    // Créer une instance du tableau de bord
    return new Dashboard();
  }
}

// Initialisation au chargement du DOM
document.addEventListener("DOMContentLoaded", () => {
  window.Dashboard = Dashboard.start();
});
