import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { db } from "../../../../../services/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

export const updateMensajeProcedure = protectedProcedure
  .input(
    z.object({
      id: z.string(),
      titulo: z.string().min(1).optional(),
      contenido: z.string().min(1).optional(),
      imagenUrl: z.string().optional(),
      tipo: z.enum(["general", "importante", "urgente"]).optional(),
    })
  )
  .mutation(async ({ input }) => {
    const { id, ...updateData } = input;
    const mensajeRef = doc(db, "mensajes", id);
    
    await updateDoc(mensajeRef, {
      ...updateData,
      fechaActualizacion: serverTimestamp(),
    });

    return { success: true, id };
  });
