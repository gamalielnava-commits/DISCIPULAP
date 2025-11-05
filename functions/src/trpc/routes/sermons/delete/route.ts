import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { ChurchDataAdminService } from "../../../services/firebaseAdmin";

export default publicProcedure
  .input(z.object({ id: z.string() }))
  .mutation(async ({ input }) => {
    await ChurchDataAdminService.deleteSermon(input.id);
    return { ok: true };
  });
