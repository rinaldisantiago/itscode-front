
document.getElementById("update-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const fullName = e.target.nombre.value;
    const email = e.target.email.value;
    const userName = e.target.usuario.value;
    const password = e.target.password.value;
    const imageFile = e.target.image.files[0];


    const userId = localStorage.getItem("userId");

    // Subir imagen (si tu backend necesita una URL)
    // En este ejemplo se asume que ya tenés una URL de imagen o usás un placeholder
    let urlAvatar = "";
    if (imageFile) {
        // Si la imagen debe subirse a un servidor o storage, aquí iría esa lógica
        // Por ahora usamos una URL temporal solo como ejemplo
        urlAvatar = URL.createObjectURL(imageFile);
    }

    const body = {
        fullName,
        userName,
        email,
        password,
        urlAvatar
    };

    try {
        const response = await fetch(`https://localhost:5000/User?id=${userId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            throw new Error("Error al actualizar el usuario");
        }

        const data = await response.json();
        console.log("Usuario actualizado:", data);

        alert("Datos actualizados correctamente ✅");
        // Redirigir o refrescar la página
        window.location.href = "./my-profile.html";

    } catch (error) {
        console.error(error);
        alert("Hubo un error al actualizar el usuario ❌");
    }
});
