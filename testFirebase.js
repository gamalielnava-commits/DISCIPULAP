import { db, auth, storage } from "./firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export const testFirebase = async () => {
  console.log("🔍 Verificando conexión con Firebase...");
  console.log("Auth:", auth ? "✅ Activo" : "❌ No detectado");
  console.log("Firestore:", db ? "✅ Activo" : "❌ No detectado");
  console.log("Storage:", storage ? "✅ Activo" : "❌ No detectado");

  try {
    await setDoc(doc(db, "pruebas", "conexion"), {
      mensaje: "Firebase conectado correctamente",
      fecha: new Date().toISOString(),
    });
    console.log("✅ Documento de prueba creado en Firestore (colección 'pruebas').");
  } catch (error) {
    console.error("❌ Error al conectar con Firestore:", error);
  }
};
