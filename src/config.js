/**
 * Configuration globale de l'application
 */
export default {
  // Configuration générale de l'application
  app: {
    name: "mserv.wtf Dashboard",
    version: "2.1.0",
    debug: true,
  },

  // Paramètres de recherche
  search: {
    debounceTime: 150,
    minSearchLength: 1,
    highlightThreshold: 5,
  },

  // Configuration des thèmes
  themes: {
    default: "dark",
    light: {
      bgPrimary: "#f5f5f7",
      bgSecondary: "#ffffff",
      bgTertiary: "#f0f0f2",
      textPrimary: "#1d1d1f",
      textSecondary: "#333333",
      accentColor: "#7371fc",
    },
    dark: {
      bgPrimary: "#121212",
      bgSecondary: "#1a1a1a",
      bgTertiary: "#232323",
      textPrimary: "#ffffff",
      textSecondary: "#e0e0e0",
      accentColor: "#7371fc",
    },
  },

  // Configuration des événements
  events: {
    keyboardShortcuts: {
      search: ["Ctrl+K", "Cmd+K"],
      help: "?",
      cancel: "Escape",
    },
  },

  // Configuration des modules
  modules: {
    favorites: {
      maxFavorites: 10,
      storageKey: "mserv_favorites",
    },
    widgets: {
      maxWidgets: 6,
      storageKey: "mserv_widgets",
    },
  },

  // Options d'accessibilité
  accessibility: {
    reducedMotion: false,
    highContrast: false,
  },
};
