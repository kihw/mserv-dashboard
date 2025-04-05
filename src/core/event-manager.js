/**
 * Gestionnaire centralisé des événements
 */
import config from "../config.js";

export default class EventManager {
  constructor(dashboard) {
    this.dashboard = dashboard;
    this.listeners = new Map();
    this.initialize();
  }

  /**
   * Initialisation des écouteurs d'événements
   */
  initialize() {
    // Événements globaux
    this.setupGlobalEvents();

    // Raccourcis clavier
    this.setupKeyboardShortcuts();
  }

  /**
   * Configuration des événements globaux
   */
  setupGlobalEvents() {
    // Événements de chargement et de redimensionnement
    window.addEventListener("load", this.handleLoad.bind(this));
    window.addEventListener(
      "resize",
      this.debounce(this.handleResize.bind(this), 250)
    );
  }

  /**
   * Configuration des raccourcis clavier
   */
  setupKeyboardShortcuts() {
    document.addEventListener("keydown", (event) => {
      // Raccourci de recherche
      if (this.matchesShortcut(event, config.events.keyboardShortcuts.search)) {
        event.preventDefault();
        this.dashboard.search.focus();
      }

      // Raccourci d'aide
      if (event.key === config.events.keyboardShortcuts.help) {
        this.dashboard.showHelp();
      }

      // Raccourci d'annulation
      if (event.key === config.events.keyboardShortcuts.cancel) {
        this.handleCancel(event);
      }
    });
  }

  /**
   * Vérifie si l'événement correspond à un raccourci
   * @param {KeyboardEvent} event - Événement clavier
   * @param {string[]} shortcuts - Liste des raccourcis à vérifier
   * @returns {boolean} - Indique si le raccourci est matché
   */
  matchesShortcut(event, shortcuts) {
    return shortcuts.some((shortcut) => {
      const parts = shortcut.split("+");
      return parts.every((part) => {
        switch (part) {
          case "Ctrl":
            return event.ctrlKey;
          case "Cmd":
            return event.metaKey;
          case "Alt":
            return event.altKey;
          case "Shift":
            return event.shiftKey;
          default:
            return event.key.toLowerCase() === part.toLowerCase();
        }
      });
    });
  }

  /**
   * Gestion de l'événement de chargement
   */
  handleLoad() {
    // Actions à l'initialisation complète
    this.dashboard.initialize();
  }

  /**
   * Gestion du redimensionnement
   */
  handleResize() {
    // Réactions au changement de taille de fenêtre
    this.dashboard.adaptLayout();
  }

  /**
   * Gestion de l'annulation (Échap)
   * @param {KeyboardEvent} event - Événement clavier
   */
  handleCancel(event) {
    // Réinitialisation de la recherche
    if (document.activeElement === this.dashboard.search) {
      this.dashboard.search.value = "";
      this.dashboard.search.blur();
    }

    // Fermeture des modaux/panneaux ouverts
    this.dashboard.closeOpenPanels();
  }

  /**
   * Ajoute un écouteur d'événement personnalisé
   * @param {string} eventName - Nom de l'événement
   * @param {Function} callback - Fonction de rappel
   */
  on(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }
    this.listeners.get(eventName).push(callback);
  }

  /**
   * Déclenche un événement personnalisé
   * @param {string} eventName - Nom de l'événement
   * @param {*} data - Données de l'événement
   */
  emit(eventName, data) {
    const callbacks = this.listeners.get(eventName) || [];
    callbacks.forEach((callback) => callback(data));
  }

  /**
   * Fonction de debounce pour limiter la fréquence des appels
   * @param {Function} func - Fonction à limiter
   * @param {number} wait - Délai d'attente
   * @returns {Function} - Fonction avec debounce
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}
