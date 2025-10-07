
import { loadWallView } from './views/WallViews.js'; 
// Importar aquí otros controladores (ej: { loadProfileView } from './Views/profileViews.js')


// Función para inicializar toda la lógica específica de la página.
function initializeApp() {
    // Lógica para detectar qué página estamos cargando
    const path = window.location.pathname;
    
    // Si la URL termina en /wall.html o es la raíz de la app
    if (path.includes('wall.html') || path === '/') {
        loadWallView(); 
    } 

    // Lógica global que aplica a todas las páginas (como el menú de navegación)
    setupNavBarToggle();
    setupLogoutHandler(); 
}

// Lógica del menú
function setupNavBarToggle() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.getElementById('nav-links');
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('active'); // Usando 'active' según tu primer bloque de código
        });
    }
}

function setupLogoutHandler() {
    // TODO: Implementar lógica para cerrar sesión
}

// Inicializar la aplicación cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', initializeApp);