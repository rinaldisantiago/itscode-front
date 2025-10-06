// scripts/controllers/wallController.js

// Importaciones desde las otras capas
import { PostRepository } from '../post/repository/PostRepository.js';
import { PostPresentation } from '../post/presentation/PostPresentation.js';

// Creamos una función de inicialización específica para el Muro
export async function loadWallPage() {
    // Definimos el contenedor donde se dibujarán los posts
    const POSTS_CONTAINER_ID = '#posts-collection';

    // 1. Inicialización de dependencias
    const postRepository = new PostRepository();
    const postPresentation = new PostPresentation(POSTS_CONTAINER_ID); 

    // 2. Lógica de flujo (Controlador)
    postPresentation.showLoading(); 
    try {
        // Obtenemos posts del servidor (Capa de Datos)
        const posts = await postRepository.getAllWallPosts();
        
        // Dibujamos los posts en el DOM (Capa de Presentación)
        postPresentation.renderPosts(posts);

    } catch (error) {
        // La lógica de error de fetch ya mostró un Swal.fire
        console.error("Fallo al cargar la página del Muro.", error);
    }
}