/**
 * Gestionnaire de thème avancé pour mserv.wtf
 */
export default class ThemeManager {
  /**
   * Constructeur du gestionnaire de thème
   * @param {Dashboard} dashboard - Instance du tableau de bord
   */
  constructor(dashboard) {
    this.dashboard = dashboard;

    // Configuration des thèmes
    this.themes = {
      light: {
        primary: '#f5f5f7',
        secondary: '#ffffff',
        text: '#1d1d1f',
        accent: '#7371fc',
      },
      dark: {
        primary: '#121212',
        secondary: '#1a1a1a',
        text: '#ffffff',
        accent: '#7371fc',
      },
    };

    // Clé de stockage pour le thème
    this.storageKey = 'mserv_theme_preference';

    // Options de thème
    this.options = {
      systemPreference: false,
      reduceMotion: false,
      contrastMode: false,
    };

    // Écouteurs d'événements
    this.listeners = new Set();
  }

  /**
   * Initialisation du gestionnaire de thème
   */
  initialize() {
    // Charger les préférences de l'utilisateur
    this.loadUserPreferences();

    // Configurer les événements système
    this.setupSystemEvents();

    // Appliquer le thème initial
    this.applyTheme(this.getCurrentTheme());
  }

  /**
   * Charge les préférences de l'utilisateur
   */
  loadUserPreferences() {
    try {
      const storedPreferences = localStorage.getItem('theme_preferences');
      if (storedPreferences) {
        const preferences = JSON.parse(storedPreferences);
        this.options = { ...this.options, ...preferences };
      }
    } catch (error) {
      console.warn('Erreur lors du chargement des préférences de thème', error);
    }
  }

  /**
   * Configure les événements système liés au thème
   */
  setupSystemEvents() {
    // Écouter les changements de préférence de couleur système
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', this.handleSystemThemeChange.bind(this));

    // Configurer le bouton de changement de thème
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }
  }

  /**
   * Gère les changements de thème système
   * @param {MediaQueryListEvent} event - Événement de changement de média
   */
  handleSystemThemeChange(event) {
    if (this.options.systemPreference) {
      const newTheme = event.matches ? 'dark' : 'light';
      this.applyTheme(newTheme);
    }
  }

  /**
   * Récupère le thème actuel
   * @returns {string} Thème actuel
   */
  getCurrentTheme() {
    // Vérifier les préférences stockées
    const storedTheme = localStorage.getItem(this.storageKey);

    // Si le système est en mode préférence système
    if (this.options.systemPreference) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    // Utiliser le thème stocké ou le thème par défaut
    return storedTheme || 'dark';
  }

  /**
   * Applique un thème
   * @param {string} themeName - Nom du thème
   */
  applyTheme(themeName) {
    // Validité du thème
    if (!this.themes[themeName]) {
      console.warn(`Thème non valide : ${themeName}. Utilisation du thème par défaut.`);
      themeName = 'dark';
    }

    // Mettre à jour les variables CSS
    const themeConfig = this.themes[themeName];
    Object.entries(themeConfig).forEach(([key, value]) => {
      document.documentElement.style.setProperty(`--color-${key}`, value);
    });

    // Mettre à jour les attributs du document
    document.documentElement.setAttribute('data-theme', themeName);
    document.body.classList.toggle('dark-theme', themeName === 'dark');
    document.body.classList.toggle('light-theme', themeName === 'light');

    // Gérer les réductions de mouvement
    if (this.options.reduceMotion) {
      document.body.classList.add('reduce-motion');
    }

    // Gérer le mode contraste élevé
    if (this.options.contrastMode) {
      document.body.classList.add('high-contrast');
    }

    // Sauvegarder le thème
    localStorage.setItem(this.storageKey, themeName);

    // Notifier les écouteurs
    this.notifyThemeChange(themeName);
  }

  /**
   * Bascule entre les thèmes
   */
  toggleTheme() {
    const currentTheme = this.getCurrentTheme();
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    // Désactiver la préférence système si active
    this.options.systemPreference = false;

    this.applyTheme(newTheme);
  }

  /**
   * Configure les options de thème
   * @param {Object} newOptions - Nouvelles options de thème
   */
  setThemeOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };

    // Sauvegarder les préférences
    localStorage.setItem('theme_preferences', JSON.stringify(this.options));

    // Réappliquer le thème avec les nouvelles options
    this.applyTheme(this.getCurrentTheme());
  }

  /**
   * Ajoute un écouteur de changement de thème
   * @param {Function} listener - Fonction de rappel
   * @returns {Function} Fonction pour supprimer l'écouteur
   */
  addThemeListener(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notifie les écouteurs du changement de thème
   * @param {string} newTheme - Nouveau thème
   */
  notifyThemeChange(newTheme) {
    this.listeners.forEach((listener) => {
      try {
        listener(newTheme);
      } catch (error) {
        console.error('Erreur dans un écouteur de thème', error);
      }
    });

    // Émettre un événement via le gestionnaire d'événements
    if (this.dashboard.modules.events) {
      this.dashboard.modules.events.emit('theme:change', newTheme);
    }
  }

  /**
   * Réinitialise les paramètres de thème
   */
  reset() {
    // Réinitialiser les options
    this.options = {
      systemPreference: false,
      reduceMotion: false,
      contrastMode: false,
    };

    // Supprimer les préférences stockées
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem('theme_preferences');

    // Appliquer le thème par défaut
    this.applyTheme('dark');
  }
}
