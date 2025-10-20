import { Resend } from "resend";

// --- INICIO: CORRECCIÓN ---
// No inicializamos el cliente aquí. Lo haremos de forma "perezosa" (lazy)
// para asegurarnos de que `dotenv` haya cargado las variables de entorno primero.
let resend;

const getResendClient = () => {
    if (!resend) {
        // Esta inicialización ahora ocurre la primera vez que se llama a una función de email,
        // momento en el cual process.env.RESEND_API_KEY ya estará disponible.
        resend = new Resend(process.env.RESEND_API_KEY);
    }
    return resend;
};
// --- FIN: CORRECCIÓN ---

/**
 * Envía un correo de bienvenida a un nuevo usuario.
 * @param {object} user - El objeto del usuario.
 */
export const sendWelcomeEmail = async (user) => {
    try {
        const resendClient = getResendClient();

        await resendClient.emails.send({
            from: "Recursos Humanos - ASYTEC Sistemas <no-reply@asytec.ar>",
            to: [user.email],
            subject: "¡Bienvenido a ASYTEC Sistemas!",
            html: `
            <div style="font-family: Arial, sans-serif; color: #333;">
                <h2>¡Hola, ${user.nombre}!</h2>
                <p>Te damos la bienvenida a nuestro portal de empleos. Tu cuenta ha sido creada con éxito.</p>
                <p>El siguiente paso es que verifiques tu correo electrónico. Puedes hacerlo intentando iniciar sesión y utilizando la opción para recibir el enlace de verificación.</p>
                <p>¡Gracias por unirte a nosotros!</p>
            </div>
        `,
        });

        console.log(`Correo de bienvenida enviado a ${user.email} vía Resend.`);
    } catch (error) {
        console.error("Error al enviar el correo de bienvenida con Resend:", error);
        // --- CORRECCIÓN ---
        // Relanzamos el error para que el controlador sepa que algo falló y detenga el proceso.
        throw new Error("No se pudo enviar el correo de bienvenida.");
    }
};