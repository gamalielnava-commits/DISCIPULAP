# ⚡ Solución Rápida: Problemas de Registro

## 🎯 Problema
Los usuarios no pueden registrarse. Error: `auth/operation-not-allowed`

---

## ✅ Solución en 3 Pasos

### 1️⃣ Habilitar Email/Password en Firebase (MÁS IMPORTANTE)

1. Ve a https://console.firebase.google.com/
2. Selecciona proyecto: **discipulapp-8d99c**
3. **Authentication** → **Sign-in method**
4. Habilita **Email/Password**
5. Guarda

**Esto es lo más importante. Sin este paso, nada funcionará.**

---

### 2️⃣ Verificar Dominios Autorizados

1. **Authentication** → **Settings** → **Authorized domains**
2. Verifica que estén estos dominios:
   - `localhost`
   - `discipulapp.org`
   - `*.netlify.app`
   - `*.firebaseapp.com`

---

### 3️⃣ Desplegar Reglas de Firestore

```bash
firebase login
firebase deploy --only firestore:rules
firebase deploy --only storage
```

O desde Firebase Console:
- **Firestore Database** → **Rules** → Copiar contenido de `firestore.rules` → **Publicar**

---

## 🧪 Probar

1. Reinicia la app
2. Ve a **Registro**
3. Completa el formulario
4. Haz clic en **Registrarse**
5. Deberías ver: "¡Registro Exitoso!" ✅

---

## 🔍 Si Sigue Sin Funcionar

### Error: "El registro está deshabilitado..."
→ Completa el **Paso 1**

### Error: "Dominio no autorizado..."
→ Completa el **Paso 2**

### Error: "permission-denied"
→ Completa el **Paso 3**

---

## 📞 Ayuda Adicional

- **Documento completo:** `GUIA_SOLUCION_REGISTRO.md`
- **Análisis técnico:** `ANALISIS_ERRORES_FIREBASE.md`
- **Logs:** Abre consola del navegador (F12)

---

## ⏱️ Tiempo Estimado
- Paso 1: 2 minutos
- Paso 2: 1 minuto
- Paso 3: 3 minutos
- **Total: ~6 minutos**

---

**Última actualización:** 2025-10-12
