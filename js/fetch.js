export async function apiFetch(url, config = {}) {
    const fullUrl = `http://localhost:5052${url}`;

    try {
        const response = await fetch(fullUrl, config);

        if (!response.ok) {
            const errorText = await response.text();

            let errorData;
            let errorMessage;

            try {
                errorData = JSON.parse(errorText);
                errorMessage = errorData.message || 'Error en la respuesta de la API.';
            } catch (e) {
                errorMessage = errorText || `Error HTTP ${response.status}`;
            }

            // ✅ SOLUCIÓN: Creamos un error que contiene el mensaje Y los datos completos.
            const error = new Error(errorMessage);
            error.data = errorData; // Adjuntamos el objeto JSON completo.
            throw error; // Lanzamos este error enriquecido.
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
        // ✅ MEJORA: Evitamos que apiFetch muestre un Swal para errores que manejamos de forma específica
        // en la capa de presentación (baneo y credenciales incorrectas).
        const isBannedError = error.data && error.data.message === "Usuario Baneado.";
        const isInvalidCredentialsError = error.data && error.data.message === "Invalid username or password.";

        // Si no es ninguno de los errores que manejamos específicamente, mostramos el Swal genérico.
        if (!isBannedError && !isInvalidCredentialsError) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                // Usamos el mensaje del error si está disponible, si no, un texto genérico.
                text: error.message || 'Ocurrió un error inesperado.',
            });
        }
        if (error.message.includes("Failed to fetch")) {
            console.error("Error de Conexión: No se pudo conectar con el servidor de la API. Verifique que esté corriendo.");
        }

        console.error(`Fallo en apiFetch para ${url}:`, error);
        throw error;

    } finally {
        // 6. Ocultar spinner
        // hideSpinner();
    }
}