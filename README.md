# PePDF - Herramientas de Conversión de Archivos

Aplicación web moderna para convertir, editar y optimizar archivos PDF e imágenes.

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
