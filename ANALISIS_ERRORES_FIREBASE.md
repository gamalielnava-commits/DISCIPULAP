# Análisis Completo de Errores de Firebase y Registro

## 🔍 Problemas Identificados

### 1. **Error en el Registro de Usuarios** ❌

#### Problema Principal:
El sistema de registro tiene múltiples problemas que impiden que los usuarios se registren correctamente:

**A. Configuración de Firebase Authentication**
- ⚠️ **Email/Password no está habilitado en Firebase Console**
  - Ubicación: Firebase Console → Authentication → Sign-in method
  - Estado actual: Probablemente deshabilitado
  - Solución: Habilitar "Email/Password" como método de autenticación

**B. Reglas de Firestore**
- ✅ Las reglas están correctamente configuradas para permitir `create`
- ✅ Los usuarios pueden crear su propio perfil durante el registro
- ⚠️ **PERO**: Las reglas necesitan estar desplegadas en Firebase

**C. Lógica de Registro en el Código**
```typescript
// En hooks/useFirebaseAuth.ts línea 234-361
const signUp = async (email: string, password: string, userData: Partial<User>) => {
  // Problema 1: No valida si Firebase está configurado correctamente
  // Problema 2: No maneja errores específicos de configuración
  // Problema 3: Mensajes de error genéricos
}
```

**D. Verificación de Email**
```typescript
// En services/firebase.ts línea 41
export const REQUIRE_EMAIL_VERIFICATION = false as const;
```
- ✅ La verificación de email está deshabilitada (correcto para desarrollo)

---

### 2. **Errores de Permisos de Administrador** ⚠️

#### Problema:
El usuario administrador no tiene permisos correctos en Firestore.

**Causas Posibles:**
1. El campo `role` en Firestore no está configurado como `'admin'`
2. El documento del usuario no existe en la colección `users`
3. Las reglas de Firestore no reconocen al usuario como admin

**Verificación Necesaria:**
```javascript
// Verificar en Firebase Console → Firestore Database → users
{
  "id": "uid-del-usuario",
  "email": "admin@gmail.com",
  "role": "admin",  // ← Este campo debe ser exactamente "admin"
  "nombre": "Administrador",
  "apellido": "Principal",
  "status": "activo"
}
```

---

### 3. **Problemas de Autenticación Local vs Firebase** 🔄

#### Código Problemático:
```typescript
// En hooks/useFirebaseAuth.ts línea 131-232
const signIn = async (identifier: string, password: string) => {
  if (!IS_FIREBASE_CONFIGURED) {
    // Modo local - funciona correctamente
    // ...
  }
  
  // Modo Firebase - puede fallar si:
  // 1. Email/Password no está habilitado
  // 2. Las credenciales son incorrectas
  // 3. El usuario no existe en Firebase Auth
}
```

**Problema:** El sistema tiene dos modos (local y Firebase) pero no maneja correctamente la transición entre ellos.

---

### 4. **Errores de Configuración de Firebase** ⚙️

#### A. Variables de Entorno
```bash
# .env - Configuración actual
EXPO_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_WEB_API_KEY
EXPO_PUBLIC_FIREBASE_PROJECT_ID=discipulapp-8d99c
# ... otras variables
```
✅ Las variables están correctamente configuradas

#### B. Inicialización de Firebase
```typescript
// firebaseConfig.ts
export const IS_FIREBASE_CONFIGURED = Boolean(
  firebaseConfig?.apiKey && firebaseConfig?.projectId
);
```
✅ La inicialización es correcta

#### C. Firebase Admin (Backend)
```typescript
// backend/firebaseAdmin.ts
// ⚠️ Falta configuración de credenciales de servicio
const privateKey = process.env.FIREBASE_PRIVATE_KEY;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
```
❌ **Problema:** No hay credenciales de servicio configuradas en `.env`

---

## 🛠️ Soluciones Paso a Paso

### Solución 1: Habilitar Email/Password en Firebase Console

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **discipulapp-8d99c**
3. Ve a **Authentication** → **Sign-in method**
4. Habilita **Email/Password**
5. Guarda los cambios

