import { onRequest } from "firebase-functions/v2/https";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { trpcServer } from "@hono/trpc-server";
import { initializeApp } from "firebase-admin/app";
import { appRouter } from "./trpc/app-router.js";
import { createContext } from "./trpc/create-context.js";

initializeApp();

const app = new Hono();

app.use("*", cors({
  origin: "*",
  credentials: true,
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"]
}));

app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/api/trpc",
    router: appRouter,
    createContext,
  })
);

app.get("/", (c) => {
  return c.json({ status: "ok", message: "API is running" });
});

export const api = onRequest(
  {
    region: "us-central1",
    timeoutSeconds: 60,
    memory: "512MiB",
  },
  async (request: any, response: any) => {
    const honoResponse = await app.fetch(request.url, {
      method: request.method,
      headers: request.headers as HeadersInit,
      body: request.body ? JSON.stringify(request.body) : undefined,
    });

    const body = await honoResponse.text();
    
    response
      .status(honoResponse.status)
      .set(Object.fromEntries(honoResponse.headers.entries()))
      .send(body);
  }
);
