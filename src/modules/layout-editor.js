/**
 * Éditeur de mise en page avancé
 * Permet la personnalisation de l'interface et l'organisation des services
 */
import { createElement, qs, qsa, addEventListeners, toggleClass } from '../utils/dom-helpers.js';
import StorageManager from '../utils/storage-manager.js';

export default class LayoutEditor {
  constructor(dashboard) {
    this.dashboard = dashboard;

    // Configuration de l'éditeur
    this.config = {
      storageKey: 'mserv_layout',
      maxSections: 5,
      gridSizes: ['1x1', '1x2', '2x1', '2x2'],
    };

    // État de l'éditeur
    this.state = {
      isEditing: false,
      activeLayoutId: 'default',
      draggedElement: null,
      dragOverTarget: null,
    };

    // Disposition par défaut
    this.defaultLayout = {
      id: 'default',
      name: 'Disposition par défaut',
      sections: [
        {
          id: 'favorites',
          title: 'Favoris',
          type: 'favorites',
          position: { row: 1, column: 1 },
          size: { width: 2, height: 1 },
        },
        {
          id: 'categories',
          title: 'Services',
          type: 'categories',
          position: { row: 2, column: 1 },
          size: { width: 2, height: 2 },
        },
      ],
    };

    // Liste des dispositions
    this.layouts = [this.defaultLayout];

    // Éléments DOM
    this.elements = {
      editButton: null,
      layoutContainer: null,
      editorPanel: null,
    };
  }

  /**
   * Initialise l'éditeur de mise en page
   */
  initialize() {
    // Charger les dispositions sauvegardées
    this.loadLayouts();

    // Cacher les éléments DOM
    this.cacheElements();

    // Configurer les écouteurs d'événements
    this.setupEventListeners();

    // Appliquer la mise en page active
    this.applyLayout(this.state.activeLayoutId);
  }

