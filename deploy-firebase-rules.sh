#!/bin/bash

# Script para desplegar reglas de Firestore y Storage a Firebase
# Asegúrate de tener Firebase CLI instalado: npm install -g firebase-tools
# Y estar autenticado: firebase login

echo "🔥 Desplegando reglas de Firebase..."
echo ""

# Verificar si Firebase CLI está instalado
if ! command -v firebase &> /dev/null
then
    echo "❌ Firebase CLI no está instalado."
    echo "📦 Instálalo con: npm install -g firebase-tools"
    exit 1
fi

# Verificar si el usuario está autenticado
if ! firebase projects:list &> /dev/null
then
    echo "❌ No estás autenticado en Firebase."
    echo "🔐 Ejecuta: firebase login"
    exit 1
fi

# Desplegar reglas de Firestore
echo "📝 Desplegando reglas de Firestore..."
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo "✅ Reglas de Firestore desplegadas exitosamente"
else
    echo "❌ Error al desplegar reglas de Firestore"
    exit 1
fi

echo ""

# Desplegar reglas de Storage
echo "📦 Desplegando reglas de Storage..."
firebase deploy --only storage

if [ $? -eq 0 ]; then
    echo "✅ Reglas de Storage desplegadas exitosamente"
else
    echo "❌ Error al desplegar reglas de Storage"
    exit 1
fi

echo ""
echo "🎉 ¡Todas las reglas se desplegaron correctamente!"
echo ""
echo "⚠️  IMPORTANTE: Las nuevas reglas requieren autenticación."
echo "   Solo usuarios autenticados pueden acceder a los datos."
