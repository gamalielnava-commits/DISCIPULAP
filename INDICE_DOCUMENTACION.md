# 📚 Índice de Documentación - Despliegue Firebase

## 🎯 Inicio Rápido

Si es tu primera vez, sigue este orden:

1. **[PASOS_SIGUIENTES.md](./PASOS_SIGUIENTES.md)** ⭐ EMPIEZA AQUÍ
   - Checklist de configuración inicial
   - Pasos detallados para el primer despliegue

2. **[ACTUALIZAR_CREDENCIALES.md](./ACTUALIZAR_CREDENCIALES.md)**
   - Cómo obtener credenciales de Firebase
   - Configurar archivo `.env`
   - Configurar GitHub Secrets

3. **[GUIA_DESPLIEGUE_FIREBASE.md](./GUIA_DESPLIEGUE_FIREBASE.md)**
   - Guía completa de despliegue
   - Métodos de despliegue disponibles
   - Solución de problemas

---

## 📖 Documentación Completa

### 🚀 Despliegue

| Documento | Descripción | Cuándo Usar |
|-----------|-------------|-------------|
| **[GUIA_DESPLIEGUE_FIREBASE.md](./GUIA_DESPLIEGUE_FIREBASE.md)** | Guía completa de despliegue | Referencia general |
| **[PASOS_SIGUIENTES.md](./PASOS_SIGUIENTES.md)** | Qué hacer después de la configuración | Primera vez |
| **[COMANDOS_RAPIDOS.md](./COMANDOS_RAPIDOS.md)** | Referencia rápida de comandos | Uso diario |

### 🔧 Configuración

| Documento | Descripción | Cuándo Usar |
|-----------|-------------|-------------|
| **[ACTUALIZAR_CREDENCIALES.md](./ACTUALIZAR_CREDENCIALES.md)** | Configurar credenciales de Firebase | Primera vez / Cambio de proyecto |
| **[RESUMEN_CONFIGURACION.md](./RESUMEN_CONFIGURACION.md)** | Resumen de toda la configuración | Entender el sistema |

### 📊 Referencia

| Documento | Descripción | Cuándo Usar |
|-----------|-------------|-------------|
| **[COMANDOS_RAPIDOS.md](./COMANDOS_RAPIDOS.md)** | Comandos más usados | Referencia rápida |
| **[INDICE_DOCUMENTACION.md](./INDICE_DOCUMENTACION.md)** | Este archivo | Navegar la documentación |

---

## 🎯 Por Caso de Uso

### "Es mi primera vez, ¿qué hago?"
1. Lee: [PASOS_SIGUIENTES.md](./PASOS_SIGUIENTES.md)
2. Sigue: [ACTUALIZAR_CREDENCIALES.md](./ACTUALIZAR_CREDENCIALES.md)
3. Ejecuta: `./verificar-configuracion.sh`
4. Despliega: `./deploy-to-firebase.sh`

### "Quiero desplegar cambios"
- **Automático:** `git push origin main`
- **Manual:** `./deploy-to-firebase.sh`
- Ver: [COMANDOS_RAPIDOS.md](./COMANDOS_RAPIDOS.md)

### "Tengo un error"
1. Ejecuta: `./verificar-configuracion.sh`
2. Consulta: [GUIA_DESPLIEGUE_FIREBASE.md](./GUIA_DESPLIEGUE_FIREBASE.md) → Sección "Solución de Problemas"
3. Verifica: [ACTUALIZAR_CREDENCIALES.md](./ACTUALIZAR_CREDENCIALES.md) → Sección "Problemas Comunes"

### "Quiero entender cómo funciona"
- Lee: [RESUMEN_CONFIGURACION.md](./RESUMEN_CONFIGURACION.md)
- Revisa: [GUIA_DESPLIEGUE_FIREBASE.md](./GUIA_DESPLIEGUE_FIREBASE.md)

### "Necesito un comando específico"
- Consulta: [COMANDOS_RAPIDOS.md](./COMANDOS_RAPIDOS.md)

### "Cambié de proyecto Firebase"
- Sigue: [ACTUALIZAR_CREDENCIALES.md](./ACTUALIZAR_CREDENCIALES.md)

---

## 📁 Archivos del Proyecto

### Configuración de Firebase
```
firebase.json          → Configuración de hosting
.firebaserc           → Proyecto de Firebase (iglesia-casa-de-dios-ed5b2)
```

### Variables de Entorno
```
.env                  → Credenciales de Firebase (NO subir a Git)
.env.example          → Plantilla de variables
```

### Scripts de Despliegue
```
deploy-to-firebase.sh     → Script automático (Mac/Linux)
deploy-to-firebase.bat    → Script automático (Windows)
```

### Scripts de Verificación
```
verificar-configuracion.sh    → Verificar setup (Mac/Linux)
verificar-configuracion.bat   → Verificar setup (Windows)
```

### GitHub Actions
```
.github/workflows/firebase-hosting.yml → CI/CD automático
```

