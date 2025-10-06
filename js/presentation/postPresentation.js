// js/presentation/PostPresentation.js (Capa de Presentación)

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

        // Limpiamos el mensaje de carga o el contenido anterior
        this.container.innerHTML = ''; 

        if (posts.length === 0) {
            this.container.innerHTML = '<p class="empty-message">No hay publicaciones para mostrar.</p>';
            return;
        }

        const postsHtml = posts.map(post => this.createPostHtml(post)).join('');
        this.container.innerHTML = postsHtml;

        // Después de inyectar el HTML, puedes agregar un manejador para el auto-resize de textareas
        this.setupTextareaAutoResize(); 
    }

    /**
     * Genera el HTML de un solo post.
     * @param {Object} post - Objeto con los datos del post (asumiendo nombres como en GetPostResponseDTO).
     * @returns {string} El HTML completo del <article class="post">.
     */
    createPostHtml(post) {
        // Usamos los IDs para las interacciones
        const postId = post.idPost; // Asume que tu post tiene un ID
        const userId = post.idUser; 

        // Generamos la estructura del post replicando el HTML que nos pasaste:
        return `
            <article class="post" data-post-id="${postId}">
                <img class="avatar" src="${post.userAvatar || '../img/default-avatar.webp'}" alt="Avatar de ${post.userName}">
                <a class="user-name" href="user-profile.html?id=${userId}">
                    <span class="clickable-text">${post.userName}</span>
                </a>
                <h3 class="post-title">${post.title}</h3>
                <p>${post.content}</p>
                
                ${post.fileUrl ? `<img class="img-post" src="${post.fileUrl}" alt="Imagen de la publicación">` : ''}

                <section class="post-actions">
                    <button class="action-btn like-btn" data-post-id="${postId}">
                        <i class="fa-solid fa-thumbs-up"></i>
                        <span>${post.likes || 0}</span>
                    </button>
                    <button class="action-btn dislike-btn" data-post-id="${postId}">
                        <i class="fa-solid fa-thumbs-down"></i>
                        <span>${post.dislikes || 0}</span>
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
     * @param {Array<Object>} comments - Lista de comentarios del post.
     * @returns {string} HTML de los comentarios.
     */
    renderExistingComments(comments) {
        if (!comments || comments.length === 0) {
            return ''; // No comments to show
        }
        
        // Simplemente un ejemplo de cómo se vería un comentario
        return comments.map(comment => `
            <div class="comment-item">
                <img class="avatar small-avatar" src="${comment.userAvatar || '../img/default-avatar.webp'}" alt="Avatar">
                <p>
                    <span class="comment-user">${comment.userName}:</span> 
                    ${comment.content}
                </p>
            </div>
        `).join('');
    }
    
    /**
     * Configura el auto-resize para los textareas de comentarios (necesario si se inyectan dinámicamente)
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