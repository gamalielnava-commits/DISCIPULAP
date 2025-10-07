import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { ChurchDataService } from "@/services/firebase";

export default publicProcedure
  .input(z.object({ userId: z.string(), moduleId: z.string().optional() }))
  .query(async ({ input }) => {
    const items = await ChurchDataService.listDiscipleshipEntries(input.userId, input.moduleId);
    return items;
  });