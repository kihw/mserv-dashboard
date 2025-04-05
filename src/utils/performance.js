/**
 * Système de monitoring et d'analyse des performances
 */
export default class PerformanceMonitor {
  constructor(dashboard) {
    this.dashboard = dashboard;

    // Configuration
    this.config = {
      enabled: true,
      storageKey: 'mserv_performance_logs',
      maxLogEntries: 100,
      slowRenderThreshold: 50, // ms
      slowEventThreshold: 100, // ms
      reportInterval: 60000, // 1 minute
      networkThresholds: {
        slowDownload: 2000, // 2 secondes
        slowUpload: 1000, // 1 seconde
      },
    };

    // Métriques de performance
    this.metrics = {
      renderTimes: [],
      eventProcessingTimes: [],
      resourceUsage: [],
      networkPerformance: [],
      memoryUsage: [],
    };

    // Logs de performance
    this.performanceLogs = [];

    // État du moniteur
    this.state = {
      started: false,
      startTime: null,
      reportTimer: null,
    };
  }

  /**
   * Initialisation du moniteur de performances
   */
  initialize() {
    if (!this.config.enabled) return;

    // Charger les logs précédents
    this.loadPerformanceLogs();

    // Configuration des observateurs
    this.setupPerformanceObservers();

    // Commencer le suivi
    this.start();

    // Configurer les rapports périodiques
    this.setupPeriodicReporting();
  }

  /**
   * Charge les logs de performance précédents
   */
  loadPerformanceLogs() {
    try {
      const storedLogs = localStorage.getItem(this.config.storageKey);
      this.performanceLogs = storedLogs ? JSON.parse(storedLogs) : [];
    } catch (error) {
      console.error('Erreur lors du chargement des logs de performance:', error);
      this.performanceLogs = [];
    }
  }

  /**
   * Configuration des observateurs de performance
   */
  setupPerformanceObservers() {
    // Observer les temps de rendu
    this.observeRenderTimes();

    // Observer les performances réseau
    this.observeNetworkPerformance();

    // Observer l'utilisation des ressources
    this.observeResourceUsage();
  }

  /**
   * Observe les temps de rendu
   */
  observeRenderTimes() {
    const originalCreateElement = document.createElement;
    document.createElement = function (...args) {
      const startTime = performance.now();
      const element = originalCreateElement.apply(this, args);
      const endTime = performance.now();

      // Enregistrer le temps de rendu
      if (endTime - startTime > this.config.slowRenderThreshold) {
        this.metrics.renderTimes.push({
          element: args[0],
          time: endTime - startTime,
        });
      }

      return element;
    }.bind(this);
  }

  /**
   * Observe les performances réseau
   */
  observeNetworkPerformance() {
    if ('performance' in window) {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.initiatorType) {
            const performanceEntry = {
              name: entry.name,
              initiatorType: entry.initiatorType,
              transferSize: entry.transferSize,
              duration: entry.duration,
            };

            this.metrics.networkPerformance.push(performanceEntry);

            // Vérifier les seuils réseau
            if (entry.duration > this.config.networkThresholds.slowDownload) {
              console.warn(`Téléchargement lent détecté: ${entry.name}`, performanceEntry);
            }
          }
        });
      });

      observer.observe({ type: 'resource' });
    }
  }

  /**
   * Observe l'utilisation des ressources
   */
  observeResourceUsage() {
    // Utilisation mémoire
    if ('performance' in window && 'memory' in performance) {
      const collectMemoryUsage = () => {
        const memory = performance.memory;
        this.metrics.memoryUsage.push({
          totalJSHeapSize: memory.totalJSHeapSize,
          usedJSHeapSize: memory.usedJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        });
      };

      // Collecter périodiquement l'utilisation mémoire
      setInterval(collectMemoryUsage, 5000);
    }
  }

  /**
   * Démarre le monitoring
   */
  start() {
    if (this.state.started) return;

    this.state.started = true;
    this.state.startTime = Date.now();

    console.log('Monitoring de performances démarré');
  }

  /**
   * Configuration des rapports périodiques
   */
  setupPeriodicReporting() {
    this.state.reportTimer = setInterval(() => {
      const report = this.generatePerformanceReport();
      this.savePerformanceReport(report);
    }, this.config.reportInterval);
  }

  /**
   * Génère un rapport de performances
   * @returns {Object} Rapport de performances
   */
  generatePerformanceReport() {
    const report = {
      timestamp: Date.now(),
      renderStats: this.calculateStats(this.metrics.renderTimes),
      networkStats: this.calculateNetworkStats(),
      memoryUsage: this.getCurrentMemoryUsage(),
    };

    return report;
  }

  /**
   * Calcule les statistiques générales
   * @param {Array} measurements - Ensemble de mesures
   * @returns {Object|null} Statistiques calculées
   */
  calculateStats(measurements) {
    if (measurements.length === 0) return null;

    const times = measurements.map((m) => m.time);
    return {
      count: times.length,
      average: times.reduce((a, b) => a + b, 0) / times.length,
      min: Math.min(...times),
      max: Math.max(...times),
    };
  }

  /**
   * Calcule les statistiques réseau
   * @returns {Object} Statistiques réseau
   */
  calculateNetworkStats() {
    if (this.metrics.networkPerformance.length === 0) return null;

    const totalTransferSize = this.metrics.networkPerformance.reduce((sum, entry) => sum + entry.transferSize, 0);

    return {
      totalRequests: this.metrics.networkPerformance.length,
      totalTransferSize,
      averageRequestDuration:
        this.metrics.networkPerformance.reduce((sum, entry) => sum + entry.duration, 0) /
        this.metrics.networkPerformance.length,
    };
  }

  /**
   * Récupère l'utilisation mémoire actuelle
   * @returns {Object|null} Informations sur l'utilisation mémoire
   */
  getCurrentMemoryUsage() {
    if ('performance' in window && 'memory' in performance) {
      const memory = performance.memory;
      return {
        totalJSHeapSize: memory.totalJSHeapSize,
        usedJSHeapSize: memory.usedJSHeapSize,
        jsHeapSizeLimit: memory.jsHeapSizeLimit,
      };
    }
    return null;
  }

  /**
   * Sauvegarde un rapport de performances
   * @param {Object} report - Rapport de performances
   */
  savePerformanceReport(report) {
    try {
      // Ajouter le rapport aux logs
      this.performanceLogs.unshift(report);

      // Limiter le nombre de logs
      const trimmedLogs = this.performanceLogs.slice(0, this.config.maxLogEntries);

      // Sauvegarder dans le stockage local
      localStorage.setItem(this.config.storageKey, JSON.stringify(trimmedLogs));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du rapport de performances', error);
    }
  }

  /**
   * Arrête le monitoring
   */
  stop() {
    if (!this.state.started) return;

    // Arrêter le timer de rapport
    if (this.state.reportTimer) {
      clearInterval(this.state.reportTimer);
    }

    // Réinitialiser l'état
    this.state.started = false;
    this.state.startTime = null;

    console.log('Monitoring de performances arrêté');
  }

  /**
   * Réinitialise le moniteur de performances
   */
  reset() {
    // Arrêter le monitoring en cours
    this.stop();

    // Réinitialiser les métriques
    this.metrics = {
      renderTimes: [],
      eventProcessingTimes: [],
      resourceUsage: [],
      networkPerformance: [],
      memoryUsage: [],
    };

    // Supprimer les logs de performance
    this.performanceLogs = [];
    localStorage.removeItem(this.config.storageKey);

    // Redémarrer le monitoring
    this.initialize();
  }
}
