// js/Controller/wallController.js

import { PostRepository, buildFullUrl } from '../repository/postRepository.js';
import { PostPresentation } from '../presentation/postPresentation.js';
import { setupPostInteractions } from './postInteractionsController.js'; // ✅ 1. IMPORTAMOS el nuevo controlador

const POSTS_CONTAINER_SELECTOR = 'main.post-section > section:last-of-type';
const API_BASE_URL = 'http://localhost:5052';

//  Semaforo para asegurar que los listeners se adjuntan una sola vez
let wallInteractionsInitialized = false;
// Instancia de PostPresentation para que sea accesible en las funciones de eventos
let postPresentation;

const getUserSession = () => {
    const sessionData = localStorage.getItem('userSession');
    if (!sessionData) return null;
    const rawUser = JSON.parse(sessionData);
    return {
        id: rawUser.Id || rawUser.id,
        userName: rawUser.UserName || rawUser.userName,
        urlAvatar: rawUser.UrlAvatar || rawUser.urlAvatar
    };
};

const loadUserData = (userSession) => {
    if (!userSession) return;
    const avatarImg = document.getElementById('user-avatar-redirect');
    if (avatarImg) {
        const avatarPath = userSession.urlAvatar;
        avatarImg.src = buildFullUrl(avatarPath);
    }
};

// --- FUNCIÓN PRINCIPAL DE LA VISTA DEL MURO ---
export async function loadWallView() {
    const userSession = getUserSession();
    if (!userSession || !userSession.id) {
        console.error("No hay sesión de usuario válida. Redirigiendo al login.");
        window.location.href = '../index.html';
        return;
    }
    const userId = userSession.id;
    loadUserData(userSession);

    const postRepository = new PostRepository();
    // Instanciamos PostPresentation y lo asignamos a la variable global
    postPresentation = new PostPresentation(POSTS_CONTAINER_SELECTOR, userSession); 
    const wallContainer = postPresentation.container;
    if (!wallContainer) { return; }

   postPresentation.showLoading(); 
    try {
        // ✅ SOLUCIÓN: Aplicamos el patrón de "hidratación" para asegurar que todos los posts
        // tengan la información de interacción completa desde el principio.
        const postList = await postRepository.getAllWallPosts(userId, 1, 10);
        const posts = await Promise.all(
            postList.map(p => postRepository.getPostById(p.id, userId))
        );
        postPresentation.renderPosts(posts);

        // ✅ 2. USAMOS el controlador centralizado
        setupPostInteractions(wallContainer, userId, postRepository, postPresentation);
    } catch (error) {
        console.error("Error al cargar el muro:", error);
        wallContainer.innerHTML = '<p class="error-message">Error al cargar las publicaciones.</p>';
    }
}