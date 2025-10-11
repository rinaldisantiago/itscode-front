// js/presentation/PostPresentation.js (Capa de Presentación)

// Importar el tipo de interacción (LIKE = 1, DISLIKE = 2) del repositorio
import { INTERACTION_TYPE } from '../repository/interactionRepository.js'; 

export class PostPresentation {
    
    constructor(containerSelector) {
        // Almacenamos el elemento donde se inyectarán todos los posts (la <section> principal)
        this.container = document.querySelector(containerSelector);
    }

    showLoading() {
        this.container.innerHTML = '<p class="loading-message">Cargando publicaciones...</p>';
    }

    /**
     * Dibuja un array de objetos post en el contenedor.
     * @param {Array<Object>} posts - Lista de publicaciones obtenidas del Repositorio.
     */
    renderPosts(posts) {
        if (!this.container) return;
        this.container.innerHTML = ''; 

        if (posts.length === 0) {
            this.container.innerHTML = '<p class="empty-message">No hay publicaciones para mostrar.</p>';
            return;
        }

        console.log('Posts recibidos:', posts);
        const postsHtml = posts.map(post => this.createPostHtml(post)).join('');
        this.container.innerHTML = postsHtml;

        this.setupTextareaAutoResize(); 
    }

    /**
     * Genera el HTML de un solo post.
     * @param {Object} post - Objeto con los datos del post (debe incluir 'userInteraction').
     * @returns {string} El HTML completo del <article class="post">.
     */
    createPostHtml(post) {
        // Buscar el ID del post - puede estar en diferentes campos según el backend
        let postId = post.idPost || post.id || post.Id || post.postId || 0; 
        const userId = post.idUser || post.userId || post.UserId || 0; 


        // Validar que el userId sea válido
        if (!userId || isNaN(userId)) {
            console.warn('Post con userId inválido:', post);
            console.warn('Campos disponibles:', Object.keys(post));
            return '';
        }

        // 1. OBTENER ESTADO DE INTERACCIÓN DEL BACKEND (userInteraction)
        // Si el backend no envía el objeto, asumimos que no hay interacción.
        const userInteraction = post.userInteraction || { interactionId: null, type: null };
        
        // Determinar si el Like o Dislike está activo
        const isLiked = userInteraction.type === INTERACTION_TYPE.LIKE;
        const isDisliked = userInteraction.type === INTERACTION_TYPE.DISLIKE;

        // 2. OBTENER EL ID DE LA INTERACCIÓN EXISTENTE
        // Este ID es CRUCIAL para que wallViews.js decida llamar a DELETE
        const interactionId = userInteraction.interactionId || '';

        // 3. GENERAR EL HTML
        return `
            <article class="post" data-post-id="${postId}">
                <img class="avatar" src="${(post.userAvatar && post.userAvatar !== 'string') ? post.userAvatar : '../img/default-avatar.webp'}" alt="Avatar de ${post.userName}">
                <a class="user-name" href="user-profile.html?id=${userId}">
                    <span class="clickable-text">${post.userName}</span>
                </a>
                <h3 class="post-title">${post.title}</h3>
                <p>${post.content}</p>
                
                ${post.fileUrl ? `<img class="img-post" src="${post.fileUrl}" alt="Imagen de la publicación">` : ''}

                <section class="post-actions">
                    <button class="action-btn like-btn ${isLiked ? 'active' : ''}" 
                        data-post-id="${postId}" 
                        data-interaction-type="${INTERACTION_TYPE.LIKE}"
                        data-interaction-id="${isLiked ? interactionId : ''}"> 
                        <i class="fa-solid fa-thumbs-up"></i>
                        <span>${post.likesCount || post.likes || 0}</span>
                    </button>
                    
                    <button class="action-btn dislike-btn ${isDisliked ? 'active' : ''}" 
                        data-post-id="${postId}" 
                        data-interaction-type="${INTERACTION_TYPE.DISLIKE}"
                        data-interaction-id="${isDisliked ? interactionId : ''}">
                        <i class="fa-solid fa-thumbs-down"></i>
                        <span>${post.dislikesCount || post.dislikes || 0}</span>
                    </button>

                    <button class="action-btn comment-count-btn">
                        <i class="fa-solid fa-comment"></i>
                        <span>${post.commentsCount || 0}</span>
                    </button>
                </section>
                
                <section class="comment-section">
                    <form class="comment-form" data-post-id="${postId}">
                        <img class="avatar" src="${/* URL del avatar del usuario logueado */'../img/fotoCv-min.webp'}" alt="Tu avatar">
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

    /**
     * Dibuja los comentarios existentes dentro del post.
     */
    renderExistingComments(comments) {
        if (!comments || comments.length === 0) {
            return '';
        }
        
        return comments.map(comment => `
            <div class="comment-item">
                <img class="avatar small-avatar" src="${(comment.userAvatar && comment.userAvatar !== 'string') ? comment.userAvatar : '../img/default-avatar.webp'}" alt="Avatar">
                <p>
                    <span class="comment-user">${comment.userName}:</span> 
                    ${comment.content}
                </p>
            </div>
        `).join('');
    }
    
    /**
     * Configura el auto-resize para los textareas de comentarios.
     */
    setupTextareaAutoResize() {
        if (!this.container) return;
        const textareas = this.container.querySelectorAll('textarea');
        
        textareas.forEach(textarea => {
            textarea.addEventListener('input', () => {
                textarea.style.height = 'auto'; // Reset height
                textarea.style.height = (textarea.scrollHeight) + 'px'; // Set new height
            });
        });
    }
}