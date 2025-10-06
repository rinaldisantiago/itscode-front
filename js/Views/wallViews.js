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

// --- Funciones de Interacción (setupWallInteractions y updateInteractionCounters) ---

/**
 * Adjunta los event listeners para las interacciones (Like/Dislike) y comentarios
 * en el contenedor principal del muro.
 */
function setupWallInteractions(containerElement) {
    const interactionRepo = new InteractionRepository();
    const commentRepo = new CommentRepository();
    
    // --- MANEJO DE LIKES Y DISLIKES ---
    
    // Delegación de eventos: Escuchamos clicks en todo el contenedor
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
            event.preventDefault(); // Evitar cualquier acción por defecto
            const postId = parseInt(targetButton.dataset.postId); 

            try {
                // Llama al repositorio (crea la interacción, la lógica de la API debe manejar el toggle o error)
                await interactionRepo.createInteraction(postId, LOGGED_USER_ID, interactionType);
                
                // Actualiza solo el contador (o recarga toda la vista)
                // Por ahora, recarga para asegurar que se vea el cambio reflejado.
                await loadWallView(); 

            } catch (error) {
                console.error('Fallo en la interacción:', error);
                // El apiFetch ya muestra un Swal, pero puedes añadir un mensaje específico aquí.
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