import { INTERACTION_TYPE } from '../repository/interactionRepository.js'; 
// 🚨 AÑADIDO: Importamos el helper para construir las URLs
import { buildFullUrl } from '../repository/postRepository.js';

export class PostPresentation {
    
    constructor(containerSelector, loggedUser) { // 👈 AÑADIDO: loggedUser
        this.container = document.querySelector(containerSelector);
        this.loggedUser = loggedUser; // 👈 Guardamos el usuario logueado
        this.showMoreListenerSet = false; // Flag para listeners
        this.textareaListenerSet = false; // Flag para listeners
    }

    showLoading() {
        if (this.container) {
            this.container.innerHTML = '<p class="loading-message">Cargando publicaciones...</p>';
        }
    }

    renderPosts(posts) {
        if (!this.container) return;
        this.container.innerHTML = ''; 

        if (!posts || posts.length === 0) {
            this.container.innerHTML = '<p class="empty-message">No hay publicaciones para mostrar.</p>';
            return;
        }

        // Renderizamos cada post
        const postsHtml = posts.map(post => this.createPostHtml(post)).join('');
        this.container.innerHTML = postsHtml;

        // Adjuntamos los listeners de UI (Ver Más y Auto-Resize)
        this.setupShowMoreListeners(); 
        this.setupTextareaAutoResize();
    }

    
    createPostHtml(post) {
        let postId = post.idPost || post.id || post.Id || post.postId || 0; 
        const userId = post.idUser || post.userId || post.UserId || 0; 

        const userInteraction = post.userInteraction || { interactionId: null, type: null };
        const isLiked = userInteraction.type === INTERACTION_TYPE.LIKE;
        const isDisliked = userInteraction.type === INTERACTION_TYPE.DISLIKE;
        const interactionId = userInteraction.interactionId || '';

        const avatarUrl = buildFullUrl(post.userAvatar);
        const postImageUrl = post.fileUrl ? buildFullUrl(post.fileUrl) : '';
        const loggedUserAvatarUrl = buildFullUrl(this.loggedUser.urlAvatar);

        // 3. GENERAR EL HTML (basado en tu estructura anterior)
        return `
            <article class="post" data-post-id="${postId}">
                <div class="post-header">
                    <a href="user-profile.html?id=${userId}"> 
                        <img class="avatar" src="${avatarUrl}" alt="Avatar de ${post.userName}">
                        <h4 class="user-name">${post.userName}</h4>
                    </a>
                </div>
                <h3 class="post-title">${post.title}</h3>
                <p>${post.content ? post.content : ''}</p>
                ${postImageUrl ? `<img class="img-post" src="${postImageUrl}" alt="Imagen del post">` : ''}
                <section class="post-actions">
                    <button class="action-btn like-btn ${isLiked ? 'active' : ''}" 
                            data-post-id="${postId}" 
                            data-interaction-type="${INTERACTION_TYPE.LIKE}"
                            data-interaction-id="${interactionId}"
                            data-count="${post.likesCount || 0}">
                        <i class="fa-solid fa-thumbs-up"></i>
                        <span>${post.likesCount || 0}</span>
                    </button>
                    <button class="action-btn dislike-btn ${isDisliked ? 'active' : ''}" 
                            data-post-id="${postId}" 
                            data-interaction-type="${INTERACTION_TYPE.DISLIKE}"
                            data-interaction-id="${interactionId}"
                            data-count="${post.dislikesCount || 0}">
                        <i class="fa-solid fa-thumbs-down"></i>
                        <span>${post.dislikesCount || 0}</span>
                    </button>
                    <button class="action-btn comment-count-btn">
                        <i class="fa-solid fa-comment"></i>
                        <span>${post.commentsCount || 0}</span>
                    </button>
                </section>
                <section class="comment-section">
                    <form class="comment-form" data-post-id="${postId}">
                        <img class="avatar" src="${loggedUserAvatarUrl}" alt="Tu avatar">
                        <textarea placeholder="Escribe un comentario..." rows="1" name="commentContent"></textarea>
                        <button type="submit">Enviar</button>
                    </form>
                    <div class="existing-comments">
                        ${this.renderExistingComments(post.comments)}
                    </div>
                </section>
            </article>
        `;
    }

