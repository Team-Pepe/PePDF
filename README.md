# ToolsApp

Aplicación de herramientas web con arquitectura cliente-servidor.

## Estructura del Proyecto

```
toolsapp/
├── client/          # Aplicación Next.js (Frontend)
├── server/          # Servidor Express (Backend)
└── package.json     # Scripts raíz para manejar ambos
```

## Instalación

Instalar todas las dependencias (cliente y servidor):

```bash
npm run install:all
```

O instalar por separado:

```bash
# Cliente
cd client
npm install

# Servidor
cd server
npm install
```

## Desarrollo

### Iniciar ambos servidores

```bash
npm run dev
```

### Iniciar por separado

```bash
# Cliente (puerto 3000)
npm run dev:client

# Servidor (puerto 3001)
npm run dev:server
```

## Producción

### Build

```bash
npm run build
```

### Iniciar en producción

```bash
npm start
```

## Tecnologías

### Cliente (Next.js)
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Radix UI

### Servidor (Express)
- Express
- TypeScript
- CORS
- dotenv

## API Endpoints

El servidor corre en `http://localhost:3001`

- `GET /api/health` - Health check
- `GET /api/tools` - Lista de herramientas disponibles
