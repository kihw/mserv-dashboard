/**
 * Gestionnaire de configuration avancé
 * Permet la personnalisation et la gestion dynamique des paramètres
 */
export default class ConfigurationManager {
  constructor(dashboard) {
    this.dashboard = dashboard;

    // Configuration par défaut
    this.defaultConfig = {
      // Paramètres généraux
      general: {
        appName: "mserv.wtf Dashboard",
        version: "2.1.0",
        language: "fr",
        timezone: "auto",
      },

      // Paramètres d'interface
      interface: {
        theme: "system",
        compactMode: false,
        animations: true,
        fontSize: "medium",
        highContrast: false,
      },

      // Paramètres de confidentialité
      privacy: {
        telemetry: true,
        errorReporting: true,
        dataCollection: false,
      },

      // Paramètres de services
      services: {
        defaultCategory: "all",
        maxFavorites: 10,
        showNewBadge: true,
      },

      // Paramètres de performances
      performance: {
        renderOptimization: true,
        lazyLoading: true,
        cacheStrategy: "balanced",
      },

      // Paramètres de notification
      notifications: {
        enabled: true,
        soundEnabled: true,
        serviceStatusAlerts: true,
        updateAlerts: true,
      },

      // Personnalisation avancée
      advanced: {
        experimentalFeatures: false,
        developerMode: false,
        customCSS: "",
      },
    };

    // Configuration utilisateur
    this.userConfig = {};

    // Configuration en cours
    this.activeConfig = {};

    // Historique des configurations
    this.configHistory = [];

    // Événements personnalisés
    this.events = {
      configChanged: new Set(),
      configError: new Set(),
    };
  }

  /**
   * Initialise le gestionnaire de configuration
   */
  initialize() {
    // Charger la configuration utilisateur
    this.loadUserConfig();

    // Fusionner les configurations
    this.mergeConfigurations();

    // Appliquer la configuration
    this.applyConfiguration();
  }

  /**
   * Charge la configuration utilisateur
   */
  loadUserConfig() {
    try {
      const storedConfig = localStorage.getItem("mserv_user_config");
      if (storedConfig) {
        this.userConfig = JSON.parse(storedConfig);
      }
    } catch (error) {
      this.triggerEvent("configError", {
        type: "load",
        message: "Erreur lors du chargement de la configuration",
        error,
      });
    }
  }

  /**
   * Fusionne les configurations par défaut et utilisateur
   */
  mergeConfigurations() {
    // Deep clone de la configuration par défaut
    this.activeConfig = this.deepClone(this.defaultConfig);

    // Fusionner avec la configuration utilisateur
    this.deepMerge(this.activeConfig, this.userConfig);
  }

  /**
   * Clone en profondeur un objet
   * @param {Object} obj - Objet à cloner
   * @returns {Object} Copie profonde de l'objet
   */
  deepClone(obj) {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }

    // Gestion des tableaux
    if (Array.isArray(obj)) {
      return obj.map((item) => this.deepClone(item));
    }

