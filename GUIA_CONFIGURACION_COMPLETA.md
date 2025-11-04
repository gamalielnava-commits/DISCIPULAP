# Guía de Configuración Completa - DiscipulApp

## 🎯 Estado Actual

Tu aplicación está casi lista. Solo necesitas configurar algunos pasos finales.

---

## ✅ Parte 1: Configuración de Firebase Console

### 1. Habilitar Authentication (Email/Password)

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **discipulapp-8d99c**
3. En el menú izquierdo, haz clic en **Authentication**
4. Ve a la pestaña **Sign-in method**
5. Busca **Email/Password** y haz clic en él
6. Activa el interruptor **Enable**
7. Haz clic en **Save**

### 2. Configurar Dominios Autorizados

1. En **Authentication** → **Settings** (arriba)
2. Desplázate hasta **Authorized domains**
3. Asegúrate de que estos dominios estén agregados:
   - `localhost` (para desarrollo local)
   - `discipulapp-8d99c.web.app` (dominio de Firebase Hosting)
   - `discipulapp-8d99c.firebaseapp.com` (dominio alternativo de Firebase)
   - Tu dominio personalizado si tienes uno (ej: `discipulapp.org`)

4. Si falta alguno, haz clic en **Add domain** e ingrésalo

### 3. Desplegar Reglas de Firestore y Storage

**Opción A - Desde tu computadora (recomendado):**

```bash
# 1. Instala Firebase CLI si no lo tienes
npm install -g firebase-tools

# 2. Inicia sesión en Firebase
firebase login

# 3. Despliega las reglas
firebase deploy --only firestore:rules
firebase deploy --only storage
```

**Opción B - Desde Firebase Console:**

1. Ve a **Firestore Database** → **Rules**
2. Copia el contenido de tu archivo `firestore.rules`
3. Pégalo en el editor y haz clic en **Publish**
4. Ve a **Storage** → **Rules**
5. Copia el contenido de tu archivo `storage.rules`
6. Pégalo en el editor y haz clic en **Publish**

---

## 🚀 Parte 2: Configuración de GitHub Actions (Despliegue Automático)

### 1. Obtener Service Account de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto **discipulapp-8d99c**
3. Haz clic en el ícono de engranaje ⚙️ → **Project settings**
4. Ve a la pestaña **Service accounts**
5. Haz clic en **Generate new private key**
6. Se descargará un archivo JSON (¡NO LO COMPARTAS!)

### 2. Configurar Secrets en GitHub

1. Ve a tu repositorio en GitHub
2. Haz clic en **Settings** (arriba a la derecha)
3. En el menú izquierdo, haz clic en **Secrets and variables** → **Actions**
4. Haz clic en **New repository secret**
5. Crea este secret:
   - **Name:** `FIREBASE_SERVICE_ACCOUNT`
   - **Value:** Pega todo el contenido del archivo JSON que descargaste
6. Haz clic en **Add secret**

### 3. Probar el Despliegue Automático

Ahora, cada vez que hagas un `git push` a la rama `main`, GitHub Actions:
1. Instalará las dependencias
2. Construirá la aplicación web
3. La desplegará automáticamente a Firebase Hosting

Para probar manualmente:
1. Ve a tu repositorio en GitHub
2. Haz clic en **Actions** (arriba)
3. Selecciona **Deploy to Firebase Hosting** en el menú izquierdo
4. Haz clic en **Run workflow** → **Run workflow**

---

## 🔧 Parte 3: Despliegue Manual desde Terminal

Si prefieres desplegar manualmente desde tu computadora:

```bash
# 1. Instala dependencias limpias
rm -rf node_modules
rm -f package-lock.json
npm install

# 2. Construye la aplicación web
npx expo export --platform web --output-dir dist

# 3. Despliega a Firebase Hosting
firebase deploy --only hosting
```

---

## 🐛 Solución de Problemas

### Error: "Email/Password authentication is not enabled"

**Solución:** Completa el Paso 1 de la Parte 1 (Habilitar Authentication)

### Error: "Unauthorized domain"

**Solución:** Completa el Paso 2 de la Parte 1 (Configurar Dominios Autorizados)

### Error al registrar usuarios: "Permission denied"

**Solución:** 
1. Completa el Paso 3 de la Parte 1 (Desplegar Reglas de Firestore)
2. Verifica que las reglas permitan crear documentos en `/users/{userId}`

### Error en GitHub Actions: "Firebase service account not found"

**Solución:** Completa los Pasos 1 y 2 de la Parte 2 (Configurar Secrets)

### El build es muy grande para Netlify (>250MB)

**Solución:** Usa Firebase Hosting en lugar de Netlify. Firebase no tiene límite de 250MB.

---

## 📋 Checklist de Configuración

Marca cada paso cuando lo completes:

- [ ] Habilitar Email/Password en Firebase Authentication
- [ ] Configurar dominios autorizados en Firebase
- [ ] Desplegar reglas de Firestore
- [ ] Desplegar reglas de Storage
- [ ] Obtener Service Account de Firebase
- [ ] Configurar FIREBASE_SERVICE_ACCOUNT en GitHub Secrets
- [ ] Probar despliegue automático con GitHub Actions
- [ ] Verificar que la app funcione en producción

---

## 🎉 Después de Configurar

Una vez completados todos los pasos:

1. Tu aplicación se desplegará automáticamente en: 
   **https://discipulapp-8d99c.web.app**

2. Para registrar el primer usuario administrador:
   - Ve a tu aplicación desplegada
   - Haz clic en "Crear cuenta"
   - Registra un usuario con email: **admin@discipulapp.com**
   - Este será automáticamente un administrador

3. Para futuros despliegues:
   - Solo haz `git push` y GitHub Actions hará el resto

---

## 📞 Verificación

Para verificar que todo funciona:

```bash
# Verifica que Firebase esté configurado
firebase projects:list

# Verifica la conexión con Firestore
firebase firestore:rules:list

# Verifica que el hosting esté activo
firebase hosting:sites:list
```

---

## 🔐 Seguridad

**IMPORTANTE:** Nunca subas estos archivos a GitHub:
- `serviceAccountKey.json`
- `.env` con credenciales
- Archivos con claves privadas

El archivo `firebaseConfig.ts` es seguro porque solo contiene claves públicas (API Key, etc.).

---

¿Necesitas ayuda con algún paso? Revisa los errores específicos en la sección de Solución de Problemas.
