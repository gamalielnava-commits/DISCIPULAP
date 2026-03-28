#!/bin/bash

# Script de verificación de configuración de Firebase
# Este script verifica que todo esté configurado correctamente

echo "🔍 Verificando configuración de Firebase..."
echo ""

# Verificar que Firebase CLI está instalado
echo "1️⃣ Verificando Firebase CLI..."
if command -v firebase &> /dev/null; then
    echo "   ✅ Firebase CLI instalado"
    firebase --version
else
    echo "   ❌ Firebase CLI no encontrado"
    echo "   Instálalo con: npm install -g firebase-tools"
    exit 1
fi
echo ""

# Verificar que estás autenticado
echo "2️⃣ Verificando autenticación..."
if firebase projects:list &> /dev/null; then
    echo "   ✅ Autenticado en Firebase"
else
    echo "   ❌ No estás autenticado"
    echo "   Ejecuta: firebase login"
    exit 1
fi
echo ""

# Verificar proyecto actual
echo "3️⃣ Verificando proyecto actual..."
PROJECT=$(firebase use)
if [[ $PROJECT == *"discipulapp-8d99c"* ]]; then
    echo "   ✅ Proyecto correcto: discipulapp-8d99c"
else
    echo "   ⚠️  Proyecto actual: $PROJECT"
    echo "   Cambiando a discipulapp-8d99c..."
    firebase use discipulapp-8d99c
fi
echo ""

# Verificar archivos de configuración
echo "4️⃣ Verificando archivos de configuración..."
if [ -f "firebase.json" ]; then
    echo "   ✅ firebase.json encontrado"
else
    echo "   ❌ firebase.json no encontrado"
    exit 1
fi

if [ -f ".firebaserc" ]; then
    echo "   ✅ .firebaserc encontrado"
else
    echo "   ❌ .firebaserc no encontrado"
    exit 1
fi

if [ -f "firestore.rules" ]; then
    echo "   ✅ firestore.rules encontrado"
else
    echo "   ❌ firestore.rules no encontrado"
fi

if [ -f "storage.rules" ]; then
    echo "   ✅ storage.rules encontrado"
else
    echo "   ❌ storage.rules no encontrado"
fi
echo ""

# Verificar configuración de Firebase en el código
echo "5️⃣ Verificando configuración en código..."
if [ -f "firebaseConfig.ts" ]; then
    echo "   ✅ firebaseConfig.ts encontrado"
    
    # Verificar que tiene el API Key
    if grep -q "apiKey:" firebaseConfig.ts; then
        echo "   ✅ API Key configurado"
    else
        echo "   ❌ API Key no encontrado"
    fi
    
    # Verificar que tiene el Project ID
    if grep -q "projectId: 'discipulapp-8d99c'" firebaseConfig.ts; then
        echo "   ✅ Project ID correcto"
    else
        echo "   ⚠️  Verifica el Project ID en firebaseConfig.ts"
    fi
else
    echo "   ❌ firebaseConfig.ts no encontrado"
fi
echo ""

# Verificar que Node.js está instalado
echo "6️⃣ Verificando Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "   ✅ Node.js instalado: $NODE_VERSION"
    
    # Verificar que es Node 20 o superior
    MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'.' -f1 | tr -d 'v')
    if [ $MAJOR_VERSION -ge 20 ]; then
        echo "   ✅ Versión compatible (requerido: Node 20+)"
    else
        echo "   ⚠️  Se recomienda Node 20 o superior"
    fi
else
    echo "   ❌ Node.js no encontrado"
    exit 1
fi
echo ""

# Verificar que npm está instalado
echo "7️⃣ Verificando npm..."
if command -v npm &> /dev/null; then
    echo "   ✅ npm instalado: $(npm --version)"
else
    echo "   ❌ npm no encontrado"
    exit 1
fi
echo ""

# Verificar dependencias
echo "8️⃣ Verificando dependencias..."
if [ -d "node_modules" ]; then
    echo "   ✅ node_modules encontrado"
else
    echo "   ⚠️  node_modules no encontrado"
    echo "   Ejecuta: npm install"
fi
echo ""

# Resumen
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Resumen de Verificación"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Verificación completada"
echo ""
echo "🚀 Próximos pasos:"
echo "   1. Ejecuta: ./deploy-rules.sh (para desplegar reglas)"
echo "   2. Ejecuta: ./deploy-complete.sh (para desplegar la app)"
echo ""
echo "📚 O configura GitHub Actions para despliegue automático"
echo "   (Ver GUIA_CONFIGURACION_COMPLETA.md)"
echo ""
