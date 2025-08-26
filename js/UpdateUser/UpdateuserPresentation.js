   document.addEventListener("DOMContentLoaded", () => {

   const updateForm = document.getElementById("updateuser-form");
    if (updateForm) {
        updateForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const data = {
                nombre: updateForm.nombre.value,
                email: updateForm.email.value,
                usuario: updateForm.usuario.value,
                password: updateForm.password.value,
                image: updateForm.image.files[0], // archivo seleccionado
            };

            console.log("Actualizando usuario:", data);
            // acá iría el fetch() para actualizar en el backend
        });
    }

  });
