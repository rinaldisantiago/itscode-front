// js/repository/InteractionRepository.js

import { apiFetch } from '../fetch.js';

// Define las constantes de tipo de interacción (ajusta si tus valores de enum son diferentes)
export const INTERACTION_TYPE = {
    LIKE: 1, 
    DISLIKE: 2, 
};

export class InteractionRepository {
    

    async createInteraction(postId, userId, type) {
        const url = `/Interaction`; // URL limpia, sin query string
        
        const requestBody = {
            postId: postId,
            userId: userId,
            interactionType: type 
        };
        
        try {
            const result = await apiFetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // Crucial para [FromBody]
                },
                body: JSON.stringify(requestBody) // Enviamos el JSON
            });
            return result; 
        } catch (error) { /* ... */ }
    }

    /**
     * Elimina una interacción (e.g., quitar un like/dislike).
     */
    async deleteInteraction(interactionId) {
        const url = '/Interaction';
        
        // Tu controlador DeleteInteraction espera [FromBody]
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