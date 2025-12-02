// js/presentation/authPresentation.js
import { registerUser, loginUser } from '../repository/authRepository.js';

// --- ELEMENTOS DEL DOM ---
const registrationForm = document.getElementById('registration-form');
const submitButton = document.getElementById('btn');
const formMessageDiv = document.getElementById('form-message');
const loginForm = document.getElementById('login-form');
// (Ya no necesitamos los inputs individuales, FormData los leerá)
const loginButton = loginForm ? loginForm.querySelector('.btn') : null;

const validationRules = {
    FullName: { // ✅ CORRECCIÓN: Volvemos a usar 'FullName' con mayúscula para que coincida con el name="" del HTML del registro.
        fieldName: "Nombre Completo",
        regex: /^(?=.{1,50}$)[a-zA-ZÀ-ÿ]+( [a-zA-ZÀ-ÿ]+)+$/,
        message: "Debe tener al menos dos palabras y no más de 50 caracteres."
    },
    email: {
        fieldName: "Correo Electrónico",
        regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "El formato del correo no es válido."
    },
    Username: { // ✅ CORRECCIÓN: Volvemos a usar 'Username' con mayúscula.
        fieldName: "Nombre de Usuario",
        regex: /^(?=.{5,25}$)[a-zA-Z0-9_]+$/,
        message: "Debe tener entre 5 y 25 caracteres (letras, números, _)."
    },
    password: {
        fieldName: "Contraseña",
        regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
        message: "Mínimo 8 caracteres, una mayúscula, una minúscula, un número y un símbolo."
    }
};

const validateForm = (formData) => {
    if (formMessageDiv) formMessageDiv.textContent = '';
    for (const [name, rules] of Object.entries(validationRules)) {
        const value = formData.get(name)?.trim() || '';

        // 1. Validar que el campo no esté vacío
        if (!value) {
            return `El campo "${rules.fieldName}" es obligatorio.`;
        }

        // 2. Validar contra la expresión regular si existe
        if (rules.regex && !rules.regex.test(value)) {
            return rules.message; // Devuelve el mensaje de error específico de la regla
        }
    }
    // Si todo está bien, no hay error.
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


const handleLoginClick = async (event) => {
    event.preventDefault();

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
            window.location.href = './html/wall.html';
        });

    } catch (error) {
        if (error.data && error.data.message === "Usuario Baneado.") {
            const banReason = error.data.reason || "No se especificó un motivo.";
            Swal.fire({
                icon: 'error',
                title: 'Acceso Denegado',
                text: `Tu cuenta ha sido baneada. Motivo: ${banReason}`,
            });
        } else if (error.data && error.data.message === "Invalid username or password.") {
            Swal.fire({
                icon: 'error',
                title: 'Error de Autenticación',
                text: 'El nombre de usuario o la contraseña son incorrectos. Por favor, verifica tus datos.',
            });
        } else {
            console.error('Fallo en el flujo de login (error no manejado):', error);
        }
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

// Exportación única de bloque
export { loadSignupView, loadLoginView };