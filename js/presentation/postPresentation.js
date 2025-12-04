import { buildFullUrl } from '../repository/postRepository.js';
import { INTERACTION_TYPE } from '../repository/interactionRepository.js';

export class PostPresentation {

    constructor(containerSelector, loggedUser, config = {}) {
        this.container = document.querySelector(containerSelector);
        this.loggedUser = loggedUser;
        this.config = config;
    }

    showLoading() {
        if (this.container) {
            this.container.innerHTML = '<p class="loading-message">Cargando publicaciones...</p>';
        }
    }

    hideLoading() {
        const loadingMessage = this.container.querySelector('.loading-message');
        if (loadingMessage) {
            loadingMessage.remove();
        }
    }

    showError(message) {
        this.container.innerHTML = `<div class="error">${message}</div>`;
    }

    clear() {
        if (this.container) this.container.innerHTML = '';
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

    appendPosts(posts) {
        if (!this.container || !posts || posts.length === 0) {
            return;
        }
        this.hideLoading();

        const postsHtml = posts.map(post => this.createPostHtml(post)).join('');
        this.container.insertAdjacentHTML('beforeend', postsHtml);
    }

    updateSinglePost(post) {
        const postElement = this.container.querySelector(`.post[data-post-id="${post.id}"]`);
        if (postElement) {
            postElement.outerHTML = this.createPostHtml(post);
        }
    }

    appendComments(postElement, newComments) {
        if (!postElement) return;
        const commentsList = postElement.querySelector(`.comments-list`);
        if (commentsList && newComments.length > 0) {
            const commentsHtml = newComments.map(comment => this.createCommentHtml(comment, { id: postElement.dataset.postId, idUser: postElement.dataset.idUser })).join('');
            commentsList.insertAdjacentHTML('beforeend', commentsHtml);
        }
    }

    updateCommentsSection(postElement, comments, totalComments) {
        const commentsContainer = postElement.querySelector('.comment-section');
        if (!commentsContainer) return;

        const commentsCountElement = postElement.querySelector('.comments-count');
        if (commentsCountElement) {
            commentsCountElement.textContent = totalComments;
        }

        const commentsListHtml = comments.map(comment => this.createCommentHtml(comment, postElement.dataset.postId)).join('');
        commentsContainer.querySelector('.existing-comments .comments-list').innerHTML = commentsListHtml;

        const loadMoreButton = commentsContainer.querySelector('.load-more-comments-btn');
        const newButtonHtml = this.getLoadMoreButtonHtml({ id: postElement.dataset.postId, commentsCount: totalComments, comments: comments });

        if (loadMoreButton) {
            loadMoreButton.outerHTML = newButtonHtml;
        } else if (newButtonHtml) {
            commentsContainer.insertAdjacentHTML('beforeend', newButtonHtml);
        }
    }

    createPostHtml(post) {
        const postImageUrl = post.fileUrl ? buildFullUrl(post.fileUrl) : '';
        const avatarUrl = buildFullUrl(post.userAvatar);
        const loggedUserAvatarUrl = buildFullUrl(this.loggedUser.urlAvatar);
        const commentsHtml = post.comments.map(comment => this.createCommentHtml(comment, { id: post.id, idUser: post.idUser })).join('');
        const isLiked = post.userInteraction?.type === INTERACTION_TYPE.LIKE;
        const isDisliked = post.userInteraction?.type === INTERACTION_TYPE.DISLIKE;
        const canShowDeleteButton = this.config.isMyProfilePage && (this.loggedUser.id === post.idUser);

        const deleteButtonHtml = canShowDeleteButton ? `
            <button class="delete-post-btn" data-post-id="${post.id}" title="Eliminar post">
                <i class="fa-solid fa-trash"></i>
            </button>
        ` : '';

        return `
            <article class="post" data-post-id="${post.id}" data-id-user="${post.idUser}">
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

    createCommentHtml(comment, post) {
        const avatarUrl = buildFullUrl(comment.avatarUrl);
        const userName = comment.username;

        const isCommentOwner = parseInt(this.loggedUser.id) === parseInt(comment.userId);
        const isPostOwner = parseInt(this.loggedUser.id) === parseInt(post.idUser);

        const canDelete = isCommentOwner || isPostOwner;

        const deleteButtonHtml = canDelete ? `
            <button class="delete-comment-btn" data-comment-id="${comment.id}" data-post-id="${post.id}" title="Eliminar comentario">
                <i class="fa-solid fa-trash"></i>
            </button>
        ` : '';


        return `
            <div class="comment-item" data-comment-id="${comment.id}">
                <a href="user-profile.html?id=${comment.userId}">
                    <img class="avatar comment-avatar" src="${avatarUrl}" alt="Avatar de ${userName}">
                </a>
                <div class="comment-body">
                    <a class="user-name" href="user-profile.html?id=${comment.userId}">${userName}</a>
                    <p class="comment-content">${comment.content}</p>
                </div>
                ${deleteButtonHtml}
            </div>
        `;
    }

    getLoadMoreButtonHtml(post) {
        const commentsLoaded = post.comments.length;
        if (post.commentsCount > commentsLoaded) {
            const nextPage = Math.floor(commentsLoaded / 3) + 1;
            return `<button class="load-more-comments-btn action-btn" data-post-id="${post.id}" data-next-page="${nextPage}">Ver más comentarios</button>`;
        }
        return '';
    }
}