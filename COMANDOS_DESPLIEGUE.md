# ⚡ Comandos Rápidos de Despliegue

## 🚀 Despliegue Completo (Una Línea)

### Mac/Linux:
```bash
chmod +x deploy-complete.sh && ./deploy-complete.sh
```

### Windows:
```batch
deploy-complete.bat
```

---

## 🔐 Solo Desplegar Reglas de Seguridad

### Mac/Linux:
```bash
chmod +x deploy-rules.sh && ./deploy-rules.sh
```

### Windows:
```batch
deploy-rules.bat
```

---

## 🔍 Verificar Configuración

### Mac/Linux:
```bash
chmod +x verificar-configuracion-firebase.sh && ./verificar-configuracion-firebase.sh
```

---

## 📦 Comandos Firebase Directos

```bash
# Ver proyectos
firebase projects:list

# Cambiar proyecto
firebase use discipulapp-8d99c

# Desplegar solo hosting
firebase deploy --only hosting

# Desplegar solo reglas de Firestore
firebase deploy --only firestore:rules

# Desplegar solo reglas de Storage
firebase deploy --only storage

# Desplegar todo
firebase deploy

# Ver estado del hosting
firebase hosting:sites:list

# Ver logs
firebase functions:log
```

---

## 🛠️ Comandos de Construcción

```bash
# Limpiar todo
rm -rf node_modules package-lock.json dist

# Instalar dependencias
npm install

# Construir para web
npx expo export --platform web --output-dir dist

# Ver contenido del build
ls -la dist
```

---

## 🔑 Primera Vez (Setup Inicial)

```bash
# 1. Instalar Firebase CLI
npm install -g firebase-tools

# 2. Iniciar sesión
firebase login

# 3. Seleccionar proyecto
firebase use discipulapp-8d99c

# 4. Desplegar reglas
firebase deploy --only firestore:rules
firebase deploy --only storage

# 5. Construir y desplegar app
npx expo export --platform web --output-dir dist
firebase deploy --only hosting
```

---

## 📋 Workflow Típico de Desarrollo

```bash
# 1. Hacer cambios en el código...

# 2. Probar localmente
npm start

# 3. Cuando estés listo para producción:
./deploy-complete.sh

# O usando GitHub Actions (después de configurar):
git add .
git commit -m "Descripción de cambios"
git push
# ¡Se desplegará automáticamente!
```

---

## 🐛 Comandos de Depuración

```bash
# Ver versión de Firebase CLI
firebase --version

# Ver información del proyecto
firebase projects:list

# Ver configuración actual
cat firebase.json
cat .firebaserc

# Verificar autenticación
firebase login:list

# Reiniciar autenticación
firebase logout
firebase login
```

---

## 🆘 Solución de Problemas Rápida

### "Firebase CLI not found"
```bash
npm install -g firebase-tools
```

### "Not authorized"
```bash
firebase logout
firebase login
```

### "Wrong project"
```bash
firebase use discipulapp-8d99c
```

### "Build failed"
```bash
rm -rf node_modules package-lock.json
npm install
npx expo export --platform web --output-dir dist
```

---

## 🌐 URLs Después del Despliegue

- **Producción:** https://discipulapp-8d99c.web.app
- **Alternativa:** https://discipulapp-8d99c.firebaseapp.com
- **Firebase Console:** https://console.firebase.google.com/project/discipulapp-8d99c

---

## ✅ Checklist Pre-Despliegue

Antes de desplegar, asegúrate de:

- [ ] Firebase CLI instalado (`firebase --version`)
- [ ] Autenticado en Firebase (`firebase login`)
- [ ] Proyecto correcto seleccionado (`firebase use discipulapp-8d99c`)
- [ ] Dependencias instaladas (`npm install`)
- [ ] Email/Password habilitado en Firebase Console
- [ ] Dominios autorizados configurados

---

## 🎯 Comando Todo-en-Uno (Copy-Paste)

Para Mac/Linux:
```bash
npm install -g firebase-tools && firebase login && firebase use discipulapp-8d99c && rm -rf node_modules package-lock.json && npm install && npx expo export --platform web --output-dir dist && firebase deploy --only firestore:rules,storage,hosting
```

Para Windows (PowerShell):
```powershell
npm install -g firebase-tools; firebase login; firebase use discipulapp-8d99c; if(Test-Path node_modules){Remove-Item -Recurse -Force node_modules}; if(Test-Path package-lock.json){Remove-Item package-lock.json}; npm install; npx expo export --platform web --output-dir dist; firebase deploy --only firestore:rules,storage,hosting
```

---

**💡 Tip:** Después de configurar GitHub Actions, solo necesitarás hacer `git push` y todo se desplegará automáticamente.

**📖 Más ayuda:** Lee `README_DESPLIEGUE.md` o `GUIA_CONFIGURACION_COMPLETA.md`
