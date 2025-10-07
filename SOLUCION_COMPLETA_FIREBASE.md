# 🔥 Solución Completa: Firebase + Netlify

## 🚨 PROBLEMA PRINCIPAL

Error: `auth/api-key-not-valid` - La API Key de Firebase no está autorizada para tu dominio.

---

## ✅ SOLUCIÓN EN 5 PASOS

### 📍 PASO 1: Autorizar Dominios en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona: **discipulapp-8d99c**
3. Ve a: **Authentication** → **Settings** → **Authorized domains**
4. Haz clic en **Add domain** y agrega:

```
localhost
discipulapp.org
discipulapp-8d99c.web.app
discipulapp-8d99c.firebaseapp.com
```

5. Si usas Netlify, agrega también:
```
tu-sitio.netlify.app
```

---

### 📍 PASO 2: Configurar API Key en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Selecciona el proyecto: **discipulapp-8d99c**
3. Ve a: **APIs & Services** → **Credentials**
4. Busca la API Key: `AIzaSyATOSjJ073YgRz80bBUPa4OK0rEBov0mCU`
5. Haz clic en el ícono de editar (lápiz)

**Configuración de Application restrictions:**
- Selecciona: **HTTP referrers (web sites)**
- Haz clic en **ADD AN ITEM** y agrega:

```
http://localhost:*/*
https://localhost:*/*
https://discipulapp.org/*
https://*.netlify.app/*
https://discipulapp-8d99c.web.app/*
https://discipulapp-8d99c.firebaseapp.com/*
```

**Configuración de API restrictions:**
- Selecciona: **Restrict key**
- Haz clic en **SELECT APIs** y habilita:
  - ✅ Identity Toolkit API
  - ✅ Cloud Firestore API
  - ✅ Cloud Storage API
  - ✅ Firebase Installations API
  - ✅ Firebase Management API

6. Haz clic en **SAVE**

---

### 📍 PASO 3: Habilitar Servicios en Firebase

#### 3.1 Firestore Database

1. Ve a **Firestore Database** en Firebase Console
2. Si no está creado, haz clic en **Create database**
3. Selecciona **Start in production mode**
4. Elige región: **us-central1** (o la más cercana)
5. Haz clic en **Enable**

#### 3.2 Authentication

1. Ve a **Authentication** en Firebase Console
2. Haz clic en **Get started**
3. Ve a la pestaña **Sign-in method**
4. Habilita **Email/Password**
5. Haz clic en **Save**

#### 3.3 Storage

1. Ve a **Storage** en Firebase Console
2. Haz clic en **Get started**
3. Selecciona **Start in production mode**
4. Elige la misma región que Firestore
5. Haz clic en **Done**

---

### 📍 PASO 4: Desplegar Reglas de Seguridad

Ejecuta estos comandos en tu terminal:

```bash
# Instalar Firebase CLI (si no lo tienes)
npm install -g firebase-tools

# Login a Firebase
firebase login

# Configurar el proyecto
firebase use discipulapp-8d99c

# Desplegar reglas
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

O usa el script automatizado:

```bash
chmod +x deploy-firebase-rules.sh
./deploy-firebase-rules.sh
```

---

### 📍 PASO 5: Configurar Variables en Netlify (si aplica)

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
```

5. Haz un nuevo deploy después de agregar las variables

---

## 🧪 VERIFICACIÓN

Ejecuta tu app:

```bash
npm start
```

Deberías ver en la consola:

