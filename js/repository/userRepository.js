import { apiFetch } from '../fetch.js'; 

const USER_URLS = {
    GET_BY_ID: '/User' // La ruta base para GET /User/{id}
};

/**
 * 🚀 ESTA ES LA FUNCIÓN QUE SE EXPORTA
 * Obtiene los datos de un usuario específico por su ID.
 */
export async function getUserById(userId) {
    const url = `${USER_URLS.GET_BY_ID}/${userId}`;
    
    // Usa tu apiFetch para una petición GET
    return apiFetch(url); 
}