import { apiFetch } from '../fetch.js';

const USER_URLS = {
    BASE: '/User',
};

export async function getUserById(userIdToFetch, loggedInUserId) {
    const safeLoggedInUserId = Number(loggedInUserId) || 0;

    return apiFetch(`${USER_URLS.BASE}/${userIdToFetch}/${safeLoggedInUserId}`);
}

export async function updateUser(userId, formData) {
    const url = USER_URLS.BASE;

    const config = {
        method: 'PUT',
        body: formData,
    };

    return apiFetch(url, config);
}

export async function searchUsers(searchTerm, loggedInUserId, pageNumber = 1, pageSize = 10) {
    const url = `${USER_URLS.BASE}?searchTerm=${searchTerm}&idUserLogger=${loggedInUserId}&pageNumber=${pageNumber}&pageSize=${pageSize}`;
    return apiFetch(url);
}

export async function getSuggestions(loggedInUserId, pageNumber = 1, pageSize = 8) {
    const url = `${USER_URLS.BASE}/Suggestions/${loggedInUserId}/${pageNumber}/${pageSize}`;
    return apiFetch(url);
}