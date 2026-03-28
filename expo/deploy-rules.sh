#!/bin/bash

# Script para desplegar solo las reglas de Firestore y Storage
# Útil cuando solo actualizaste las reglas de seguridad

set -e

echo "🔐 Desplegando reglas de seguridad de Firebase..."
echo ""

# Desplegar reglas de Firestore
echo "📝 Desplegando reglas de Firestore..."
firebase deploy --only firestore:rules
echo "✅ Reglas de Firestore desplegadas"
echo ""

# Desplegar reglas de Storage
echo "📦 Desplegando reglas de Storage..."
firebase deploy --only storage
echo "✅ Reglas de Storage desplegadas"
echo ""

echo "🎉 ¡Reglas de seguridad actualizadas!"
echo ""
