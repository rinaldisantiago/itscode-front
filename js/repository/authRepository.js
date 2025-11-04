// js/repository/authRepository.js

import { apiFetch } from '../fetch.js'; 

const AUTH_URLS = {
    REGISTER: '/User',
    LOGIN: '/User/Login' 
};

/**
 * Realiza la llamada a la API para registrar un nuevo usuario.
 * CAMBIO CLAVE: Esta versión está preparada para enviar FormData con archivos.
 */
export async function registerUser(formData) {
    const config = {
        method: 'POST',
        body: formData // Enviamos el objeto FormData directamente
        // NO establecemos 'Content-Type', el navegador lo hará por nosotros.
    };
    return apiFetch(AUTH_URLS.REGISTER, config);
}

/**
 * Realiza la llamada a la API para iniciar sesión.
 * (Esta función no cambia)
 */
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