import { followRepository } from './followRepository.js';
import { followViews } from './followViews.js';

class FollowPresentation {
    constructor() {
        // Hardcodeado temporalmente como 1, más adelante manejaremos el token
        this.currentUserId = 1;
        this.searchTimeout = null;
        this.currentPage = 1;
        this.isSearchMode = false;
        this.searchTerm = '';
        
        this.initializeEventListeners();
        this.loadSuggestions();
    }

    /**
     * Obtiene el ID del usuario actual desde localStorage
     * @returns {number} ID del usuario logueado
     */
    getCurrentUserId() {
        const userData = localStorage.getItem('userData');
        if (userData) {
            const user = JSON.parse(userData);
            return user.id || user.userId || user.Id || user.UserId;
        }
        
        // Intentar obtener desde sessionStorage como fallback
        const sessionUserData = sessionStorage.getItem('userData');
        if (sessionUserData) {
            const user = JSON.parse(sessionUserData);
            return user.id || user.userId || user.Id || user.UserId;
        }
        
        console.warn('No se pudo obtener el ID del usuario logueado');
        return null;
    }

    /**
     * Inicializa los event listeners
     */
    initializeEventListeners() {
        const searchInput = document.querySelector('.search-input input');
        const cardUsersContainer = document.getElementById('card-users');

        // Event listener para búsqueda con debounce
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Event listener para botones de seguir/dejar de seguir
        if (cardUsersContainer) {
            cardUsersContainer.addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON') {
                    this.handleFollowAction(e);
                }
            });
        }
    }

    /**
     * Maneja la búsqueda de usuarios con debounce
     * @param {string} searchTerm - Término de búsqueda
     */
    handleSearch(searchTerm) {
        // Limpiar timeout anterior
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }

        // Si el término está vacío, mostrar sugerencias
        if (!searchTerm.trim()) {
            this.isSearchMode = false;
            this.loadSuggestions();
            return;
        }

        // Debounce de 500ms
        this.searchTimeout = setTimeout(() => {
            this.searchTerm = searchTerm.trim();
            this.isSearchMode = true;
            this.currentPage = 1;
            this.searchUsers(searchTerm.trim());
        }, 500);
    }

    /**
     * Busca usuarios por término
     * @param {string} searchTerm - Término de búsqueda
     */
    async searchUsers(searchTerm) {
        try {
            followViews.showLoading();
            
            const response = await followRepository.searchUsers(
                searchTerm, 
                this.currentUserId, 
                this.currentPage, 
                10
            );

            if (response && response.users && Array.isArray(response.users)) {
                followViews.renderSearchResults(response.users, searchTerm);
            } else {
                followViews.showNoResults(searchTerm);
            }
        } catch (error) {
            console.error('Error al buscar usuarios:', error);
            followViews.showError('Error al buscar usuarios. Intenta nuevamente.');
        }
    }

    /**
     * Carga las sugerencias de usuarios
     */
    async loadSuggestions() {
        try {
            followViews.showLoading();
            
            const response = await followRepository.getSuggestions(
                this.currentUserId, 
                this.currentPage, 
                8
            );

            if (response && response.sugerencias) {
                followViews.renderSuggestions(response.sugerencias);
            } else {
                followViews.showNoSuggestions();
            }
        } catch (error) {
            console.error('Error al cargar sugerencias:', error);
            followViews.showError('Error al cargar sugerencias. Intenta nuevamente.');
        }
    }

    /**
     * Maneja las acciones de seguir/dejar de seguir
     * @param {Event} event - Evento del click
     */
    async handleFollowAction(event) {
        const button = event.target;
        const userCard = button.closest('.card-user');
        const userId = userCard.dataset.userId;
        const userName = userCard.dataset.userName;
        const isFollowing = button.classList.contains('unfollow');

        console.log('Datos del usuario:', {
            userId: userId,
            userName: userName,
            currentUserId: this.currentUserId,
            isFollowing: isFollowing
        });

        // Validar que tenemos los datos necesarios
        if (!userId || userId === 'undefined') {
            console.error('ID del usuario no válido:', userId);
            followViews.showError('Error: No se pudo obtener el ID del usuario');
            return;
        }

        try {
            // Deshabilitar botón temporalmente
            button.disabled = true;
            button.textContent = isFollowing ? 'Dejando de seguir...' : 'Siguiendo...';

            if (isFollowing) {
                // Usuario ya está siendo seguido, hacer unfollow
                await followRepository.unfollowUser(this.currentUserId, userId);
                button.textContent = 'Seguir';
                button.classList.remove('unfollow');
                button.classList.add('follow');
                followViews.showSuccess(`Dejaste de seguir a ${userName}`);
            } else {
                // Usuario no está siendo seguido, hacer follow
                await followRepository.followUser(this.currentUserId, userId);
                button.textContent = 'Dejar de seguir';
                button.classList.remove('follow');
                button.classList.add('unfollow');
                followViews.showSuccess(`Ahora sigues a ${userName}`);
            }
        } catch (error) {
            console.error('Error en acción de seguir:', error);
            followViews.showError('Error al procesar la acción. Intenta nuevamente.');
            
            // Revertir estado del botón
            button.textContent = isFollowing ? 'Dejar de seguir' : 'Seguir';
        } finally {
            button.disabled = false;
        }
    }

    /**
     * Carga más resultados (paginación)
     */
    async loadMore() {
        this.currentPage++;
        
        try {
            if (this.isSearchMode) {
                await this.searchUsers(this.searchTerm);
            } else {
                await this.loadSuggestions();
            }
        } catch (error) {
            console.error('Error al cargar más resultados:', error);
            this.currentPage--; // Revertir incremento de página
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new FollowPresentation();
});