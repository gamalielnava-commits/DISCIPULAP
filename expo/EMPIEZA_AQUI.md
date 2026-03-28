# 🚀 EMPIEZA AQUÍ - Configuración en 5 Minutos

## ✅ ¿Qué se ha configurado?

Tu proyecto Expo ahora tiene **despliegue automático a Firebase Hosting** completamente configurado.

---

## 🎯 Pasos para Empezar (5 minutos)

### Paso 1: Actualizar Credenciales (2 min)

1. Ve a Firebase Console:
   ```
   https://console.firebase.google.com/project/iglesia-casa-de-dios-ed5b2/settings/general
   ```

2. Copia las credenciales de tu app web

3. Edita el archivo `.env` y reemplaza con las nuevas credenciales:
   ```env
   EXPO_PUBLIC_FIREBASE_API_KEY=TU_API_KEY
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=iglesia-casa-de-dios-ed5b2.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=iglesia-casa-de-dios-ed5b2
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=iglesia-casa-de-dios-ed5b2.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=TU_SENDER_ID
   EXPO_PUBLIC_FIREBASE_APP_ID=TU_APP_ID
   ```

### Paso 2: Verificar Configuración (1 min)

**Mac/Linux:**
```bash
chmod +x verificar-configuracion.sh
./verificar-configuracion.sh
```

**Windows:**
```bash
verificar-configuracion.bat
```

### Paso 3: Desplegar (2 min)

**Mac/Linux:**
```bash
chmod +x deploy-to-firebase.sh
./deploy-to-firebase.sh
```

**Windows:**
```bash
deploy-to-firebase.bat
```

---

## 🎉 ¡Listo!

Tu app estará disponible en:
- https://iglesia-casa-de-dios-ed5b2.web.app

---

## 📚 Documentación Completa

Si necesitas más información:

| Documento | Para qué sirve |
|-----------|----------------|
| **[PASOS_SIGUIENTES.md](./PASOS_SIGUIENTES.md)** | Guía detallada paso a paso |
| **[ACTUALIZAR_CREDENCIALES.md](./ACTUALIZAR_CREDENCIALES.md)** | Cómo obtener y configurar credenciales |
| **[COMANDOS_RAPIDOS.md](./COMANDOS_RAPIDOS.md)** | Referencia rápida de comandos |
| **[GUIA_DESPLIEGUE_FIREBASE.md](./GUIA_DESPLIEGUE_FIREBASE.md)** | Guía completa de despliegue |
| **[INDICE_DOCUMENTACION.md](./INDICE_DOCUMENTACION.md)** | Índice de toda la documentación |

---

## ⚡ Despliegue Rápido (después de la configuración inicial)

Una vez configurado, solo necesitas:

```bash
git add .
git commit -m "Actualización"
git push origin main
```

GitHub Actions desplegará automáticamente. 🎉

---

## 🆘 ¿Problemas?

1. Ejecuta: `./verificar-configuracion.sh`
2. Lee: [GUIA_DESPLIEGUE_FIREBASE.md](./GUIA_DESPLIEGUE_FIREBASE.md) → "Solución de Problemas"
3. Verifica que las credenciales en `.env` sean correctas

---

## 📊 Resumen Visual

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO DE DESPLIEGUE                       │
└─────────────────────────────────────────────────────────────┘

1. Actualizar .env con credenciales correctas
   ↓
2. Ejecutar ./verificar-configuracion.sh
   ↓
3. Ejecutar ./deploy-to-firebase.sh
   ↓
4. ✅ App desplegada en Firebase Hosting
   ↓
5. Configurar GitHub Secrets (opcional)
   ↓
6. git push → Despliegue automático 🎉
```

---

## 🎯 Siguiente Paso

**Lee:** [PASOS_SIGUIENTES.md](./PASOS_SIGUIENTES.md) para instrucciones detalladas.

---

**¿Listo para empezar?** Actualiza el archivo `.env` y ejecuta `./verificar-configuracion.sh`
