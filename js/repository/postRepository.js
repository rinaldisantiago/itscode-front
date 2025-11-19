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
            const url = `${POST_API_URL}?idUserLogger=${loggedUserId}&idUserConsultado=0&isMyPosts=false&pageNumber=${pageNumber}&pageSize=${pageSize}`;
            
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
    async getPostsForProfile(loggedUserId, profileUserId, pageNumber = 1, pageSize = 10) {
    try {
        const url = `${POST_API_URL}?idUserLogger=${loggedUserId}&idUserConsultado=${profileUserId}&isMyPosts=true&pageNumber=${pageNumber}&pageSize=${pageSize}`;
        
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
    async getPostById(postId, loggedUserId) {
        try {
            // ✅ CORRECCIÓN: El endpoint es GET /Post/{id}/{idUserLogger}
            const url = `${POST_API_URL}/${postId}/${loggedUserId}`;
            
            const postData = await apiFetch(url);
            return postData;

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