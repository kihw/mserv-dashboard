/**
 * Point d'entrée principal de l'application
 * Initialise et coordonne tous les modules
 */
import Config from "./src/config.js";
import Dashboard from "./src/core/dashboard.js";
import StorageManager from "./src/utils/storage-manager.js";

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
    window.addEventListener("error", (event) => {
      this.logError({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      });
    });

    // Gestionnaire de rejets de promesses non gérés
    window.addEventListener("unhandledrejection", (event) => {
      this.logError({
        message: "Unhandled Promise Rejection",
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
    const errorLog = StorageManager.get("error_log", []);

    // Ajouter la nouvelle erreur
    errorLog.push({
      ...errorInfo,
      timestamp: Date.now(),
    });

    // Limiter la taille du journal d'erreurs
    const maxErrorLogSize = 50;
    const trimmedErrorLog = errorLog.slice(-maxErrorLogSize);

    StorageManager.set("error_log", trimmedErrorLog);

    // Afficher un message d'erreur à l'utilisateur
    this.showErrorNotification(errorInfo);
  }

  /**
   * Affiche une notification d'erreur
   * @param {Object} errorInfo - Informations sur l'erreur
   */
  showErrorNotification(errorInfo) {
    // Créer l'élément de notification
    const notification = document.createElement("div");
    notification.className = "error-notification";
    notification.innerHTML = `
      <div class="error-content">
        <h3>Une erreur est survenue</h3>
        <p>${errorInfo.message || "Erreur inattendue"}</p>
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
    const detailsToggle = notification.querySelector(".details-toggle");
    const errorDetails = notification.querySelector(".error-details");
    detailsToggle.addEventListener("click", () => {
      errorDetails.style.display =
        errorDetails.style.display === "none" ? "block" : "none";
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
    // Vérifier la compatibilité du navigateur
    this.checkBrowserCompatibility();

    // Initialiser le stockage
    this.initializeStorage();

    // Créer le tableau de bord
    this.dashboard = new Dashboard(this);

    // Finaliser l'initialisation
    this.finalizeInitialization();
  }

  /**
   * Vérifie la compatibilité du navigateur
   */
  checkBrowserCompatibility() {
    // Liste des fonctionnalités requises
    const requiredFeatures = this.config.requiredFeatures || [
      "localStorage",
      "JSON.parse",
      "fetch",
      "CustomEvent",
      "addEventListener",
    ];

    const missingFeatures = requiredFeatures.filter((feature) => {
      const [obj, method] = feature.split(".");
      return method
        ? !window[obj] || typeof window[obj][method] !== "function"
        : !window[obj];
    });

    if (missingFeatures.length > 0) {
      this.showIncompatibilityWarning(missingFeatures);
      throw new Error(
        `Navigateur incompatible. Fonctionnalités manquantes : ${missingFeatures.join(
          ", "
        )}`
      );
    }
  }

  /**
   * Affiche un avertissement de compatibilité
   * @param {string[]} missingFeatures - Fonctionnalités manquantes
   */
  showIncompatibilityWarning(missingFeatures) {
    const warningDiv = document.createElement("div");
    warningDiv.className = "browser-incompatibility-warning";
    warningDiv.innerHTML = `
      <div class="warning-content">
        <h2>Navigateur non compatible</h2>
        <p>Votre navigateur ne supporte pas toutes les fonctionnalités requises :</p>
        <ul>
          ${missingFeatures.map((feature) => `<li>${feature}</li>`).join("")}
        </ul>
        <p>Veuillez mettre à jour votre navigateur.</p>
      </div>
    `;

    // Style du message
    warningDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      background-color: #f44336;
      color: white;
      padding: 20px;
      text-align: center;
      z-index: 9999;
    `;

    document.body.appendChild(warningDiv);
  }

  /**
   * Initialise le gestionnaire de stockage
   */
  initializeStorage() {
    // Vérifier et migrer les données anciennes si nécessaire
    this.migrateLegacyStorage();

    // Nettoyer les données obsolètes
    this.cleanupOldData();
  }

  /**
   * Migre les données de stockage ancien
   */
  migrateLegacyStorage() {
    // Vérifier la version actuelle des données
    const storageVersion = StorageManager.get("app_version");

    if (!storageVersion || storageVersion !== this.state.version) {
      // Migrer les données
      this.performStorageMigration(storageVersion);

      // Mettre à jour la version
      StorageManager.set("app_version", this.state.version);
    }
  }

  /**
   * Effectue la migration des données de stockage
   * @param {string} [oldVersion] - Version précédente
   */
  performStorageMigration(oldVersion) {
    const migrations = {
      "2.0.0": () => {
        try {
          const oldFavorites = localStorage.getItem("favorites");
          if (oldFavorites) {
            const parsedFavorites = JSON.parse(oldFavorites);
            StorageManager.set("mserv_favorites", parsedFavorites);
            localStorage.removeItem("favorites");
          }
        } catch (error) {
          console.error(
            "Erreur critique lors de la migration des favoris",
            error
          );
          // Potentiellement notifier l'utilisateur ou journaliser l'erreur
        }
      },
    };

    // Exécuter les migrations nécessaires
    if (oldVersion) {
      Object.entries(migrations)
        .filter(([version]) => this.isNewerVersion(version, oldVersion))
        .forEach(([, migrationFn]) => migrationFn());
    }
  }

  /**
   * Vérifie si une version est plus récente
   * @param {string} newVersion - Nouvelle version
   * @param {string} oldVersion - Ancienne version
   * @returns {boolean} Indique si la nouvelle version est plus récente
   */
  isNewerVersion(newVersion, oldVersion) {
    const newParts = newVersion.split(".").map(Number);
    const oldParts = oldVersion.split(".").map(Number);

    for (let i = 0; i < Math.max(newParts.length, oldParts.length); i++) {
      const newPart = newParts[i] || 0;
      const oldPart = oldParts[i] || 0;

      if (newPart !== oldPart) {
        return newPart > oldPart;
      }
    }

    return false;
  }

  /**
   * Nettoie les données obsolètes
   */
  cleanupOldData() {
    const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;

    const dataTypesToClean = [
      "mserv_favorites",
      "mserv_recent_services",
      "dashboard_layout",
      "error_log",
    ];

    dataTypesToClean.forEach((key) => {
      try {
        const data = StorageManager.get(key);

        if (Array.isArray(data)) {
          const cleanedData = data.filter(
            (item) => item.timestamp && item.timestamp > ninetyDaysAgo
          );

          StorageManager.set(key, cleanedData);
        } else if (data && data.timestamp) {
          if (data.timestamp < ninetyDaysAgo) {
            StorageManager.remove(key);
          }
        }
      } catch (error) {
        console.error(`Erreur lors du nettoyage de ${key}:`, error);
      }
    });
  }

  /**
   * Finalise l'initialisation de l'application
   */
  finalizeInitialization() {
    // Marquer comme initialisé
    this.state.initialized = true;

    // Déclencher l'événement d'initialisation
    const initEvent = new CustomEvent("app:initialized", {
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
document.addEventListener("DOMContentLoaded", () => {
  window.App = Application.start();
});

export default Application;
