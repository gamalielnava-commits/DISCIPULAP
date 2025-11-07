import app from "../backend/hono";

export const config = {
  runtime: "nodejs",
  maxDuration: 30,
};

export default async function handler(req: Request): Promise<Response> {
  try {
    return await app.fetch(req);
  } catch (err) {
    console.error("Vercel edge error", err);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
