const form = document.getElementById("registration-form");
const inputName = document.getElementById("input-name");

form.addEventListener("submit", async (evt) => {
    evt.preventDefault();

    const dataForm = new FormData(form);
    const dataUser = {
        fullName: dataForm.get("username"),
        email: dataForm.get("email"),
        userName: dataForm.get("nickname"),
        password: dataForm.get("password")
    };

    const data = updateUser(dataUser, (data) => {
        Swal.fire({
            icon: 'success',
            title: '¡Registro Exitoso!',
            text: data.message || 'Tu cuenta ha sido creada con éxito.',
        });
        //TODO: Guardar en localstorage el id del usuario logueado.
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 2000);
    });
});
