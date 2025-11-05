# Firebase Functions Setup Guide

## Problema
Los errores que estás viendo indican que las dependencias necesarias para Firebase Functions no están instaladas en el directorio `functions/`.

## Solución

### Opción 1: Usar el script de setup automático

#### En MacOS/Linux:
```bash
chmod +x setup-firebase-functions.sh
./setup-firebase-functions.sh
```

#### En Windows:
```bash
setup-firebase-functions.bat
```

### Opción 2: Setup manual

1. **Navega al directorio functions:**
   ```bash
   cd functions
   ```

2. **Crea el archivo package.json (si no existe):**
   ```json
   {
     "name": "functions",
     "version": "1.0.0",
     "description": "Firebase Functions for Discipulado App",
     "main": "lib/index.js",
     "scripts": {
       "build": "tsc",
       "serve": "npm run build && firebase emulators:start --only functions",
       "deploy": "firebase deploy --only functions",
       "logs": "firebase functions:log"
     },
     "engines": {
       "node": "20"
     },
     "dependencies": {
       "@hono/trpc-server": "^0.4.0",
       "@trpc/server": "^11.5.1",
       "firebase-admin": "^13.5.0",
       "firebase-functions": "^6.2.0",
       "hono": "^4.9.8",
       "superjson": "^2.2.2",
       "zod": "^4.1.12"
     },
     "devDependencies": {
       "@types/node": "^20.0.0",
       "typescript": "^5.9.2"
     },
     "private": true
   }
   ```

3. **Crea el archivo tsconfig.json (si no existe):**
   ```json
   {
     "compilerOptions": {
       "module": "commonjs",
       "noImplicitReturns": true,
       "noUnusedLocals": true,
       "outDir": "lib",
       "sourceMap": true,
       "strict": true,
       "target": "es2021",
       "esModuleInterop": true,
       "moduleResolution": "node",
       "resolveJsonModule": true,
       "skipLibCheck": true
     },
     "include": ["src"],
     "exclude": ["node_modules"]
   }
   ```

4. **Instala las dependencias:**
   ```bash
   npm install
   ```

5. **Compila el código:**
   ```bash
   npm run build
   ```

6. **Regresa al directorio raíz:**
   ```bash
   cd ..
   ```

## Verificar que funciona

Después de completar el setup, deberías poder desplegar las funciones:

```bash
firebase deploy --only functions
```

## Estructura del proyecto

```
functions/
├── src/
│   ├── index.ts                    # Punto de entrada principal
│   ├── firebaseAdmin.ts            # Configuración de Firebase Admin
│   ├── services/
│   │   └── firebaseAdmin.ts        # Servicios de Firestore Admin
│   └── trpc/
│       ├── create-context.ts       # Contexto de tRPC
│       ├── app-router.ts           # Router principal
│       └── routes/                 # Todas las rutas tRPC
│           ├── example/
│           ├── modulos/
│           ├── progress/
│           ├── discipleship/
│           ├── sermons/
│           └── analytics/
├── lib/                            # Código compilado (generado)
├── node_modules/                   # Dependencias (generado)
├── package.json
└── tsconfig.json
```

## Variables de entorno necesarias

Asegúrate de configurar las siguientes variables de entorno en Firebase Functions:

```bash
firebase functions:config:set \
  firebase.project_id="iglesia-casa-de-dios-ed5b2" \
  firebase.private_key="YOUR_PRIVATE_KEY" \
  firebase.client_email="YOUR_CLIENT_EMAIL"
```

O configurarlas en el archivo `.env` para desarrollo local.

## Próximos pasos

1. Ejecuta el script de setup
2. Verifica que la compilación fue exitosa
3. Despliega las funciones a Firebase
4. Prueba los endpoints desde tu aplicación

## Notas importantes

- Las funciones usan Firebase Admin SDK, no el client SDK
- Todas las operaciones de Firestore se realizan desde el servidor
- Las funciones están en la región `us-central1` por defecto
- El endpoint de las funciones será: `https://us-central1-iglesia-casa-de-dios-ed5b2.cloudfunctions.net/api`
