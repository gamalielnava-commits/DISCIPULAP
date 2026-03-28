import { onRequest } from "firebase-functions/v2/https";
import { setGlobalOptions } from "firebase-functions/v2";
import app from "./hono.js";

setGlobalOptions({
  region: "us-central1",
  maxInstances: 10,
});

export const api = onRequest(
  {
    cors: true,
    timeoutSeconds: 60,
    memory: "256MiB",
  },
  async (request, response) => {
    return app.fetch(request, {}, {}).then((res) => {
      response.status(res.status);
      res.headers.forEach((value, key) => {
        response.setHeader(key, value);
      });
      return res.text().then((body) => {
        response.send(body);
      });
    });
  }
);
