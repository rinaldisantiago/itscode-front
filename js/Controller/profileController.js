import { PostRepository } from '../repository/postRepository.js';
import { getUserById } from '../repository/userRepository.js';
import { UserPresentation } from '../presentation/profilePresentation.js';
import { PostPresentation } from '../presentation/postPresentation.js';
import { setupPostInteractions } from './postInteractionsController.js';

const MY_PROFILE_CONTAINER_SELECTOR = '#infoUserContainer';
const MY_POSTS_CONTAINER_SELECTOR = '#myPostsContainer';
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


async function fetchAndRenderProfilePosts(userId, postRepository) {
    if (isLoading || !hasMorePosts) return;

    isLoading = true;
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) loadingIndicator.style.display = 'flex';

    try {
        const postList = await postRepository.getPostsForProfile(userId, userId, true, currentPage, POSTS_PER_PAGE);

        if (postList && postList.length > 0) {
            const userPosts = await Promise.all(
                postList.map(p => postRepository.getPostById(p.id, userId))
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

const handleProfileInfiniteScroll = async () => {
    const userSession = getUserSession();
    if (!userSession) return;
    const postRepository = new PostRepository();

    const endOfPage = window.innerHeight + window.scrollY >= document.body.offsetHeight - 300;

    if (endOfPage) {
        await fetchAndRenderProfilePosts(userSession.id, postRepository);
    }
};

export async function loadProfileView() {
    const userSession = getUserSession();
    if (!userSession) {
        window.location.href = '../index.html';
        return;
    }
    const loggedUserId = userSession.id;

    const userPresentation = new UserPresentation(MY_PROFILE_CONTAINER_SELECTOR);
    postPresentation = new PostPresentation(MY_POSTS_CONTAINER_SELECTOR, userSession, { isMyProfilePage: true });

    userPresentation.showLoading();
    postPresentation.clear();
    postPresentation.showLoading();

    try {
        const postRepo = new PostRepository();
        const userData = await getUserById(loggedUserId, loggedUserId);
        userPresentation.renderProfile(userData, true);

        await fetchAndRenderProfilePosts(loggedUserId, postRepo);

        const postsContainer = document.querySelector(MY_POSTS_CONTAINER_SELECTOR);
        setupPostInteractions(postsContainer, loggedUserId, postRepo, postPresentation, { handleDelete: true });
        window.addEventListener('scroll', handleProfileInfiniteScroll);

    } catch (error) {
        userPresentation.showError("No se pudo cargar la información del perfil.");
        postPresentation.showError("No se pudieron cargar las publicaciones.");
    }
}
