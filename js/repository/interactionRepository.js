import { apiFetch } from '../fetch.js';

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

        try {
            const result = await apiFetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            return result;
        } catch (error) {
            throw error;
        }
    }

    async deleteInteraction(interactionId, userId, interactionType) {
        const url = '/Interaction';

        const requestBody = {
            interactionId: interactionId,
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
            throw error;
        }
    }
}