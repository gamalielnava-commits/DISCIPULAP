import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { db } from "../../../../../services/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const createMensajeProcedure = protectedProcedure
  .input(
    z.object({
      titulo: z.string().min(1),
      contenido: z.string().min(1),
      imagenUrl: z.string().optional(),
      tipo: z.enum(["general", "importante", "urgente"]).default("general"),
    })
  )
  .mutation(async ({ input, ctx }) => {
    const mensajesRef = collection(db, "mensajes");
    
    const docRef = await addDoc(mensajesRef, {
      ...input,
      creadoPor: ctx.user.uid,
      creadoPorNombre: ctx.user.displayName || ctx.user.email,
      fechaCreacion: serverTimestamp(),
      activo: true,
    });

    return { id: docRef.id, ...input };
  });
