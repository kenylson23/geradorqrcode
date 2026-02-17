import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// We don't strictly need a database for a static QR generator, 
// but we'll define the schemas here for form validation and type safety.

export const qrTypes = ["url", "text", "whatsapp", "email", "phone", "pdf", "links", "vcard", "video", "images", "facebook", "instagram"] as const;
export type QrType = typeof qrTypes[number];

// Schema for URL QR Code (Used for site, video, facebook, instagram)
export const urlQrSchema = z.object({
  type: z.enum(["url", "video", "facebook", "instagram"]),
  url: z.string().url({ message: "Please enter a valid URL" }).optional(),
  fileUrl: z.string().optional(),
  companyName: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
});

// Schema for Text QR Code
export const textQrSchema = z.object({
  type: z.literal("text"),
  text: z.string().min(1, { message: "Text is required" }),
});

// Schema for PDF QR Code
export const pdfQrSchema = z.object({
  type: z.literal("pdf"),
  url: z.string().url({ message: "Please enter a valid PDF URL" }).optional(),
  fileUrl: z.string().optional(),
});

// Schema for Links List QR Code
export const linksQrSchema = z.object({
  type: z.literal("links"),
  title: z.string().optional(),
  description: z.string().optional(),
  photoUrl: z.string().optional(),
  links: z.array(z.object({
    label: z.string().min(1),
    url: z.string().url(),
    iconUrl: z.string().optional()
  })).min(1, "At least one link is required"),
});

// Schema for vCard QR Code
export const vcardQrSchema = z.object({
  type: z.literal("vcard"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email().optional(),
  organization: z.string().optional(),
  jobTitle: z.string().optional(),
  photoUrl: z.string().optional(),
  website: z.string().url().optional(),
  location: z.string().optional(),
  companyName: z.string().optional(),
  profession: z.string().optional(),
  summary: z.string().optional(),
  socialLinks: z.array(z.object({
    platform: z.string(),
    url: z.string().url()
  })).optional(),
});

// Schema for Images QR Code
export const imagesQrSchema = z.object({
  type: z.literal("images"),
  urls: z.array(z.string().url()).optional(),
  fileUrls: z.array(z.string()).optional(),
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

// Schema for Business QR Code
export const businessQrSchema = z.object({
  type: z.literal("business"),
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),
  caption: z.string().optional(),
  photoUrl: z.string().optional(),
  location: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  phone: z.string().optional(),
  openingHours: z.array(z.object({
    day: z.string(),
    hours: z.string()
  })).optional(),
  socialLinks: z.array(z.object({
    platform: z.string(),
    url: z.string().url()
  })).optional(),
});

// Combined schema for the form
export const qrCodeFormSchema = z.discriminatedUnion("type", [
  urlQrSchema,
  textQrSchema,
  whatsappQrSchema,
  emailQrSchema,
  phoneQrSchema,
  pdfQrSchema,
  linksQrSchema,
  vcardQrSchema,
  imagesQrSchema,
  businessQrSchema,
]);

export type QrCodeForm = z.infer<typeof qrCodeFormSchema>;

// No database tables needed for this static MVP, but keeping the file structure valid.
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users);
