# Comandos Rápidos - Vercel

## 🚀 Despliegue Rápido

```bash
# Instalar Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## 📋 Variables de Entorno (copiar y pegar)

```bash
# Ejecutar estos comandos uno por uno
vercel env add EXPO_PUBLIC_FIREBASE_API_KEY
vercel env add EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN
vercel env add EXPO_PUBLIC_FIREBASE_PROJECT_ID
vercel env add EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET
vercel env add EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
vercel env add EXPO_PUBLIC_FIREBASE_APP_ID
vercel env add FIREBASE_PROJECT_ID
vercel env add FIREBASE_CLIENT_EMAIL
vercel env add FIREBASE_PRIVATE_KEY
```

## 🔍 Ver Logs

```bash
vercel logs
```

## 🌐 Abrir Proyecto en Browser

```bash
vercel open
```

## 📊 Ver Info del Proyecto

```bash
vercel inspect
```

## 🔄 Redeploy

```bash
vercel --prod
```

## 🗑️ Eliminar Deploy Antiguo

```bash
vercel remove [deployment-url]
```

## 📝 Ver Lista de Deploys

```bash
vercel ls
```

## ⚙️ Cambiar Configuración

```bash
vercel project
```

---

**Nota:** Después de configurar las variables, haz `vercel --prod` para que se apliquen.
