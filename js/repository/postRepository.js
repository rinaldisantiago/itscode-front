// js/repository/postRepository.js

import { apiFetch } from '../fetch.js';

const API_BASE_URL = 'http://localhost:5052';

export const buildFullUrl = (relativeUrl) => {
    if (!relativeUrl || relativeUrl.startsWith('http')) {
        return relativeUrl;
    }
    return `${API_BASE_URL}${relativeUrl}`;
};

export class PostRepository {

    /**
     * Obtiene publicaciones. Sirve tanto para el muro como para los perfiles.
     * @param {string} idUserLogger - El ID del usuario logueado.
     * @param {object} options - Opciones de filtrado.
     * @param {string|null} [options.idUserConsultado=null] - Si se provee, se buscan los posts de este usuario. Si no, se devuelve el muro.
     * @param {number} [options.pageNumber=1] - Número de página.
     * @param {number} [options.pageSize=10] - Tamaño de la página.
     */
    async getPostsForProfile(idUserConsultado, idUserLogger, isMyPosts, pageNumber = 1, pageSize = 10) {
        // 🚀 SOLUCIÓN FINAL (Basada en el Controller de C#):
        // Construimos la URL base.
        let url = `/Post?idUserLogger=${idUserLogger}&isMyPosts=${isMyPosts}&pageNumber=${pageNumber}&pageSize=${pageSize}`;

        // Añadimos 'idUserConsultado' SOLO si es necesario (cuando vemos el perfil de alguien).
        if (idUserConsultado) {
            url += `&idUserConsultado=${idUserConsultado}`;
        }

        const response = await apiFetch(url);
        return response.posts; // Asumimos que la respuesta siempre tiene un campo 'posts'
    }

    async getPostById(postId, userId, pageNumberComments = 1, pageSizeComments = 3) {
        return await apiFetch(`/Post/${postId}/${userId}/${pageNumberComments}/${pageSizeComments}`);
    }

    async deletePost(postId, userId) {
        // El backend espera los parámetros en la URL (FromQuery)
        const url = `/Post?id=${postId}&idUser=${userId}`;

        // Realizamos la petición DELETE
        return await apiFetch(url, {
            method: 'DELETE'
        });
    }
}

export async function getUserById(userId, loggedUserId) {
    return await apiFetch(`/User/${userId}/${loggedUserId}`);
}

export async function updateUser(userId, formData) {
    return await apiFetch(`/User/${userId}`, { method: 'PUT', body: formData, isMultipart: true });
}