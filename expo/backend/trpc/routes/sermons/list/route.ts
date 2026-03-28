import { publicProcedure } from "@/backend/trpc/create-context";
import { ChurchDataAdminService } from "@/backend/services/firebaseAdmin";

export default publicProcedure.query(async () => {
  const items = await ChurchDataAdminService.listSermons();
  return items;
});