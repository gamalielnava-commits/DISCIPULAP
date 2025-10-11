# 🔥 Instrucciones para Configurar Firebase

## Problema Actual
Los errores que ves son porque las reglas de Firestore no permiten leer/escribir sin autenticación. Necesitas desplegar las nuevas reglas que incluyen permisos para las colecciones de prueba.

## Solución Rápida

### Opción 1: Desplegar Reglas con Firebase CLI (Recomendado)

1. **Instala Firebase CLI** (si no lo tienes):
```bash
npm install -g firebase-tools
```

2. **Inicia sesión en Firebase**:
```bash
firebase login
```

3. **Despliega las reglas**:
```bash
node deploy-rules.js
```

O manualmente:
```bash
firebase deploy --only firestore:rules
```

### Opción 2: Actualizar Reglas Manualmente en la Consola

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto: **discipulapp-project**
3. Ve a **Firestore Database** → **Reglas**
4. Copia y pega el contenido del archivo `firestore.rules` de este proyecto
5. Haz clic en **Publicar**

## Verificar que Funciona

1. Después de desplegar las reglas, abre la app
2. Ve a la pantalla de **Prueba de Firebase** (app/test-firebase.tsx)
3. Presiona el botón **"Iniciar pruebas"**
4. Todas las pruebas deberían pasar ✅

## Reglas Actualizadas

Las nuevas reglas incluyen:

```javascript
// Test collections for connection testing
match /test_connection/{docId} {
  allow read, write: if true;
}

match /test_write/{docId} {
  allow read, write: if true;
}
```

Estas reglas permiten que las pruebas de conexión funcionen sin autenticación.

## Problemas Comunes

### Error: "Missing or insufficient permissions"
- **Causa**: Las reglas no se han desplegado
- **Solución**: Sigue los pasos de arriba para desplegar las reglas

### Error: "Firebase CLI not found"
- **Causa**: Firebase CLI no está instalado
- **Solución**: `npm install -g firebase-tools`

### Error: "Not authenticated"
- **Causa**: No has iniciado sesión en Firebase CLI
- **Solución**: `firebase login`

### Error: "Permission denied"
- **Causa**: No tienes permisos en el proyecto de Firebase
- **Solución**: Pide al administrador del proyecto que te agregue como colaborador

## Seguridad

⚠️ **IMPORTANTE**: Las reglas de prueba (`test_connection` y `test_write`) permiten acceso público. Esto es solo para desarrollo. En producción, deberías:

1. Eliminar estas reglas de prueba
2. O agregar condiciones de seguridad adicionales
3. Usar variables de entorno para controlar el acceso

## Siguiente Paso

Una vez que las reglas estén desplegadas, ejecuta las pruebas en la app y todo debería funcionar correctamente. Los usuarios podrán registrarse e iniciar sesión sin problemas.
