import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { ChurchDataAdminService } from "@/backend/services/firebaseAdmin";

export default publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    await ChurchDataAdminService.deleteSermon(input.id);
    return { ok: true };
  });