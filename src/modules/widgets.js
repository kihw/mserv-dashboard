/**
 * Système de gestion des plugins
 * Permet d'étendre dynamiquement les fonctionnalités de l'application
 */
export default class PluginManager {
  constructor(dashboard) {
    this.dashboard = dashboard;

    // Stockage des plugins
    this.plugins = new Map();

    // Configuration des plugins
    this.config = {
      storageKey: 'mserv_plugins',
      maxPlugins: 10,
    };

    // Hooks disponibles
    this.hooks = {
      'dashboard:init': [],
      'search:performed': [],
      'theme:changed': [],
      'service:added': [],
      'favorite:updated': [],
    };
  }

  /**
   * Initialise le gestionnaire de plugins
   */
  initialize() {
    // Charger les plugins enregistrés
    this.loadPlugins();
  }

  /**
   * Charge les plugins enregistrés
   */
  loadPlugins() {
    try {
      const storedPlugins = localStorage.getItem(this.config.storageKey);
      if (storedPlugins) {
        const plugins = JSON.parse(storedPlugins);
        plugins.forEach((pluginConfig) => this.registerPlugin(pluginConfig));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des plugins', error);
    }
  }

  /**
   * Enregistre un nouveau plugin
   * @param {Object} pluginConfig - Configuration du plugin
   * @returns {boolean} Indique si l'enregistrement a réussi
   */
  registerPlugin(pluginConfig) {
    // Validation de base
    if (!this.validatePluginConfig(pluginConfig)) {
      console.warn('Configuration de plugin invalide', pluginConfig);
      return false;
    }

    // Vérifier la limite de plugins
    if (this.plugins.size >= this.config.maxPlugins) {
      console.warn('Limite de plugins atteinte');
      return false;
    }

    // Créer une instance du plugin
    try {
      const plugin = this.instantiatePlugin(pluginConfig);

      // Ajouter aux plugins
      this.plugins.set(pluginConfig.id, plugin);

      // Enregistrer les hooks
      this.registerHooks(pluginConfig);

      // Sauvegarder la configuration
      this.savePluginConfigs();

      return true;
    } catch (error) {
      console.error('Erreur lors de lenregistrement du plugin', error);
      return false;
    }
  }

  /**
   * Valide la configuration d'un plugin
   * @param {Object} pluginConfig - Configuration du plugin
   * @returns {boolean} Indique si la configuration est valide
   */
  validatePluginConfig(pluginConfig) {
    return !!(
      pluginConfig.id &&
      typeof pluginConfig.id === 'string' &&
      pluginConfig.name &&
      typeof pluginConfig.name === 'string' &&
      pluginConfig.version &&
      typeof pluginConfig.version === 'string' &&
      (!pluginConfig.hooks || typeof pluginConfig.hooks === 'object')
    );
  }

  /**
   * Instancie un plugin à partir de sa configuration
   * @param {Object} pluginConfig - Configuration du plugin
   * @returns {Object} Instance du plugin
   */
  instantiatePlugin(pluginConfig) {
    // Créer une classe de plugin dynamique
    class Plugin {
      constructor(config, dashboard) {
        this.id = config.id;
        this.name = config.name;
        this.version = config.version;
        this.dashboard = dashboard;
      }

      // Méthodes de cycle de vie
      init() {
        console.log(`Plugin ${this.name} initialisé`);
      }
    }

    // Ajouter des méthodes personnalisées
    if (pluginConfig.methods) {
      Object.entries(pluginConfig.methods).forEach(([name, method]) => {
        Plugin.prototype[name] = method;
      });
    }

    // Instancier et initialiser
    const pluginInstance = new Plugin(pluginConfig, this.dashboard);
    pluginInstance.init();

    return pluginInstance;
  }

  /**
   * Enregistre les hooks d'un plugin
   * @param {Object} pluginConfig - Configuration du plugin
   */
  registerHooks(pluginConfig) {
    if (pluginConfig.hooks) {
      Object.entries(pluginConfig.hooks).forEach(([hookName, hookHandler]) => {
        if (this.hooks[hookName]) {
          this.hooks[hookName].push({
            pluginId: pluginConfig.id,
            handler: hookHandler,
          });
        }
      });
    }
  }

  /**
   * Déclenche un hook
   * @param {string} hookName - Nom du hook
   * @param {*} data - Données du hook
   */
  triggerHook(hookName, data) {
    const hooksForName = this.hooks[hookName] || [];

    hooksForName.forEach((hookConfig) => {
      try {
        hookConfig.handler.call(this.plugins.get(hookConfig.pluginId), data);
      } catch (error) {
        console.error(`Erreur dans le hook ${hookName} du plugin ${hookConfig.pluginId}`, error);
      }
    });
  }

  /**
   * Sauvegarde les configurations de plugins
   */
  savePluginConfigs() {
    try {
      const pluginConfigs = Array.from(this.plugins.values()).map((plugin) => ({
        id: plugin.id,
        name: plugin.name,
        version: plugin.version,
      }));

      localStorage.setItem(this.config.storageKey, JSON.stringify(pluginConfigs));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des plugins', error);
    }
  }

  /**
   * Désinstalle un plugin
   * @param {string} pluginId - ID du plugin
   */
  uninstallPlugin(pluginId) {
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return;

    // Supprimer les hooks de ce plugin
    Object.keys(this.hooks).forEach((hookName) => {
      this.hooks[hookName] = this.hooks[hookName].filter((hook) => hook.pluginId !== pluginId);
    });

    // Supprimer le plugin
    this.plugins.delete(pluginId);

    // Mettre à jour la sauvegarde
    this.savePluginConfigs();
  }

  /**
   * Exemple de plugin de démonstration
   * @returns {Object} Configuration d'un plugin exemple
   */
  createExamplePlugin() {
    return {
      id: 'dashboard-stats',
      name: 'Statistiques du tableau de bord',
      version: '1.0.0',
      methods: {
        calculateUsageStats() {
          // Logique de calcul des statistiques
          console.log("Calcul des statistiques d'utilisation");
        },
      },
      hooks: {
        'dashboard:init': function () {
          console.log('Plugin de statistiques initialisé');
          this.calculateUsageStats();
        },
        'service:added': function (service) {
          console.log(`Nouveau service ajouté : ${service.name}`);
        },
      },
    };
  }
}
