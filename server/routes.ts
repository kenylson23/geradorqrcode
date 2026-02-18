import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { registerUploadRoutes } from "./upload";
import cloudinary from "./cloudinary";
import multer from "multer";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Local file upload routes
  registerUploadRoutes(app);

  // Register object storage routes for file uploads
  registerObjectStorageRoutes(app);

  // Netlify Function-like endpoint for Cloudinary uploads
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  return httpServer;
}
