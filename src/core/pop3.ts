import { SecureSocket } from './socket';
import { EmailFilter } from '../parser/filter';

export class POP3Client {
    private socket: SecureSocket;

    constructor() {
        this.socket = new SecureSocket();
    }

    async authenticate(host: string, user: string, pass: string) {
        const greeting = await this.socket.connect(host, 995);
        console.log('S:', greeting.trim());

        await this.socket.sendCommand(`USER ${user}`);
        const passRes = await this.socket.sendCommand(`PASS ${pass}`);
        
        if (!passRes.startsWith('+OK')) throw new Error("Credenciales incorrectas");
        console.log('S: Autenticación exitosa');
    }

    async getStats(): Promise<number> {
        const res = await this.socket.sendCommand('STAT');
        return parseInt(res.split(' ')[1]);
    }

    async getSecureEmail(id: number) {
        const rawData = await this.socket.sendCommand(`RETR ${id}`);
        // Aplicamos el filtro de seguridad antes de devolver el correo
        return EmailFilter.processContent(rawData);
    }

    async quit() {
        await this.socket.sendCommand('QUIT');
        this.socket.close();
    }
}