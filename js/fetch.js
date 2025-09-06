
function apiFetch(url, config, success, objeto) { 
    const fullUrl = `http://localhost:5052${url}`;

    fetch(fullUrl, config)
        .then(response => {
            return response.json();
        })
        .then(data => {
            success(data);
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Error de conexión',
                text: `Hubo un problema al conectar con el servidor. Detalle: ${error.message}`,
            });
            console.error('Error en la solicitud:', error);
        })
        .finally(() => {
            // Borrar spin
        });
}