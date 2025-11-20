#!/bin/bash

# Script de deployment para PePDF en EC2
# Uso: ./deploy.sh

set -e  # Salir si hay algún error

echo "🚀 Iniciando deployment de PePDF..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Directorio del proyecto
PROJECT_DIR="$HOME/toolsapp/client"
APP_NAME="pepdf"

# Verificar que estamos en EC2
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ Error: Directorio del proyecto no encontrado en $PROJECT_DIR"
    echo "Por favor clona el repositorio primero:"
    echo "  cd ~ && git clone https://github.com/tu-usuario/toolsapp.git"
    exit 1
fi

cd "$PROJECT_DIR"

# 1. Pull últimos cambios
echo -e "${YELLOW}📥 Obteniendo últimos cambios...${NC}"
git pull origin main

# 2. Instalar/actualizar dependencias
echo -e "${YELLOW}📦 Instalando dependencias...${NC}"
npm install

# 3. Verificar variables de entorno
if [ ! -f ".env.local" ]; then
    echo "❌ Error: Archivo .env.local no encontrado"
    echo "Por favor crea el archivo .env.local con las credenciales de RDS"
    exit 1
fi

echo -e "${GREEN}✓ Variables de entorno encontradas${NC}"

# 4. Build de producción
echo -e "${YELLOW}🔨 Construyendo aplicación...${NC}"
npm run build

# 5. Verificar si PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}📦 Instalando PM2...${NC}"
    npm install -g pm2
fi

# 6. Detener aplicación si está corriendo
if pm2 list | grep -q "$APP_NAME"; then
    echo -e "${YELLOW}🛑 Deteniendo aplicación anterior...${NC}"
    pm2 delete "$APP_NAME"
fi

# 7. Iniciar aplicación con PM2
echo -e "${YELLOW}🚀 Iniciando aplicación...${NC}"
pm2 start npm --name "$APP_NAME" -- start

# 8. Guardar configuración PM2
pm2 save

# 9. Mostrar estado
echo -e "${GREEN}✅ Deployment completado!${NC}"
echo ""
pm2 status
echo ""
echo -e "${GREEN}Ver logs:${NC} pm2 logs $APP_NAME"
echo -e "${GREEN}Reiniciar:${NC} pm2 restart $APP_NAME"
echo -e "${GREEN}Detener:${NC} pm2 stop $APP_NAME"
