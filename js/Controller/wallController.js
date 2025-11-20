// js/Controller/wallController.js

import { PostRepository, buildFullUrl } from '../repository/postRepository.js';
import { PostPresentation } from '../presentation/postPresentation.js'; 
import { InteractionRepository, INTERACTION_TYPE } from '../repository/interactionRepository.js';
import { CommentRepository } from '../repository/commentRepository.js';

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

function setupWallInteractions(containerElement, loggedUserId, postRepo) {
    if (containerElement.dataset.interactionsInitialized) return;
    containerElement.dataset.interactionsInitialized = 'true';

    const interactionRepo = new InteractionRepository();
    const commentRepo = new CommentRepository();
    
    containerElement.addEventListener('click', async (event) => {
        const button = event.target.closest('.like-btn, .dislike-btn, .load-more-comments-btn');
        if (!button) return;

        event.preventDefault();
        const interactionType = button.classList.contains('like-btn') ? INTERACTION_TYPE.LIKE : INTERACTION_TYPE.DISLIKE;
        const postId = button.dataset.postId;
        const interactionId = button.dataset.interactionId;
        
        button.disabled = true;
        
        try {
            // --- Lógica para Likes/Dislikes (UNIFICADA) ---
            if (button.classList.contains('like-btn') || button.classList.contains('dislike-btn')) {
                if (interactionId) {
                    await interactionRepo.deleteInteraction(interactionId, loggedUserId, interactionType);
                } else {
                    await interactionRepo.createInteraction(parseInt(postId), loggedUserId, interactionType);
                }
                const updatedPost = await postRepo.getPostById(postId, loggedUserId, 1, 3);
                postPresentation.updateSinglePost(updatedPost);
            }

            // --- Lógica para "Ver más" comentarios (UNIFICADA) ---
            if (button.classList.contains('load-more-comments-btn')) {
                const nextPage = parseInt(button.dataset.nextPage);
                const commentsPerPage = 3;

                button.textContent = 'Cargando...';
                const newComments = await commentRepo.getCommentsByPostId(postId, nextPage, commentsPerPage);
                
                if (newComments.length > 0) {
                    postPresentation.appendComments(postId, newComments);
                    button.dataset.nextPage = nextPage + 1;
                }

                // ✅ FIX: Comprobamos el total de comentarios cargados contra el contador total.
                const postElement = containerElement.querySelector(`.post[data-post-id="${postId}"]`);
                const commentsList = postElement.querySelector('.comments-list');
                const totalCommentsCount = parseInt(postElement.querySelector('.comments-count').textContent);
                if (commentsList.children.length >= totalCommentsCount) {
                    button.style.display = 'none';
                }
                if (button.style.display !== 'none') {
                    button.textContent = 'Ver más comentarios';
                }
            }
        } catch (error) {
            console.error('Error en la interacción:', error);
        } finally {
            if (button.style.display !== 'none') {
                button.disabled = false;
            }
        }
    });

    containerElement.addEventListener('submit', async (event) => {
        if (event.target.classList.contains('comment-form')) {
            event.preventDefault(); 

            const form = event.target;
            const postId = parseInt(form.dataset.postId);
            const contentInput = form.querySelector('textarea[name="commentContent"]');
            const content = contentInput ? contentInput.value.trim() : '';
            const submitButton = form.querySelector('button[type="submit"]');

            if (!content) return;
            
            submitButton.disabled = true;

            try {
                // 1. Crear el comentario
                await commentRepo.createComment(postId, loggedUserId, content);

                // 2. Actualizar solo la sección de comentarios
                const commentsPerPage = 3;
                const updatedComments = await commentRepo.getCommentsByPostId(postId, 1, commentsPerPage);

                const postElement = containerElement.querySelector(`.post[data-post-id="${postId}"]`);
                const commentsCountElement = postElement.querySelector('.comments-count');
                
                postPresentation.updateCommentsSection(postElement, updatedComments, parseInt(commentsCountElement.textContent || '0') + 1);
                contentInput.value = '';
                
            } catch (error) {
                console.error('Fallo al crear y refrescar comentario:', error);
            } finally {
                submitButton.disabled = false;
            }
        }
    });
}

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
        const posts = await postRepository.getAllWallPosts(userId, 1, 10);
        postPresentation.renderPosts(posts);

        // Adjuntamos los listeners de interacción (pasando el repositorio)
        setupWallInteractions(wallContainer, userId, postRepository);
    } catch (error) {
        console.error("Error al cargar el muro:", error);
        wallContainer.innerHTML = '<p class="error-message">Error al cargar las publicaciones.</p>';
    }
}