export class EmailFilter {
    // Tipos de archivos que el ingeniero pidió bloquear expresamente
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
        let isInsideBannedAttachment = false;
        let readingHeader = true; // Flag para saber cuando terminan las cabeceras principales

        for (const line of lines) {
            const lowerLine = line.toLowerCase();

            // 1. Extraer el Asunto (Subject)
            if (lowerLine.startsWith('subject:')) {
                subject = line.substring(8).trim();
                continue;
            }

            // 2. Detectar el fin de las cabeceras principales (línea vacía)
            if (readingHeader && line.trim() === "") {
                readingHeader = false;
                continue;
            }

            // 3. Control de adjuntos prohibidos
            if (lowerLine.includes('content-type:')) {
                const isBanned = this.BANNED_TYPES.some(type => lowerLine.includes(type));
                
                if (isBanned) {
                    isInsideBannedAttachment = true;
                    body += "\n>>> [SEGURIDAD] ARCHIVO ADJUNTO OMITIDO PREVENTIVAMENTE <<<\n";
                    continue; 
                }
            }

            // 4. Resetear bloqueo si encontramos un boundary de MIME (separador de partes)
            if (line.trim().startsWith('--')) {
                isInsideBannedAttachment = false;
                continue;
            }

            // 5. Construcción del cuerpo limpio
            // Evitamos: cabeceras técnicas, metadatos y contenido dentro de adjuntos prohibidos
            if (!readingHeader && !isInsideBannedAttachment) {
                const isTechnicalHeader = lowerLine.startsWith('content-') || 
                                        lowerLine.startsWith('x-') || 
                                        lowerLine.startsWith('received:');

                if (!isTechnicalHeader) {
                    body += line + "\n";
                }
            }
        }

        return {
            subject,
            body: body.trim() || "El cuerpo del mensaje está vacío o es puramente técnico."
        };
    }
}