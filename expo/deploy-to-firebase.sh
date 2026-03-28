#!/bin/bash

echo "=========================================="
echo "🚀 Iniciando despliegue a Firebase Hosting"
echo "=========================================="
echo ""

echo "📦 Paso 1: Limpiando instalación anterior..."
rm -rf node_modules package-lock.json
echo "✅ Limpieza completada"
echo ""

echo "📥 Paso 2: Instalando dependencias con npm..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Error al instalar dependencias"
    exit 1
fi
echo "✅ Dependencias instaladas"
echo ""

echo "🏗️  Paso 3: Construyendo aplicación web..."
npx expo export --platform web --output-dir dist
if [ $? -ne 0 ]; then
    echo "❌ Error al construir la aplicación"
    exit 1
fi
echo "✅ Build completado"
echo ""

echo "📂 Paso 4: Verificando carpeta dist..."
if [ -d "dist" ]; then
    echo "✅ Carpeta dist generada correctamente"
    echo "Contenido:"
    ls -lh dist/
else
    echo "❌ Error: carpeta dist no encontrada"
    exit 1
fi
echo ""

echo "🔥 Paso 5: Desplegando a Firebase Hosting..."
firebase deploy --only hosting --project iglesia-casa-de-dios-ed5b2
if [ $? -ne 0 ]; then
    echo "❌ Error al desplegar a Firebase"
    exit 1
fi
echo ""

echo "=========================================="
echo "✅ ¡Despliegue completado exitosamente!"
echo "=========================================="
echo ""
echo "🌐 Tu aplicación está disponible en:"
echo "   https://iglesia-casa-de-dios-ed5b2.web.app"
echo "   https://iglesia-casa-de-dios-ed5b2.firebaseapp.com"
echo ""
echo "=========================================="
