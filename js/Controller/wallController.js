// js/Controller/wallController.js

import { PostRepository, buildFullUrl } from '../repository/postRepository.js';
import { PostPresentation } from '../presentation/postPresentation.js'; 
import { InteractionRepository, INTERACTION_TYPE } from '../repository/interactionRepository.js';
import { CommentRepository } from '../repository/commentRepository.js';

const POSTS_CONTAINER_SELECTOR = 'main.post-section > section:last-of-type';
const API_BASE_URL = 'http://localhost:5052';

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

// =======================================================
// --- 🚀 LÓGICA DE INTERACCIÓN (RESTAURADA) ---
// =======================================================

function updateButtonState(currentButton, newInteractionId) {
    const postArticle = currentButton.closest('article.post');
    if (!postArticle) return;

    const isLike = currentButton.classList.contains('like-btn');
    const oppositeButton = postArticle.querySelector(isLike ? '.dislike-btn' : '.like-btn');
    const likeButton = postArticle.querySelector('.like-btn');
    const dislikeButton = postArticle.querySelector('.dislike-btn');
    
    // 🚨 CORRECCIÓN: Usamos data-count de tu plantilla
    let likesCount = parseInt(likeButton.dataset.count);
    let dislikesCount = parseInt(dislikeButton.dataset.count);

    if (newInteractionId) { // Se creó una nueva interacción
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
    } else { // Se eliminó una interacción
        if (isLike) likesCount = Math.max(0, likesCount - 1);
        else dislikesCount = Math.max(0, dislikesCount - 1);
        currentButton.classList.remove('active');
        currentButton.dataset.interactionId = '';
    }

    // Actualizamos el span y el data-count
    likeButton.querySelector('span').textContent = likesCount;
    likeButton.dataset.count = likesCount;
    dislikeButton.querySelector('span').textContent = dislikesCount;
    dislikeButton.dataset.count = dislikesCount;
}


function setupWallInteractions(containerElement, loggedUserId) {
    const interactionRepo = new InteractionRepository();
    const commentRepo = new CommentRepository();
    
    // --- MANEJO DE LIKES Y DISLIKES (Delegación de eventos) ---
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

    // --- MANEJO DE COMENTARIOS (Delegación de eventos) ---
    containerElement.addEventListener('submit', async (event) => {
        if (event.target.classList.contains('comment-form')) {
            event.preventDefault(); 

            const form = event.target;
            const postId = parseInt(form.dataset.postId);
            const contentInput = form.querySelector('textarea[name="commentContent"]');
            const content = contentInput ? contentInput.value.trim() : '';

            if (!content) return;

            try {
                await commentRepo.createComment(postId, loggedUserId, content);
                contentInput.value = '';
                // TODO: Renderizar el comentario dinámicamente en lugar de recargar
                await loadWallView(); 
            } catch (error) {
                console.error('Fallo al crear comentario:', error);
            }
        }
    });
    
    // TODO: Adjuntar listener para '.comment-count-btn' para mostrar/ocultar comentarios
}

// --- FUNCIÓN PRINCIPAL DE LA VISTA DEL MURO ---
export async function loadWallView() {
    const userSession = getUserSession();
    if (!userSession || !userSession.id) {
        console.error("No hay sesión de usuario válida. Redirigiendo al login.");
        window.location.href = '../index.html'; // 👈 Redirige al Login
        return; // Detiene la ejecución
    }
    const userId = userSession.id;
    loadUserData(userSession);

    const postRepository = new PostRepository();
    // Instanciamos PostPresentation y le pasamos el usuario (para el avatar del form de comentarios)
    const postPresentation = new PostPresentation(POSTS_CONTAINER_SELECTOR, userSession); 
    const wallContainer = postPresentation.container;
    if (!wallContainer) { /*...error...*/ return; }

   postPresentation.showLoading(); 
    try {
        const posts = await postRepository.getAllWallPosts(userId, 1, 10);
        postPresentation.renderPosts(posts); // Tu clase hace el renderizado

        // Adjuntamos los listeners de interacción al contenedor
        setupWallInteractions(wallContainer, userId);
    } catch (error) {
        console.error("Error al cargar el muro:", error);
        wallContainer.innerHTML = '<p class="error-message">Error al cargar las publicaciones.</p>';
    }
}