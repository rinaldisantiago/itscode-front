// js/Views/wallViews.js
// Controlador de la Vista wall.html

import { PostRepository } from '../repository/postRepository.js';
import { InteractionRepository, INTERACTION_TYPE } from '../repository/interactionRepository.js';
import { CommentRepository } from '../repository/commentRepository.js';
import { PostPresentation } from '../presentation/postPresentation.js';

// Define el selector del contenedor donde se inyectarán los posts.
// Este es el elemento <section> que contiene los <article class="post">.
const POSTS_CONTAINER_SELECTOR = 'main.post-section > section:last-of-type'; 
const LOGGED_USER_ID = 1; // ⚠️ TEMPORAL: LEER DE SESIÓN ⚠️


function updateButtonState(currentButton, newInteractionId) {
    const postArticle = currentButton.closest('article.post');
    if (!postArticle) return;

    // 1. Obtener el botón opuesto
    const isLike = currentButton.classList.contains('like-btn');
    const oppositeButton = postArticle.querySelector(isLike ? '.dislike-btn' : '.like-btn');

    // 2. Leer contadores (si no están disponibles en el DTO, esta es la mejor aproximación)
    let likesCount = parseInt(postArticle.querySelector('.likes-count').textContent);
    let dislikesCount = parseInt(postArticle.querySelector('.dislikes-count').textContent);

    if (newInteractionId) {
        // A. Se acaba de crear (Like o Dislike)
        
        // 2a. Actualizar contadores
        if (isLike) {
            likesCount++;
            if (oppositeButton.dataset.interactionId) dislikesCount--; // Si había Dislike, lo quitamos
        } else {
            dislikesCount++;
            if (oppositeButton.dataset.interactionId) likesCount--; // Si había Like, lo quitamos
        }
        
        // 2b. Resetear el botón opuesto (porque lo eliminamos en el backend)
        oppositeButton.classList.remove('active');
        oppositeButton.dataset.interactionId = ''; // Quitar ID del opuesto
        
        // 2c. Activar el botón actual
        currentButton.classList.add('active');
        currentButton.dataset.interactionId = newInteractionId; // Establecer la nueva ID
        
    } else {
        // B. Se acaba de eliminar (Quitar Like o Dislike)
        
        // 2a. Actualizar contadores
        if (isLike) likesCount--; else dislikesCount--;

        // 2b. Desactivar el botón
        currentButton.classList.remove('active');
        currentButton.dataset.interactionId = ''; // Quitar la ID
    }

    // 3. Actualizar el DOM con los nuevos contadores
    postArticle.querySelector('.likes-count').textContent = Math.max(0, likesCount);
    postArticle.querySelector('.dislikes-count').textContent = Math.max(0, dislikesCount);
}


