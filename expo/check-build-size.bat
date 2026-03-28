@echo off
echo 📊 Verificando tamaño del build...

REM Construir si no existe
if not exist dist (
  echo 🏗️  Construyendo primero...
  call npm run build:web
)

REM Calcular tamaño (aproximado)
echo.
echo 📦 Calculando tamaño...

REM Usar PowerShell para obtener tamaño
powershell -Command "& {$size = (Get-ChildItem dist -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB; Write-Host ('Tamaño del build: {0:N2} MB' -f $size); if ($size -lt 100) { Write-Host '✅ Excelente! Muy por debajo del límite' -ForegroundColor Green } elseif ($size -lt 250) { Write-Host '✅ Bien! Dentro del límite de ambos servicios' -ForegroundColor Green } elseif ($size -lt 500) { Write-Host '⚠️  Advertencia: Demasiado grande para Firebase (250 MB)' -ForegroundColor Yellow; Write-Host '✅ Pero está bien para Netlify (500 MB)' -ForegroundColor Green; Write-Host ''; Write-Host '💡 Recomendación: Usa Netlify' } else { Write-Host '❌ Error: Demasiado grande incluso para Netlify' -ForegroundColor Red; Write-Host ('   Tamaño actual: {0:N2} MB' -f $size); Write-Host '   Límite Netlify: 500 MB'; Write-Host ''; Write-Host '🔧 Sugerencias para reducir tamaño:'; Write-Host '   1. Optimizar imágenes en /assets'; Write-Host '   2. Remover dependencias no usadas'; exit 1 }; Write-Host ''; Write-Host 'Límite Firebase: 250 MB'; Write-Host 'Límite Netlify: 500 MB'}"

echo.
echo ✅ Verificación completa
pause
