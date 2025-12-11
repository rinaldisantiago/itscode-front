import { PostRepository, buildFullUrl } from '../repository/postRepository.js';
import { PostPresentation } from '../presentation/postPresentation.js';
import { setupPostInteractions } from './postInteractionsController.js';

const POSTS_CONTAINER_SELECTOR = '#posts-collection';
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

const loadUserData = (userSession) => {
    if (!userSession) return;
    const avatarImg = document.getElementById('user-avatar-redirect');
    if (avatarImg) {
        const avatarPath = userSession.urlAvatar;
        avatarImg.src = buildFullUrl(avatarPath);
    }
};

async function fetchAndRenderPosts(userId, postRepository) {
    if (isLoading || !hasMorePosts) return;

    isLoading = true;
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) loadingIndicator.style.display = 'flex';

    try {
        const postList = await postRepository.getPostsForProfile(null, userId, false, currentPage, POSTS_PER_PAGE);

        if (postList && postList.length > 0) {
            const posts = await Promise.all(
                postList.map(p => postRepository.getPostById(p.id, userId))
            );

            postPresentation.appendPosts(posts);
            currentPage++;

            if (postList.length < POSTS_PER_PAGE) {
                hasMorePosts = false;
            }
        } else {
            hasMorePosts = false; // No hay más posts
        }
    } catch (error) {
        postPresentation.showError('No se pudieron cargar más publicaciones.');
    } finally {
        isLoading = false;
        if (loadingIndicator) loadingIndicator.style.display = 'none';
    }
}

const createInfiniteScrollHandler = (callback, offset = 300) => {
    return async () => {
        const endOfPage = window.innerHeight + window.scrollY >= document.body.offsetHeight - offset;
        if (endOfPage) {
            await callback();
        }
    };
};

const handleInfiniteScroll = createInfiniteScrollHandler(async () => {
    const userSession = getUserSession();
    if (!userSession) return;
    const postRepository = new PostRepository();
    await fetchAndRenderPosts(userSession.id, postRepository);
});

export async function loadWallView() {
    const userSession = getUserSession();
    if (!userSession || !userSession.id) {
        window.location.href = '../index.html';
        return;
    }
    const userId = userSession.id;

    currentPage = 1;
    isLoading = false;
    hasMorePosts = true;

    loadUserData(userSession);

    const postRepository = new PostRepository();
    postPresentation = new PostPresentation(POSTS_CONTAINER_SELECTOR, userSession);
    const wallContainer = postPresentation.container;
    if (!wallContainer) { return; }

    postPresentation.clear();
    postPresentation.showLoading();

    await fetchAndRenderPosts(userId, postRepository);

    setupPostInteractions(wallContainer, userId, postRepository, postPresentation);

    window.addEventListener('scroll', handleInfiniteScroll);
}