### Documentación
```
GUIA_DESPLIEGUE_FIREBASE.md    → Guía completa
ACTUALIZAR_CREDENCIALES.md     → Configurar credenciales
PASOS_SIGUIENTES.md            → Checklist inicial
RESUMEN_CONFIGURACION.md       → Resumen del sistema
COMANDOS_RAPIDOS.md            → Referencia de comandos
INDICE_DOCUMENTACION.md        → Este archivo
```

---

## 🔍 Búsqueda Rápida

### Comandos
- **Desplegar:** [COMANDOS_RAPIDOS.md](./COMANDOS_RAPIDOS.md) → Sección "Despliegue"
- **Build:** [COMANDOS_RAPIDOS.md](./COMANDOS_RAPIDOS.md) → Sección "Build"
- **Firebase:** [COMANDOS_RAPIDOS.md](./COMANDOS_RAPIDOS.md) → Sección "Firebase"

### Configuración
- **Credenciales:** [ACTUALIZAR_CREDENCIALES.md](./ACTUALIZAR_CREDENCIALES.md)
- **GitHub Secrets:** [ACTUALIZAR_CREDENCIALES.md](./ACTUALIZAR_CREDENCIALES.md) → Sección "Configurar Secrets"
- **Variables .env:** [ACTUALIZAR_CREDENCIALES.md](./ACTUALIZAR_CREDENCIALES.md) → Sección "Actualizar .env"

### Problemas
- **Errores comunes:** [GUIA_DESPLIEGUE_FIREBASE.md](./GUIA_DESPLIEGUE_FIREBASE.md) → Sección "Solución de Problemas"
- **Verificación:** [COMANDOS_RAPIDOS.md](./COMANDOS_RAPIDOS.md) → Sección "Verificación"

---

## 🎓 Flujo de Aprendizaje

### Nivel 1: Principiante
1. [PASOS_SIGUIENTES.md](./PASOS_SIGUIENTES.md) - Configuración inicial
2. [ACTUALIZAR_CREDENCIALES.md](./ACTUALIZAR_CREDENCIALES.md) - Credenciales
3. Ejecutar: `./deploy-to-firebase.sh`

### Nivel 2: Intermedio
1. [GUIA_DESPLIEGUE_FIREBASE.md](./GUIA_DESPLIEGUE_FIREBASE.md) - Entender el proceso
2. [COMANDOS_RAPIDOS.md](./COMANDOS_RAPIDOS.md) - Comandos útiles
3. Configurar GitHub Actions

### Nivel 3: Avanzado
1. [RESUMEN_CONFIGURACION.md](./RESUMEN_CONFIGURACION.md) - Arquitectura completa
2. Personalizar workflow de GitHub Actions
3. Optimizar proceso de build

---

## 📞 Soporte

### Antes de Pedir Ayuda

1. ✅ Ejecuta: `./verificar-configuracion.sh`
2. ✅ Revisa: [GUIA_DESPLIEGUE_FIREBASE.md](./GUIA_DESPLIEGUE_FIREBASE.md) → "Solución de Problemas"
3. ✅ Verifica: Credenciales en `.env`
4. ✅ Consulta: [COMANDOS_RAPIDOS.md](./COMANDOS_RAPIDOS.md) → "Solución de Problemas"

### Información Útil para Reportar Problemas

- Versión de Node.js: `node --version`
- Versión de Firebase CLI: `firebase --version`
- Logs del error completo
- Contenido de `.firebaserc` (sin datos sensibles)
- Output de `./verificar-configuracion.sh`

---

## 🎉 Recursos Adicionales

### URLs Importantes
- **App en Producción:** https://iglesia-casa-de-dios-ed5b2.web.app
- **Firebase Console:** https://console.firebase.google.com/project/iglesia-casa-de-dios-ed5b2
- **Firebase Hosting:** https://console.firebase.google.com/project/iglesia-casa-de-dios-ed5b2/hosting

### Documentación Externa
- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Expo Web Docs](https://docs.expo.dev/workflow/web/)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

---

## 📝 Notas

- Todos los archivos `.sh` requieren permisos de ejecución: `chmod +x archivo.sh`
- El archivo `.env` NO debe subirse a Git (ya está en `.gitignore`)
- Los scripts de Windows (`.bat`) se ejecutan directamente sin permisos especiales
- La documentación se actualiza automáticamente con cada cambio

---

## ✅ Checklist de Documentación Leída

Marca lo que ya leíste:

- [ ] PASOS_SIGUIENTES.md
- [ ] ACTUALIZAR_CREDENCIALES.md
- [ ] GUIA_DESPLIEGUE_FIREBASE.md
- [ ] COMANDOS_RAPIDOS.md
- [ ] RESUMEN_CONFIGURACION.md
- [ ] INDICE_DOCUMENTACION.md (este archivo)

---

**Última actualización:** 2025-01-13
**Versión:** 1.0
**Proyecto:** iglesia-casa-de-dios-ed5b2
