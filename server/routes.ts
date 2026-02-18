import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { registerUploadRoutes } from "./upload";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Local file upload routes
  registerUploadRoutes(app);

  // Register object storage routes for file uploads
  registerObjectStorageRoutes(app);

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  return httpServer;
}
