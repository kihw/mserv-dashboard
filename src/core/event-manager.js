/**
 * Gestionnaire d'événements avancé pour mserv.wtf
 * Gère les événements personnalisés et les interactions globales
 */
export default class EventManager {
  /**
   * Constructeur du gestionnaire d'événements
   * @param {Dashboard} dashboard - Instance du tableau de bord
   */
  constructor(dashboard) {
    // Référence au tableau de bord
    this.dashboard = dashboard;

    // Stockage des écouteurs d'événements
    this.listeners = new Map();

    // Événements système
    this.systemEvents = new Set([
      'view:change',
      'search:performed',
      'theme:change',
      'service:added',
      'service:removed',
      'favorite:added',
      'favorite:removed',
      'network:status',
      'page:hidden',
      'page:visible',
    ]);

    // Configuration des raccourcis clavier
    this.keyboardShortcuts = new Map();

    // Gestionnaire de middleware
    this.middlewares = new Map();

    // Initialisation
    this.initialize();
  }

  /**
   * Initialisation du gestionnaire d'événements
   */
  initialize() {
    // Configuration des raccourcis clavier globaux
    this.setupKeyboardShortcuts();

    // Gestion des événements réseau
    this.setupNetworkEvents();

    // Événements de visibilité de page
    this.setupPageVisibilityEvents();
  }

  /**
   * Configuration des raccourcis clavier
   */
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
      const shortcutTriggers = [
        {
          key: 'k',
          modifiers: ['ctrlKey', 'metaKey'],
          action: () => this.triggerSearch(),
        },
        {
          key: '?',
          modifiers: [],
          action: () => this.showHelp(),
        },
        {
          key: 'Escape',
          modifiers: [],
          action: () => this.handleEscape(),
        },
      ];