**Captura de pantalla necesaria:**
```
Authentication > Sign-in method
┌─────────────────────────────────────┐
│ Email/Password         [Enabled ✓]  │
│ Google                 [Disabled]    │
│ Facebook               [Disabled]    │
└─────────────────────────────────────┘
```

---

### Solución 2: Desplegar Reglas de Firestore

#### Opción A: Usando Firebase CLI (Recomendado)

```bash
# 1. Instalar Firebase CLI
npm install -g firebase-tools

# 2. Autenticarse
firebase login

# 3. Desplegar reglas
firebase deploy --only firestore:rules
firebase deploy --only storage
```

#### Opción B: Desde Firebase Console

1. Ve a **Firestore Database** → **Rules**
2. Copia el contenido de `firestore.rules`
3. Pega en el editor
4. Haz clic en **Publicar**

---

### Solución 3: Verificar y Corregir Rol de Administrador

#### Método 1: Verificar en Firebase Console

1. Ve a **Firestore Database**
2. Busca la colección `users`
3. Encuentra tu usuario (busca por email)
4. Verifica que el campo `role` sea exactamente `"admin"`

#### Método 2: Actualizar desde la App

```typescript
// Agregar esta función temporal en app/test-firebase.tsx
const updateAdminRole = async () => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (user) {
    const userRef = doc(db, 'users', user.uid);
    await updateDoc(userRef, {
      role: 'admin',
      updatedAt: new Date()
    });
    console.log('Rol actualizado a admin');
  }
};
```

---

### Solución 4: Agregar Credenciales de Servicio (Backend)

1. Ve a Firebase Console → **Project Settings** → **Service Accounts**
2. Haz clic en **Generate new private key**
3. Descarga el archivo JSON
4. Agrega las credenciales a `.env`:

```bash
# Agregar al archivo .env
FIREBASE_PROJECT_ID=discipulapp-8d99c
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@discipulapp-8d99c.iam.gserviceaccount.com
```

---

### Solución 5: Mejorar Manejo de Errores en Registro

Voy a actualizar el código para manejar mejor los errores:

```typescript
// hooks/useFirebaseAuth.ts - Mejorar signUp
const signUp = async (email: string, password: string, userData: Partial<User>) => {
  try {
    if (!IS_FIREBASE_CONFIGURED) {
      // Modo local...
    }

    // Verificar que Email/Password está habilitado
    console.log('Registrando usuario en Firebase:', email);
    await AuthService.signUp(email, password, userData);
    console.log('Usuario registrado exitosamente en Firebase');
    return { success: true };
  } catch (error: any) {
    console.error('Sign up error:', error);
    console.error('Error code:', error?.code);
    console.error('Error message:', error?.message);
    
    // Manejar errores específicos
    if (error?.code === 'auth/operation-not-allowed') {
      return {
        success: false,
        error: 'El registro está deshabilitado. Por favor, habilita Email/Password en Firebase Console → Authentication → Sign-in method.'
      };
    }
    
    if (error?.code === 'auth/email-already-in-use') {
      return {
        success: false,
        error: 'Este correo electrónico ya está registrado. Intenta iniciar sesión.'
      };
    }
    
    return {
      success: false,
      error: getAuthErrorMessage(error?.code)
    };
  }
};
```

---

## 📋 Checklist de Verificación

### Antes de Registrar un Usuario:

- [ ] Email/Password está habilitado en Firebase Console
- [ ] Las reglas de Firestore están desplegadas
- [ ] Las reglas de Storage están desplegadas
- [ ] El dominio de la app está autorizado en Firebase
- [ ] La configuración de Firebase es correcta en `.env`

### Para el Usuario Administrador:

- [ ] El usuario existe en Firebase Authentication
- [ ] El documento del usuario existe en Firestore → `users`
- [ ] El campo `role` es exactamente `"admin"`
- [ ] El usuario puede iniciar sesión correctamente
- [ ] El usuario puede crear/editar mensajes y módulos

### Para Nuevos Usuarios:

