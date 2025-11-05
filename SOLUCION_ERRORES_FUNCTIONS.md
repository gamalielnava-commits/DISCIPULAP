# Solución a los Errores de Firebase Functions

## Errores encontrados

```
functions/src/index.ts(1,27): error TS2307: Cannot find module 'firebase-functions/v2/https'
functions/src/index.ts(6,27): error TS2307: Cannot find module './trpc/app-router.js'
functions/src/index.ts(7,31): error TS2307: Cannot find module './trpc/create-context.js'
```

## Causa

El directorio `functions/` no tiene:
1. Las dependencias npm instaladas (`node_modules/`)
2. El archivo `package.json` configurado correctamente
3. El archivo `tsconfig.json` configurado

## Solución Rápida

### Ejecuta este comando en la raíz del proyecto:

**MacOS/Linux:**
```bash
chmod +x setup-firebase-functions.sh && ./setup-firebase-functions.sh
```

**Windows:**
```bash
setup-firebase-functions.bat
```

Este script automáticamente:
- ✅ Crea el `package.json` con todas las dependencias necesarias
- ✅ Crea el `tsconfig.json` con la configuración correcta
- ✅ Instala todas las dependencias con `npm install`
- ✅ Compila el código TypeScript a JavaScript

## Solución Manual (si prefieres hacerlo paso a paso)

### 1. Navega al directorio functions
```bash
cd functions
```

### 2. Inicializa npm (si no hay package.json)
```bash
npm init -y
```

### 3. Instala las dependencias necesarias
```bash
npm install firebase-functions@^6.2.0 firebase-admin@^13.5.0 @trpc/server@^11.5.1 @hono/trpc-server@^0.4.0 hono@^4.9.8 superjson@^2.2.2 zod@^4.1.12
```

### 4. Instala las dependencias de desarrollo
```bash
npm install --save-dev typescript@^5.9.2 @types/node@^20.0.0
```

### 5. Crea el archivo tsconfig.json
Crea un archivo `tsconfig.json` en el directorio `functions/` con este contenido:
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

### 6. Compila el código
```bash
npm run build
```
O si no tienes el script configurado:
```bash
npx tsc
```

### 7. Regresa al directorio raíz
```bash
cd ..
```

## Verificación

Después de ejecutar el setup, verifica que todo funciona:

```bash
# Desde el directorio raíz del proyecto
firebase deploy --only functions
```

## Estructura esperada después del setup

```
functions/
├── node_modules/          ← Carpeta creada con las dependencias
├── lib/                   ← Carpeta creada con el código compilado
├── src/
│   ├── index.ts
│   ├── firebaseAdmin.ts
│   ├── services/
│   │   └── firebaseAdmin.ts
│   └── trpc/
│       ├── create-context.ts
│       ├── app-router.ts
│       └── routes/
├── package.json           ← Archivo creado/actualizado
├── package-lock.json      ← Archivo creado por npm
└── tsconfig.json          ← Archivo creado
```

## Notas importantes

- Los errores ocurren porque TypeScript no puede encontrar los módulos que estás importando
- Esto se debe a que las dependencias no están instaladas en `functions/node_modules/`
- Una vez instaladas las dependencias y compilado el código, los errores desaparecerán

## ¿Qué hace cada archivo?

- **package.json**: Define las dependencias y scripts del proyecto
- **tsconfig.json**: Configura cómo TypeScript compilará tu código
- **node_modules/**: Contiene todas las librerías instaladas
- **lib/**: Contiene el código JavaScript compilado desde TypeScript

## Problemas comunes

### Error: "Cannot find module 'firebase-functions'"
**Solución**: Asegúrate de estar en el directorio `functions/` cuando ejecutas `npm install`

### Error: "tsc: command not found"
**Solución**: Instala TypeScript globalmente o usa `npx tsc`
```bash
npm install -g typescript
# o
npx tsc
```

### Error al desplegar: "Functions directory must contain package.json"
**Solución**: Asegúrate de que el archivo `package.json` existe en `functions/`

## Siguiente paso

Una vez que hayas ejecutado el script o seguido los pasos manuales, los errores de TypeScript deberían desaparecer y podrás desplegar tus funciones a Firebase.
