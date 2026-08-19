import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER || import.meta.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS || import.meta.env.GMAIL_PASS
    }
});

// Guardamos los códigos generados en memoria temporalmente 
// (En producción idealmente en Redis o Base de datos)
export const verificationCodes = new Map<string, string>();

export const POST: APIRoute = async ({ request }) => {
    try {
        const { email, nombre, type } = await request.json();

        if (!email) {
            return new Response(JSON.stringify({ error: 'El correo electrónico es requerido.' }), { status: 400 });
        }

        // Generar un código de 6 dígitos
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Guardarlo en memoria asociado al email
        verificationCodes.set(email, code);

        const isRecovery = type === 'recovery';
        const subject = isRecovery ? 'Recuperación de Contraseña - FinanceAI' : 'Código de Verificación - FinanceAI';
        
        const htmlContent = `
            <div style="font-family: sans-serif; background-color: #fcfaf8; padding: 40px; text-align: center; border-radius: 20px; border: 1px solid #e7e5e4;">
                <h1 style="color: #2563eb; font-weight: 800;">FinanceAI</h1>
                <p style="color: #444; font-size: 16px;">Hola <strong>${nombre || 'Usuario'}</strong>,</p>
                <p style="color: #444; font-size: 14px; margin-top: 20px;">
                    ${isRecovery ? 'Has solicitado recuperar tu contraseña.' : 'Gracias por registrarte en FinanceAI.'}
                    Usa el siguiente código de seguridad de 6 dígitos para continuar:
                </p>
                
                <div style="margin: 30px auto; background-color: #f3f4f6; padding: 20px; border-radius: 10px; width: fit-content; border: 1px dashed #d1d5db;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827;">${code}</span>
                </div>
                
                <p style="font-size: 12px; color: #6b7280; margin-top: 30px;">
                    Este código expirará en 15 minutos. Si no solicitaste este código, puedes ignorar este correo.
                </p>
            </div>
        `;

        await transporter.sendMail({
            from: `"FinanceAI Security" <${process.env.GMAIL_USER || import.meta.env.GMAIL_USER}>`,
            to: email,
            subject: subject,
            html: htmlContent
        });

        // Opcional: limpiar el mapa después de 15 minutos
        setTimeout(() => {
            if (verificationCodes.get(email) === code) {
                verificationCodes.delete(email);
            }
        }, 15 * 60 * 1000);

        return new Response(JSON.stringify({ success: true, message: 'Código enviado correctamente' }), { status: 200 });

    } catch (error: any) {
        console.error("Error al enviar correo:", error);
        return new Response(JSON.stringify({ error: 'Error interno al enviar el correo' }), { status: 500 });
    }
}
