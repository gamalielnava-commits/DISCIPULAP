# Solución: Error de API Key de Firebase

## Problema
```
Firebase: Error (auth/api-key-not-valid.-please-pass-a-valid-api-key.)
```

## Causa
La API Key de Firebase tiene restricciones configuradas en la consola de Firebase que están bloqueando las solicitudes.

## Solución

### Paso 1: Verificar restricciones de la API Key

1. Ve a la [Consola de Google Cloud](https://console.cloud.google.com/)
2. Selecciona tu proyecto: **discipulapp-8d99c**
3. En el menú lateral, ve a **APIs y servicios** → **Credenciales**
4. Busca la API Key que comienza con `AIzaSyATOSjJ073YgRz80bBUPa4OK0rEBov0mCU`
5. Haz clic en el nombre de la API Key para editarla

### Paso 2: Configurar restricciones correctamente

#### Opción A: Sin restricciones (Desarrollo)
- En **Restricciones de aplicación**, selecciona: **Ninguna**
- Guarda los cambios

#### Opción B: Con restricciones (Producción)
- En **Restricciones de aplicación**, selecciona: **Referentes HTTP (sitios web)**
- Agrega estos dominios:
  ```
  localhost:*
  127.0.0.1:*
  *.netlify.app/*
  discipulapp.org/*
  *.firebaseapp.com/*
  ```

### Paso 3: Verificar APIs habilitadas

Asegúrate de que estas APIs estén habilitadas en tu proyecto:

1. Ve a **APIs y servicios** → **Biblioteca**
2. Busca y habilita:
   - ✅ **Identity Toolkit API** (Firebase Authentication)
   - ✅ **Cloud Firestore API**
   - ✅ **Firebase Storage API**
   - ✅ **Cloud Functions API** (si usas funciones)

### Paso 4: Desplegar las reglas de Firestore actualizadas

Las reglas de Firestore ya fueron actualizadas en el archivo `firestore.rules`. Ahora debes desplegarlas:

```bash
# Instala Firebase CLI si no lo tienes
npm install -g firebase-tools

# Inicia sesión
firebase login

# Despliega las reglas
firebase deploy --only firestore:rules
```

### Paso 5: Reiniciar la aplicación

Después de hacer los cambios:

1. Detén el servidor de desarrollo (Ctrl+C)
2. Limpia la caché:
   ```bash
   npx expo start -c
   ```

## Verificación

Después de aplicar los cambios, deberías ver en la consola:

```
✅ Firebase conectado: [DEFAULT]
📦 Proyecto: discipulapp-8d99c
✅ Usuario registrado y guardado en Firestore: admin
✅ Administrador creado exitosamente
```

## Credenciales de administrador

Una vez solucionado el problema de la API Key, podrás iniciar sesión con:

- **Email**: admin@discipulapp.com
- **Contraseña**: admin123

## Notas de seguridad

⚠️ **IMPORTANTE**: Las reglas de Firestore actuales permiten acceso completo sin autenticación (`allow read, write: if true`). Esto es solo para desarrollo inicial.

Después de crear el usuario administrador, debes restaurar las reglas de seguridad:

```javascript
match /usuarios/{userId} {
  allow read: if request.auth != null;
  allow write: if request.auth != null && request.auth.uid == userId;
  allow create: if request.auth != null;
}
```

Y desplegarlas nuevamente con `firebase deploy --only firestore:rules`.
