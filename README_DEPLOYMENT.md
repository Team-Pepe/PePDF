# PePDF - Guía Rápida de Deployment

## 📋 Requisitos Previos

- ✅ Instancia EC2 en AWS (misma VPC que RDS)
- ✅ Instancia RDS PostgreSQL configurada
- ✅ Tablas creadas en la base de datos (ver schema abajo)
- ✅ Security Groups configurados correctamente

## 🚀 Deployment en 5 Pasos

### 1. Conectarse a EC2

```bash
ssh -i tu-key.pem ec2-user@tu-ec2-ip
```

### 2. Instalar Node.js y PM2

```bash
# Instalar nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Instalar Node.js 18
nvm install 18
nvm use 18

# Instalar PM2
npm install -g pm2
```

### 3. Clonar y Configurar

```bash
# Clonar repositorio
cd ~
git clone https://github.com/tu-usuario/toolsapp.git
cd toolsapp/client

# Instalar dependencias
npm install

# Configurar variables de entorno
cat > .env.local << EOF
DB_HOST=tu-endpoint.rds.amazonaws.com
DB_PORT=5432
DB_NAME=tu_database
DB_USER=tu_usuario
DB_PASSWORD=tu_password
EOF

chmod 600 .env.local
```

### 4. Build y Deploy

```bash
# Build de producción
npm run build

# Iniciar con PM2
pm2 start npm --name "pepdf" -- start
pm2 save
pm2 startup  # Seguir instrucciones
```

### 5. Verificar

```bash
# Ver logs
pm2 logs pepdf

# Probar en navegador
http://tu-ec2-ip:3000
```

## 🗄️ Schema de Base de Datos

Si las tablas no existen, conéctate a RDS y ejecuta:

```sql
CREATE TABLE users (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_access TIMESTAMPTZ
);

CREATE TABLE files (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id BIGINT REFERENCES users(id),
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    size BIGINT NOT NULL,
    s3_key TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL
);
```

## 🔧 Comandos Útiles

```bash
# Ver estado
pm2 status

# Ver logs en tiempo real
pm2 logs pepdf

# Reiniciar aplicación
pm2 restart pepdf

# Detener aplicación
pm2 stop pepdf

# Actualizar aplicación
cd ~/toolsapp/client
git pull
npm install
npm run build
pm2 restart pepdf
```

## 📚 Documentación Completa

- **Configuración AWS detallada**: Ver `deployment/aws-setup.md`
- **Variables de entorno**: Ver `deployment/ENV_SETUP.md`
- **Script de deployment**: Usar `deployment/deploy.sh`

## ❓ Troubleshooting

### No puedo conectarme a RDS desde EC2

1. Verifica Security Groups:
   - RDS debe permitir puerto 5432 desde el SG de EC2
   - Ambos deben estar en la misma VPC

2. Prueba conexión:
```bash
psql -h tu-endpoint.rds.amazonaws.com -U tu_usuario -d tu_database
```

### Error "relation users does not exist"

Las tablas no existen. Ejecuta el schema SQL de arriba.

### La aplicación no inicia

```bash
# Ver logs detallados
pm2 logs pepdf --lines 100

# Verificar variables de entorno
cat ~/toolsapp/client/.env.local
```

## 🌐 Acceso a la Aplicación

Una vez desplegada:

- **Registro**: `http://tu-ec2-ip:3000/register`
- **Login**: `http://tu-ec2-ip:3000/login`
- **Dashboard**: `http://tu-ec2-ip:3000/dashboard`

## 🔒 Seguridad

- Las contraseñas se guardan **sin encriptar** (como solicitaste)
- Para producción real, considera implementar bcrypt
- Configura HTTPS con certificado SSL
- Limita acceso SSH solo a tu IP