  /**
   * Charge les dispositions sauvegardées
   */
  loadLayouts() {
    try {
      const storedLayoutsData = StorageManager.get(this.config.storageKey);
      
      if (storedLayoutsData) {
        const { layouts, activeId } = storedLayoutsData;
        
        // Fusionner avec les dispositions par défaut
        if (layouts && layouts.length > 0) {
          // Garder le layout par défaut et ajouter les autres
          this.layouts = [
            this.defaultLayout,
            ...layouts.filter(layout => layout.id !== 'default'),
          ];
        }
        
        // Définir la mise en page active
        if (activeId && this.layouts.some(layout => layout.id === activeId)) {
          this.state.activeLayoutId = activeId;
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des dispositions', error);
    }
  }

  /**
   * Sauvegarde les dispositions
   */
  saveLayouts() {
    try {
      const layoutsData = {
        layouts: this.layouts,
        activeId: this.state.activeLayoutId,
      };
      
      StorageManager.set(this.config.storageKey, layoutsData);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des dispositions', error);
    }
  }

  /**
   * Met en cache les éléments DOM
   */
  cacheElements() {
    this.elements.editButton = qs('#edit-layout-btn');
    this.elements.layoutContainer = qs('.dashboard-content');
    this.elements.editorPanel = qs('#layout-editor-panel');
    
    // Créer le bouton d'édition s'il n'existe pas
    if (!this.elements.editButton) {
      this.createEditButton();
    }
    
    // Créer le panneau d'édition s'il n'existe pas
    if (!this.elements.editorPanel) {
      this.createEditorPanel();
    }
  }

  /**
   * Crée le bouton d'édition
   */
  createEditButton() {
    const dashboardNav = qs('.dashboard-nav');
    
    if (dashboardNav) {
      this.elements.editButton = createElement('button', {
        id: 'edit-layout-btn',
        className: 'button button--icon',
        title: 'Éditer la mise en page',
      }, '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="3" x2="12" y2="21"></line></svg>');
      
      dashboardNav.appendChild(this.elements.editButton);
    }
  }

  /**
   * Crée le panneau d'édition
   */
  createEditorPanel() {
    this.elements.editorPanel = createElement('div', {
      id: 'layout-editor-panel',
      className: 'layout-editor-panel',
    });
    
    this.elements.editorPanel.innerHTML = `
      <div class="layout-editor-header">
        <h2>Éditeur de mise en page</h2>
        <button class="close-editor-btn"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg></button>
      </div>
      <div class="layout-editor-content">
        <div class="layout-selector">
          <label for="layout-select">Disposition :</label>
          <select id="layout-select"></select>
          <button id="new-layout-btn" class="button button--secondary">Nouvelle</button>
          <button id="delete-layout-btn" class="button button--secondary">Supprimer</button>
        </div>
        <div class="layout-grid"></div>
        <div class="layout-tools">
          <button id="add-section-btn" class="button">Ajouter une section</button>
          <button id="save-layout-btn" class="button">Enregistrer</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.elements.editorPanel);
    
    // Cacher par défaut
    this.elements.editorPanel.style.display = 'none';
  }

  /**
   * Configure les écouteurs d'événements
   */
  setupEventListeners() {
    // Écouteur pour le bouton d'édition
    if (this.elements.editButton) {
      this.elements.editButton.addEventListener('click', () => {
        this.toggleEditor();
      });
    }
    
    // Écouteurs pour le panneau d'édition
    if (this.elements.editorPanel) {
      // Bouton de fermeture
      const closeBtn = qs('.close-editor-btn', this.elements.editorPanel);
      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          this.closeEditor();
        });
      }
      
      // Sélecteur de disposition
      const layoutSelect = qs('#layout-select', this.elements.editorPanel);
      if (layoutSelect) {
        layoutSelect.addEventListener('change', (e) => {
          this.selectLayout(e.target.value);
        });
      }
      
      // Bouton de nouvelle disposition
      const newLayoutBtn = qs('#new-layout-btn', this.elements.editorPanel);
      if (newLayoutBtn) {
        newLayoutBtn.addEventListener('click', () => {
          this.createNewLayout();
        });
      }
      
      // Bouton de suppression de disposition
      const deleteLayoutBtn = qs('#delete-layout-btn', this.elements.editorPanel);
      if (deleteLayoutBtn) {
        deleteLayoutBtn.addEventListener('click', () => {
          this.deleteCurrentLayout();
        });
      }
      
      // Bouton d'ajout de section
      const addSectionBtn = qs('#add-section-btn', this.elements.editorPanel);
      if (addSectionBtn) {
        addSectionBtn.addEventListener('click', () => {
          this.showAddSectionDialog();
        });
      }
      
      // Bouton de sauvegarde
      const saveLayoutBtn = qs('#save-layout-btn', this.elements.editorPanel);
      if (saveLayoutBtn) {
        saveLayoutBtn.addEventListener('click', () => {
          this.saveCurrentLayout();
        });
      }
    }
  }

  /**
   * Bascule l'affichage de l'éditeur
   */
  toggleEditor() {
    if (this.state.isEditing) {
      this.closeEditor();
    } else {
      this.openEditor();
    }
  }

  /**
   * Ouvre l'éditeur de mise en page
   */
  openEditor() {
    if (this.elements.editorPanel) {
      // Afficher le panneau
      this.elements.editorPanel.style.display = 'flex';
      
      // Mettre à jour l'état
      this.state.isEditing = true;
      
      // Entrer en mode édition
      document.body.classList.add('layout-editing');
      
      // Mettre à jour la liste des dispositions
      this.updateLayoutSelector();
      
      // Afficher la disposition courante
      this.renderEditorGrid();
    }
  }

  /**
   * Ferme l'éditeur de mise en page
   */
  closeEditor() {
    if (this.elements.editorPanel) {
      // Masquer le panneau
      this.elements.editorPanel.style.display = 'none';
      
      // Mettre à jour l'état
      this.state.isEditing = false;
      
      // Sortir du mode édition
      document.body.classList.remove('layout-editing');
      
      // Réappliquer la mise en page active
      this.applyLayout(this.state.activeLayoutId);
    }
  }

  /**
   * Met à jour le sélecteur de dispositions
   */
  updateLayoutSelector() {
    const layoutSelect = qs('#layout-select', this.elements.editorPanel);
    
    if (layoutSelect) {
      // Vider le sélecteur
      layoutSelect.innerHTML = '';
      
      // Ajouter chaque disposition
      this.layouts.forEach(layout => {
        const option = document.createElement('option');
        option.value = layout.id;
        option.textContent = layout.name;
        option.selected = layout.id === this.state.activeLayoutId;
        
        layoutSelect.appendChild(option);
      });
    }
  }

  /**
   * Sélectionne une disposition
   * @param {string} layoutId - ID de la disposition
   */
  selectLayout(layoutId) {
    // Vérifier que la disposition existe
    const layoutIndex = this.layouts.findIndex(layout => layout.id === layoutId);
    
    if (layoutIndex !== -1) {
      // Mettre à jour la disposition active
      this.state.activeLayoutId = layoutId;
      
      // Afficher la disposition
      this.renderEditorGrid();
    }
  }

  /**
   * Crée une nouvelle disposition
   */
  createNewLayout() {
    // Afficher un dialogue pour saisir le nom
    const dialog = createElement('div', {
      className: 'dialog-overlay',
    });
    
    dialog.innerHTML = `
      <div class="dialog">
        <div class="dialog-header">
          <h3>Nouvelle disposition</h3>
          <button class="dialog-close-btn">×</button>
        </div>
        <div class="dialog-content">
          <form id="new-layout-form">
            <div class="form-group">
              <label for="layout-name">Nom</label>
              <input type="text" id="layout-name" required>
            </div>
            <div class="form-actions">
              <button type="button" class="button button--secondary dialog-cancel-btn">Annuler</button>
              <button type="submit" class="button">Créer</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    // Configurer les écouteurs
    const closeBtn = qs('.dialog-close-btn', dialog);
    const cancelBtn = qs('.dialog-cancel-btn', dialog);
    const form = qs('#new-layout-form', dialog);
    
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(dialog);
    });
    
    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(dialog);
    });
    
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      // Récupérer le nom
      const name = qs('#layout-name', dialog).value;
      
      // Créer la disposition
      const newLayout = {
        id: `layout-${Date.now()}`,
        name,
        sections: [...this.defaultLayout.sections],
      };
      
      // Ajouter à la liste
      this.layouts.push(newLayout);
      
      // Sélectionner la nouvelle disposition
      this.state.activeLayoutId = newLayout.id;
      
      // Mettre à jour l'affichage
      this.updateLayoutSelector();
      this.renderEditorGrid();
      
      // Fermer le dialogue
      document.body.removeChild(dialog);
    });
  }

  /**
   * Supprime la disposition courante
   */
  deleteCurrentLayout() {
    // On ne peut pas supprimer la disposition par défaut
    if (this.state.activeLayoutId === 'default') {
      alert('La disposition par défaut ne peut pas être supprimée.');
      return;
    }
    
    // Demander confirmation
    if (confirm('Êtes-vous sûr de vouloir supprimer cette disposition ?')) {
      // Supprimer la disposition
      this.layouts = this.layouts.filter(layout => layout.id !== this.state.activeLayoutId);
      
      // Sélectionner la disposition par défaut
      this.state.activeLayoutId = 'default';
      
      // Mettre à jour l'affichage
      this.updateLayoutSelector();
      this.renderEditorGrid();
      
      // Sauvegarder
      this.saveLayouts();
    }
  }

  /**
   * Sauvegarde la disposition courante
   */
  saveCurrentLayout() {
    // Sauvegarder les dispositions
    this.saveLayouts();
    
    // Appliquer la disposition
    this.applyLayout(this.state.activeLayoutId);
    
    // Fermer l'éditeur
    this.closeEditor();
    
    // Notifier l'utilisateur
    alert('Disposition sauvegardée avec succès !');
  }

  /**
   * Applique une disposition
   * @param {string} layoutId - ID de la disposition
   */
  applyLayout(layoutId) {
    const layout = this.layouts.find(layout => layout.id === layoutId);
    
    if (layout && this.elements.layoutContainer) {
      // Réinitialiser le conteneur
      this.elements.layoutContainer.innerHTML = '';
      
      // Définir le style de la grille
      this.elements.layoutContainer.style.display = 'grid';
      this.elements.layoutContainer.style.gridTemplateRows = 'repeat(4, auto)';
      this.elements.layoutContainer.style.gridTemplateColumns = 'repeat(2, 1fr)';
      this.elements.layoutContainer.style.gap = '1.5rem';
      
      // Créer chaque section
      layout.sections.forEach(section => {
        const sectionEl = this.createSection(section);
        this.elements.layoutContainer.appendChild(sectionEl);
      });
    }
  }

  /**
   * Crée un élément de section
   * @param {Object} section - Données de la section
   * @returns {HTMLElement} Élément de section
   */
  createSection(section) {
    const sectionEl = createElement('section', {
      className: `dashboard-section dashboard-section--${section.type}`,
      id: section.id,
    });
    
    // Définir la position et la taille
    sectionEl.style.gridRow = `${section.position.row} / span ${section.size.height}`;
    sectionEl.style.gridColumn = `${section.position.column} / span ${section.size.width}`;
    
    // Définir le contenu
    sectionEl.innerHTML = `<h2>${section.title}</h2>`;
    
    // Conteneur du contenu
    const contentContainer = createElement('div', {
      className: 'section-content',
    });
    
    sectionEl.appendChild(contentContainer);
    
    // Initialiser la section en fonction du type
    switch (section.type) {
      case 'favorites':
        this.initializeFavoritesSection(contentContainer);
        break;
      case 'categories':
        this.initializeCategoriesSection(contentContainer);
        break;
      case 'custom':
        // À implémenter
        break;
    }
    
    return sectionEl;
  }

  /**
   * Initialise une section de favoris
   * @param {HTMLElement} container - Conteneur de la section
   */
  initializeFavoritesSection(container) {
    // Créer la grille de favoris
    const favoritesGrid = createElement('div', {
      id: 'favorites-list',
      className: 'favorites-grid',
    });
    
    container.appendChild(favoritesGrid);
    
    // Laisser le gestionnaire de favoris s'occuper du reste
    if (this.dashboard && this.dashboard.favoritesManager) {
      this.dashboard.favoritesManager.renderFavorites();
    }
  }

  /**
   * Initialise une section de catégories
   * @param {HTMLElement} container - Conteneur de la section
   */
  initializeCategoriesSection(container) {
    // Créer la grille de catégories
    const categoriesGrid = createElement('div', {
      className: 'categories-grid',
    });
    
    container.appendChild(categoriesGrid);
    
    // Laisser le gestionnaire de services s'occuper du reste
    if (this.dashboard && this.dashboard.servicesManager) {
      this.dashboard.servicesManager.renderServices();
    }
  }

  /**
   * Supprime une section
   * @param {string} sectionId - ID de la section
   */
  deleteSection(sectionId) {
    // Récupérer la disposition active
    const layoutIndex = this.layouts.findIndex(layout => layout.id === this.state.activeLayoutId);
    
    if (layoutIndex !== -1) {
      // Supprimer la section
      this.layouts[layoutIndex].sections = this.layouts[layoutIndex].sections.filter(
        section => section.id !== sectionId
      );
      
      // Mettre à jour l'affichage
      this.renderEditorGrid();
    }
  }

  /**
   * Affiche la grille d'édition
   */
  renderEditorGrid() {
    const gridContainer = qs('.layout-grid', this.elements.editorPanel);
    
    if (gridContainer) {
      // Vider le conteneur
      gridContainer.innerHTML = '';
      
      // Récupérer la disposition active
      const activeLayout = this.layouts.find(layout => layout.id === this.state.activeLayoutId);
      
      if (activeLayout) {
        // Créer la grille
        const grid = createElement('div', {
          className: 'editor-grid',
        });
        
        // Ajouter chaque section
        activeLayout.sections.forEach(section => {
          const sectionEl = this.createEditorSection(section);
          grid.appendChild(sectionEl);
        });
        
        gridContainer.appendChild(grid);
        
        // Configurer le glisser-déposer
        this.setupDragAndDrop();
      }
    }
  }

  /**
   * Crée un élément de section dans l'éditeur
   * @param {Object} section - Données de la section
   * @returns {HTMLElement} Élément de section
   */
  createEditorSection(section) {
    const sectionEl = createElement('div', {
      className: 'editor-section',
      dataset: {
        id: section.id,
        type: section.type,
      },
    });
    
    // Définir la position et la taille
    sectionEl.style.gridRow = `${section.position.row} / span ${section.size.height}`;
    sectionEl.style.gridColumn = `${section.position.column} / span ${section.size.width}`;
    
    // Contenu de la section
    sectionEl.innerHTML = `
      <div class="section-header">
        <h3>${section.title}</h3>
        <div class="section-controls">
          <button class="resize-btn" title="Redimensionner">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M15 3h6v6"></path>
              <path d="M9 21H3v-6"></path>
              <path d="M21 3l-7 7"></path>
              <path d="M3 21l7-7"></path>
            </svg>
          </button>
          <button class="edit-btn" title="Modifier">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
          </button>
          <button class="delete-btn" title="Supprimer">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
          </button>
        </div>
      </div>
      <div class="section-content">
        <div class="section-type">${section.type}</div>
      </div>
    `;
    
    // Ajouter les écouteurs d'événements
    const editBtn = qs('.edit-btn', sectionEl);
    const deleteBtn = qs('.delete-btn', sectionEl);
    const resizeBtn = qs('.resize-btn', sectionEl);
    
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        this.editSection(section.id);
      });
    }
    
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        this.deleteSection(section.id);
      });
    }
    
    if (resizeBtn) {
      resizeBtn.addEventListener('click', () => {
        this.showResizeDialog(section.id);
      });
    }
    
    return sectionEl;
  }

  /**
   * Affiche le dialogue de redimensionnement d'une section
   * @param {string} sectionId - ID de la section
   */
  showResizeDialog(sectionId) {
    // Récupérer la disposition active
    const activeLayout = this.layouts.find(layout => layout.id === this.state.activeLayoutId);
    
    if (activeLayout) {
      // Trouver la section
      const section = activeLayout.sections.find(section => section.id === sectionId);
      
      if (section) {
        // Créer le dialogue
        const dialog = createElement('div', {
          className: 'dialog-overlay',
        });
        
        dialog.innerHTML = `
          <div class="dialog">
            <div class="dialog-header">
              <h3>Redimensionner la section</h3>
              <button class="dialog-close-btn">×</button>
            </div>
            <div class="dialog-content">
              <form id="resize-section-form">
                <div class="form-group">
                  <label for="section-size">Taille</label>
                  <select id="section-size">
                    ${this.config.gridSizes.map(size => {
                      const [w, h] = size.split('x').map(Number);
                      const selected = w === section.size.width && h === section.size.height ? 'selected' : '';
                      return `<option value="${size}" ${selected}>${size}</option>`;
                    }).join('')}
                  </select>
                </div>
                <div class="form-actions">
                  <button type="button" class="button button--secondary dialog-cancel-btn">Annuler</button>
                  <button type="submit" class="button">Appliquer</button>
                </div>
              </form>
            </div>
          </div>
        `;
        
        document.body.appendChild(dialog);
        
        // Configurer les écouteurs
        const closeBtn = qs('.dialog-close-btn', dialog);
        const cancelBtn = qs('.dialog-cancel-btn', dialog);
        const form = qs('#resize-section-form', dialog);
        
        closeBtn.addEventListener('click', () => {
          document.body.removeChild(dialog);
        });
        
        cancelBtn.addEventListener('click', () => {
          document.body.removeChild(dialog);
        });
        
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          
          // Récupérer la taille
          const sizeValue = qs('#section-size', dialog).value;
          const [width, height] = sizeValue.split('x').map(Number);
          
          // Mettre à jour la section
          this.updateSection(sectionId, {
            size: { width, height }
          });
          
          // Fermer le dialogue
          document.body.removeChild(dialog);
        });
      }
    }
  }
}
