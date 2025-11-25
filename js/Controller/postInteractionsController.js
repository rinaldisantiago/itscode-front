// js/Controller/postInteractionsController.js

import { InteractionRepository, INTERACTION_TYPE } from '../repository/interactionRepository.js';
import { CommentRepository } from '../repository/commentRepository.js';

/**
 * Controlador centralizado para todas las interacciones de los posts.
 * @param {HTMLElement} containerElement - El contenedor de los posts.
 * @param {number} loggedUserId - El ID del usuario logueado.
 * @param {PostRepository} postRepo - Instancia del repositorio de posts.
 * @param {PostPresentation} postPresentation - Instancia de la presentación de posts.
 * @param {object} config - Opciones de configuración.
 * @param {boolean} [config.handleDelete=false] - Si es true, manejará el borrado de posts.
 */
export function setupPostInteractions(containerElement, loggedUserId, postRepo, postPresentation, config = {}) {
    if (!containerElement || containerElement.dataset.interactionsInitialized) {
        return;
    }
    containerElement.dataset.interactionsInitialized = 'true';

    const interactionRepo = new InteractionRepository();
    const commentRepo = new CommentRepository();

    // --- LISTENER PRINCIPAL PARA CLICS ---
    containerElement.addEventListener('click', async (event) => {
        const button = event.target.closest('.like-btn, .dislike-btn, .load-more-comments-btn, .delete-post-btn');
        if (!button) return;

        const postId = button.dataset.postId;

        // --- Lógica para Likes/Dislikes ---
        if (button.classList.contains('like-btn') || button.classList.contains('dislike-btn')) {
            event.preventDefault();
            const interactionType = button.classList.contains('like-btn') ? INTERACTION_TYPE.LIKE : INTERACTION_TYPE.DISLIKE;
            const interactionId = button.dataset.interactionId;
            
            button.disabled = true;
            try {
                if (interactionId) {
                    await interactionRepo.deleteInteraction(interactionId, loggedUserId, interactionType);
                } else {
                    await interactionRepo.createInteraction(parseInt(postId), loggedUserId, interactionType);
                }
                const updatedPost = await postRepo.getPostById(postId, loggedUserId, 1, 3);
                postPresentation.updateSinglePost(updatedPost);
            } catch (error) {
                console.error('Error en la interacción:', error);
            } finally {
                button.disabled = false;
            }
        }

        // --- Lógica para "Ver más" comentarios ---
        else if (button.classList.contains('load-more-comments-btn')) {
            event.preventDefault();
            const nextPage = parseInt(button.dataset.nextPage);
            const commentsPerPage = 3;

            button.disabled = true;
            button.textContent = 'Cargando...';
            try {
                const newComments = await commentRepo.getCommentsByPostId(postId, nextPage, commentsPerPage);
                if (newComments.length > 0) {
                    postPresentation.appendComments(postId, newComments);
                    button.dataset.nextPage = nextPage + 1;
                }

                const postElement = containerElement.querySelector(`.post[data-post-id="${postId}"]`);
                const commentsList = postElement.querySelector('.comments-list');
                const totalCommentsCount = parseInt(postElement.querySelector('.comments-count').textContent);
                if (commentsList.children.length >= totalCommentsCount) {
                    button.style.display = 'none';
                }
            } catch (error) {
                console.error('Error al cargar más comentarios:', error);
            } finally {
                if (button.style.display !== 'none') {
                    button.disabled = false;
                    button.textContent = 'Ver más comentarios';
                }
            }
        }

        // --- Lógica para Eliminar Post (solo si está configurado) ---
        else if (config.handleDelete && button.classList.contains('delete-post-btn')) {
            event.preventDefault();
            Swal.fire({
                title: '¿Estás seguro?',
                text: "Esta acción no se puede deshacer.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Sí, ¡eliminar!',
                cancelButtonText: 'Cancelar'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    button.disabled = true;
                    try {
                        await postRepo.deletePost(postId, loggedUserId);
                        const postElement = containerElement.querySelector(`.post[data-post-id="${postId}"]`);
                        if (postElement) postElement.remove();
                        Swal.fire('¡Eliminado!', 'La publicación ha sido eliminada.', 'success');
                    } catch (error) {
                        console.error('Error al eliminar el post:', error);
                        button.disabled = false;
                    }
                }
            });
        }
    });

    // --- LISTENER PRINCIPAL PARA SUBMIT DE COMENTARIOS ---
    containerElement.addEventListener('submit', async (event) => {
        if (event.target.classList.contains('comment-form')) {
            event.preventDefault();

            const form = event.target;
            const postId = parseInt(form.dataset.postId);
            const contentInput = form.querySelector('textarea[name="commentContent"]');
            const content = contentInput.value.trim();
            const submitButton = form.querySelector('button[type="submit"]');

            if (!content) return;
            submitButton.disabled = true;

            try {
                await commentRepo.createComment(postId, loggedUserId, content);
                const updatedPost = await postRepo.getPostById(postId, loggedUserId, 1, 3);
                postPresentation.updateSinglePost(updatedPost);
                contentInput.value = '';
            } catch (error) {
                console.error('Fallo al crear y refrescar comentario:', error);
            } finally {
                submitButton.disabled = false;
            }
        }
    });
}