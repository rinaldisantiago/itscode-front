import { UserPresentation } from '../presentation/profilePresentation.js';
import { PostPresentation } from '../presentation/postPresentation.js';
import { getUserById } from '../repository/userRepository.js';
import { FollowingRepository } from '../repository/followingRepository.js';
import { PostRepository } from '../repository/postRepository.js';
import { setupPostInteractions } from './postInteractionsController.js';

const MY_PROFILE_CONTAINER_SELECTOR = '#infoUserContainer';
const VISITED_PROFILE_CONTAINER_SELECTOR = '#infoUserVisit';
const MY_POSTS_CONTAINER_SELECTOR = '#myPostsContainer';
const USER_POSTS_CONTAINER_SELECTOR = '#userPosts';
const POSTS_PER_PAGE = 10;

let currentPage = 1;
let isLoading = false;
let hasMorePosts = true;
let postPresentation;


const getUserSession = () => {
    const sessionData = localStorage.getItem('userSession');
    if (!sessionData) return null;
    const rawUser = JSON.parse(sessionData);
    return {
        id: rawUser.Id || rawUser.id,
        userName: rawUser.UserName || rawUser.userName,
        urlAvatar: rawUser.UrlAvatar || rawUser.urlAvatar
    };
};


async function fetchAndRenderVisitedProfilePosts(visitedUserId, loggedUserId, postRepository) {
    if (isLoading || !hasMorePosts) return;

    isLoading = true;
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) loadingIndicator.style.display = 'flex';

    try {
        const postList = await postRepository.getPostsForProfile(visitedUserId, visitedUserId, true, currentPage, POSTS_PER_PAGE);

        if (postList && postList.length > 0) {
            const userPosts = await Promise.all(
                postList.map(p => postRepository.getPostById(p.id, loggedUserId))
            );

            postPresentation.appendPosts(userPosts);
            currentPage++;

            if (userPosts.length < POSTS_PER_PAGE) {
                hasMorePosts = false;
            }
        } else {
            hasMorePosts = false;
        }
    } catch (error) {
        postPresentation.showError('No se pudieron cargar más publicaciones.');
    } finally {
        isLoading = false;
        if (loadingIndicator) loadingIndicator.style.display = 'none';
    }
}

const handleVisitedProfileInfiniteScroll = async () => {
    const userSession = getUserSession();
    if (!userSession) return;

    const urlParams = new URLSearchParams(window.location.search);
    const visitedUserId = urlParams.get('id');
    if (!visitedUserId) return;

    const postRepository = new PostRepository();
    const endOfPage = window.innerHeight + window.scrollY >= document.body.offsetHeight - 300;

    if (endOfPage) {
        await fetchAndRenderVisitedProfilePosts(visitedUserId, userSession.id, postRepository);
    }
};

export async function loadVisitedProfileView() {
    const userSession = getUserSession();
    if (!userSession || !userSession.id) {
        window.location.href = '../index.html';
        return;
    }

    const loggedUserId = userSession.id;

    const urlParams = new URLSearchParams(window.location.search);
    const visitedUserId = urlParams.get('id');

    if (!visitedUserId) {
        window.location.href = 'wall.html';
        return;
    }

    if (parseInt(visitedUserId) === loggedUserId) {
        window.location.href = 'my-profile.html';
        return;
    }

    currentPage = 1;
    isLoading = false;
    hasMorePosts = true;
    window.removeEventListener('scroll', handleVisitedProfileInfiniteScroll); // Limpiamos listener previo

    const userPresentation = new UserPresentation(VISITED_PROFILE_CONTAINER_SELECTOR);
    userPresentation.showLoading();

    const postRepo = new PostRepository();

    try {
        const userData = await getUserById(visitedUserId, loggedUserId);

        userPresentation.renderProfile(userData, false);

        const profileContainer = document.querySelector(VISITED_PROFILE_CONTAINER_SELECTOR);

        if (profileContainer && !profileContainer.dataset.listenerAttached) {
            profileContainer.dataset.listenerAttached = 'true';

            profileContainer.addEventListener('click', handleFollowClick);
        }

        const postsContainer = document.querySelector(USER_POSTS_CONTAINER_SELECTOR);
        const postsTitle = document.querySelector('.user-profile-post h2');

        if (userData.isFollowing) {
            if (postsTitle) postsTitle.style.display = 'block';
            postPresentation = new PostPresentation(USER_POSTS_CONTAINER_SELECTOR, userSession);
            postPresentation.clear();
            postPresentation.showLoading();

            await fetchAndRenderVisitedProfilePosts(visitedUserId, loggedUserId, postRepo);

            setupPostInteractions(postsContainer, loggedUserId, postRepo, postPresentation);
            window.addEventListener('scroll', handleVisitedProfileInfiniteScroll);

        } else {
            if (postsTitle) postsTitle.style.display = 'none';
            if (postsContainer) {
                postsContainer.innerHTML = `<p class="empty-message">Debes seguir a este usuario para ver sus publicaciones.</p>`;
            }
        }

    } catch (error) {
        userPresentation.showError("No se pudo cargar el perfil de este usuario.");
    }
}

async function handleFollowClick(event) {
    const button = event.target.closest('.follow, .unfollow');
    if (!button) return;

    const loggedUserId = getUserSession()?.id;
    const userIdToFollow = button.dataset.userId;
    const isCurrentlyFollowing = button.dataset.isFollowing === 'true';

    const followingRepo = new FollowingRepository();
    const postRepo = new PostRepository();
    const userPresentation = new UserPresentation(VISITED_PROFILE_CONTAINER_SELECTOR);

    button.disabled = true;
    const action = isCurrentlyFollowing ? followingRepo.unfollowUser : followingRepo.followUser;

    try {
        await action(loggedUserId, userIdToFollow);
        userPresentation.updateFollowButton(button, !isCurrentlyFollowing);

        const postsContainer = document.querySelector(USER_POSTS_CONTAINER_SELECTOR);
        if (!isCurrentlyFollowing) {
            postPresentation = new PostPresentation(USER_POSTS_CONTAINER_SELECTOR, getUserSession());
            postPresentation.clear();
            postPresentation.showLoading();

            currentPage = 1;
            hasMorePosts = true;
            await fetchAndRenderVisitedProfilePosts(userIdToFollow, loggedUserId, postRepo);

            setupPostInteractions(postsContainer, loggedUserId, postRepo, postPresentation);
            const postsTitle = document.querySelector('.user-profile-post h2');
            if (postsTitle) postsTitle.style.display = 'block';
        } else {
            postsContainer.innerHTML = `<p class="empty-message">Debes seguir a este usuario para ver sus publicaciones.</p>`;
            const postsTitle = document.querySelector('.user-profile-post h2');
            if (postsTitle) postsTitle.style.display = 'none';
        }
    } finally {
        button.disabled = false;
    }
}