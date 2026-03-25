import { users, type User, type InsertUser, type QrPage } from "@shared/schema";
import { db, neonSql } from "./db";
import { eq } from "drizzle-orm";
import cloudinary from "./cloudinary";
import { Buffer } from "node:buffer";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  uploadImage(buffer: Buffer): Promise<string>;
  createQrPage(slug: string, data: string): Promise<void>;
  updateQrPage(slug: string, data: string): Promise<void>;
  getQrPage(slug: string): Promise<QrPage | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async uploadImage(buffer: Buffer): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "app_uploads",
          resource_type: "auto",
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error("Upload failed: No result from Cloudinary"));
          resolve(result.secure_url);
        }
      );
      uploadStream.end(buffer);
    });
  }

  async createQrPage(slug: string, data: string): Promise<void> {
    await neonSql`INSERT INTO qr_pages (slug, data) VALUES (${slug}, ${data})`;
  }

  async updateQrPage(slug: string, data: string): Promise<void> {
    await neonSql`UPDATE qr_pages SET data = ${data} WHERE slug = ${slug}`;
  }

  async getQrPage(slug: string): Promise<QrPage | undefined> {
    const rows = await neonSql`SELECT slug, data, created_at FROM qr_pages WHERE slug = ${slug} LIMIT 1`;
    if (!rows || rows.length === 0) return undefined;
    const row = rows[0];
    return { slug: row.slug, data: row.data, createdAt: row.created_at };
  }
}

export const storage = new DatabaseStorage();
