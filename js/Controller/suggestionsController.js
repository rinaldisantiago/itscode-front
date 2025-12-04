import { searchUsers, getSuggestions } from '../repository/userRepository.js';
import { FollowingRepository } from '../repository/followingRepository.js';
import { SuggestionsPresentation } from '../presentation/suggestionsPresentation.js';

const SEARCH_INPUT_SELECTOR = '#search-input';
const RESULTS_CONTAINER_SELECTOR = '#search-results';
const SUGGESTIONS_PER_PAGE = 8;

let currentPage = 1;
let isLoading = false;
let hasMorePosts = true;

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

    const fetchAndRenderSuggestions = async () => {
        if (isLoading || !hasMorePosts) return;
        isLoading = true;

        if (currentPage === 1) {
            presentation.showLoading();
        } else {
            presentation.showLoadingIndicator();
        }
        try {
            const results = await getSuggestions(userSession.id, currentPage, SUGGESTIONS_PER_PAGE);
            const loggedId = parseInt(userSession.id || userSession.Id);
            const filteredSuggestions = results.suggestions.filter(user => parseInt(user.id || user.Id) !== loggedId);

            if (currentPage === 1) {
                presentation.renderSuggestions(filteredSuggestions);
            } else {
                presentation.appendSuggestions(filteredSuggestions);
            }
            currentPage++;
            hasMorePosts = filteredSuggestions.length === SUGGESTIONS_PER_PAGE;
        } finally {
            isLoading = false;
            presentation.hideLoadingIndicator();
        }
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

    const handleInfiniteScroll = async () => {
        const endOfPage = window.innerHeight + window.scrollY >= document.body.offsetHeight - 300;
        if (endOfPage && !isLoading && hasMorePosts && !searchInput.value.trim()) {
            await fetchAndRenderSuggestions();
        }
    };

    searchInput.addEventListener('input', debounce((e) => {
        const searchTerm = e.target.value.trim();
        if (searchTerm) {
            window.removeEventListener('scroll', handleInfiniteScroll);
            performSearch(searchTerm);
        } else {
            currentPage = 1;
            hasMorePosts = true;
            fetchAndRenderSuggestions();
            window.addEventListener('scroll', handleInfiniteScroll);
        }
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

    currentPage = 1;
    isLoading = false;
    hasMorePosts = true;
    window.removeEventListener('scroll', handleInfiniteScroll);
    fetchAndRenderSuggestions();
    window.addEventListener('scroll', handleInfiniteScroll);
}
