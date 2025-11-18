import { PostRepository } from '../repository/postRepository.js';
import { getUserById } from '../repository/userRepository.js'; 
import { InteractionRepository, INTERACTION_TYPE } from '../repository/interactionRepository.js';
import { CommentRepository } from '../repository/commentRepository.js';
import { PostPresentation } from '../presentation/postPresentation.js'; 
import { renderUserInfo } from '../presentation/profilePresentation.js';

// --- 3. INSTANCIAS DE REPOSITORIO ---
const postRepo = new PostRepository();
const interactionRepo = new InteractionRepository();
const commentRepo = new CommentRepository();

// =======================================================
// --- HELPERS DE SESIÓN Y RENDERIZADO ---
// =======================================================

const getUserSession = () => {
    const sessionData = localStorage.getItem('userSession');
    if (!sessionData) return null;
    const rawUser = JSON.parse(sessionData);
    // Parsear la sesión (corrigiendo mayúsculas/minúsculas)
    return {
        id: rawUser.Id || rawUser.id,
        userName: rawUser.UserName || rawUser.userName,
        urlAvatar: rawUser.UrlAvatar || rawUser.urlAvatar
    };
};

// =======================================================
// --- 🚀 LÓGICA DE INTERACCIÓN (RESTAURADA) ---
// (Esta es la lógica que me pasaste de tu wallViews.js original)
// =======================================================

// Variable para la instancia de PostPresentation 
let postPresentation; 
// Semaforo para asegurar que los listeners se adjuntan una sola vez
let profileInteractionsInitialized = false;

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

function setupProfileInteractions(containerElement, loggedUserId) {
    // Si ya hemos añadido los listeners, no hacemos nada más.
    if (profileInteractionsInitialized) {
        return;
    }
    
    // --- MANEJO DE LIKES Y DISLIKES ---
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

    // --- MANEJO DE COMENTARIOS ---
    containerElement.addEventListener('submit', async (event) => {
        if (event.target.classList.contains('comment-form')) {
            event.preventDefault(); 
            const form = event.target;
            const postId = parseInt(form.dataset.postId);
            const contentInput = form.querySelector('textarea[name="commentContent"]');
            const content = contentInput ? contentInput.value.trim() : '';

            if (!content) return;

            try {
                // 1. Crear el comentario
                await commentRepo.createComment(postId, loggedUserId, content);
                contentInput.value = ''; 
                contentInput.style.height = 'auto';

                // 2. Obtener el post actualizado del backend
                const updatedPost = await postRepo.getPostById(postId, loggedUserId);

                // 3. Re-renderizar solo ese post con la nueva información
                if (updatedPost && postPresentation) {
                    postPresentation.updateSinglePost(updatedPost);
                }
                
            } catch (error) {
                console.error('Fallo al crear y refrescar comentario:', error);
            }
        }
    });
    
    // Marcamos los listeners como inicializados
    profileInteractionsInitialized = true;
}


// =======================================================
// --- FUNCIÓN PRINCIPAL DEL CONTROLADOR (EXPORTADA) ---
// =======================================================

export async function loadProfileView() {
    // 1. OBTENER ELEMENTOS DEL DOM
    const infoUserContainer = document.getElementById('infoUserContainer');
    const myPostsContainer = document.getElementById('myPostsContainer');
    const userSession = getUserSession();
    if (!userSession) { 
        window.location.href = '../index.html';
        return; 
    }
    const user = userSession; 

    // 2. VALIDAR CONTENEDORES
    if (!infoUserContainer || !myPostsContainer) {
        console.error("IDs de HTML (infoUserContainer o myPostsContainer) no encontrados.");
        return; 
    } 
    
    // 3. INSTANCIAR PRESENTACIÓN (VISTA)
    // Usamos la variable global para que sea accesible desde los listeners
    postPresentation = new PostPresentation('#myPostsContainer', userSession);

    // 4. ORQUESTAR: Buscar datos y luego pintar
    try {
        // A. Pedir datos al Modelo
        const [userData, userPosts] = await Promise.all([
            getUserById(user.id, user.id), // ✅ CORRECCIÓN: Se llama una sola vez con ambos parámetros
            postRepo.getPostsForProfile(user.id, user.id) 
      ]);

        // B. Enviar datos a la Presentación (renderizar cabecera)
        renderUserInfo(userData, userPosts.length, infoUserContainer);
        
        // C. Enviar datos a la Presentación (renderizar posts)
        postPresentation.renderPosts(userPosts); 
        
        // D. Adjuntar Listeners a los posts renderizados (solo la primera vez)
        setupProfileInteractions(myPostsContainer, user.id);

    } catch (error) {
        console.error("Error cargando datos del perfil:", error);
    }
}
