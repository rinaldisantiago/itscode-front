import { apiFetch } from '../fetch.js';

const AUTH_URLS = {
    REGISTER: '/User',
    LOGIN: '/Session'
};


export async function registerUser(formData) {
    const config = {
        method: 'POST',
        body: formData
    };
    return apiFetch(AUTH_URLS.REGISTER, config);
}


export async function loginUser(username, password) {
    const loginData = {
        userName: username,
        password: password
    };
    const config = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginData)
    };
    return apiFetch(AUTH_URLS.LOGIN, config);
}