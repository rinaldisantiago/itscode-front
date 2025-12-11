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

    if (!postFileInput.files || postFileInput.files.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Imagen obligatoria',
            text: 'Por favor, selecciona una imagen o pega una URL para la publicación.',
        });
        return false;
    }
    return true;
};

const handleFileSelect = (event) => {
    const file = event.target.files[0];
    const label = document.querySelector('.label-file-image');

    const existingPreview = document.getElementById('post-image-preview');
    if (existingPreview) existingPreview.remove();

    if (file) {
        if (label) {
            label.style.backgroundColor = 'rgba(46, 204, 113, 0.1)'; 
            label.style.border = '1px solid #2ecc71';
            label.style.color = '#2ecc71';
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.id = 'post-image-preview';
            img.style.maxWidth = '100%';
            img.style.marginTop = '15px';
            img.style.borderRadius = '10px';
            img.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
            
            if (label && label.parentNode) {
                label.parentNode.insertBefore(img, label.nextSibling);
            }
        };
        reader.readAsDataURL(file);
    } else {
        if (label) {
            label.style.backgroundColor = '';
            label.style.border = '';
            label.style.color = '';
        }
    }
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
        
        const label = document.querySelector('.label-file-image');
        if (label) {
            label.style.backgroundColor = '';
            label.style.border = '';
            label.style.color = '';
        }
        const preview = document.getElementById('post-image-preview');
        if (preview) preview.remove();
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Publicar';
    }
};

export function loadPostCreateView() {
    if (createPostForm) {
        createPostForm.addEventListener('submit', handleCreatePostSubmit);
        if (postFileInput) {
            postFileInput.addEventListener('change', handleFileSelect);
        }
    }
}