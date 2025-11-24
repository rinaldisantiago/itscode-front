
// 👇 CAMBIO: Importamos la función directamente, no la clase
import { UserPresentation } from '../presentation/profilePresentation.js';
import { PostPresentation } from '../presentation/postPresentation.js';
import { getUserById } from '../repository/userRepository.js';
import { FollowingRepository } from '../repository/followingRepository.js';
import { PostRepository } from '../repository/postRepository.js';
import { setupPostInteractions } from './postInteractionsController.js'; // ✅ 1. IMPORTAMOS el nuevo controlador

const MY_PROFILE_CONTAINER_SELECTOR = '#infoUserContainer';
const VISITED_PROFILE_CONTAINER_SELECTOR = '#infoUserVisit';
const MY_POSTS_CONTAINER_SELECTOR = '#myPostsContainer';
const USER_POSTS_CONTAINER_SELECTOR = '#userPosts';
 
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
            const postPresentation = new PostPresentation(USER_POSTS_CONTAINER_SELECTOR, userSession);
            postPresentation.showLoading();

            // ✅ CORRECCIÓN: Llamamos directamente al repositorio y a la presentación.
            // El primer parámetro es quién pide, el segundo es de quién son los posts.
            // Pasamos el ID del usuario visitado en el segundo parámetro.
            // ✅ SOLUCIÓN ESTRATÉGICA:
            // 1. Obtenemos la lista de posts del usuario visitado. Esta llamada trae los posts correctos pero sin nuestras interacciones.
            const postList = await postRepo.getPostsForProfile(visitedUserId, visitedUserId, true);
            // 2. "Hidratamos" cada post pidiendo su versión completa, que SÍ incluye nuestra interacción.
            const userPosts = await Promise.all(
                postList.map(p => postRepo.getPostById(p.id, loggedUserId))
            );
            postPresentation.renderPosts(userPosts);

            // ✅ 2. USAMOS el controlador centralizado
            setupPostInteractions(postsContainer, loggedUserId, postRepo, postPresentation);

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
            const postPresentation = new PostPresentation(USER_POSTS_CONTAINER_SELECTOR, getUserSession());
            // ✅ SOLUCIÓN: Aplicamos la misma estrategia aquí para asegurar que los posts cargados
            // después de seguir a alguien también tengan la información de interacción correcta.
            const postList = await postRepo.getPostsForProfile(userIdToFollow, userIdToFollow, true);
            const userPosts = await Promise.all(
                postList.map(p => postRepo.getPostById(p.id, loggedUserId))
            );
            postPresentation.renderPosts(userPosts);
            // Re-inicializamos las interacciones para los nuevos posts
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