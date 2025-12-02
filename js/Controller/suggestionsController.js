// js/Controller/suggestionsController.js

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

/**
 * Función para manejar la búsqueda de usuarios con un retardo (debounce).
 */
function debounce(func, delay) {
    let timeout;
    return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}

/**
 * Función principal para cargar la vista de búsqueda/sugerencias.
 */
export async function loadSuggestionsView() {
    const userSession = getUserSession();
    if (!userSession?.id) {
        window.location.href = '../index.html';
        return;
    }

    const searchInput = document.querySelector(SEARCH_INPUT_SELECTOR);
    const resultsContainer = document.querySelector(RESULTS_CONTAINER_SELECTOR);

    if (!searchInput || !resultsContainer) {
        console.error("No se encontraron los elementos de búsqueda en el DOM.");
        return;
    }

    const presentation = new SuggestionsPresentation(RESULTS_CONTAINER_SELECTOR);
    const followingRepo = new FollowingRepository();

    // --- 🚀 LÓGICA NUEVA: Cargar sugerencias por defecto ---
    const loadInitialSuggestions = async () => {
        presentation.showLoading();
        try {
            // Llamamos a la nueva función del repositorio
            const results = await getSuggestions(userSession.id);

            // ✅ CORRECCIÓN: Filtramos para excluir al usuario logueado de las sugerencias.
            // Hacemos el filtro más robusto para contemplar 'id' o 'Id'.
            // Usamos parseInt() para evitar problemas de comparación entre string y number.
            const loggedId = parseInt(userSession.id || userSession.Id);
            const filteredSuggestions = results.suggestions.filter(user => parseInt(user.id || user.Id) !== loggedId);
            presentation.renderSuggestions(filteredSuggestions);

        } catch (error) {
            console.error("Error al cargar las sugerencias iniciales:", error);
        }
    };

    const performSearch = async (searchTerm) => {
        if (searchTerm.length < 2) {
            resultsContainer.innerHTML = '';
            return;
        }
        presentation.showLoading();
        try {
            const results = await searchUsers(searchTerm, userSession.id);

            // ✅ CORRECCIÓN: Filtramos también en los resultados de búsqueda.
            // Hacemos el filtro más robusto para contemplar 'id' o 'Id'.
            // Usamos parseInt() para evitar problemas de comparación entre string y number.
            const loggedId = parseInt(userSession.id || userSession.Id);
            const filteredUsers = results.users.filter(user => parseInt(user.id || user.Id) !== loggedId);
            presentation.renderSuggestions(filteredUsers);
        } catch (error) {
            console.error("Error al buscar usuarios:", error);
        }
    };

    // Usamos debounce para no saturar la API con cada tecla presionada
    searchInput.addEventListener('input', debounce((e) => {
        performSearch(e.target.value.trim());
    }, 300));

    // Delegación de eventos para los botones de "Seguir"
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
        } catch (error) {
            console.error("Error al seguir/dejar de seguir:", error);
        } finally {
            button.disabled = false;
        }
    });

    // --- 🚀 EJECUCIÓN: Cargamos las sugerencias al iniciar la vista ---
    loadInitialSuggestions();
}
