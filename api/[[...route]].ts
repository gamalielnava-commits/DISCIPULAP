import type { VercelRequest, VercelResponse } from '@vercel/node';
import app from "../backend/hono";

export const config = {
  runtime: "nodejs20.x",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  const request = new Request(url.toString(), {
    method: req.method || 'GET',
    headers: new Headers(req.headers as Record<string, string>),
    body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
  });

  try {
    const response = await app.fetch(request);
    const body = await response.text();
    
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    
    res.status(response.status).send(body);
  } catch (err) {
    console.error("Vercel handler error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
