import { z } from "zod";
import { publicProcedure } from "@/backend/trpc/create-context";
import { ChurchDataAdminService } from "@/backend/services/firebaseAdmin";

export default publicProcedure
  .input(z.object({ userId: z.string(), moduleId: z.string().optional() }))
  .query(async ({ input }) => {
    const items = await ChurchDataAdminService.listDiscipleshipEntries(input.userId, input.moduleId);
    return items;
  });