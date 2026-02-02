import { SecureSocket } from './socket';
import { EmailFilter } from '../parser/filter';

export class POP3Client {
    private socket: SecureSocket;

    constructor() {
        this.socket = new SecureSocket();
    }

    // Función auxiliar para dar tiempo al servidor de procesar comandos
    private delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async authenticate(host: string, user: string, pass: string) {
        // Conexión inicial y saludo
        const greeting = await this.socket.connect(host, 995);
        console.log('S:', greeting.trim());
        await this.delay(500); 

        // Comando USER
        const userRes = await this.socket.sendCommand(`USER ${user}`);
        console.log('C: USER -> S:', userRes.trim());
        await this.delay(500);

        // Comando PASS (limpiando espacios por seguridad)
        const cleanPass = pass.replace(/\s+/g, '');
        const passRes = await this.socket.sendCommand(`PASS ${cleanPass}`);
        console.log('C: PASS -> S:', passRes.trim());
        
        // Verificación de éxito (+OK)
        if (!passRes.toUpperCase().includes('+OK')) {
            throw new Error(`Credenciales incorrectas: ${passRes.trim()}`);
        }
        
        console.log('[Sistema] Autenticación exitosa');
    }

    async getStats(): Promise<number> {
        const res = await this.socket.sendCommand('STAT');
        console.log('S (STAT):', res.trim());
        // El formato es +OK [num_mensajes] [tamaño_total]
        const parts = res.split(' ');
        return parts.length > 1 ? parseInt(parts[1]) : 0;
    }

    async getSecureEmail(id: number) {
        console.log(`[Sistema] Solicitando mensaje ID: ${id}...`);
        const rawData = await this.socket.sendCommand(`RETR ${id}`);
        
        // Aplicamos el filtro de seguridad antes de procesar el contenido
        return EmailFilter.processContent(rawData);
    }

    async quit() {
        const res = await this.socket.sendCommand('QUIT');
        console.log('S (QUIT):', res.trim());
        this.socket.close();
    }
}