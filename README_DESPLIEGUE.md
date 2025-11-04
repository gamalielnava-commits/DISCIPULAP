# 🚀 Guía Rápida de Despliegue - DiscipulApp

## 📋 Antes de Empezar

Tu aplicación usa **Firebase** como backend. Ya está configurada, solo necesitas:

1. **Habilitar Authentication en Firebase Console**
2. **Desplegar las reglas de seguridad**
3. **Construir y desplegar la aplicación**

---

## 🎯 Opción 1: Despliegue Automático (Recomendado)

Con GitHub Actions, cada vez que hagas `git push`, tu app se desplegará automáticamente.

### Pasos:

1. **Obtén tu Service Account de Firebase:**
   - Ve a [Firebase Console](https://console.firebase.google.com/)
   - Proyecto: **discipulapp-8d99c**
   - Settings ⚙️ → Service accounts → Generate new private key

2. **Configura el Secret en GitHub:**
   - Tu repositorio → Settings → Secrets and variables → Actions
   - New repository secret
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Value: Pega el contenido del archivo JSON descargado

3. **Haz push y listo:**
   ```bash
   git add .
   git commit -m "Configurar despliegue automático"
   git push
   ```

4. **Tu app estará en:**
   - https://discipulapp-8d99c.web.app

---

## 💻 Opción 2: Despliegue Manual

### En Mac/Linux:

```bash
# Hacer ejecutables los scripts (solo la primera vez)
chmod +x deploy-complete.sh
chmod +x deploy-rules.sh
chmod +x verificar-configuracion-firebase.sh

# Verificar configuración (opcional)
./verificar-configuracion-firebase.sh

# Desplegar reglas de seguridad
./deploy-rules.sh

# Desplegar aplicación completa
./deploy-complete.sh
```

### En Windows:

```batch
REM Desplegar reglas de seguridad
deploy-rules.bat

REM Desplegar aplicación completa
deploy-complete.bat
```

### Manualmente paso a paso:

```bash
# 1. Limpiar e instalar dependencias
rm -rf node_modules package-lock.json
npm install

# 2. Construir la app
npx expo export --platform web --output-dir dist

# 3. Desplegar reglas
firebase deploy --only firestore:rules
firebase deploy --only storage

# 4. Desplegar hosting
firebase deploy --only hosting
```

---

## ⚙️ Configuración Requerida en Firebase Console

Antes de que tu app funcione, debes:

### 1. Habilitar Email/Password Authentication

1. [Firebase Console](https://console.firebase.google.com/) → discipulapp-8d99c
2. Authentication → Sign-in method
3. Email/Password → Enable → Save

### 2. Agregar Dominios Autorizados

En Authentication → Settings → Authorized domains, agrega:
- `localhost` (para desarrollo)
- `discipulapp-8d99c.web.app` (tu dominio de producción)
- `discipulapp-8d99c.firebaseapp.com` (dominio alternativo)

---

## 🔧 Solución de Problemas

### Error: "Firebase CLI not found"
```bash
npm install -g firebase-tools
firebase login
```

### Error: "Project not found"
```bash
firebase use discipulapp-8d99c
```

### Error: "Email/Password not enabled"
- Ve a Firebase Console
- Authentication → Sign-in method
- Habilita Email/Password

### Error: "Permission denied" al registrar
```bash
# Despliega las reglas de seguridad
firebase deploy --only firestore:rules
```

### Error: "Unauthorized domain"
- Ve a Firebase Console
- Authentication → Settings → Authorized domains
- Agrega tu dominio

---

## 📊 Verificar Estado del Despliegue

### Ver proyectos:
```bash
firebase projects:list
```

### Ver estado del hosting:
```bash
firebase hosting:sites:list
```

### Ver reglas actuales:
```bash
firebase firestore:rules:list
```

---

## 🌐 URLs de Tu Aplicación

Después del despliegue, tu app estará disponible en:

- **Principal:** https://discipulapp-8d99c.web.app
- **Alternativa:** https://discipulapp-8d99c.firebaseapp.com

---

## 📝 Archivos Importantes

- `firebase.json` - Configuración de Firebase
- `.firebaserc` - Proyecto activo
- `firestore.rules` - Reglas de seguridad de Firestore
- `storage.rules` - Reglas de seguridad de Storage
- `.github/workflows/firebase-deploy.yml` - GitHub Actions (despliegue automático)

---

## 🎓 Para Más Ayuda

Lee la guía completa: **GUIA_CONFIGURACION_COMPLETA.md**

---

## 🚦 Estado Actual

Tu proyecto está configurado con:

- ✅ Firebase Firestore (base de datos)
- ✅ Firebase Storage (almacenamiento de archivos)
- ✅ Firebase Authentication (autenticación de usuarios)
- ✅ Firebase Hosting (hospedaje web)
- ✅ GitHub Actions (despliegue automático)

Solo necesitas completar la configuración en Firebase Console y desplegar. ¡Éxito! 🎉
