import { apiFetch } from '../fetch.js';

export class CommentRepository {
    async getCommentsByPostId(postId, pageNumber = 2, pageSize = 3) {
        const url = `/Comment?postId=${postId}&pageNumber=${pageNumber}&pageSize=${pageSize}`;
        const response = await apiFetch(url);
        return response.comments || [];
    }

    async createComment(postId, userId, content) {
        return await apiFetch('/Comment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postId, userId, content })
        });
    }

    async deleteComment(commentId, postId, userId) {
        const url = `/Comment?id=${commentId}&idPost=${postId}&idUser=${userId}`;
        return await apiFetch(url, {
            method: 'DELETE'
        });
    }
}