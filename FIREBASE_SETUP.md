# 🔥 Guía de Configuración de Firebase

## Pasos para Desplegar en Firebase

### 1. Instalar Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Iniciar Sesión en Firebase
```bash
firebase login
```

### 3. Crear o Seleccionar Proyecto en Firebase Console
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Copia el **Project ID** (ejemplo: `discipulapp-project`)

### 4. Actualizar Configuración Local

#### a) Actualizar `.firebaserc`
Reemplaza `discipulapp-project` con tu Project ID real:
```json
{
  "projects": {
    "default": "TU-PROJECT-ID-AQUI"
  }
}
```

#### b) Actualizar `.env`
Ve a Firebase Console > Project Settings > General y copia tus credenciales:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123:web:abc123
```

### 5. Habilitar Servicios en Firebase Console

#### Authentication
1. Ve a **Authentication** > **Sign-in method**
2. Habilita:
   - ✅ **Email/Password**
   - ✅ **Google** (para Gmail login)
   - ✅ **Apple** (para iCloud login)

Para Google:
- Agrega tu dominio autorizado
- Configura OAuth consent screen

Para Apple:
- Necesitas una cuenta de Apple Developer
- Configura Service ID en Apple Developer Console
- Agrega el Service ID en Firebase

#### Firestore Database
1. Ve a **Firestore Database**
2. Crea una base de datos
3. Selecciona modo (producción o prueba)
4. Configura reglas de seguridad

#### Storage
1. Ve a **Storage**
2. Habilita el servicio
3. Configura reglas de seguridad

### 6. Instalar Dependencias del Backend
```bash
cd backend
npm install
cd ..
```

### 7. Construir la Aplicación Web
```bash
npm run build:web
```

Esto generará la carpeta `dist/` con tu aplicación web.

### 8. Desplegar en Firebase

#### Desplegar Todo (Hosting + Functions)
```bash
firebase deploy
```

#### Desplegar Solo Hosting
```bash
firebase deploy --only hosting
```

#### Desplegar Solo Functions
```bash
firebase deploy --only functions
```

### 9. Verificar el Despliegue
Después del despliegue, Firebase te dará URLs:
- **Hosting URL**: `https://tu-proyecto.web.app`
- **Functions URL**: `https://us-central1-tu-proyecto.cloudfunctions.net/api`

## 🔧 Comandos Útiles

### Probar Localmente con Emuladores
```bash
# Iniciar emuladores
firebase emulators:start

# Tu app estará en:
# - Hosting: http://localhost:5000
# - Functions: http://localhost:5001
# - Firestore: http://localhost:8080
# - Auth: http://localhost:9099
```

### Ver Logs de Functions
```bash
firebase functions:log
```

### Ver Estado del Proyecto
```bash
firebase projects:list
firebase use
```

## 📱 Configurar OAuth para iOS y Android

### Google Sign-In

#### iOS
1. Agrega el `REVERSED_CLIENT_ID` a tu `app.json`:
```json
{
  "expo": {
    "ios": {
      "googleServicesFile": "./GoogleService-Info.plist"
    }
  }
}
```

#### Android
1. Descarga `google-services.json` de Firebase Console
2. Agrega el SHA-1 de tu app en Firebase Console

### Apple Sign-In

Ya está configurado en `app.json`:
```json
{
  "expo": {
    "ios": {
      "usesAppleSignIn": true
    },
    "plugins": ["expo-apple-authentication"]
  }
}
```

## ⚠️ Problemas Comunes

### Error: "Project ID not found"
- Verifica que `.firebaserc` tenga el Project ID correcto
- Ejecuta `firebase use --add` para seleccionar el proyecto

### Error: "Firebase config invalid"
- Verifica que todas las variables en `.env` estén correctamente configuradas
- Asegúrate de que no haya espacios extra o comillas

### Error: "Functions deployment failed"
- Verifica que `backend/package.json` exista
- Ejecuta `cd backend && npm install`
- Verifica que tengas Node.js 20 instalado

### Error: "Hosting deployment failed"
- Ejecuta `npm run build:web` antes de desplegar
- Verifica que la carpeta `dist/` exista

## 🎯 Checklist de Despliegue

- [ ] Firebase CLI instalado
- [ ] Sesión iniciada en Firebase (`firebase login`)
- [ ] Proyecto creado en Firebase Console
- [ ] `.firebaserc` actualizado con Project ID
- [ ] `.env` actualizado con credenciales de Firebase
- [ ] Authentication habilitado (Email, Google, Apple)
- [ ] Firestore Database creado
- [ ] Storage habilitado
- [ ] Dependencias del backend instaladas (`cd backend && npm install`)
- [ ] App web construida (`npm run build:web`)
- [ ] Desplegado en Firebase (`firebase deploy`)
- [ ] URLs verificadas y funcionando

## 📚 Recursos

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Expo Firebase Guide](https://docs.expo.dev/guides/using-firebase/)
- [Apple Sign-In Setup](https://firebase.google.com/docs/auth/ios/apple)
- [Google Sign-In Setup](https://firebase.google.com/docs/auth/web/google-signin)
