# 🚀 Instrucciones de Despliegue Firebase

## ⚠️ IMPORTANTE: Pasos Previos Requeridos

Antes de desplegar, debes completar estos pasos manualmente:

### 1. Crear `backend/package.json`

Copia el contenido de `backend/.package.json.template` y créalo como `backend/package.json`:

```bash
cp backend/.package.json.template backend/package.json
```

O crea el archivo manualmente con este contenido:

```json
{
  "name": "functions",
  "version": "1.0.0",
  "description": "Firebase Functions for Discipulapp",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "build": "echo 'Build complete'"
  },
  "engines": {
    "node": "20"
  },
  "dependencies": {
    "@hono/trpc-server": "^0.4.0",
    "@trpc/server": "^11.5.1",
    "firebase-admin": "^13.0.0",
    "firebase-functions": "^6.1.0",
    "hono": "^4.9.8",
    "superjson": "^2.2.2",
    "zod": "^4.1.11"
  },
  "private": true
}
```

### 2. Instalar Dependencias del Backend

```bash
cd backend
npm install
cd ..
```

### 3. Configurar Firebase Project ID

Actualiza `.firebaserc` con tu ID de proyecto real de Firebase:

```json
{
  "projects": {
    "default": "TU-PROJECT-ID-REAL"
  }
}
```

### 4. Configurar Variables de Entorno

Actualiza `.env` con tus credenciales reales de Firebase Console:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Project Settings** (⚙️) > **General**
4. En "Your apps", selecciona la app web o crea una nueva
5. Copia las credenciales y actualiza `.env`:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123:web:abc123
```

### 5. Habilitar Servicios en Firebase

#### Authentication (para Google y Apple Sign-In)

1. Ve a **Authentication** > **Sign-in method**
2. Habilita:
   - ✅ **Email/Password**
   - ✅ **Google**
   - ✅ **Apple**

**Para Google Sign-In:**
- Click en "Google" > "Enable"
- Selecciona un email de soporte
- Guarda

**Para Apple Sign-In:**
- Necesitas Apple Developer Account
- Click en "Apple" > "Enable"
- Configura Service ID en [Apple Developer](https://developer.apple.com/)
- Agrega el Service ID en Firebase

#### Firestore Database

1. Ve a **Firestore Database**
2. Click "Create database"
3. Selecciona ubicación (ej: `us-central`)
4. Modo: Empieza en modo de prueba (puedes cambiar las reglas después)

#### Storage

1. Ve a **Storage**
2. Click "Get started"
3. Acepta las reglas por defecto

### 6. Construir la Aplicación

```bash
npm run build:web
```

Esto creará la carpeta `dist/` con tu aplicación web.

### 7. Desplegar en Firebase

```bash
# Instalar Firebase CLI (si no lo tienes)
npm install -g firebase-tools

# Iniciar sesión
firebase login

# Desplegar todo
firebase deploy

# O desplegar solo hosting
firebase deploy --only hosting

# O desplegar solo functions
firebase deploy --only functions
```

## 🎯 Checklist Completo

- [ ] ✅ `.firebaserc` actualizado con Project ID real
- [ ] ✅ `.env` actualizado con credenciales de Firebase
- [ ] ✅ `backend/package.json` creado desde template
- [ ] ✅ Dependencias del backend instaladas (`cd backend && npm install`)
- [ ] ✅ Authentication habilitado (Email, Google, Apple)
- [ ] ✅ Firestore Database creado
- [ ] ✅ Storage habilitado
- [ ] ✅ App construida (`npm run build:web`)
- [ ] ✅ Firebase CLI instalado
- [ ] ✅ Sesión iniciada (`firebase login`)
- [ ] ✅ Desplegado (`firebase deploy`)

## 🔍 Verificar Despliegue

Después del despliegue exitoso, verás:

```
✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/tu-proyecto/overview
Hosting URL: https://tu-proyecto.web.app
```

Visita la Hosting URL para ver tu aplicación en vivo.

## 🐛 Solución de Problemas

### Error: "Project not found"
```bash
firebase use --add
# Selecciona tu proyecto de la lista
```

### Error: "Functions deployment failed"
- Verifica que `backend/package.json` exista
- Verifica que las dependencias estén instaladas: `cd backend && npm install`

### Error: "Invalid Firebase config"
- Verifica que todas las variables en `.env` sean correctas
- No debe haber espacios extra ni comillas

### Error: "dist folder not found"
- Ejecuta `npm run build:web` antes de desplegar

## 📱 Configurar OAuth Redirect URIs

Después del despliegue, agrega estas URLs a tus proveedores OAuth:

### Google Cloud Console
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. APIs & Services > Credentials
3. Agrega Authorized redirect URIs:
   - `https://tu-proyecto.firebaseapp.com/__/auth/handler`
   - `https://tu-proyecto.web.app/__/auth/handler`

### Apple Developer
1. Ve a [Apple Developer](https://developer.apple.com/)
2. Certificates, IDs & Profiles > Services IDs
3. Agrega Return URLs:
   - `https://tu-proyecto.firebaseapp.com/__/auth/handler`

## 🎉 ¡Listo!

Tu aplicación ahora está desplegada en Firebase y disponible en:
- **Web**: `https://tu-proyecto.web.app`
- **API**: `https://us-central1-tu-proyecto.cloudfunctions.net/api`

Para actualizaciones futuras, solo ejecuta:
```bash
npm run build:web && firebase deploy
```