    // 🚀 RESTAURADO: Tu función de "Ver más"
    setupShowMoreListeners() {
        if (this.showMoreListenerSet || !this.container) {
            return;
        }
        this.container.addEventListener('click', (event) => {
            if (event.target.classList.contains('show-more-btn')) {
                const button = event.target;
                const content = button.previousElementSibling; 
                
                if(content && content.classList.contains('comment-content')) {
                    content.classList.toggle('expanded');
                    button.textContent = content.classList.contains('expanded') ? 'Ver menos...' : 'Ver más...';
                }
                event.preventDefault();
            }
        });
        this.showMoreListenerSet = true;
    }

    // 🚀 RESTAURADO: Tu renderizador de comentarios
    renderExistingComments(comments) {
        if (!comments || comments.length === 0) {
            return '';
        }
        const commentsHtml = comments.map(comment => this.createCommentHtml(comment)).join('');
        return `<div class="existing-comments-list">${commentsHtml}</div>`;
    }

    createCommentHtml(comment) {
        // Hacemos la función robusta a PascalCase (del backend) y camelCase (del frontend)
        const content = comment.content || comment.Content || '';
        const commentUserId = comment.idUser || comment.userId || comment.UserId || 0;
        const commentAvatarUrl = buildFullUrl(comment.userAvatar || comment.UserAvatar || this.loggedUser.urlAvatar);
        const commentUserName = comment.userName || comment.UserName || this.loggedUser.userName;
        const commentId = comment.idComment || comment.id || comment.Id || 0;

        const needsShowMore = content.length > 100;
        const showMoreButton = needsShowMore ? '<button class="show-more-btn">Ver más...</button>' : '';

        return `
            <div class="comment-item" data-comment-id="${commentId}">
                <a href="user-profile.html?id=${commentUserId}">
                    <img class="avatar comment-avatar" src="${commentAvatarUrl}" alt="Avatar de ${commentUserName}">
                </a>
                <div class="comment-body">
                    <a class="user-name" href="user-profile.html?id=${commentUserId}">
                        <span class="clickable-text">${commentUserName}</span>
                    </a>
                    <p class="comment-content">${content}</p>
                    ${showMoreButton}
                </div>
            </div>
        `;
    }

    renderNewComment(postId, newCommentData) {
        const postElement = this.container.querySelector(`.post[data-post-id="${postId}"]`);
        if (!postElement) return;

        const commentsContainer = postElement.querySelector('.existing-comments');
        if (!commentsContainer) return;

        let commentList = commentsContainer.querySelector('.existing-comments-list');
        if (!commentList) {
            commentList = document.createElement('div');
            commentList.className = 'existing-comments-list';
            // Si no había lista, la insertamos al principio del contenedor de comentarios existentes.
            commentsContainer.prepend(commentList);
        }
        
        // Desempaquetamos el comentario si viene dentro de una propiedad 'data'
        const comment = newCommentData.data || newCommentData;

        const commentHtml = this.createCommentHtml(comment);
        commentList.insertAdjacentHTML('beforeend', commentHtml);

        const commentCountBtn = postElement.querySelector('.comment-count-btn span');
        if (commentCountBtn) {
            const newCount = parseInt(commentCountBtn.textContent) + 1;
            commentCountBtn.textContent = newCount;
        }
    } 

    updateSinglePost(updatedPostData) {
        const postId = updatedPostData.idPost || updatedPostData.id || updatedPostData.Id || updatedPostData.postId;
        if (!postId) return;

        const postElement = this.container.querySelector(`.post[data-post-id="${postId}"]`);
        if (!postElement) return;

        // Creamos el nuevo HTML para el post actualizado
        const newPostHtml = this.createPostHtml(updatedPostData);
        
        // Reemplazamos el elemento antiguo con el nuevo
        postElement.outerHTML = newPostHtml;

        // Re-aplicamos los listeners que podrían haberse perdido en el reemplazo
        this.setupTextareaAutoResize();
    }
    
    // 🚀 RESTAURADO: Tu auto-resize
    setupTextareaAutoResize() {
        if (!this.container || this.textareaListenerSet) return; // Prevenir duplicados
        
        // Usamos delegación de eventos en el contenedor
        this.container.addEventListener('input', (event) => {
            const textarea = event.target;
            // Solo actuar si es un textarea dentro de un comment-form
            if (textarea.tagName.toLowerCase() === 'textarea' && textarea.closest('.comment-form')) {
                textarea.style.height = 'auto'; // Reset height
                textarea.style.height = (textarea.scrollHeight) + 'px'; // Set new height
            }
        });

        this.textareaListenerSet = true;
    }
}