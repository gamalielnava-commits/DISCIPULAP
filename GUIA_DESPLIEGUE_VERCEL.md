# Guía de Despliegue en Vercel

## ✅ Configuración Completa

Tu proyecto está completamente configurado para desplegarse en Vercel con:
- ✅ Frontend (React Native Web)
- ✅ Backend (Hono + tRPC)
- ✅ Base de datos (Firebase Firestore)
- ✅ Autenticación (Firebase Auth)
- ✅ Storage (Firebase Storage)

## 📋 Pre-requisitos

1. **Cuenta de Vercel**: https://vercel.com
2. **Cuenta de Firebase**: https://firebase.google.com
3. **Configuración de Firebase**: Proyecto ya configurado

## 🚀 Pasos para Desplegar

### 1. Preparar Variables de Entorno

Antes de desplegar, asegúrate de tener todas tus credenciales de Firebase:

**Variables requeridas:**
```bash
# Firebase Client (Frontend)
EXPO_PUBLIC_FIREBASE_API_KEY=tu_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-proyecto.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=tu_app_id

# Firebase Admin (Backend)
FIREBASE_PROJECT_ID=tu-proyecto-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@tu-proyecto.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nTU_CLAVE_PRIVADA\n-----END PRIVATE KEY-----\n"
```

### 2. Desplegar en Vercel (Método CLI)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login en Vercel
vercel login

# Desplegar (primera vez)
vercel

# Seguir las instrucciones:
# - Set up and deploy? [Y/n]: Y
# - Which scope?: Selecciona tu cuenta
# - Link to existing project? [y/N]: N
# - What's your project's name?: discipulapp (o el nombre que prefieras)
# - In which directory is your code located?: ./
# - Want to override the settings?: N

# Agregar variables de entorno
vercel env add EXPO_PUBLIC_FIREBASE_API_KEY
vercel env add EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
vercel env add EXPO_PUBLIC_FIREBASE_PROJECT_ID
vercel env add EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
vercel env add EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
vercel env add EXPO_PUBLIC_FIREBASE_APP_ID
vercel env add FIREBASE_PROJECT_ID
vercel env add FIREBASE_CLIENT_EMAIL
vercel env add FIREBASE_PRIVATE_KEY

# Desplegar a producción
vercel --prod
```

### 3. Desplegar en Vercel (Método Dashboard)

1. **Ir a https://vercel.com/new**

2. **Importar tu repositorio de Git:**
   - Conecta tu cuenta de GitHub/GitLab/Bitbucket
   - Selecciona tu repositorio
   - Click en "Import"

3. **Configurar el proyecto:**
   - **Framework Preset**: Other
   - **Build Command**: `npx expo export --platform web`
   - **Output Directory**: `dist`
   - **Install Command**: `bun install`

4. **Agregar Variables de Entorno:**
   - Click en "Environment Variables"
   - Agrega todas las variables listadas arriba
   - Importante: Marca todas para "Production", "Preview" y "Development"

5. **Deploy:**
   - Click en "Deploy"
   - Espera a que termine el build (2-5 minutos)

### 4. Configurar Dominio en Netlify (Opcional)

Si quieres mantener tu dominio en Netlify pero la app en Vercel:

1. **En Netlify Dashboard:**
   - Ve a Site settings → Domain management
   - Click en tu dominio
   - Agrega un registro CNAME:
     - Name: `app` (o el subdominio que prefieras)
     - Value: `tu-proyecto.vercel.app`

2. **En Vercel Dashboard:**
   - Ve a tu proyecto → Settings → Domains
   - Agrega: `app.tudominio.com`
   - Vercel te dará instrucciones de verificación

## 🔧 Configuración Post-Despliegue

### 1. Verificar Firebase Rules

Asegúrate de que tus reglas de Firestore permitan el acceso:

```bash
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

### 2. Crear Usuario Admin

El primer usuario que se registre será automáticamente admin, o puedes crear el admin por defecto:
- Email: `admin@discipulapp.com`
- Password: `admin123`

**⚠️ IMPORTANTE:** Cambia esta contraseña inmediatamente después del primer login.

### 3. Probar la API

Visita: `https://tu-proyecto.vercel.app/api`

Deberías ver:
```json
{
  "status": "ok",
  "message": "API is running"
}
```

### 4. Probar tRPC

Visita: `https://tu-proyecto.vercel.app/api/trpc/example.hi`

## 🔍 Verificación de Funcionalidad

- [ ] La app carga correctamente
- [ ] Puedes registrar nuevos usuarios
- [ ] Puedes iniciar sesión
- [ ] La autenticación persiste al recargar
- [ ] Puedes crear/editar/eliminar datos
- [ ] Las imágenes se suben correctamente
- [ ] El audio funciona (predicas)

## 🐛 Solución de Problemas

### Error: "CORS issues"
- Verifica que las headers CORS estén configuradas en `vercel.json`
- Las headers ya están configuradas correctamente en este proyecto

### Error: "Firebase not initialized"
- Verifica que todas las variables de entorno estén configuradas
- Ve a Vercel Dashboard → Settings → Environment Variables

### Error: "Cannot read property of undefined"
- Verifica los logs en Vercel Dashboard → Deployments → [tu deploy] → Logs
- Puede ser que falte alguna variable de entorno

### Error: "Authentication failed"
- Verifica que `FIREBASE_PRIVATE_KEY` esté correctamente formateada
- Debe incluir `\\n` para los saltos de línea
- Debe estar entre comillas dobles

### Build Failed
```bash
# Prueba el build localmente primero
npx expo export --platform web

# Si funciona local pero falla en Vercel:
# - Verifica package.json
# - Verifica que no haya dependencias nativas
# - Revisa los logs de Vercel
```

## 📱 Acceso desde Móvil

Para probar en móvil:
1. Escanea el QR code que genera `npm start`
2. O usa tu URL de producción: `https://tu-proyecto.vercel.app`

## 🔄 Actualizaciones Automáticas

Con Git conectado a Vercel:
- Cada push a `main` → Deploy a producción
- Cada push a otra rama → Preview deploy
- Pull requests → Preview deploy automático

## 📊 Monitoreo

**Vercel Dashboard:**
- Analytics: Ver tráfico y performance
- Logs: Ver logs del servidor
- Deployments: Ver historial de deploys

**Firebase Console:**
- Authentication: Ver usuarios
- Firestore: Ver base de datos
- Storage: Ver archivos
- Analytics: Ver uso

## 🎯 Optimizaciones Recomendadas

1. **Habilitar Vercel Analytics:**
   ```bash
   vercel analytics enable
   ```

2. **Configurar dominio personalizado:**
   - Settings → Domains
   - Agrega tu dominio

3. **Habilitar HTTPS (automático en Vercel)**
   - Vercel provee SSL gratis

4. **Configurar redirects si es necesario:**
   - Edita `vercel.json` en la sección `redirects`

## 📚 Recursos

- [Vercel Docs](https://vercel.com/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Expo Docs](https://docs.expo.dev)
- [tRPC Docs](https://trpc.io)

## ✅ Checklist Final

- [ ] Proyecto desplegado en Vercel
- [ ] Variables de entorno configuradas
- [ ] Firebase Rules desplegadas
- [ ] Usuario admin creado
- [ ] API funcionando
- [ ] Frontend cargando
- [ ] Autenticación funcionando
- [ ] Base de datos conectada
- [ ] Dominio configurado (opcional)

---

**¡Listo!** Tu app está desplegada y funcionando en Vercel con Firebase.

Para soporte: https://vercel.com/support
