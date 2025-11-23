// js/Controller/profileController.js

import { PostRepository } from '../repository/postRepository.js';
import { getUserById } from '../repository/userRepository.js'; 
import { UserPresentation } from '../presentation/profilePresentation.js';
import { PostPresentation } from '../presentation/postPresentation.js';
import { InteractionRepository, INTERACTION_TYPE } from '../repository/interactionRepository.js';
import { CommentRepository } from '../repository/commentRepository.js';

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
    const postPresentation = new PostPresentation(MY_POSTS_CONTAINER_SELECTOR, userSession);

    userPresentation.showLoading();
    postPresentation.showLoading();

    try {
        const postRepo = new PostRepository();
        const [userData, userPosts] = await Promise.all([
            getUserById(loggedUserId, loggedUserId),
            // ✅ CAMBIO: Pasamos 'true' para indicar que es nuestro propio perfil.
            // ✅ COHERENCIA: Mantenemos la lógica de que el primer parámetro determina
            // de quién son los posts que se piden.
            postRepo.getPostsForProfile(loggedUserId, loggedUserId, true)
        ]);

        userPresentation.renderProfile(userData, true); // true para mostrar el botón de editar
        postPresentation.renderPosts(userPosts);

        // ✅ CORRECCIÓN: Le devolvemos su propia lógica de interacciones.
        setupMyProfileInteractions(document.querySelector(MY_POSTS_CONTAINER_SELECTOR), loggedUserId, postRepo);
    } catch (error) {
        console.error("Error al cargar el perfil:", error);
        userPresentation.showError("No se pudo cargar la información del perfil.");
        postPresentation.renderPosts([]); // Muestra un mensaje de error o vacío
    }
}

/**
 * Configura los listeners para likes y comentarios SOLO para my-profile.html.
 */
function setupMyProfileInteractions(containerElement, loggedUserId, postRepo) {
    if (!containerElement || containerElement.dataset.interactionsInitialized) {
        return;
    }
    containerElement.dataset.interactionsInitialized = 'true';

    const interactionRepo = new InteractionRepository();
    const commentRepo = new CommentRepository();
    const postPresentation = new PostPresentation(MY_POSTS_CONTAINER_SELECTOR, getUserSession());

    containerElement.addEventListener('click', async (event) => {
        const button = event.target.closest('.like-btn, .dislike-btn, .load-more-comments-btn, .delete-post-btn');
        if (!button) return;

        event.preventDefault();
        const interactionType = button.classList.contains('like-btn') ? INTERACTION_TYPE.LIKE : INTERACTION_TYPE.DISLIKE;
        const postId = button.dataset.postId;
        const interactionId = button.dataset.interactionId;

        // --- Lógica para Likes/Dislikes ---
        if (button.classList.contains('like-btn') || button.classList.contains('dislike-btn')) {
            button.disabled = true;
            try {
                if (interactionId) {
                    // ✅ FIX: Pasamos el 'interactionType' para que el backend sepa qué hacer.
                    await interactionRepo.deleteInteraction(interactionId, loggedUserId, interactionType);
                } else {
                    await interactionRepo.createInteraction(parseInt(postId), loggedUserId, interactionType);
                }
                // ✅ FIX: Ajustamos la llamada para que coincida con la nueva ruta del backend.
                const updatedPost = await postRepo.getPostById(postId, loggedUserId, 1, 3); // La paginación es correcta
                postPresentation.updateSinglePost(updatedPost);
            } catch (error) {
                console.error('Error en la interacción:', error);
            } finally {
                button.disabled = false;
            }
        }

        // --- 🚀 NUEVA LÓGICA para "Ver más" comentarios ---
        if (button.classList.contains('load-more-comments-btn')) {
            const nextPage = parseInt(button.dataset.nextPage);
            const commentsPerPage = 3; // Debe coincidir con el tamaño de página que quieres cargar

            button.disabled = true;
            button.textContent = 'Cargando...';

            try {
                const newComments = await commentRepo.getCommentsByPostId(postId, nextPage, commentsPerPage);
                if (newComments.length > 0) {
                    postPresentation.appendComments(postId, newComments);
                    // Actualizamos el botón para la siguiente página
                    button.dataset.nextPage = nextPage + 1;
                }

                // ✅ FIX: Comprobamos el total de comentarios cargados contra el contador total.
                const postElement = containerElement.querySelector(`.post[data-post-id="${postId}"]`);
                const commentsList = postElement.querySelector('.comments-list');
                const totalCommentsCount = parseInt(postElement.querySelector('.comments-count').textContent);
                if (commentsList.children.length >= totalCommentsCount) {
                    button.style.display = 'none';
                }
            } catch (error) {
                console.error('Error al cargar más comentarios:', error);
                button.textContent = 'Error al cargar';
            } finally {
                if (button.style.display !== 'none') {
                    button.disabled = false;
                    button.textContent = 'Ver más comentarios';
                }
            }
        }

        // --- 🚀 NUEVA LÓGICA para Eliminar Post ---
        if (button.classList.contains('delete-post-btn')) {
            // Pedimos confirmación al usuario
            const userConfirmed = confirm("¿Estás seguro de que quieres eliminar esta publicación? Esta acción no se puede deshacer.");

            if (userConfirmed) {
                button.disabled = true;
                try {
                    await postRepo.deletePost(postId, loggedUserId);
                    // Si la eliminación fue exitosa, removemos el post del DOM
                    const postElement = containerElement.querySelector(`.post[data-post-id="${postId}"]`);
                    if (postElement) {
                        postElement.remove();
                    }
                } catch (error) {
                    console.error('Error al eliminar el post:', error);
                    alert("No se pudo eliminar la publicación. Inténtalo de nuevo.");
                    button.disabled = false;
                }
            }
        }
    });

    containerElement.addEventListener('submit', async (event) => {
        if (event.target.classList.contains('comment-form')) {
            event.preventDefault(); 

            const form = event.target;
            const postId = parseInt(form.dataset.postId);
            const contentInput = form.querySelector('textarea[name="commentContent"]');
            const content = contentInput.value.trim();

            if (!content) return;
            
            form.querySelector('button[type="submit"]').disabled = true;

            try {
                await commentRepo.createComment(postId, loggedUserId, content);
                
                // ✅ FIX: En lugar de recargar todo el post, actualizamos solo la sección de comentarios.
                const commentsPerPage = 3;
                const updatedComments = await commentRepo.getCommentsByPostId(postId, 1, commentsPerPage);

                // Buscamos el post en el DOM para actualizar solo sus comentarios.
                // ✅ FIX: Corregimos el selector que estaba mal escrito ('post-card' en lugar de 'post').
                const postElement = containerElement.querySelector(`.post[data-post-id="${postId}"]`); 
                // Obtenemos el contador de comentarios del post para incrementarlo.
                const commentsCountElement = postElement.querySelector('.comments-count');
                
                // Llamamos al nuevo método de la presentación para que actualice el DOM.
                postPresentation.updateCommentsSection(postElement, updatedComments, parseInt(commentsCountElement.textContent || '0') + 1);
                contentInput.value = '';
            } catch (error) {
                console.error('Fallo al crear y refrescar comentario:', error);
            } finally {
                form.querySelector('button[type="submit"]').disabled = false;
            }
        }
    });
}
