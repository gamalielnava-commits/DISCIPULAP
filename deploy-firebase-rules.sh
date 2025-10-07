#!/bin/bash

echo "🔥 =========================================="
echo "🔥 DESPLIEGUE DE REGLAS DE FIREBASE"
echo "🔥 =========================================="
echo ""

echo "📋 Verificando Firebase CLI..."
if ! command -v firebase &> /dev/null
then
    echo "❌ Firebase CLI no está instalado"
    echo "💡 Instálalo con: npm install -g firebase-tools"
    exit 1
fi
echo "✅ Firebase CLI detectado"
echo ""

echo "📋 Verificando login..."
firebase login:list
echo ""

echo "📋 Configurando proyecto..."
firebase use discipulapp-8d99c
echo ""

echo "📋 Desplegando reglas de Firestore..."
firebase deploy --only firestore:rules
echo ""

echo "📋 Desplegando reglas de Storage..."
firebase deploy --only storage:rules
echo ""

echo "🎉 =========================================="
echo "🎉 DESPLIEGUE COMPLETADO"
echo "🎉 =========================================="
echo ""
echo "✅ Las reglas de Firestore y Storage han sido desplegadas"
echo "⏱️  Espera 1-2 minutos para que los cambios se propaguen"
echo ""
echo "🔍 Verifica en Firebase Console:"
echo "   - Firestore Database → Rules"
echo "   - Storage → Rules"
echo ""
