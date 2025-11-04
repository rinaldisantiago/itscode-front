// =======================================================
// 1. IMPORTACIONES
// Importamos el controlador de Muro/Wall
import { loadWallView } from './Views/wallViews.js'; 
// 👈 IMPORTAMOS: Los controladores de Registro y Login
import { loadSignupView, loadLoginView } from './presentation/authPresentation.js'; 
// =======================================================


// Función para inicializar toda la lógica específica de la página.
function initializeApp() {
    // Lógica para detectar qué página estamos cargando
    const path = window.location.pathname;
    
    // --- 2. CONTROL DE RUTAS ESPECÍFICAS ---
    
    // Ruta 1: REGISTRO (sign-up.html)
    if (path.includes('sign-up.html')) {
        loadSignupView(); // Llama a la lógica del formulario de Registro
        console.log("Cargando controlador de Registro.");
    } 
    
    // Ruta 2: LOGIN (index.html o la raíz /) 👈 PRIORIDAD AL LOGIN
    // Usamos endsWith para evitar colisiones con otras carpetas
    else if (path.endsWith('/') || path.endsWith('/index.html')) {
        loadLoginView(); // Llama a la lógica del formulario de Login
        console.log("Cargando controlador de Login.");
    }
    
    // Ruta 3: Muro principal (wall.html)
    else if (path.includes('wall.html')) {
        loadWallView(); 
        console.log("Cargando vista del Muro.");
    } 
    
    // Aquí puedes añadir más rutas (ej: 'user-profile.html' -> loadProfileView())


    // --- 3. LÓGICA GLOBAL ---
    
    setupNavBarToggle();
    setupLogoutHandler(); 
}

// Lógica del menú
function setupNavBarToggle() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.getElementById('nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active'); 
        });
    }
}

function setupLogoutHandler() {
    // TODO: Implementar lógica para cerrar sesión
}

// Inicializar la aplicación cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', initializeApp);