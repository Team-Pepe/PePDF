<table>
  <tr>
    <td align="center" width="42%">
      <img src="public/placeholder-logo.png" alt="PePDF" width="360" />
    </td>
    <td align="left">
      <h1>PePDF</h1>
      <p><em>Monolito Next.js para convertir, editar y optimizar archivos</em></p>
      <p>
        <img alt="Next.js" src="https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white" />
        <img alt="React" src="https://img.shields.io/badge/React-20232a?logo=react&logoColor=61DAFB" />
        <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" />
        <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind%20CSS-06B6D4?logo=tailwindcss&logoColor=white" />
        <br/>
        <img alt="Radix UI" src="https://img.shields.io/badge/Radix%20UI-161618" />
        <img alt="pdf-lib" src="https://img.shields.io/badge/pdf--lib-333333" />
        <img alt="pdfjs-dist" src="https://img.shields.io/badge/pdfjs--dist-4A90E2" />
        <img alt="qrcode" src="https://img.shields.io/badge/qrcode-2C3E50" />
        <img alt="JSZip" src="https://img.shields.io/badge/JSZip-7F8C8D" />
        <img alt="docx" src="https://img.shields.io/badge/docx-34495E" />
        <img alt="jsPDF" src="https://img.shields.io/badge/jsPDF-2C3E50" />
      </p>
      <p>
        <a href="#instalacion">Instalación</a> • <a href="#uso">Uso</a> • <a href="#arquitectura-monolito">Arquitectura</a>
      </p>
    </td>
  </tr>
</table>

# PePDF

Aplicación web monolítica en Next.js 16 para gestionar operaciones comunes sobre PDFs e imágenes.

## 👥 Desarrolladores

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/schnneider-utp" target="_blank">
        <img src="https://github.com/schnneider-utp.png" width="80" style="border-radius:50%;" />
        <br/>
        <sub><b>Jean Schnneider Arias Suarez</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/JuanesUTP" target="_blank">
        <img src="https://github.com/JuanesUTP.png" width="80" style="border-radius:50%;" />
        <br/>
        <sub><b>Juan Esteban Jaramillo Cano</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/wolsybl" target="_blank">
        <img src="https://github.com/wolsybl.png" width="80" style="border-radius:50%;" />
        <br/>
        <sub><b>Wilson Andres Henao Soto</b></sub>
      </a>
    </td>
  </tr>
 </table>

## Stack Tecnológico
- Framework: `Next.js 16`, `React 19`, `TypeScript`
- UI: `Radix UI`, `Tailwind CSS v4`, `lucide-react`
- PDF e imágenes: `pdf-lib`, `pdfjs-dist`, `jsPDF`, `browser-image-compression`, `JSZip`, `file-saver`
- Utilidades: `cmdk`, `embla-carousel-react`, `react-hook-form`, `next-themes`

## Arquitectura Monolito
- Estructura única en un solo repositorio. El UI y la lógica de negocio conviven en la misma app de Next.js.
- Rutas de herramientas en `app/tools/*` y pantallas desacopladas en `app/screens/*`.
- Lógica de negocio en `lib/services/*` consumida desde la UI.
- Componentes reutilizables en `components/ui/*` y layout común en `components/tool-layout.tsx`.
- Worker de PDF.js servido desde `public/pdf.worker.min.js`.

```
app/
├── screens/
│   ├── qr-generator/
│   ├── pdf-to-word/
│   ├── pdf-to-images/
│   ├── images-to-pdf/
│   ├── compress/
│   ├── encrypt/
│   ├── merge-pdf/
│   └── remove-background/
├── tools/
└── page.tsx

lib/
├── services/
│   ├── qr-service.ts
│   ├── pdf-service.ts
│   ├── image-service.ts
│   ├── compression-service.ts
│   └── encryption-service.ts
├── file-storage.ts
└── utils/
    └── file-utils.ts

components/
├── ui/*
└── tool-layout.tsx

public/
└── pdf.worker.min.js
```

## Servicios
- `QRService.generateQR` genera QR con logo y tamaño configurable (`lib/services/qr-service.ts:11`).
- `PDFService.convertToWord`, `convertToImages`, `compress`, `encrypt`, `merge` gestionan operaciones sobre PDFs (`lib/services/pdf-service.ts:92`, `lib/services/pdf-service.ts:154`, `lib/services/pdf-service.ts:204`, `lib/services/pdf-service.ts:229`, `lib/services/pdf-service.ts:250`).
- `ImageService.compress`, `removeBackground` procesa imágenes (`lib/services/image-service.ts:13`, `lib/services/image-service.ts:25`).
- `CompressionService.compressImage`, `compressPDF`, `compressToZip` y utilidades de compresión múltiple (`lib/services/compression-service.ts:39`, `lib/services/compression-service.ts:74`, `lib/services/compression-service.ts:133`).
- `EncryptionService.encryptPDF`, `encryptFile`, `encryptMultipleFiles` para protección con contraseña y cifrado general (`lib/services/encryption-service.ts:49`, `lib/services/encryption-service.ts:102`, `lib/services/encryption-service.ts:172`).

## Características
- Generador de QR con logo personalizado.
- Imágenes a PDF y PDF a imágenes (PNG/JPEG/WEBP) con ZIP de salida.
- PDF a Word mediante extracción de texto.
- Compresión de archivos (imágenes y PDFs) y ZIP de múltiples archivos.
- Encriptado de PDFs con contraseña y cifrado de archivos con Web Crypto.
- Unir múltiples PDFs.
- Historial local de archivos generados (`lib/file-storage.ts`).

## Endpoints y Datos
- Monolito puramente cliente/servidor Next.js. No se definen endpoints API separados en `app/api`.

## Instalación
```bash
npm install
# o
pnpm install
```

## Desarrollo
```bash
npm run dev
# o
pnpm dev
```
Abre `http://localhost:3000`.

## Uso
- Accede a la página principal y elige una herramienta del grid.
- Cada herramienta tiene su ruta dedicada en `/tools/*` y su pantalla en `app/screens/*`.
- Los resultados pueden descargarse y se registran en el historial local.

Herramientas principales:
- Generador de QR → `/tools/qr-generator`
- Imágenes a PDF → `/tools/images-to-pdf`
- PDF a Imágenes → `/tools/pdf-to-images`
- PDF a Word → `/tools/pdf-to-word`
- Quitar Fondo → `/tools/remove-background`
- Comprimir Archivos → `/tools/compress`
- Encriptar PDF → `/tools/encrypt`
- Unir PDFs → `/tools/merge-pdf`

## Requisitos
- Node.js 18+
- Navegador moderno (usa Web Workers y Web Crypto).

## Notas de implementación
- PDF.js requiere el worker en `public/pdf.worker.min.js` y se configura dinámicamente.
- La app usa `localStorage` para guardar el historial de archivos generados.
