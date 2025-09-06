function getMyProfile(callback, objeto) {
    const userId = 1;
    apiFetch(`/User/get?id=${userId}`, { method: 'GET' }, callback, objeto, "Obteniendo perfil de usuario");

}

function getMyPosts(callback, objeto) {
    apiFetch('/Post/getAll', { method: 'GET' }, callback, objeto, "Obteniendo posts");
}