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
  app.post("/api/cloudinary-upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }

      console.log("Iniciando upload para Cloudinary...");
      console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME ? "Configurado" : "NÃO CONFIGURADO");
      console.log("API Key:", process.env.CLOUDINARY_API_KEY ? "Configurado" : "NÃO CONFIGURADO");
      console.log("API Secret:", process.env.CLOUDINARY_API_SECRET ? "Configurado" : "NÃO CONFIGURADO");

      // Using the same logic as the Netlify function for consistency
      const uploadResponse = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { resource_type: "auto" },
          (error, result) => {
            if (error) {
              console.error("Erro no stream do Cloudinary:", error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        );
        uploadStream.end(req.file.buffer);
      });

      res.json({ 
        url: (uploadResponse as any).secure_url,
        public_id: (uploadResponse as any).public_id
      });
    } catch (error: any) {
      console.error("Cloudinary upload error:", error);
      res.status(500).json({ 
        error: error.message || "Falha no upload para Cloudinary",
        details: error.http_code ? `HTTP ${error.http_code}` : undefined
      });
    }
  });

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  return httpServer;
}
