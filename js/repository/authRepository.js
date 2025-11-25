// js/repository/authRepository.js

import { apiFetch } from '../fetch.js'; 

const AUTH_URLS = {
    REGISTER: '/User',
    LOGIN: '/Session' 
};


export async function registerUser(formData) {
    const config = {
        method: 'POST',
        body: formData // Enviamos el objeto FormData directamente
        // NO establecemos 'Content-Type', el navegador lo hará por nosotros.
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