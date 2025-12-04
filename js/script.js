import { loadWallView } from './Controller/wallController.js';
import { loadSignupView, loadLoginView } from './presentation/authPresentation.js';
import { apiFetch } from './fetch.js';
import { loadPostCreateView } from './presentation/postCreatePresentation.js';
import { loadProfileView } from './Controller/profileController.js';
import { loadVisitedProfileView } from './Controller/userProfileController.js';
import { loadUpdateUserView } from './Controller/updateUserController.js';
import { loadSuggestionsView } from './Controller/suggestionsController.js';


function initializeApp() {
    const path = window.location.pathname;

    if (path.includes('sign-up.html')) {
        loadSignupView();
    }

    else if (path.endsWith('/') || path.endsWith('/index.html')) {
        loadLoginView();
    }

    else if (path.includes('post-create.html')) {
        loadPostCreateView();
    }

    else if (path.includes('my-profile.html')) {
        loadProfileView();
    }

    else if (path.includes('user-profile.html')) {
        loadVisitedProfileView();
    }

    else if (path.includes('wall.html')) {
        loadWallView();
    }

    else if (path.includes('update-user.html')) {
        loadUpdateUserView();
    }

    else if (path.includes('following.html')) {
        loadSuggestionsView();
    }

    setupNavBarToggle();
    setupLogoutHandler();
}


function setupNavBarToggle() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.getElementById('nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
}

function setupLogoutHandler() {
    const logoutConfirmButton = document.querySelector('.button-modal-boostrap');

    if (logoutConfirmButton) {
        logoutConfirmButton.addEventListener('click', async (event) => {
            event.preventDefault();

            const userSession = JSON.parse(localStorage.getItem('userSession'));
            const loginUrl = logoutConfirmButton.href;

            if (userSession && userSession.id) {
                await apiFetch(`/Session/${userSession.id}`, { method: 'POST' });
            }
            localStorage.removeItem('userSession');
            window.location.href = loginUrl;
        });
    }
}

document.addEventListener('DOMContentLoaded', initializeApp);
