import * as functions from "firebase-functions";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { trpcServer } from "@hono/trpc-server";
import { initializeApp } from "firebase-admin/app";
import { appRouter } from "./trpc/app-router";
import { createContext } from "./trpc/create-context";

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

export const api = functions.https.onRequest(async (req, res) => {
  const url = `${req.protocol}://${req.get('host')}${req.url}`;
  
  const honoResponse = await app.fetch(url, {
    method: req.method,
    headers: req.headers as any,
    body: req.body ? JSON.stringify(req.body) : undefined,
  });

  const body = await honoResponse.text();
  
  res
    .status(honoResponse.status)
    .set(Object.fromEntries(honoResponse.headers.entries()))
    .send(body);
});
