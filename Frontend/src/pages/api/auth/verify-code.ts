import type { APIRoute } from 'astro';
import { verificationCodes } from './send-code';

export const POST: APIRoute = async ({ request }) => {
    try {
        const { email, code } = await request.json();

        if (!email || !code) {
            return new Response(JSON.stringify({ error: 'Correo y código son requeridos' }), { status: 400 });
        }

        const storedCode = verificationCodes.get(email);

        if (!storedCode) {
            return new Response(JSON.stringify({ error: 'El código ha expirado o no existe. Solicita uno nuevo.' }), { status: 400 });
        }

        if (storedCode !== code) {
            return new Response(JSON.stringify({ error: 'Código de seguridad incorrecto.' }), { status: 400 });
        }

        // Si es correcto, lo eliminamos de la memoria para que no pueda reusarse
        verificationCodes.delete(email);

        return new Response(JSON.stringify({ success: true, message: 'Código verificado correctamente' }), { status: 200 });

    } catch (error: any) {
        console.error("Error al verificar código:", error);
        return new Response(JSON.stringify({ error: 'Error interno al verificar' }), { status: 500 });
    }
}
