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
   * Initialisation du gestionnaire de recherche
   */
  initialize() {
    this.searchInput = document.getElementById('search');

    // Attendre que les services soient rendus
    setTimeout(() => {
      this.services = document.querySelectorAll('.service');
      this.categories = document.querySelectorAll('.category');

      if (this.services.length === 0) {
        console.warn('Aucun service trouvé pour la recherche');
      }

      if (this.categories.length === 0) {
        console.warn('Aucune catégorie trouvée pour la recherche');
      }
    }, 500);

    if (this.searchInput) {
      this.searchInput.addEventListener('input', this.debounceSearch.bind(this));
      console.log('Recherche initialisée avec succès');
    } else {
      console.warn('Élément de recherche non trouvé');
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
