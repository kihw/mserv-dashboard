/**
 * Gestionnaire avancé des favoris
 */
export default class FavoritesManager {
  constructor(dashboard) {
    this.dashboard = dashboard;

    // Configuration
    this.config = {
      storageKey: 'mserv_favorites',
      maxFavorites: 10,
      defaultFavorites: ['jellyfin', 'portainer', 'vaultwarden', 'nextcloud', 'gitea'],
    };

    // État des favoris
    this.favorites = [];

    // Éléments DOM
    this.elements = {
      favoritesContainer: null,
      favoritesList: null,
      addFavoriteBtn: null,
      editFavoritesPanel: null,
    };

    // Liste des services disponibles
    this.services = [];
  }

  /**
   * Initialisation du gestionnaire de favoris
   */
  async initialize() {
    // Charger la configuration des services
    await this.loadServices();

    // Charger les favoris
    this.loadFavorites();

    // Configurer les événements
    this.setupEventListeners();

    // Cacher les éléments DOM
    this.cacheElements();

    // Rendre les favoris
    this.renderFavorites();
  }

  /**
   * Charge la liste des services
   */
  async loadServices() {
    try {
      const response = await fetch('/config/services.json');
      const serviceConfig = await response.json();
      this.services = serviceConfig.default_services || [];
    } catch (error) {
      console.error('Erreur lors du chargement des services', error);
      this.services = [];
    }
  }

  /**
   * Récupère un service par son ID
   * @param {string} serviceId - ID du service
   * @returns {Object|null} Service correspondant
   */
  getServiceById(serviceId) {
    return this.services.find((service) => service.id === serviceId) || null;
  }

  /**
   * Mise en cache des éléments DOM
   */
  cacheElements() {
    this.elements.favoritesContainer = document.querySelector('.favorites');
    this.elements.favoritesList = document.getElementById('favorites-list');
    this.elements.addFavoriteBtn = document.getElementById('edit-favorites-btn');
    this.elements.editFavoritesPanel = document.getElementById('edit-favorites-panel');
  }