function setupWallInteractions(containerElement) {
    const interactionRepo = new InteractionRepository();
    const commentRepo = new CommentRepository();
    
    // --- MANEJO DE LIKES Y DISLIKES ---
    
    containerElement.addEventListener('click', async (event) => {
        const likeButton = event.target.closest('.like-btn');
        const dislikeButton = event.target.closest('.dislike-btn');
        
        let targetButton = null;
        let interactionType = null;
        
        if (likeButton) {
            targetButton = likeButton;
            interactionType = INTERACTION_TYPE.LIKE;
        } else if (dislikeButton) {
            targetButton = dislikeButton;
            interactionType = INTERACTION_TYPE.DISLIKE;
        }
                
        if (targetButton) {
            event.preventDefault(); 
            // Usamos la variable local 'interactionType' que ya definimos.
            const currentInteractionType = interactionType; 
            const postId = parseInt(targetButton.dataset.postId); 
            
            // 🔑 CLAVE: Intentamos leer el ID de la interacción existente del botón
            const interactionId = targetButton.dataset.interactionId; 
            
            try {
                if (interactionId && interactionId !== "") { 
                    // 1. ELIMINAR INTERACCIÓN (Quitar Like/Dislike)
                    await interactionRepo.deleteInteraction(interactionId);
                    
                    // 🛑 SOLUCIÓN: Actualizar el estado del botón a "eliminado"
                    updateButtonState(targetButton, null); // Pasamos null para indicar eliminación
                    
                } else {
                    // 2. CREAR INTERACCIÓN (Dar Like/Dislike)
                    const response = await interactionRepo.createInteraction(postId, LOGGED_USER_ID, currentInteractionType);
                    
                    // 🛑 SOLUCIÓN: Actualizar el estado del botón con el ID devuelto por el backend
                    if (response && response.interactionId) {
                         // El backend (CreateInteraction) debe devolver { interactionId: 123 }
                         updateButtonState(targetButton, response.interactionId); 
                    } else {
                         // Manejar caso donde el POST es exitoso pero no devuelve el ID (Error leve)
                         console.warn("Interacción creada, pero ID no devuelto. Forzando recarga.");
                         await loadWallView(); 
                    }
                }
                
                // 🛑 ELIMINAMOS LA RECARGA COMPLETA QUE CAUSABA EL ERROR 400
                // await loadWallView(); 

            } catch (error) {
                // Si el error es 400 Bad Request, ya sabemos por qué. Lo ignoramos o mostramos un mensaje.
                console.error('Fallo en la interacción (400 Bad Request esperado si se hace clic dos veces rápido):', error);
                
                // Si el error fue al crear, forzamos recarga para ver el estado real del backend
                if (!interactionId) await loadWallView(); 
            }
        }
    });

    // --- MANEJO DE COMENTARIOS ---
    
    // Delegación de eventos: Escuchamos el evento 'submit' en todo el contenedor
    containerElement.addEventListener('submit', async (event) => {
        if (event.target.classList.contains('comment-form')) {
            event.preventDefault(); 

            const form = event.target;
            const postId = parseInt(form.dataset.postId); 
            // Buscamos el textarea por su atributo name="commentContent"
            const contentInput = form.querySelector('textarea[name="commentContent"]'); 
            const content = contentInput ? contentInput.value.trim() : '';

            if (content.length === 0) {
                Swal.fire('Atención', 'El comentario no puede estar vacío.', 'warning');
                return;
            }

            try {
                // 1. Llamar al Repositorio para crear el comentario
                await commentRepo.createComment(postId, LOGGED_USER_ID, content);
                
                // 2. Lógica de Presentación
                contentInput.value = ''; // Limpiar el input
                
                // 3. Recargar la vista para mostrar el nuevo comentario (y el contador)
                await loadWallView(); 
                
            } catch (error) {
                console.error('Fallo al crear comentario:', error);
                // El error de conexión/API se gestionó en apiFetch.js
            }
        }
    });
}


// --- Función Principal ---

export async function loadWallView() {
    // 1. INSTANCIACIÓN DE REPOSITORIOS (SOLUCIÓN AL 'postRepo is not defined')
    const postRepository = new PostRepository();
    const postPresentation = new PostPresentation(POSTS_CONTAINER_SELECTOR); 
    
    // 2. OBTENER EL CONTENEDOR (SOLUCIÓN AL 'Cannot set properties of null')
    const wallContainer = postPresentation.container; // Ya lo obtiene internamente PostPresentation

    if (!wallContainer) {
        // Esto evita el segundo error si el selector POSTS_CONTAINER_SELECTOR es incorrecto.
        console.error("No se encontró el contenedor de posts con el selector:", POSTS_CONTAINER_SELECTOR);
        return; 
    }

    postPresentation.showLoading(); 

    try {
        // 3. Obtención de Datos
        const posts = await postRepository.getAllWallPosts(LOGGED_USER_ID, 1, 10);
        
        // 4. Presentación de Datos
        postPresentation.renderPosts(posts);

        // 5. Configuración de Eventos (Solo se llama UNA VEZ después de renderizar)
        setupWallInteractions(wallContainer);
        
    } catch (error) {
        console.error("Error al cargar el muro:", error);
        // postPresentation.container ya está disponible, lo usamos para mostrar el error.
        wallContainer.innerHTML = '<p class="error-message">Error al cargar las publicaciones. Intente más tarde.</p>';
    }
}