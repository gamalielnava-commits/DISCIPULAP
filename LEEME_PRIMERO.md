# 📖 LÉEME PRIMERO - DiscipulApp

## 🎯 Tu Aplicación Está Lista

Tu aplicación de discipulado ya está configurada y lista para usar. Solo necesitas completar 3 pasos simples para desplegarla.

---

## ⚡ Inicio Rápido (5 minutos)

### Paso 1: Habilitar Authentication en Firebase

1. Ve a https://console.firebase.google.com/
2. Selecciona tu proyecto: **discipulapp-8d99c**
3. Menu → **Authentication** → **Sign-in method**
4. Habilita **Email/Password**

### Paso 2: Configurar Dominios Autorizados

En la misma página de Authentication:
1. Ve a **Settings** (arriba)
2. Sección **Authorized domains**
3. Asegúrate que estén estos dominios:
   - `localhost`
   - `discipulapp-8d99c.web.app`
   - `discipulapp-8d99c.firebaseapp.com`

### Paso 3: Desplegar

**Opción A - Automático (Recomendado):**
1. Configura GitHub Actions (ver más abajo)
2. Haz `git push`
3. ¡Listo! Tu app se desplegará sola

**Opción B - Manual:**
```bash
# Mac/Linux
chmod +x deploy-complete.sh
./deploy-complete.sh

# Windows
deploy-complete.bat
```

**Tu app estará en:** https://discipulapp-8d99c.web.app

---

## 📚 Documentación Disponible

### Para Empezar:
1. **LEEME_PRIMERO.md** (este archivo) - Inicio rápido
2. **README_DESPLIEGUE.md** - Guía de despliegue simple
3. **COMANDOS_DESPLIEGUE.md** - Comandos copy-paste listos

### Para Configuración Detallada:
4. **GUIA_CONFIGURACION_COMPLETA.md** - Configuración paso a paso completa
5. **GUIA_SOLUCION_REGISTRO.md** - Solución de problemas de registro

### Scripts Automatizados:
- `deploy-complete.sh` / `deploy-complete.bat` - Despliegue completo
- `deploy-rules.sh` / `deploy-rules.bat` - Solo reglas de seguridad
- `verificar-configuracion-firebase.sh` - Verificar configuración

---

## 🚀 Configurar GitHub Actions (Despliegue Automático)

### ¿Qué es?
Cada vez que hagas `git push`, tu aplicación se desplegará automáticamente a Firebase Hosting.

### Cómo configurarlo:

1. **Obtén tu Service Account:**
   - Firebase Console → Proyecto discipulapp-8d99c
   - ⚙️ Settings → Service accounts
   - "Generate new private key" → Descargar JSON

2. **Configura el Secret en GitHub:**
   - Tu repo → Settings → Secrets and variables → Actions
   - "New repository secret"
   - Name: `FIREBASE_SERVICE_ACCOUNT`
   - Value: Pega el contenido del JSON completo
   - "Add secret"

3. **¡Listo! Pruébalo:**
   ```bash
   git add .
   git commit -m "Test deploy"
   git push
   ```
   
   Ve a GitHub → Actions para ver el progreso

---

## 🎓 ¿Qué Incluye Tu Aplicación?

### Funcionalidades:
- ✅ Sistema de autenticación (registro/login)
- ✅ Gestión de usuarios y roles
- ✅ Módulos de discipulado
- ✅ Grupos y asistencias
- ✅ Mensajes y anuncios
- ✅ Recursos y predicaciones
- ✅ Reportes y análisis
- ✅ Sistema de zonas

### Tecnologías:
- **Frontend:** React Native (Expo) - Funciona en web, iOS y Android
- **Backend:** Firebase (Firestore + Storage + Authentication)
- **Hosting:** Firebase Hosting
- **CI/CD:** GitHub Actions

---

## 🔐 Primer Usuario Administrador

Después de desplegar:

