/**
 * Configuration globale de l'application mserv.wtf
 */
export default {
  // Informations de l'application
  app: {
    name: 'mserv.wtf Dashboard',
    version: '3.0.0',
    environment: process.env.NODE_ENV || 'development',
    debug: process.env.NODE_ENV !== 'production',
  },

  // Configuration des services
  services: {
    configPath: '/config/services.json',
    maxCustomServices: 20,
    refreshInterval: 5 * 60 * 1000, // 5 minutes
  },

  // Paramètres de recherche
  search: {
    debounceTime: 300,
    minLength: 2,
    maxResults: 10,
  },
  validate() {
    const validationRules = {
      'app.environment': (value) => ['development', 'production', 'staging'].includes(value),
      'services.maxCustomServices': (value) => value > 0 && value <= 50,
      // Autres règles de validation
    };

    Object.entries(validationRules).forEach(([path, validator]) => {
      const value = this.get(path);
      if (!validator(value)) {
        console.warn(`Configuration invalide : ${path}`);
      }
    });
  },
  // Configuration des thèmes
  themes: {
    default: 'dark',
    modes: {
      light: {
        primary: '#f5f5f7',
        secondary: '#ffffff',
        accent: '#7371fc',
      },
      dark: {
        primary: '#121212',
        secondary: '#1a1a1a',
        accent: '#7371fc',
      },
    },
  },

  // Configuration du stockage
  storage: {
    prefix: 'mserv_',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 jours
    limits: {
      localStorage: 5 * 1024 * 1024, // 5 Mo
      sessionStorage: 2 * 1024 * 1024, // 2 Mo
    },
  },

  // Configuration de la sécurité
  security: {
    csp: {
      default: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdnjs.cloudflare.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
    cookieOptions: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    },
  },

  // Configuration des performances
  performance: {
    resourceTiming: true,
    slowRenderThreshold: 50, // ms
    slowEventThreshold: 100, // ms
    maxLogEntries: 100,
  },

  // Configuration de l'accessibilité
  accessibility: {
    reducedMotion: false,
    highContrast: false,
    fontSize: {
      min: 12,
      max: 24,
      default: 16,
    },
  },

  // Configuration des événements
  events: {
    keyboardShortcuts: {
      search: ['Ctrl+K', 'Cmd+K'],
      help: '?',
      cancel: 'Escape',
    },
  },

  // Configuration des notifications
  notifications: {
    timeout: 5000,
    maxVisible: 3,
    types: ['success', 'error', 'warning', 'info'],
  },
};
