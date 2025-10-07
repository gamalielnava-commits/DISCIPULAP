import { auth, db } from "./firebaseConfig";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

export const registerUser = async (nombre, email, password, rol = "miembro") => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "usuarios", user.uid), {
      nombre,
      email,
      rol,
      fechaRegistro: new Date().toISOString(),
      activo: true,
    });

    console.log("✅ Usuario registrado y guardado en Firestore:", nombre);
    return user;
  } catch (error) {
    console.error("❌ Error al registrar usuario:", error.message);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const docRef = doc(db, "usuarios", user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log("✅ Sesión iniciada:", docSnap.data());
      return docSnap.data();
    } else {
      console.warn("⚠️ Usuario autenticado pero sin documento en Firestore.");
      return null;
    }
  } catch (error) {
    console.error("❌ Error al iniciar sesión:", error.message);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    console.log("👋 Sesión cerrada correctamente.");
  } catch (error) {
    console.error("❌ Error al cerrar sesión:", error.message);
  }
};
