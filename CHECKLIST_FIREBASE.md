# ✅ Checklist de Configuración de Firebase

## 📋 Antes de Empezar

- [ ] Tengo acceso a Firebase Console
- [ ] Tengo el proyecto **discipulapp-8d99c** seleccionado
- [ ] Tengo Firebase CLI instalado (`npm install -g firebase-tools`)
- [ ] Estoy autenticado en Firebase CLI (`firebase login`)

---

## 🔥 Configuración de Firebase Console

### Authentication

- [ ] **Email/Password está habilitado**
  - Ubicación: Authentication → Sign-in method
  - Estado: **Enabled** ✅
  - Verificación de email: **Disabled** (para desarrollo)

- [ ] **Dominios autorizados configurados**
  - Ubicación: Authentication → Settings → Authorized domains
  - Dominios requeridos:
    - [ ] `localhost`
    - [ ] `discipulapp.org`
    - [ ] `*.netlify.app`
    - [ ] `*.firebaseapp.com`

### Firestore Database

- [ ] **Base de datos creada**
  - Ubicación: Firestore Database
  - Modo: **Production** (con reglas de seguridad)

- [ ] **Reglas desplegadas**
  - Ubicación: Firestore Database → Rules
  - Última actualización: [Fecha]
  - Contiene: `allow create`, `allow update`, `allow delete`

- [ ] **Colecciones creadas**
  - [ ] `users` - Perfiles de usuarios
  - [ ] `groups` - Grupos de discipulado
  - [ ] `attendance` - Asistencias
  - [ ] `resources` - Recursos
  - [ ] `announcements` - Anuncios

### Storage

- [ ] **Storage habilitado**
  - Ubicación: Storage
  - Bucket: `discipulapp-8d99c.appspot.com`

- [ ] **Reglas desplegadas**
  - Ubicación: Storage → Rules
  - Última actualización: [Fecha]
  - Requiere autenticación: ✅

---

## 💻 Configuración Local

### Archivos de Configuración

- [ ] **`.env` configurado**
  - [ ] `EXPO_PUBLIC_FIREBASE_API_KEY`
  - [ ] `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - [ ] `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
  - [ ] `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - [ ] `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - [ ] `EXPO_PUBLIC_FIREBASE_APP_ID`
  - [ ] `EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID`

- [ ] **`firebaseConfig.ts` correcto**
  - [ ] Importa variables de entorno
  - [ ] Inicializa Firebase
  - [ ] Exporta `db`, `storage`, `auth`
  - [ ] Define `IS_FIREBASE_CONFIGURED`

- [ ] **`firestore.rules` actualizado**
  - [ ] Tiene reglas para `users`
  - [ ] Tiene reglas para `groups`
  - [ ] Tiene reglas para otras colecciones
  - [ ] Usa `allow create`, `allow update`, `allow delete`

- [ ] **`storage.rules` actualizado**
  - [ ] Requiere autenticación
  - [ ] Tiene reglas para diferentes carpetas

### Código de la Aplicación

- [ ] **`hooks/useFirebaseAuth.ts`**
  - [ ] Maneja `auth/operation-not-allowed`
  - [ ] Maneja `auth/email-already-in-use`
  - [ ] Maneja `auth/weak-password`
  - [ ] Maneja `auth/invalid-email`
  - [ ] Maneja `auth/network-request-failed`
  - [ ] Maneja `auth/unauthorized-domain`
  - [ ] Logs detallados con emojis

- [ ] **`services/firebase.ts`**
  - [ ] `REQUIRE_EMAIL_VERIFICATION = false`
  - [ ] Métodos `signUp`, `signIn`, `signOut`
  - [ ] Métodos para Firestore
  - [ ] Métodos para Storage

- [ ] **`app/register.tsx`**
  - [ ] Validación de campos
  - [ ] Validación de email
  - [ ] Validación de contraseña
  - [ ] Muestra errores claros
  - [ ] Redirige después del registro

---

## 🚀 Despliegue

### Reglas de Firebase

- [ ] **Desplegar reglas de Firestore**
  ```bash
  firebase deploy --only firestore:rules
  ```
  - Resultado: ✅ Deploy complete!

- [ ] **Desplegar reglas de Storage**
  ```bash
  firebase deploy --only storage
  ```
  - Resultado: ✅ Deploy complete!

### Verificación

