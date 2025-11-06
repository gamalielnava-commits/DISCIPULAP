# 🔧 Guía de Solución: Problemas de Registro en Firebase

## ⚠️ Problema Principal

Los usuarios no pueden registrarse en la aplicación. El error más común es:
```
auth/operation-not-allowed
```

---

## ✅ Solución Paso a Paso

### Paso 1: Habilitar Email/Password en Firebase Console

**ESTE ES EL PASO MÁS IMPORTANTE** ⭐

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **discipulapp-8d99c**
3. En el menú lateral, haz clic en **Authentication**
4. Haz clic en la pestaña **Sign-in method**
5. Busca **Email/Password** en la lista
6. Haz clic en **Email/Password**
7. **Activa el interruptor** para habilitar este método
8. Haz clic en **Guardar**

**Captura de pantalla de referencia:**
```
┌─────────────────────────────────────────────┐
│ Sign-in providers                            │
├─────────────────────────────────────────────┤
│ Email/Password         [●] Enabled           │
│ Google                 [○] Disabled          │
│ Facebook               [○] Disabled          │
│ Twitter                [○] Disabled          │
└─────────────────────────────────────────────┘
```

---

### Paso 2: Verificar Dominios Autorizados

1. En Firebase Console, ve a **Authentication** → **Settings**
2. Desplázate hasta **Authorized domains**
3. Verifica que estos dominios estén en la lista:
   - `localhost` (para desarrollo local)
   - `discipulapp.org` (tu dominio de producción)
   - `*.netlify.app` (si usas Netlify)
   - `*.firebaseapp.com` (dominio de Firebase)

4. Si falta algún dominio, haz clic en **Add domain** y agrégalo

---

### Paso 3: Desplegar Reglas de Firestore

Las reglas ya están actualizadas en tu código, pero necesitas desplegarlas a Firebase.

#### Opción A: Usando Firebase CLI (Recomendado)

```bash
# 1. Instalar Firebase CLI (si no lo tienes)
npm install -g firebase-tools

# 2. Autenticarte en Firebase
firebase login

# 3. Desplegar las reglas
firebase deploy --only firestore:rules
firebase deploy --only storage
```

#### Opción B: Desde Firebase Console

1. Ve a **Firestore Database** → **Rules**
2. Copia el contenido del archivo `firestore.rules` de tu proyecto
3. Pégalo en el editor de Firebase Console
4. Haz clic en **Publicar**

---

### Paso 4: Verificar Configuración de Firebase

Verifica que tu archivo `.env` tenga la configuración correcta:

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_WEB_API_KEY
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=discipulapp-8d99c.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=discipulapp-8d99c
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=discipulapp-8d99c.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=144673796951
EXPO_PUBLIC_FIREBASE_APP_ID=1:144673796951:web:9cd9e632474fb9dedcc412
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-65VZ57LGFH
```

✅ Tu configuración es correcta

---

### Paso 5: Probar el Registro

1. **Reinicia la aplicación** (cierra y vuelve a abrir)
2. Ve a la pantalla de **Registro**
3. Completa el formulario con estos datos de prueba:
   ```
   Nombre: Test
   Apellido: Usuario
   Email: test@example.com
   Contraseña: Test123456
   Fecha de nacimiento: 01/01/1990
   ```
4. Haz clic en **Registrarse**
5. Si ves el mensaje "¡Registro Exitoso!", el problema está resuelto ✅

---

## 🔍 Verificación de Errores

### Si ves este error:
```
"El registro está deshabilitado. Por favor, contacta al administrador..."
```
**Solución:** Completa el **Paso 1** (Habilitar Email/Password)

---

### Si ves este error:
```
"Dominio no autorizado..."
```
**Solución:** Completa el **Paso 2** (Agregar dominios autorizados)

---

### Si ves este error:
```
"permission-denied"
```
**Solución:** Completa el **Paso 3** (Desplegar reglas de Firestore)

---

### Si ves este error:
```
"Este correo electrónico ya está registrado..."
```
**Solución:** Usa otro email o intenta iniciar sesión con ese email

---

## 🎯 Verificar que Todo Funciona

### 1. Registro de Usuario Nuevo
- [ ] Puedes acceder a la pantalla de registro
- [ ] Puedes completar el formulario
- [ ] El registro se completa sin errores
- [ ] Ves el mensaje de éxito
- [ ] Eres redirigido a la pantalla de login

### 2. Inicio de Sesión
- [ ] Puedes iniciar sesión con el usuario recién creado
- [ ] Ves la pantalla principal de la app
- [ ] Tu nombre aparece en el perfil

### 3. Permisos de Administrador
Si eres administrador:
- [ ] Puedes crear mensajes
- [ ] Puedes editar módulos
- [ ] Puedes ver la lista de usuarios
- [ ] Puedes gestionar grupos

---

## 📊 Logs de Debugging

Para ver los logs detallados del registro, abre la consola del navegador (F12) y busca:

```
🔥 Registrando usuario en Firebase: [email]
📋 Datos del usuario: {...}
✅ Usuario registrado exitosamente en Firebase
```

Si ves un error, busca:
```
❌ Error en registro: [error]
📝 Error code: [código]
📝 Error message: [mensaje]
```

---

## 🚀 Comandos Útiles

```bash
# Ver logs de Firebase
firebase functions:log

