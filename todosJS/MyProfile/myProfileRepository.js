function getMyProfile(userId, callback, objeto) {
    // La petición debe ser GET y el ID debe ir en la URL
    apiFetch(`/User/get?id=${userId}`, { method: 'GET' }, callback, objeto, "Obteniendo perfil de usuario");
}

function getMyPosts(userId, callback, objeto) {
    const userIdLogger = 1; 
    const isMyPosts = true;
    const pageNumber = 1;

    // Construye la URL con los parámetros de consulta
    const queryString = `?idUserLogger=${userIdLogger}&idUserConsultado=${userId}&isMyPosts=${isMyPosts}&pageNumber=${pageNumber}`;
    // Cambia la URL de '/Post/getAll' a '/Post'
    const url = `/Post${queryString}`;

    // Realiza una petición GET sin un cuerpo
    apiFetch(url, { method: 'GET' }, callback, objeto, "Obteniendo posts");
}