// Importamos la función para hacer llamadas a la API
import { apiFetch } from './fetch.js';

const usersCount = document.getElementById('users_online');

// ✅ TAREA COMPLETADA: Llamamos al backend para obtener el conteo de usuarios.

const fetchConnectedUsers = async () => {
    // Si el elemento no existe en la página actual, no hacemos nada.
    if (!usersCount) return;

    try {
        // Hacemos la llamada al nuevo endpoint GET /Session
        const response = await apiFetch('/Session');
        if (response && typeof response.connectedUsers !== 'undefined') {
            usersCount.innerText = response.connectedUsers;
        }
    } catch (error) {
        console.error("Error al obtener usuarios conectados:", error);
        // Opcional: mostrar un valor por defecto en caso de error
        usersCount.innerText = '1';
    }
};

// Llamamos a la función una vez al cargar la página
fetchConnectedUsers();
// Y luego la ejecutamos cada 5 segundos para mantener el número actualizado.
setInterval(fetchConnectedUsers, 5000);