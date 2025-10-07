import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import app from "../../backend/hono";

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
