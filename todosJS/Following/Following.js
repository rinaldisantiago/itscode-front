class Following {
    constructor(userData) {
        this.id = userData.id || userData.userId;
        this.userName = userData.userName || userData.UserName || userData.fullName;
        this.avatar = userData.avatar || userData.Avatar || userData.urlAvatar;
        this.isFollowing = userData.isFollowing || false;
    } 
    
    /**
     * Crea el nodo DOM para la tarjeta de usuario
     * @returns {HTMLElement} Elemento DOM de la tarjeta
     */
    getNode() {
        const userCard = document.createElement('div');
        userCard.className = 'card-user';
        userCard.dataset.userId = this.id;
        userCard.dataset.userName = this.userName;

        const buttonText = this.isFollowing ? 'Siguiendo' : 'Seguir';
        const buttonClass = this.isFollowing ? 'following' : '';

        userCard.innerHTML = `
            <img class="avatar" src="${this.avatar}" alt="Avatar de ${this.userName}" />
            <a class="user-name-search" href="user-profile.html?id=${this.id}">
                <span class="clickable-text">${this.userName}</span>
            </a>
            <button type="button" class="${buttonClass}" ${this.isFollowing ? 'disabled' : ''}>
                ${buttonText}
            </button>
        `;

        return userCard;
    }

    /**
     * Actualiza el estado de seguimiento
     * @param {boolean} isFollowing - Nuevo estado de seguimiento
     */
    updateFollowStatus(isFollowing) {
        this.isFollowing = isFollowing;
    }
}

// Exportar la clase
export { Following };                    