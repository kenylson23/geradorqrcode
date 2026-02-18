import express from "express";
import multer from "multer";
import { storage as dbStorage } from "./storage";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export function registerUploadRoutes(app: express.Express) {
  app.post("/api/upload", upload.single("file"), async (req: express.Request, res: express.Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const imageUrl = await dbStorage.uploadImage(req.file.buffer);

      res.json({ 
        url: imageUrl,
        filename: req.file.originalname,
        size: req.file.size
      });
    } catch (error: any) {
      console.error("Cloudinary upload error:", error);
      res.status(500).json({ error: error.message || "Failed to upload to Cloudinary" });
    }
  });
}
