import { apiFetch } from '../fetch.js';

const API_BASE_URL = 'http://localhost:5052';

export const buildFullUrl = (relativeUrl) => {
    if (!relativeUrl || relativeUrl.startsWith('http')) {
        return relativeUrl;
    }
    return `${API_BASE_URL}${relativeUrl}`;
};

export class PostRepository {

    async getPostsForProfile(idUserConsultado, idUserLogger, isMyPosts, pageNumber = 1, pageSize = 10) {
        let url = `/Post?idUserLogger=${idUserLogger}&isMyPosts=${isMyPosts}&pageNumber=${pageNumber}&pageSize=${pageSize}`;
        if (idUserConsultado) {
            url += `&idUserConsultado=${idUserConsultado}`;
        }

        const response = await apiFetch(url);
        return response.posts;
    }

    async getPostById(postId, userId, pageNumberComments = 1, pageSizeComments = 3) {
        return await apiFetch(`/Post/${postId}/${userId}/${pageNumberComments}/${pageSizeComments}`);
    }

    async deletePost(postId, userId) {
        const url = `/Post?id=${postId}&idUser=${userId}`;

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