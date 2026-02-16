import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// We don't strictly need a database for a static QR generator, 
// but we'll define the schemas here for form validation and type safety.

export const qrTypes = ["url", "text", "whatsapp", "email", "phone"] as const;
export type QrType = typeof qrTypes[number];

// Schema for URL QR Code
export const urlQrSchema = z.object({
  type: z.literal("url"),
  url: z.string().url({ message: "Please enter a valid URL" }),
});

// Schema for Text QR Code
export const textQrSchema = z.object({
  type: z.literal("text"),
  text: z.string().min(1, { message: "Text is required" }),
});

// Schema for WhatsApp QR Code
export const whatsappQrSchema = z.object({
  type: z.literal("whatsapp"),
  phone: z.string().min(9, { message: "Phone number is required" }),
  message: z.string().optional(),
});

// Schema for Email QR Code
export const emailQrSchema = z.object({
  type: z.literal("email"),
  email: z.string().email({ message: "Invalid email address" }),
  subject: z.string().optional(),
  body: z.string().optional(),
});

// Schema for Phone QR Code
export const phoneQrSchema = z.object({
  type: z.literal("phone"),
  phone: z.string().min(9, { message: "Phone number is required" }),
});

// Combined schema for the form
export const qrCodeFormSchema = z.discriminatedUnion("type", [
  urlQrSchema,
  textQrSchema,
  whatsappQrSchema,
  emailQrSchema,
  phoneQrSchema,
]);

export type QrCodeForm = z.infer<typeof qrCodeFormSchema>;

// No database tables needed for this static MVP, but keeping the file structure valid.
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users);
