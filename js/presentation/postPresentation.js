// 🚨 AÑADIDO: Importamos el helper para construir las URLs
import { buildFullUrl } from '../repository/postRepository.js';
// 🚨 AÑADIDO: Importamos los tipos de interacción para los botones de like/dislike
import { INTERACTION_TYPE } from '../repository/interactionRepository.js';

export class PostPresentation {
    
    constructor(containerSelector, loggedUser, config = {}) {
        this.container = document.querySelector(containerSelector);
        this.loggedUser = loggedUser;
        this.config = config; // ✅ 1. Guardamos la configuración
    }

    showLoading() {
        if (this.container) {
            this.container.innerHTML = '<p class="loading-message">Cargando publicaciones...</p>';
        }
    }

    showError(message) {
        this.container.innerHTML = `<div class="error">${message}</div>`;
    }

    renderPosts(posts) {
        if (!this.container) return;

        if (!posts || posts.length === 0) {
            this.container.innerHTML = '<p class="empty-message">No hay publicaciones para mostrar.</p>';
            return;
        }

        const postsHtml = posts.map(post => this.createPostHtml(post)).join('');
        this.container.innerHTML = postsHtml;
    }

    updateSinglePost(post) {
        // ✅ FIX: Corregimos el selector para que coincida con el HTML renderizado (<article class="post">).
        const postElement = this.container.querySelector(`.post[data-post-id="${post.id}"]`);
        if (postElement) {
            postElement.outerHTML = this.createPostHtml(post);
        }
    }

    // 🚀 NUEVO: Añade comentarios a un post existente (para "Ver más")
    appendComments(postId, newComments) {
        const commentsList = this.container.querySelector(`.comments-list[data-post-id="${postId}"]`);
        if (commentsList) {
            const commentsHtml = newComments.map(comment => this.createCommentHtml(comment)).join('');
            commentsList.insertAdjacentHTML('beforeend', commentsHtml);
        }
    }

    // 🚀 NUEVO: Actualiza la sección de comentarios después de añadir uno nuevo
    updateCommentsSection(postElement, comments, totalComments) {
        // ✅ FIX: Usamos el selector correcto '.comment-section' que coincide con tu HTML.
        const commentsContainer = postElement.querySelector('.comment-section');
        if (!commentsContainer) return;

        // Actualiza el contador
        const commentsCountElement = postElement.querySelector('.comments-count');
        if (commentsCountElement) { // ✅ FIX: Usamos tu clase original 'comment-count-btn span'
            commentsCountElement.textContent = totalComments;
        }

        // Re-renderiza la lista de comentarios
        const commentsListHtml = comments.map(comment => this.createCommentHtml(comment)).join('');
        commentsContainer.querySelector('.existing-comments .comments-list').innerHTML = commentsListHtml;

        // Re-renderiza el botón "Ver más"
        const loadMoreButton = commentsContainer.querySelector('.load-more-comments-btn'); // ✅ FIX: Usamos tu clase original
        const newButtonHtml = this.getLoadMoreButtonHtml({ id: postElement.dataset.postId, commentsCount: totalComments, comments: comments });
        
        if (loadMoreButton) {
            loadMoreButton.outerHTML = newButtonHtml;
        } else if(newButtonHtml) {
            commentsContainer.insertAdjacentHTML('beforeend', newButtonHtml);
        }
    }


