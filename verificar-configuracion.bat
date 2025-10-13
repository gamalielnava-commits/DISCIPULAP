@echo off
echo ==========================================
echo 🔍 Verificando Configuración del Proyecto
echo ==========================================
echo.

set ERRORS=0

REM Verificar Node.js
echo 📦 Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Node.js instalado
    node --version
) else (
    echo ❌ Node.js no instalado
    set /a ERRORS+=1
)
echo.

REM Verificar npm
echo 📦 Verificando npm...
npm --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ npm instalado
    npm --version
) else (
    echo ❌ npm no instalado
    set /a ERRORS+=1
)
echo.

REM Verificar Firebase CLI
echo 🔥 Verificando Firebase CLI...
firebase --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Firebase CLI instalado
    firebase --version
) else (
    echo ❌ Firebase CLI no instalado
    echo 💡 Instalar con: npm install -g firebase-tools
    set /a ERRORS+=1
)
echo.

REM Verificar autenticación de Firebase
echo 🔐 Verificando autenticación de Firebase...
firebase projects:list >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Autenticado en Firebase
    firebase projects:list | findstr "iglesia-casa-de-dios-ed5b2"
) else (
    echo ❌ No autenticado en Firebase
    echo 💡 Autenticar con: firebase login
    set /a ERRORS+=1
)
echo.

REM Verificar archivo .env
echo 🔧 Verificando archivo .env...
if exist .env (
    echo ✅ Archivo .env existe
    findstr "iglesia-casa-de-dios-ed5b2" .env >nul
    if %errorlevel% equ 0 (
        echo    ✓ Proyecto correcto: iglesia-casa-de-dios-ed5b2
    ) else (
        echo    ⚠️  El .env no tiene el proyecto correcto
        echo    💡 Ver: ACTUALIZAR_CREDENCIALES.md
    )
) else (
    echo ❌ Archivo .env no encontrado
    echo 💡 Copiar .env.example a .env y configurar
    set /a ERRORS+=1
)
echo.

REM Verificar firebase.json
echo 🔥 Verificando firebase.json...
if exist firebase.json (
    echo ✅ Archivo firebase.json existe
    findstr "dist" firebase.json >nul
    if %errorlevel% equ 0 (
        echo    ✓ Configurado para usar carpeta dist
    )
) else (
    echo ❌ Archivo firebase.json no encontrado
    set /a ERRORS+=1
)
echo.

REM Verificar .firebaserc
echo 🔥 Verificando .firebaserc...
if exist .firebaserc (
    echo ✅ Archivo .firebaserc existe
    findstr "iglesia-casa-de-dios-ed5b2" .firebaserc >nul
    if %errorlevel% equ 0 (
        echo    ✓ Proyecto: iglesia-casa-de-dios-ed5b2
    ) else (
        echo    ⚠️  Proyecto incorrecto en .firebaserc
    )
) else (
    echo ❌ Archivo .firebaserc no encontrado
    set /a ERRORS+=1
)
echo.

REM Verificar GitHub Actions
echo 🤖 Verificando GitHub Actions...
if exist .github\workflows\firebase-hosting.yml (
    echo ✅ Workflow de GitHub Actions existe
    findstr "iglesia-casa-de-dios-ed5b2" .github\workflows\firebase-hosting.yml >nul
    if %errorlevel% equ 0 (
        echo    ✓ Configurado para proyecto correcto
    )
) else (
    echo ⚠️  Workflow no encontrado
)
echo.

REM Verificar node_modules
echo 📦 Verificando dependencias...
if exist node_modules (
    echo ✅ node_modules existe
) else (
    echo ⚠️  node_modules no encontrado
    echo 💡 Ejecutar: npm install
)
echo.

REM Resumen
echo ==========================================
echo 📊 RESUMEN
echo ==========================================
echo.

if %ERRORS% equ 0 (
    echo ✅ Todo está configurado correctamente!
    echo.
    echo 🚀 Puedes desplegar con:
    echo    deploy-to-firebase.bat
    echo.
) else (
    echo ⚠️  Se encontraron %ERRORS% problema(s)
    echo.
    echo 📚 Consulta la documentación:
    echo    - GUIA_DESPLIEGUE_FIREBASE.md
    echo    - ACTUALIZAR_CREDENCIALES.md
    echo.
)

echo ==========================================
pause
