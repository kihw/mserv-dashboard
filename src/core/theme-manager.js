/**
 * Gestionnaire de thème avancé
 */
import config from "../config.js";
import StorageManager from "../utils/storage-manager.js";

export default class ThemeManager {
  constructor() {
    // Configuration des thèmes
    this.config = config.themes;

    // Clé de stockage pour le thème
    this.storageKey = "mserv_theme_preference";

    // Écouteurs d'événements
    this.listeners = new Set();
  }

  /**
   * Initialise le gestionnaire de thème
   */
  initialize() {
    // Appliquer le thème enregistré ou par défaut
    this.applyTheme(this.getCurrentTheme());

    // Configuration des événements de changement de thème
    this.setupThemeEvents();
  }

  /**
   * Configuration des événements de thème
   */
  setupThemeEvents() {
    // Écouter les changements système de préférence de couleur
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (this.getCurrentTheme() === "system") {
          this.applyTheme("system");
        }
      });
  }

  /**
   * Récupère le thème actuel
   * @returns {string} Thème actuel
   */
  getCurrentTheme() {
    return StorageManager.get(this.storageKey, this.config.default);
  }

  /**
   * Applique un thème
   * @param {string} theme - Thème à appliquer ('light', 'dark', 'system')
   */
  applyTheme(theme) {
    // Gérer le thème système
    if (theme === "system") {
      theme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    // Appliquer les variables CSS
    const themeConfig = this.config[theme];
    if (themeConfig) {
      document.documentElement.style.setProperty(
        "--bg-primary",
        themeConfig.bgPrimary
      );
      document.documentElement.style.setProperty(
        "--bg-secondary",
        themeConfig.bgSecondary
      );
      document.documentElement.style.setProperty(
        "--bg-tertiary",
        themeConfig.bgTertiary
      );
      document.documentElement.style.setProperty(
        "--text-primary",
        themeConfig.textPrimary
      );
      document.documentElement.style.setProperty(
        "--text-secondary",
        themeConfig.textSecondary
      );
      document.documentElement.style.setProperty(
        "--accent-color",
        themeConfig.accentColor
      );
    }

    // Ajouter des classes pour le style
    document.documentElement.classList.remove("light-theme", "dark-theme");
    document.documentElement.classList.add(`${theme}-theme`);

    // Sauvegarder la préférence
    StorageManager.set(this.storageKey, theme);

    // Notifier les écouteurs
    this.notifyListeners(theme);
  }

  /**
   * Bascule entre les thèmes
   */
  toggleTheme() {
    const currentTheme = this.getCurrentTheme();
    const themes = ["light", "dark", "system"];
    const currentIndex = themes.indexOf(currentTheme);
    const nextTheme = themes[(currentIndex + 1) % themes.length];

    this.applyTheme(nextTheme);
  }

  /**
   * Ajoute un écouteur de changement de thème
   * @param {Function} listener - Fonction à appeler lors du changement de thème
   */
  addThemeListener(listener) {
    this.listeners.add(listener);
  }

  /**
   * Retire un écouteur de changement de thème
   * @param {Function} listener - Fonction à retirer
   */
  removeThemeListener(listener) {
    this.listeners.delete(listener);
  }

  /**
   * Notifie tous les écouteurs
   * @param {string} newTheme - Nouveau thème
   */
  notifyListeners(newTheme) {
    this.listeners.forEach((listener) => {
      try {
        listener(newTheme);
      } catch (error) {
        console.error("Erreur dans un écouteur de thème", error);
      }
    });
  }
}
