# Guía de Configuración AWS para PePDF

Esta guía te ayudará a configurar tu instancia EC2 para conectarse a RDS PostgreSQL y desplegar la aplicación Next.js.

## 1. Configuración de Security Groups

### Security Group de RDS

Tu instancia RDS debe tener un Security Group que permita conexiones desde EC2:

1. Ve a **RDS Console** → Tu instancia → **Connectivity & security**
2. Click en el **Security Group** asociado
3. En la pestaña **Inbound rules**, agrega una regla:
   - **Type**: PostgreSQL
   - **Protocol**: TCP
   - **Port**: 5432
   - **Source**: Security Group de tu EC2 (ej: `sg-xxxxxxxxx`)
   - **Description**: Allow from EC2

### Security Group de EC2

Tu instancia EC2 debe permitir tráfico HTTP/HTTPS:

1. Ve a **EC2 Console** → Tu instancia → **Security** tab
2. Click en el **Security Group**
3. Asegúrate de tener estas reglas de **Inbound**:
   - **Type**: HTTP, **Port**: 80, **Source**: 0.0.0.0/0
   - **Type**: HTTPS, **Port**: 443, **Source**: 0.0.0.0/0
   - **Type**: Custom TCP, **Port**: 3000, **Source**: 0.0.0.0/0 (para desarrollo)
   - **Type**: SSH, **Port**: 22, **Source**: Tu IP

## 2. Verificar Conectividad RDS ↔ EC2

Ambas instancias deben estar en la **misma VPC** (ya confirmado ✓).

Para probar la conexión desde EC2:

```bash
# Conectarse a EC2 via SSH
ssh -i tu-key.pem ec2-user@tu-ec2-ip

# Instalar PostgreSQL client
sudo yum install postgresql15 -y  # Amazon Linux 2023
# O
sudo apt install postgresql-client -y  # Ubuntu

# Probar conexión a RDS
psql -h tu-endpoint.rds.amazonaws.com -U tu_usuario -d tu_database

# Si conecta exitosamente, la configuración de red está correcta
```

## 3. Instalar Node.js en EC2

```bash
# Conectarse a EC2
ssh -i tu-key.pem ec2-user@tu-ec2-ip

# Instalar Node.js 18+ (usando nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
node --version  # Debe mostrar v18.x.x

# Instalar PM2 globalmente
npm install -g pm2
```

## 4. Clonar y Configurar el Proyecto

```bash
# Clonar tu repositorio
cd ~
git clone https://github.com/tu-usuario/toolsapp.git
cd toolsapp/client

# Instalar dependencias
npm install

# Crear archivo .env.local con credenciales RDS
cat > .env.local << EOF
DB_HOST=tu-endpoint.rds.amazonaws.com
DB_PORT=5432
DB_NAME=tu_database
DB_USER=tu_usuario
DB_PASSWORD=tu_password
EOF

# IMPORTANTE: Proteger el archivo de credenciales
chmod 600 .env.local
```

## 5. Build y Deploy

```bash
# Build de producción
npm run build

# Iniciar con PM2
pm2 start npm --name "pepdf" -- start

# Guardar configuración PM2
pm2 save
pm2 startup  # Seguir las instrucciones que aparezcan
```

## 6. Verificar Deployment

```bash
# Ver logs
pm2 logs pepdf

# Ver estado
pm2 status

# Probar endpoint desde EC2
curl http://localhost:3000/api/health

# Probar desde tu navegador
http://tu-ec2-ip-publica:3000
```

## 7. Configuración de Variables de Entorno

Asegúrate de tener estas variables en `.env.local`:

```env
# PostgreSQL RDS Connection
DB_HOST=tu-endpoint.rds.amazonaws.com
DB_PORT=5432
DB_NAME=nombre_database
DB_USER=usuario_postgres
DB_PASSWORD=password_seguro
```

## 8. Troubleshooting

### Error: "Connection refused" o "timeout"

- Verifica que el Security Group de RDS permite conexiones desde el SG de EC2
- Confirma que ambos están en la misma VPC
- Verifica que el endpoint de RDS es correcto

### Error: "password authentication failed"

- Verifica usuario y contraseña en `.env.local`
- Confirma que el usuario tiene permisos en la base de datos

### Error: "relation users does not exist"

- Las tablas no existen. Conéctate a RDS y ejecuta:

```bash
psql -h tu-endpoint.rds.amazonaws.com -U tu_usuario -d tu_database

# Ejecutar el schema
CREATE TABLE users (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_access TIMESTAMPTZ
);
```

## 9. Actualizar la Aplicación

```bash
# Conectarse a EC2
cd ~/toolsapp/client

# Pull cambios
git pull

# Reinstalar dependencias si es necesario
npm install

# Rebuild
npm run build

# Reiniciar PM2
pm2 restart pepdf
```

## 10. Configurar Dominio (Opcional)

Si tienes un dominio, puedes configurar Nginx como reverse proxy:

```bash
sudo yum install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

# Configurar Nginx para redirigir a Next.js
sudo nano /etc/nginx/conf.d/pepdf.conf
```

Contenido del archivo:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo systemctl restart nginx
```

## Resumen de Comandos Rápidos

```bash
# Ver logs de la aplicación
pm2 logs pepdf

# Reiniciar aplicación
pm2 restart pepdf

# Detener aplicación
pm2 stop pepdf

# Ver estado
pm2 status

# Monitorear recursos
pm2 monit
```
