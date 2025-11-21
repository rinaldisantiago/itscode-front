// js/repository/commentRepository.js

import { apiFetch } from '../fetch.js';

export class CommentRepository {

    /**
     * Obtiene los comentarios de una publicación de forma paginada.
     * ✅ AJUSTADO: Ahora usa query parameters para coincidir con el nuevo backend.
     * @param {number} postId - El ID de la publicación.
     * @param {number} pageNumber - El número de página a solicitar.
     * @param {number} pageSize - La cantidad de comentarios por página.
     * @returns {Promise<Array>} Una lista de comentarios.
     */
    async getCommentsByPostId(postId, pageNumber = 2, pageSize = 3) {
        const url = `/Comment?postId=${postId}&pageNumber=${pageNumber}&pageSize=${pageSize}`;
        const response = await apiFetch(url);
        // El backend ahora devuelve un objeto { comments: [...] }
        return response.comments || [];
    }

    /**
     * Crea un nuevo comentario en una publicación.
     */
    async createComment(postId, userId, content) {
        return await apiFetch('/Comment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postId, userId, content })
        });
    }
}