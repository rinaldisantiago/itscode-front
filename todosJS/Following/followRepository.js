import { apiFetch } from '../../js/fetch.js';

class FollowRepository {
    constructor() {
        // Las rutas ahora se especifican completas en cada método
    }

    /**
     * Obtiene sugerencias de usuarios para seguir
     * @param {number} idUserLogger - ID del usuario logueado
     * @param {number} page - Número de página (default: 1)
     * @param {number} pageSize - Tamaño de página (default: 8)
     * @returns {Promise<Object>} Respuesta con sugerencias
     */
    async getSuggestions(idUserLogger, page = 1, pageSize = 8) {
        const url = '/User/Sugerencias';
        const params = new URLSearchParams({
            idUserLogger: idUserLogger,
            page: page,
            pageSize: pageSize
        });

        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        };

        return await apiFetch(`${url}?${params}`, config);
    }

    /**
     * Busca usuarios por nombre
     * @param {string} searchTerm - Término de búsqueda
     * @param {number} idUserLogger - ID del usuario logueado
     * @param {number} page - Número de página (default: 1)
     * @param {number} pageSize - Tamaño de página (default: 10)
     * @returns {Promise<Object>} Respuesta con usuarios encontrados
     */
    async searchUsers(searchTerm, idUserLogger, pageNumber = 1, pageSize = 10) {
        
        const url = `/User/${searchTerm}/${idUserLogger}/${pageNumber}/${pageSize}`;

        console.log('URL de búsqueda construida:', url);

        const config = {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        };

        return await apiFetch(url, config);
    }

    /**
     * Sigue a un usuario
     * @param {number} userFollowingId - ID del usuario que sigue
     * @param {number} userFollowedId - ID del usuario a seguir
     * @returns {Promise<Object>} Respuesta de la operación
     */
    async followUser(userFollowingId, userFollowedId) {
        const params = new URLSearchParams({
            userFollowingId: userFollowingId,
            userFollowedId: userFollowedId
        });
        
        const url = `/Following?${params}`;
        const config = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        };

        return await apiFetch(url, config);
    }

    /**
     * Deja de seguir a un usuario
     * @param {number} userFollowingId - ID del usuario que deja de seguir
     * @param {number} userFollowedId - ID del usuario a dejar de seguir
     * @returns {Promise<Object>} Respuesta de la operación
     */
    async unfollowUser(userFollowingId, userFollowedId) {
        const params = new URLSearchParams({
            userFollowingId: userFollowingId,
            userFollowedId: userFollowedId
        });
        
        const url = `/Following?${params}`;
        const config = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        };

        return await apiFetch(url, config);
    }
}

// Exportar instancia única del repositorio
export const followRepository = new FollowRepository();
    