# Configuración de Variables de Entorno

## Para Desarrollo Local

Crea un archivo `.env.local` en la carpeta `client/`:

```bash
cd client
nano .env.local
```

Agrega las siguientes variables con tus credenciales de RDS:

```env
# PostgreSQL RDS Connection
DB_HOST=tu-endpoint.rds.amazonaws.com
DB_PORT=5432
DB_NAME=nombre_de_tu_database
DB_USER=tu_usuario_postgres
DB_PASSWORD=tu_password_seguro

# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_S3_BUCKET=pepdf-files
# Solo para desarrollo local (en EC2 usa IAM Role):
# AWS_ACCESS_KEY_ID=tu_access_key
# AWS_SECRET_ACCESS_KEY=tu_secret_key
```

**Ejemplo con valores reales:**

```env
DB_HOST=pepdf-db.c9akciq32.us-east-1.rds.amazonaws.com
DB_PORT=5432
DB_NAME=pepdf_production
DB_USER=admin
DB_PASSWORD=MiPasswordSeguro123!
```

## Para Producción en EC2

Después de clonar el repositorio en EC2, crea el archivo `.env.local`:

```bash
cd ~/toolsapp/client

cat > .env.local << EOF
DB_HOST=tu-endpoint.rds.amazonaws.com
DB_PORT=5432
DB_NAME=nombre_database
DB_USER=usuario
DB_PASSWORD=password
EOF

# Proteger el archivo
chmod 600 .env.local
```

## Verificar Configuración

Para verificar que las variables están configuradas correctamente:

```bash
# Ver el contenido (sin mostrar password en logs de producción)
cat .env.local

# Probar conexión desde EC2
psql -h $DB_HOST -U $DB_USER -d $DB_NAME
```

## Seguridad

⚠️ **IMPORTANTE:**
- **NUNCA** subas el archivo `.env.local` a Git
- El archivo ya está en `.gitignore`
- Usa contraseñas fuertes para PostgreSQL
- Limita el acceso SSH a tu EC2 solo a tu IP

## Obtener Credenciales de RDS

Si no tienes las credenciales de RDS:

1. Ve a **AWS Console** → **RDS**
2. Selecciona tu instancia PostgreSQL
3. En **Connectivity & security**:
   - **Endpoint**: Copia el endpoint (ej: `xxx.rds.amazonaws.com`)
   - **Port**: Usualmente 5432
4. El **nombre de la base de datos**, **usuario** y **contraseña** los definiste al crear la instancia RDS

## Troubleshooting

### Error: "Cannot find module 'pg'"
```bash
npm install pg @types/pg
```

### Error: "getaddrinfo ENOTFOUND"
- Verifica que el endpoint de RDS es correcto
- Confirma que tienes conectividad de red desde EC2 a RDS

### Error: "password authentication failed"
- Verifica usuario y contraseña en `.env.local`
- Confirma que el usuario existe en PostgreSQL
