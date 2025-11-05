// js/PostCreate/PostCreate.js

// Importamos la función del repositorio
import { createPost } from '../repository/postCreateRepository.js'; 

// --- ELEMENTOS DEL DOM ---
const createPostForm = document.getElementById('frmPost');
const postTitleInput = document.getElementById('txt_post_title');
const postContentTextarea = document.getElementById('txt_post_description');
const postFileInput = document.getElementById('load-post-image');
const submitButton = document.getElementById('btn_form_post');

// --- FUNCIÓN DE VALIDACIÓN (Opcional, pero recomendada) ---
const validatePostForm = () => {
    if (!postTitleInput.value.trim() || !postContentTextarea.value.trim()) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos incompletos',
            text: 'Por favor, completa el título y el contenido del post.',
        });
        return false;
    }
    // Aquí podrías añadir validaciones para el archivo si fuera obligatorio
    return true;
};

// --- HANDLER DE ENVÍO DEL FORMULARIO ---
const handleCreatePostSubmit = async (event) => {
    event.preventDefault(); // Evita la recarga de página por defecto

    // 1. VALIDACIÓN LOCAL
    if (!validatePostForm()) {
        return;
    }

    // 2. Preparar el FormData
    const postFormData = new FormData(createPostForm);

    // 3. Obtener el ID del usuario logueado
    const userSession = JSON.parse(localStorage.getItem('userSession'));
    if (!userSession || !userSession.id) {
        Swal.fire({
            icon: 'error',
            title: 'No autenticado',
            text: 'Debes iniciar sesión para publicar.'
        });
        return;
    }
    
    // 4. Añadir el idUser al FormData (ya que no está en el formulario HTML)
    postFormData.append('idUser', userSession.id);

    // 5. UI DINÁMICA: Deshabilitar botón y cambiar texto
    submitButton.disabled = true;
    submitButton.textContent = 'Publicando...';

    try {
        // 6. Llamar al repositorio para crear el post
        const result = await createPost(postFormData);

        // 7. ÉXITO: Mostrar mensaje y limpiar formulario
        Swal.fire({
            icon: 'success',
            title: '¡Publicación Creada!',
            text: result.message,
            timer: 2000,
            showConfirmButton: false
        });

        createPostForm.reset(); // Limpia todos los campos del formulario

        // OPCIONAL: Aquí podrías llamar a una función para recargar y mostrar el nuevo post
        // fetchAndRenderPosts(); 

    } catch (error) {
        console.error("Error al crear el post:", error);
        // El apiFetch ya se encarga de mostrar el SweetAlert de error de la API
    } finally {
        // 8. UI DINÁMICA: Restablecer botón
        submitButton.disabled = false;
        submitButton.textContent = 'Publicar';
    }
};

// --- FUNCIÓN DE INICIALIZACIÓN ---
/**
 * Inicializa los listeners para el formulario de creación de post.
 */
export function loadPostCreateView() {
    if (createPostForm) {
        createPostForm.addEventListener('submit', handleCreatePostSubmit);
        console.log("Controlador de Creación de Post inicializado.");
    } else {
        console.log("No se encontró el formulario de creación de post.");
    }
}