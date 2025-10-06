document.addEventListener("DOMContentLoaded", () => {
    const toggleButton = document.querySelector(".menu-toggle");
    const nav = document.getElementById("nav-links");

    toggleButton.addEventListener("click", () => {
        nav.classList.toggle("active");
    });
});


// scripts/script.js (Archivo de inicialización global)

// Importamos el controlador específico del Muro
import { loadWallPage } from './controllers/wallController.js'; 
// Importar aquí otros controladores (ej: { loadProfilePage } from './controllers/profileController.js')

function initializeApp() {
    // Lógica para detectar qué página estamos cargando
    const path = window.location.pathname;
    
    // Si la URL termina en /wall.html o es la raíz de la app
    if (path.includes('wall.html') || path === '/') {
        loadWallPage();
    } 
    /*
    else if (path.includes('my-profile.html')) {
        loadProfilePage();
    }
    // ... y así sucesivamente para cada HTML ...
    */

    // Lógica global que aplica a todas las páginas (como el menú de navegación)
    setupNavBarToggle();
    // Aquí podrías agregar la lógica para cerrar sesión y manejar el token JWT
    setupLogoutHandler(); 
}

// Lógica del menú que ya tenías
function setupNavBarToggle() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.getElementById('nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('open');
        });
    }
}

function setupLogoutHandler() {
    // TODO: Implementar lógica para eliminar el token JWT del localStorage
    // y redirigir al usuario
}

// Inicializar la aplicación cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', initializeApp);