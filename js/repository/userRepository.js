import { apiFetch } from '../fetch.js'; 

const USER_URLS = {
    GET_BY_ID: '/User' // La ruta base para GET /User/{id}
};

export async function getUserById(userId) {
    const url = `${USER_URLS.GET_BY_ID}/${userId}`;
    
    // Usa tu apiFetch para una petición GET
    return apiFetch(url); 
}