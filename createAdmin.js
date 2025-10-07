import { registerUser } from "./authService";

export const createAdminUser = async () => {
  console.log("🔐 Creando usuario administrador...");
  
  try {
    await registerUser(
      "Administrador",
      "admin@discipulapp.com",
      "admin123",
      "administrador"
    );
    console.log("✅ Usuario administrador creado exitosamente");
    console.log("📧 Email: admin@discipulapp.com");
    console.log("🔑 Contraseña: admin123");
    console.log("👤 Rol: administrador");
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      console.log("ℹ️ El usuario administrador ya existe");
      console.log("📧 Email: admin@discipulapp.com");
      console.log("🔑 Contraseña: admin123");
    } else if (error.code === "auth/invalid-email") {
      console.error("❌ Error: 'admin' no es un email válido. Firebase requiere un formato de email válido.");
      console.log("💡 Intenta usar: admin@discipulapp.com");
    } else {
      console.error("❌ Error al crear administrador:", error.message);
    }
  }
};
