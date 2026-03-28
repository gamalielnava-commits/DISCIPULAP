# 🚀 Guía de Despliegue a Firebase Hosting

## ✅ Configuración Completada

Tu proyecto ya está configurado para desplegarse automáticamente a Firebase Hosting en el proyecto **iglesia-casa-de-dios-ed5b2**.

---

## 📋 Requisitos Previos

Antes de desplegar, asegúrate de tener instalado:

1. **Node.js 20** (requerido para Expo SDK 53)
   ```bash
   node --version
   # Debe mostrar v20.x.x
   ```

2. **Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

3. **Autenticación en Firebase**
   ```bash
   firebase login
   ```

---

## 🎯 Métodos de Despliegue

### Método 1: Despliegue Automático con GitHub Actions (Recomendado)

Cada vez que hagas push a la rama `main`, se desplegará automáticamente:

```bash
git add .
git commit -m "Actualización de la app"
git push origin main
```

También puedes ejecutarlo manualmente desde GitHub:
1. Ve a tu repositorio en GitHub
2. Click en "Actions"
3. Selecciona "Deploy to Firebase Hosting"
4. Click en "Run workflow"

**Nota:** Necesitas configurar estos secrets en GitHub:
- `FIREBASE_SERVICE_ACCOUNT` - Cuenta de servicio de Firebase
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_RORK_API_BASE_URL`

### Método 2: Script Automático Local

#### En Mac/Linux:
```bash
chmod +x deploy-to-firebase.sh
./deploy-to-firebase.sh
```

#### En Windows:
```bash
deploy-to-firebase.bat
```

### Método 3: Comandos Manuales Paso a Paso

```bash
# 1. Limpiar instalación anterior
rm -rf node_modules package-lock.json

# 2. Instalar dependencias
npm install

# 3. Construir la app
npx expo export --platform web --output-dir dist

# 4. Verificar que dist/ existe
ls -la dist/

# 5. Desplegar a Firebase
firebase deploy --only hosting --project iglesia-casa-de-dios-ed5b2
```

---

## 🔧 Comandos NPM Disponibles

```bash
# Construir la app web
npm run build

# Construir y desplegar en un solo comando
npm run deploy

# Desplegar a un canal de preview
npm run deploy:preview
```

---

## 📁 Archivos de Configuración

### `firebase.json`
Configura Firebase Hosting para servir la carpeta `dist/` y redirigir todas las rutas a `index.html` (necesario para Expo Router).

### `.firebaserc`
Define el proyecto de Firebase: `iglesia-casa-de-dios-ed5b2`

### `.github/workflows/firebase-hosting.yml`
Workflow de GitHub Actions que:
- Usa Node.js 20
- Limpia e instala dependencias
- Construye la app con `npx expo export`
- Verifica la carpeta dist
- Despliega a Firebase Hosting
- Muestra la URL final

---

## 🌐 URLs de tu Aplicación

Después del despliegue, tu app estará disponible en:
- **Principal:** https://iglesia-casa-de-dios-ed5b2.web.app
- **Alternativa:** https://iglesia-casa-de-dios-ed5b2.firebaseapp.com

---

## 🐛 Solución de Problemas

### Error: "Firebase command not found"
```bash
npm install -g firebase-tools
```

### Error: "Not authorized"
```bash
firebase login
firebase projects:list
```

### Error: "Module not found" durante el build
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "dist folder not found"
Verifica que el comando de build se ejecutó correctamente:
```bash
npx expo export --platform web --output-dir dist
ls -la dist/
```

### El build es exitoso pero la app no funciona
1. Verifica que las variables de entorno estén configuradas en `.env`
2. Asegúrate de que Firebase esté inicializado correctamente
3. Revisa la consola del navegador para errores

---

## 📝 Notas Importantes

1. **Node 20 es obligatorio** - Expo SDK 53 requiere Node.js 20
2. **La carpeta dist/ se genera automáticamente** - No la edites manualmente
3. **Las variables de entorno deben estar en .env** - No las subas a Git
4. **El despliegue sobrescribe el contenido anterior** - No requiere confirmación
5. **Netlify ya no es necesario** - Todo está en Firebase ahora

---

## 🎉 ¡Listo!

Tu proyecto está configurado para desplegarse automáticamente. Solo haz push a `main` o ejecuta el script de despliegue local.

Si tienes problemas, revisa los logs de GitHub Actions o ejecuta el script local para ver mensajes de error detallados.
