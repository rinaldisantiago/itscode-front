// function apiFetch(url, config, success, objeto) { 
//     const fullUrl = `http://localhost:5052${url}`;

//     fetch(fullUrl, config)
//         .then(response => {
//             if (!response.ok) {
//                 // Manejar errores HTTP
//                 throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
//             }
//             return response.json();
//         })
//         .then(data => {
//             success(data);
//         })
//         .catch(error => {
//             Swal.fire({
//                 icon: 'error',
//                 title: 'Error de conexión',
//                 text: `Hubo un problema al conectar con el servidor. Detalle: ${error.message}`,
//             });
//             console.error('Error en la solicitud:', error);
//         })
//         .finally(() => {
//             // Borrar spin
//         });
// }

function apiFetch(url, config, success) { 
    const fullUrl = `http://localhost:5052${url}`;

    fetch(fullUrl, config)
        .then(response => { 
            return response.json();
        })
        .then(data => {
            success(data);
        })
        .catch(error => {
            // Este SweetAlert ahora DEBE mostrar el detalle de la excepción C#
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