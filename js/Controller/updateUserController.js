import { getUserById, updateUser } from '../repository/userRepository.js';
import { populateUpdateForm } from '../presentation/UpdateUserPresentation.js';

// Tu función getUserSession está bien
const getUserSession = () => {
    const sessionData = localStorage.getItem('userSession');
    if (!sessionData) return null;
    const rawUser = JSON.parse(sessionData);
    return {
        id: rawUser.Id || rawUser.id,
        userName: rawUser.UserName || rawUser.userName,
        urlAvatar: rawUser.UrlAvatar || rawUser.urlAvatar
    };
};

// Función que maneja el envío del formulario
async function handleUpdateFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const userId = getUserSession()?.id;

    if (!userId) {
        alert("Error: Sesión no encontrada. Por favor, inicie sesión de nuevo.");
        window.location.href = '../index.html';
        return;
    }

    // ✅ CORRECCIÓN: Creamos el FormData directamente desde el elemento del formulario.
    // Esto captura automáticamente todos los campos con un atributo 'name'.
    const formData = new FormData(form);

    // ✅ CORRECCIÓN: Añadimos el ID del usuario al FormData para que el backend lo reciba.
    formData.append('id', userId);

    // Si el campo de contraseña está vacío, lo eliminamos del FormData.
    // Esto evita que se envíe una contraseña vacía y que el backend
    // intente actualizarla innecesariamente.
    if (!formData.get('password')) {
        formData.delete('password');
    }

    try {
        // Llamamos a la función del repositorio, pasándole el FormData
        const updatedUser = await updateUser(userId, formData);
        
        // Actualizar la sesión del usuario con los nuevos datos
        const session = getUserSession();
        if (session && updatedUser) { // Asegurarse que updatedUser no es nulo
            const newSessionData = {
                ...session,
                userName: updatedUser.userName,
                urlAvatar: updatedUser.urlAvatar
            };
            localStorage.setItem('userSession', JSON.stringify(newSessionData));
        }

        // Usar Swal para una mejor experiencia de usuario
        Swal.fire({
            icon: 'success',
            title: '¡Éxito!',
            text: 'Tu perfil ha sido actualizado correctamente.',
        }).then(() => {
            window.location.href = './my-profile.html';
        });

    } catch (error) {
        console.error('Error al actualizar el perfil:', error);
        // Tu apiFetch ya muestra un Swal de error, así que no es necesario otro aquí.
    }
}

// Función principal que se exporta y se llama al cargar la página
export async function loadUpdateUserView() {
    const userSession = getUserSession();
    if (!userSession) {
        window.location.href = '../index.html';
        return;
    }

    const form = document.getElementById('update-form');
    if (!form) {
        console.error('El formulario con id "update-form" no fue encontrado.');
        return;
    }

    try {
        // 1. Modelo: Obtener los datos actuales del usuario
        const currentUserData = await getUserById(userSession.id, userSession.id);

        // 2. Vista: Poblar el formulario con los datos
        populateUpdateForm(form, currentUserData);

        // 3. Controlador: Añadir el event listener para el submit
        form.addEventListener('submit', handleUpdateFormSubmit);

    } catch (error) {
        console.error('Error al cargar los datos para la actualización:', error);
    }
}