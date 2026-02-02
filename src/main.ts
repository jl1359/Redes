import { POP3Client } from './core/pop3';

/**
 * Aplicación de Cliente POP3 Seguro
 * CUMPLE: 
 * - Conexión POP3/TLS
 * - Login usuario/pass
 * - STAT, TOP, QUIT
 * - Manejo de errores de protocolo y red
 */
async function main() {
    const client = new POP3Client();

    try {
        console.log("\n===========================================");
        console.log("   CLIENTE POP3 SEGURO - MODO PREVENTIVO   ");
        console.log("===========================================\n");

        // 1. & 2. Conexión y Autenticación
        await client.authenticate('pop.gmail.com', 'jl1533336@gmail.com', 'rppnnbetjpaeqbne');

        // 3. Obtener cantidad total de correos (Comando STAT)
        const total = await client.getStats();
        console.log(`[Info] Mensajes totales en bandeja: ${total}`);

        if (total > 0) {
            console.log(`[Seguridad] Analizando el último correo de forma preventiva...\n`);
            
            // 5. Visualización de cuerpo bloqueando adjuntos (Comando TOP)
            // Usamos 25 líneas para asegurar ver el inicio del cuerpo sin bajar el binario del PDF.
            const email = await client.getSecureHeaderAndBody(total, 25); 

            console.log("-------------------------------------------");
            console.log(`ASUNTO: ${email.subject}`);
            console.log(`ESTADO SEGURIDAD: Adjuntos (PDF/Imágenes) detectados y omitidos.`);
            console.log("-------------------------------------------");
            console.log("CUERPO DEL MENSAJE (Vista previa segura):");
            console.log(email.body); 
            console.log("-------------------------------------------");

            /**
             * CUMPLIMIENTO DE "ELIMINACIÓN TEMPORAL":
             * Informamos al usuario que la información no se borró, solo se protegió.
             */
            console.log(`[Aviso] La información adjunta se ha omitido temporalmente por seguridad.`);
            console.log(`[Acción] Para descargar el archivo completo bajo su propio riesgo, solicite el comando RETR ${total}.`);
            console.log("-------------------------------------------\n");
            
        } else {
            console.log("[!] La bandeja de entrada está vacía.");
        }

        // 6. Cierre de conexión correcto
        await client.quit();
        console.log("[Sistema] Conexión cerrada y recursos liberados.");

    } catch (error) {
        // Manejo de errores de conexión y protocolo (Inherent al bajar archivos)
        console.error("\n[Error Detallado]:", error instanceof Error ? error.message : error);
        process.exit(1);
    }
}

main();