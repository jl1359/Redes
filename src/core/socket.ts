import * as tls from 'tls';

export class SecureSocket {
    private client?: tls.TLSSocket;

    connect(host: string, port: number): Promise<string> {
        return new Promise((resolve, reject) => {
            this.client = tls.connect(port, host, { rejectUnauthorized: false }, () => {
                console.log(`[Red] Conectado a ${host}:${port}`);
            });

            // Recibir el mensaje inicial del servidor (+OK)
            this.client.once('data', (data) => resolve(data.toString()));
            this.client.on('error', (err) => reject(err));
        });
    }

    sendCommand(command: string): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!this.client) return reject("Socket no conectado");
            
            this.client.write(`${command}\r\n`);
            
            // Escuchar la respuesta del comando
            this.client.once('data', (data) => resolve(data.toString()));
        });
    }

    close() {
        this.client?.end();
    }
}