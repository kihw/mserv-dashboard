/**
 * Gestionnaire avancé des favoris
 */
export default class FavoritesManager {
  constructor(dashboard) {
    this.dashboard = dashboard;

    // Configuration
    this.config = {
      storageKey: "mserv_favorites",
      maxFavorites: 10,
      defaultFavorites: [
        "jellyfin",
        "portainer",
        "radarr",
        "sonarr",
        "vaultwarden",
      ],
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
  }

  /**
   * Initialisation du gestionnaire de favoris
   */
  initialize() {
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
   * Mise en cache des éléments DOM
   */
  cacheElements() {
    this.elements.favoritesContainer = document.querySelector(".favorites");
    this.elements.favoritesList = document.getElementById("favorites-list");
    this.elements.addFavoriteBtn =
      document.getElementById("edit-favorites-btn");
    this.elements.editFavoritesPanel = document.getElementById(
      "edit-favorites-panel"
    );
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
        this.favorites = parsedFavorites.filter((favoriteId) =>
          this.isValidFavorite(favoriteId)
        );
      } else {
        // Utiliser les favoris par défaut
        this.favorites = this.config.defaultFavorites.filter((favoriteId) =>
          this.isValidFavorite(favoriteId)
        );
      }
    } catch (error) {
      console.error("Erreur lors du chargement des favoris", error);
      this.favorites = this.config.defaultFavorites;
    }

    // Sauvegarder les favoris validés
    this.saveFavorites();
  }

  /**
   * Sauvegarde les favoris dans le stockage local
   */
  saveFavorites() {
    try {
      localStorage.setItem(
        this.config.storageKey,
        JSON.stringify(this.favorites)
      );

      // Déclencher un événement de mise à jour
      this.dashboard.eventManager.emit("favorites:updated", this.favorites);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde des favoris", error);
    }
  }

  /**
   * Vérifie si un favori est valide
   * @param {string} favoriteId - ID du service
   * @returns {boolean} Indique si le favori est valide
   */
  isValidFavorite(favoriteId) {
    // Vérifier que le service existe
    return !!this.dashboard.servicesManager.getServiceById(favoriteId);
  }

  /**
   * Configuration des écouteurs d'événements
   */
  setupEventListeners() {
    // Écouter les événements de favoris
    document.addEventListener(
      "favorite:add",
      this.handleFavoriteAdd.bind(this)
    );
    document.addEventListener(
      "favorite:remove",
      this.handleFavoriteRemove.bind(this)
    );

    // Ajouter un gestionnaire pour le bouton d'édition
    if (this.elements.addFavoriteBtn) {
      this.elements.addFavoriteBtn.addEventListener(
        "click",
        this.openFavoritesEditor.bind(this)
      );
    }
  }

  /**
   * Rend les favoris dans l'interface
   */
  renderFavorites() {
    if (!this.elements.favoritesList) return;

    // Vider la liste actuelle
    this.elements.favoritesList.innerHTML = "";

    // Créer un fragment pour optimiser le rendu
    const fragment = document.createDocumentFragment();

    // Ajouter les favoris
    this.favorites.forEach((favoriteId) => {
      const service = this.dashboard.servicesManager.getServiceById(favoriteId);
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
    const favItem = document.createElement("a");
    favItem.href = `https://${service.url}`;
    favItem.className = "favorite-item";
    favItem.dataset.serviceId = service.id;

    // Icône
    const icon = document.createElement("div");
    icon.className = "favorite-item-icon";
    icon.innerHTML = this.getServiceIcon(service.id);

    // Nom
    const name = document.createElement("div");
    name.className = "favorite-item-name";
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
    const addButton = document.createElement("button");
    addButton.className = "add-favorite";
    addButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 5v14M5 12h14"></path>
        </svg>
        Ajouter
      `;
    addButton.addEventListener("click", this.openFavoritesEditor.bind(this));
    return addButton;
  }

  /**
   * Ouvre l'éditeur de favoris
   */
  openFavoritesEditor() {
    if (!this.elements.editFavoritesPanel) return;

    // Vider la liste des services
    const editList = this.elements.editFavoritesPanel.querySelector(
      "#edit-favorites-list"
    );
    if (!editList) return;

    editList.innerHTML = "";

    // Récupérer tous les services
    const allServices = this.dashboard.servicesManager.services;

    // Créer un fragment pour optimiser le rendu
    const fragment = document.createDocumentFragment();

    // Ajouter chaque service
    allServices.forEach((service) => {
      const item = this.createFavoriteEditorItem(service);
      fragment.appendChild(item);
    });

    // Ajouter le fragment
    editList.appendChild(fragment);

    // Afficher le panneau
    this.elements.editFavoritesPanel.classList.add("active");
  }

  /**
   * Crée un élément de service pour l'éditeur de favoris
   * @param {Object} service - Service à ajouter
   * @returns {HTMLElement} Élément de service
   */
  createFavoriteEditorItem(service) {
    const item = document.createElement("div");
    item.className = `edit-favorites-item ${
      this.favorites.includes(service.id) ? "selected" : ""
    }`;
    item.dataset.serviceId = service.id;

    // Icône
    const icon = document.createElement("div");
    icon.className = "edit-favorites-item-icon";
    icon.innerHTML = this.getServiceIcon(service.id);

    // Nom
    const name = document.createElement("div");
    name.className = "edit-favorites-item-name";
    name.textContent = service.name;

    item.appendChild(icon);
    item.appendChild(name);

    // Événement de sélection
    item.addEventListener("click", this.toggleFavoriteSelection.bind(this));

    return item;
  }

  /**
   * Récupère l'icône d'un service
   * @param {string} serviceId - ID du service
   * @returns {string} HTML de l'icône
   */
  getServiceIcon(serviceId) {
    const service = this.dashboard.servicesManager.getServiceById(serviceId);
    if (!service) return "";

    return `
        <img src="https://cdn.jsdelivr.net/gh/selfhst/icons/svg/${service.icon}.svg" 
             alt="${service.name}" width="24" height="24">
      `;
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
      item.classList.remove("selected");
    } else {
      // Ajouter aux favoris
      if (this.favorites.length < this.config.maxFavorites) {
        this.favorites.push(serviceId);
        item.classList.add("selected");
      } else {
        // Limite atteinte
        this.showMaxFavoritesWarning();
      }
    }
  }

  /**
   * Affiche un avertissement si le nombre maximum de favoris est atteint
   */
  showMaxFavoritesWarning() {
    // TODO: Implémenter un toast ou un modal d'avertissement
    console.warn(`Limite de ${this.config.maxFavorites} favoris atteinte`);
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