# Ver reglas actuales
firebase firestore:rules:get

# Desplegar todo
firebase deploy

# Desplegar solo reglas
firebase deploy --only firestore:rules,storage

# Ver usuarios registrados
firebase auth:export users.json
```

---

## 📝 Notas Importantes

1. **Tiempo de Propagación:**
   - Después de habilitar Email/Password, espera 1-2 minutos
   - Después de desplegar reglas, espera 1-2 minutos
   - Refresca la página o reinicia la app

2. **Modo Local vs Firebase:**
   - Si Firebase no está configurado, la app funciona en modo local
   - En modo local, los datos se guardan en AsyncStorage
   - En modo Firebase, los datos se sincronizan con Firestore

3. **Primer Usuario:**
   - El primer usuario que se registra es automáticamente admin
   - Los usuarios con email `admin@gmail.com` o `admin@discipulapp.com` son admin

4. **Seguridad:**
   - Las contraseñas deben tener al menos 6 caracteres
   - Los emails deben ser válidos
   - Los usuarios solo pueden crear su propio perfil

---

## 🆘 ¿Aún Tienes Problemas?

Si después de seguir todos estos pasos sigues teniendo problemas:

1. **Verifica los logs:**
   - Abre la consola del navegador (F12)
   - Busca mensajes de error en rojo
   - Copia el error completo

2. **Verifica Firebase Console:**
   - Ve a **Authentication** → **Users**
   - Verifica si el usuario se creó
   - Ve a **Firestore Database** → **users**
   - Verifica si el documento del usuario existe

3. **Reinicia todo:**
   ```bash
   # Detener la app
   # Limpiar caché
   npm run clean
   # Reinstalar dependencias
   npm install
   # Reiniciar la app
   npm start
   ```

4. **Contacta al soporte:**
   - Proporciona los logs de error
   - Proporciona capturas de pantalla
   - Describe los pasos que seguiste

---

## ✅ Checklist Final

Antes de considerar que el problema está resuelto, verifica:

- [ ] Email/Password está habilitado en Firebase Console
- [ ] Los dominios están autorizados en Firebase Console
- [ ] Las reglas de Firestore están desplegadas
- [ ] Las reglas de Storage están desplegadas
- [ ] La configuración de Firebase es correcta en `.env`
- [ ] Puedes registrar un nuevo usuario sin errores
- [ ] Puedes iniciar sesión con el usuario registrado
- [ ] El usuario aparece en Firebase Console → Authentication
- [ ] El perfil del usuario aparece en Firestore → users

---

**Última actualización:** 2025-10-12  
**Versión:** 1.0  
**Estado:** ✅ Listo para usar
