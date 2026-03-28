import { publicProcedure } from "../../../create-context";
import { ChurchDataAdminService } from "../../../services/firebaseAdmin";

export default publicProcedure.query(async () => {
  const items = await ChurchDataAdminService.listSermons();
  return items;
});
