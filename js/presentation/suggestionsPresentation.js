import { buildFullUrl } from '../repository/postRepository.js';

export class SuggestionsPresentation {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
    }

    showLoading() {
        if (this.container) {
            this.container.innerHTML = '<p class="loading-message">Buscando usuarios...</p>';
        }
    }

    renderSuggestions(users) {
        if (!this.container) return;

        if (!users || users.length === 0) {
            this.container.innerHTML = '<p class="empty-message">No se encontraron usuarios.</p>';
            return;
        }

        const suggestionsHtml = users.map(user => this.createSuggestionHtml(user)).join('');
        this.container.innerHTML = `<div class="suggestions-list">${suggestionsHtml}</div>`;
    }

    createSuggestionHtml(user) {
        const avatarUrl = buildFullUrl(user.avatar);
        const buttonText = user.isFollowing ? 'Dejar de Seguir' : 'Seguir';
        const buttonClass = user.isFollowing ? 'unfollow' : 'follow';

        return `
            <div class="card-user" data-user-id="${user.id}">
                <a href="./user-profile.html?id=${user.id}">
                    <img class="avatar" src="${avatarUrl}" alt="Avatar de ${user.userName}" />
                </a>
                <a class="user-name-search" href="./user-profile.html?id=${user.id}">
                    <span class="clickable-text">${user.userName}</span>
                </a>
                <button type="button" class="${buttonClass}" data-user-id="${user.id}" data-is-following="${user.isFollowing}">
                    ${buttonText}
                </button>
            </div>
        `;
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
