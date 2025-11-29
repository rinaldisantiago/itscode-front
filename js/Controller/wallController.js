// js/Controller/wallController.js

import { PostRepository, buildFullUrl } from '../repository/postRepository.js';
import { PostPresentation } from '../presentation/postPresentation.js';
import { setupPostInteractions } from './postInteractionsController.js';

// --- CONSTANTES Y VARIABLES DE ESTADO PARA SCROLL INFINITO ---
const POSTS_CONTAINER_SELECTOR = '#posts-collection'; // Usamos el ID que definimos en el HTML
const POSTS_PER_PAGE = 10;

let currentPage = 1;
let isLoading = false;
let hasMorePosts = true;

// Instancia de PostPresentation para que sea accesible en las funciones de eventos
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

/**
 * 🚀 Lógica para buscar y renderizar publicaciones con paginación.
 * @param {string} userId - ID del usuario actual.
 * @param {PostRepository} postRepository - Instancia del repositorio de posts.
 */
async function fetchAndRenderPosts(userId, postRepository) {
    if (isLoading || !hasMorePosts) return;

    isLoading = true;
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) loadingIndicator.style.display = 'flex';

    try {
        // 🚀 SOLUCIÓN FINAL:
        // Para el muro, no pasamos 'idUserConsultado' (será null) y 'isMyPosts' es false.
        // El backend interpretará esto como "dame el feed del usuario 'userId'".
        const postList = await postRepository.getPostsForProfile(null, userId, false, currentPage, POSTS_PER_PAGE);

        if (postList && postList.length > 0) {
            // Hidratamos los posts para obtener toda la información
            const posts = await Promise.all(
                postList.map(p => postRepository.getPostById(p.id, userId))
            );

            // Usamos 'appendPosts' para añadir en lugar de reemplazar
            postPresentation.appendPosts(posts);
            currentPage++; // Preparamos para la siguiente página

            // Si la API devuelve menos posts de los que pedimos, asumimos que es la última página
            if (postList.length < POSTS_PER_PAGE) {
                hasMorePosts = false;
            }
        } else {
            hasMorePosts = false; // No hay más posts
        }
    } catch (error) {
        console.error("Error al cargar más publicaciones:", error);
        postPresentation.showError('No se pudieron cargar más publicaciones.');
    } finally {
        isLoading = false;
        if (loadingIndicator) loadingIndicator.style.display = 'none';
    }
}

/**
 * 🚀 Manejador del evento de scroll.
 */
const handleInfiniteScroll = async () => {
    // Obtenemos el userId y el repositorio desde el contexto de la vista
    const userSession = getUserSession();
    if (!userSession) return;
    const postRepository = new PostRepository();

    // Disparamos la carga un poco antes de llegar al final (300px)
    const endOfPage = window.innerHeight + window.scrollY >= document.body.offsetHeight - 300;

    if (endOfPage) {
        await fetchAndRenderPosts(userSession.id, postRepository);
    }
};

export async function loadWallView() {
    // --- 1. CONFIGURACIÓN INICIAL Y RESETEO DE ESTADO ---
    const userSession = getUserSession();
    if (!userSession || !userSession.id) {
        console.error("No hay sesión de usuario válida. Redirigiendo al login.");
        window.location.href = '../index.html';
        return;
    }
    const userId = userSession.id;

    // Reseteamos el estado cada vez que se carga la vista
    currentPage = 1;
    isLoading = false;
    hasMorePosts = true;

    loadUserData(userSession);

    const postRepository = new PostRepository();
    postPresentation = new PostPresentation(POSTS_CONTAINER_SELECTOR, userSession);
    const wallContainer = postPresentation.container;
    if (!wallContainer) { return; }

    // Limpiamos el contenedor y mostramos el spinner inicial
    postPresentation.clear();
    postPresentation.showLoading();

    // --- 2. CARGA DE LA PRIMERA PÁGINA ---
    await fetchAndRenderPosts(userId, postRepository);

    // --- 3. CONFIGURACIÓN DE INTERACCIONES Y EVENTOS ---
    setupPostInteractions(wallContainer, userId, postRepository, postPresentation);

    // Añadimos el listener para el scroll infinito
    window.addEventListener('scroll', handleInfiniteScroll);
}