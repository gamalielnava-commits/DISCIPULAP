# Guía de Despliegue en Netlify

## Configuración Actual

Tu proyecto está configurado para usar:
- **Netlify**: Hosting del frontend y backend API
- **Firebase**: Base de datos (Firestore), Autenticación y Storage

## Pasos para Desplegar en Netlify

### 1. Configurar Variables de Entorno en Netlify

Ve a tu proyecto en Netlify Dashboard → Site settings → Environment variables y agrega:

```
EXPO_PUBLIC_FIREBASE_API_KEY=tu-api-key-real
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=discipulapp-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=discipulapp-project
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=discipulapp-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=tu-sender-id-real
EXPO_PUBLIC_FIREBASE_APP_ID=tu-app-id-real
EXPO_PUBLIC_API_BASE_URL=https://discipulapp.org
```

### 2. Configurar el Dominio

1. Ve a Netlify Dashboard → Domain settings
2. Agrega tu dominio personalizado: `discipulapp.org`
3. Configura los DNS records en tu proveedor de dominio:
   - Tipo: `A` → Valor: IP de Netlify (te lo proporciona Netlify)
   - Tipo: `CNAME` → Nombre: `www` → Valor: `tu-sitio.netlify.app`

### 3. Desplegar desde Git

#### Opción A: Conectar Repositorio (Recomendado)

1. Ve a Netlify Dashboard
2. Click en "Add new site" → "Import an existing project"
3. Conecta tu repositorio de GitHub/GitLab/Bitbucket
4. Configuración de build:
   - **Build command**: `npm run build:web`
   - **Publish directory**: `dist`
   - **Functions directory**: `netlify/functions`

#### Opción B: Deploy Manual

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login a Netlify
netlify login

# Build del proyecto
npm run build:web

# Deploy
netlify deploy --prod
```

### 4. Configurar Firebase (Solo Base de Datos)

Firebase ya no se usa para hosting, solo para base de datos:

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login a Firebase
firebase login

# Desplegar solo las reglas de Firestore y Storage
firebase deploy --only firestore:rules,storage:rules
```

### 5. Verificar el Despliegue

1. **Frontend**: Visita `https://discipulapp.org`
2. **API**: Prueba `https://discipulapp.org/api/`
3. **tRPC**: Prueba `https://discipulapp.org/api/trpc/example.hi`

## Estructura del Proyecto

```
├── dist/                    # Build del frontend (generado)
├── netlify/
│   └── functions/
│       └── api.ts          # Netlify Function para el backend
├── backend/
│   ├── hono.ts             # Servidor Hono
│   └── trpc/               # Rutas tRPC
├── firestore.rules         # Reglas de seguridad de Firestore
├── storage.rules           # Reglas de seguridad de Storage
├── firebase.json           # Config de Firebase (solo DB)
└── netlify.toml            # Config de Netlify (hosting)
```

## Comandos Útiles

```bash
# Desarrollo local
npm run dev

# Build para producción
npm run build:web

# Deploy a Netlify
netlify deploy --prod

# Ver logs de Netlify Functions
netlify functions:log api

# Desplegar reglas de Firebase
firebase deploy --only firestore:rules,storage:rules
```

## Troubleshooting

### Error: "API not responding"
- Verifica que las variables de entorno estén configuradas en Netlify
- Revisa los logs: `netlify functions:log api`

### Error: "Firebase permission denied"
- Despliega las reglas de Firestore: `firebase deploy --only firestore:rules`
- Verifica que el usuario esté autenticado

### Error: "Domain not loading"
- Verifica la configuración DNS
- Espera hasta 48 horas para la propagación DNS
- Verifica que el certificado SSL esté activo en Netlify

## Monitoreo

- **Netlify Analytics**: Dashboard → Analytics
- **Firebase Console**: https://console.firebase.google.com
- **Logs de Functions**: `netlify functions:log`

## Costos

- **Netlify**: 
  - Free tier: 100GB bandwidth, 300 build minutes/mes
  - Pro: $19/mes para más recursos
  
- **Firebase**:
  - Spark (Free): 1GB storage, 10GB/mes transfer
  - Blaze (Pay as you go): Paga solo lo que uses

## Seguridad

✅ HTTPS automático con Netlify
✅ Reglas de seguridad de Firebase configuradas
✅ Headers de seguridad configurados en netlify.toml
✅ CORS configurado en el backend

## Próximos Pasos

1. Configura las variables de entorno en Netlify
2. Conecta tu repositorio a Netlify
3. Despliega las reglas de Firebase
4. Configura tu dominio personalizado
5. ¡Listo! Tu app está en producción 🚀
