import type { Express } from "express";
import type { Server } from "http";
import rateLimit from "express-rate-limit";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";

const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas requisições. Tente novamente em 15 minutos." },
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiados uploads. Tente novamente em 1 minuto." },
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.use("/api", generalApiLimiter);
  app.use("/api/object-storage", uploadLimiter);

  registerObjectStorageRoutes(app);

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  return httpServer;
}
