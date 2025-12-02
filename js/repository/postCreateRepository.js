// js/repository/postCreateRepository.js

// Importamos la función genérica de fetch
import { apiFetch } from '../fetch.js';

const POST_URLS = {
    CREATE: '/Post' // La ruta base de tu PostController
};

export async function createPost(postFormData) {
    const config = {
        method: 'POST',
        // NO se especifica 'Content-Type'. El navegador lo añade automáticamente
        // cuando el body es un objeto FormData, incluyendo el 'boundary' necesario.
        body: postFormData
    };

    return apiFetch(POST_URLS.CREATE, config);
}