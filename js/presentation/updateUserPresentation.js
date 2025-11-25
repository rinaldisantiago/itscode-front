export function populateUpdateForm(formElement, userData) {
    if (!formElement || !userData) return;

    formElement.querySelector('[name="fullName"]').value = userData.fullName || '';
    formElement.querySelector('[name="email"]').value = userData.email || '';
    formElement.querySelector('[name="userName"]').value = userData.userName || '';
    formElement.querySelector('[name="password"]').value = '';
}