const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;
export const fetchWithAuth = async (endpoint, method, body) => {
    try {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
        };

        if (body !== undefined && body !== null) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`${VITE_BASE_URL}/${endpoint}`, options);

        if (!response.ok) {
            // Intenta leer el mensaje de error del backend para un mejor diagnóstico
            const errorData = await response.json().catch(() => ({ message: 'Error desconocido en la petición.' }));
            throw new Error(errorData.message || `Error en fetchWithAuth ${VITE_BASE_URL}/${endpoint}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error en la petición:', error);
        throw error;
    }
};

export const fetchWithAuthAndFiles = async (endpoint, method, formData) => {
    try {
        console.log('FormData contenido:', Array.from(formData.entries()));

        const response = await fetch(`${VITE_BASE_URL}/${endpoint}`, {
            method,
            credentials: 'include',
            body: formData
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Error al procesar la petición de archivos.' }));
            throw new Error(errorData.message || 'Error al procesar la petición');
        }

        return await response.json(); // Esto devolverá { user: {...} } o {...}
    } catch (error) {
        console.error('Error detallado:', error);
        throw error;
    }
};