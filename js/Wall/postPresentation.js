// wall.js

const socialWallContainer = document.getElementById("socialWallContainer");
const USER_LOGGER_ID = 1; // **¡CAMBIAR!** Obtener esto del contexto de autenticación
let wallCurrentPage = 1; // Empezamos en la página 1

/**
 * Función que maneja el éxito de la llamada API, renderizando los posts.
 * @param {object} data - El GetAllPostResponseDTO recibido.
 */
function renderWallPosts(data) {
    // 'data' es el GetAllPostResponseDTO: { Posts: [...] }
    const postsArray = data.posts; 

    if (!postsArray || postsArray.length === 0) {
        if (wallCurrentPage === 1) {
             socialWallContainer.innerHTML = '<p class="no-posts">No hay publicaciones para mostrar en el muro.</p>';
        }
        // Si no hay posts en una página > 1, es el final del muro.
        return; 
    }

    // Iteramos sobre la lista de posts
    for (const jsonPost of postsArray) {
        // Usamos la clase Post que ya tienes definida
        const postObject = new Post(jsonPost); 
        const postNode = postObject.getNode();
        socialWallContainer.append(postNode);
    }
    
    // Si la carga fue exitosa, incrementamos la página para la próxima solicitud
    wallCurrentPage++;
}

/**
 * Función principal para iniciar la carga del muro.
 */
function loadWall() {
    // Usamos el Repositorio para obtener los posts del muro
    getWallPosts(
        USER_LOGGER_ID, 
        wallCurrentPage, 
        renderWallPosts
    );
}

// Escuchador de eventos para cargar la página
document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargamos el primer set de posts
    loadWall();
    
    // 2. Opcional: Implementación simple de "Cargar más" o scroll infinito
    // Por ejemplo, un botón de "Cargar más":
    // const loadMoreButton = document.getElementById('loadMoreBtn');
    // loadMoreButton.addEventListener('click', loadWall);
});