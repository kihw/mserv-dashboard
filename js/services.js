/**
 * Fonctions pour gérer l'affichage des services
 */

// Génération du dashboard principal avec tous les services
function generateServiceCards() {
    const servicesGrid = document.getElementById('servicesGrid');
    servicesGrid.innerHTML = '';
    
    services.forEach((service, index) => {
        const card = document.createElement('div');
        card.className = `service-card${service.priority === 'high' ? ' grid-span-2' : ''}`;
        card.setAttribute('data-category', service.category);
        card.setAttribute('data-id', service.id);
        card.setAttribute('data-status', service.status);
        card.style.setProperty('--animation-order', index);
        
        const statusClass = service.status === 'online' ? 'status-online' : 
                            service.status === 'maintenance' ? 'status-maintenance' : 'status-offline';
        
        card.innerHTML = `
            <div class="status-indicator ${statusClass}"></div>
            <div class="customize-overlay">
                <button class="customize-button" title="Ajouter aux favoris">
                    <i class="fas fa-star"></i>
                </button>
                <button class="customize-button" title="Régler les préférences">
                    <i class="fas fa-cog"></i>
                </button>
            </div>
            <div class="service-icon" style="background-color: ${service.color}">
                <i class="${service.icon}"></i>
            </div>
            <div class="service-content">
                <div class="service-name">${service.name}</div>
                <div class="service-description">${service.description}</div>
                <a href="${service.url}" class="service-link">Ouvrir</a>
            </div>
        `;
        
        servicesGrid.appendChild(card);
    });
}

// Génération des groupes de services
function generateServiceGroups() {
    const serviceGroupsContainer = document.getElementById('serviceGroups');
    serviceGroupsContainer.innerHTML = '';
    
    serviceGroups.forEach(group => {
        const groupElement = document.createElement('div');
        groupElement.className = 'service-group';
        groupElement.id = `group-${group.id}`;
        
        const groupHeader = document.createElement('div');
        groupHeader.className = 'group-header';
        groupHeader.innerHTML = `
            <div class="group-title">
                <i class="${group.icon}"></i>
                <span>${group.name}</span>
            </div>
            <button class="group-toggle">
                <i class="fas fa-chevron-up"></i>
            </button>
        `;
        
        const groupBody = document.createElement('div');
        groupBody.className = 'group-body';
        
        // Ajouter les services du groupe
        group.services.forEach(serviceId => {
            const service = services.find(s => s.id === serviceId);
            if (service) {
                const miniService = document.createElement('a');
                miniService.className = 'mini-service';
                miniService.href = service.url;
                
                miniService.innerHTML = `
                    <div class="mini-icon" style="background-color: ${service.color};">
                        <i class="${service.icon}"></i>
                    </div>
                    <div class="mini-content">
                        <div class="mini-name">${service.name}</div>
                        <div class="mini-status">${getCategoryDisplayName(service.category)}</div>
                    </div>
                    <div class="status-dot ${service.status}"></div>
                `;
                
                groupBody.appendChild(miniService);
            }
        });
        
        groupElement.appendChild(groupHeader);
        groupElement.appendChild(groupBody);
        serviceGroupsContainer.appendChild(groupElement);
    });
    
    // Gérer les groupes pliables après génération
    initializeGroupToggles();
}

// Fonction pour initialiser les toggles de groupe
function initializeGroupToggles() {
    const groupToggles = document.querySelectorAll('.group-toggle');
    groupToggles.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const group = toggle.closest('.service-group');
            group.classList.toggle('collapsed');
            
            const icon = toggle.querySelector('i');
            if (group.classList.contains('collapsed')) {
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            } else {
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            }
        });
    });
}

// Fonction pour obtenir le nom d'affichage d'une catégorie
function getCategoryDisplayName(categoryId) {
    const categoryMap = {
        'media': 'Médias',
        'management': 'Gestion',
        'downloads': 'Téléchargement',
        'utilities': 'Utilitaires',
        'monitoring': 'Surveillance',
        'security': 'Sécurité'
    };
    
    return categoryMap[categoryId] || categoryId;
}

// Fonction pour basculer entre les vues
function initializeViewToggle() {
    const viewToggle = document.getElementById('viewToggle');
    if (viewToggle) {
        viewToggle.addEventListener('click', () => {
            const dashboard = document.getElementById('servicesGrid');
            
            if (dashboard.classList.contains('list-view')) {
                dashboard.classList.remove('list-view');
                viewToggle.innerHTML = '<i class="fas fa-list"></i><span>Vue liste</span>';
            } else {
                dashboard.classList.add('list-view');
                viewToggle.innerHTML = '<i class="fas fa-th-large"></i><span>Vue grille</span>';
            }
        });
    }
}

// Fonction pour simuler des changements de statut aléatoires
function simulateStatusChanges() {
    // 10% de chance qu'un service change d'état
    if (Math.random() > 0.9) {
        const randomServiceIndex = Math.floor(Math.random() * services.length);
        const randomService = services[randomServiceIndex];
        
        // Alterner entre online et maintenance
        randomService.status = randomService.status === 'online' ? 'maintenance' : 'online';
        
        // Mettre à jour le dashboard
        generateServiceCards();
        
        // Mettre à jour les mini-services correspondants
        document.querySelectorAll(`.mini-service .mini-name`).forEach(element => {
            if (element.textContent === randomService.name) {
                const statusDot = element.closest('.mini-service').querySelector('.status-dot');
                statusDot.className = `status-dot ${randomService.status}`;
            }
        });
    }
    
    // Vérifier à nouveau après un délai
    setTimeout(simulateStatusChanges, 30000);
}
