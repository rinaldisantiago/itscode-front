import { buildFullUrl } from '../repository/postRepository.js';


export function renderUserInfo(userData, postCount, container) {
    // 1. Añadimos la clase CSS que tu "modelo" espera al contenedor existente.
    container.className = 'user-info'; // <-- Aplicamos tu estilo
    
    const avatarUrl = buildFullUrl(userData.urlAvatar); 
    
    // 2. Generamos el contenido interno de la sección, similar a tu clase MyProfile
    const profileCardHTML_interno = `
        <img src="${avatarUrl}" id="avatar" class="avatar" alt="Avatar del Usuario">
        <article class="details">
            <h2 id="nickname">${userData.userName}</h2>
            <h3 id="name">${userData.fullName}</h3>
            <p id="bio">${userData.email}</p>
        </article>
        <article class="stats">
            <span>${postCount} publicaciones</span>
            <span>${userData.followers || 0} seguidores</span>
            <span>${userData.followed || 0} seguidos</span>
        </article>
        <a href="update-user.html" class="edit-btn">
            <i class="fas fa-user-edit"></i> Editar
        </a> 
    `;
    
    // 3. Insertamos el contenido interno
    container.innerHTML = profileCardHTML_interno;
}