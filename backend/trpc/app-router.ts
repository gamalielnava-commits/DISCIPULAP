import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import createModuloProcedure from "./routes/modulos/create/route";
import listModulosProcedure from "./routes/modulos/list/route";
import updateModuloProcedure from "./routes/modulos/update/route";
import deleteModuloProcedure from "./routes/modulos/delete/route";

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
});

export type AppRouter = typeof appRouter;