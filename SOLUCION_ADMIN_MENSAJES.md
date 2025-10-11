# Solución: Admin aparece como Miembro y Mensajes en Blanco

## Problemas Identificados

### 1. Usuario admin aparece como "miembro" en vez de "administrador"
**Causa**: El usuario en Firestore tiene `role: 'miembro'` en vez de `role: 'admin'`

### 2. Página de mensajes sale en blanco
**Causa**: La verificación de admin usaba `user?.email === "admin@example.com"` pero el email real es `admin@discipulapp.com`

## Cambios Realizados

### 1. Actualización de `app/(tabs)/mensajes.tsx`
- **Línea 65**: Cambió de `user?.email === "admin@example.com"` a `user?.role === 'admin'`
- Ahora verifica el rol del usuario en vez del email específico

### 2. Actualización de `services/firebase.ts`
- **Línea 85**: Agregó `admin@discipulapp.com` como email de admin por defecto
- **Línea 114**: Cambió la búsqueda del admin de `admin@gmail.com` a `admin@discipulapp.com`
- **Línea 128**: Cambió las credenciales por defecto a `admin@discipulapp.com` / `admin123`

### 3. Creación de script `updateAdminRole.js`
Script para actualizar el rol del usuario admin existente en Firestore

## Solución Paso a Paso

### Opción 1: Actualizar el rol del usuario existente (RECOMENDADO)

1. **Ejecutar el script de actualización**:
   ```bash
   node updateAdminRole.js
   ```

2. **Cerrar sesión y volver a iniciar sesión**:
   - Email: `admin@discipulapp.com`
   - Contraseña: `admin123`

3. **Verificar que ahora aparece como Administrador**

### Opción 2: Actualizar manualmente en Firebase Console

1. **Ir a Firebase Console**:
   - https://console.firebase.google.com/
   - Selecciona el proyecto `discipulapp-8d99c`

2. **Ir a Firestore Database**:
   - En el menú lateral, selecciona "Firestore Database"

3. **Buscar el usuario**:
   - Navega a la colección `users`
   - Busca el documento con email `admin@discipulapp.com`

4. **Editar el campo `role`**:
   - Haz clic en el documento
   - Busca el campo `role`
   - Cambia el valor de `miembro` a `admin`
   - Guarda los cambios

5. **Cerrar sesión y volver a iniciar sesión**

### Opción 3: Crear un nuevo usuario admin

Si prefieres crear un nuevo usuario admin desde cero:

1. **Eliminar el usuario actual** (opcional):
   - En Firebase Console > Authentication
   - Busca y elimina `admin@discipulapp.com`
   - En Firestore > users, elimina el documento correspondiente

2. **Ejecutar el script de creación**:
   ```bash
   node createAdmin.js
   ```

3. **Iniciar sesión con las nuevas credenciales**:
   - Email: `admin@discipulapp.com`
   - Contraseña: `admin123`

## Verificación

Después de aplicar cualquiera de las soluciones:

1. **Iniciar sesión**:
   - Email: `admin@discipulapp.com`
   - Contraseña: `admin123`

2. **Verificar el rol**:
   - En la página de perfil, debe aparecer "Administrador"
   - No debe aparecer "Miembro"

3. **Verificar la página de mensajes**:
   - Debe cargar correctamente
   - Debe mostrar el botón "+" para crear mensajes
   - Debe mostrar los botones "Editar" y "Eliminar" en cada mensaje

## Credenciales de Admin

```
Email: admin@discipulapp.com
Contraseña: admin123
Rol: admin
```

## Notas Importantes

- El cambio en `mensajes.tsx` ahora verifica el rol (`user?.role === 'admin'`) en vez del email específico
- Esto hace que cualquier usuario con rol `admin` pueda gestionar mensajes
- Las reglas de Firestore ya están configuradas correctamente para permitir que los admins escriban en la colección `mensajes`
- Si el problema persiste, verifica que las reglas de Firestore estén desplegadas correctamente

## Comandos Útiles

```bash
# Actualizar rol del admin existente
node updateAdminRole.js

# Crear nuevo usuario admin
node createAdmin.js

# Verificar conexión a Firebase
node verifyFirebaseConnection.js

# Desplegar reglas de Firestore
bash deploy-firebase-rules.sh
```
