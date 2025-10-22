import { apiFetch } from '../fetch.js';

export class PostRepository {
    
    async getAllWallPosts(loggedUserId, pageNumber = 1, pageSize = 10) {
        try {
            // Endpoint: /Post?idUserLogger=X&pageNumber=Y&pageSize=Z&isMyPosts=false
            const url = `/Post?idUserLogger=${loggedUserId}&pageNumber=${pageNumber}&pageSize=${pageSize}&isMyPosts=false`;
            
            const responseData = await apiFetch(url, {
                method: 'GET',
            });

            // Asume que la respuesta JSON tiene la estructura { posts: [...] }
            // Cada post debe incluir userInteraction: { interactionId: number, type: number } o null
            return responseData.posts || []; 

        } catch (error) {
            console.error("Fallo en PostRepository.getAllWallPosts:", error);
            return []; 
        }
    }
}