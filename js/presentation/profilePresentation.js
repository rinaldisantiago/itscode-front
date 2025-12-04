import { buildFullUrl } from '../repository/postRepository.js';

export class UserPresentation {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
    }

    showLoading() {
        if (this.container) {
            this.container.innerHTML = '<p class="loading-message">Cargando perfil...</p>';
        }
    }

    showError(message) {
        if (this.container) {
            this.container.innerHTML = `<p class="error-message">${message}</p>`;
        }
    }


    renderProfile(userData, isMyProfile = true) {
        if (!this.container || !userData) {
            this.showError("No se pudo renderizar el perfil.");
            return;
        }

        const avatarUrl = buildFullUrl(userData.urlAvatar);

        let actionButtonHtml = '';
        if (isMyProfile) {
            actionButtonHtml = `<a href="update-user.html" class="edit-btn">
                    <i class="fas fa-user-edit"></i> Editar
                </a>`;
        } else {
            const isFollowing = userData.isFollowing || userData.isFollowing;
            const buttonText = isFollowing ? 'Dejar de Seguir' : 'Seguir';
            const buttonClass = isFollowing ? 'unfollow' : 'follow';

            actionButtonHtml = `<button type="button" class="${buttonClass}" data-user-id="${userData.id}" data-is-following="${isFollowing}">
                    ${buttonText}
                </button>`;
        }

        const profileHtml = `
            <img src="${avatarUrl}" id="avatar" class="avatar" alt="Avatar de ${userData.userName}">
            <article class="details">
                <h2 id="nickname">${userData.userName}</h2>
                <h3 id="name">${userData.fullName}</h3>
                <p id="bio">${userData.email}</p>
            </article>
            <article class="stats">
                <!-- Estos datos son estáticos por ahora, se pueden añadir más adelante -->
            </article>
            ${actionButtonHtml}
        `;

        this.container.className = 'user-info';
        this.container.innerHTML = profileHtml;
    }

    updateFollowButton(button, isFollowing) {
        button.dataset.isFollowing = isFollowing;
        if (isFollowing) {
            button.textContent = 'Dejar de Seguir';
            button.classList.remove('follow');
            button.classList.add('unfollow');
        } else {
            button.textContent = 'Seguir';
            button.classList.remove('unfollow');
            button.classList.add('follow');
        }
    }
}