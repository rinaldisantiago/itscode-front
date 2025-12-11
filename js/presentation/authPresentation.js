import { registerUser, loginUser } from '../repository/authRepository.js';

const registrationForm = document.getElementById('registration-form');
const submitButton = document.getElementById('btn');
const formMessageDiv = document.getElementById('form-message');
const loginForm = document.getElementById('login-form');
const loginButton = loginForm ? loginForm.querySelector('.btn') : null;

const validationRules = {
    FullName: {
        fieldName: "Nombre Completo",
        regex: /^(?=.{1,50}$)[a-zA-ZÀ-ÿ]+( [a-zA-ZÀ-ÿ]+)+$/,
        message: "El Nombre Completo debe tener al menos dos palabras y no más de 50 caracteres."
    },
    email: {
        fieldName: "Correo Electrónico",
        regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "El formato del correo no es válido."
    },
    Username: {
        fieldName: "Nombre de Usuario",
        regex: /^(?=.{5,25}$)[a-zA-Z0-9_]+$/,
        message: "El Nombre de Usuario debe tener entre 5 y 25 caracteres (letras, números, _)."
    },
    password: {
        fieldName: "Contraseña",
        regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/,
        message: "La Contraseña debe tener Mínimo 8 caracteres, una mayúscula, una minúscula, un número y un símbolo."
    }
};

const validateForm = (formData) => {
    if (formMessageDiv) formMessageDiv.textContent = '';
    for (const [name, rules] of Object.entries(validationRules)) {
        const value = formData.get(name)?.trim() || '';

        if (!value) {
            return `El campo "${rules.fieldName}" es obligatorio.`;
        }

        if (rules.regex && !rules.regex.test(value)) {
            return rules.message;
        }
    }
    return null;
};

const handleRegistration = async (event) => {
    event.preventDefault();

    const formData = new FormData(registrationForm);

    const validationError = validateForm(formData);

    if (validationError) {
        if (formMessageDiv) formMessageDiv.textContent = validationError;
        return;
    }

    formData.append('RoleId', 1); // Añade el RoleId

    const imageFile = formData.get('image');
    const isMultipart = (imageFile && imageFile.size > 0);

    submitButton.disabled = true;
    submitButton.textContent = 'Registrando...';
    if (formMessageDiv) formMessageDiv.textContent = '';

    try {
        const result = await registerUser(formData, isMultipart);
        Swal.fire({
            icon: 'success',
            title: '¡Registro Exitoso!',
            text: `${result.message}. Ahora puedes iniciar sesión.`,
            confirmButtonText: 'Ir a Iniciar Sesión'
        }).then((result) => {
            if (result.isConfirmed) window.location.href = '../index.html';
        });
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
        localStorage.setItem('userSession', JSON.stringify(result.user));

        Swal.fire({
            icon: 'success',
            title: '¡Bienvenido a ITSCode!',
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
    }
}

function loadLoginView() {
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginClick);
    }
}

export { loadSignupView, loadLoginView };