```
🔍 ========================================
🔍 VERIFICACIÓN COMPLETA DE FIREBASE
🔍 ========================================

📋 1. Verificando configuración básica...
   Auth: ✅ Inicializado
   Firestore: ✅ Inicializado
   Storage: ✅ Inicializado
   ✅ Configuración básica OK

📋 2. Verificando conexión a Firestore...
   ✅ Escritura en Firestore: OK
   ✅ Lectura de Firestore: OK

📋 3. Verificando Firebase Authentication...
   🔹 Creando usuario de prueba...
   ✅ Registro de usuario: OK
   🔹 Cerrando sesión...
   ✅ Cierre de sesión: OK
   🔹 Iniciando sesión...
   ✅ Inicio de sesión: OK

📋 4. Verificando Firebase Storage...
   ℹ️ Storage configurado y listo

📋 5. Verificando reglas de seguridad...
   ✅ Colección 'usuarios': Accesible
   ✅ Colección 'grupos': Accesible
   ✅ Colección 'reportes': Accesible
   ✅ Colección 'recursos': Accesible
   ✅ Colección 'modulos': Accesible
   ✅ Colección 'mensajes': Accesible

🔍 ========================================
🔍 RESUMEN DE VERIFICACIÓN
🔍 ========================================
   Configuración:  ✅
   Firestore:      ✅
   Authentication: ✅
   Storage:        ✅
   Reglas:         ✅
🔍 ========================================

🎉 ¡FIREBASE ESTÁ COMPLETAMENTE CONFIGURADO!
✅ Puedes usar admin@discipulapp.com / admin123 para entrar
```

---

## 📱 CREDENCIALES DE ADMINISTRADOR

Una vez configurado todo:

- **Email:** `admin@discipulapp.com`
- **Contraseña:** `admin123`
- **Rol:** `administrador`

---

## 🔍 TROUBLESHOOTING

### Si sigues viendo `auth/api-key-not-valid`:

1. **Verifica que la API Key esté correcta en `firebaseConfig.js`**
2. **Espera 5-10 minutos** después de configurar las restricciones en Google Cloud Console
3. **Limpia caché del navegador** (Ctrl + Shift + Delete)
4. **Verifica que el dominio esté autorizado** en Firebase Console → Authentication → Settings
5. **Revisa la consola del navegador** para ver el dominio exacto que está haciendo la petición

### Si ves `permission-denied` en Firestore:

1. Verifica que las reglas estén desplegadas:
   ```bash
   firebase deploy --only firestore:rules
   ```
2. Espera 1-2 minutos después del despliegue
3. Verifica en Firebase Console → Firestore → Rules que las reglas estén activas

### Si el usuario admin no se crea:

1. Verifica que Authentication esté habilitado
2. Verifica que Email/Password esté habilitado en Sign-in methods
3. Revisa la consola para ver el error específico

---

## 📚 ARCHIVOS IMPORTANTES

- `firebaseConfig.js` - Configuración de Firebase
- `verifyFirebaseConnection.js` - Script de verificación completa
- `createAdmin.js` - Script para crear usuario administrador
- `firestore.rules` - Reglas de seguridad de Firestore
- `storage.rules` - Reglas de seguridad de Storage
- `.env` - Variables de entorno

---

## 🎯 CHECKLIST FINAL

- [ ] Dominios autorizados en Firebase Console
- [ ] API Key configurada en Google Cloud Console
- [ ] Firestore Database habilitado
- [ ] Authentication habilitado (Email/Password)
- [ ] Storage habilitado
- [ ] Reglas de Firestore desplegadas
- [ ] Reglas de Storage desplegadas
- [ ] Variables de entorno configuradas en Netlify (si aplica)
- [ ] Usuario administrador creado
- [ ] Verificación completa ejecutada sin errores

---

## 📞 SOPORTE

Si después de seguir todos los pasos sigues teniendo problemas:

1. Revisa los logs de la consola del navegador
2. Revisa los logs de Firebase Console → Firestore → Usage
3. Verifica que tu proyecto de Firebase esté en el plan correcto (Spark o Blaze)
4. Asegúrate de que no haya restricciones de facturación

---

## 🚀 PRÓXIMOS PASOS

Una vez que Firebase esté funcionando:

1. Cambia las reglas de Firestore a modo producción (con autenticación)
2. Configura índices compuestos si es necesario
3. Configura backups automáticos
4. Implementa rate limiting
5. Configura monitoreo y alertas
