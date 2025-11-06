# Configuración de Netlify

## Variables de Entorno Requeridas

Para que tu aplicación funcione correctamente en Netlify, necesitas configurar las siguientes variables de entorno en el dashboard de Netlify:

### 1. Ve a tu sitio en Netlify
- Abre https://app.netlify.com
- Selecciona tu sitio
- Ve a **Site settings** > **Environment variables**

### 2. Agrega las siguientes variables:

#### Variables de Firebase (Cliente)
```
EXPO_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_WEB_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=discipulapp-8d99c.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=discipulapp-8d99c
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=discipulapp-8d99c.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=144673796951
EXPO_PUBLIC_FIREBASE_APP_ID=1:144673796951:web:9cd9e632474fb9dedcc412
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-65VZ57LGFH
```

#### Variables de Firebase (Servidor)
```
FIREBASE_PROJECT_ID=discipulapp-8d99c
```

#### Variable de API Base URL
```
EXPO_PUBLIC_API_BASE_URL=https://tu-sitio.netlify.app
```

**IMPORTANTE:** Reemplaza `https://tu-sitio.netlify.app` con la URL real de tu sitio en Netlify.

### 3. Credenciales de Firebase Admin (Opcional pero Recomendado)

Para operaciones del servidor que requieren privilegios de administrador, necesitas configurar las credenciales de Firebase Admin:

1. Ve a [Firebase Console](https://console.firebase.google.com)
2. Selecciona tu proyecto: **discipulapp-8d99c**
3. Ve a **Project Settings** > **Service Accounts**
4. Haz clic en **Generate new private key**
5. Descarga el archivo JSON

Luego, en Netlify, agrega estas variables desde el archivo JSON descargado:

```
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@discipulapp-8d99c.iam.gserviceaccount.com
```

**NOTA:** Para `FIREBASE_PRIVATE_KEY`, copia el valor completo incluyendo `-----BEGIN PRIVATE KEY-----` y `-----END PRIVATE KEY-----`. Los saltos de línea deben ser `\n`.

### 4. Redeploy

Después de agregar las variables de entorno:
1. Ve a **Deploys**
2. Haz clic en **Trigger deploy** > **Clear cache and deploy site**

## Verificación

Una vez desplegado, verifica que todo funcione:

1. Abre tu sitio: `https://tu-sitio.netlify.app`
2. Verifica que la API funcione: `https://tu-sitio.netlify.app/api/`
3. Deberías ver: `{"status":"ok","message":"API is running"}`

## Solución de Problemas

### Error: "INTERNAL ASSERTION FAILED"
- Asegúrate de que todas las variables de entorno estén configuradas
- Verifica que `FIREBASE_PROJECT_ID` esté configurado en Netlify
- Haz un "Clear cache and deploy"

### Error: "Firebase not initialized"
- Verifica que todas las variables `EXPO_PUBLIC_FIREBASE_*` estén configuradas
- Asegúrate de que los valores sean correctos (sin espacios extra)

### Error 500 en /api/trpc/*
- Revisa los logs de Netlify Functions
- Ve a **Functions** en el dashboard de Netlify
- Haz clic en la función `api` para ver los logs
