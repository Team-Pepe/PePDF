# Configuración de S3 para Almacenamiento de Archivos

Esta guía te ayudará a configurar AWS S3 para almacenar archivos generados por las herramientas de PePDF.

## 1. Crear Bucket S3

### Opción A: Usando AWS Console

1. Ve a **S3 Console**: https://s3.console.aws.amazon.com/
2. Click en **Create bucket**
3. Configuración:
   - **Bucket name**: `pepdf-files` (o el nombre que prefieras, debe ser único globalmente)
   - **AWS Region**: Selecciona la misma región que tu EC2 y RDS (ej: `us-east-1`)
   - **Block Public Access**: ✅ Mantener TODAS las opciones marcadas (bucket privado)
   - **Bucket Versioning**: Opcional (recomendado para recuperación)
   - **Encryption**: ✅ Enable Server-side encryption (SSE-S3)
4. Click **Create bucket**

### Opción B: Usando AWS CLI

```bash
aws s3 mb s3://pepdf-files --region us-east-1

# Configurar encriptación
aws s3api put-bucket-encryption \
  --bucket pepdf-files \
  --server-side-encryption-configuration '{
    "Rules": [{
      "ApplyServerSideEncryptionByDefault": {
        "SSEAlgorithm": "AES256"
      }
    }]
  }'

# Bloquear acceso público
aws s3api put-public-access-block \
  --bucket pepdf-files \
  --public-access-block-configuration \
    "BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true"
```

## 2. Configurar IAM Role para EC2 (Recomendado)

Esta es la forma MÁS SEGURA de dar acceso a S3 desde EC2.

### Crear IAM Role

1. Ve a **IAM Console** → **Roles** → **Create role**
2. **Trusted entity type**: AWS service
3. **Use case**: EC2
4. Click **Next**
5. **Add permissions**: Por ahora skip, crearemos una política custom
6. **Role name**: `PePDF-EC2-S3-Role`
7. Click **Create role**

### Crear IAM Policy

1. En la página del role, click **Add permissions** → **Create inline policy**
2. Click en **JSON** y pega:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowS3Operations",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::pepdf-files",
        "arn:aws:s3:::pepdf-files/*"
      ]
    }
  ]
}
```

3. **Policy name**: `PePDF-S3-Access`
4. Click **Create policy**

### Asignar Role a EC2

1. Ve a **EC2 Console** → Tu instancia
2. **Actions** → **Security** → **Modify IAM role**
3. Selecciona `PePDF-EC2-S3-Role`
4. Click **Update IAM role**

## 3. Configurar VPC Endpoint para S3 (Opcional pero Recomendado)

Esto permite que EC2 acceda a S3 sin salir de la VPC, mejorando seguridad y reduciendo costos.

### Crear VPC Endpoint

1. Ve a **VPC Console** → **Endpoints** → **Create endpoint**
2. Configuración:
   - **Name**: `pepdf-s3-endpoint`
   - **Service category**: AWS services
   - **Service name**: Busca `com.amazonaws.us-east-1.s3` (ajusta región)
   - **Type**: Gateway
   - **VPC**: Selecciona tu VPC
   - **Route tables**: Selecciona las route tables de tus subnets privadas
3. Click **Create endpoint**

## 4. Configurar Variables de Entorno

### Usando IAM Role (Recomendado para EC2)

Si configuraste el IAM Role, NO necesitas credenciales en `.env.local`:

```env
# AWS S3 Configuration (usando IAM Role)
AWS_REGION=us-east-1
AWS_S3_BUCKET=pepdf-files
```

### Usando Access Keys (Para desarrollo local)

Si estás en desarrollo local, necesitas crear Access Keys:

1. Ve a **IAM Console** → **Users** → Tu usuario → **Security credentials**
2. **Create access key** → **Application running outside AWS**
3. Copia el Access Key ID y Secret Access Key

```env
# AWS S3 Configuration (desarrollo local)
AWS_REGION=us-east-1
AWS_S3_BUCKET=pepdf-files
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

⚠️ **NUNCA subas estas credenciales a Git**

## 5. Configurar CORS (Si es necesario)

Si planeas subir archivos directamente desde el navegador (no aplica en este caso):

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["http://localhost:3000", "https://tu-dominio.com"],
    "ExposeHeaders": ["ETag"]
  }
]
```

## 6. Lifecycle Policy (Opcional)

Para eliminar archivos antiguos automáticamente:

1. Ve a tu bucket → **Management** → **Create lifecycle rule**
2. Configuración:
   - **Rule name**: `delete-old-files`
   - **Rule scope**: Apply to all objects
   - **Lifecycle rule actions**: ✅ Expire current versions of objects
   - **Days after object creation**: 90 (o el tiempo que prefieras)
3. Click **Create rule**

## 7. Verificar Configuración

### Desde EC2

```bash
# Conectarse a EC2
ssh -i tu-key.pem ec2-user@tu-ec2-ip

# Verificar que puede listar el bucket
aws s3 ls s3://pepdf-files/

# Probar subir un archivo de prueba
echo "test" > test.txt
aws s3 cp test.txt s3://pepdf-files/test.txt

# Verificar que se subió
aws s3 ls s3://pepdf-files/

# Limpiar
aws s3 rm s3://pepdf-files/test.txt
rm test.txt
```

### Desde la Aplicación

Una vez desplegada la aplicación:

1. Genera un QR code
2. Click en "Descargar y Guardar en S3"
3. Verifica en S3 Console que el archivo se subió
4. Verifica en PostgreSQL que se creó el registro:

```sql
SELECT * FROM files ORDER BY created_at DESC LIMIT 5;
```

## 8. Monitoreo y Costos

### Ver archivos en S3

```bash
# Listar todos los archivos
aws s3 ls s3://pepdf-files/ --recursive

# Ver tamaño total del bucket
aws s3 ls s3://pepdf-files/ --recursive --summarize
```

### Costos estimados

- **Almacenamiento**: ~$0.023 por GB/mes
- **Requests PUT**: $0.005 por 1,000 requests
- **Requests GET**: $0.0004 por 1,000 requests
- **Data transfer**: Gratis dentro de la misma región

Para 1,000 archivos de 100KB cada uno:
- Almacenamiento: ~100MB = $0.002/mes
- Muy económico para uso normal

## Troubleshooting

### Error: "Access Denied"

- Verifica que el IAM Role está asignado a EC2
- Verifica que la política tiene permisos correctos
- Verifica que el bucket name es correcto

### Error: "Bucket does not exist"

- Verifica que el bucket existe en la región correcta
- Verifica la variable `AWS_S3_BUCKET` en `.env.local`

### Error: "Invalid credentials"

- Si usas Access Keys, verifica que sean correctas
- Si usas IAM Role, verifica que está asignado a EC2

### Los archivos no aparecen en S3

- Verifica logs de la aplicación: `pm2 logs pepdf`
- Verifica que la aplicación puede conectarse a S3
- Verifica que no hay errores en la consola del navegador

## Resumen de Comandos Útiles

```bash
# Listar archivos en S3
aws s3 ls s3://pepdf-files/ --recursive

# Descargar un archivo
aws s3 cp s3://pepdf-files/user_1/qr/file.png ./file.png

# Eliminar un archivo
aws s3 rm s3://pepdf-files/user_1/qr/file.png

# Sincronizar directorio local con S3
aws s3 sync ./local-dir s3://pepdf-files/backup/

# Ver tamaño del bucket
aws s3 ls s3://pepdf-files/ --recursive --summarize --human-readable
```
