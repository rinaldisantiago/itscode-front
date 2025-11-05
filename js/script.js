// js/script.js

// =======================================================
// 1. IMPORTACIONES
// =======================================================

// Importamos el controlador de Muro/Wall
import { loadWallView } from './Views/wallViews.js'; 

// Importamos los controladores de Registro y Login
import { loadSignupView, loadLoginView } from './presentation/authPresentation.js'; 

// Importamos el controlador para la página de Creación de Posts
import { loadPostCreateView } from './presentation/postCreatePresentation.js'; 


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

    // Ruta: Muro principal (wall.html)
    else if (path.includes('wall.html')) {
        loadWallView(); 
        console.log("Cargando vista del Muro.");
    } 
    
    // Aquí puedes añadir más rutas para otras páginas (ej: mi-perfil.html)
    

    // --- LÓGICA GLOBAL (se ejecuta en todas las páginas) ---
    setupNavBarToggle();
    setupLogoutHandler(); 
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

// Lógica para el botón de cerrar sesión
function setupLogoutHandler() {
    // TODO: Implementar la lógica para limpiar localStorage y redirigir al login.
}


// =======================================================
// INICIO DE LA APLICACIÓN
// =======================================================

// Se asegura de que el DOM esté completamente cargado antes de ejecutar el router
document.addEventListener('DOMContentLoaded', initializeApp);