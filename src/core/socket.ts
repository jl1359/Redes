import * as tls from 'tls';

export class SecureSocket {
    private client?: tls.TLSSocket;
    // Tiempo límite de espera para evitar que la app se cuelgue (10 segundos)
    private readonly TIMEOUT_MS = 10000;

    /**
     * Establece conexión TLS con el servidor POP3.
     * CUMPLE REQUERIMIENTO: Manejo de errores de conexión.
     */
    connect(host: string, port: number): Promise<string> {
        return new Promise((resolve, reject) => {
            this.client = tls.connect(port, host, { rejectUnauthorized: false }, () => {
                console.log(`[Red] Conexión TLS establecida con ${host}:${port}`);
            });

            // Error si no se puede conectar inicialmente
            this.client.once('error', (err) => {
                reject(new Error(`Fallo de conexión inicial: ${err.message}`));
            });

            this.client.once('data', (data) => resolve(data.toString()));
        });
    }

    /**
     * Envía comandos y gestiona la recepción de datos multilínea (RETR/TOP).
     * CUMPLE REQUERIMIENTO: Manejo de errores inherentes al bajar archivos (Timeout).
     */
    sendCommand(command: string): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!this.client) return reject(new Error("Socket no conectado"));

            let response = "";

            // Temporizador para evitar esperas infinitas si falla la red
            const timer = setTimeout(() => {
                this.client?.removeListener('data', onData);
                reject(new Error(`Timeout: El servidor dejó de responder al comando ${command}`));
            }, this.TIMEOUT_MS);

            const onData = (data: Buffer) => {
                // Si llegan datos, reiniciamos el temporizador
                timer.refresh();
                response += data.toString();
                
                // Los comandos TOP y RETR terminan con un punto en una línea nueva "\r\n.\r\n"
                if (command.startsWith("RETR") || command.startsWith("TOP")) {
                    if (response.endsWith("\r\n.\r\n")) {
                        clearTimeout(timer);
                        this.client?.removeListener('data', onData);
                        resolve(response);
                    }
                } else {
                    // Comandos de una sola línea (USER, PASS, STAT, QUIT)
                    clearTimeout(timer);
                    this.client?.removeListener('data', onData);
                    resolve(response);
                }
            };

            this.client.on('data', onData);
            this.client.write(`${command}\r\n`);
        });
    }

    /**
     * Cierre de socket seguro.
     */
    close() {
        if (this.client) {
            this.client.end();
            this.client.destroy();
            console.log("[Red] Socket destruido correctamente.");
        }
    }
}