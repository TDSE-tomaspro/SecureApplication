# Secure Application Deployment

Esta es la entrega para el requerimiento de Aplicación y Arquitectura Segura.

## Entregables
- **Documento de Diseño:** Puedes leer más sobre la arquitectura y la estrategia segura en AWS en el archivo [ARCHITECTURE.md](ARCHITECTURE.md).
- **Video Demostrativo:** [Coloca aquí el link de tu video de YouTube/Drive]
- **Screenshots de Testing:** [Agrega tus imágenes a la carpeta y enlaza aquí, ej: `![Login](captura1.png)`]

---

## Guía de Despliegue en AWS (Amazon Linux 2023)

Estos son los pasos exactos para poner en funcionamiento el servidor web con proxy y Let's Encrypt en la instancia `ec2-user` de Amazon Linux 2023.

### 1. Preparación del Servidor
En tu consola de AWS EC2:
1. Asegúrate de configurar en el Security Group:
   - `HTTP` (80) abierto a todos (0.0.0.0/0).
   - `HTTPS` (443) abierto a todos (0.0.0.0/0).
   - `SSH` (22) abierto a "Mi IP".
2. Conéctate a tu instancia EC2 por SSH.
3. Actualiza el servidor e instala las dependencias de Java 21, Apache y Maven:
   ```bash
   sudo dnf update -y
   sudo dnf install -y java-21-amazon-corretto-headless maven httpd mod_ssl
   ```

### 2. Despliegue de la Aplicación Spring Boot
Clona y compila tu proyecto:
```bash
git clone https://github.com/TDSE-tomaspro/SecureApplication.git
cd SecureApplication
mvn clean package -DskipTests
```
Ejecuta la aplicación en su puerto interno seguro (8443):
```bash
# Ejecutar de fondo:
nohup java -jar target/secureapp-0.0.1-SNAPSHOT.jar &
```

### 3. Configuración de Let's Encrypt (`certbot`)
En Amazon Linux 2023 certbot se instala en un entorno virtual de Python:
```bash
sudo dnf install -y augeas-libs python3 python3-pip
sudo python3 -m venv /opt/certbot/
sudo /opt/certbot/bin/pip install --upgrade pip
sudo /opt/certbot/bin/pip install certbot certbot-apache
sudo ln -s /opt/certbot/bin/certbot /usr/bin/certbot
```
Para usar Let's Encrypt asocia un dominio a la IP Pública de tu EC2 y ejecuta:
```bash
sudo certbot --apache -d tarea50por.duckdns.org
```

### 4. Configurar el Reverse Proxy Seguro (TLS hacia Spring)
1. Edita el archivo de configuración SSL que apache utiliza (usualmente en `/etc/httpd/conf.d/ssl.conf` o el generado por certbot):
   ```bash
   sudo nano /etc/httpd/conf.d/ssl.conf
   ```
2. Modifica o agrega dentro de la etiqueta `<VirtualHost _default_:443>` (o el VirtualHost de tu dominio) las siguientes líneas:

   ```apache
   <VirtualHost _default_:443>
       # (Líneas previas generadas por Certbot o por defecto del SSL)

       # Activar proxy seguro a Spring Boot
       SSLProxyEngine on
       SSLProxyVerify none 
       SSLProxyCheckPeerCN off
       SSLProxyCheckPeerName off
       SSLProxyCheckPeerExpire off

       # Servir la interfaz estática
       DocumentRoot /var/www/html/SecureApplication/src/main/resources/static
       
       # Proxy hacia el API backend
       ProxyPass /api/ https://localhost:8443/api/
       ProxyPassReverse /api/ https://localhost:8443/api/
   </VirtualHost>
   ```
3. Reinicia y habilita el servidor Apache:
   ```bash
   sudo systemctl restart httpd
   sudo systemctl enable httpd
   ```

¡Ya deberías poder acceder a la página web en `https://tarea50por.duckdns.org` y ver un Login seguro asíncrono!

## Credenciales Locales
Por defecto el usuario y la contraseña almacenados en el `SecurityConfig` son:
- **Username:** `admin`
- **Password:** `password`
(La contraseña está validada mediante `BCrypt` y almacenada en memoria).