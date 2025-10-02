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

function apiFetch(url, config, success, objeto) { 
    const fullUrl = `http://localhost:5052${url}`;

    fetch(fullUrl, config)
        .then(async response => { // ¡CAMBIO CRUCIAL: USAMOS async!
            if (!response.ok) {
                let errorData = null;
                try {
                    // 1. Intentamos leer el JSON de error que viene de .NET
                    errorData = await response.json(); 
                } catch (e) {
                    // Si falla la lectura, lanzamos el error HTTP genérico
                    throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
                }
                
                // 2. Si leemos el JSON, usamos el error detallado del servidor
                const detailedError = errorData.error || errorData.message || 'Error desconocido del servidor.';
                throw new Error(detailedError);
            }
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