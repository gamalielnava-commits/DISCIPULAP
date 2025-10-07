import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { ChurchDataService } from "@/services/firebase";

export default publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    await ChurchDataService.deleteSermon(input.id);
    return { ok: true };
  });