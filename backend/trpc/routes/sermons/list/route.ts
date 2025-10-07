import { publicProcedure } from "@/backend/trpc/create-context";
import { ChurchDataService } from "@/services/firebase";

export default publicProcedure.query(async () => {
  const items = await ChurchDataService.listSermons();
  return items;
});