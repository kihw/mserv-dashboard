/**
 * Gestionnaire de recherche avancé
 */
import config from '../config.js';

export default class SearchManager {
  constructor(dashboard) {
    this.dashboard = dashboard;
    this.searchInput = null;
    this.services = null;
    this.categories = null;
    this.searchTimer = null;
  }

  /**
   * Initialise le gestionnaire de recherche
   */
  initialize() {
    // Sélectionner l'input de recherche, créer un si nécessaire
    this.searchInput = document.getElementById('search') || this.createSearchInput();

    // Attendre que le DOM soit chargé pour chercher les services et catégories
    const initializeSearch = () => {
      // Sélectionner dynamiquement les services et catégories
      this.services = document.querySelectorAll('.service');
      this.categories = document.querySelectorAll('.category');

      // Gestion des cas où aucun service/catégorie n'est trouvé
      if (this.services.length === 0) {
        console.warn('Aucun service trouvé pour la recherche');
        this.createPlaceholderServices();
      }

      if (this.categories.length === 0) {
        console.warn('Aucune catégorie trouvée pour la recherche');
        this.createPlaceholderCategories();
      }

      // Configuration des événements
      this.setupSearchEvents();
    };

    // Utiliser l'événement DOMContentLoaded si nécessaire
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initializeSearch);
    } else {
      initializeSearch();
    }
  }

  /**
   * Crée un input de recherche si aucun n'existe
   * @returns {HTMLInputElement} Input de recherche
   */
  createSearchInput() {
    const searchInput = document.createElement('input');
    searchInput.id = 'search';
    searchInput.type = 'search';
    searchInput.placeholder = 'Rechercher un service...';
    searchInput.className = 'search-input';

    // Trouver un conteneur approprié
    const searchContainer =
      document.querySelector('.search-wrapper') || document.querySelector('.dashboard-nav') || document.body;
    searchContainer.appendChild(searchInput);

    return searchInput;
  }

  /**
   * Crée des services de placeholder si aucun n'est trouvé
   */
  createPlaceholderServices() {
    const placeholderData = [
      { name: 'Service 1', description: 'Description du service 1' },
      { name: 'Service 2', description: 'Description du service 2' },
    ];

    const categoriesGrid = document.querySelector('.categories-grid');
    if (!categoriesGrid) return;

    const placeholderCategory = document.createElement('div');
    placeholderCategory.className = 'category';
    placeholderCategory.innerHTML = `
      <div class="category-header">
        <h2>Services par défaut</h2>
      </div>
      <div class="services">
        ${placeholderData
          .map(
            (service) => `
          <div class="service">
            <div class="service-details">
              <h3 class="service-name">${service.name}</h3>
              <p class="service-description">${service.description}</p>
            </div>
          </div>
        `
          )
          .join('')}
      </div>
    `;

    categoriesGrid.appendChild(placeholderCategory);
  }

  /**
   * Crée des catégories de placeholder si aucune n'est trouvée
   */
  createPlaceholderCategories() {
    const categoriesGrid = document.querySelector('.categories-grid');
    if (!categoriesGrid) return;

    const placeholderCategories = [
      { name: 'Catégorie 1', services: ['Service A', 'Service B'] },
      { name: 'Catégorie 2', services: ['Service C', 'Service D'] },
    ];

    placeholderCategories.forEach((cat) => {
      const categoryElement = document.createElement('div');
      categoryElement.className = 'category';
      categoryElement.innerHTML = `
        <div class="category-header">
          <h2>${cat.name}</h2>
        </div>
        <div class="services">
          ${cat.services
            .map(
              (service) => `
            <div class="service">
              <div class="service-details">
                <h3 class="service-name">${service}</h3>
                <p class="service-description">Description de ${service}</p>
              </div>
            </div>
          `
            )
            .join('')}
        </div>
      `;
      categoriesGrid.appendChild(categoryElement);
    });
  }

  /**
   * Configure les événements de recherche
   */
  setupSearchEvents() {
    if (this.searchInput) {
      this.searchInput.addEventListener('input', this.debounceSearch.bind(this));
      console.log('Recherche initialisée avec succès');
    } else {
      console.warn('Impossible de configurer la recherche');
    }
  }

  /**
   * Recherche avec debounce
   */
  debounceSearch() {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      this.performSearch();
    }, config.search.debounceTime);
  }

  /**
   * Effectue la recherche
   */
  performSearch() {
    const searchTerm = this.searchInput.value.toLowerCase().trim();

    // Réinitialiser si la recherche est trop courte
    if (searchTerm.length < config.search.minSearchLength) {
      this.resetSearch();
      return;
    }

    // Filtrer les services
    this.services.forEach((service) => {
      const score = this.calculateSearchScore(service, searchTerm);
      this.updateServiceVisibility(service, score);
    });

    // Mettre à jour la visibilité des catégories
    this.updateCategoryVisibility();
  }

  /**
   * Calcule le score de pertinence d'un service
   * @param {HTMLElement} service - Élément de service
   * @param {string} searchTerm - Terme de recherche
   * @returns {number} Score de pertinence
   */
  calculateSearchScore(service, searchTerm) {
    const serviceName = service.querySelector('.service-name').textContent.toLowerCase();
    const serviceDesc = service.querySelector('.service-description').textContent.toLowerCase();
    const serviceCategory = service.closest('.category').querySelector('.category-header h2').textContent.toLowerCase();

    let score = 0;

    // Critères de scoring améliorés
    const matches = (text, term) => {
      const words = term.split(/\s+/);
      return words.every((word) => text.includes(word));
    };

    // Correspondance exacte
    if (serviceName === searchTerm) score += 15;

    // Commence par le terme de recherche
    if (serviceName.startsWith(searchTerm)) score += 10;

    // Correspondance partielle du nom
    if (matches(serviceName, searchTerm)) score += 7;

    // Correspondance dans la description
    if (matches(serviceDesc, searchTerm)) score += 5;

    // Correspondance dans la catégorie
    if (matches(serviceCategory, searchTerm)) score += 3;

    return score;
  }

  /**
   * Met à jour la visibilité d'un service
   * @param {HTMLElement} service - Élément de service
   * @param {number} score - Score de pertinence
   */
  updateServiceVisibility(service, score) {
    const isVisible = score > 0;
    service.style.display = isVisible ? 'flex' : 'none';

    // Mise en évidence
    service.classList.toggle('search-highlight', isVisible && score >= config.search.highlightThreshold);
  }

  /**
   * Met à jour la visibilité des catégories
   */
  updateCategoryVisibility() {
    this.categories.forEach((category) => {
      const visibleServices = category.querySelectorAll('.service[style="display: flex;"]');
      category.style.display = visibleServices.length > 0 ? 'flex' : 'none';
    });
  }

  /**
   * Réinitialise la recherche
   */
  resetSearch() {
    // Réafficher tous les services et catégories
    this.services.forEach((service) => {
      service.style.display = 'flex';
      service.classList.remove('search-highlight');
    });

    this.categories.forEach((category) => {
      category.style.display = 'flex';
    });
  }

  /**
   * Focus sur le champ de recherche
   */
  focus() {
    if (this.searchInput) {
      this.searchInput.focus();
    }
  }

  /**
   * Vide le champ de recherche
   */
  clear() {
    if (this.searchInput) {
      this.searchInput.value = '';
      this.resetSearch();
    }
  }
}
