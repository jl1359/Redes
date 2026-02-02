import * as tls from 'tls';

export class SecureSocket {
    private client?: tls.TLSSocket;

    connect(host: string, port: number): Promise<string> {
        return new Promise((resolve, reject) => {
            this.client = tls.connect(port, host, { rejectUnauthorized: false }, () => {
                console.log(`[Red] Conexión TLS establecida con ${host}:${port}`);
            });

            this.client.once('data', (data) => resolve(data.toString()));
            this.client.on('error', (err) => reject(err));
        });
    }

    sendCommand(command: string): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!this.client) return reject("Socket no conectado");

            let response = "";
            
            const onData = (data: Buffer) => {
                response += data.toString();
                
                // Si el comando es RETR, debemos esperar al punto final "." solo en una línea
                if (command.startsWith("RETR")) {
                    if (response.endsWith("\r\n.\r\n")) {
                        this.client?.removeListener('data', onData);
                        resolve(response);
                    }
                } else {
                    // Para comandos simples (USER, PASS, STAT), resolvemos de inmediato
                    this.client?.removeListener('data', onData);
                    resolve(response);
                }
            };

            this.client.on('data', onData);
            this.client.write(`${command}\r\n`);
        });
    }

    close() {
        this.client?.end();
    }
}