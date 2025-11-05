import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { ChurchDataAdminService } from "@/backend/services/firebaseAdmin";

export default publicProcedure
  .input(
    z.object({
      userId: z.string(),
      moduleId: z.string(),
      lessonId: z.string().optional(),
      note: z.string().optional(),
      checkpoint: z.enum(["inicio", "medio", "fin"]).optional(),
      extra: z.record(z.string(), z.any()).optional(),
    })
  )
  .mutation(async ({ input }) => {
    const id = await ChurchDataAdminService.addDiscipleshipEntry(input);
    return { id };
  });