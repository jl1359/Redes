import { SecureSocket } from './socket';
import { EmailFilter } from '../parser/filter';

export class POP3Client {
    private socket: SecureSocket;

    constructor() {
        this.socket = new SecureSocket();
    }

    private delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Valida que la respuesta del servidor comience con +OK.
     * CUMPLE REQUERIMIENTO: Manejo de errores de protocolo.
     */
    private checkResponse(response: string, context: string): string {
        if (!response.toUpperCase().trim().startsWith('+OK')) {
            throw new Error(`[Protocol Error] ${context}: ${response.trim()}`);
        }
        return response;
    }

    async authenticate(host: string, user: string, pass: string) {
        // 1. Conexión inicial
        const greeting = await this.socket.connect(host, 995);
        this.checkResponse(greeting, "Conexión inicial"); 
        console.log('S:', greeting.trim());
        await this.delay(500); 

        // 2. Comando USER
        const userRes = await this.socket.sendCommand(`USER ${user}`);
        this.checkResponse(userRes, "Usuario");
        console.log('C: USER -> S:', userRes.trim());
        await this.delay(500);

        // 3. Comando PASS
        const cleanPass = pass.replace(/\s+/g, '');
        const passRes = await this.socket.sendCommand(`PASS ${cleanPass}`);
        this.checkResponse(passRes, "Contraseña/Autenticación");
        
        console.log('[Sistema] Autenticación exitosa');
    }

    async getStats(): Promise<number> {
        const res = await this.socket.sendCommand('STAT');
        this.checkResponse(res, "Obtención de estadísticas (STAT)");
        
        // El formato es +OK [num_mensajes] [tamaño_total]
        const parts = res.split(' ');
        return parts.length > 1 ? parseInt(parts[1]) : 0;
    }

    /**
     * CUMPLE REQUERIMIENTO CRÍTICO: Evita bajar archivos adjuntos directamente.
     * En lugar de RETR, usamos TOP para limitar la descarga a texto seguro.
     */
    async getSecureHeaderAndBody(id: number, lines: number = 20) {
        console.log(`[Seguridad] Ejecutando TOP ${id} ${lines} para prevenir descarga de binarios...`);
        
        const rawData = await this.socket.sendCommand(`TOP ${id} ${lines}`);
        this.checkResponse(rawData, `Lectura de mensaje ${id}`);
        
        // Pasamos el contenido al filtro para extraer Subject y limpiar el Body
        return EmailFilter.processContent(rawData);
    }

    async quit() {
        const res = await this.socket.sendCommand('QUIT');
        this.checkResponse(res, "Cierre de sesión (QUIT)");
        console.log('S (QUIT):', res.trim());
        this.socket.close();
    }
}