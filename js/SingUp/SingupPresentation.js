document.addEventListener("DOMContentLoaded", () => {
   
    const signupForm = document.getElementById("signup-form");

    // Caso 1: Pantalla de registro
    if (signupForm) {
        signupForm.addEventListener("submit", (event) => {
            event.preventDefault(); // evita que se recargue la página

            const data = {
                username: signupForm.username.value,
                email: signupForm.email.value,
                nickname: signupForm.nickname.value,
                password: signupForm.password.value,
            };

            console.log("Registrando usuario:", data);
            // acá iría el fetch() para enviar al backend
        });
    }

});
