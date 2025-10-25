
/**
 * Realiza una solicitud a la API y devuelve los datos JSON si es exitosa.
 * Muestra una alerta de error usando SweetAlert2 (Swal.fire) si falla.
 * @param {string} url - La ruta relativa de la API (ej: '/User/login').
 * @param {Object} config - Objeto de configuración de la solicitud fetch (method, headers, body, etc.).
 * @returns {Promise<Object>} Una promesa que resuelve en el objeto JSON de la respuesta.
 * @throws {Error} Lanza un error si la respuesta HTTP no es exitosa.
 */
export async function apiFetch(url, config = {}) {
    // 1. URL completa
    const fullUrl = `http://localhost:5052${url}`;
    

    // 2. Realizar la solicitud
    try {
        const response = await fetch(fullUrl, config);
        
        // Aquí podrías mostrar un spinner de carga si lo tienes.
        // showSpinner(); 

        // 3. Manejo de errores HTTP
        if (!response.ok) {
            const errorText = await response.text(); // Intentar obtener el cuerpo del error
            
            // Lógica para manejar errores específicos del servidor
            let errorMessage = `Error en la solicitud a ${url}. Código: ${response.status} (${response.statusText})`;
            
            // Si el servidor devuelve un mensaje JSON útil (ej: { message: "..." }), lo usamos
            try {
                const errorJson = JSON.parse(errorText);
                if (errorJson.message) {
                    errorMessage = errorJson.message;
                }
            } catch (e) {
                // Si no es JSON, usamos el errorText completo
                if (errorText) {
                    errorMessage += ` - Detalle: ${errorText.substring(0, 100)}...`;
                }
            }

            // Mostrar la alerta de error
            Swal.fire({
                icon: 'error',
                title: 'Error de la API',
                text: errorMessage,
            });

            // Lanza el error para que la función llamadora (el Repositorio) pueda atraparlo
            throw new Error(errorMessage);
        }

        // 4. Devolver la respuesta JSON
        const data = await response.json();
        return data;

    } catch (error) {
        // 5. Manejo de errores de red (e.g., servidor caído, CORS)
        // Solo mostramos esta alerta si el error no fue un error HTTP (que ya se mostró arriba)
        if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
            Swal.fire({
                icon: 'error',
                title: 'Error de Conexión',
                text: 'No se pudo conectar con el servidor de la API. Verifique que esté corriendo.',
            });
        }
        
        console.error(`Fallo en apiFetch para ${url}:`, error);
        throw error; // Propagar el error
        
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
