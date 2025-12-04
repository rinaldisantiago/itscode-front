import { InteractionRepository, INTERACTION_TYPE } from '../repository/interactionRepository.js';
import { CommentRepository } from '../repository/commentRepository.js';

export function setupPostInteractions(containerElement, loggedUserId, postRepo, postPresentation, config = {}) {
    if (!containerElement || containerElement.dataset.interactionsInitialized) {
        return;
    }
    containerElement.dataset.interactionsInitialized = 'true';

    const interactionRepo = new InteractionRepository();
    const commentRepo = new CommentRepository();

    containerElement.addEventListener('click', async (event) => {
        const button = event.target.closest('.like-btn, .dislike-btn, .load-more-comments-btn, .delete-post-btn, .delete-comment-btn');
        if (!button) return;

        const postId = button.dataset.postId;

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
            } finally {
                button.disabled = false;
            }
        }

        else if (button.classList.contains('load-more-comments-btn')) {
            event.preventDefault();
            const nextPage = parseInt(button.dataset.nextPage);
            const commentsPerPage = 3;

            button.disabled = true;
            button.textContent = 'Cargando...';
            try {
                const postElement = containerElement.querySelector(`.post[data-post-id="${postId}"]`);
                const newComments = await commentRepo.getCommentsByPostId(postId, nextPage, commentsPerPage);
                if (newComments.length > 0) {
                    postPresentation.appendComments(postElement, newComments);
                    button.dataset.nextPage = nextPage + 1;
                }

                
                const commentsList = postElement.querySelector('.comments-list');
                const totalCommentsCount = parseInt(postElement.querySelector('.comments-count').textContent);
                if (commentsList.children.length >= totalCommentsCount) {
                    button.style.display = 'none';
                }
            } finally {
                if (button.style.display !== 'none') {
                    button.disabled = false;
                    button.textContent = 'Ver más comentarios';
                }
            }
        }
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
                        button.disabled = false;
                    }
                }
            });
        }
        else if (button.classList.contains('delete-comment-btn')) {
            event.preventDefault();
            const commentId = button.dataset.commentId;

            Swal.fire({
                title: '¿Eliminar este comentario?',
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
                        await commentRepo.deleteComment(commentId, postId, loggedUserId);
                        const updatedPost = await postRepo.getPostById(postId, loggedUserId, 1, 3);
                        postPresentation.updateSinglePost(updatedPost);
                    } finally {
                        // El botón se eliminará al refrescar el post, no es necesario re-habilitarlo.
                    }
                }
            });
        }
    });

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
            } finally {
                submitButton.disabled = false;
            }
        }
    });
}