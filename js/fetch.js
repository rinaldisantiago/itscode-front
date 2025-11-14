export async function apiFetch(url, config = {}) {
    const fullUrl = `http://localhost:5052${url}`;

    try {
        const response = await fetch(fullUrl, config);
        
        if (!response.ok) {
            const errorText = await response.text(); 
            
            let errorMessage = `Error en la solicitud a ${url}. Código: ${response.status} (${response.statusText})`;

            try {
                const errorJson = JSON.parse(errorText);
                if (errorJson.message) {
                    errorMessage = errorJson.message;
                }
            } catch (e) {
                if (errorText) {
                    errorMessage += ` - Detalle: ${errorText.substring(0, 100)}...`;
                }
            }

            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: errorMessage,
            });

            throw new Error(errorMessage);
        }

        if (response.status === 204) {
            return null;
        }

        const contentType = response.headers.get("content-type");

        if (contentType && contentType.indexOf("application/json") !== -1) {
            const data = await response.json();
            return data;
        }

        return response;

    } catch (error) {

        if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
            Swal.fire({
                icon: 'error',
                title: 'Error de Conexión',
                text: 'No se pudo conectar con el servidor de la API. Verifique que esté corriendo.',
            });
        }
        
        console.error(`Fallo en apiFetch para ${url}:`, error);
        throw error;
        
    } finally {
        // 6. Ocultar spinner
        // hideSpinner();
    }
}