# 🔥 Configuración de Firebase - Guía Completa

## 📚 Documentación Disponible

Este proyecto incluye documentación completa para configurar y solucionar problemas de Firebase:

### 🚀 Para Empezar Rápido
- **[RESUMEN_SOLUCION_RAPIDA.md](./RESUMEN_SOLUCION_RAPIDA.md)** - Solución en 3 pasos (6 minutos)
  - Habilitar Email/Password
  - Verificar dominios
  - Desplegar reglas

### 📖 Guías Detalladas
- **[GUIA_SOLUCION_REGISTRO.md](./GUIA_SOLUCION_REGISTRO.md)** - Guía paso a paso completa
  - Configuración de Firebase Console
  - Despliegue de reglas
  - Pruebas y verificación
  - Solución de problemas comunes

### 🔍 Análisis Técnico
- **[ANALISIS_ERRORES_FIREBASE.md](./ANALISIS_ERRORES_FIREBASE.md)** - Análisis técnico detallado
  - Problemas identificados
  - Causas raíz
  - Soluciones técnicas
  - Código de ejemplo

### ✅ Herramientas
- **[CHECKLIST_FIREBASE.md](./CHECKLIST_FIREBASE.md)** - Checklist completo
  - Configuración de Firebase Console
  - Configuración local
  - Pruebas
  - Métricas de éxito

- **[verificar-firebase.js](./verificar-firebase.js)** - Script de verificación
  - Verifica configuración automáticamente
  - Detecta errores comunes
  - Proporciona recomendaciones

---

## 🎯 Problema Principal

**Los usuarios no pueden registrarse en la aplicación.**

Error común:
```
auth/operation-not-allowed
```

---

## ⚡ Solución Rápida (6 minutos)

### 1. Habilitar Email/Password en Firebase Console (2 min)

1. Ve a https://console.firebase.google.com/
2. Selecciona proyecto: **discipulapp-8d99c**
3. **Authentication** → **Sign-in method**
4. Habilita **Email/Password**
5. Guarda

### 2. Verificar Dominios Autorizados (1 min)

1. **Authentication** → **Settings** → **Authorized domains**
2. Verifica que estén:
   - `localhost`
   - `discipulapp.org`
   - `*.netlify.app`

### 3. Desplegar Reglas (3 min)

```bash
firebase login
firebase deploy --only firestore:rules
firebase deploy --only storage
```

---

## 🧪 Verificar que Funciona

```bash
# 1. Ejecutar script de verificación
node verificar-firebase.js

# 2. Reiniciar la app
npm start

# 3. Probar registro
# - Ve a /register
# - Completa el formulario
# - Haz clic en Registrarse
# - Deberías ver: "¡Registro Exitoso!" ✅
```

---

## 📋 Checklist Rápido

- [ ] Email/Password habilitado en Firebase Console
- [ ] Dominios autorizados configurados
- [ ] Reglas de Firestore desplegadas
- [ ] Reglas de Storage desplegadas
- [ ] Script de verificación ejecutado sin errores
- [ ] Registro de usuario funciona correctamente

---

## 🔧 Comandos Útiles

```bash
# Verificar configuración
node verificar-firebase.js

# Autenticarse en Firebase
firebase login

# Desplegar reglas
firebase deploy --only firestore:rules,storage

# Ver reglas actuales
firebase firestore:rules:get

# Ver usuarios registrados
firebase auth:export users.json

# Ver logs
firebase functions:log
```

---

## 📊 Estructura de Archivos

```
proyecto/
├── firebaseConfig.ts           # Configuración de Firebase
├── .env                        # Variables de entorno
├── firestore.rules             # Reglas de Firestore
├── storage.rules               # Reglas de Storage
├── firebase.json               # Configuración de Firebase CLI
│
├── hooks/
│   └── useFirebaseAuth.ts      # Hook de autenticación
│
├── services/
│   └── firebase.ts             # Servicios de Firebase
│
├── app/
│   ├── register.tsx            # Pantalla de registro
│   └── login.tsx               # Pantalla de login
│
└── docs/                       # Documentación
    ├── RESUMEN_SOLUCION_RAPIDA.md
    ├── GUIA_SOLUCION_REGISTRO.md
    ├── ANALISIS_ERRORES_FIREBASE.md
    ├── CHECKLIST_FIREBASE.md
    └── verificar-firebase.js
```

