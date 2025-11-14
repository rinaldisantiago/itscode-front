import { apiFetch } from '../fetch.js'; 

const USER_URLS = {
    GET_BY_ID: '/User', // La ruta base para GET /User/{id}
    UPDATE: '/User' // La ruta base para PUT /User/{id}
};

export async function getUserById(userId) {
    const url = `${USER_URLS.GET_BY_ID}?id=${userId}`;
    
    // Usa tu apiFetch para una petición GET
    return apiFetch(url); 
}

export async function updateUser(userId, formData) { // Renombrado a formData para más claridad
    const url = `${USER_URLS.UPDATE}/${userId}`;
    
    // Creamos el objeto de configuración correctamente
    const config = {
        method: 'PUT',
        body: formData // formData es el objeto FormData que viene del controlador
    };

    // Llamamos a apiFetch con la url y el objeto de configuración
    return apiFetch(url, config);
}