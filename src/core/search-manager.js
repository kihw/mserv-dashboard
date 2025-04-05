/**
 * Gestionnaire de recherche avancé
 */
import config from "../config.js";

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
    this.searchInput = document.getElementById("search");
    this.services = document.querySelectorAll(".service");
    this.categories = document.querySelectorAll(".category");

    if (this.searchInput) {
      this.searchInput.addEventListener(
        "input",
        this.debounceSearch.bind(this)
      );
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
    const serviceName = service
      .querySelector(".service-name")
      .textContent.toLowerCase();
    const serviceDesc = service
      .querySelector(".service-description")
      .textContent.toLowerCase();

    let score = 0;

    // Critères de scoring
    if (serviceName === searchTerm) score += 10;
    if (serviceName.startsWith(searchTerm)) score += 5;
    if (serviceName.includes(searchTerm)) score += 3;
    if (serviceDesc.includes(searchTerm)) score += 2;

    return score;
  }

  /**
   * Met à jour la visibilité d'un service
   * @param {HTMLElement} service - Élément de service
   * @param {number} score - Score de pertinence
   */
  updateServiceVisibility(service, score) {
    const isVisible = score > 0;
    service.style.display = isVisible ? "flex" : "none";

    // Mise en évidence
    service.classList.toggle(
      "search-highlight",
      isVisible && score >= config.search.highlightThreshold
    );
  }

  /**
   * Met à jour la visibilité des catégories
   */
  updateCategoryVisibility() {
    this.categories.forEach((category) => {
      const visibleServices = category.querySelectorAll(
        '.service[style="display: flex;"]'
      );
      category.style.display = visibleServices.length > 0 ? "flex" : "none";
    });
  }

  /**
   * Réinitialise la recherche
   */
  resetSearch() {
    // Réafficher tous les services et catégories
    this.services.forEach((service) => {
      service.style.display = "flex";
      service.classList.remove("search-highlight");
    });

    this.categories.forEach((category) => {
      category.style.display = "flex";
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
      this.searchInput.value = "";
      this.resetSearch();
    }
  }
}
