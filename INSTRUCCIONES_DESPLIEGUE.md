# Instrucciones para Completar el Despliegue

## Cambios Realizados

He eliminado completamente las referencias a autenticación de Apple y Google del código:

1. ✅ Eliminadas funciones `signInWithGoogle` y `signInWithApple` de `hooks/useFirebaseAuth.ts`
2. ✅ Eliminados métodos de autenticación social de `services/firebase.ts`
3. ✅ Eliminados botones y UI de autenticación social de `app/login.tsx`
4. ✅ Limpiados imports no utilizados
5. ✅ Actualizado `netlify.toml` con configuración correcta para funciones

## Cambios Manuales Requeridos

Para completar el proceso, necesitas hacer estos cambios manualmente:

### 1. Actualizar package.json

Elimina esta línea del archivo `package.json` (línea 32):
```json
"expo-apple-authentication": "~7.2.4",
```

### 2. Actualizar app.json

En el archivo `app.json`:

a) Elimina la línea 28:
```json
"usesAppleSignIn": true
```

b) Elimina la línea 72:
```json
"expo-apple-authentication"
```

El array de plugins debe quedar así:
```json
"plugins": [
  [
    "expo-router",
    {
      "origin": "https://rork.com/"
    }
  ],
  [
    "expo-document-picker",
    {
      "iCloudContainerEnvironment": "Production"
    }
  ],
  [
    "expo-image-picker",
    {
      "photosPermission": "The app accesses your photos to let you share them with your friends."
    }
  ],
  [
    "expo-av",
    {
      "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone"
    }
  ]
],
```

### 3. Reinstalar dependencias

Después de hacer los cambios anteriores, ejecuta:

```bash
bun install
```

Esto actualizará el `bun.lock` automáticamente.

### 4. Verificar el build

Antes de desplegar, verifica que el build funcione localmente:

```bash
npm run build:web
```

### 5. Desplegar a Netlify

Una vez que el build local funcione sin errores, puedes hacer commit y push:

```bash
git add .
git commit -m "Remove Apple and Google authentication, fix Netlify deployment"
git push
```

## Configuración de Netlify

El archivo `netlify.toml` ya está configurado correctamente con:

- ✅ Secrets scanning deshabilitado
- ✅ Módulos externos correctamente especificados
- ✅ Archivos del backend incluidos
- ✅ Redirects configurados

## Solución de Problemas

Si aún encuentras errores:

1. **Error de JSX syntax**: Asegúrate de que no haya imports de `expo-apple-authentication` en ningún archivo
2. **Error de bundling**: Verifica que todos los módulos de React Native estén en `external_node_modules`
3. **Error de secrets**: Elimina cualquier archivo `.md` que contenga claves de API de Firebase

## Archivos que Puedes Eliminar (Opcional)

Si tienes estos archivos, puedes eliminarlos de forma segura:
- `FIREBASE_NETLIFY_CHECKLIST.md`
- `SOLUCION_API_KEY.md`
- `SOLUCION_COMPLETA_FIREBASE.md`

Estos archivos contienen claves de API que Netlify detecta como secretos.
