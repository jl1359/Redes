import { POP3Client } from './core/pop3';

async function main() {
    const client = new POP3Client();

    try {
        console.log("");
        console.log("   CLIENTE POP3 SEGURO - CLASE REDES      ");
        console.log("\n");

        // CONFIGURACIÓN:
        // Servidor: pop.gmail.com | Puerto: 995
        // RECUERDA: Usa una "Contraseña de Aplicación" de 16 letras de Google
        await client.authenticate('pop.gmail.com', 'jl1533336@gmail.com', 'rppnnbetjpaeqbne');

        const total = await client.getStats();
        console.log(`[Info] Mensajes totales en bandeja: ${total}`);

        if (total > 0) {
            console.log(`[Info] Analizando el último correo...\n`);
            
            // Obtenemos el último mensaje (índice total)
            const email = await client.getSecureEmail(total);

            console.log("");
            console.log(`ASUNTO: ${email.subject}`);
            console.log(`ADJUNTOS BLOQUEADOS: ${email.blockedCount}`);
            console.log("");
            console.log("CONTENIDO (Filtrado):");
            console.log(email.body.substring(0, 500) + "..."); 
            console.log("");
        } else {
            console.log("[!] La bandeja de entrada está vacía.");
        }

        await client.quit();
        console.log("\n[Sistema] Conexión cerrada correctamente.");

    } catch (error) {
        console.error("\n[Error Crítico]:", error);
    }
}

main();