async function apiFetch(endpoint, options = {}) {
    const baseUrl = 'http://localhost:5052'; 
    const url = `${baseUrl}${endpoint}`

    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Ocurrió un error en la solicitud.');
        }

        return await response.json();
        
    } catch (error) {

        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: error.message || 'No se pudo conectar con el servidor. Inténtalo de nuevo.',
            confirmButtonText: 'Entendido'
        });

        throw error;
    }
}