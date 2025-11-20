// js/repository/postRepository.js

import { apiFetch } from '../fetch.js';

const POST_API_URL = '/Post';
const BASE_URL = 'http://localhost:5052';

// 🚨 CAMBIO CLAVE: Exportamos la CLASE que wallViews.js espera
export class PostRepository {
    
    /**
     * Obtiene los posts para el Wall (Muro) principal.
     */
    async getAllWallPosts(loggedUserId, pageNumber = 1, pageSize = 10) {
        try {
            // DTO: idUserLogger, isMyPosts = false, idUserConsultado = 0
            // ✅ FIX: Pedimos solo los primeros 3 comentarios para la carga inicial.
            const url = `${POST_API_URL}?idUserLogger=${loggedUserId}&idUserConsultado=0&isMyPosts=false&pageNumber=${pageNumber}&pageSize=${pageSize}&pageNumberComments=1&pageSizeComments=3`;
            
            const responseData = await apiFetch(url, {
                method: 'GET',
            });
            
            return responseData.posts || []; 

        } catch (error) {
            console.error("Fallo en PostRepository.getAllWallPosts:", error);
            return []; 
        }
    }

    /**
     * 🚀 NUEVO MÉTODO
     * Obtiene solo los posts del usuario especificado (para "My Profile").
     */
    async getPostsForProfile(loggedUserId, profileUserId, isOwnProfile, pageNumber = 1, pageSize = 10) {
    try {
        // ✅ CAMBIO: El valor de 'isMyPosts' ahora es dinámico según el parámetro 'isOwnProfile'.
        // ✅ FIX: Pedimos solo los primeros 3 comentarios para la carga inicial.
        const url = `${POST_API_URL}?idUserLogger=${loggedUserId}&idUserConsultado=${profileUserId}&isMyPosts=${isOwnProfile}&pageNumber=${pageNumber}&pageSize=${pageSize}&pageNumberComments=1&pageSizeComments=3`;
        
        const responseData = await apiFetch(url);
        return responseData.posts || []; 

    } catch (error) {
        console.error("Fallo en postRepository.getPostsForProfile:", error);
        return []; 
    }
}

    /**
     * 🚀 NUEVO MÉTODO
     * Obtiene un único post por su ID.
     * Asume que existe un endpoint GET /Post/{id}
     */
    async getPostById(postId, userId, pageNumberComments = 1, pageSizeComments = 10) {
        try {
            // ✅ FIX: Se incluyen los parámetros de paginación de comentarios en la URL
            // ✅ FIX: Usamos POST_API_URL en lugar de this.baseUrl, que era undefined.
            const url = `${POST_API_URL}/${postId}/${userId}/${pageNumberComments}/${pageSizeComments}`;
            const post = await apiFetch(url, { method: 'GET' });
            // ✅ FIX: Corregimos el typo, devolvemos la variable correcta.
            return post;

        } catch (error) {
            console.error(`Fallo en PostRepository.getPostById para el post ${postId}:`, error);
            throw error; // Relanzamos el error para que el llamador se entere
        }
    }
}

export function buildFullUrl(relativeUrl) {
    if (!relativeUrl || relativeUrl.startsWith('http')) {
        return relativeUrl || 'https://i.imgur.com/6M5A0b6.png'; // Fallback
    }
    return `${BASE_URL}${relativeUrl}`;
}