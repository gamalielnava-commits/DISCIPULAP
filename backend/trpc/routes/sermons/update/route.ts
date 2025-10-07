import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { ChurchDataService } from "@/services/firebase";

export default publicProcedure
  .input(
    z.object({
      id: z.string(),
      updates: z.object({}).passthrough(),
    })
  )
  .mutation(async ({ input }) => {
    await ChurchDataService.updateSermon(input.id, input.updates as any);
    return { ok: true };
  });