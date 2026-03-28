@echo off
echo 🚀 Iniciando despliegue a Netlify...

REM Limpiar node_modules y cache si hay errores
echo 🧹 Limpiando cache...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /f /q package-lock.json
if exist dist rmdir /s /q dist
if exist .expo rmdir /s /q .expo

REM Instalar dependencias
echo 📦 Instalando dependencias...
call npm install --legacy-peer-deps

if %errorlevel% neq 0 (
  echo ❌ Error al instalar dependencias
  exit /b 1
)

REM Construir la aplicación web
echo 🏗️  Construyendo aplicación web...
call npx expo export --platform web --output-dir dist

if %errorlevel% neq 0 (
  echo ❌ Error al construir la aplicación
  exit /b 1
)

REM Verificar que el directorio dist se creó
if not exist dist (
  echo ❌ El directorio dist no se creó
  exit /b 1
)

echo ✅ Build completado exitosamente

REM Desplegar a Netlify
echo 🚀 Desplegando a Netlify...

REM Verificar si netlify-cli está instalado
where netlify >nul 2>nul
if %errorlevel% neq 0 (
  echo ⚠️  Netlify CLI no está instalado. Instalando...
  call npm install -g netlify-cli
)

REM Desplegar
call netlify deploy --prod --dir=dist

if %errorlevel% equ 0 (
  echo ✅ Despliegue exitoso a Netlify
) else (
  echo ❌ Error al desplegar a Netlify
  exit /b 1
)

echo 🎉 Proceso completado
pause
