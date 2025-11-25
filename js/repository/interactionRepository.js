// js/repository/InteractionRepository.js

import { apiFetch } from '../fetch.js';

// Define las constantes de tipo de interacción (ajusta si tus valores de enum son diferentes)
export const INTERACTION_TYPE = {
    LIKE: 1, 
    DISLIKE: 2, 
};

export class InteractionRepository {

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
    async deleteInteraction(interactionId, userId, interactionType) {
        const url = '/Interaction';
        
        const requestBody = {
            interactionId: interactionId,
            // ✅ SOLUCIÓN: Enviamos el tipo de interacción del botón que se está pulsando.
            // Si el usuario pulsa "like" para quitar un like, el backend recibe
            // el ID de la interacción a borrar y el tipo "LIKE", permitiéndole resolver la acción.
            interactionType: interactionType 
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