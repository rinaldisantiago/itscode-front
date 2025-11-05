// js/Views/wallViews.js

import { PostRepository } from '../repository/postRepository.js';
import { InteractionRepository, INTERACTION_TYPE } from '../repository/interactionRepository.js';
import { CommentRepository } from '../repository/commentRepository.js';
import { PostPresentation } from '../presentation/postPresentation.js';

const POSTS_CONTAINER_SELECTOR = 'main.post-section > section:last-of-type';
const API_BASE_URL = 'http://localhost:5052';

const getUserSession = () => {
    const sessionData = localStorage.getItem('userSession');
    return sessionData ? JSON.parse(sessionData) : null;
};

const loadUserData = (userSession) => {
    if (!userSession) return;

    const avatarImg = document.getElementById('user-avatar-redirect');
    if (avatarImg) {
        // 👇 CORREGIDO: Usamos 'urlAvatar' (minúscula)
        const avatarPath = userSession.urlAvatar;
        if (avatarPath) {
            // Construimos la URL completa para que el navegador encuentre la imagen
            avatarImg.src = `${API_BASE_URL}${avatarPath}`;
        } else {
            // Si el usuario no tiene avatar, ponemos uno por defecto
            avatarImg.src = '../img/default-avatar.png'; 
        }
    }
};


function updateButtonState(currentButton, newInteractionId) {
    const postArticle = currentButton.closest('article.post');
    if (!postArticle) return;

    const isLike = currentButton.classList.contains('like-btn');
    const oppositeButton = postArticle.querySelector(isLike ? '.dislike-btn' : '.like-btn');
    const likeButton = postArticle.querySelector('.like-btn');
    const dislikeButton = postArticle.querySelector('.dislike-btn');
    let likesCount = parseInt(likeButton.querySelector('span').textContent);
    let dislikesCount = parseInt(dislikeButton.querySelector('span').textContent);

    if (newInteractionId) { // Se creó una nueva interacción
        if (isLike) {
            likesCount++;
            if (oppositeButton.dataset.interactionId) dislikesCount--;
        } else {
            dislikesCount++;
            if (oppositeButton.dataset.interactionId) likesCount--;
        }
        oppositeButton.classList.remove('active');
        oppositeButton.dataset.interactionId = '';
        currentButton.classList.add('active');
        currentButton.dataset.interactionId = newInteractionId;
    } else { // Se eliminó una interacción
        if (isLike) likesCount--;
        else dislikesCount--;
        currentButton.classList.remove('active');
        currentButton.dataset.interactionId = '';
    }

    likeButton.querySelector('span').textContent = Math.max(0, likesCount);
    dislikeButton.querySelector('span').textContent = Math.max(0, dislikesCount);
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
            // Opcional: recargar para sincronizar con el estado real del backend
            // await loadWallView(); 
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
                // Para una mejor UX, en lugar de recargar todo, podríamos añadir el comentario dinámicamente.
                // Por ahora, recargar es más simple.
                await loadWallView(); 
            } catch (error) {
                console.error('Fallo al crear comentario:', error);
            }
        }
    });
}

// --- FUNCIÓN PRINCIPAL DE LA VISTA DEL MURO ---
export async function loadWallView() {
    const userSession = getUserSession();
    
    // 👇 CORREGIDO: Verificamos la propiedad 'id' (minúscula)
    if (!userSession || !userSession.id) {
        console.error("No hay sesión de usuario válida. Redirigiendo al login.");
        window.location.href = '../index.html';
        return;
    }
    
    // Obtenemos el ID correcto
    const userId = userSession.id;

    // CARGAR DATOS DEL USUARIO EN LA UI (AVATAR)
    loadUserData(userSession);

    const postRepository = new PostRepository();
    const postPresentation = new PostPresentation(POSTS_CONTAINER_SELECTOR); 
    const wallContainer = postPresentation.container;

    if (!wallContainer) {
        console.error("Error crítico: No se encontró el contenedor de posts.");
        return; 
    }

    postPresentation.showLoading(); 

    try {
        // 👇 CORREGIDO: Usamos 'userId' (que viene de userSession.id)
        const posts = await postRepository.getAllWallPosts(userId, 1, 10);
        postPresentation.renderPosts(posts);

        // 👇 CORREGIDO: Pasamos 'userId'
        setupWallInteractions(wallContainer, userId);
        
    } catch (error) {
        console.error("Error al cargar el muro:", error);
        wallContainer.innerHTML = '<p class="error-message">Error al cargar las publicaciones.</p>';
    }
}