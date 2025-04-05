import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import Config from './config.js';
import Dashboard from './core/dashboard.js';
import StorageManager from './utils/storage-manager.js';
import { detectStorageSupport } from './utils/dom-helpers.js';

// Optional: Lazy load components if needed
const LoadingFallback = () => <div>Chargement...</div>;

class Application {
  constructor() {
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
    this.state.initialized = true;

    // Journal de démarrage
    this.logStartup();
  }

  /**
   * Vérification du support du stockage
   */
  checkStorageSupport() {
    this.state.storageSupport = detectStorageSupport();

    if (!this.state.storageSupport.localStorage) {
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
    this.dashboard = new Dashboard(this);
    this.dashboard.initialize();
  }

  /**
   * Configuration des événements globaux
   */
  setupGlobalEvents() {
    // Gestion du thème
    this.setupThemeEvents();
  }

  /**
   * Configuration des événements de thème
   */
  setupThemeEvents() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => {
        this.toggleTheme();
      });
    }
  }

  /**
   * Bascule de thème
   */
  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    StorageManager.set('app_theme', newTheme);
  }

  /**
   * Journal de démarrage
   */
  logStartup() {
    const startupInfo = {
      version: this.state.version,
      timestamp: this.state.startTime,
      storageSupport: this.state.storageSupport,
    };

    console.group('mserv.wtf Dashboard - Démarrage');
    console.log('Version:', startupInfo.version);
    console.log('Heure de démarrage:', new Date(startupInfo.timestamp).toLocaleString());
    console.log('Support du stockage:', startupInfo.storageSupport);
    console.groupEnd();
  }

  /**
   * Point d'entrée statique
   * @returns {Application} Instance de l'application
   */
  static start() {
    return new Application();
  }
}

// Rendu React
const renderApp = () => {
  const rootElement = document.getElementById('root');
  const root = createRoot(rootElement);
  
  root.render(
    <React.StrictMode>
      <Suspense fallback={<LoadingFallback />}>
        {/* Point de départ principal de React */}
        <div id="dashboard-root">
          <Application.start />
        </div>
      </Suspense>
    </React.StrictMode>
  );
};

// Démarrer l'application une fois le DOM chargé
document.addEventListener('DOMContentLoaded', renderApp);

export default Application;