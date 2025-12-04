import { searchUsers, getSuggestions } from '../repository/userRepository.js';
import { FollowingRepository } from '../repository/followingRepository.js';
import { SuggestionsPresentation } from '../presentation/suggestionsPresentation.js';

const SEARCH_INPUT_SELECTOR = '#search-input';
const RESULTS_CONTAINER_SELECTOR = '#search-results';

const getUserSession = () => {
    const sessionData = localStorage.getItem('userSession');
    if (!sessionData) return null;
    return JSON.parse(sessionData);
};

function debounce(func, delay) {
    let timeout;
    return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

export async function loadSuggestionsView() {
    const userSession = getUserSession();
    if (!userSession?.id) {
        window.location.href = '../index.html';
        return;
    }

    const searchInput = document.querySelector(SEARCH_INPUT_SELECTOR);
    const resultsContainer = document.querySelector(RESULTS_CONTAINER_SELECTOR);

    if (!searchInput || !resultsContainer) {
        return;
    }

    const presentation = new SuggestionsPresentation(RESULTS_CONTAINER_SELECTOR);
    const followingRepo = new FollowingRepository();

    const loadInitialSuggestions = async () => {
        presentation.showLoading();
        const results = await getSuggestions(userSession.id);
        const loggedId = parseInt(userSession.id || userSession.Id);
        const filteredSuggestions = results.suggestions.filter(user => parseInt(user.id || user.Id) !== loggedId);
        presentation.renderSuggestions(filteredSuggestions);

    };

    const performSearch = async (searchTerm) => {
        if (searchTerm.length < 2) {
            resultsContainer.innerHTML = '';
            return;
        }
        presentation.showLoading();

        const results = await searchUsers(searchTerm, userSession.id);
        const loggedId = parseInt(userSession.id || userSession.Id);
        const filteredUsers = results.users.filter(user => parseInt(user.id || user.Id) !== loggedId);
        presentation.renderSuggestions(filteredUsers);
    };

    searchInput.addEventListener('input', debounce((e) => {
        performSearch(e.target.value.trim());
    }, 300));

    resultsContainer.addEventListener('click', async (event) => {
        const button = event.target.closest('.follow, .unfollow');
        if (!button) return;

        const userIdToFollow = button.dataset.userId;
        const isCurrentlyFollowing = button.dataset.isFollowing === 'true';
        button.disabled = true;

        try {
            if (isCurrentlyFollowing) {
                await followingRepo.unfollowUser(userSession.id, userIdToFollow);
                presentation.updateFollowButton(button, false);
            } else {
                await followingRepo.followUser(userSession.id, userIdToFollow);
                presentation.updateFollowButton(button, true);
            }
        } finally {
            button.disabled = false;
        }
    });

    loadInitialSuggestions();
}