1. Ve a tu app: https://discipulapp-8d99c.web.app
2. Haz clic en "Crear cuenta"
3. Registra un usuario con cualquiera de estos emails:
   - `admin@gmail.com`
   - `admin@discipulapp.com`
4. Este usuario será **automáticamente administrador**

O usa las credenciales de prueba (modo local):
- Usuario: `admin`
- Contraseña: `Admin123`

---

## 🛠️ Comandos Útiles

```bash
# Ver todos los comandos disponibles
cat COMANDOS_DESPLIEGUE.md

# Verificar configuración
./verificar-configuracion-firebase.sh

# Desplegar todo
./deploy-complete.sh

# Solo desplegar reglas
./deploy-rules.sh

# Ver logs de Firebase
firebase functions:log
```

---

## 🐛 Problemas Comunes

### "Firebase CLI not found"
```bash
npm install -g firebase-tools
```

### "Email/Password authentication not enabled"
→ Completa el Paso 1 de Inicio Rápido

### "Unauthorized domain"
→ Completa el Paso 2 de Inicio Rápido

### "Permission denied" al registrar
```bash
firebase deploy --only firestore:rules
```

### Más problemas?
Lee: `GUIA_CONFIGURACION_COMPLETA.md` sección "Solución de Problemas"

---

## 📞 Verificación Rápida

```bash
# ¿Está Firebase CLI instalado?
firebase --version

# ¿Estoy autenticado?
firebase login:list

# ¿Qué proyecto tengo activo?
firebase use

# ¿Están mis archivos listos?
ls -la firebase.json firestore.rules storage.rules
```

---

## 🎯 Flujo de Trabajo Recomendado

### Desarrollo Local:
```bash
npm start  # Desarrollar y probar
```

### Desplegar a Producción:

**Opción 1 - Automático:**
```bash
git add .
git commit -m "Descripción de cambios"
git push  # Se despliega automáticamente
```

**Opción 2 - Manual:**
```bash
./deploy-complete.sh
```

---

## 📊 Archivos Importantes

- `firebaseConfig.ts` - Configuración de Firebase (público)
- `firebase.json` - Configuración de hosting/reglas
- `.firebaserc` - Proyecto activo
- `firestore.rules` - Reglas de seguridad de base de datos
- `storage.rules` - Reglas de seguridad de archivos
- `.github/workflows/firebase-deploy.yml` - GitHub Actions

**⚠️ NUNCA subas a Git:**
- Service Account Keys (archivos JSON privados)
- `.env` con credenciales

---

## ✨ Siguientes Pasos

1. [ ] Completa los 3 pasos de Inicio Rápido
2. [ ] Despliega tu aplicación
3. [ ] Crea tu usuario administrador
4. [ ] Configura GitHub Actions (opcional pero recomendado)
5. [ ] Personaliza tu aplicación

---

## 🌐 Enlaces Importantes

- **App Producción:** https://discipulapp-8d99c.web.app
- **Firebase Console:** https://console.firebase.google.com/project/discipulapp-8d99c
- **GitHub Actions:** Tu repo → Actions

---

## 💡 Tips Pro

1. **Usa GitHub Actions** - Despliega automáticamente con cada push
2. **Haz commits frecuentes** - Fácil rollback si algo sale mal
3. **Prueba localmente primero** - `npm start` antes de desplegar
4. **Monitorea Firebase Console** - Authentication, Firestore, Storage
5. **Revisa los logs** - `firebase functions:log` para errores

---

## 🎉 ¡Listo!

Tu aplicación está configurada y lista. Solo sigue los 3 pasos de Inicio Rápido y estarás en producción en menos de 5 minutos.

**¿Dudas?** Lee los archivos de documentación en orden:
1. README_DESPLIEGUE.md
2. COMANDOS_DESPLIEGUE.md
3. GUIA_CONFIGURACION_COMPLETA.md

**¡Éxito con tu aplicación de discipulado! 🚀**
