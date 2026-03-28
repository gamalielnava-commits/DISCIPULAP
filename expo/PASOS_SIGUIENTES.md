# 🎯 Pasos Siguientes - Configuración Completa

## ✅ Lo que ya está configurado

He configurado automáticamente:

1. ✅ **firebase.json** - Configurado para servir la carpeta `dist/`
2. ✅ **.firebaserc** - Apuntando al proyecto `iglesia-casa-de-dios-ed5b2`
3. ✅ **GitHub Actions** - Workflow automático con Node 20
4. ✅ **Scripts de despliegue** - Para Mac/Linux y Windows
5. ✅ **Scripts de verificación** - Para comprobar la configuración
6. ✅ **.gitignore** - Actualizado para no subir archivos innecesarios

---

## 🚀 Lo que DEBES hacer ahora (Paso a Paso)

### Paso 1: Actualizar Credenciales de Firebase

Tu archivo `.env` tiene credenciales del proyecto antiguo. Necesitas actualizarlas:

1. **Obtener las credenciales del proyecto correcto:**
   - Ve a: https://console.firebase.google.com/project/iglesia-casa-de-dios-ed5b2/settings/general
   - En "Tus apps", busca la app web o crea una nueva
   - Copia las credenciales

2. **Actualizar el archivo `.env`:**
   ```bash
   # Edita el archivo .env y reemplaza con las nuevas credenciales
   # Ver ACTUALIZAR_CREDENCIALES.md para más detalles
   ```

### Paso 2: Verificar la Configuración

Ejecuta el script de verificación:

**Mac/Linux:**
```bash
chmod +x verificar-configuracion.sh
./verificar-configuracion.sh
```

**Windows:**
```bash
verificar-configuracion.bat
```

Este script te dirá si falta algo.

### Paso 3: Instalar Firebase CLI (si no lo tienes)

```bash
npm install -g firebase-tools
firebase login
```

### Paso 4: Verificar que tienes acceso al proyecto

```bash
firebase projects:list
```

Debes ver `iglesia-casa-de-dios-ed5b2` en la lista.

### Paso 5: Hacer tu Primer Despliegue

**Opción A - Script Automático (Recomendado):**

Mac/Linux:
```bash
chmod +x deploy-to-firebase.sh
./deploy-to-firebase.sh
```

Windows:
```bash
deploy-to-firebase.bat
```

**Opción B - Comandos Manuales:**
```bash
# 1. Limpiar e instalar
rm -rf node_modules package-lock.json
npm install

# 2. Construir
npx expo export --platform web --output-dir dist

# 3. Desplegar
firebase deploy --only hosting --project iglesia-casa-de-dios-ed5b2
```

### Paso 6: Configurar GitHub Actions (Opcional pero Recomendado)

Para que el despliegue sea automático cada vez que hagas push:

1. **Ve a tu repositorio en GitHub**
   - Settings → Secrets and variables → Actions

2. **Agrega estos secrets:**
   - `EXPO_PUBLIC_FIREBASE_API_KEY`
   - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
   - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `EXPO_PUBLIC_FIREBASE_APP_ID`
   - `EXPO_PUBLIC_RORK_API_BASE_URL`

3. **Generar cuenta de servicio para Firebase:**
   ```bash
   # Ve a Firebase Console
   # Project Settings → Service Accounts → Generate new private key
   # Copia el contenido del JSON y agrégalo como secret:
   # FIREBASE_SERVICE_ACCOUNT
   ```

4. **Hacer push para probar:**
   ```bash
   git add .
   git commit -m "Configuración de despliegue automático"
   git push origin main
   ```

---

## 📋 Checklist Rápido

Marca cada paso cuando lo completes:

- [ ] Actualizar `.env` con credenciales de `iglesia-casa-de-dios-ed5b2`
- [ ] Ejecutar `verificar-configuracion.sh` o `.bat`
- [ ] Instalar Firebase CLI (`npm install -g firebase-tools`)
- [ ] Autenticar en Firebase (`firebase login`)
- [ ] Verificar acceso al proyecto (`firebase projects:list`)
- [ ] Hacer primer despliegue local (`./deploy-to-firebase.sh`)
- [ ] Configurar secrets en GitHub (opcional)
- [ ] Probar despliegue automático con push (opcional)

---

## 🌐 URLs Finales

Después del despliegue, tu app estará en:
- **Principal:** https://iglesia-casa-de-dios-ed5b2.web.app
- **Alternativa:** https://iglesia-casa-de-dios-ed5b2.firebaseapp.com

---

## 📚 Documentación Disponible

- **GUIA_DESPLIEGUE_FIREBASE.md** - Guía completa de despliegue
- **ACTUALIZAR_CREDENCIALES.md** - Cómo obtener y configurar credenciales
- **PASOS_SIGUIENTES.md** - Este archivo

---

## 🆘 ¿Necesitas Ayuda?

Si algo no funciona:

1. Ejecuta `./verificar-configuracion.sh` para ver qué falta
2. Revisa los logs de error
3. Consulta la documentación en los archivos .md
4. Verifica que las credenciales en `.env` sean correctas

---

## 🎉 ¡Listo!

Una vez completados estos pasos, tu aplicación se desplegará automáticamente cada vez que hagas push a `main`, o puedes desplegarla manualmente con el script.

**Siguiente paso:** Actualiza el archivo `.env` con las credenciales correctas y ejecuta `./verificar-configuracion.sh`
