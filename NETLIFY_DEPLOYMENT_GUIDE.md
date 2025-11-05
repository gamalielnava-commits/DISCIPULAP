# 🚀 Guía de Despliegue a Netlify

## ¿Por qué Netlify en lugar de Firebase?

- **Límite de tamaño**: Firebase tiene límite de 250 MB, Netlify ofrece 500 MB en plan gratuito
- **Más rápido**: Deploy más rápido y optimizado
- **Mejor CDN**: Red de distribución global más eficiente
- **Integración con Git**: Deploy automático desde GitHub

## 📋 Requisitos Previos

1. **Cuenta de Netlify**: Crear cuenta gratuita en https://www.netlify.com
2. **Netlify CLI** (opcional para despliegue manual):
   ```bash
   npm install -g netlify-cli
   ```

## 🔧 Configuración Inicial

### 1. Conectar con Netlify (Primera vez)

#### Opción A: Deploy Manual
```bash
# En Windows
deploy-netlify.bat

# En Mac/Linux
chmod +x deploy-netlify.sh
./deploy-netlify.sh
```

Al ejecutar por primera vez, te pedirá:
1. Autorizar con tu cuenta de Netlify
2. Crear nuevo sitio o seleccionar existente
3. Confirmará el despliegue

#### Opción B: Deploy Automático con GitHub

1. **Ve a Netlify Dashboard**: https://app.netlify.com
2. Click en "Add new site" → "Import an existing project"
3. Conecta tu repositorio de GitHub
4. Configuración de build:
   - **Build command**: `npx expo export --platform web --output-dir dist`
   - **Publish directory**: `dist`
   - **Node version**: 20

### 2. Variables de Entorno en Netlify

En Netlify Dashboard → Site settings → Environment variables, agrega:

```
EXPO_PUBLIC_FIREBASE_API_KEY=tu-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-project-id.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=tu-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-project-id.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=tu-app-id
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=tu-measurement-id
```

## 🚀 Despliegue

### Opción 1: Automático con GitHub Actions

Ya está configurado! Cada push a `main` o `master` desplegará automáticamente.

**Configurar secrets en GitHub**:
1. Ve a tu repo → Settings → Secrets and variables → Actions
2. Agrega estos secrets:
   - `NETLIFY_AUTH_TOKEN`: Personal access token de Netlify (User settings → Applications → Personal access tokens)
   - `NETLIFY_SITE_ID`: API ID del sitio (Site settings → General → Site details → API ID)
   - Todas las variables de Firebase (EXPO_PUBLIC_FIREBASE_*)

### Opción 2: Manual desde Terminal

```bash
# Windows
deploy-netlify.bat

# Mac/Linux
./deploy-netlify.sh
```

### Opción 3: Con Netlify CLI

```bash
# Login (solo primera vez)
netlify login

# Link al sitio (solo primera vez)
netlify link

# Build y deploy
npm run build:web
netlify deploy --prod --dir=dist
```

## 📱 Actualizar el Backend URL

Si usas funciones de backend, actualiza la URL en tu código:

```typescript
// Antes (Firebase Functions)
const BACKEND_URL = "https://us-central1-iglesia-casa-de-dios-ed5b2.cloudfunctions.net/api"

// Después (Netlify Functions)
const BACKEND_URL = "https://tu-sitio.netlify.app/api"
```

## 🔍 Verificación

Después del despliegue:

1. **URL del sitio**: Se mostrará en la terminal o en GitHub Actions logs
2. **Accede al Dashboard**: https://app.netlify.com
3. **Ver builds**: Site overview → Production deploys
4. **Ver logs**: Click en cualquier deploy → Deploy log

## 🐛 Solución de Problemas

### Error: "Build failed"
```bash
# Limpiar todo y reinstalar
rm -rf node_modules package-lock.json dist .expo
npm install --legacy-peer-deps
npx expo export --platform web --output-dir dist
```

### Error: "Module not found"
- Asegúrate de que todas las dependencias estén en `package.json`
- Usa `--legacy-peer-deps` en npm install

### Build muy grande
```bash
# Ver tamaño del build
du -sh dist

# Optimizar (ya configurado en netlify.toml):
# - Caché de assets
# - Compresión automática
# - Tree shaking de código no usado
```

### Error: "Netlify CLI not found"
```bash
npm install -g netlify-cli
```

## 📊 Monitoreo

- **Analytics**: Netlify Dashboard → Analytics
- **Logs**: Deploy log de cada build
- **Performance**: Core Web Vitals automáticos

## 🔄 Rollback

Si algo sale mal:
1. Ve a Netlify Dashboard → Production deploys
2. Click en un deploy anterior
3. "Publish deploy" para restaurar

## 💡 Consejos

1. **Custom Domain**: Site settings → Domain management → Add custom domain
2. **HTTPS**: Automático y gratuito con Let's Encrypt
3. **Build Hooks**: Site settings → Build & deploy → Build hooks (para rebuild desde webhooks)
4. **Split Testing**: Puedes hacer A/B testing entre branches

## 📞 Soporte

- Documentación: https://docs.netlify.com
- Comunidad: https://answers.netlify.com
- Status: https://www.netlifystatus.com

---

✅ **Todo listo!** Ahora tu app se desplegará automáticamente a Netlify sin problemas de límite de 250 MB.
