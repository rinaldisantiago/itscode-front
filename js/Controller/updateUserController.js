import { getUserById, updateUser } from '../repository/userRepository.js';
import { populateUpdateForm } from '../presentation/updateUserPresentation.js';

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

async function handleUpdateFormSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const userId = getUserSession()?.id;

    if (!userId) {
        alert("Error: Sesión no encontrada. Por favor, inicie sesión de nuevo.");
        window.location.href = '../index.html';
        return;
    }

    const formData = new FormData(form);
    formData.append('id', userId);
    if (!formData.get('password')) {
        formData.delete('password');
    }

    const updatedUser = await updateUser(userId, formData);

    const session = getUserSession();
    if (session && updatedUser) {
        const newSessionData = {
            ...session,
            userName: updatedUser.userName,
            urlAvatar: updatedUser.urlAvatar
        };
        localStorage.setItem('userSession', JSON.stringify(newSessionData));
    }
    Swal.fire({
        icon: 'success',
        title: '¡Éxito!',
        text: 'Tu perfil ha sido actualizado correctamente.',
    }).then(() => {
        window.location.href = './my-profile.html';
    });
}

export async function loadUpdateUserView() {
    const userSession = getUserSession();
    if (!userSession) {
        window.location.href = '../index.html';
        return;
    }

    const form = document.getElementById('update-form');
    if (!form) {
        return;
    }

    const currentUserData = await getUserById(userSession.id, userSession.id);
    populateUpdateForm(form, currentUserData);
    form.addEventListener('submit', handleUpdateFormSubmit);

}