---

## 🐛 Errores Comunes

### Error: "auth/operation-not-allowed"
**Causa:** Email/Password no está habilitado  
**Solución:** Habilitar en Firebase Console → Authentication → Sign-in method

### Error: "auth/unauthorized-domain"
**Causa:** Dominio no autorizado  
**Solución:** Agregar dominio en Firebase Console → Authentication → Settings

### Error: "permission-denied"
**Causa:** Reglas de Firestore no desplegadas  
**Solución:** `firebase deploy --only firestore:rules`

### Error: "auth/email-already-in-use"
**Causa:** Email ya registrado  
**Solución:** Usar otro email o iniciar sesión

---

## 📞 Soporte

### Documentación
- **Solución rápida:** RESUMEN_SOLUCION_RAPIDA.md
- **Guía completa:** GUIA_SOLUCION_REGISTRO.md
- **Análisis técnico:** ANALISIS_ERRORES_FIREBASE.md

### Herramientas
- **Verificación:** `node verificar-firebase.js`
- **Checklist:** CHECKLIST_FIREBASE.md

### Logs
- **Consola del navegador:** F12 → Console
- **Firebase Console:** https://console.firebase.google.com/
- **Logs de Firebase:** `firebase functions:log`

---

## 🎓 Recursos Adicionales

### Firebase Documentation
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Storage Security Rules](https://firebase.google.com/docs/storage/security)

### Tutoriales
- [Getting Started with Firebase](https://firebase.google.com/docs/web/setup)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

---

## 📝 Notas Importantes

1. **Modo Local vs Firebase:**
   - Si Firebase no está configurado, la app funciona en modo local
   - Los datos locales se guardan en AsyncStorage
   - Los datos de Firebase se sincronizan con Firestore

2. **Primer Usuario:**
   - El primer usuario registrado es automáticamente admin
   - Usuarios con email `admin@gmail.com` o `admin@discipulapp.com` son admin

3. **Seguridad:**
   - Las contraseñas deben tener al menos 6 caracteres
   - Los emails deben ser válidos
   - Las reglas de Firestore protegen los datos

4. **Tiempo de Propagación:**
   - Después de cambios en Firebase Console, espera 1-2 minutos
   - Después de desplegar reglas, espera 1-2 minutos
   - Refresca la página o reinicia la app

---

## ✅ Estado del Proyecto

### Configuración Actual
- ✅ Firebase configurado correctamente
- ✅ Variables de entorno configuradas
- ✅ Reglas de Firestore actualizadas
- ✅ Reglas de Storage actualizadas
- ✅ Manejo de errores mejorado
- ✅ Logs detallados implementados
- ✅ Documentación completa

### Pendiente
- ⏳ Habilitar Email/Password en Firebase Console
- ⏳ Desplegar reglas a Firebase
- ⏳ Verificar dominios autorizados
- ⏳ Probar registro de usuarios

---

## 🚀 Próximos Pasos

1. **Inmediato (Hoy):**
   - [ ] Habilitar Email/Password en Firebase Console
   - [ ] Desplegar reglas de Firestore y Storage
   - [ ] Probar registro de un usuario

2. **Corto Plazo (Esta Semana):**
   - [ ] Verificar que todos los usuarios pueden registrarse
   - [ ] Configurar permisos de administrador
   - [ ] Probar todas las funcionalidades

3. **Largo Plazo (Este Mes):**
   - [ ] Implementar verificación de email (opcional)
   - [ ] Agregar autenticación con Google/Facebook
   - [ ] Optimizar reglas de seguridad

---

## 📅 Historial de Cambios

### 2025-10-12
- ✅ Creada documentación completa
- ✅ Actualizado manejo de errores en registro
- ✅ Agregado script de verificación
- ✅ Creado checklist de configuración
- ✅ Mejorados logs de debugging

---

## 👥 Contribuidores

- **Desarrollador Principal:** [Tu nombre]
- **Última actualización:** 2025-10-12
- **Versión:** 1.0

---

## 📄 Licencia

[Tu licencia aquí]

---

**¿Necesitas ayuda?** Lee la documentación o ejecuta `node verificar-firebase.js` para diagnosticar problemas.
