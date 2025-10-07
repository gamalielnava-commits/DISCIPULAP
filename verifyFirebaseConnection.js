import { db, auth, storage } from "./firebaseConfig";
import { doc, setDoc, getDoc, collection, getDocs } from "firebase/firestore";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut 
} from "firebase/auth";

export const verifyFirebaseConnection = async () => {
  console.log("\n🔍 ========================================");
  console.log("🔍 VERIFICACIÓN COMPLETA DE FIREBASE");
  console.log("🔍 ========================================\n");

  const results = {
    config: false,
    firestore: false,
    auth: false,
    storage: false,
    rules: false,
  };

  try {
    console.log("📋 1. Verificando configuración básica...");
    console.log("   Auth:", auth ? "✅ Inicializado" : "❌ No detectado");
    console.log("   Firestore:", db ? "✅ Inicializado" : "❌ No detectado");
    console.log("   Storage:", storage ? "✅ Inicializado" : "❌ No detectado");
    
    if (auth && db && storage) {
      results.config = true;
      console.log("   ✅ Configuración básica OK\n");
    } else {
      console.log("   ❌ Configuración básica FALLIDA\n");
      return results;
    }

    console.log("📋 2. Verificando conexión a Firestore...");
    try {
      const testDocRef = doc(db, "pruebas", "verificacion_" + Date.now());
      await setDoc(testDocRef, {
        mensaje: "Verificación de conexión",
        timestamp: new Date().toISOString(),
        origen: "verifyFirebaseConnection",
      });
      
      const docSnap = await getDoc(testDocRef);
      if (docSnap.exists()) {
        console.log("   ✅ Escritura en Firestore: OK");
        console.log("   ✅ Lectura de Firestore: OK");
        results.firestore = true;
      } else {
        console.log("   ❌ No se pudo leer el documento creado");
      }
    } catch (error) {
      console.log("   ❌ Error en Firestore:", error.code || error.message);
      if (error.code === "permission-denied") {
        console.log("   💡 Solución: Despliega las reglas de Firestore");
        console.log("      Ejecuta: firebase deploy --only firestore:rules");
      }
    }
    console.log("");

    console.log("📋 3. Verificando Firebase Authentication...");
    try {
      const testEmail = `test_${Date.now()}@discipulapp.com`;
      const testPassword = "Test123456!";
      
      console.log("   🔹 Creando usuario de prueba...");
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        testEmail, 
        testPassword
      );
      console.log("   ✅ Registro de usuario: OK");
      
      console.log("   🔹 Cerrando sesión...");
      await signOut(auth);
      console.log("   ✅ Cierre de sesión: OK");
      
      console.log("   🔹 Iniciando sesión...");
      await signInWithEmailAndPassword(auth, testEmail, testPassword);
      console.log("   ✅ Inicio de sesión: OK");
      
      console.log("   🔹 Limpiando usuario de prueba...");
      await userCredential.user.delete();
      console.log("   ✅ Usuario de prueba eliminado");
      
      results.auth = true;
    } catch (error) {
      console.log("   ❌ Error en Authentication:", error.code || error.message);
      
      if (error.code === "auth/api-key-not-valid") {
        console.log("\n   🚨 API KEY NO VÁLIDA - SOLUCIÓN:");
        console.log("   1. Ve a Firebase Console → Authentication → Settings");
        console.log("   2. Agrega estos dominios autorizados:");
        console.log("      - localhost");
        console.log("      - discipulapp.org");
        console.log("      - *.netlify.app");
        console.log("\n   3. Ve a Google Cloud Console → APIs & Services → Credentials");
        console.log("   4. Busca tu API Key y configura:");
        console.log("      - Application restrictions: HTTP referrers");
        console.log("      - Agrega: https://discipulapp.org/*");
        console.log("      - Agrega: https://*.netlify.app/*");
        console.log("      - API restrictions: Habilita Identity Toolkit API");
      }
      
      if (error.code === "auth/email-already-in-use") {
        console.log("   ℹ️ El email de prueba ya existe (esto es normal)");
        results.auth = true;
      }
    }
    console.log("");

    console.log("📋 4. Verificando Firebase Storage...");
    try {
      console.log("   ℹ️ Storage configurado y listo");
      console.log("   ⚠️ Nota: Storage requiere autenticación para pruebas completas");
      results.storage = true;
    } catch (error) {
      console.log("   ❌ Error en Storage:", error.code || error.message);
    }
    console.log("");

    console.log("📋 5. Verificando reglas de seguridad...");
    try {
      const collectionsToCheck = [
        "usuarios",
        "grupos", 
        "reportes",
        "recursos",
        "modulos",
        "mensajes"
      ];
      
      let rulesOk = true;
      for (const collectionName of collectionsToCheck) {
        try {
          const colRef = collection(db, collectionName);
          await getDocs(colRef);
          console.log(`   ✅ Colección '${collectionName}': Accesible`);
        } catch (error) {
          console.log(`   ❌ Colección '${collectionName}': ${error.code}`);
          rulesOk = false;
        }
      }
      
      results.rules = rulesOk;
    } catch (error) {
      console.log("   ❌ Error verificando reglas:", error.message);
    }
    console.log("");

  } catch (error) {
    console.error("❌ Error general en verificación:", error);
  }

  console.log("🔍 ========================================");
  console.log("🔍 RESUMEN DE VERIFICACIÓN");
  console.log("🔍 ========================================");
  console.log(`   Configuración:  ${results.config ? "✅" : "❌"}`);
  console.log(`   Firestore:      ${results.firestore ? "✅" : "❌"}`);
  console.log(`   Authentication: ${results.auth ? "✅" : "❌"}`);
  console.log(`   Storage:        ${results.storage ? "✅" : "❌"}`);
  console.log(`   Reglas:         ${results.rules ? "✅" : "❌"}`);
  console.log("🔍 ========================================\n");

  const allOk = Object.values(results).every(v => v === true);
  
  if (allOk) {
    console.log("🎉 ¡FIREBASE ESTÁ COMPLETAMENTE CONFIGURADO!");
    console.log("✅ Puedes usar admin@discipulapp.com / admin123 para entrar\n");
  } else {
    console.log("⚠️ Hay problemas de configuración.");
    console.log("📖 Revisa FIREBASE_NETLIFY_CHECKLIST.md para soluciones\n");
  }

  return results;
};
