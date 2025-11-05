#!/bin/bash

echo "🚀 Iniciando despliegue a Netlify..."

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Limpiar node_modules y cache si hay errores
echo "🧹 Limpiando cache..."
rm -rf node_modules package-lock.json
rm -rf dist
rm -rf .expo

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install --legacy-peer-deps

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Error al instalar dependencias${NC}"
  exit 1
fi

# Construir la aplicación web
echo "🏗️  Construyendo aplicación web..."
npx expo export --platform web --output-dir dist

if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Error al construir la aplicación${NC}"
  exit 1
fi

# Verificar que el directorio dist se creó
if [ ! -d "dist" ]; then
  echo -e "${RED}❌ El directorio dist no se creó${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Build completado exitosamente${NC}"

# Desplegar a Netlify
echo "🚀 Desplegando a Netlify..."

# Verificar si netlify-cli está instalado
if ! command -v netlify &> /dev/null; then
  echo -e "${YELLOW}⚠️  Netlify CLI no está instalado. Instalando...${NC}"
  npm install -g netlify-cli
fi

# Desplegar
netlify deploy --prod --dir=dist

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ Despliegue exitoso a Netlify${NC}"
else
  echo -e "${RED}❌ Error al desplegar a Netlify${NC}"
  exit 1
fi

echo -e "${GREEN}🎉 Proceso completado${NC}"
