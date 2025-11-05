# 🚀 Guía de Despliegue a Firebase

## Problema Resuelto

El error de Netlify (función > 250 MB) se ha resuelto moviendo el backend a Firebase Functions.

## 🎯 Solución Implementada

- **Frontend (Expo Web)**: Firebase Hosting
- **Backend (tRPC + Hono)**: Firebase Functions
- **Base de datos**: Firestore
- **Almacenamiento**: Firebase Storage

## 📋 Pasos para Desplegar

### Opción A: Linux/Mac

```bash
# 1. Configurar Firebase Functions
chmod +x setup-functions.sh
./setup-functions.sh

# 2. Instalar dependencias de functions
cd functions
npm install
cd ..

# 3. Desplegar todo (automático)
chmod +x deploy-firebase-complete.sh
./deploy-firebase-complete.sh
```

### Opción B: Windows

```cmd
REM 1. Configurar Firebase Functions
setup-functions.bat

REM 2. Instalar dependencias de functions
cd functions
npm install
cd ..

REM 3. Desplegar todo (automático)
deploy-firebase-complete.bat
```

## 📦 ¿Qué hace el script de deploy?

1. ✅ Construye la app web (`npm run build:web`)
2. ✅ Copia archivos del backend a `functions/src`
3. ✅ Instala dependencias de functions
4. ✅ Compila las functions (TypeScript → JavaScript)
5. ✅ Despliega hosting + functions + rules a Firebase

## 🌐 URLs después del despliegue

- **Frontend**: `https://iglesia-casa-de-dios-ed5b2.web.app`
- **API**: `https://iglesia-casa-de-dios-ed5b2.web.app/api`
- **tRPC**: `https://iglesia-casa-de-dios-ed5b2.web.app/api/trpc`

## ⚙️ Configuración de Variables de Entorno

Asegúrate de tener tu `.env` configurado:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=tu-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=iglesia-casa-de-dios-ed5b2.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=iglesia-casa-de-dios-ed5b2
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=iglesia-casa-de-dios-ed5b2.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=tu-app-id
EXPO_PUBLIC_API_URL=https://iglesia-casa-de-dios-ed5b2.web.app/api
```

## 🔄 Despliegue en Netlify (Solo Frontend)

Si prefieres usar Netlify solo para el frontend y Firebase para el backend:

1. El `netlify.toml` ya está configurado solo para hosting
2. Netlify desplegará automáticamente el frontend
3. El backend está en Firebase Functions

## 🐛 Solución de Problemas

### Error: "Cannot find module firebase-functions"
```bash
cd functions
npm install
cd ..
```

### Error: "firebase command not found"
```bash
npm install -g firebase-tools
firebase login
```

### Error: "Permission denied"
```bash
chmod +x setup-functions.sh
chmod +x deploy-firebase-complete.sh
```

### El deploy falla en "Building functions"
```bash
# Limpiar y reinstalar
cd functions
rm -rf node_modules package-lock.json
npm install
npm run build
cd ..
```

## 📝 Comandos Útiles

```bash
# Ver logs de Firebase Functions
firebase functions:log

# Desplegar solo hosting
firebase deploy --only hosting

# Desplegar solo functions
firebase deploy --only functions

# Desplegar solo rules
firebase deploy --only firestore:rules,storage

# Probar localmente (emuladores)
firebase emulators:start
```

## 🎉 ¡Listo!

Después de ejecutar el script de deploy, tu aplicación estará disponible en:
**https://iglesia-casa-de-dios-ed5b2.web.app**
