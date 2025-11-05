#!/bin/bash

echo "📊 Verificando tamaño del build..."

# Colores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Construir si no existe
if [ ! -d "dist" ]; then
  echo "🏗️  Construyendo primero..."
  npm run build:web
fi

# Verificar tamaño
SIZE=$(du -sh dist 2>/dev/null | cut -f1)
SIZE_MB=$(du -sm dist 2>/dev/null | cut -f1)

echo ""
echo "📦 Tamaño del build: $SIZE"
echo ""

# Verificar límites
if [ $SIZE_MB -lt 100 ]; then
  echo -e "${GREEN}✅ Excelente! Muy por debajo del límite${NC}"
  echo "   Límite Firebase: 250 MB"
  echo "   Límite Netlify: 500 MB"
elif [ $SIZE_MB -lt 250 ]; then
  echo -e "${GREEN}✅ Bien! Dentro del límite de ambos servicios${NC}"
  echo "   Límite Firebase: 250 MB"
  echo "   Límite Netlify: 500 MB"
elif [ $SIZE_MB -lt 500 ]; then
  echo -e "${YELLOW}⚠️  Advertencia: Demasiado grande para Firebase (250 MB)${NC}"
  echo -e "${GREEN}✅ Pero está bien para Netlify (500 MB)${NC}"
  echo ""
  echo "💡 Recomendación: Usa Netlify"
else
  echo -e "${RED}❌ Error: Demasiado grande incluso para Netlify${NC}"
  echo "   Tamaño actual: $SIZE_MB MB"
  echo "   Límite Netlify: 500 MB"
  echo ""
  echo "🔧 Sugerencias para reducir tamaño:"
  echo "   1. Optimizar imágenes en /assets"
  echo "   2. Remover dependencias no usadas"
  echo "   3. Verificar archivos grandes con: find dist -size +1M"
  exit 1
fi

echo ""
echo "📁 Archivos más grandes en el build:"
find dist -type f -size +500k -exec ls -lh {} \; | awk '{print $5, $9}' | sort -hr | head -10

echo ""
echo "📊 Distribución por tipo de archivo:"
echo ""
echo "JavaScript:"
find dist -name "*.js" -exec du -ch {} + | tail -1
echo "CSS:"
find dist -name "*.css" -exec du -ch {} + 2>/dev/null | tail -1
echo "Imágenes:"
find dist \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" -o -name "*.gif" -o -name "*.webp" \) -exec du -ch {} + 2>/dev/null | tail -1
echo "Fuentes:"
find dist \( -name "*.woff" -o -name "*.woff2" -o -name "*.ttf" \) -exec du -ch {} + 2>/dev/null | tail -1

echo ""
echo "✅ Verificación completa"
