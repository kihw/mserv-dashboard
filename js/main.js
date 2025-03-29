/**
 * Fichier principal d'initialisation
 */
document.addEventListener('DOMContentLoaded', () => {
    // Générer les cartes de service
    generateServiceCards();
    
    // Générer les groupes de services
    generateServiceGroups();
    
    // Initialiser la recherche
    initializeSearch();
    
    // Initialiser le basculement de vue
    initializeViewToggle();
    
    // Démarrer les simulations
    updateSystemStatus();
    simulateStatusChanges();
    
    // Ajouter des effets de survol aux éléments d'action
    document.querySelectorAll('.action-button, .customize-button').forEach(button => {
        button.addEventListener('mouseenter', () => {
            button.style.transform = 'scale(1.05)';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = 'scale(1)';
        });
    });
    
    // Animation au chargement initial
    setTimeout(() => {
        document.querySelectorAll('.service-card, .service-group, .weather-card, .system-banner').forEach(el => {
            el.classList.add('loaded');
        });
    }, 100);
    
    console.log('Dashboard initialisé avec succès!');
});
