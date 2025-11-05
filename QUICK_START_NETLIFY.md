# 🚀 Quick Start - Despliegue a Netlify

## ⚡ Inicio Rápido (2 minutos)

### 1. Primera vez - Conectar con Netlify

#### Windows:
```cmd
deploy-netlify.bat
```

#### Mac/Linux:
```bash
chmod +x deploy-netlify.sh
./deploy-netlify.sh
```

Se te abrirá el navegador para autorizar con Netlify. ¡Listo!

---

## 🔄 Deploy Automático con GitHub

### Configurar Secrets:

1. Ve a tu repositorio en GitHub
2. Settings → Secrets and variables → Actions → New repository secret

Agrega estos 2 secrets:

**NETLIFY_AUTH_TOKEN**:
- Ve a: https://app.netlify.com/user/applications
- Click en "New access token"
- Copia el token y pégalo

**NETLIFY_SITE_ID**:
- Ve a tu sitio en Netlify
- Site settings → General → Site details
- Copia el "API ID"

### Agregar variables de Firebase:

También agrega estos secrets (con tus valores reales de `.env`):
- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID`

**¡Listo!** Cada push a `main` desplegará automáticamente.

---

## 📱 Comandos Útiles

```bash
# Build local
npm run build:web

# Deploy a producción
npm run deploy:netlify

# Deploy preview (no reemplaza producción)
npm run deploy:preview

# Ver status del sitio
netlify status

# Ver logs en vivo
netlify watch
```

---

## ✅ Verificación

Después del primer deploy:

1. Ve a: https://app.netlify.com
2. Verás tu sitio y la URL
3. Click en el sitio → "Site overview"
4. ¡Tu app está viva! 🎉

---

## 🆘 Solución Rápida de Problemas

### "Build failed"
```bash
rm -rf node_modules package-lock.json dist .expo
npm install --legacy-peer-deps
npm run build:web
```

### "Netlify CLI not found"
```bash
npm install -g netlify-cli
```

### "Too large to deploy"
El límite de Netlify es 500 MB (vs 250 MB de Firebase).
Si aún es muy grande:
```bash
# Ver tamaño
du -sh dist

# El build normalmente es ~50-100 MB
# Si es mayor, revisa assets grandes en /assets
```

---

## 🎯 Diferencias vs Firebase

| Feature | Firebase | Netlify |
|---------|----------|---------|
| **Límite gratis** | 250 MB | 500 MB |
| **Deploy speed** | ~5 min | ~2 min |
| **CDN** | Google CDN | Edge CDN |
| **Rollback** | Manual | 1 click |
| **Logs** | Limitados | Completos |
| **Analytics** | Requiere setup | Incluido |

---

## 💡 Tips

- **Custom domain**: Gratis en Site settings → Domain management
- **HTTPS**: Automático con Let's Encrypt
- **Preview deploys**: Cada PR crea un preview automático
- **Rollback**: 1 click para volver a deploy anterior

---

¿Problemas? Lee `NETLIFY_DEPLOYMENT_GUIDE.md` para guía completa.
