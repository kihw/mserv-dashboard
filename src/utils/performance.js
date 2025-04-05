/**
 * Système de monitoring et d'analyse des performances
 */
export default class PerformanceMonitor {
  constructor(dashboard) {
    this.dashboard = dashboard;

    // Configuration
    this.config = {
      enabled: true,
      storageKey: "mserv_performance_logs",
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

    // État du moniteur
    this.state = {
      started: false,
      startTime: null,
      reportTimer: null,
    };

    // Gestionnaires
    this.handlers = {
      slowPerformance: [],
      criticalIssue: [],
    };
  }

  /**
   * Initialise le moniteur de performances
   */
  initialize() {
    if (!this.config.enabled) return;

    // Charger les logs précédents
    this.loadPerformanceLogs();

    // Configuration des observateurs
    this.setupObservers();

    // Commencer le suivi
    this.start();

    // Configurer les rapports périodiques
    this.setupPeriodicReporting();
  }

  /**
   * Configuration des rapports périodiques
   */
  setupPeriodicReporting() {
    this.state.reportTimer = setInterval(() => {
      this.generatePerformanceReport();
    }, this.config.reportInterval);
  }

  /**
   * Génère un rapport de performances
   */
  generatePerformanceReport() {
    const report = {
      timestamp: Date.now(),
      renderStats: this.calculateStats(this.metrics.renderTimes),
      eventStats: this.calculateStats(this.metrics.eventProcessingTimes),
      resourceUsage: this.analyzeResourceUsage(),
      memoryUsage: this.getMemoryUsage(),
    };

    // Déclencher des alertes si nécessaire
    this.checkPerformanceThresholds(report);

    // Sauvegarder le rapport
    this.savePerformanceReport(report);

    return report;
  }

  /**
   * Calcule les statistiques pour un ensemble de mesures
   * @param {Array} measurements - Ensemble de mesures
   * @returns {Object} Statistiques calculées
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
   * Analyse l'utilisation des ressources
   * @returns {Object} Rapport d'utilisation des ressources
   */
  analyzeResourceUsage() {
    if (this.metrics.resourceUsage.length === 0) return null;

    // Grouper par type de ressource
    const resourceByType = this.metrics.resourceUsage.reduce(
      (acc, resource) => {
        if (!acc[resource.initiatorType]) {
          acc[resource.initiatorType] = [];
        }
        acc[resource.initiatorType].push(resource);
        return acc;
      },
      {}
    );

    // Calculer les statistiques par type
    const resourceStats = {};
    Object.entries(resourceByType).forEach(([type, resources]) => {
      resourceStats[type] = {
        count: resources.length,
        totalTransferSize: resources.reduce(
          (sum, r) => sum + r.transferSize,
          0
        ),
        averageDuration:
          resources.reduce((sum, r) => sum + r.duration, 0) / resources.length,
      };
    });

    return resourceStats;
  }

  /**
   * Récupère l'utilisation mémoire
   * @returns {Object} Informations sur l'utilisation mémoire
   */
  getMemoryUsage() {
    // Vérifier la disponibilité de l'API Performance Memory
    if ("memory" in performance) {
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
   * Vérifie les seuils de performances
   * @param {Object} report - Rapport de performances
   */
  checkPerformanceThresholds(report) {
    const issues = [];

    // Vérifier les temps de rendu
    if (
      report.renderStats &&
      report.renderStats.average > this.config.slowRenderThreshold
    ) {
      issues.push({
        type: "slow-render",
        message: `Temps de rendu moyen élevé : ${report.renderStats.average.toFixed(
          2
        )}ms`,
        severity: "warning",
      });
    }

    // Vérifier les événements
    if (
      report.eventStats &&
      report.eventStats.average > this.config.slowEventThreshold
    ) {
      issues.push({
        type: "slow-events",
        message: `Traitement d'événements lent : ${report.eventStats.average.toFixed(
          2
        )}ms`,
        severity: "warning",
      });
    }

    // Vérifier l'utilisation mémoire
    if (report.memoryUsage) {
      const memoryUsagePercent =
        (report.memoryUsage.usedJSHeapSize /
          report.memoryUsage.jsHeapSizeLimit) *
        100;

      if (memoryUsagePercent > 80) {
        issues.push({
          type: "high-memory",
          message: `Utilisation mémoire élevée : ${memoryUsagePercent.toFixed(
            2
          )}%`,
          severity: "critical",
        });
      }
    }

    // Gérer les problèmes détectés
    if (issues.length > 0) {
      this.handlePerformanceIssues(issues);
    }
  }

  /**
   * Gère les problèmes de performances détectés
   * @param {Array} issues - Liste des problèmes
   */
  handlePerformanceIssues(issues) {
    // Notifications
    this.notifyPerformanceIssues(issues);

    // Déclencher les gestionnaires d'événements
    issues.forEach((issue) => {
      const handlers =
        issue.severity === "critical"
          ? this.handlers.criticalIssue
          : this.handlers.slowPerformance;

      handlers.forEach((handler) => handler(issue));
    });
  }

  /**
   * Notifie des problèmes de performances
   * @param {Array} issues - Liste des problèmes
   */
  notifyPerformanceIssues(issues) {
    // Créer une notification visuelle
    const notificationContainer = document.createElement("div");
    notificationContainer.className = "performance-issues-notification";

    const title = document.createElement("h3");
    title.textContent = "Problèmes de performances détectés";
    notificationContainer.appendChild(title);

    // Liste des problèmes
    const issueList = document.createElement("ul");
    issues.forEach((issue) => {
      const issueItem = document.createElement("li");
      issueItem.className = `issue-${issue.severity}`;
      issueItem.textContent = issue.message;
      issueList.appendChild(issueItem);
    });
    notificationContainer.appendChild(issueList);

    // Style de la notification
    notificationContainer.style.cssText = `
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

    // Ajouter au document
    document.body.appendChild(notificationContainer);

    // Supprimer après 10 secondes
    setTimeout(() => {
      document.body.removeChild(notificationContainer);
    }, 10000);
  }

  /**
   * Sauvegarde un rapport de performances
   * @param {Object} report - Rapport de performances
   */
  savePerformanceReport(report) {
    try {
      const performanceLogs = JSON.parse(
        localStorage.getItem(this.config.storageKey) || "[]"
      );

      // Ajouter le nouveau rapport
      performanceLogs.unshift(report);

      // Limiter le nombre de rapports
      const trimmedLogs = performanceLogs.slice(0, this.config.maxLogEntries);

      // Sauvegarder
      localStorage.setItem(this.config.storageKey, JSON.stringify(trimmedLogs));
    } catch (error) {
      console.error(
        "Erreur lors de la sauvegarde du rapport de performances",
        error
      );
    }
  }

  /**
   * Ajoute un gestionnaire pour les problèmes de performances
   * @param {string} type - Type de problème ('slowPerformance' ou 'criticalIssue')
   * @param {Function} handler - Fonction de gestion
   */
  addPerformanceHandler(type, handler) {
    if (this.handlers[type]) {
      this.handlers[type].push(handler);
    }
  }

  /**
   * Nettoie les logs de performances
   */
  clearPerformanceLogs() {
    try {
      localStorage.removeItem(this.config.storageKey);

      // Réinitialiser les métriques
      this.metrics = {
        renderTimes: [],
        eventProcessingTimes: [],
        resourceUsage: [],
        networkPerformance: [],
        memoryUsage: [],
      };
    } catch (error) {
      console.error(
        "Erreur lors de la suppression des logs de performances",
        error
      );
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

    console.log("Monitoring de performances arrêté");
  }
}
