import { apiFetch } from '../fetch.js'; 

const USER_URLS = {
    BASE: '/User',
};

export async function getUserById(userIdToFetch, loggedInUserId) {
    // ✅ CORRECCIÓN: El backend espera el ID en la ruta y el loggerId como query param.
    const url = `${USER_URLS.BASE}/${userIdToFetch}?idUserLogger=${loggedInUserId}`;
    return apiFetch(url);
}

export async function updateUser(userId, formData) {
    const url = USER_URLS.BASE;
    
    const config = {
        method: 'PUT',
        body: formData,
        // 🚨 CORRECCIÓN CLAVE: No establecemos Content-Type.
        // El navegador lo hará automáticamente por ser un FormData.
    };

    return apiFetch(url, config);
}

/**
 * Busca usuarios por un término de búsqueda.
 * El backend espera los parámetros en la ruta.
 */
export async function searchUsers(searchTerm, loggedInUserId, pageNumber = 1, pageSize = 10) {
    const url = `${USER_URLS.BASE}/search/${searchTerm}/${loggedInUserId}/${pageNumber}/${pageSize}`;
    return apiFetch(url);
}