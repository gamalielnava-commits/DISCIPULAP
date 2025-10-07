import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { ChurchDataService } from "@/services/firebase";

export default publicProcedure
  .input(z.object({ userId: z.string(), moduleId: z.string().optional() }))
  .query(async ({ input }) => {
    if (input.moduleId) {
      const items = await ChurchDataService.getUserModuleProgress(input.userId, input.moduleId);
      return items;
    }
    const items = await ChurchDataService.getUserProgress(input.userId);
    return items;
  });