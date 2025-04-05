import React from 'react';
import { createRoot } from 'react-dom/client';
import Config from './config.js';
import Dashboard from './core/dashboard.js';
import StorageManager from './utils/storage-manager.js';
import { detectStorageSupport } from './utils/dom-helpers.js';

const DashboardLayout = () => (
  <>
    <div className="container">
      <div className="top-bar">
        <div className="logo">
          <i className="fas fa-server"></i>
          <span>mserv.wtf</span>
        </div>

        <div className="controls">
          <div className="search-wrapper">
            <i className="fas fa-search search-icon"></i>
            <input type="text" id="searchInput" className="search-input" placeholder="Rechercher un service..." />
          </div>

          <div className="theme-switch" id="themeSwitch">
            <div className="theme-switch-track">
              <div className="theme-switch-thumb">
                <i className="fas fa-sun" id="themeIcon"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="weather-card">
        <div className="weather-details">
          <div className="weather-detail">
            <i className="fas fa-microchip"></i>
            <span>
              CPU: <span id="cpu-usage">0</span>%
            </span>
          </div>
          <div className="weather-detail">
            <i className="fas fa-memory"></i>
            <span>
              RAM: <span id="ram-usage">0</span>GB/16GB
            </span>
          </div>
          <div className="weather-detail">
            <i className="fas fa-thermometer-half"></i>
            <span>
              <span id="temperature">0</span>°C
            </span>
          </div>
        </div>
      </div>
      <div className="weather-icon">
        <i className="fas fa-sun"></i>
      </div>
    </div>

    <div className="system-banner">
      <div className="banner-item status-good">
        <div className="banner-icon">
          <i className="fas fa-server"></i>
        </div>
        <div className="banner-content">
          <div className="banner-value">
            <span id="active-services">0</span>/<span id="total-services">0</span>
          </div>
          <div className="banner-label">Services actifs</div>
        </div>
      </div>
      <div className="banner-item status-warning">
        <div className="banner-icon">
          <i className="fas fa-hdd"></i>
        </div>
        <div className="banner-content">
          <div className="banner-value">
            <span id="disk-usage">0Gb/0Gb</span>
          </div>
          <div className="banner-label">Espace disque</div>
        </div>
      </div>
    </div>

    <div id="services-container" className="services-list"></div>
    <div id="dashboard-view" className="view-container active"></div>

    <footer>
      <p>&copy; 2025 mserv.wtf | Tableau de bord personnalisé</p>
      <p className="version">
        v3.0.0 |{' '}
        <a href="https://github.com/kihw/mserv-dashboard" target="_blank">
          GitHub
        </a>
      </p>
    </footer>
  </>
);

// Debug function to log DOM state
function debugDOMState() {
  console.group('DOM Debug Information');
  console.log('Document Ready State:', document.readyState);
  console.log('Root Element Existence:', !!document.getElementById('root'));
  console.log('Body Children:', document.body.children);
  console.log('Full Body innerHTML:', document.body.innerHTML);
  console.groupEnd();
}

// Loading fallback component
const LoadingFallback = () => <div>Chargement...</div>;

class Application extends React.Component {
  constructor(props) {
    super(props);

    // Configuration globale
    this.config = Config;

    // État de l'application
    this.state = {
      initialized: false,
      version: this.config.app.version,
      startTime: Date.now(),
      storageSupport: null,
    };

    // Instances de modules
    this.dashboard = null;
  }

  componentDidMount() {
    // Initialisation
    this.init();
  }

  /**
   * Initialisation de l'application
   */
  init() {
    // Vérifier le support du stockage
    this.checkStorageSupport();

    // Configuration des gestionnaires d'erreurs
    this.setupErrorHandling();

    // Initialiser le tableau de bord
    this.initializeDashboard();

    // Configuration des événements globaux
    this.setupGlobalEvents();

    // Marquer comme initialisé
    this.setState({ initialized: true });

    // Journal de démarrage
    this.logStartup();
  }

  // ... (rest of the methods remain the same as in the previous version)

  /**
   * Vérification du support du stockage
   */
  checkStorageSupport() {
    const storageSupport = detectStorageSupport();
    this.setState({ storageSupport });

    if (!storageSupport.localStorage) {
      this.showStorageWarning();
    }
  }

  /**
   * Affiche un avertissement si le stockage local n'est pas supporté
   */
  showStorageWarning() {
    const notification = document.createElement('div');
    notification.className = 'storage-warning';
    notification.innerHTML = `
      <div class="notification">
        <h3>Stockage limité</h3>
        <p>Votre navigateur ne supporte pas le stockage local. Certaines fonctionnalités seront limitées.</p>
      </div>
    `;
    document.body.appendChild(notification);
  }

  /**
   * Configuration des gestionnaires d'erreurs
   */
  setupErrorHandling() {
    // Gestionnaire d'erreurs globales
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
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
    const errorLogs = StorageManager.get('error_logs', []);

    // Limiter à 50 entrées
    errorLogs.unshift({
      ...errorInfo,
      timestamp: Date.now(),
    });

    StorageManager.set('error_logs', errorLogs.slice(0, 50));

    // Afficher la notification d'erreur
    this.showErrorNotification(errorInfo);
  }

  /**
   * Affiche une notification d'erreur
   * @param {Object} errorInfo - Informations sur l'erreur
   */
  showErrorNotification(errorInfo) {
    const notification = document.createElement('div');
    notification.className = 'error-notification';
    notification.innerHTML = `
      <div class="notification error">
        <h3>Une erreur est survenue</h3>
        <p>${errorInfo.message || 'Erreur inattendue'}</p>
        <details>
          <summary>Détails techniques</summary>
          <pre>${JSON.stringify(errorInfo, null, 2)}</pre>
        </details>
      </div>
    `;
    document.body.appendChild(notification);

    // Auto-fermeture
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 10000);
  }

  /**
   * Initialise le tableau de bord
   */
  initializeDashboard() {
    console.log('Initialisation du tableau de bord');
    this.dashboard = new Dashboard(this); // 👈 Use 'new' as required
    this.dashboard.initialize(); // 👈 Call the init method if needed
  }

  /**
   * Configuration des événements globaux
   */
  setupGlobalEvents() {
    // Configuration des événements
    console.log('Configuration des événements globaux');
  }

  /**
   * Journal de démarrage
   */
  logStartup() {
    console.group('mserv.wtf Dashboard - Démarrage');
    console.log('Version:', this.state.version);
    console.log('Heure de démarrage:', new Date(this.state.startTime).toLocaleString());
    console.log('Support du stockage:', this.state.storageSupport);
    console.groupEnd();
  }

  render() {
    return <div id="dashboard-root">{this.state.initialized ? <DashboardLayout /> : <LoadingFallback />}</div>;
  }
}

// Rendu React
function renderApp() {
  // Debug DOM state
  debugDOMState();

  // Ensure root element exists
  const rootElement = document.getElementById('root');

  if (!rootElement) {
    console.error('Root element not found. Creating root element dynamically.');
    const newRootElement = document.createElement('div');
    newRootElement.id = 'root';
    document.body.appendChild(newRootElement);
  }

  try {
    const root = createRoot(document.getElementById('root'));

    root.render(
      <React.StrictMode>
        <Application />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('React rendering failed:', error);
    debugDOMState();
  }
}

// Different approaches to rendering
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else if (document.readyState !== 'loading') {
  renderApp();
}

export default Application;
