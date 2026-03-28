import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { ChurchDataAdminService } from "@/backend/services/firebaseAdmin";

export default publicProcedure
  .input(z.object({ userId: z.string(), moduleId: z.string().optional() }))
  .query(async ({ input }) => {
    if (input.moduleId) {
      const items = await ChurchDataAdminService.getUserModuleProgress(input.userId, input.moduleId);
      return items;
    }
    const items = await ChurchDataAdminService.getUserProgress(input.userId);
    return items;
  });