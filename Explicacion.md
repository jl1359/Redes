Cliente POP3 Seguro - Análisis de Seguridad y Robustez
Este proyecto implementa un cliente de correo bajo el protocolo POP3, diseñado con un enfoque en la prevención de ejecución de malware (virus en PDFs e imágenes) y manejo estricto de errores de red.

🛡️ Cumplimiento de Requerimientos de Seguridad
1. Prevención de Descarga Maliciosa (Virus)
Para cumplir con el requerimiento de "evitar abrir los archivos adjuntos de manera directa", la aplicación cambia la lógica tradicional de descarga:

Uso del comando TOP: En lugar de utilizar RETR (que descarga el 100% de los bytes del correo, incluyendo virus binarios), nuestra aplicación utiliza TOP <id> <líneas>.

Impacto en Seguridad: Dado que los archivos adjuntos en el estándar MIME se encuentran al final del mensaje, el comando TOP permite leer el asunto y el cuerpo del mensaje sin que los datos del virus lleguen nunca a la memoria RAM o al disco duro de la máquina local.

Eliminación Temporal: La información de los adjuntos se omite en la sesión actual. Se informa al usuario de su existencia, cumpliendo con la "eliminación temporal" hasta que exista una solicitud explícita.

2. Filtrado de Contenido MIME
El módulo EmailFilter actúa como un firewall de contenido:

Bandeja de Bloqueo: Se identifican y omiten líneas con Content-Type: application/pdf e imágenes.

Limpieza de Cabeceras: Se eliminan metadatos técnicos para mostrar solo el cuerpo del mensaje solicitado.

3. Manejo de Errores de Protocolo y Red
La aplicación es robusta ante fallos de comunicación:

Errores de Protocolo: Cada respuesta del servidor es validada mediante la función checkResponse. Si el servidor responde -ERR, la aplicación captura el error y cierra la conexión correctamente en lugar de colapsar.

Errores de Red (Timeout): Se implementó un temporizador de 10,000ms en el socket. Si el servidor deja de enviar datos durante la descarga de un archivo, el socket se destruye automáticamente para liberar recursos.

⚙️ Especificaciones Técnicas
Lenguaje: TypeScript.

Protocolo de Capa de Transporte: TLS (Seguridad de Capa de Transporte) sobre el puerto 995.

Comandos Implementados: USER, PASS, STAT, TOP, QUIT.

🚀 Ejecución del Proyecto
Instalar dependencias:

Bash
npm install
Ejecutar en modo preventivo:

Bash
npm start