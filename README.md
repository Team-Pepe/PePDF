# PePDF - Herramientas de Conversión de Archivos

## Backend Lambda (Auth + Archivos)

Este proyecto incluye un backend minimalista en `lambda/` listo para desplegar en AWS Lambda (API Gateway HTTP API), usando Postgres (RDS) y S3. No usa JWT; emplea una cookie `HttpOnly` firmada para sesiones.

### Esquema esperado en Postgres

Usa tus tablas existentes:

```
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

La columna `password` almacena el hash en formato `scrypt:<salt_base64>:<hash_hex>`.

### Endpoints

- `POST /auth/register` — Crea usuario y devuelve sesión.
- `POST /auth/login` — Inicia sesión.
- `POST /auth/logout` — Cierra sesión (borra cookie).
- `GET /auth/me` — Devuelve el usuario autenticado.
- `POST /files/presign` — Genera URL firmada de subida a S3.
- `POST /files/finalize` — Guarda metadatos del archivo.
- `GET /files` — Lista archivos del usuario.
- `GET /files/{id}/download` — Devuelve URL firmada de descarga.

### Variables de entorno (Lambda)

- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_SSL` (`true` por defecto)
- `S3_BUCKET`, `S3_REGION`
- `CORS_ORIGIN` (ej. `http://localhost:3000` en desarrollo)
- `COOKIE_SECRET` (cadena secreta para firmar cookies)
- `SESSION_TTL_DAYS` (por defecto `7`)
- `SECURE_COOKIE` (`true` en producción con HTTPS)

### Despliegue

1. Ve a la carpeta `lambda/` y instala dependencias:
   - `cd lambda`
   - `npm install`
2. Exporta tus variables de entorno o configura un archivo `.env` con tu herramienta preferida.
3. Despliega con Serverless Framework:
   - `npx serverless deploy`
4. Obtén el `invokeUrl` de API Gateway para usarlo desde el frontend. Asegúrate de que `CORS_ORIGIN` coincida con el origen de tu aplicación.

### Uso desde el frontend

Realiza peticiones con `credentials: 'include'` para que la cookie de sesión viaje:

```
// Login
await fetch('<invokeUrl>/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password }),
  credentials: 'include'
});

// Presign
const presign = await fetch('<invokeUrl>/files/presign', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, type }),
  credentials: 'include'
}).then(r => r.json());

await fetch(presign.uploadUrl, { method: 'PUT', body: blob, headers: { 'Content-Type': type } });

await fetch('<invokeUrl>/files/finalize', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name, type, size: blob.size, s3Key: presign.s3Key }),
  credentials: 'include'
});
```

### Notas

- Recomendado usar RDS Proxy para gestionar conexiones de Lambda a Postgres.
- En producción, configura `SECURE_COOKIE=true` y usa HTTPS para que la cookie sea segura.
- `CORS_ORIGIN` debe ser tu dominio frontend; en dev, `http://localhost:3000`.

Aplicación web moderna para convertir, editar y optimizar archivos PDF e imágenes.

## Estructura del Proyecto

\`\`\`
app/
├── screens/              # Pantallas de la aplicación (UI)
│   ├── qr-generator/
│   ├── pdf-to-word/
│   ├── pdf-to-images/
│   ├── images-to-pdf/
│   ├── compress/
│   ├── merge-pdf/
│   └── remove-background/
├── tools/               # Rutas de Next.js
└── page.tsx            # Página principal

lib/
├── services/           # Lógica de negocio modularizada
│   ├── qr-service.ts      # Generación de códigos QR
│   ├── pdf-service.ts     # Operaciones con PDF
│   └── image-service.ts   # Procesamiento de imágenes
├── file-storage.ts    # Gestión de archivos
└── utils.ts           # Utilidades generales

components/
├── ui/                # Componentes de UI reutilizables
└── tool-layout.tsx    # Layout para herramientas
\`\`\`

## Servicios Disponibles

### QRService
- Generación de códigos QR con logo personalizado
- Configuración de tamaño y calidad

### PDFService
- **convertToWord**: Extrae texto de PDF y lo convierte
- **convertToImages**: Convierte páginas PDF a imágenes (PNG, JPEG, WEBP)
- **compress**: Reduce el tamaño de archivos PDF
- **merge**: Combina múltiples PDFs en uno

### ImageService
- **compress**: Comprime imágenes manteniendo calidad
- **removeBackground**: Elimina fondos de imágenes

## Características

- ✅ Generador de QR con logo personalizado
- ✅ Conversión de imágenes a PDF
- ✅ Conversión de PDF a imágenes (PNG, JPEG, WEBP)
- ✅ Conversión de PDF a Word (con extracción de texto)
- ✅ Comprimir archivos (imágenes y PDFs)
- ✅ Encriptar PDFs con contraseña
- ✅ Unir múltiples PDFs
- ✅ Remover fondo de imágenes

## Tecnologías

- **Next.js 16** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS v4** - Estilos
- **pdf-lib** - Manipulación de PDFs
- **pdfjs-dist** - Renderizado y extracción de texto
- **qrcode** - Generación de códigos QR
- **browser-image-compression** - Compresión de imágenes
- **jszip** - Creación de archivos ZIP

## Instalación

\`\`\`bash
npm install
# o
pnpm install
\`\`\`

## Desarrollo

\`\`\`bash
npm run dev
# o
pnpm dev
\`\`\`

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Arquitectura

La aplicación sigue una arquitectura modular con separación de responsabilidades:

1. **Screens**: Componentes de UI que manejan la interacción del usuario
2. **Services**: Lógica de negocio pura, sin dependencias de UI
3. **Components**: Componentes reutilizables de UI
4. **Lib**: Utilidades y funciones auxiliares

Esta estructura facilita el mantenimiento, testing y escalabilidad del proyecto.
