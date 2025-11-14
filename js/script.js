import { loadWallView } from './Controller/wallController.js';
import { loadSignupView, loadLoginView } from './presentation/authPresentation.js'; 
import { loadPostCreateView } from './presentation/postCreatePresentation.js'; 
import { loadProfileView } from './Controller/profileController.js';
import { loadUpdateUserView } from './Controller/updateUserController.js';


// =======================================================
// FUNCIÓN PRINCIPAL DE INICIALIZACIÓN
// =======================================================

function initializeApp() {
    // Lógica para detectar qué página estamos cargando
    const path = window.location.pathname;
    
    // --- CONTROL DE RUTAS ESPECÍFICAS ---
    
    // Ruta: REGISTRO (sign-up.html)
    if (path.includes('sign-up.html')) {
        loadSignupView();
        console.log("Cargando controlador de Registro.");
    } 
    
    // Ruta: LOGIN (index.html o la raíz /)
    else if (path.endsWith('/') || path.endsWith('/index.html')) {
        loadLoginView();
        console.log("Cargando controlador de Login.");
    }
    
    // Ruta: CREAR POST (post-create.html)
    else if (path.includes('post-create.html')) {
        loadPostCreateView();
        console.log("Cargando controlador de Creación de Post.");
    }

    // 🚀 NUEVA RUTA: MI PERFIL (my-profile.html)
    else if (path.includes('my-profile.html')) {
        loadProfileView();
        console.log("Cargando vista de Mi Perfil.");
    }

    // Ruta: Muro principal (wall.html)
    else if (path.includes('wall.html')) {
        loadWallView(); 
        console.log("Cargando vista del Muro.");
    } 

    else if (path.includes('update-user.html')) { // Asegúrate que el nombre del archivo coincida
        loadUpdateUserView();
        console.log("Cargando vista de Actualización de Perfil.");
    }
    
    // --- LÓGICA GLOBAL (se ejecuta en todas las páginas) ---
    setupNavBarToggle();
    setupLogoutHandler(); // Ahora esta función tiene lógica
}


// =======================================================
// FUNCIONES GLOBALES
// =======================================================

// Lógica del menú de navegación responsive
function setupNavBarToggle() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.getElementById('nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active'); 
        });
    }
}

// 🚀 LÓGICA DE LOGOUT IMPLEMENTADA
function setupLogoutHandler() {
    // Buscamos el botón "De acuerdo" dentro del modal de cierre de sesión
    // (Basado en el HTML que me enviaste de 'my-profile.html')
    const logoutConfirmButton = document.querySelector('.button-modal-boostrap');

    if (logoutConfirmButton) {
        logoutConfirmButton.addEventListener('click', (event) => {
            // Prevenimos que el enlace <a> navegue antes de limpiar
            event.preventDefault(); 
            
            // 1. Limpiar la sesión del localStorage
            localStorage.removeItem('userSession');
            
            // 2. Redirigir al Login
            // Usamos la URL del href del botón para asegurarnos de que sea la correcta
            const loginUrl = logoutConfirmButton.href; 
            window.location.href = loginUrl; 
        });
    }
}


// =======================================================
// INICIO DE LA APLICACIÓN
// =======================================================

// Se asegura de que el DOM esté completamente cargado antes de ejecutar el router
document.addEventListener('DOMContentLoaded', initializeApp);