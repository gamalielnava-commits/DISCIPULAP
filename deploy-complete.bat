@echo off
REM Script de despliegue completo para DiscipulApp (Windows)
REM Este script construye y despliega la aplicación a Firebase Hosting

echo 🚀 Iniciando despliegue completo de DiscipulApp...
echo.

REM 1. Limpiar dependencias anteriores
echo 🧹 Limpiando instalación anterior...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json
echo ✅ Limpieza completada
echo.

REM 2. Instalar dependencias frescas
echo 📦 Instalando dependencias...
call npm install
if errorlevel 1 goto error
echo ✅ Dependencias instaladas
echo.

REM 3. Construir aplicación web
echo 🔨 Construyendo aplicación web...
call npx expo export --platform web --output-dir dist
if errorlevel 1 goto error
echo ✅ Aplicación construida
echo.

REM 4. Verificar que dist existe
if not exist dist (
  echo ❌ Error: La carpeta dist no se generó
  echo Por favor revisa los errores de construcción arriba
  goto error
)

echo 📁 Contenido de dist:
dir dist
echo.

REM 5. Desplegar a Firebase Hosting
echo 🚀 Desplegando a Firebase Hosting...
call firebase deploy --only hosting
if errorlevel 1 goto error
echo ✅ Despliegue completado
echo.

REM 6. Mostrar URL de la aplicación
echo 🎉 ¡Aplicación desplegada exitosamente!
echo.
echo 🌐 Tu aplicación está disponible en:
echo    https://discipulapp-8d99c.web.app
echo    https://discipulapp-8d99c.firebaseapp.com
echo.
goto end

:error
echo.
echo ❌ Error durante el despliegue
echo Por favor revisa los mensajes de error arriba
exit /b 1

:end
