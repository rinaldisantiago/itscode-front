class Following {
  constructor(following) {
    this.fullName = following.fullName;
    this.urlAvatar = following.urlAvatar;
  } 
  
  getNode = () => {
        const following = document.createElement('div');
        following.className = 'card-user';
        following.innerHTML = `
            <img class="avatar" src="${this.urlAvatar}" alt="Avatar del Usuario" />
            <a class="user-name-search" href="user-profile.html">
                <span class="clickable-text">${this.fullName}</span>
            </a>
            <button type="button">Seguir</button>
        `;

        return following;
    }
}