- [ ] Pueden acceder a la pantalla de registro
- [ ] Pueden completar el formulario
- [ ] El registro se completa sin errores
- [ ] Reciben confirmación de registro exitoso
- [ ] Pueden iniciar sesión después de registrarse

---

## 🔧 Comandos Útiles para Debugging

```bash
# Ver logs de Firebase
firebase functions:log

# Ver reglas actuales de Firestore
firebase firestore:rules:get

# Ver reglas actuales de Storage
firebase storage:rules:get

# Desplegar todo
firebase deploy

# Desplegar solo reglas
firebase deploy --only firestore:rules,storage
```

---

## 📱 Pruebas Recomendadas

### 1. Probar Registro de Usuario

```typescript
// Datos de prueba
const testUser = {
  nombre: 'Test',
  apellido: 'Usuario',
  email: 'test@example.com',
  password: 'Test123456',
  fechaNacimiento: '01/01/1990'
};
```

### 2. Probar Inicio de Sesión

```typescript
// Credenciales de prueba
const testLogin = {
  email: 'test@example.com',
  password: 'Test123456'
};
```

### 3. Probar Permisos de Admin

```typescript
// Verificar que el admin puede:
// 1. Crear mensajes
// 2. Editar módulos
// 3. Ver todos los usuarios
// 4. Gestionar grupos
```

---

## 🚨 Errores Comunes y Soluciones

### Error: "auth/operation-not-allowed"
**Causa:** Email/Password no está habilitado en Firebase Console  
**Solución:** Habilitar en Authentication → Sign-in method

### Error: "auth/email-already-in-use"
**Causa:** El email ya está registrado  
**Solución:** Usar otro email o iniciar sesión

### Error: "permission-denied"
**Causa:** Las reglas de Firestore no permiten la operación  
**Solución:** Desplegar las reglas actualizadas

### Error: "auth/user-not-found"
**Causa:** El usuario no existe en Firebase Auth  
**Solución:** Registrar el usuario primero

### Error: "auth/wrong-password"
**Causa:** La contraseña es incorrecta  
**Solución:** Verificar la contraseña o usar recuperación

---

## 📝 Notas Importantes

1. **Modo Local vs Firebase:**
   - El sistema funciona en modo local cuando Firebase no está configurado
   - En modo local, los datos se guardan en AsyncStorage
   - En modo Firebase, los datos se sincronizan con Firestore

2. **Primer Usuario:**
   - El primer usuario que se registra automáticamente es admin
   - Los usuarios con email `admin@gmail.com` o `admin@discipulapp.com` son admin

3. **Seguridad:**
   - Las reglas de Firestore protegen los datos
   - Solo los usuarios autenticados pueden leer datos
   - Solo los admins pueden escribir en la mayoría de colecciones

4. **Dominios Autorizados:**
   - Verifica que tu dominio esté en la lista de dominios autorizados
   - Firebase Console → Authentication → Settings → Authorized domains
   - Agrega: `discipulapp.org`, `localhost`, `*.netlify.app`

---

## 🎯 Próximos Pasos

1. **Inmediato:**
   - [ ] Habilitar Email/Password en Firebase Console
   - [ ] Desplegar reglas de Firestore y Storage
   - [ ] Verificar rol de administrador

2. **Corto Plazo:**
   - [ ] Agregar credenciales de servicio para el backend
   - [ ] Mejorar mensajes de error en el registro
   - [ ] Agregar validación de dominios autorizados

3. **Largo Plazo:**
   - [ ] Implementar verificación de email (opcional)
   - [ ] Agregar autenticación con Google/Facebook
   - [ ] Implementar sistema de recuperación de contraseña mejorado

---

## 📞 Soporte

Si después de seguir todos estos pasos sigues teniendo problemas:

1. Revisa los logs de la consola del navegador
2. Revisa los logs de Firebase Console
3. Verifica que todas las configuraciones estén correctas
4. Contacta al soporte técnico con los logs específicos del error

---

**Última actualización:** 2025-10-12  
**Versión del documento:** 1.0
