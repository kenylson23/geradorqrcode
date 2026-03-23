import { users, qrPages, type User, type InsertUser, type QrPage } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import cloudinary from "./cloudinary";
import { Buffer } from "node:buffer";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  uploadImage(buffer: Buffer): Promise<string>;
  saveQrPage(slug: string, data: string): Promise<void>;
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
    await db.insert(qrPages).values({ slug, data });
  }

  async updateQrPage(slug: string, data: string): Promise<void> {
    await db.update(qrPages).set({ data }).where(eq(qrPages.slug, slug));
  }

  async getQrPage(slug: string): Promise<QrPage | undefined> {
    const [page] = await db.select().from(qrPages).where(eq(qrPages.slug, slug));
    return page;
  }
}

export const storage = new DatabaseStorage();
