import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { ChurchDataAdminService } from "@/backend/services/firebaseAdmin";

const schema = z.object({
  userId: z.string(),
  moduleId: z.string(),
  lessonId: z.string(),
  status: z.enum(["iniciado", "completado", "pendiente"]),
  score: z.number().optional(),
  answers: z.record(z.string(), z.unknown()).optional(),
  completedAt: z.coerce.date().nullable().optional(),
});

export default publicProcedure
  .input(schema)
  .mutation(async ({ input }) => {
    const id = await ChurchDataAdminService.upsertUserProgress(input);
    return { id };
  });