# Diferencias: Netlify vs Vercel

## 📊 Comparación

| Característica | Netlify (Antes) | Vercel (Ahora) |
|---------------|-----------------|-----------------|
| **Hosting** | ✅ Estático | ✅ Estático + Edge |
| **Funciones** | Serverless Functions | Edge Functions |
| **Build Time** | ~3-5 min | ~2-3 min |
| **Cold Start** | ~500ms | ~50ms |
| **CDN** | Global | Global + Edge Network |
| **Pricing** | 300 min build/mes | 6000 min build/mes |
| **Bandwidth** | 100GB/mes | 100GB/mes |
| **Edge Regions** | Limitadas | Todas |

## ✅ Ventajas de Vercel

1. **Mejor Performance**: Edge Functions son más rápidas
2. **Mejor Integración**: Optimizado para frameworks modernos
3. **Mejor DX**: Dashboard más intuitivo
4. **Edge Runtime**: Tu API corre en el edge (más cerca del usuario)
5. **Build más Rápido**: Sistema de build optimizado
6. **Mejor Caché**: Sistema de caché más inteligente

## 🎯 Por Qué Vercel para Este Proyecto

### Backend/API
- **Antes (Netlify)**: Serverless functions con cold starts lentos
- **Ahora (Vercel)**: Edge runtime, respuesta instantánea

### Base de Datos
- **Antes**: Netlify Functions → Firebase
- **Ahora**: Vercel Edge → Firebase (más rápido)

### Autenticación
- **Antes**: Firebase Auth (sin cambios)
- **Ahora**: Firebase Auth (sin cambios)

### Build
- **Antes**: `netlify build`
- **Ahora**: `vercel build` (más rápido)

## 🔧 Cambios Técnicos

### 1. Configuración
```json
// netlify.toml (antes)
{
  "build": {
    "command": "expo export",
    "functions": "netlify/functions"
  }
}

// vercel.json (ahora)
{
  "buildCommand": "npx expo export --platform web",
  "functions": {
    "api/**/*.ts": { "runtime": "edge" }
  }
}
```

### 2. Funciones
```typescript
// Netlify (antes)
export async function handler(event, context) {
  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Hello" })
  };
}

// Vercel (ahora)
export default async function handler(req: Request) {
  return new Response(
    JSON.stringify({ message: "Hello" }), 
    { status: 200 }
  );
}
```

### 3. Variables de Entorno
- **Netlify**: Dashboard → Site settings → Build & deploy → Environment
- **Vercel**: Dashboard → Settings → Environment Variables
- **Ambos**: Soportan `.env` para desarrollo local

## 📱 Para el Usuario Final

**No hay diferencias visibles:**
- La app se ve igual
- Funciona igual
- Mismo Firebase
- Mismas funcionalidades

**Mejoras invisibles:**
- App más rápida
- API más rápida
- Mejor tiempo de carga

## 🌐 Dominio

### Opción 1: Mover dominio a Vercel
```bash
# En Vercel Dashboard
Settings → Domains → Add Domain
# Seguir instrucciones de DNS
```

### Opción 2: Mantener dominio en Netlify
```bash
# En Netlify Dashboard
Domain settings → Add DNS record:
Type: CNAME
Name: app
Value: tu-proyecto.vercel.app
```

Resultado: `app.tudominio.com` → Vercel
Página principal: `tudominio.com` → Netlify (si la tienes)

## 🔄 Migración de Datos

**No es necesaria** porque:
- Base de datos: Sigue en Firebase
- Autenticación: Sigue en Firebase
- Storage: Sigue en Firebase

Solo cambia **dónde corre el código**.

## 💰 Costos

### Netlify Free Tier
- 300 minutos build/mes
- 100GB bandwidth/mes
- 125k serverless requests/mes

### Vercel Hobby (Free)
- 6000 minutos build/mes
- 100GB bandwidth/mes
- Unlimited requests (con fair use)

**Mejor para este proyecto**: Vercel tiene mejor tier gratuito.

## 🎯 Recomendación

**Usa Vercel para:**
- ✅ Frontend (React Native Web)
- ✅ Backend/API (tRPC)
- ✅ Edge Functions

**Mantén en Netlify:**
- 🌐 Dominio (opcional)
- 📄 Documentación/Landing (si la tienes)

**Usa Firebase para:**
- 🔐 Autenticación
- 📦 Base de datos
- 🖼️ Storage

---

**Resultado**: Mejor stack, mejor performance, mismo costo (gratis).
