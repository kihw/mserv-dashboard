/**
 * Gestionnaire centralisé des événements
 */
import config from "../config.js";

export default class EventManager {
  constructor(dashboard) {
    this.dashboard = dashboard;
    this.listeners = new Map();
    this.initialized = false;
    this.initialize();
  }

  /**
   * Initialisation des écouteurs d'événements
   */
  initialize() {
    try {
      // Événements globaux
      this.setupGlobalEvents();

      // Raccourcis clavier
      this.setupKeyboardShortcuts();

      this.initialized = true;
      console.log("Event manager initialized successfully");
    } catch (error) {
      console.error("Error initializing event manager:", error);
    }
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
      // Vérifier si la configuration existe
      if (!config.events || !config.events.keyboardShortcuts) {
        console.warn("Keyboard shortcuts configuration is missing");
        return;
      }

      // Raccourci de recherche
      if (this.matchesShortcut(event, config.events.keyboardShortcuts.search)) {
        event.preventDefault();
        const searchInput = document.getElementById("search");
        if (searchInput) {
          searchInput.focus();
        }
      }

      // Raccourci d'aide
      if (event.key === config.events.keyboardShortcuts.help) {
        if (this.dashboard && typeof this.dashboard.showHelp === 'function') {
          this.dashboard.showHelp();
        }
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
   * @param {string[]|string} shortcuts - Liste des raccourcis à vérifier
   * @returns {boolean} - Indique si le raccourci est matché
   */
  matchesShortcut(event, shortcuts) {
    // S'assurer que shortcuts est un tableau
    if (typeof shortcuts === 'string') {
      shortcuts = [shortcuts];
    } else if (!Array.isArray(shortcuts)) {
      return false;
    }

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
    console.log("Document loaded event triggered");
    // Vérifier si le dashboard est correctement initialisé
    if (this.dashboard) {
      // Si dashboard n'est pas initialisé, initialiser en toute sécurité
      if (!this.dashboard.state || !this.dashboard.state.initialized) {
        // Vérifier si la méthode initialize existe
        if (typeof this.dashboard.initialize === 'function') {
          try {
            this.dashboard.initialize();
          } catch (error) {
            console.error("Error initializing dashboard from event manager:", error);
            this.setupRecoveryMode();
          }
        } else {
          console.warn("Dashboard initialize method not found");
        }
      }
    } else {
      console.warn("Dashboard reference is missing in EventManager");
    }
  }

  /**
   * Gestion du redimensionnement
   */
  handleResize() {
    // Vérifier si le dashboard existe et a une méthode adaptLayout
    if (this.dashboard && typeof this.dashboard.adaptLayout === 'function') {
      try {
        this.dashboard.adaptLayout();
      } catch (error) {
        console.error("Error in adaptLayout:", error);
      }
    }
  }

  /**
   * Gestion de l'annulation (Échap)
   * @param {KeyboardEvent} event - Événement clavier
   */
  handleCancel(event) {
    try {
      // Réinitialisation de la recherche
      const searchInput = document.getElementById("search");
      if (document.activeElement === searchInput) {
        searchInput.value = "";
        searchInput.blur();
      }

      // Fermeture des modaux/panneaux ouverts
      if (this.dashboard && typeof this.dashboard.closeOpenPanels === 'function') {
        this.dashboard.closeOpenPanels();
      }
    } catch (error) {
      console.error("Error handling cancel event:", error);
    }
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
    try {
      const callbacks = this.listeners.get(eventName) || [];
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (callbackError) {
          console.error(`Error in event listener for ${eventName}:`, callbackError);
        }
      });
    } catch (error) {
      console.error(`Error emitting event ${eventName}:`, error);
    }
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

  /**
   * Configure un mode de récupération en cas d'erreur grave
   */
  setupRecoveryMode() {
    console.log("Setting up recovery mode");
    // Afficher un message à l'utilisateur
    const recoveryMessage = document.createElement("div");
    recoveryMessage.className = "recovery-message";
    recoveryMessage.innerHTML = `
      <h2>Problème de chargement</h2>
      <p>Un problème est survenu lors du chargement du tableau de bord.</p>
      <button id="reset-storage">Réinitialiser les préférences</button>
    `;
    recoveryMessage.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #f44336;
      color: white;
      padding: 20px;
      border-radius: 5px;
      text-align: center;
      z-index: 9999;
    `;
    document.body.appendChild(recoveryMessage);

    // Fonctionnalité du bouton de réinitialisation
    document.getElementById("reset-storage").addEventListener("click", () => {
      localStorage.clear();
      window.location.reload();
    });
  }
}
