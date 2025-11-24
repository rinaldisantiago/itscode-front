// js/Controller/profileController.js

import { PostRepository } from '../repository/postRepository.js';
import { getUserById } from '../repository/userRepository.js';
import { UserPresentation } from '../presentation/profilePresentation.js';
import { PostPresentation } from '../presentation/postPresentation.js';
import { setupPostInteractions } from './postInteractionsController.js'; // ✅ 1. IMPORTAMOS el nuevo controlador

const MY_PROFILE_CONTAINER_SELECTOR = '#infoUserContainer';
const MY_POSTS_CONTAINER_SELECTOR = '#myPostsContainer';

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

export async function loadProfileView() {
    const userSession = getUserSession();
    if (!userSession) { 
        window.location.href = '../index.html';
        return; 
    }
    const loggedUserId = userSession.id;

    const userPresentation = new UserPresentation(MY_PROFILE_CONTAINER_SELECTOR);
    // ✅ SOLUCIÓN: Le decimos a la presentación que estamos en la página de "Mi Perfil".
    const postPresentation = new PostPresentation(MY_POSTS_CONTAINER_SELECTOR, userSession, { isMyProfilePage: true });

    userPresentation.showLoading();
    postPresentation.showLoading();

    try {
        const postRepo = new PostRepository();
        // Obtenemos primero los datos del usuario y la lista básica de posts.
        const [userData, postList] = await Promise.all([
            getUserById(loggedUserId, loggedUserId),
            postRepo.getPostsForProfile(loggedUserId, loggedUserId, true)
        ]);

        // ✅ SOLUCIÓN: "Hidratamos" la lista de posts para asegurar que las interacciones estén completas.
        const userPosts = await Promise.all(
            postList.map(p => postRepo.getPostById(p.id, loggedUserId))
        );

        userPresentation.renderProfile(userData, true); // true para mostrar el botón de editar
        postPresentation.renderPosts(userPosts);

        // ✅ 2. USAMOS el controlador centralizado
        const postsContainer = document.querySelector(MY_POSTS_CONTAINER_SELECTOR);
        setupPostInteractions(postsContainer, loggedUserId, postRepo, postPresentation, { handleDelete: true });
    } catch (error) {
        console.error("Error al cargar el perfil:", error);
        userPresentation.showError("No se pudo cargar la información del perfil.");
        postPresentation.renderPosts([]); // Muestra un mensaje de error o vacío
    }
}
