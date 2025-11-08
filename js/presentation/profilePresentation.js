// js/presentation/profilePresentation.js

// Importamos el helper para construir la URL del avatar
import { buildFullUrl } from '../repository/postRepository.js';


export function renderUserInfo(userData, postCount, container) {
    // 🚨 CAMBIO CLAVE: No usamos innerHTML para la sección completa.
    // 1. Añadimos la clase CSS que tu "modelo" espera al contenedor existente.
    container.className = 'user-info'; // <-- Aplicamos tu estilo
    
    const avatarUrl = buildFullUrl(userData.urlAvatar); 
    
    // 2. Generamos solo el *contenido interno* de la sección
    const profileCardHTML_interno = `
        <img src="${avatarUrl}" id="avatar" class="avatar" alt="Avatar de ${userData.userName}">
        <article class="details">
            <h2 id="nickname">${userData.userName}</h2>
            <h3 id="name">${userData.fullName}</h3>
            <p id="bio">${userData.email}</p>
        </article>
        <article class="stats">
            <span>${postCount} publicaciones</span>
            <span>0 seguidores</span>
            <span>0 seguidos</span>
        </article>
        <a href="update-user.html" class="edit-btn">
            <i class="fas fa-user-edit"></i> Editar
        </a>
    `;
    
    // 3. Insertamos el contenido interno
    container.innerHTML = profileCardHTML_interno;
}