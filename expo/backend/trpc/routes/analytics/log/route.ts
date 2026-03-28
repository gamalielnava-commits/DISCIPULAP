import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { ChurchDataAdminService } from "@/backend/services/firebaseAdmin";

export default publicProcedure
  .input(
    z.object({
      type: z.string(),
      userId: z.string().optional(),
      payload: z.record(z.string(), z.unknown()).optional(),
    })
  )
  .mutation(async ({ input }) => {
    const id = await ChurchDataAdminService.logStat({
      type: input.type,
      userId: input.userId,
      payload: input.payload,
    });
    return { id };
  });