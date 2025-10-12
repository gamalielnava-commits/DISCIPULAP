#!/bin/bash

echo "🔥 Desplegando reglas de Firebase..."
echo ""

if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI no está instalado."
    echo "📦 Instálalo con: npm install -g firebase-tools"
    exit 1
fi

if ! firebase projects:list &> /dev/null 2>&1; then
    echo "❌ No estás autenticado en Firebase."
    echo "🔐 Ejecuta: firebase login"
    exit 1
fi

echo "📝 Desplegando reglas de Firestore..."
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo "✅ Reglas de Firestore desplegadas"
else
    echo "❌ Error al desplegar reglas de Firestore"
    exit 1
fi

echo ""
echo "📦 Desplegando reglas de Storage..."
firebase deploy --only storage

if [ $? -eq 0 ]; then
    echo "✅ Reglas de Storage desplegadas"
else
    echo "❌ Error al desplegar reglas de Storage"
    exit 1
fi

echo ""
echo "🎉 ¡Reglas desplegadas correctamente!"
