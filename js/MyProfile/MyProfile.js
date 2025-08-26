class MyProfile {
    constructor(myProfile) {
        this.imgAvatar = myProfile.imgAvatar;
        this.fullName = myProfile.fullName;
        this.email = myProfile.email;
        this.userName = myProfile.userName;
        this.publications = myProfile.publications;
        this.followers = myProfile.followers;
        this.followed = myProfile.followed;
    }

    getNode = () => {
        const myProfiles = document.createElement("section");
        myProfiles.className = "user-info";
        myProfiles.innerHTML = `
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
            <a href="update-user.html" class="edit-btn">
                <i class="fas fa-user-edit"></i> Editar
            </a> 
        `;

        return myProfiles;
    }
}

class MyPosts{
    constructor(myPosts) {
        this.postsTitle = myPosts.postsTitle;
        this.imgPost = myPosts.imgPost;
        this.postContent = myPosts.postContent;
        this.countsLikes = myPosts.countsLikes;
        this.countsDislikes = myPosts.countsDislikes;
        this.countsComments = myPosts.countsComments;
        this.imgAvatar = myPosts.imgAvatar;
    }

    getNode = () => {
        const myPosts = document.createElement("article");
        myPosts.className = "post";
        myPosts.innerHTML = `
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

        return myPosts;
    }

}