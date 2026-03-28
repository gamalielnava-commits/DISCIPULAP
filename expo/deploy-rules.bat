@echo off
REM Script para desplegar solo las reglas de Firestore y Storage (Windows)
REM Útil cuando solo actualizaste las reglas de seguridad

echo 🔐 Desplegando reglas de seguridad de Firebase...
echo.

REM Desplegar reglas de Firestore
echo 📝 Desplegando reglas de Firestore...
call firebase deploy --only firestore:rules
if errorlevel 1 goto error
echo ✅ Reglas de Firestore desplegadas
echo.

REM Desplegar reglas de Storage
echo 📦 Desplegando reglas de Storage...
call firebase deploy --only storage
if errorlevel 1 goto error
echo ✅ Reglas de Storage desplegadas
echo.

echo 🎉 ¡Reglas de seguridad actualizadas!
echo.
goto end

:error
echo.
echo ❌ Error al desplegar las reglas
exit /b 1

:end
