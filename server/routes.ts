import type { Express } from "express";
import type { Server } from "http";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { storage } from "./storage";
import { nanoid } from "nanoid";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  registerObjectStorageRoutes(app);

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Save business/links page data and return a short slug
  app.post("/api/pages", async (req, res) => {
    try {
      const { data } = req.body;
      if (!data || typeof data !== "object") {
        return res.status(400).json({ error: "Data is required" });
      }
      const slug = nanoid(8);
      await storage.createQrPage(slug, JSON.stringify(data));
      res.json({ slug });
    } catch (err) {
      console.error("Error saving page:", err);
      res.status(500).json({ error: "Failed to save page" });
    }
  });

  // Update an existing page slug with new data
  app.put("/api/pages/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const { data } = req.body;
      if (!data || typeof data !== "object") {
        return res.status(400).json({ error: "Data is required" });
      }
      await storage.updateQrPage(slug, JSON.stringify(data));
      res.json({ slug });
    } catch (err) {
      console.error("Error updating page:", err);
      res.status(500).json({ error: "Failed to update page" });
    }
  });

  // Get page data by slug
  app.get("/api/pages/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const page = await storage.getQrPage(slug);
      if (!page) {
        return res.status(404).json({ error: "Page not found" });
      }
      res.json({ data: JSON.parse(page.data) });
    } catch (err) {
      console.error("Error fetching page:", err);
      res.status(500).json({ error: "Failed to fetch page" });
    }
  });

  return httpServer;
}
