// js/repository/InteractionRepository.js

import { apiFetch } from '../fetch.js';

// Define las constantes de tipo de interacción (ajusta si tus valores de enum son diferentes)
export const INTERACTION_TYPE = {
    LIKE: 1, 
    DISLIKE: 2, 
};

export class InteractionRepository {
    
    /**
     * Obtiene las interacciones de un usuario para un post específico.
     * @param {number} postId - ID del post.
     * @param {number} userId - ID del usuario.
     * @returns {Promise<Object|null>} La interacción del usuario o null si no existe.
     */

    async createInteraction(postId, userId, type) {
        const url = `/Interaction`;
        
        const requestBody = {
            postId: postId,        
            userId: userId,        
            interactionType: type  
        };
        
        console.log('Enviando petición de interacción:', {
            url: url,
            body: requestBody
        });
        
        try {
            const result = await apiFetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            console.log('Respuesta del backend:', result);
            return result; 
        } catch (error) {
            console.error("Error al crear interacción:", error);
            throw error;
        }
    }

    /**
     * Elimina una interacción (e.g., quitar un like/dislike).
     */
    async deleteInteraction(interactionId) {
        const url = '/Interaction';
        
        const requestBody = {
            interactionId: interactionId  
        };
        
        try {
            const result = await apiFetch(url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });
            return result;
        } catch (error) {
            console.error("Fallo al eliminar interacción:", error);
            throw error;
        }
    }
}