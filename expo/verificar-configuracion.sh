#!/bin/bash

echo "=========================================="
echo "🔍 Verificando Configuración del Proyecto"
echo "=========================================="
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para verificar
check() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
        return 0
    else
        echo -e "${RED}❌ $1${NC}"
        return 1
    fi
}

# Verificar Node.js
echo "📦 Verificando Node.js..."
node --version > /dev/null 2>&1
if check "Node.js instalado"; then
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 20 ]; then
        echo -e "${GREEN}   Versión: $(node --version) ✓${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Advertencia: Se recomienda Node.js 20 o superior${NC}"
        echo -e "${YELLOW}   Versión actual: $(node --version)${NC}"
    fi
fi
echo ""

# Verificar npm
echo "📦 Verificando npm..."
npm --version > /dev/null 2>&1
check "npm instalado"
echo ""

# Verificar Firebase CLI
echo "🔥 Verificando Firebase CLI..."
firebase --version > /dev/null 2>&1
if check "Firebase CLI instalado"; then
    echo -e "${GREEN}   Versión: $(firebase --version)${NC}"
else
    echo -e "${YELLOW}   💡 Instalar con: npm install -g firebase-tools${NC}"
fi
echo ""

# Verificar autenticación de Firebase
echo "🔐 Verificando autenticación de Firebase..."
firebase projects:list > /dev/null 2>&1
if check "Autenticado en Firebase"; then
    echo -e "${GREEN}   Proyectos disponibles:${NC}"
    firebase projects:list | grep -E "iglesia-casa-de-dios-ed5b2|discipulapp" || echo -e "${YELLOW}   ⚠️  No se encontró el proyecto iglesia-casa-de-dios-ed5b2${NC}"
else
    echo -e "${YELLOW}   💡 Autenticar con: firebase login${NC}"
fi
echo ""

# Verificar archivo .env
echo "🔧 Verificando archivo .env..."
if [ -f ".env" ]; then
    check "Archivo .env existe"
    
    # Verificar que tenga las variables necesarias
    if grep -q "EXPO_PUBLIC_FIREBASE_PROJECT_ID=iglesia-casa-de-dios-ed5b2" .env; then
        echo -e "${GREEN}   ✓ Proyecto correcto: iglesia-casa-de-dios-ed5b2${NC}"
    else
        echo -e "${YELLOW}   ⚠️  El .env no tiene el proyecto correcto${NC}"
        echo -e "${YELLOW}   💡 Ver: ACTUALIZAR_CREDENCIALES.md${NC}"
    fi
else
    echo -e "${RED}❌ Archivo .env no encontrado${NC}"
    echo -e "${YELLOW}   💡 Copiar .env.example a .env y configurar${NC}"
fi
echo ""

# Verificar firebase.json
echo "🔥 Verificando firebase.json..."
if [ -f "firebase.json" ]; then
    check "Archivo firebase.json existe"
    if grep -q '"public": "dist"' firebase.json; then
        echo -e "${GREEN}   ✓ Configurado para usar carpeta dist${NC}"
    fi
else
    echo -e "${RED}❌ Archivo firebase.json no encontrado${NC}"
fi
echo ""

# Verificar .firebaserc
echo "🔥 Verificando .firebaserc..."
if [ -f ".firebaserc" ]; then
    check "Archivo .firebaserc existe"
    if grep -q "iglesia-casa-de-dios-ed5b2" .firebaserc; then
        echo -e "${GREEN}   ✓ Proyecto: iglesia-casa-de-dios-ed5b2${NC}"
    else
        echo -e "${YELLOW}   ⚠️  Proyecto incorrecto en .firebaserc${NC}"
    fi
else
    echo -e "${RED}❌ Archivo .firebaserc no encontrado${NC}"
fi
echo ""

# Verificar GitHub Actions
echo "🤖 Verificando GitHub Actions..."
if [ -f ".github/workflows/firebase-hosting.yml" ]; then
    check "Workflow de GitHub Actions existe"
    if grep -q "iglesia-casa-de-dios-ed5b2" .github/workflows/firebase-hosting.yml; then
        echo -e "${GREEN}   ✓ Configurado para proyecto correcto${NC}"
    fi
else
    echo -e "${YELLOW}   ⚠️  Workflow no encontrado${NC}"
fi
echo ""

# Verificar node_modules
echo "📦 Verificando dependencias..."
if [ -d "node_modules" ]; then
    check "node_modules existe"
else
    echo -e "${YELLOW}   ⚠️  node_modules no encontrado${NC}"
    echo -e "${YELLOW}   💡 Ejecutar: npm install${NC}"
fi
echo ""

# Resumen
echo "=========================================="
echo "📊 RESUMEN"
echo "=========================================="
echo ""

ERRORS=0

# Verificaciones críticas
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no instalado${NC}"
    ERRORS=$((ERRORS + 1))
fi

if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI no instalado${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ ! -f ".env" ]; then
    echo -e "${RED}❌ Archivo .env no configurado${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ ! -f "firebase.json" ]; then
    echo -e "${RED}❌ firebase.json no encontrado${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Todo está configurado correctamente!${NC}"
    echo ""
    echo "🚀 Puedes desplegar con:"
    echo "   ./deploy-to-firebase.sh"
    echo ""
else
    echo -e "${RED}⚠️  Se encontraron $ERRORS problema(s)${NC}"
    echo ""
    echo "📚 Consulta la documentación:"
    echo "   - GUIA_DESPLIEGUE_FIREBASE.md"
    echo "   - ACTUALIZAR_CREDENCIALES.md"
    echo ""
fi

echo "=========================================="
