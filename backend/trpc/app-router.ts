import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import createModuloProcedure from "./routes/modulos/create/route";
import listModulosProcedure from "./routes/modulos/list/route";
import updateModuloProcedure from "./routes/modulos/update/route";
import deleteModuloProcedure from "./routes/modulos/delete/route";
import upsertProgressProcedure from "./routes/progress/upsert/route";
import getProgressByUserProcedure from "./routes/progress/get-by-user/route";
import addDiscipleshipEntryProcedure from "./routes/discipleship/add-entry/route";
import listDiscipleshipByUserProcedure from "./routes/discipleship/list-by-user/route";
import createSermonProcedure from "./routes/sermons/create/route";
import updateSermonProcedure from "./routes/sermons/update/route";
import listSermonsProcedure from "./routes/sermons/list/route";
import deleteSermonProcedure from "./routes/sermons/delete/route";
import logAnalyticsProcedure from "./routes/analytics/log/route";
import listAnalyticsByTypeProcedure from "./routes/analytics/list-by-type/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
  }),
  modulos: createTRPCRouter({
    create: createModuloProcedure,
    list: listModulosProcedure,
    update: updateModuloProcedure,
    delete: deleteModuloProcedure,
  }),
  progress: createTRPCRouter({
    upsert: upsertProgressProcedure,
    getByUser: getProgressByUserProcedure,
  }),
  discipleship: createTRPCRouter({
    addEntry: addDiscipleshipEntryProcedure,
    listByUser: listDiscipleshipByUserProcedure,
  }),
  sermons: createTRPCRouter({
    create: createSermonProcedure,
    update: updateSermonProcedure,
    list: listSermonsProcedure,
    delete: deleteSermonProcedure,
  }),
  analytics: createTRPCRouter({
    log: logAnalyticsProcedure,
    listByType: listAnalyticsByTypeProcedure,
  }),
});

export type AppRouter = typeof appRouter;