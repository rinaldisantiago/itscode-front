import { Following } from './Following.js';

class FollowViews {
    constructor() {
        this.container = document.getElementById('card-users');
        this.suggestionsTitle = document.querySelector('h2');
    }

    /**
     * Muestra el estado de carga
     */
    showLoading() {
        if (this.container) {
            this.container.innerHTML = `
                <div class="loading-container">
                    <div class="spinner"></div>
                    <p>Cargando...</p>
                </div>
            `;
        }
    }

    /**
     * Renderiza las sugerencias de usuarios
     * @param {Array} suggestions - Array de sugerencias
     */
    renderSuggestions(suggestions) {
        if (!this.container) return;

        this.container.innerHTML = '';
        
        if (suggestions.length === 0) {
            this.showNoSuggestions();
            return;
        }

        suggestions.forEach(suggestion => {
            const userCard = this.createUserCard(suggestion, false);
            this.container.appendChild(userCard);
        });
    }

    /**
     * Renderiza los resultados de búsqueda
     * @param {Array} users - Array de usuarios encontrados
     * @param {string} searchTerm - Término de búsqueda
     */
    renderSearchResults(users, searchTerm) {
        if (!this.container) return;

        this.container.innerHTML = '';
        
        if (users.length === 0) {
            this.showNoResults(searchTerm);
            return;
        }

        // Actualizar título para mostrar resultados de búsqueda
        if (this.suggestionsTitle) {
            this.suggestionsTitle.textContent = `Resultados para "${searchTerm}"`;
        }

        users.forEach(user => {
            const userCard = this.createUserCard(user, true);
            this.container.appendChild(userCard);
        });
    }

    /**
     * Crea una tarjeta de usuario
     * @param {Object} user - Datos del usuario
     * @param {boolean} isSearchResult - Si es resultado de búsqueda
     * @returns {HTMLElement} Elemento de la tarjeta
     */
    createUserCard(user, isSearchResult = false) {
        const card = document.createElement('div');
        card.className = 'card-user';
        
        // Obtener el ID del usuario - necesitamos un ID válido
        const userId = user.id || user.userId || user.Id || user.UserId;
        const userName = user.userName || user.UserName || user.fullName;
        
        console.log('Creando tarjeta para usuario:', { user, userId, userName });
        
        // Validar que tenemos un ID válido
        if (!userId) {
            console.error('Usuario sin ID válido:', user);
            // Usar un ID temporal o manejar el error
            card.dataset.userId = 'temp-id';
        } else {
            card.dataset.userId = userId;
        }
        
        card.dataset.userName = userName;

        // Determinar si el usuario ya está siendo seguido
        const isFollowing = user.isFollowing || false;
        const buttonText = isFollowing ? 'Dejar de seguir' : 'Seguir';
        const buttonClass = isFollowing ? 'unfollow' : 'follow';

        card.innerHTML = `
            <img class="avatar" src="${user.avatar || user.Avatar || user.urlAvatar}" alt="Avatar de ${userName}" />
            <a class="user-name-search" href="user-profile.html?id=${userId}">
                <span class="clickable-text">${userName}</span>
            </a>
            <button type="button" class="${buttonClass}">
                ${buttonText}
            </button>
        `;

        return card;
    }

    /**
     * Muestra mensaje cuando no hay sugerencias
     */
    showNoSuggestions() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-users"></i>
                <h3>No hay sugerencias disponibles</h3>
                <p>No encontramos usuarios para sugerirte en este momento.</p>
            </div>
        `;
    }

    /**
     * Muestra mensaje cuando no hay resultados de búsqueda
     * @param {string} searchTerm - Término de búsqueda
     */
    showNoResults(searchTerm) {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="no-results">
                <i class="fas fa-search"></i>
                <h3>No se encontraron resultados</h3>
                <p>No hay usuarios que coincidan con "${searchTerm}".</p>
                <p>Intenta con un término diferente.</p>
            </div>
        `;
    }

    /**
     * Muestra mensaje de error
     * @param {string} message - Mensaje de error
     */
    showError(message) {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="error-message">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Error</h3>
                <p>${message}</p>
                <button onclick="location.reload()" class="retry-button">
                    <i class="fas fa-refresh"></i> Reintentar
                </button>
            </div>
        `;
    }

    /**
     * Muestra mensaje de éxito
     * @param {string} message - Mensaje de éxito
     */
    showSuccess(message) {
        // Crear toast de éxito
        const toast = document.createElement('div');
        toast.className = 'success-toast';
        toast.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(toast);

        // Mostrar toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);

        // Ocultar y remover toast después de 3 segundos
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Limpia el contenedor y restaura el título original
     */
    clear() {
        if (this.container) {
            this.container.innerHTML = '';
        }
        
        if (this.suggestionsTitle) {
            this.suggestionsTitle.textContent = 'Sugerencias de usuarios';
        }
    }

    /**
     * Agrega más resultados (para paginación)
     * @param {Array} users - Array de usuarios adicionales
     * @param {boolean} isSearchResult - Si son resultados de búsqueda
     */
    appendResults(users, isSearchResult = false) {
        if (!this.container) return;

        users.forEach(user => {
            const userCard = this.createUserCard(user, isSearchResult);
            this.container.appendChild(userCard);
        });
    }
}

// Exportar instancia única de las vistas
export const followViews = new FollowViews();
