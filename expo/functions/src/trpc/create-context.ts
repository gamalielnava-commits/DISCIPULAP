import { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import { getAdminDb, getAdminAuth, getAdminStorage } from "../firebaseAdmin";

export const createContext = async (opts: FetchCreateContextFnOptions) => {
  return {
    req: opts.req,
    db: getAdminDb(),
    auth: getAdminAuth(),
    storage: getAdminStorage(),
  };
};

export type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure;
