@echo off
echo ==========================================
echo 🚀 Iniciando despliegue a Firebase Hosting
echo ==========================================
echo.

echo 📦 Paso 1: Limpiando instalación anterior...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /q package-lock.json
echo ✅ Limpieza completada
echo.

echo 📥 Paso 2: Instalando dependencias con npm...
call npm install
if %errorlevel% neq 0 (
    echo ❌ Error al instalar dependencias
    exit /b 1
)
echo ✅ Dependencias instaladas
echo.

echo 🏗️  Paso 3: Construyendo aplicación web...
call npx expo export --platform web --output-dir dist
if %errorlevel% neq 0 (
    echo ❌ Error al construir la aplicación
    exit /b 1
)
echo ✅ Build completado
echo.

echo 📂 Paso 4: Verificando carpeta dist...
if exist dist (
    echo ✅ Carpeta dist generada correctamente
    echo Contenido:
    dir dist
) else (
    echo ❌ Error: carpeta dist no encontrada
    exit /b 1
)
echo.

echo 🔥 Paso 5: Desplegando a Firebase Hosting...
call firebase deploy --only hosting --project iglesia-casa-de-dios-ed5b2
if %errorlevel% neq 0 (
    echo ❌ Error al desplegar a Firebase
    exit /b 1
)
echo.

echo ==========================================
echo ✅ ¡Despliegue completado exitosamente!
echo ==========================================
echo.
echo 🌐 Tu aplicación está disponible en:
echo    https://iglesia-casa-de-dios-ed5b2.web.app
echo    https://iglesia-casa-de-dios-ed5b2.firebaseapp.com
echo.
echo ==========================================
pause
