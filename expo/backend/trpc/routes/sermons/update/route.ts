import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { ChurchDataAdminService } from "@/backend/services/firebaseAdmin";

export default publicProcedure
  .input(
    z.object({
      id: z.string(),
      updates: z.object({}).passthrough(),
    })
  )
  .mutation(async ({ input }) => {
    await ChurchDataAdminService.updateSermon(input.id, input.updates as any);
    return { ok: true };
  });