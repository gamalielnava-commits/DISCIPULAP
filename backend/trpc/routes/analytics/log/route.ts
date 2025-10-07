import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { ChurchDataService } from "@/services/firebase";

export default publicProcedure
  .input(
    z.object({
      type: z.string(),
      userId: z.string().optional(),
      payload: z.record(z.string(), z.unknown()).optional(),
    })
  )
  .mutation(async ({ input }) => {
    const id = await ChurchDataService.logStat({
      type: input.type,
      userId: input.userId,
      payload: input.payload,
    });
    return { id };
  });