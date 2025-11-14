export function populateUpdateForm(formElement, userData) {
    if (!formElement || !userData) return;

    // Usamos el atributo 'name' de cada input para encontrarlo y asignarle valor
    formElement.querySelector('[name="fullName"]').value = userData.fullName || '';
    formElement.querySelector('[name="email"]').value = userData.email || '';
    formElement.querySelector('[name="userName"]').value = userData.userName || '';
    formElement.querySelector('[name="urlAvatar"]').value = userData.urlAvatar || '';
    
    // El campo de contraseña se deja vacío a propósito por seguridad.
    formElement.querySelector('[name="password"]').value = '';
}