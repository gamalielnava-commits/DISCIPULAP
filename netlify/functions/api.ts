import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { Hono } from "hono";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "../../backend/trpc/app-router";
import { createContext } from "../../backend/trpc/create-context";

if (typeof window !== 'undefined') {
  throw new Error('This module should only run on the server');
}

const app = new Hono();

app.use("*", cors());

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

export const handler: Handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  const path = event.path.replace(/^\/\.netlify\/functions\/api/, "") || "/";
  
  const request = new Request(`https://example.com${path}`, {
    method: event.httpMethod,
    headers: new Headers(event.headers as Record<string, string>),
    body: event.body || undefined,
  });

  try {
    const response = await app.fetch(request);
    const body = await response.text();

    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key] = value;
    });

    return {
      statusCode: response.status,
      headers,
      body,
    };
  } catch (error) {
    console.error("Error in Netlify function:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};
