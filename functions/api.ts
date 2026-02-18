import express, { type Request, Response, NextFunction } from "express";
import serverless from "serverless-http";
import { registerRoutes } from "../server/routes";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Helper to register routes and handle errors
const handlerPromise = (async () => {
  await registerRoutes(httpServer, app);
  
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });
  
  return serverless(app);
})();

export const handler = async (event: any, context: any) => {
  const serverlessHandler = await handlerPromise;
  return serverlessHandler(event, context);
};
