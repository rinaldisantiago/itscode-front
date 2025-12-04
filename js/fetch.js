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

            const error = new Error(errorMessage);
            error.data = errorData;
            throw error;
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
        const isBannedError = error.data && error.data.message === "Usuario Baneado.";
        const isInvalidCredentialsError = error.data && error.data.message === "Invalid username or password.";

        if (!isBannedError && !isInvalidCredentialsError) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'Ocurrió un error inesperado.',
            });
        }
        throw error;

    }
}