  /**
   * Charge les favoris depuis le stockage local
   */
  loadFavorites() {
    try {
      const storedFavorites = localStorage.getItem(this.config.storageKey);

      if (storedFavorites) {
        // Parse les favoris stockés
        const parsedFavorites = JSON.parse(storedFavorites);

        // Valider et filtrer les favoris
        this.favorites = parsedFavorites.filter((favoriteId) => this.isValidFavorite(favoriteId));
      } else {
        // Utiliser les favoris par défaut
        this.favorites = this.config.defaultFavorites.filter((favoriteId) => this.isValidFavorite(favoriteId));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des favoris', error);
      this.favorites = this.config.defaultFavorites.filter((favoriteId) => this.isValidFavorite(favoriteId));
    }

    // Sauvegarder les favoris validés
    this.saveFavorites();
  }

  /**
   * Sauvegarde les favoris dans le stockage local
   */
  saveFavorites() {
    try {
      localStorage.setItem(this.config.storageKey, JSON.stringify(this.favorites));

      // Déclencher un événement de mise à jour
      this.dashboard.eventManager.emit('favorites:updated', this.favorites);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des favoris', error);
    }
  }

  /**
   * Vérifie si un favori est valide
   * @param {string} favoriteId - ID du service
   * @returns {boolean} Indique si le favori est valide
   */
  isValidFavorite(favoriteId) {
    // Vérifier que le service existe
    return !!this.getServiceById(favoriteId);
  }

  /**
   * Configuration des écouteurs d'événements
   */
  setupEventListeners() {
    // Écouter les événements de favoris
    document.addEventListener('favorite:add', this.handleFavoriteAdd.bind(this));
    document.addEventListener('favorite:remove', this.handleFavoriteRemove.bind(this));

    // Ajouter un gestionnaire pour le bouton d'édition
    if (this.elements.addFavoriteBtn) {
      this.elements.addFavoriteBtn.addEventListener('click', this.openFavoritesEditor.bind(this));
    }
  }

  /**
   * Rend les favoris dans l'interface
   */
  renderFavorites() {
    if (!this.elements.favoritesList) return;

    // Vider la liste actuelle
    this.elements.favoritesList.innerHTML = '';

    // Créer un fragment pour optimiser le rendu
    const fragment = document.createDocumentFragment();

    // Ajouter les favoris
    this.favorites.forEach((favoriteId) => {
      const service = this.getServiceById(favoriteId);
      if (service) {
        const favoriteItem = this.createFavoriteItemElement(service);
        fragment.appendChild(favoriteItem);
      }
    });

    // Ajouter le bouton d'ajout
    const addButton = this.createAddFavoriteButton();
    fragment.appendChild(addButton);

    // Ajouter le fragment à la liste
    this.elements.favoritesList.appendChild(fragment);
  }

  /**
   * Crée un élément de favori
   * @param {Object} service - Service à ajouter aux favoris
   * @returns {HTMLElement} Élément de favori
   */
  createFavoriteItemElement(service) {
    const favItem = document.createElement('a');
    favItem.href = `https://${service.url}`;
    favItem.className = 'favorite-item';
    favItem.dataset.serviceId = service.id;

    // Icône
    const icon = document.createElement('div');
    icon.className = 'favorite-item-icon';
    icon.innerHTML = this.getServiceIcon(service.id);

    // Nom
    const name = document.createElement('div');
    name.className = 'favorite-item-name';
    name.textContent = service.name;

    favItem.appendChild(icon);
    favItem.appendChild(name);

    return favItem;
  }

  /**
   * Crée un bouton d'ajout de favoris
   * @returns {HTMLElement} Bouton d'ajout
   */
  createAddFavoriteButton() {
    const addButton = document.createElement('button');
    addButton.className = 'add-favorite';
    addButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 5v14M5 12h14"></path>
        </svg>
        Ajouter
      `;
    addButton.addEventListener('click', this.openFavoritesEditor.bind(this));
    return addButton;
  }

  /**
   * Récupère l'icône d'un service
   * @param {string} serviceId - ID du service
   * @returns {string} HTML de l'icône
   */
  getServiceIcon(serviceId) {
    const service = this.getServiceById(serviceId);
    if (!service) return '';

    return `
        <img src="https://cdn.jsdelivr.net/gh/selfhst/icons/svg/${service.icon}.svg" 
             alt="${service.name}" width="24" height="24">
      `;
  }

  /**
   * Ouvre l'éditeur de favoris
   */
  openFavoritesEditor() {
    if (!this.elements.editFavoritesPanel) return;

    // Vider la liste des services
    const editList = this.elements.editFavoritesPanel.querySelector('#edit-favorites-list');
    if (!editList) return;

    editList.innerHTML = '';

    // Créer un fragment pour optimiser le rendu
    const fragment = document.createDocumentFragment();

    // Ajouter chaque service
    this.services.forEach((service) => {
      const item = this.createFavoriteEditorItem(service);
      fragment.appendChild(item);
    });

    // Ajouter le fragment
    editList.appendChild(fragment);

    // Afficher le panneau
    this.elements.editFavoritesPanel.classList.add('active');
  }

  /**
   * Crée un élément de service pour l'éditeur de favoris
   * @param {Object} service - Service à ajouter
   * @returns {HTMLElement} Élément de service
   */
  createFavoriteEditorItem(service) {
    const item = document.createElement('div');
    item.className = `edit-favorites-item ${this.favorites.includes(service.id) ? 'selected' : ''}`;
    item.dataset.serviceId = service.id;

    // Icône
    const icon = document.createElement('div');
    icon.className = 'edit-favorites-item-icon';
    icon.innerHTML = this.getServiceIcon(service.id);

    // Nom
    const name = document.createElement('div');
    name.className = 'edit-favorites-item-name';
    name.textContent = service.name;

    item.appendChild(icon);
    item.appendChild(name);

    // Événement de sélection
    item.addEventListener('click', this.toggleFavoriteSelection.bind(this));

    return item;
  }

  /**
   * Bascule la sélection d'un service dans les favoris
   * @param {Event} event - Événement de clic
   */
  toggleFavoriteSelection(event) {
    const item = event.currentTarget;
    const serviceId = item.dataset.serviceId;

    if (this.favorites.includes(serviceId)) {
      // Retirer des favoris
      this.favorites = this.favorites.filter((id) => id !== serviceId);
      item.classList.remove('selected');
    } else {
      // Ajouter aux favoris
      if (this.favorites.length < this.config.maxFavorites) {
        this.favorites.push(serviceId);
        item.classList.add('selected');
      } else {
        // Limite atteinte
        this.showMaxFavoritesWarning();
      }
    }

    // Sauvegarder et mettre à jour
    this.saveFavorites();
    this.renderFavorites();
  }

  /**
   * Affiche un avertissement si le nombre maximum de favoris est atteint
   */
  showMaxFavoritesWarning() {
    // Créer une notification élégante
    const notification = document.createElement('div');
    notification.className = 'max-favorites-notification';
    notification.innerHTML = `
    <div class="notification-content">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" 
           fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" 
           stroke-linejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
        <line x1="12" y1="9" x2="12" y2="13"></line>
        <line x1="12" y1="17" x2="12.01" y2="17"></line>
      </svg>
      <p>Limite de ${this.config.maxFavorites} favoris atteinte. Retirez un service avant d'en ajouter un nouveau.</p>
    </div>
  `;

    // Style et animation
    notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background-color: #f44336;
    color: white;
    padding: 15px;
    border-radius: 4px;
    z-index: 1000;
    display: flex;
    align-items: center;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    animation: slideIn 0.3s ease-out;
  `;

    // Ajouter des styles d'animation
    const style = document.createElement('style');
    style.textContent = `
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
      from { transform: translateX(0); opacity: 1; }
      to { transform: translateX(100%); opacity: 0; }
    }
  `;
    document.head.appendChild(style);

    // Ajouter et auto-supprimer
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  /**
   * Gère l'ajout d'un favori
   * @param {Event} event - Événement d'ajout de favori
   */
  handleFavoriteAdd(event) {
    const serviceId = event.detail.serviceId;

    if (!this.favorites.includes(serviceId)) {
      if (this.favorites.length < this.config.maxFavorites) {
        this.favorites.push(serviceId);
        this.saveFavorites();
        this.renderFavorites();
      } else {
        this.showMaxFavoritesWarning();
      }
    }
  }

  /**
   * Gère la suppression d'un favori
   * @param {Event} event - Événement de suppression de favori
   */
  handleFavoriteRemove(event) {
    const serviceId = event.detail.serviceId;
    this.favorites = this.favorites.filter((id) => id !== serviceId);
    this.saveFavorites();
    this.renderFavorites();
  }
}
