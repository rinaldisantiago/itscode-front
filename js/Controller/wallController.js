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

function updateButtonState(currentButton, newInteractionId) {
    const postArticle = currentButton.closest('article.post');
    if (!postArticle) return;

    const isLike = currentButton.classList.contains('like-btn');
    const oppositeButton = postArticle.querySelector(isLike ? '.dislike-btn' : '.like-btn');
    const likeButton = postArticle.querySelector('.like-btn');
    const dislikeButton = postArticle.querySelector('.dislike-btn');
    
    let likesCount = parseInt(likeButton.dataset.count);
    let dislikesCount = parseInt(dislikeButton.dataset.count);

    if (newInteractionId) {
        if (isLike) {
            likesCount++;
            if (oppositeButton.dataset.interactionId) dislikesCount = Math.max(0, dislikesCount - 1);
        } else {
            dislikesCount++;
            if (oppositeButton.dataset.interactionId) likesCount = Math.max(0, likesCount - 1);
        }
        oppositeButton.classList.remove('active');
        oppositeButton.dataset.interactionId = '';
        currentButton.classList.add('active');
        currentButton.dataset.interactionId = newInteractionId;
    } else {
        if (isLike) likesCount = Math.max(0, likesCount - 1);
        else dislikesCount = Math.max(0, dislikesCount - 1);
        currentButton.classList.remove('active');
        currentButton.dataset.interactionId = '';
    }

    likeButton.querySelector('span').textContent = likesCount;
    likeButton.dataset.count = likesCount;
    dislikeButton.querySelector('span').textContent = dislikesCount;
    dislikeButton.dataset.count = dislikesCount;
}

function setupWallInteractions(containerElement, loggedUserId, postRepo) {
    if (containerElement.dataset.interactionsInitialized) return;
    containerElement.dataset.interactionsInitialized = 'true';

    const interactionRepo = new InteractionRepository();
    const commentRepo = new CommentRepository();
    
    containerElement.addEventListener('click', async (event) => {
        const button = event.target.closest('.like-btn, .dislike-btn');
        if (!button) return;

        event.preventDefault();
        const interactionType = button.classList.contains('like-btn') ? INTERACTION_TYPE.LIKE : INTERACTION_TYPE.DISLIKE;
        const postId = button.dataset.postId;
        const interactionId = button.dataset.interactionId;
        
        button.disabled = true;
        
        try {
            if (interactionId) {
                await interactionRepo.deleteInteraction(interactionId);
                updateButtonState(button, null);
            } else {
                const response = await interactionRepo.createInteraction(parseInt(postId), loggedUserId, interactionType);
                if (response && response.interactionId) {
                    updateButtonState(button, response.interactionId);
                }
            }
        } catch (error) {
            console.error('Error en la interacción:', error);
        } finally {
            setTimeout(() => { button.disabled = false; }, 300);
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
                contentInput.value = ''; 
                contentInput.style.height = 'auto'; // Reset height

                // 2. Obtener el post actualizado del backend
                const updatedPost = await postRepo.getPostById(postId, loggedUserId);

                // 3. Re-renderizar solo ese post con la nueva información
                if (updatedPost && postPresentation) {
                    postPresentation.updateSinglePost(updatedPost);
                }
                
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