import { z } from "zod";
import { publicProcedure } from "../../../create-context";
import { ChurchDataAdminService } from "../../../services/firebaseAdmin";

export default publicProcedure
  .input(z.object({ type: z.string(), since: z.string().optional() }))
  .query(async ({ input }) => {
    const sinceDate = input.since ? new Date(input.since) : undefined;
    const items = await ChurchDataAdminService.getStatsByType(input.type, sinceDate);
    return items;
  });
