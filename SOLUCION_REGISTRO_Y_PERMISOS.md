# Solución: Problemas de Registro y Permisos de Administrador

## Problemas Identificados

### 1. No se pueden registrar nuevos usuarios
**Causa**: Las reglas de Firestore no permitían que los usuarios crearan su propio perfil durante el registro.

**Síntoma**: Al intentar registrarse, el usuario recibe un error de permisos insuficientes.

### 2. El administrador no tiene permisos de administrador
**Causa**: El perfil del usuario en Firestore no tiene el rol 'admin' correctamente asignado.

**Síntoma**: El usuario administrador no puede crear/editar mensajes, módulos, u otros recursos que requieren permisos de admin.

---

## Solución Implementada

### Paso 1: Actualización de Reglas de Firestore ✅

He actualizado las reglas de Firestore para permitir que los usuarios creen su propio perfil durante el registro:

**Antes:**
```javascript
match /users/{userId} {
  allow read: if isAuthenticated();
  allow write: if isOwner(userId) || isAdmin();
}
```

**Después:**
```javascript
match /users/{userId} {
  allow read: if isAuthenticated();
  // Allow users to create their own profile during registration
  allow create: if isAuthenticated() && request.auth.uid == userId;
  // Allow users to update their own profile or admins to update any profile
  allow update: if isOwner(userId) || isAdmin();
  // Only admins can delete users
  allow delete: if isAdmin();
}
```

### Paso 2: Desplegar las Nuevas Reglas a Firebase

**IMPORTANTE**: Debes desplegar estas reglas actualizadas a Firebase para que funcionen.

#### Opción A: Usando Firebase CLI (Recomendado)

1. **Instalar Firebase CLI** (si no lo tienes):
   ```bash
   npm install -g firebase-tools
   ```

2. **Autenticarte en Firebase**:
   ```bash
   firebase login
   ```

3. **Desplegar las reglas**:
   ```bash
   chmod +x deploy-firebase-rules.sh
   ./deploy-firebase-rules.sh
   ```

   O manualmente:
   ```bash
   firebase deploy --only firestore:rules
   firebase deploy --only storage
   ```

#### Opción B: Desde la Consola de Firebase

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **discipulapp-8d99c**
3. Ve a **Firestore Database** → **Rules**
4. Copia y pega el contenido del archivo `firestore.rules`
5. Haz clic en **Publicar**
6. Repite para **Storage** → **Rules** con el archivo `storage.rules`

---

## Paso 3: Verificar y Corregir el Rol del Administrador

### Opción A: Usando el Script de Node.js

He creado un script para actualizar el rol del administrador. Ejecuta:

```bash
node updateAdminRole.js
```

Este script:
- Busca al usuario con email `admin@gmail.com` o `admin@discipulapp.com`
- Actualiza su rol a 'admin'
- Verifica que el cambio se aplicó correctamente

### Opción B: Manualmente desde Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **discipulapp-8d99c**
3. Ve a **Firestore Database**
4. Busca la colección `users`
5. Encuentra el documento del usuario administrador
6. Edita el campo `role` y cámbialo a `'admin'`
7. Guarda los cambios

### Opción C: Crear un Nuevo Usuario Administrador

Si prefieres crear un nuevo usuario administrador desde cero:

```bash
node createAdmin.js
```

Este script creará un usuario con:
- Email: `admin@discipulapp.com`
- Contraseña: `admin123`
- Rol: `admin`

---

## Verificación

### 1. Verificar que las reglas se desplegaron correctamente

```bash
firebase firestore:rules:get
```

Deberías ver las reglas actualizadas con `allow create`, `allow update`, y `allow delete` separados.

### 2. Verificar el rol del administrador

1. Inicia sesión en la app con tu cuenta de administrador
2. Ve a la sección de **Mensajes** o **Módulos**
3. Intenta crear un nuevo mensaje o módulo
4. Si puedes crear/editar, ¡el problema está resuelto! ✅

### 3. Probar el registro de nuevos usuarios

1. Cierra sesión
2. Ve a la pantalla de registro
3. Completa el formulario con un nuevo usuario
4. Intenta registrarte
5. Si el registro es exitoso, ¡el problema está resuelto! ✅

---

## Solución de Problemas

### Error: "permission-denied" al registrarse

**Causa**: Las reglas de Firestore no se han desplegado correctamente.

**Solución**:
1. Verifica que desplegaste las reglas: `firebase deploy --only firestore:rules`
2. Espera 1-2 minutos para que los cambios se propaguen
3. Intenta registrarte nuevamente

### Error: "El administrador no puede crear mensajes"

**Causa**: El campo `role` en Firestore no está configurado como `'admin'`.

**Solución**:
1. Ejecuta `node updateAdminRole.js`
2. O actualiza manualmente el campo `role` en Firebase Console
3. Cierra sesión y vuelve a iniciar sesión
4. Verifica que el rol se actualizó correctamente

### Error: "Firebase CLI no está instalado"

**Solución**:
```bash
npm install -g firebase-tools
firebase login
```

---

## Emails de Administrador Reconocidos

El sistema reconoce automáticamente estos emails como administradores:
- `admin@gmail.com`
- `admin@discipulapp.com`

Cuando un usuario con uno de estos emails se registra o inicia sesión, automáticamente se le asigna el rol de `admin`.

---

## Resumen de Cambios

✅ **Reglas de Firestore actualizadas** para permitir registro de usuarios
✅ **Separación de permisos** (create, update, delete) para mayor seguridad
✅ **Scripts de utilidad** para actualizar roles de administrador
✅ **Documentación completa** de solución de problemas

---

## Próximos Pasos

1. **Desplegar las reglas actualizadas** a Firebase
2. **Verificar el rol del administrador** en Firestore
3. **Probar el registro** de un nuevo usuario
4. **Probar la creación de mensajes/módulos** con el administrador

Si sigues teniendo problemas después de seguir estos pasos, revisa los logs de la consola del navegador o de la app para obtener más detalles sobre el error específico.