      shortcutTriggers.forEach((trigger) => {
        const matchesKey = event.key.toLowerCase() === trigger.key.toLowerCase();
        const matchesModifiers = trigger.modifiers.every((modifier) => event[modifier]);

        if (matchesKey && matchesModifiers) {
          event.preventDefault();
          trigger.action();
        }
      });
    });
  }

  /**
   * Déclenche la recherche
   */
  triggerSearch() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.focus();
    }
  }

  /**
   * Affiche l'aide
   */
  showHelp() {
    // TODO: Implémenter un modal ou un panneau d'aide
    console.log("Afficher l'aide");
  }

  /**
   * Gère la touche Échap
   */
  handleEscape() {
    // Fermer les modaux ouverts
    const modals = document.querySelectorAll('.modal.active');
    modals.forEach((modal) => modal.classList.remove('active'));

    // Réinitialiser la recherche
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
      searchInput.value = '';
      searchInput.blur();
    }
  }

  /**
   * Configuration des événements réseau
   */
  setupNetworkEvents() {
    window.addEventListener('online', () => {
      this.emit('network:status', { status: 'online' });
      this.showNetworkNotification('Connecté', 'success');
    });

    window.addEventListener('offline', () => {
      this.emit('network:status', { status: 'offline' });
      this.showNetworkNotification('Déconnecté', 'error');
    });
  }

  /**
   * Affiche une notification réseau
   * @param {string} message - Message de notification
   * @param {string} type - Type de notification
   */
  showNetworkNotification(message, type) {
    const notification = document.createElement('div');
    notification.classList.add('network-notification', type);
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  }

  /**
   * Configuration des événements de visibilité de page
   */
  setupPageVisibilityEvents() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.emit('page:hidden');
      } else {
        this.emit('page:visible');
      }
    });
  }

  /**
   * Ajoute un écouteur d'événement
   * @param {string} eventName - Nom de l'événement
   * @param {Function} callback - Fonction de rappel
   * @returns {Function} Fonction pour supprimer l'écouteur
   */
  on(eventName, callback) {
    // Validation du nom de l'événement
    if (!this.isValidEventName(eventName)) {
      console.warn(`Événement non standard : ${eventName}`);
    }

    // Créer un tableau d'écouteurs pour l'événement s'il n'existe pas
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }

    // Ajouter le callback
    const listeners = this.listeners.get(eventName);
    listeners.push(callback);

    // Retourner une fonction pour supprimer l'écouteur
    return () => {
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    };
  }

  /**
   * Émet un événement
   * @param {string} eventName - Nom de l'événement
   * @param {*} [data] - Données de l'événement
   */
  emit(eventName, data) {
    // Vérifier si des écouteurs existent pour cet événement
    const listeners = this.listeners.get(eventName) || [];

    // Appeler chaque écouteur avec les données
    listeners.forEach((callback) => {
      try {
        // Passer les données à travers les middlewares si existants
        const middlewares = this.middlewares.get(eventName) || [];
        let processedData = data;

        for (const middleware of middlewares) {
          processedData = middleware(processedData);
        }

        callback(processedData);
      } catch (error) {
        console.error(`Erreur dans l'écouteur d'événement ${eventName}:`, error);
      }
    });
  }

  /**
   * Valide le nom d'un événement
   * @param {string} eventName - Nom de l'événement
   * @returns {boolean} Indique si le nom est valide
   */
  isValidEventName(eventName) {
    // Événements système prédéfinis
    if (this.systemEvents.has(eventName)) {
      return true;
    }

    // Validation du format des événements personnalisés
    const customEventRegex = /^[a-z]+:[a-z]+$/;
    return customEventRegex.test(eventName);
  }

  /**
   * Ajoute un événement personnalisé
   * @param {string} eventName - Nom de l'événement personnalisé
   */
  registerCustomEvent(eventName) {
    if (this.isValidEventName(eventName)) {
      this.systemEvents.add(eventName);
    } else {
      throw new Error(`Nom d'événement personnalisé invalide : ${eventName}`);
    }
  }

  /**
   * Crée un observateur d'événement unique
   * @param {string} eventName - Nom de l'événement
   * @returns {Promise} Promesse résolue lors du premier déclenchement de l'événement
   */
  once(eventName) {
    return new Promise((resolve) => {
      const handler = (data) => {
        // Supprimer l'écouteur après le premier déclenchement
        this.off(eventName, handler);
        resolve(data);
      };

      this.on(eventName, handler);
    });
  }

  /**
   * Supprime un écouteur d'événement
   * @param {string} eventName - Nom de l'événement
   * @param {Function} [callback] - Fonction de rappel spécifique à supprimer
   */
  off(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      return;
    }

    // Si aucun callback n'est spécifié, supprimer tous les écouteurs
    if (!callback) {
      this.listeners.delete(eventName);
      return;
    }

    // Supprimer un callback spécifique
    const listeners = this.listeners.get(eventName);
    const index = listeners.indexOf(callback);
    if (index !== -1) {
      listeners.splice(index, 1);
    }
  }

  /**
   * Ajoute un middleware de traitement d'événements
   * @param {string} eventName - Nom de l'événement
   * @param {Function} middleware - Fonction de middleware
   * @returns {Function} Fonction pour supprimer le middleware
   */
  use(eventName, middleware) {
    // Créer un wrapper pour le middleware
    const wrappedMiddleware = (eventData) => {
      try {
        return middleware(eventData);
      } catch (error) {
        console.error(`Erreur dans le middleware de l'événement ${eventName}:`, error);
        return eventData;
      }
    };

    // Ajouter le middleware
    if (!this.middlewares.has(eventName)) {
      this.middlewares.set(eventName, []);
    }
    const middlewares = this.middlewares.get(eventName);
    middlewares.push(wrappedMiddleware);

    // Retourner une fonction pour supprimer le middleware
    return () => {
      const index = middlewares.indexOf(wrappedMiddleware);
      if (index !== -1) {
        middlewares.splice(index, 1);
      }
    };
  }

  /**
   * Journalise tous les événements
   * @param {boolean} [enable=true] - Active ou désactive la journalisation
   */
  enableLogging(enable = true) {
    if (enable) {
      // Ajouter un middleware de journalisation à tous les événements
      this.systemEvents.forEach((eventName) => {
        this.use(eventName, (data) => {
          console.log(`Événement : ${eventName}`, data);
          return data;
        });
      });
    } else {
      // Supprimer tous les middlewares de journalisation
      this.middlewares.clear();
    }
  }

  /**
   * Réinitialise le gestionnaire d'événements
   */
  reset() {
    // Supprimer tous les écouteurs
    this.listeners.clear();

    // Supprimer tous les middlewares
    this.middlewares.clear();

    // Réinitialiser les événements système
    this.systemEvents = new Set([
      'view:change',
      'search:performed',
      'theme:change',
      'service:added',
      'service:removed',
      'favorite:added',
      'favorite:removed',
      'network:status',
      'page:hidden',
      'page:visible',
    ]);

    // Réinitialiser les raccourcis clavier
    this.keyboardShortcuts.clear();

    // Réinitialiser la configuration
    this.initialize();
  }
}
