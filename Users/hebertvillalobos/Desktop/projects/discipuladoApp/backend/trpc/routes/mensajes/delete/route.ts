import { z } from "zod";
import { protectedProcedure } from "../../../create-context";
import { db } from "../../../../../services/firebase";
import { doc, deleteDoc } from "firebase/firestore";

export const deleteMensajeProcedure = protectedProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    const mensajeRef = doc(db, "mensajes", input.id);
    await deleteDoc(mensajeRef);
    
    return { success: true, id: input.id };
  });
