# ⚡ Comandos Rápidos - Referencia

## 🚀 Despliegue

### Despliegue Automático (Recomendado)
```bash
git add .
git commit -m "Actualización"
git push origin main
```

### Despliegue Local - Script
```bash
# Mac/Linux
./deploy-to-firebase.sh

# Windows
deploy-to-firebase.bat
```

### Despliegue Local - Manual
```bash
rm -rf node_modules package-lock.json
npm install
npx expo export --platform web --output-dir dist
firebase deploy --only hosting --project iglesia-casa-de-dios-ed5b2
```

---

## 🔍 Verificación

### Verificar Configuración
```bash
# Mac/Linux
./verificar-configuracion.sh

# Windows
verificar-configuracion.bat
```

### Verificar Node.js
```bash
node --version
# Debe ser v20.x.x o superior
```

### Verificar Firebase CLI
```bash
firebase --version
firebase login
firebase projects:list
```

---

## 📦 Instalación y Dependencias

### Instalar Firebase CLI
```bash
npm install -g firebase-tools
```

### Instalar Dependencias del Proyecto
```bash
npm install
```

### Limpiar e Instalar
```bash
rm -rf node_modules package-lock.json
npm install
```

---

## 🏗️ Build

### Build Web
```bash
npx expo export --platform web --output-dir dist
```

### Build y Verificar
```bash
npx expo export --platform web --output-dir dist
ls -la dist/
```

---

## 🔥 Firebase

### Login
```bash
firebase login
```

### Listar Proyectos
```bash
firebase projects:list
```

### Desplegar Hosting
```bash
firebase deploy --only hosting
```

### Desplegar a Proyecto Específico
```bash
firebase deploy --only hosting --project iglesia-casa-de-dios-ed5b2
```

### Ver Logs
```bash
firebase hosting:channel:list
```

---

## 🧪 Desarrollo Local

### Iniciar Expo
```bash
npm start
```

### Iniciar en Web
```bash
npm run start-web
```

### Iniciar con Tunnel
```bash
npm run start
```

---

## 🐛 Solución de Problemas

### Limpiar Todo
```bash
rm -rf node_modules package-lock.json dist .expo
npm install
```

### Verificar Variables de Entorno
```bash
cat .env
```

### Ver Logs de Firebase
```bash
firebase deploy --only hosting --debug
```

### Verificar Proyecto Actual
```bash
firebase use
```

### Cambiar Proyecto
```bash
firebase use iglesia-casa-de-dios-ed5b2
```

---

## 📊 Git

### Estado
```bash
git status
```

### Agregar Cambios
```bash
git add .
```

### Commit
```bash
git commit -m "Descripción del cambio"
```

### Push
```bash
git push origin main
```

### Ver Historial
```bash
git log --oneline
```

---

## 🔐 GitHub Secrets (Configuración Única)

### Listar Secrets Necesarios
```
EXPO_PUBLIC_FIREBASE_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
EXPO_PUBLIC_FIREBASE_PROJECT_ID
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
EXPO_PUBLIC_FIREBASE_APP_ID
EXPO_PUBLIC_RORK_API_BASE_URL
FIREBASE_SERVICE_ACCOUNT
```

### Generar Service Account
1. Ve a: https://console.firebase.google.com/project/iglesia-casa-de-dios-ed5b2/settings/serviceaccounts/adminsdk
2. Click en "Generar nueva clave privada"
3. Copia el contenido del JSON
4. Agrégalo como secret `FIREBASE_SERVICE_ACCOUNT` en GitHub

---

## 🌐 URLs Útiles

### Aplicación
- https://iglesia-casa-de-dios-ed5b2.web.app
- https://iglesia-casa-de-dios-ed5b2.firebaseapp.com

### Firebase Console
- https://console.firebase.google.com/project/iglesia-casa-de-dios-ed5b2

### Firebase Hosting
- https://console.firebase.google.com/project/iglesia-casa-de-dios-ed5b2/hosting

### GitHub Actions
- https://github.com/TU_USUARIO/TU_REPO/actions

---

## 📝 Archivos Importantes

### Configuración
- `.env` - Variables de entorno
- `firebase.json` - Configuración de Firebase
- `.firebaserc` - Proyecto de Firebase
- `package.json` - Dependencias

### Scripts
- `deploy-to-firebase.sh` - Despliegue automático (Mac/Linux)
- `deploy-to-firebase.bat` - Despliegue automático (Windows)
- `verificar-configuracion.sh` - Verificación (Mac/Linux)
- `verificar-configuracion.bat` - Verificación (Windows)

### Documentación
- `GUIA_DESPLIEGUE_FIREBASE.md` - Guía completa
- `ACTUALIZAR_CREDENCIALES.md` - Configurar credenciales
- `PASOS_SIGUIENTES.md` - Qué hacer ahora
- `RESUMEN_CONFIGURACION.md` - Resumen de configuración
- `COMANDOS_RAPIDOS.md` - Este archivo

---

## 💡 Tips

### Hacer Cambios y Desplegar Rápido
```bash
# Edita tus archivos...
git add .
git commit -m "Cambios realizados"
git push origin main
# GitHub Actions desplegará automáticamente
```

### Desplegar Sin Esperar GitHub Actions
```bash
./deploy-to-firebase.sh
```

### Ver el Build Localmente Antes de Desplegar
```bash
npx expo export --platform web --output-dir dist
# Luego abre dist/index.html en el navegador
```

### Verificar que Todo Está Bien Antes de Desplegar
```bash
./verificar-configuracion.sh
```

---

## 🆘 Ayuda Rápida

### Error: "Firebase command not found"
```bash
npm install -g firebase-tools
```

### Error: "Not authorized"
```bash
firebase login
```

### Error: "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### Error: "dist folder not found"
```bash
npx expo export --platform web --output-dir dist
ls -la dist/
```

---

## 🎯 Flujo de Trabajo Típico

```bash
# 1. Hacer cambios en el código
# 2. Verificar que funciona localmente
npm start

# 3. Commit y push
git add .
git commit -m "Nueva funcionalidad"
git push origin main

# 4. GitHub Actions despliega automáticamente
# 5. Verificar en: https://iglesia-casa-de-dios-ed5b2.web.app
```

---

## 📞 Más Información

Ver documentación completa en:
- `GUIA_DESPLIEGUE_FIREBASE.md`
- `PASOS_SIGUIENTES.md`
