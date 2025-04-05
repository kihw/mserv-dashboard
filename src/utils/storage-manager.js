/**
 * Gestionnaire de stockage local avancé
 * Fournit des méthodes sécurisées pour la gestion du stockage local
 */
export default class StorageManager {
  /**
   * Configuration du gestionnaire de stockage
   */
  static config = {
    // Limite de stockage en octets
    storageLimit: 5 * 1024 * 1024, // 5 Mo

    // Préfixes réservés
    reservedPrefixes: ['mserv_', 'dashboard_'],

    // Durée de conservation des données (en jours)
    defaultExpiration: 30,
  };

  /**
   * Récupère un élément du stockage
   * @param {string} key - Clé de stockage
   * @param {*} defaultValue - Valeur par défaut si non trouvée
   * @returns {*} Valeur stockée ou valeur par défaut
   */
  static get(key, defaultValue = null) {
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return defaultValue;

      // Vérifier l'expiration
      const parsedData = JSON.parse(stored);

      // Vérifier si les données sont expirées
      if (parsedData.expires && Date.now() > parsedData.expires) {
        this.remove(key);
        return defaultValue;
      }

      return parsedData.value;
    } catch (error) {
      console.error(`Erreur lors de la récupération de ${key}:`, error);
      return defaultValue;
    }
  }

  /**
   * Sauvegarde un élément dans le stockage
   * @param {string} key - Clé de stockage
   * @param {*} value - Valeur à stocker
   * @param {number} [expirationDays] - Jours avant expiration
   * @returns {boolean} Indique si la sauvegarde a réussi
   */
  static set(key, value, expirationDays = this.config.defaultExpiration) {
    try {
      // Vérifier les préfixes réservés
      if (!this.isValidKey(key)) {
        throw new Error(`Clé réservée ou invalide : ${key}`);
      }

      // Préparer les données avec expiration
      const data = {
        value,
        created: Date.now(),
        expires: Date.now() + expirationDays * 24 * 60 * 60 * 1000,
      };

      // Vérifier l'espace disponible
      if (this.calculateStorageSize() + JSON.stringify(data).length > this.config.storageLimit) {
        this.handleStorageFull(key, data);
        return false;
      }

      // Sauvegarder
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde de ${key}:`, error);
      return false;
    }
  }

  /**
   * Supprime un élément du stockage
   * @param {string} key - Clé de stockage
   */
  static remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Erreur lors de la suppression de ${key}:`, error);
    }
  }

  /**
   * Vérifie si une clé est valide
   * @param {string} key - Clé à vérifier
   * @returns {boolean} Indique si la clé est valide
   */
  static isValidKey(key) {
    // Autoriser les clés commençant par mserv_
    if (key.startsWith('mserv_')) return true;

    // Vérifier les autres préfixes réservés
    return !this.config.reservedPrefixes.some((prefix) => key.startsWith(prefix));
  }

  /**
   * Calcule la taille totale du stockage
   * @returns {number} Taille totale en octets
   */
  static calculateStorageSize() {
    let total = 0;

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const value = localStorage.getItem(key);
      total += key.length + (value ? value.length : 0);
    }

    return total;
  }

  /**
   * Gère le cas où le stockage est plein
   * @param {string} key - Clé qui n'a pas pu être stockée
   * @param {*} data - Données qui n'ont pas pu être stockées
   */
  static handleStorageFull(key, data) {
    console.warn("Stockage local presque plein. Tentative de libération d'espace.");

    // Stratégies de libération d'espace
    const strategies = [this.removeExpiredEntries.bind(this), this.removeOldestEntries.bind(this)];

    // Essayer chaque stratégie
    for (const strategy of strategies) {
      strategy();

      // Réessayer la sauvegarde
      try {
        localStorage.setItem(key, JSON.stringify(data));
        return;
      } catch (retryError) {
        console.warn("Stratégie de libération d'espace échouée");
      }
    }

    // Dernier recours
    this.notifyStorageFull(key);
  }

  /**
   * Supprime les entrées expirées
   */
  static removeExpiredEntries() {
    const now = Date.now();

    Object.keys(localStorage).forEach((key) => {
      try {
        const storedItem = JSON.parse(localStorage.getItem(key));

        // Supprimer si expiré
        if (storedItem.expires && storedItem.expires < now) {
          localStorage.removeItem(key);
        }
      } catch (error) {
        // Supprimer les entrées corrompues
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Supprime les entrées les plus anciennes
   * @param {number} [limit=5] - Nombre d'entrées à supprimer
   */
  static removeOldestEntries(limit = 5) {
    const entries = Object.keys(localStorage)
      .map((key) => {
        try {
          const item = JSON.parse(localStorage.getItem(key));
          return { key, created: item.created || 0 };
        } catch {
          return null;
        }
      })
      .filter((entry) => entry !== null)
      .sort((a, b) => a.created - b.created)
      .slice(0, limit);

    entries.forEach((entry) => {
      localStorage.removeItem(entry.key);
    });
  }

  /**
   * Notifie l'utilisateur que le stockage est plein
   * @param {string} [key] - Clé qui n'a pas pu être stockée
   */
  static notifyStorageFull(key) {
    // Créer une notification pour l'utilisateur
    const notification = document.createElement('div');
    notification.className = 'storage-full-notification';
    notification.innerHTML = `
        <div class="notification-content">
          <h3>Espace de stockage insuffisant</h3>
          <p>Impossible de sauvegarder certaines données. 
             Pensez à libérer de l'espace.</p>
          ${key ? `<small>Clé : ${key}</small>` : ''}
          <button class="close-notification">Fermer</button>
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
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      `;

    // Ajouter la notification
    document.body.appendChild(notification);

    // Gestionnaire de fermeture
    const closeBtn = notification.querySelector('.close-notification');
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(notification);
    });

    // Auto-fermeture après 5 secondes
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 5000);
  }

  /**
   * Efface complètement le stockage local
   * @param {string[]} [except] - Clés à conserver
   */
  static clear(except = []) {
    // Supprimer toutes les entrées sauf celles spécifiées
    Object.keys(localStorage).forEach((key) => {
      if (!except.includes(key)) {
        localStorage.removeChild(key);
      }
    });
  }

  /**
   * Exporte toutes les données du stockage
   * @returns {Object} Données exportées
   */
  static export() {
    const exportData = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      exportData[key] = this.get(key);
    }

    return exportData;
  }

  /**
   * Importe des données dans le stockage
   * @param {Object} data - Données à importer
   * @param {boolean} [overwrite=false] - Écraser les données existantes
   */
  static import(data, overwrite = false) {
    Object.entries(data).forEach(([key, value]) => {
      if (overwrite || !localStorage.getItem(key)) {
        this.set(key, value);
      }
    });
  }
}

// Ajouter des styles globaux pour la notification
const style = document.createElement('style');
style.textContent = `
    .storage-full-notification .notification-content {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .storage-full-notification .close-notification {
      background-color: white;
      color: #f44336;
      border: none;
      padding: 5px 10px;
      border-radius: 3px;
      align-self: flex-end;
    }
  `;
document.head.appendChild(style);
