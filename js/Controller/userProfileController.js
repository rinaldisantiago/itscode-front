// js/Views/myProfileViews.js

// 👇 CAMBIO: Importamos la función directamente, no la clase
import { getUserById } from '../repository/userRepository.js'; 
import { UserPresentation } from '../presentation/userPresentation.js';

const PROFILE_CONTAINER_SELECTOR = '#infoUser';

const getUserSession = () => {
    const sessionData = localStorage.getItem('userSession');
    return sessionData ? JSON.parse(sessionData) : null;
};

export async function loadMyProfileView() {
    const userSession = getUserSession();
    
    if (!userSession || !userSession.id) {
        console.error("No hay sesión de usuario válida. Redirigiendo al login.");
        window.location.href = '../index.html';
        return;
    }
    
    const userId = userSession.id;
    // 👇 CAMBIO: Ya no necesitamos crear una instancia de UserRepository
    const userPresentation = new UserPresentation(PROFILE_CONTAINER_SELECTOR);

    userPresentation.showLoading();

    try {
        // 👇 CAMBIO: Llamamos directamente a la función importada
        const userData = await getUserById(userId); 
        userPresentation.renderProfile(userData);
        
    } catch (error) {
        console.error("Error al cargar el perfil:", error);
        userPresentation.showError("No se pudo cargar la información del perfil. Inténtalo de nuevo más tarde.");
    }
}