import { protectedProcedure } from "../../../create-context";
import { db } from "../../../../../services/firebase";
import { collection, query, orderBy, getDocs, where } from "firebase/firestore";

export const listMensajesProcedure = protectedProcedure.query(async () => {
  const mensajesRef = collection(db, "mensajes");
  const q = query(
    mensajesRef,
    where("activo", "==", true),
    orderBy("fechaCreacion", "desc")
  );
  
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    fechaCreacion: doc.data().fechaCreacion?.toDate?.()?.toISOString() || new Date().toISOString(),
  }));
});
