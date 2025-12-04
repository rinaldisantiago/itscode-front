import { apiFetch } from '../fetch.js';

const POST_URLS = {
    CREATE: '/Post'
};

export async function createPost(postFormData) {
    const config = {
        method: 'POST',
        body: postFormData
    };

    return apiFetch(POST_URLS.CREATE, config);
}