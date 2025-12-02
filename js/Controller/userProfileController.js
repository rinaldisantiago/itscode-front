import { UserPresentation } from '../presentation/profilePresentation.js';
import { PostPresentation } from '../presentation/postPresentation.js';
import { getUserById } from '../repository/userRepository.js';
import { FollowingRepository } from '../repository/followingRepository.js';
import { PostRepository } from '../repository/postRepository.js';
import { setupPostInteractions } from './postInteractionsController.js';

const MY_PROFILE_CONTAINER_SELECTOR = '#infoUserContainer';
const VISITED_PROFILE_CONTAINER_SELECTOR = '#infoUserVisit';
const MY_POSTS_CONTAINER_SELECTOR = '#myPostsContainer';
const USER_POSTS_CONTAINER_SELECTOR = '#userPosts';
const POSTS_PER_PAGE = 10;

// --- Variables de estado para el scroll infinito ---
let currentPage = 1;
let isLoading = false;
let hasMorePosts = true;
let postPresentation;


const getUserSession = () => {
    const sessionData = localStorage.getItem('userSession');
    if (!sessionData) return null;
    const rawUser = JSON.parse(sessionData);
    // ✅ CORRECCIÓN: Normalizamos el objeto de sesión para evitar problemas de mayúsculas/minúsculas.
    return {
        id: rawUser.Id || rawUser.id,
        userName: rawUser.UserName || rawUser.userName,
        urlAvatar: rawUser.UrlAvatar || rawUser.urlAvatar
    };
};


async function fetchAndRenderVisitedProfilePosts(visitedUserId, loggedUserId, postRepository) {
    if (isLoading || !hasMorePosts) return;

    isLoading = true;
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) loadingIndicator.style.display = 'flex';

    try {
        // Obtenemos la lista de posts para el perfil, ahora con paginación
        // 🚀 SOLUCIÓN FINAL:
        // Para obtener los posts de OTRO usuario, le pasamos su ID tanto en 'idUserConsultado' como en 'idUserLogger',
        // y marcamos 'isMyPosts' como 'true'. Esto le dice al backend de forma inequívoca:
        // "Dame los posts propios ('isMyPosts: true') del usuario 'visitedUserId'".
        const postList = await postRepository.getPostsForProfile(visitedUserId, visitedUserId, true, currentPage, POSTS_PER_PAGE);

        if (postList && postList.length > 0) {
            // "Hidratamos" los posts para obtener toda la información (likes, etc.)
            const userPosts = await Promise.all(
                postList.map(p => postRepository.getPostById(p.id, loggedUserId))
            );

            postPresentation.appendPosts(userPosts);
            currentPage++;

            if (userPosts.length < POSTS_PER_PAGE) {
                hasMorePosts = false;
            }
        } else {
            hasMorePosts = false;
        }
    } catch (error) {
        console.error("Error al cargar más publicaciones del perfil visitado:", error);
        postPresentation.showError('No se pudieron cargar más publicaciones.');
    } finally {
        isLoading = false;
        if (loadingIndicator) loadingIndicator.style.display = 'none';
    }
}

/**
 * 🚀 Manejador del evento de scroll para la página de perfil de otro usuario.
 */
const handleVisitedProfileInfiniteScroll = async () => {
    const userSession = getUserSession();
    if (!userSession) return;

    const urlParams = new URLSearchParams(window.location.search);
    const visitedUserId = urlParams.get('id');
    if (!visitedUserId) return;

    const postRepository = new PostRepository();
    const endOfPage = window.innerHeight + window.scrollY >= document.body.offsetHeight - 300;

    if (endOfPage) {
        await fetchAndRenderVisitedProfilePosts(visitedUserId, userSession.id, postRepository);
    }
};

