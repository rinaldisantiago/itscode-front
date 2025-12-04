import { createPost } from '../repository/postCreateRepository.js';

const createPostForm = document.getElementById('frmPost');
const postTitleInput = document.getElementById('txt_post_title');
const postContentTextarea = document.getElementById('txt_post_description');
const postFileInput = document.getElementById('load-post-image');
const submitButton = document.getElementById('btn_form_post');

const validatePostForm = () => {
    if (!postTitleInput.value.trim() || !postContentTextarea.value.trim()) {
        Swal.fire({
            icon: 'warning',
            title: 'Campos incompletos',
            text: 'Por favor, completa el título y el contenido del post.',
        });
        return false;
    }
    return true;
};

const handleCreatePostSubmit = async (event) => {
    event.preventDefault();

    if (!validatePostForm()) {
        return;
    }
    const postFormData = new FormData(createPostForm);

    const userSession = JSON.parse(localStorage.getItem('userSession'));
    if (!userSession || !userSession.id) {
        Swal.fire({
            icon: 'error',
            title: 'No autenticado',
            text: 'Debes iniciar sesión para publicar.'
        });
        return;
    }

    postFormData.append('idUser', userSession.id);

    submitButton.disabled = true;
    submitButton.textContent = 'Publicando...';

    try {
        const result = await createPost(postFormData);

        Swal.fire({
            icon: 'success',
            title: '¡Publicación Creada!',
            text: result.message,
            timer: 2000,
            showConfirmButton: false
        });
        createPostForm.reset();
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Publicar';
    }
};

export function loadPostCreateView() {
    if (createPostForm) {
        createPostForm.addEventListener('submit', handleCreatePostSubmit);
        console.log("Controlador de Creación de Post inicializado.");
    }
}