import nodemailer from "nodemailer";

export const sendTempPasswordEmail = async (email, nombre, tempPassword) => {
  // Verificar si las credenciales de correo existen
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn("⚠️ Credenciales de email no configuradas (EMAIL_USER / EMAIL_PASS). No se envió el correo.");
    // En desarrollo, logueamos la contraseña para poder probar sin email
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEV] Contraseña temporal para ${email}: ${tempPassword}`);
    }
    return;
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.office365.com",
    port: 587,
    secure: false, // false para usar STARTTLS (puerto 587)
    requireTLS: true, // Forzar el uso de TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      ciphers: 'SSLv3' // Ayuda con compatibilidad en algunas versiones de Node
    }
  });

  const mailOptions = {
  from: `"ASYTEC Sistemas" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "Restablecimiento de contraseña | ASYTEC Sistemas",
  html: `
  <div style="background-color:#f2f4f6; padding:40px 0; font-family: Arial, Helvetica, sans-serif;">
    <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; background:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
      
      <!-- Header -->
      <tr>
        <td style="background:#0A5C8D; padding:20px; text-align:center;">
          <h1 style="color:#ffffff; margin:0; font-size:22px;">
            Priority Group
          </h1>
        </td>
      </tr>

      <!-- Body -->
      <tr>
        <td style="padding:30px; color:#333333;">
          <h2 style="margin-top:0; color:#0A5C8D; font-size:20px;">
            Hola ${nombre},
          </h2>

          <p style="font-size:15px; line-height:1.6;">
            Un administrador ha solicitado el <strong>restablecimiento de tu contraseña</strong> en la plataforma.
          </p>

          <p style="font-size:15px; margin-bottom:10px;">
            Tu nueva contraseña temporal es:
          </p>

          <!-- Password Box -->
          <div style="
            background:#f4f6f8;
            border:1px dashed #cbd5e1;
            border-radius:6px;
            padding:15px;
            text-align:center;
            font-size:18px;
            font-weight:bold;
            letter-spacing:1.5px;
            color:#0A5C8D;
            margin:20px 0;
          ">
            ${tempPassword}
          </div>

          <p style="font-size:14px; line-height:1.6;">
            Por razones de seguridad, te recomendamos iniciar sesión con esta contraseña y cambiarla inmediatamente desde tu perfil.
          </p>

          <!-- Button -->
          <div style="text-align:center; margin:30px 0;">
            <a href="${process.env.FRONT_URL}"
              style="
                background:#0A5C8D;
                color:#ffffff;
                padding:12px 24px;
                text-decoration:none;
                border-radius:5px;
                font-size:14px;
                font-weight:bold;
                display:inline-block;
              ">
              Iniciar sesión
            </a>
          </div>

          <p style="font-size:13px; color:#666;">
            Si no solicitaste este cambio, comunicate con el administrador del sistema.
          </p>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="background:#f4f6f8; padding:15px; text-align:center; font-size:12px; color:#777;">
          © ${new Date().getFullYear()} ASYTEC Sistemas · Todos los derechos reservados
        </td>
      </tr>
    </table>
  </div>
  `,
};


  await transporter.sendMail(mailOptions);
  console.log(`📧 Email de restablecimiento enviado a ${email}`);
};