export async function loadVisitedProfileView() {
    const userSession = getUserSession();
    if (!userSession || !userSession.id) {
        window.location.href = '../index.html';
        return;
    }

    const loggedUserId = userSession.id; // Ahora podemos usar 'id' de forma segura

    const urlParams = new URLSearchParams(window.location.search);
    const visitedUserId = urlParams.get('id');

    if (!visitedUserId) {
        console.error("No se proporcionó un ID de usuario en la URL.");
        // Opcional: redirigir a una página de error o al muro
        window.location.href = 'wall.html';
        return;
    }

    if (parseInt(visitedUserId) === loggedUserId) {
        window.location.href = 'my-profile.html';
        return;
    }

    // --- Reseteo de estado para el scroll infinito ---
    currentPage = 1;
    isLoading = false;
    hasMorePosts = true;
    window.removeEventListener('scroll', handleVisitedProfileInfiniteScroll); // Limpiamos listener previo

    const userPresentation = new UserPresentation(VISITED_PROFILE_CONTAINER_SELECTOR);
    userPresentation.showLoading();

    // Instanciamos el repositorio de Following
    const postRepo = new PostRepository();

    try {
        // 1. Modelo: Obtenemos los datos del perfil del usuario visitado
        const userData = await getUserById(visitedUserId, loggedUserId);

        // 2. Vista: Renderizamos el perfil con los datos obtenidos
        userPresentation.renderProfile(userData, false); // false indica que no es el perfil propio

        // 3. Controlador: Añadimos el listener para el botón de seguir/dejar de seguir
        const profileContainer = document.querySelector(VISITED_PROFILE_CONTAINER_SELECTOR);

        // ✅ CORRECCIÓN: Nos aseguramos de que el listener se añada solo una vez.
        if (profileContainer && !profileContainer.dataset.listenerAttached) {
            profileContainer.dataset.listenerAttached = 'true'; // Marcamos que el listener fue añadido

            profileContainer.addEventListener('click', handleFollowClick);
        }

        // 4. Cargar publicaciones si se sigue al usuario
        const postsContainer = document.querySelector(USER_POSTS_CONTAINER_SELECTOR);
        const postsTitle = document.querySelector('.user-profile-post h2');

        if (userData.isFollowing) {
            if (postsTitle) postsTitle.style.display = 'block';
            postPresentation = new PostPresentation(USER_POSTS_CONTAINER_SELECTOR, userSession);
            postPresentation.clear();
            postPresentation.showLoading();

            // Cargamos la primera página de posts
            await fetchAndRenderVisitedProfilePosts(visitedUserId, loggedUserId, postRepo);

            // Añadimos el listener para el scroll y las interacciones
            setupPostInteractions(postsContainer, loggedUserId, postRepo, postPresentation);
            window.addEventListener('scroll', handleVisitedProfileInfiniteScroll);

        } else {
            // Si no lo sigue, ocultamos el título y mostramos un mensaje
            if (postsTitle) postsTitle.style.display = 'none';
            if (postsContainer) {
                postsContainer.innerHTML = `<p class="empty-message">Debes seguir a este usuario para ver sus publicaciones.</p>`;
            }
        }

    } catch (error) {
        console.error("Error al cargar el perfil del usuario visitado:", error);
        userPresentation.showError("No se pudo cargar el perfil de este usuario.");
    }
}

async function handleFollowClick(event) {
    const button = event.target.closest('.follow, .unfollow');
    if (!button) return;

    // ✅ CORRECCIÓN: Usamos 'Id' (mayúscula) para coincidir con el objeto de la sesión.
    const loggedUserId = getUserSession()?.id; // Ahora podemos usar 'id' de forma segura
    const userIdToFollow = button.dataset.userId;
    const isCurrentlyFollowing = button.dataset.isFollowing === 'true';

    const followingRepo = new FollowingRepository();
    const postRepo = new PostRepository();
    const userPresentation = new UserPresentation(VISITED_PROFILE_CONTAINER_SELECTOR);

    button.disabled = true;
    const action = isCurrentlyFollowing ? followingRepo.unfollowUser : followingRepo.followUser;

    try {
        // 1. Ejecutar la acción de seguir/dejar de seguir
        await action(loggedUserId, userIdToFollow);
        // 2. Actualizar el botón visualmente
        userPresentation.updateFollowButton(button, !isCurrentlyFollowing);

        // 3. Recargar la sección de posts dinámicamente
        const postsContainer = document.querySelector(USER_POSTS_CONTAINER_SELECTOR);
        if (!isCurrentlyFollowing) {
            // Si acabamos de seguirlo, cargamos sus posts
            postPresentation = new PostPresentation(USER_POSTS_CONTAINER_SELECTOR, getUserSession());
            postPresentation.clear();
            postPresentation.showLoading();

            // Reseteamos y cargamos la primera página
            currentPage = 1;
            hasMorePosts = true;
            await fetchAndRenderVisitedProfilePosts(userIdToFollow, loggedUserId, postRepo);

            // Añadimos listeners
            setupPostInteractions(postsContainer, loggedUserId, postRepo, postPresentation);
            const postsTitle = document.querySelector('.user-profile-post h2');
            if (postsTitle) postsTitle.style.display = 'block';
        } else {
            // Si dejamos de seguirlo, limpiamos la sección de posts
            postsContainer.innerHTML = `<p class="empty-message">Debes seguir a este usuario para ver sus publicaciones.</p>`;
            const postsTitle = document.querySelector('.user-profile-post h2');
            if (postsTitle) postsTitle.style.display = 'none';
        }
    } catch (error) {
        console.error("Error al seguir/dejar de seguir:", error);
    } finally {
        button.disabled = false;
    }
}