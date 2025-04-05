/**
 * Helpers pour la manipulation du DOM
 */

/**
 * Sélectionne un élément dans le DOM
 * @param {string} selector - Sélecteur CSS
 * @param {Element} [parent=document] - Élément parent
 * @returns {Element|null} Élément trouvé ou null
 */
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}

/**
 * Sélectionne tous les éléments correspondants dans le DOM
 * @param {string} selector - Sélecteur CSS
 * @param {Element} [parent=document] - Élément parent
 * @returns {NodeList} Liste d'éléments trouvés
 */
export function qsa(selector, parent = document) {
  return parent.querySelectorAll(selector);
}

/**
 * Crée un élément DOM avec des attributs
 * @param {string} tag - Nom de la balise
 * @param {Object} [attributes={}] - Attributs à ajouter
 * @param {string} [innerHTML=''] - Contenu HTML
 * @returns {Element} Élément créé
 */
export function createElement(tag, attributes = {}, innerHTML = '') {
  const element = document.createElement(tag);

  Object.entries(attributes).forEach(([key, value]) => {
    if (key === 'className') {
      element.className = value;
    } else if (key === 'dataset') {
      Object.entries(value).forEach(([dataKey, dataValue]) => {
        element.dataset[dataKey] = dataValue;
      });
    } else {
      element.setAttribute(key, value);
    }
  });

  if (innerHTML) {
    element.innerHTML = innerHTML;
  }

  return element;
}

/**
 * Ajoute des événements à un élément
 * @param {Element} element - Élément cible
 * @param {Object} listeners - Map des écouteurs d'événements
 */
export function addEventListeners(element, listeners) {
  Object.entries(listeners).forEach(([event, callback]) => {
    element.addEventListener(event, callback);
  });
}

/**
 * Supprime un élément du DOM
 * @param {Element} element - Élément à supprimer
 */
export function removeElement(element) {
  if (element && element.parentNode) {
    element.parentNode.removeChild(element);
  }
}

/**
 * Ajoute ou supprime une classe selon une condition
 * @param {Element} element - Élément cible
 * @param {string} className - Nom de la classe
 * @param {boolean} condition - Condition d'ajout
 */
export function toggleClass(element, className, condition) {
  if (condition) {
    element.classList.add(className);
  } else {
    element.classList.remove(className);
  }
}

/**
 * Anime l'apparition d'un élément
 * @param {Element} element - Élément à animer
 * @param {string} [animationClass='fade-in'] - Classe d'animation
 * @param {number} [duration=300] - Durée de l'animation
 * @returns {Promise} Promise résolue à la fin de l'animation
 */
export function animateIn(element, animationClass = 'fade-in', duration = 300) {
  return new Promise((resolve) => {
    element.classList.add(animationClass);
    setTimeout(() => {
      element.classList.remove(animationClass);
      resolve();
    }, duration);
  });
}

/**
 * Anime la disparition d'un élément
 * @param {Element} element - Élément à animer
 * @param {string} [animationClass='fade-out'] - Classe d'animation
 * @param {number} [duration=300] - Durée de l'animation
 * @returns {Promise} Promise résolue à la fin de l'animation
 */
export function animateOut(element, animationClass = 'fade-out', duration = 300) {
  return new Promise((resolve) => {
    element.classList.add(animationClass);
    setTimeout(() => {
      element.classList.remove(animationClass);
      resolve();
    }, duration);
  });
}

/**
 * Crée une notification
 * @param {string} message - Message de la notification
 * @param {string} [type='info'] - Type de notification (info, success, warning, error)
 * @param {number} [duration=5000] - Durée d'affichage
 * @returns {Element} Élément de notification
 */
export function createNotification(message, type = 'info', duration = 5000) {
  const notification = createElement('div', {
    className: `notification notification--${type}`,
  });

  notification.innerHTML = `
    <div class="notification__content">
      <div class="notification__message">${message}</div>
    </div>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('notification--closing');
    setTimeout(() => {
      removeElement(notification);
    }, 300);
  }, duration);

  return notification;
}

/**
 * Détecte si l'utilisateur est sur mobile
 * @returns {boolean} True si l'utilisateur est sur mobile
 */
export function isMobile() {
  return window.innerWidth < 768;
}

/**
 * Détecte le niveau de support de stockage local
 * @returns {Object} Informations sur le support
 */
export function detectStorageSupport() {
  const storageSupport = {
    localStorage: false,
    sessionStorage: false,
    cookies: false,
  };

  try {
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    storageSupport.localStorage = true;
  } catch (e) {
    console.warn('localStorage non supporté');
  }

  try {
    sessionStorage.setItem('test', 'test');
    sessionStorage.removeItem('test');
    storageSupport.sessionStorage = true;
  } catch (e) {
    console.warn('sessionStorage non supporté');
  }

  try {
    document.cookie = 'test=test; max-age=3600';
    storageSupport.cookies = document.cookie.indexOf('test=') !== -1;
    document.cookie = 'test=; max-age=0';
  } catch (e) {
    console.warn('cookies non supportés');
  }

  return storageSupport;
}

/**
 * Crée un debounce pour une fonction
 * @param {Function} func - Fonction à debouncer
 * @param {number} wait - Temps d'attente
 * @returns {Function} Fonction debounced
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}