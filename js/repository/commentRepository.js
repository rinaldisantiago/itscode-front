// js/repository/CommentRepository.js

import { apiFetch } from '../fetch.js';

export class CommentRepository {
    
    /**
     * Publica un nuevo comentario.
     */
    async createComment(postId, userId, content) {
        // Endpoint: /Comment/create (según tu CommentController)
        const url = '/Comment'; 
        
        // Datos enviados al [HttpPost("create")] con [FromBody]
        const requestBody = {
            postId: postId,
            userId: userId,
            content: content
        };

        try {
            const result = await apiFetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });
            return result; 
        } catch (error) {
            console.error("Fallo al crear comentario:", error);
            throw error; 
        }
    }
    
    async deleteComment(commentId) {
        // Endpoint: /Comment?id=X (según tu CommentController)
        const url = '/Comment';
        
        // El controlador espera el ID en Query Parameters
        const queryString = `?id=${commentId}`;

        try {
            const result = await apiFetch(url + queryString, {
                method: 'DELETE',
            });
            return result;
        } catch (error) {
            console.error("Fallo al eliminar comentario:", error);
            throw error;
        }
    }
}