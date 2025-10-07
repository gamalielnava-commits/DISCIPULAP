import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { ChurchDataService } from "@/services/firebase";

export default publicProcedure
  .input(z.object({ type: z.string(), since: z.string().optional() }))
  .query(async ({ input }) => {
    const sinceDate = input.since ? new Date(input.since) : undefined;
    const items = await ChurchDataService.getStatsByType(input.type, sinceDate);
    return items;
  });