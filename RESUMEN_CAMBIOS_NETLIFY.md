# Resumen de Cambios para Solucionar Errores de Netlify

## ✅ Cambios Realizados

### 1. **Nuevo archivo: `backend/firebaseAdmin.ts`**
- Configuración de Firebase Admin SDK para el servidor
- Usa `firebase-admin` en lugar de `firebase` (cliente)
- Evita el error "INTERNAL ASSERTION FAILED" al no usar código de React Native en el servidor

### 2. **Actualizado: `backend/trpc/create-context.ts`**
- Ahora usa Firebase Admin SDK en el contexto de tRPC
- Proporciona `db`, `auth`, y `storage` del servidor a todas las rutas tRPC

### 3. **Actualizado: `netlify.toml`**
- Removidos módulos de Firebase cliente (`firebase`, `@firebase/*`, `react-native`)
- Solo mantiene `firebase-admin` como módulo externo
- Esto evita que se intente bundlear código de React Native en las funciones de Netlify

### 4. **Instalado: `firebase-admin`**
- Paquete necesario para operaciones de Firebase en el servidor

### 5. **Actualizado: `.env.example`**
- Agregadas variables de entorno para el servidor
- Documentación clara de qué variables son para cliente vs servidor

### 6. **Nuevo archivo: `NETLIFY_SETUP.md`**
- Guía completa de configuración de variables de entorno en Netlify
- Instrucciones paso a paso

## 🚀 Próximos Pasos

### Paso 1: Configurar Variables de Entorno en Netlify

Ve a tu dashboard de Netlify y agrega estas variables:

**Variables Requeridas:**
```
EXPO_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_WEB_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=discipulapp-8d99c.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=discipulapp-8d99c
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=discipulapp-8d99c.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=144673796951
EXPO_PUBLIC_FIREBASE_APP_ID=1:144673796951:web:9cd9e632474fb9dedcc412
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-65VZ57LGFH
FIREBASE_PROJECT_ID=discipulapp-8d99c
EXPO_PUBLIC_API_BASE_URL=https://TU-SITIO.netlify.app
```

**IMPORTANTE:** Reemplaza `TU-SITIO` con el nombre real de tu sitio en Netlify.

### Paso 2: Hacer Push de los Cambios

```bash
git add .
git commit -m "Fix: Configuración de Firebase Admin para Netlify"
git push
```

### Paso 3: Verificar el Deploy

1. Ve a tu dashboard de Netlify
2. Espera a que termine el deploy
3. Verifica que no haya errores en los logs
4. Prueba la API: `https://TU-SITIO.netlify.app/api/`
5. Deberías ver: `{"status":"ok","message":"API is running"}`

## 🔍 Verificación de Errores Solucionados

### ❌ Error Anterior:
```
@firebase/auth: Auth (12.3.0): INTERNAL ASSERTION FAILED: Expected a class definition
```

### ✅ Solución:
- Ya no se importa `firebase` (cliente) en el servidor
- Se usa `firebase-admin` que está diseñado para Node.js
- No se intenta usar `Platform` de React Native en el servidor
- No se intenta usar `AsyncStorage` en el servidor

## 📝 Notas Importantes

1. **Firebase Admin vs Firebase Client:**
   - `firebase` → Solo para el frontend (navegador/app móvil)
   - `firebase-admin` → Solo para el backend (Netlify Functions)

2. **Variables de Entorno:**
   - `EXPO_PUBLIC_*` → Disponibles en el frontend
   - Sin prefijo → Solo disponibles en el backend

3. **Credenciales Opcionales:**
   - La app funcionará sin `FIREBASE_PRIVATE_KEY` y `FIREBASE_CLIENT_EMAIL`
   - Estas son necesarias solo para operaciones privilegiadas de admin
   - Si las necesitas, sigue las instrucciones en `NETLIFY_SETUP.md`

## 🆘 Si Aún Hay Errores

1. **Revisa los logs de Netlify:**
   - Dashboard → Functions → api → View logs

2. **Verifica las variables de entorno:**
   - Dashboard → Site settings → Environment variables
   - Asegúrate de que todas estén configuradas

3. **Haz un deploy limpio:**
   - Dashboard → Deploys → Trigger deploy → Clear cache and deploy site

4. **Verifica que el build sea exitoso:**
   - Revisa los logs de build en la pestaña "Deploys"
