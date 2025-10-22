class Post {
    constructor(post) {
        this.idPost = post.idPost; // Si existe en el DTO (es crucial para likes/comentarios)
        this.idUser = post.idUser; // ID del autor
        this.title = post.title;
        this.content = post.content;
        this.likes = post.likes;
        this.dislikes = post.dislikes;
        this.commentsCount = post.commentsCount;
        this.fileUrl = post.fileUrl;
        this.userName = post.userName;  
        this.userAvatar = post.userAvatar;
        this.comments = post.comments || [];
    }

    getNode = () => {
        const post = document.createElement('article');
        post.className = 'post';
        // Añadir el ID del post como data attribute es buena práctica
        post.dataset.id = this.idPost; 

        // Manejo de la imagen: solo renderizar si hay URL
        let imageHtml = '';
        if (this.fileUrl && this.fileUrl.length > 0) {
            // Se puede mejorar para manejar videos, pero aquí asumimos imagen
            imageHtml = `<img class="img-post" src="${this.fileUrl}" alt="imagen del post">`;
        }

        post.innerHTML = `
            <div class="post-header">
                <img class="avatar" src="${this.userAvatar}" alt="avatar de usuario">
                <a class="user-name" href="/perfil?userId=${this.idUser}">
                    <span class="clickable-text">${this.userName}</span>
                </a>
            </div>
            <h3 class="post-title">${this.title}</h3>
            <p> 
                ${this.content}
            </p>
            ${imageHtml} 
            <section class="post-actions">
                <button class="action-btn like-btn">
                     <i class="fa-solid fa-thumbs-up"></i>
                    <span>${this.likes}</span> </button>
                <button class="action-btn dislike-btn">
                    <i class="fa-solid fa-thumbs-down"></i>
                    <span>${this.dislikes}</span>
                </button>
                <button class="action-btn comment-btn">
                    <i class="fa-solid fa-comment"></i>
                    <span>${this.commentsCount}</span>
                </button>
             </section>

            <section class="comment-section">
                <form class="comment-form">
                    <img class="avatar" src="${this.userAvatar}" alt="Tu avatar">
                    <textarea placeholder="Escribe un comentario..." rows="1"></textarea>
                    <button type="submit">Enviar</button>
                </form>
            </section>
        `;
        return post;

    }
}