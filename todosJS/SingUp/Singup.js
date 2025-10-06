const form = document.getElementById("registration-form");

form.addEventListener("submit", async (evt) => {
    evt.preventDefault();

    const dataForm = new FormData(form);
    const dataUser = {
        fullName: dataForm.get("username"),
        email: dataForm.get("email"),
        userName: dataForm.get("nickname"),
        password: dataForm.get("password")
    };


    const data = await apiFetch('/users/signup', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataUser)
    });

    if(data){
        Swal.fire({
            icon: 'success',
            title: '¡Registro Exitoso!',
            text: data.message || 'Tu cuenta ha sido creada con éxito.',
        });

        setTimeout(() => {
            window.location.href = '/login.html';
        }, 2000);
    }
});
