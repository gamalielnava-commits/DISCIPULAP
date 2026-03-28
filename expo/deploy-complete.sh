#!/bin/bash

# Script de despliegue completo para DiscipulApp
# Este script construye y despliega la aplicación a Firebase Hosting

set -e  # Detener si hay algún error

echo "🚀 Iniciando despliegue completo de DiscipulApp..."
echo ""

# 1. Limpiar dependencias anteriores
echo "🧹 Limpiando instalación anterior..."
rm -rf node_modules
rm -f package-lock.json
echo "✅ Limpieza completada"
echo ""

# 2. Instalar dependencias frescas
echo "📦 Instalando dependencias..."
npm install
echo "✅ Dependencias instaladas"
echo ""

# 3. Construir aplicación web
echo "🔨 Construyendo aplicación web..."
npx expo export --platform web --output-dir dist
echo "✅ Aplicación construida"
echo ""

# 4. Verificar que dist existe
if [ ! -d "dist" ]; then
  echo "❌ Error: La carpeta dist no se generó"
  echo "Por favor revisa los errores de construcción arriba"
  exit 1
fi

echo "📁 Contenido de dist:"
ls -la dist
echo ""

# 5. Desplegar a Firebase Hosting
echo "🚀 Desplegando a Firebase Hosting..."
firebase deploy --only hosting
echo "✅ Despliegue completado"
echo ""

# 6. Mostrar URL de la aplicación
echo "🎉 ¡Aplicación desplegada exitosamente!"
echo ""
echo "🌐 Tu aplicación está disponible en:"
echo "   https://discipulapp-8d99c.web.app"
echo "   https://discipulapp-8d99c.firebaseapp.com"
echo ""