- [ ] **Verificar reglas desplegadas**
  ```bash
  firebase firestore:rules:get
  ```
  - Muestra las reglas actualizadas

- [ ] **Verificar configuración**
  ```bash
  node verificar-firebase.js
  ```
  - 0 errores
  - 0 advertencias (o solo advertencias menores)

---

## 🧪 Pruebas

### Registro de Usuario

- [ ] **Abrir pantalla de registro**
  - Ruta: `/register`
  - Se carga correctamente

- [ ] **Completar formulario**
  - Nombre: Test
  - Apellido: Usuario
  - Email: test@example.com
  - Contraseña: Test123456
  - Fecha de nacimiento: 01/01/1990

- [ ] **Hacer clic en Registrarse**
  - No hay errores en consola
  - Muestra mensaje de éxito
  - Redirige a login

- [ ] **Verificar en Firebase Console**
  - Authentication → Users
  - Usuario aparece en la lista
  - Email: test@example.com

- [ ] **Verificar en Firestore**
  - Firestore Database → users
  - Documento del usuario existe
  - Campos: nombre, apellido, email, role, status

### Inicio de Sesión

- [ ] **Iniciar sesión con usuario registrado**
  - Email: test@example.com
  - Contraseña: Test123456
  - Login exitoso

- [ ] **Verificar sesión**
  - Usuario autenticado
  - Nombre aparece en perfil
  - Puede navegar por la app

### Permisos de Administrador

- [ ] **Crear usuario administrador**
  - Email: admin@discipulapp.com
  - Contraseña: admin123
  - Rol: admin

- [ ] **Verificar permisos de admin**
  - Puede crear mensajes
  - Puede editar módulos
  - Puede ver usuarios
  - Puede gestionar grupos

---

## 🔍 Debugging

### Logs de Consola

- [ ] **Registro exitoso muestra:**
  ```
  🔥 Registrando usuario en Firebase: [email]
  📋 Datos del usuario: {...}
  ✅ Usuario registrado exitosamente en Firebase
  ```

- [ ] **Error muestra:**
  ```
  ❌ Error en registro: [error]
  📝 Error code: [código]
  📝 Error message: [mensaje]
  ```

### Firebase Console

- [ ] **Authentication → Users**
  - Lista de usuarios registrados
  - Emails correctos
  - Fechas de creación

- [ ] **Firestore Database → users**
  - Documentos de usuarios
  - Campos completos
  - Roles correctos

---

## 📊 Métricas de Éxito

- [ ] **Tasa de registro exitoso: 100%**
  - Todos los registros se completan sin errores

- [ ] **Tasa de login exitoso: 100%**
  - Todos los logins se completan sin errores

- [ ] **Tiempo de respuesta: < 2 segundos**
  - Registro completa en menos de 2 segundos
  - Login completa en menos de 2 segundos

- [ ] **Errores en producción: 0**
  - No hay errores de configuración
  - No hay errores de permisos
  - No hay errores de red

---

## 🎯 Estado Final

### ✅ Todo Correcto

Si todos los checkboxes están marcados:
- 🎉 ¡Felicidades! La configuración está completa
- 🚀 La app está lista para producción
- 📱 Los usuarios pueden registrarse sin problemas

### ⚠️ Hay Advertencias

Si hay algunos checkboxes sin marcar:
- 📝 Revisa las advertencias
- 🔧 Corrige los problemas menores
- ✅ Vuelve a verificar

### ❌ Hay Errores

Si hay muchos checkboxes sin marcar:
- 📚 Lee GUIA_SOLUCION_REGISTRO.md
- 🔍 Ejecuta node verificar-firebase.js
- 💬 Contacta al soporte si es necesario

---

## 📅 Historial de Verificación

| Fecha | Verificado por | Estado | Notas |
|-------|---------------|--------|-------|
| 2025-10-12 | [Tu nombre] | ⏳ Pendiente | Configuración inicial |
| | | | |
| | | | |

---

## 📞 Contacto y Soporte

- **Documentación:** Ver archivos .md en el proyecto
- **Logs:** Consola del navegador (F12)
- **Firebase Console:** https://console.firebase.google.com/
- **Soporte:** [Tu email o canal de soporte]

---

**Última actualización:** 2025-10-12  
**Versión:** 1.0  
**Mantenido por:** [Tu nombre]
