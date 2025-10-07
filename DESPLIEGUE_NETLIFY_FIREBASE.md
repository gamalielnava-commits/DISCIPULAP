# Guía de Despliegue: Netlify + Firebase

Esta aplicación usa **Netlify** para hosting (frontend + backend) y **Firebase** para base de datos.

## 📋 Requisitos Previos

1. Cuenta en [Netlify](https://netlify.com)
2. Cuenta en [Firebase](https://console.firebase.google.com)
3. Dominio configurado (discipulapp.org)

## 🔥 Configuración de Firebase (Base de Datos)

### 1. Crear Proyecto en Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita los siguientes servicios:
   - **Authentication** (Email/Password, Google, etc.)
   - **Firestore Database** (modo producción)
   - **Storage** (para imágenes y archivos)

### 2. Obtener Credenciales de Firebase

1. Ve a **Project Settings** > **General**
2. En "Your apps", selecciona la app web (o crea una nueva)
3. Copia las credenciales que aparecen en `firebaseConfig`

### 3. Configurar Reglas de Seguridad

#### Firestore Rules (`firestore.rules`):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

#### Storage Rules (`storage.rules`):
```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }
  }
}
```

Despliega las reglas:
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

## 🚀 Configuración de Netlify (Hosting)

### 1. Conectar Repositorio

1. Ve a [Netlify](https://app.netlify.com)
2. Click en "Add new site" > "Import an existing project"
3. Conecta tu repositorio de GitHub/GitLab/Bitbucket
4. Selecciona el repositorio de tu proyecto

### 2. Configurar Build Settings

En la configuración del sitio en Netlify:

- **Build command**: `npm run build:web`
- **Publish directory**: `dist`
- **Functions directory**: `netlify/functions`

### 3. Configurar Variables de Entorno

Ve a **Site settings** > **Environment variables** y agrega:

```
EXPO_PUBLIC_FIREBASE_API_KEY=tu-api-key-de-firebase
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=tu-app-id
EXPO_PUBLIC_API_BASE_URL=https://discipulapp.org
```

**IMPORTANTE**: Reemplaza todos los valores con tus credenciales reales de Firebase.

### 4. Configurar Dominio Personalizado

1. Ve a **Domain settings** en Netlify
2. Click en "Add custom domain"
3. Ingresa `discipulapp.org`
4. Netlify te dará instrucciones para configurar DNS

#### Configuración DNS en tu proveedor de dominio:

**Para el dominio raíz (discipulapp.org):**
```
Tipo: A
Nombre: @
Valor: 75.2.60.5
```

**Para el subdominio www:**
```
Tipo: CNAME
Nombre: www
Valor: tu-sitio.netlify.app
```

**NOTA**: Los valores de IP pueden variar. Usa los que Netlify te proporcione.

### 5. Habilitar HTTPS

Netlify automáticamente provee certificados SSL gratuitos de Let's Encrypt:

1. Ve a **Domain settings** > **HTTPS**
2. Click en "Verify DNS configuration"
3. Una vez verificado, click en "Provision certificate"
4. Espera unos minutos hasta que el certificado esté activo

## 📦 Despliegue

### Despliegue Automático (Recomendado)

Cada vez que hagas push a tu rama principal (main/master), Netlify automáticamente:
1. Detecta los cambios
2. Ejecuta el build
3. Despliega la nueva versión

### Despliegue Manual

Si prefieres desplegar manualmente:

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Build local
npm run build:web

# Deploy
netlify deploy --prod
```

## ✅ Verificación

Después del despliegue, verifica:

1. **Frontend**: Visita https://discipulapp.org
   - Debe cargar la aplicación
   - Debe tener HTTPS (candado verde)

2. **Backend/API**: Verifica que las funciones funcionen
   - Prueba login/registro
   - Verifica que se conecte a Firebase

3. **Firebase**: Verifica en Firebase Console
   - Que se creen usuarios en Authentication
   - Que se guarden datos en Firestore
   - Que se suban archivos a Storage

## 🐛 Solución de Problemas

### Error: "Module not found: @rork/toolkit-sdk"

✅ **SOLUCIONADO**: Este paquete solo está disponible en desarrollo local. La funcionalidad de IA ha sido deshabilitada en producción.

### Error: "Build failed"

1. Verifica que todas las variables de entorno estén configuradas
2. Revisa los logs de build en Netlify
3. Asegúrate de que `package.json` tenga todas las dependencias

### Error: "Site not loading"

1. Verifica que el DNS esté configurado correctamente
2. Espera 24-48 horas para propagación DNS
3. Limpia caché del navegador

### Error: "Firebase connection failed"

1. Verifica que las credenciales de Firebase sean correctas
2. Verifica que los servicios estén habilitados en Firebase Console
3. Revisa las reglas de seguridad de Firestore y Storage

## 📝 Notas Importantes

1. **Funcionalidad de IA**: La creación de módulos con IA (`@rork/toolkit-sdk`) solo funciona en desarrollo local. En producción, esta funcionalidad está deshabilitada.

2. **Variables de Entorno**: Nunca subas el archivo `.env` al repositorio. Usa las variables de entorno de Netlify.

3. **Certificado SSL**: Netlify maneja automáticamente la renovación de certificados SSL.

4. **Costos**: 
   - Netlify: Plan gratuito incluye 100GB bandwidth/mes
   - Firebase: Plan Spark (gratuito) con límites generosos

## 🔗 Enlaces Útiles

- [Netlify Dashboard](https://app.netlify.com)
- [Firebase Console](https://console.firebase.google.com)
- [Documentación Netlify](https://docs.netlify.com)
- [Documentación Firebase](https://firebase.google.com/docs)