    // Gestion des objets
    const clonedObj = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        clonedObj[key] = this.deepClone(obj[key]);
      }
    }

    return clonedObj;
  }

  /**
   * Fusionne récursivement deux objets
   * @param {Object} target - Objet cible
   * @param {Object} source - Objet source
   */
  deepMerge(target, source) {
    for (const key in source) {
      if (source[key] instanceof Object) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        this.deepMerge(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
    return target;
  }

  /**
   * Applique la configuration courante
   */
  applyConfiguration() {
    // Application des paramètres généraux
    this.applyGeneralSettings();

    // Application des paramètres d'interface
    this.applyInterfaceSettings();

    // Application des paramètres de confidentialité
    this.applyPrivacySettings();

    // Déclenchement de l'événement de changement de configuration
    this.triggerEvent("configChanged", this.activeConfig);
  }

  /**
   * Applique les paramètres généraux
   */
  applyGeneralSettings() {
    // Définir la langue
    document.documentElement.lang = this.activeConfig.general.language;

    // Configurer le fuseau horaire
    if (this.activeConfig.general.timezone === "auto") {
      this.configureTimezone();
    }
  }

  /**
   * Configure le fuseau horaire automatiquement
   */
  configureTimezone() {
    // Utiliser l'API Intl pour déterminer le fuseau horaire
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.activeConfig.general.timezone = timezone;
  }

  /**
   * Applique les paramètres d'interface
   */
  applyInterfaceSettings() {
    // Gestion du thème
    this.applyTheme();

    // Mode compact
    document.body.classList.toggle(
      "compact-mode",
      this.activeConfig.interface.compactMode
    );

    // Animations
    document.body.classList.toggle(
      "animations-disabled",
      !this.activeConfig.interface.animations
    );

    // Taille de police
    document.documentElement.style.setProperty(
      "--font-size",
      this.getFontSizeValue()
    );

    // Contraste élevé
    document.body.classList.toggle(
      "high-contrast",
      this.activeConfig.interface.highContrast
    );
  }

  /**
   * Applique le thème
   */
  applyTheme() {
    const theme = this.activeConfig.interface.theme;

    // Thème système
    if (theme === "system") {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      document.documentElement.setAttribute(
        "data-theme",
        prefersDark ? "dark" : "light"
      );
    } else {
      // Thème fixe
      document.documentElement.setAttribute("data-theme", theme);
    }
  }

  /**
   * Récupère la valeur de taille de police
   * @returns {string} Valeur de taille de police
   */
  getFontSizeValue() {
    const sizeMap = {
      small: "0.8rem",
      medium: "1rem",
      large: "1.2rem",
      xlarge: "1.4rem",
    };
    return sizeMap[this.activeConfig.interface.fontSize] || "1rem";
  }

  /**
   * Applique les paramètres de confidentialité
   */
  applyPrivacySettings() {
    // Gestion de la télémétrie
    if (this.activeConfig.privacy.telemetry) {
      this.enableTelemetry();
    } else {
      this.disableTelemetry();
    }

    // Gestion des rapports d'erreur
    if (this.activeConfig.privacy.errorReporting) {
      this.enableErrorReporting();
    } else {
      this.disableErrorReporting();
    }
  }

  /**
   * Active la télémétrie
   */
  enableTelemetry() {
    // Logique d'activation de la télémétrie
    console.log("Télémétrie activée");
  }

  /**
   * Désactive la télémétrie
   */
  disableTelemetry() {
    // Logique de désactivation de la télémétrie
    console.log("Télémétrie désactivée");
  }

  /**
   * Active les rapports d'erreur
   */
  enableErrorReporting() {
    // Logique d'activation des rapports d'erreur
    console.log("Rapports d'erreur activés");
  }

  /**
   * Désactive les rapports d'erreur
   */
  disableErrorReporting() {
    // Logique de désactivation des rapports d'erreur
    console.log("Rapports d'erreur désactivés");
  }

  /**
   * Met à jour un paramètre de configuration
   * @param {string} section - Section de configuration
   * @param {string} key - Clé du paramètre
   * @param {*} value - Nouvelle valeur
   */
  updateConfig(section, key, value) {
    // Vérifier que la section existe
    if (!this.activeConfig[section]) {
      throw new Error(`Section de configuration invalide : ${section}`);
    }

    // Validation de la valeur
    const validator = this.validators[section];
    if (validator) {
      const validationResult = validator(key, value);
      if (!validationResult.valid) {
        this.triggerEvent("configError", {
          type: "validation",
          message: validationResult.message,
        });
        return false;
      }
    }

    // Mise à jour de la configuration
    this.activeConfig[section][key] = value;

    // Ajouter à l'historique
    this.addToConfigHistory(section, key, value);

    // Sauvegarder la configuration
    this.saveUserConfig();

    // Appliquer le changement spécifique
    const changeHandler = this.changeHandlers[key];
    if (changeHandler) {
      changeHandler(value);
    }

    // Déclencher l'événement de changement
    this.triggerEvent("configChanged", {
      section,
      key,
      value,
    });

    return true;
  }

  /**
   * Sauvegarde la configuration utilisateur
   */
  saveUserConfig() {
    try {
      // Exclure les sections sensibles
      const configToSave = { ...this.activeConfig };
      delete configToSave.advanced;

      localStorage.setItem("mserv_user_config", JSON.stringify(configToSave));
    } catch (error) {
      this.triggerEvent("configError", {
        type: "save",
        message: "Erreur lors de la sauvegarde de la configuration",
        error,
      });
    }
  }

  /**
   * Ajoute une entrée à l'historique de configuration
   * @param {string} section - Section de configuration
   * @param {string} key - Clé modifiée
   * @param {*} value - Nouvelle valeur
   */
  addToConfigHistory(section, key, value) {
    const historyEntry = {
      timestamp: Date.now(),
      section,
      key,
      value,
    };

    this.configHistory.unshift(historyEntry);

    // Limiter la taille de l'historique
    if (this.configHistory.length > 50) {
      this.configHistory.pop();
    }
  }

  /**
   * Ajoute un écouteur d'événement de configuration
   * @param {string} eventName - Nom de l'événement
   * @param {Function} callback - Fonction de rappel
   */
  on(eventName, callback) {
    if (this.events[eventName]) {
      this.events[eventName].add(callback);
    }
  }

  /**
   * Déclenche un événement de configuration
   * @param {string} eventName - Nom de l'événement
   * @param {*} data - Données de l'événement
   */
  triggerEvent(eventName, data) {
    if (this.events[eventName]) {
      this.events[eventName].forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(
            `Erreur dans le gestionnaire d'événement ${eventName}`,
            error
          );
        }
      });
    }
  }

  /**
   * Validateurs de configuration
   */
  validators = {
    /**
     * Valide la configuration générale
     * @param {string} key - Clé à valider
     * @param {*} value - Valeur à valider
     * @returns {Object} Résultat de validation
     */
    validateGeneralConfig(key, value) {
      switch (key) {
        case "language":
          const validLanguages = ["fr", "en", "es"];
          return {
            valid: validLanguages.includes(value),
            message: "Langue non supportée",
          };
        default:
          return { valid: true };
      }
    },

    /**
     * Valide la configuration d'interface
     * @param {string} key - Clé à valider
     * @param {*} value - Valeur à valider
     * @returns {Object} Résultat de validation
     */
    validateInterfaceConfig(key, value) {
      switch (key) {
        case "theme":
          const validThemes = ["light", "dark", "system"];
          return {
            valid: validThemes.includes(value),
            message: "Thème non valide",
          };
        case "fontSize":
          const validSizes = ["small", "medium", "large", "xlarge"];
          return {
            valid: validSizes.includes(value),
            message: "Taille de police non valide",
          };
        default:
          return { valid: true };
      }
    },

    // Autres validateurs similaires pour les différentes sections...
  };

  /**
   * Gestionnaires de changement de configuration
   */
  changeHandlers = {
    /**
     * Gère le changement de thème
     * @param {string} theme - Nouveau thème
     */
    theme: (theme) => {
      this.applyTheme();
    },

    /**
     * Gère le changement de langue
     * @param {string} language - Nouvelle langue
     */
    language: (language) => {
      // Logique de changement de langue
      document.documentElement.lang = language;
      // Potentiellement déclencher un changement de traduction
    },

    /**
     * Gère le changement de télémétrie
     * @param {boolean} enabled - Activation/désactivation
     */
    telemetry: (enabled) => {
      enabled ? this.enableTelemetry() : this.disableTelemetry();
    },
  };
}
