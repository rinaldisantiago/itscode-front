// js/presentation/authPresentation.js

import { registerUser, loginUser } from '../repository/authRepository.js'; 

// --- ELEMENTOS DEL DOM ---
const registrationForm = document.getElementById('registration-form');
const submitButton = document.getElementById('btn');
const formMessageDiv = document.getElementById('form-message'); 
const loginForm = document.getElementById('login-form');
// (Ya no necesitamos los inputs individuales, FormData los leerá)
const loginButton = loginForm ? loginForm.querySelector('.btn') : null; 

// --- REGLAS DE VALIDACIÓN (SINCRONIZADAS CON EL HTML) ---
// 🚨 CAMBIO CLAVE: Las claves coinciden con los 'name' del HTML de registro
const validationRules = {
    FullName: { minLength: 3, fieldName: "Nombre Completo" }, // Coincide con name="FullName"
    email: { type: "email", fieldName: "Correo Electrónico" }, // Coincide con name="email"
    Username: { minLength: 3, fieldName: "Nombre de Usuario" }, // Coincide con name="Username"
    password: { minLength: 6, fieldName: "Contraseña" } // Coincide con name="password"
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
// --- HANDLER DE REGISTRO ---
// =======================================================
const handleRegistration = async (event) => {
    event.preventDefault();
    console.log('handleRegistration iniciado...'); 

    const formData = new FormData(registrationForm);

    console.log('Validando formulario...'); 
    const validationError = validateForm(formData); // Usa las reglas corregidas
    console.log('Resultado de la validación:', validationError); 

    if (validationError) {
        console.log('Validación fallida. Mostrando mensaje:', validationError); 
        if (formMessageDiv) formMessageDiv.textContent = validationError;
        return;
    }

    console.log('Validación exitosa. Preparando para enviar a la API...'); 
    formData.append('RoleId', 1); // Añade el RoleId
    
    // 🚨 CAMBIO CLAVE: Pasamos el flag 'isMultipart' al repositorio
    const imageFile = formData.get('image');
    // (Asegúrate de que tu authRepository.js tenga la lógica de 'isMultipart')
    const isMultipart = (imageFile && imageFile.size > 0); 
    
    submitButton.disabled = true;
    submitButton.textContent = 'Registrando...';
    if (formMessageDiv) formMessageDiv.textContent = '';

    try {
        // Llama al repositorio con el FormData y el flag
        const result = await registerUser(formData, isMultipart);
        Swal.fire({
            icon: 'success',
            title: '¡Registro Exitoso!',
            text: `${result.message}. Ahora puedes iniciar sesión.`,
            confirmButtonText: 'Ir a Iniciar Sesión'
        }).then((result) => {
            if (result.isConfirmed) window.location.href = '../index.html';
        });
    } catch (error) {
        console.error('ERROR al llamar a la API:', error); 
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Registrarse';
    }
};

// =======================================================
// --- HANDLER DE LOGIN ---
// =======================================================
const handleLoginClick = async (event) => {
    event.preventDefault(); // <-- ¡Previene el error 405!

    const formData = new FormData(loginForm);
    const username = formData.get('username')?.trim(); 
    const password = formData.get('password')?.trim(); 

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
            text: `Sesión iniciada como ${result.user.userName}. Redireccionando...`, 
            showConfirmButton: false, 
            timer: 1500 
        }).then(() => { 
            // 🚨 CAMBIO CLAVE: Ruta de redirección corregida
            window.location.href = './html/wall.html'; 
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

// =======================================================
// --- FUNCIONES DE INICIALIZACIÓN ---
// =======================================================

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

// Exportación única de bloque
export { loadSignupView, loadLoginView };