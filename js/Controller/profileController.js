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
        const button = event.target.closest('.like-btn, .dislike-btn, .load-more-comments-btn');
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
                    await interactionRepo.deleteInteraction(interactionId);
                } else {
                    await interactionRepo.createInteraction(parseInt(postId), loggedUserId, interactionType);
                }
                const updatedPost = await postRepo.getPostById(postId, loggedUserId, 1, 10);
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
                // Ocultamos el botón si ya no hay más comentarios por cargar
                if (newComments.length < commentsPerPage) {
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
                const postElement = containerElement.querySelector(`.post-card[data-post-id="${postId}"]`);
                // Obtenemos el contador de comentarios del post para incrementarlo.
                const commentsCountElement = postElement.querySelector('.comments-count');
                
                // Llamamos al nuevo método de la presentación para que actualice el DOM.
                postPresentation.updateCommentsSection(postElement, updatedComments, parseInt(commentsCountElement.textContent) + 1);
                contentInput.value = '';
            } catch (error) {
                console.error('Fallo al crear y refrescar comentario:', error);
            } finally {
                form.querySelector('button[type="submit"]').disabled = false;
            }
        }
    });
}
