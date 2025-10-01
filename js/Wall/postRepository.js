// postRepository.js (o donde tengas estas funciones)

/**
 * Obtiene los posts para el muro principal o feed.
 * @param {number} userIdLogger - ID del usuario logueado.
 * @param {number} pageNumber - Número de página a cargar.
 * @param {function} callback - Función a ejecutar en caso de éxito.
 * @param {object} objeto - Objeto de contexto (si es necesario).
 */
function getWallPosts(userIdLogger, pageNumber, callback, objeto) {
    // Para el muro principal, asumimos que:
    const idUserConsultado = 0; // 0 o no especificado para el feed general
    const isMyPosts = false;    // No son solo mis posts

    // Construimos la URL según el DTO del controlador: GetAllPostRequestDTO
    const queryString = `?idUserLogger=${userIdLogger}&idUserConsultado=${idUserConsultado}&isMyPosts=${isMyPosts}&pageNumber=${pageNumber}`;
    
    // Asumiendo que el endpoint es /Post/GetPosts, pero tu ejemplo usa /Post
    // Usaremos el que deducimos del controlador: /Post/GetPosts
    // Si tu ruta es solo /Post, ajusta aquí:
    const url = `/Post/GetPosts${queryString}`; 

    // Realiza una petición GET sin cuerpo
    apiFetch(url, { method: 'GET' }, callback, objeto, "Obteniendo posts del muro");
}