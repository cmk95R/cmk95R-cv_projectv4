import { ClientSecretCredential } from "@azure/identity";
import { Client } from "@microsoft/microsoft-graph-client";
import "isomorphic-fetch"; // Polyfill para el objeto fetch

// Función para obtener un cliente de Graph API autenticado
const getAuthenticatedClient = () => {
    const { MS_CLIENT_ID, MS_TENANT_ID, MS_CLIENT_SECRET } = process.env;

    if (!MS_CLIENT_ID || !MS_TENANT_ID || !MS_CLIENT_SECRET) {
        throw new Error("Faltan variables de entorno de Microsoft Graph.");
    }

    const credential = new ClientSecretCredential(
        MS_TENANT_ID,
        MS_CLIENT_ID,
        MS_CLIENT_SECRET
    );

    // Inicializa el cliente de Graph con el proveedor de autenticación
    return Client.initWithMiddleware({
        authProvider: {
            getAccessToken: async () => {
                const tokenResponse = await credential.getToken("https://graph.microsoft.com/.default");
                return tokenResponse.token;
            },
        },
    });
};

/**
 * Sube un archivo a una carpeta específica en OneDrive.
 * @param {Buffer} fileBuffer El buffer del archivo a subir.
 * @param {string} fileName El nombre con el que se guardará el archivo.
 * @param {string} folderName La carpeta en OneDrive donde se guardará (ej. "CVs").
 * @returns {Promise<object>} La respuesta de la API de Graph con los detalles del archivo subido.
 */
export const uploadFileToOneDrive = async (fileBuffer, fileName, folderName = "CVs") => {
    try {
        const client = getAuthenticatedClient();
        const { ONEDRIVE_USER_ID } = process.env;

        // La ruta en la API para subir el archivo.
        // Esto lo coloca en la carpeta raíz -> 'folderName' -> tu archivo.
        const uploadPath = `/users/${ONEDRIVE_USER_ID}/drive/root:/${folderName}/${fileName}:/content`;

        const response = await client.api(uploadPath).put(fileBuffer);
        
        console.log(`Archivo ${fileName} subido a OneDrive con éxito.`);
        return response; // Contiene 'webUrl', 'id', etc.

    } catch (error) {
        console.error("Error al subir el archivo a OneDrive:", error);
        throw new Error("No se pudo subir el archivo.");
    }
};