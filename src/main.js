/**
 * Point d'entrée principal de l'application
 * Initialise et coordonne tous les modules
 */
import Config from './config.js';
import Dashboard from './core/dashboard.js';
import StorageManager from './utils/storage-manager.js';

class Application {
  constructor() {
    // Configuration globale
    this.config = Config;

    // Instance du tableau de bord
    this.dashboard = null;

    // État de l'application
    this.state = {
      initialized: false,
      version: this.config.app.version,
      startTime: Date.now(),
    };

    // Gestionnaires d'erreurs
    this.setupErrorHandling();

    // Initialiser l'application
    this.initialize();
  }

  /**
   * Configuration des gestionnaires d'erreurs globaux
   */
  setupErrorHandling() {
    // Gestionnaire d'erreurs non gérées
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      });
    });

    // Gestionnaire de rejets de promesses non gérés
    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        message: 'Unhandled Promise Rejection',
        reason: event.reason,
      });
    });
  }

  /**
   * Log des erreurs
   * @param {Object} errorInfo - Informations sur l'erreur
   */
  logError(errorInfo) {
    // Enregistrer dans le stockage local
    const errorLog = StorageManager.get('error_log', []);

    // Ajouter la nouvelle erreur
    errorLog.push({
      ...errorInfo,
      timestamp: Date.now(),
    });

    // Limiter la taille du journal d'erreurs
    const maxErrorLogSize = 50;
    const trimmedErrorLog = errorLog.slice(-maxErrorLogSize);

    StorageManager.set('error_log', trimmedErrorLog);

    // Afficher un message d'erreur à l'utilisateur
    this.showErrorNotification(errorInfo);
  }

  /**
   * Affiche une notification d'erreur
   * @param {Object} errorInfo - Informations sur l'erreur
   */
  showErrorNotification(errorInfo) {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.innerHTML = `
      <div class="error-content">
        <h3>Une erreur est survenue</h3>
        <p>${errorInfo.message || 'Erreur inattendue'}</p>
        <button class="details-toggle">Voir les détails</button>
        <pre class="error-details" style="display:none;">
          ${JSON.stringify(errorInfo, null, 2)}
        </pre>
      </div>
    `;

    // Style de la notification
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: #f44336;
      color: white;
      padding: 15px;
      border-radius: 4px;
      z-index: 1000;
      max-width: 300px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;

    // Ajouter au body
    document.body.appendChild(notification);

    // Gestionnaire de bascule des détails
    const detailsToggle = notification.querySelector('.details-toggle');
    const errorDetails = notification.querySelector('.error-details');
    detailsToggle.addEventListener('click', () => {
      errorDetails.style.display = errorDetails.style.display === 'none' ? 'block' : 'none';
    });

    // Auto-fermeture
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 10000);
  }

  /**
   * Initialisation de l'application
   */
  initialize() {
    // Marquer comme initialisé
    this.state.initialized = true;

    // Déclencher l'événement d'initialisation
    const initEvent = new CustomEvent('app:initialized', {
      detail: {
        version: this.state.version,
        startTime: this.state.startTime,
      },
    });
    window.dispatchEvent(initEvent);

    // Journal de démarrage
    console.log(`Application démarrée - Version ${this.state.version}`);
  }

  /**
   * Point d'entrée statique
   * @returns {Application} Instance de l'application
   */
  static start() {
    return new Application();
  }
}

// Démarrer l'application au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
  window.App = Application.start();
});

export default Application;
