import { apiFetch } from '../fetch.js'; 

const USER_URLS = {
    BASE: '/User',
};

export async function getUserById(userIdToFetch, loggedInUserId) {
    // ✅ CORRECCIÓN: Nos aseguramos de que loggedInUserId sea un número válido.
    // Si es nulo o undefined, lo convertimos a 0 para que el backend no falle.
    const safeLoggedInUserId = Number(loggedInUserId) || 0;

    const url = `${USER_URLS.BASE}/${userIdToFetch}?idUserLogger=${safeLoggedInUserId}`;
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
    // ✅ CORRECCIÓN: El backend espera los parámetros como Query String, no en la ruta.
    const url = `${USER_URLS.BASE}?searchTerm=${searchTerm}&idUserLogger=${loggedInUserId}&pageNumber=${pageNumber}&pageSize=${pageSize}`;
    return apiFetch(url);
}

/**
 * 🚀 NUEVA FUNCIÓN
 * Obtiene una lista de usuarios sugeridos para seguir.
 * Llama al endpoint de sugerencias del backend.
 */
export async function getSuggestions(loggedInUserId, pageNumber = 1, pageSize = 10) {
    const url = `${USER_URLS.BASE}/Suggestions/${loggedInUserId}/${pageNumber}/${pageSize}`;
    return apiFetch(url);
}