<<<<<<< HEAD

/**
 * Realiza una solicitud a la API y devuelve los datos JSON si es exitosa.
 * Muestra una alerta de error usando SweetAlert2 (Swal.fire) si falla.
 * @param {string} url - La ruta relativa de la API (ej: '/User/login').
 * @param {Object} config - Objeto de configuración de la solicitud fetch (method, headers, body, etc.).
 * @returns {Promise<Object>} Una promesa que resuelve en el objeto JSON de la respuesta.
 * @throws {Error} Lanza un error si la respuesta HTTP no es exitosa.
 */
=======
>>>>>>> development
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
// Helper para requests con JSON (POST, PUT, etc.)
export function jsonConfig(method, body) {
    return {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    };
}
