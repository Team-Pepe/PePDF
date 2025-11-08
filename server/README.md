# ToolsApp Server

Backend API server for ToolsApp.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Start development server:
```bash
npm run dev
```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## API Endpoints

- `GET /api/health` - Health check endpoint
- `GET /api/tools` - Get list of available tools
