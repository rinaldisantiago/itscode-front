class UserProfile {
    constructor(userProfile) {
        this.imgAvatar = userProfile.imgAvatar;
        this.fullName = userProfile.fullName;
        this.email = userProfile.email;
        this.userName = userProfile.userName;
        this.publications = userProfile.publications;
        this.followers = userProfile.followers;
        this.followed = userProfile.followed;
    }

    getNode = () => {
        const userProfile = document.createElement("section");
        userProfile.className = "user-info";
        userProfile.innerHTML = `
            <img src="${this.imgAvatar}" id="avatar" class="avatar" alt="Avatar del Usuario">
            <article class="details">
                <h2 id="nickname">${this.userName}</h2>
                <h3 id="name">${this.fullName}</h3>
                <p id="bio">${this.email}</p>
            </article>
            <article class="stats">
                <span>${this.publications} publicaciones</span>
                <span>${this.followers} seguidores</span>
                <span>${this.followed} seguidos</span>
            </article>
            <button class="follow-btn"><i class="fas fa-user-friends"></i>Dejar de Seguir</button>            
        `;

        return userProfile;
    }
}

class UserPosts{
    constructor(userPosts) {
        this.postsTitle = userPosts.postsTitle;
        this.imgPost = userPosts.imgPost;
        this.postContent = userPosts.postContent;
        this.countsLikes = userPosts.countsLikes;
        this.countsDislikes = userPosts.countsDislikes;
        this.countsComments = userPosts.countsComments;
        this.imgAvatar = userPosts.imgAvatar;
    }

    getNode = () => {
        const userPosts = document.createElement("article");
        userPosts.className = "post";
        userPosts.innerHTML = `
             <h3 class="post-title">${this.postsTitle}</h3>
                <p>
                    ${this.postContent}
                </p>
                <img class="img-post" src="${this.imgPost}" alt="tres personas viendo un pizarron">
                <section class="post-actions">
                    <button class="action-btn">
                        <i class="fa-solid fa-thumbs-up"></i>
                        <span>${this.countsLikes}</span> </button>
                    <button class="action-btn">
                        <i class="fa-solid fa-thumbs-down"></i>
                        <span>${this.countsDislikes}</span>
                    </button>
                    <button class="action-btn">
                        <i class="fa-solid fa-comment"></i>
                        <span>${this.countsComments}</span>
                    </button>
                </section>
            
                <section class="comment-section">
                    <form class="comment-form">
                        <img class="avatar" src="${this.imgAvatar}" alt="Tu avatar">
                        <textarea placeholder="Escribe un comentario..." rows="1"></textarea>
                        <button type="submit">Enviar</button>
                    </form>
                </section>
        `;

        return userPosts;
    }

}