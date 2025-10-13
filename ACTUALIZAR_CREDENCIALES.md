# 🔑 Actualizar Credenciales de Firebase

## ⚠️ IMPORTANTE: Actualizar archivo .env

Tu archivo `.env` actualmente tiene las credenciales del proyecto **discipulapp-8d99c**, pero necesitas las del proyecto **iglesia-casa-de-dios-ed5b2**.

## 📋 Pasos para Obtener las Credenciales

1. **Ve a Firebase Console:**
   https://console.firebase.google.com/project/iglesia-casa-de-dios-ed5b2/settings/general

2. **Busca la sección "Tus apps"**

3. **Si ya existe una app web:**
   - Click en el ícono de configuración (</>) 
   - Copia las credenciales

4. **Si NO existe una app web:**
   - Click en "Agregar app" → Selecciona "Web" (</>) 
   - Dale un nombre (ej: "Discipulapp Web")
   - NO marques "Firebase Hosting"
   - Click en "Registrar app"
   - Copia las credenciales que aparecen

## 🔧 Actualizar el archivo .env

Reemplaza el contenido de tu archivo `.env` con:

```env
# Firebase Configuration (Proyecto: iglesia-casa-de-dios-ed5b2)
EXPO_PUBLIC_FIREBASE_API_KEY=TU_API_KEY_AQUI
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=iglesia-casa-de-dios-ed5b2.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=iglesia-casa-de-dios-ed5b2
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=iglesia-casa-de-dios-ed5b2.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=TU_SENDER_ID_AQUI
EXPO_PUBLIC_FIREBASE_APP_ID=TU_APP_ID_AQUI
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=TU_MEASUREMENT_ID_AQUI

# Backend API Configuration
EXPO_PUBLIC_API_BASE_URL=https://iglesia-casa-de-dios-ed5b2.web.app

# Optional: Firebase Emulator Configuration (for development)
# FIREBASE_AUTH_EMULATOR_HOST=localhost:9099
# FIRESTORE_EMULATOR_HOST=localhost:8080
# FIREBASE_STORAGE_EMULATOR_HOST=localhost:9199
```

## 📝 Ejemplo de Credenciales

Las credenciales se ven así en Firebase Console:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "iglesia-casa-de-dios-ed5b2.firebaseapp.com",
  projectId: "iglesia-casa-de-dios-ed5b2",
  storageBucket: "iglesia-casa-de-dios-ed5b2.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef",
  measurementId: "G-XXXXXXXXXX"
};
```

## 🔐 Configurar Secrets en GitHub (para GitHub Actions)

Para que el despliegue automático funcione, necesitas agregar estos secrets en GitHub:

1. Ve a tu repositorio en GitHub
2. Settings → Secrets and variables → Actions
3. Click en "New repository secret"
4. Agrega cada uno de estos secrets:

| Secret Name | Valor |
|------------|-------|
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Tu API Key |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | iglesia-casa-de-dios-ed5b2.firebaseapp.com |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | iglesia-casa-de-dios-ed5b2 |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | iglesia-casa-de-dios-ed5b2.appspot.com |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Tu Sender ID |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | Tu App ID |
| `EXPO_PUBLIC_RORK_API_BASE_URL` | https://iglesia-casa-de-dios-ed5b2.web.app |

### Secret Especial: FIREBASE_SERVICE_ACCOUNT

Este secret es necesario para que GitHub Actions pueda desplegar a Firebase:

1. En tu terminal, ejecuta:
   ```bash
   firebase login
   firebase projects:list
   ```

2. Genera una cuenta de servicio:
   - Ve a: https://console.firebase.google.com/project/iglesia-casa-de-dios-ed5b2/settings/serviceaccounts/adminsdk
   - Click en "Generar nueva clave privada"
   - Se descargará un archivo JSON
   - Copia TODO el contenido del archivo JSON

3. En GitHub:
   - Crea un secret llamado `FIREBASE_SERVICE_ACCOUNT`
   - Pega el contenido completo del archivo JSON

## ✅ Verificar que Funciona

Después de actualizar las credenciales:

```bash
# Limpiar e instalar
rm -rf node_modules package-lock.json
npm install

# Probar el build
npx expo export --platform web --output-dir dist

# Si funciona, desplegar
firebase deploy --only hosting
```

## 🐛 Problemas Comunes

### Error: "Firebase: Error (auth/invalid-api-key)"
- Verifica que copiaste correctamente el API Key
- Asegúrate de no tener espacios extra

### Error: "Firebase: Error (auth/project-not-found)"
- Verifica que el PROJECT_ID sea exactamente: `iglesia-casa-de-dios-ed5b2`

### Error: "Permission denied"
- Asegúrate de tener permisos en el proyecto Firebase
- Ejecuta `firebase login` y selecciona la cuenta correcta

---

Una vez actualizado el `.env` y los secrets de GitHub, todo funcionará automáticamente. 🎉
