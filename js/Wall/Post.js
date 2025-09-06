class Post {
  constructor(post) {
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
        post.innerHTML = `
            <img class="avatar" src="${this.userAvatar}" alt="avatar de usuario">
                <a class="user-name" href="${this.userName}">
                    <span class="clickable-text">${this.userName}</span>
                </a>
                <h3 class="post-title">${this.title}</h3>
                <p> 
                    ${this.content}
                </p>
                <img class="img-post" src="${this.fileUrl}" alt="imagen del post">
                <section class="post-actions">
                    <button class="action-btn">
                        <i class="fa-solid fa-thumbs-up"></i>
                        <span>${this.likes}</span> </button>
                    <button class="action-btn">
                        <i class="fa-solid fa-thumbs-down"></i>
                        <span>${this.dislikes}</span>
                    </button>
                    <button class="action-btn">
                        <i class="fa-solid fa-comment"></i>
                        <span>${this.commentsCount}</span>
                    </button>
                </section>
            
                <section class="comment-section">
                    <form class="comment-form">
                        <img class="avatar" src="../img/fotoCv-min.webp" alt="Tu avatar">
                        <textarea placeholder="Escribe un comentario..." rows="1"></textarea>
                        <button type="submit">Enviar</button>
                    </form>
                </section>
        `;
        return post;

    }
}

class User {
    
}
