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
        .then(async response => { // Usamos async para poder usar await
            if (!response.ok) {
                // 1. Intentamos leer el cuerpo del error como JSON
                let errorData = null;
                try {
                    errorData = await response.json();
                } catch (e) {
                    // Si falla al leer el JSON (ej: error 500 sin cuerpo JSON)
                    throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
                }
                
                // 2. Si leímos el cuerpo, lanzamos el mensaje detallado de .NET
                const detailedError = errorData.error || errorData.message || 'Error desconocido del servidor.';
                throw new Error(detailedError);
            }
            return response.json();
        })
        .then(data => {
            success(data);
        })
        .catch(error => {
            // Ahora 'error.message' contendrá el detalle del error de .NET
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