    // ✅ RESTAURADO: Tu método original con tus clases CSS
    createPostHtml(post) {
        const postImageUrl = post.fileUrl ? buildFullUrl(post.fileUrl) : '';
        const avatarUrl = buildFullUrl(post.userAvatar);
        const loggedUserAvatarUrl = buildFullUrl(this.loggedUser.urlAvatar);

        const commentsHtml = post.comments.map(comment => this.createCommentHtml(comment)).join('');
        
        const isLiked = post.userInteraction?.type === INTERACTION_TYPE.LIKE;
        const isDisliked = post.userInteraction?.type === INTERACTION_TYPE.DISLIKE;

        // ✅ LÓGICA: Creamos el botón de eliminar solo si el ID del usuario logueado
        // coincide con el ID del autor del post.
        // ✅ CORRECCIÓN: Y si estamos en la página de "Mi Perfil" (usando la configuración).
        const canShowDeleteButton = this.config.isMyProfilePage && (this.loggedUser.id === post.idUser);
        const deleteButtonHtml = canShowDeleteButton ? `
            <button class="delete-post-btn" data-post-id="${post.id}" title="Eliminar post">
                <i class="fa-solid fa-trash"></i>
            </button>
        ` : '';

        return `
            <article class="post" data-post-id="${post.id}">
                <div class="post-header">
                    <a href="user-profile.html?id=${post.idUser}"> <img class="avatar" src="${avatarUrl}" alt="Avatar de ${post.userName}">
                        <h4 class="user-name">${post.userName}</h4>
                    </a>
                    ${deleteButtonHtml}
                </div>
                <h3 class="post-title">${post.title}</h3>
                <p>${post.content || ''}</p>
                ${postImageUrl ? `<img class="img-post" src="${postImageUrl}" alt="Imagen del post">` : ''}
                <section class="post-actions">
                    <button class="action-btn like-btn ${isLiked ? 'active' : ''}" 
                            data-post-id="${post.id}" 
                            data-interaction-id="${post.userInteraction?.interactionId || ''}">
                        <i class="fa-solid fa-thumbs-up"></i>
                        <span>${post.likesCount || 0}</span>
                    </button>
                    <button class="action-btn dislike-btn ${isDisliked ? 'active' : ''}" 
                            data-post-id="${post.id}" 
                            data-interaction-id="${post.userInteraction?.interactionId || ''}">
                        <i class="fa-solid fa-thumbs-down"></i>
                        <span>${post.dislikesCount || 0}</span>
                    </button>
                    <button class="action-btn comment-count-btn">
                        <i class="fa-solid fa-comment"></i>
                        <span class="comments-count">${post.commentsCount || 0}</span>
                    </button>
                </section>
                <section class="comment-section">
                    <form class="comment-form" data-post-id="${post.id}">
                        <img class="avatar" src="${loggedUserAvatarUrl}" alt="Tu avatar">
                        <textarea placeholder="Escribe un comentario..." rows="1" name="commentContent"></textarea>
                        <button type="submit">Enviar</button>
                    </form>
                    <div class="existing-comments">
                        <div class="comments-list" data-post-id="${post.id}">${commentsHtml}</div>
                        ${this.getLoadMoreButtonHtml(post)}
                    </div>
                </section>
            </article>
        `;
    }

    // ✅ RESTAURADO: Tu método para crear el HTML de un comentario
    createCommentHtml(comment) {
        // ✅ FIX DEFINITIVO: Ahora el DTO de comentario SÍ trae el avatar y el nombre del autor.
        const avatarUrl = buildFullUrl(comment.avatarUrl);
        const userName = comment.username;

        return `
            <div class="comment-item" data-comment-id="${comment.id}">
                <a href="user-profile.html?id=${comment.userId}">
                    <img class="avatar comment-avatar" src="${avatarUrl}" alt="Avatar de ${userName}">
                </a>
                <div class="comment-body">
                     <a class="user-name" href="user-profile.html?id=${comment.userId}">${userName}</a>
                     <p class="comment-content">${comment.content}</p>
                </div>
            </div>
        `;
    }

    // ✅ ADAPTADO: La lógica del botón "Ver más" ahora usa tus clases
    getLoadMoreButtonHtml(post) {
        const commentsLoaded = post.comments.length;
        if (post.commentsCount > commentsLoaded) {
            // ✅ FIX: La siguiente página a cargar es la 2, no la 3.
            const nextPage = Math.floor(commentsLoaded / 3) + 1;
            return `<button class="load-more-comments-btn action-btn" data-post-id="${post.id}" data-next-page="${nextPage}">Ver más comentarios</button>`;
        }
        return ''; // No mostrar el botón si no hay más comentarios
    }
}