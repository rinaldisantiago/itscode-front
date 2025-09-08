const form = document.getElementById("update-form");

form.addEventListener("submit", async (evt) => {
    evt.preventDefault();

    const dataForm = new FormData(form);
    const dataUser = {
        fullName: dataForm.get("nombre") ?? "",
        email: dataForm.get("email") ?? "",
        userName: dataForm.get("usuario") ?? "",
        password: dataForm.get("password") ?? "",
        image: dataForm.get("image") || null
    };

    let options = {
        method: 'PATCH' 
    };

    if (dataUser.image && dataUser.image.size > 0) {
        const formDataToSend = new FormData();
        for (const key in dataUser) {
            if (dataUser[key]) {
                formDataToSend.append(key, dataUser[key]);
            }
        }
        options.body = formDataToSend;
    } else {
        const { image, ...userWithoutImage } = dataUser;
        options.headers = {
            'Content-Type': 'application/json'
        };
        options.body = JSON.stringify(userWithoutImage);
    }

    try {
        const data = await apiFetch('/users/update', options);

        if (data) {
            Swal.fire({
                icon: 'success',
                title: '¡Actualización Exitosa!',
                text: data.message || 'Tu perfil ha sido actualizado correctamente.',
            });
             data && setTimeout(() => (window.location.href = "/my-profile.html"), 2000);
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error?.message ?? "No se pudo actualizar el perfil. Intenta nuevamente."
        });
    }
});
