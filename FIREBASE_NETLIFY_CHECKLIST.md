# 🔥 Checklist: Integración Firebase + Netlify

## ✅ Estado Actual de la Configuración

### 1. Firebase Config
- ✅ `firebaseConfig.js` creado
- ✅ API Key: `AIzaSyATOSjJ073YgRz80bBUPa4OK0rEBov0mCU`
- ✅ Project ID: `discipulapp-8d99c`
- ✅ Auth Domain: `discipulapp-8d99c.firebaseapp.com`

### 2. Archivos de Reglas
- ✅ `firestore.rules` - Configurado (modo abierto para desarrollo)
- ✅ `storage.rules` - Configurado (requiere autenticación)

### 3. Variables de Entorno
- ✅ `.env` configurado con todas las variables
- ✅ Dominio público: `https://discipulapp.org`

---

## 🚨 PROBLEMAS DETECTADOS

### Error: `auth/api-key-not-valid`

Este error ocurre porque:

1. **La API Key no está autorizada para tu dominio de Netlify**
2. **Restricciones de API Key mal configuradas en Firebase Console**

---

## 🔧 SOLUCIÓN PASO A PASO

### Paso 1: Autorizar Dominios en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **discipulapp-8d99c**
3. Ve a **Authentication** → **Settings** → **Authorized domains**
4. Agrega estos dominios:

```
localhost
discipulapp.org
*.netlify.app
discipulapp-8d99c.firebaseapp.com
```

### Paso 2: Verificar Restricciones de API Key

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona el proyecto: **discipulapp-8d99c**
3. Ve a **APIs & Services** → **Credentials**
4. Busca la API Key: `AIzaSyATOSjJ073YgRz80bBUPa4OK0rEBov0mCU`
5. Haz clic en ella y verifica:

   **Application restrictions:**
   - Selecciona: **HTTP referrers (web sites)**
   - Agrega estos referrers:
     ```
     http://localhost:*/*
     https://localhost:*/*
     https://discipulapp.org/*
     https://*.netlify.app/*
     https://discipulapp-8d99c.firebaseapp.com/*
     ```

   **API restrictions:**
   - Selecciona: **Restrict key**
   - Habilita estas APIs:
     - Identity Toolkit API
     - Cloud Firestore API
     - Firebase Storage API
     - Firebase Installations API

### Paso 3: Desplegar Reglas de Firestore y Storage

Ejecuta estos comandos en tu terminal:

```bash
# Instalar Firebase CLI (si no lo tienes)
npm install -g firebase-tools

# Login a Firebase
firebase login

# Configurar el proyecto correcto
firebase use discipulapp-8d99c

# Desplegar reglas de Firestore
firebase deploy --only firestore:rules

# Desplegar reglas de Storage
firebase deploy --only storage:rules
```

### Paso 4: Configurar Variables de Entorno en Netlify

1. Ve a tu dashboard de Netlify
2. Selecciona tu sitio
3. Ve a **Site settings** → **Environment variables**
4. Agrega estas variables:

```
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyATOSjJ073YgRz80bBUPa4OK0rEBov0mCU
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=discipulapp-8d99c.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=discipulapp-8d99c
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=discipulapp-8d99c.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=14467379651
EXPO_PUBLIC_FIREBASE_APP_ID=1:14467379651:web:9cd9e632474fb9dedcc412
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-65VZ57LGFH
EXPO_PUBLIC_API_BASE_URL=https://discipulapp.org
```

### Paso 5: Habilitar Servicios en Firebase Console

1. **Firestore Database:**
   - Ve a **Firestore Database**
   - Si no está creado, haz clic en **Create database**
   - Selecciona **Start in production mode** (las reglas ya están configuradas)
   - Elige la región más cercana (ej: `us-central1`)

2. **Authentication:**
   - Ve a **Authentication**
   - Haz clic en **Get started**
   - Habilita **Email/Password** en la pestaña **Sign-in method**

3. **Storage:**
   - Ve a **Storage**
   - Haz clic en **Get started**
   - Selecciona **Start in production mode**
   - Elige la misma región que Firestore

---

## 🧪 VERIFICACIÓN FINAL

Después de completar todos los pasos, ejecuta:

```bash
npm start
```

Deberías ver en la consola:

```
✅ Firebase conectado: [DEFAULT]
📦 Proyecto: discipulapp-8d99c
🔍 Verificando conexión con Firebase...
Auth: ✅ Activo
Firestore: ✅ Activo
Storage: ✅ Activo
✅ Documento de prueba creado en Firestore (colección 'pruebas').
✅ Usuario administrador creado exitosamente
📧 Email: admin@discipulapp.com
🔑 Contraseña: admin123
```

---

## 📱 Credenciales de Administrador

Una vez que todo esté funcionando:

- **Email:** `admin@discipulapp.com`
- **Contraseña:** `admin123`
- **Rol:** `administrador`

---

## 🔍 Troubleshooting

### Si sigues viendo errores de permisos:

1. Verifica que las reglas de Firestore estén desplegadas:
   ```bash
   firebase deploy --only firestore:rules
   ```

2. Verifica en Firebase Console → Firestore → Rules que las reglas estén activas

3. Espera 1-2 minutos después de desplegar las reglas

### Si el error persiste en producción (Netlify):

1. Verifica que las variables de entorno estén configuradas en Netlify
2. Haz un nuevo deploy después de configurar las variables
3. Verifica que el dominio de Netlify esté autorizado en Firebase Console

---

## 📚 Recursos Útiles

- [Firebase Console](https://console.firebase.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Netlify Dashboard](https://app.netlify.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
