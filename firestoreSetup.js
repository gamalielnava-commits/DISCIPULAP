import { db } from "./firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

export const initializeFirestoreStructure = async () => {
  console.log("🚀 Configurando estructura de Firestore...");

  try {
    // Colección de usuarios
    await setDoc(doc(db, "usuarios", "ejemploUsuario"), {
      nombre: "Juan Pérez",
      email: "juanperez@example.com",
      rol: "líder",
      grupoAsignado: "grupo_norte",
      fechaRegistro: new Date().toISOString(),
    });
    console.log("✅ Colección 'usuarios' creada");

    // Colección de grupos
    await setDoc(doc(db, "grupos", "grupo_norte"), {
      nombre: "Discipulado Norte",
      lider: "Juan Pérez",
      miembros: ["maria@example.com", "carlos@example.com"],
      reuniones: ["2024-10-01", "2024-10-08"],
    });
    console.log("✅ Colección 'grupos' creada");

    // Colección de reportes
    await setDoc(doc(db, "reportes", "reporte_inicial"), {
      grupo: "grupo_norte",
      tema: "La fe en acción",
      fecha: new Date().toISOString(),
      asistentes: 8,
      notas: "Buen inicio de discipulado.",
    });
    console.log("✅ Colección 'reportes' creada");

    // Colección de recursos
    await setDoc(doc(db, "recursos", "guia_biblica"), {
      titulo: "Guía Bíblica Semana 1",
      tipo: "PDF",
      url: "https://tuservidor.com/recursos/guia1.pdf",
      descripcion: "Material de estudio para grupos de discipulado.",
    });
    console.log("✅ Colección 'recursos' creada");

    console.log("✅ Estructura de Firestore creada correctamente.");
  } catch (error) {
    console.error("❌ Error creando estructura de Firestore:", error);
  }
};
