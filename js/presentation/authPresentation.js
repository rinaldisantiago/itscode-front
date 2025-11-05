// js/presentation/authPresentation.js

import { registerUser, loginUser } from '../repository/authRepository.js'; 

// --- ELEMENTOS DEL DOM ---
const registrationForm = document.getElementById('registration-form');
const submitButton = document.getElementById('btn');
const formMessageDiv = document.getElementById('form-message'); 
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password'); 
const loginButton = loginForm ? loginForm.querySelector('.btn') : null; 

// --- REGLAS DE VALIDACIÓN (SINCRONIZADAS CON EL HTML) ---
const validationRules = {
    FullName: { minLength: 3, fieldName: "Nombre Completo" },
    email: { type: "email", fieldName: "Correo Electrónico" },
    Username: { minLength: 3, fieldName: "Nombre de Usuario" },
    password: { minLength: 6, fieldName: "Contraseña" }
};

const validateForm = (formData) => {
    if (formMessageDiv) formMessageDiv.textContent = ''; 
    for (const [name, rules] of Object.entries(validationRules)) {
        const value = formData.get(name)?.trim() || ''; 
        if (!value) return `El campo "${rules.fieldName}" es obligatorio.`;
        if (rules.minLength && value.length < rules.minLength) return `El campo "${rules.fieldName}" debe tener al menos ${rules.minLength} caracteres.`;
        if (rules.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) return `El formato del correo electrónico no es válido.`;
        }
    }
    return null;
};

// =======================================================
// --- HANDLER DE REGISTRO (CON LOGS PARA DEPURAR) ---
// =======================================================
const handleRegistration = async (event) => {
    event.preventDefault();
    console.log('handleRegistration iniciado...'); // LOG 1

    const formData = new FormData(registrationForm);

    console.log('Validando formulario...'); // LOG 2
    const validationError = validateForm(formData);
    console.log('Resultado de la validación:', validationError); // LOG 3

    if (validationError) {
        console.log('Validación fallida. Mostrando mensaje:', validationError); // LOG 4
        if (formMessageDiv) formMessageDiv.textContent = validationError;
        return;
    }

    console.log('Validación exitosa. Preparando para enviar a la API...'); // LOG 5
    formData.append('RoleId', 1);
    submitButton.disabled = true;
    submitButton.textContent = 'Registrando...';
    if (formMessageDiv) formMessageDiv.textContent = '';

    try {
        const result = await registerUser(formData);
        Swal.fire({
            icon: 'success',
            title: '¡Registro Exitoso!',
            text: `${result.message}. Ahora puedes iniciar sesión.`,
            confirmButtonText: 'Ir a Iniciar Sesión'
        }).then((result) => {
            if (result.isConfirmed) window.location.href = '../index.html';
        });
    } catch (error) {
        console.error('ERROR al llamar a la API:', error); // LOG DE ERROR
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Registrarse';
    }
};

const handleLoginClick = async (event) => {
    event.preventDefault(); 

    // 👇 CAMBIO CLAVE: Usamos FormData para leer los valores del formulario
    const formData = new FormData(loginForm);
    const username = formData.get('username')?.trim(); // Lee el input con name="username"
    const password = formData.get('password')?.trim(); // Lee el input con name="password"

    if (!username || !password) {
        Swal.fire({ icon: 'warning', title: 'Faltan datos', text: 'Por favor, introduce tu usuario y contraseña.' });
        return;
    }

    if (loginButton) {
        loginButton.textContent = 'Ingresando...';
        loginButton.disabled = true; 
    }

    try {
        const result = await loginUser(username, password);
        
        console.log('Datos que se guardarán en sesión:', result.user);

        localStorage.setItem('userSession', JSON.stringify(result.user));

        Swal.fire({ 
            icon: 'success', 
            title: '¡Bienvenido!', 
            text: `Sesión iniciada como ${result.user.UserName}. Redireccionando...`, 
            showConfirmButton: false, 
            timer: 1500 
        }).then(() => { 
            // Redirección al muro
            window.location.href = '../html/wall.html'; 
        });

    } catch (error) {
        console.error('Fallo en el flujo de login:', error);
    } finally {
        if (loginButton) {
            loginButton.textContent = 'Entrar';
            loginButton.disabled = false;
        }
    }
};

function loadSignupView() {
    if (registrationForm) {
        registrationForm.addEventListener('submit', handleRegistration);
        console.log("Controlador de Registro inicializado.");
    }
}

function loadLoginView() {
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginClick);
        console.log("Controlador de Login inicializado en el formulario submit.");
    }
}

export { loadSignupView, loadLoginView };