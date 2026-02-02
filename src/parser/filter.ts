export class EmailFilter {
    // Tipos de archivos que el ingeniero pidió bloquear
    private static BANNED_TYPES = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif'
    ];

    static processContent(rawEmail: string) {
        const lines = rawEmail.split('\n');
        let subject = "Sin Asunto";
        let body = "";
        let blockedCount = 0;
        let isInsideBannedAttachment = false;

        for (const line of lines) {
            const lowerLine = line.toLowerCase();

            // 1. Extraer el Asunto del correo
            if (lowerLine.startsWith('subject:')) {
                subject = line.substring(8).trim();
            }

            // 2. Detectar si la parte actual del mensaje es un adjunto prohibido
            if (lowerLine.includes('content-type:')) {
                const isBanned = this.BANNED_TYPES.some(type => lowerLine.includes(type));
                
                if (isBanned) {
                    isInsideBannedAttachment = true;
                    blockedCount++;
                    body += "\n[!] ARCHIVO ADJUNTO DETECTADO Y BLOQUEADO (Seguridad POP3)\n";
                    continue; 
                }
            }

            // 3. Si detectamos un "boundary" (separador MIME), reseteamos el bloqueo
            // Los adjuntos en correos terminan cuando aparece una línea que empieza con --
            if (line.startsWith('--')) {
                isInsideBannedAttachment = false;
            }

            // 4. Solo agregamos contenido al cuerpo si NO estamos dentro de un adjunto prohibido
            // También evitamos agregar las cabeceras técnicas al cuerpo legible
            if (!isInsideBannedAttachment && !lowerLine.startsWith('content-')) {
                body += line + "\n";
            }
        }

        return {
            subject,
            body: body.trim(),
            blockedCount
        };
    }
}