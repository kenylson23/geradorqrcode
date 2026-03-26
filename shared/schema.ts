import { z } from "zod";

export const qrTypes = ["url", "text", "whatsapp", "email", "phone", "pdf", "links", "vcard", "images", "facebook", "instagram", "business"] as const;
export type QrType = typeof qrTypes[number];

// Schema for URL QR Code (Used for site, facebook, instagram)
export const urlQrSchema = z.object({
  type: z.enum(["url", "facebook", "instagram"]),
  url: z.string().optional(),
  instagramUser: z.string().optional(),
  fileUrl: z.string().optional(),
  photoUrl: z.string().optional(),
  companyName: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  buttonLabel: z.string().optional(),
});

export const urlQrFormSchema = urlQrSchema.refine(data => {
  if (data.type === 'instagram') {
    return !!data.url || !!data.instagramUser;
  }
  return !!data.url || !!data.fileUrl;
}, {
  message: "URL ou Nome de usuário é obrigatório",
  path: ["url"]
});

export const textQrSchema = z.object({
  type: z.literal("text"),
  text: z.string().min(1, { message: "Text is required" }),
});

export const pdfQrSchema = z.object({
  type: z.literal("pdf"),
  url: z.string().url({ message: "Please enter a valid PDF URL" }).optional(),
  fileUrl: z.string().optional(),
  companyName: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  website: z.string().optional(),
  buttonLabel: z.string().optional(),
});

export const linksQrSchema = z.object({
  type: z.literal("links"),
  title: z.string().optional(),
  description: z.string().optional(),
  photoUrl: z.string().optional(),
  links: z.array(z.object({
    label: z.string().min(1),
    url: z.string().url(),
    imageUrl: z.string().optional(),
    iconUrl: z.string().optional(),
    socialType: z.string().optional()
  })).min(1, "At least one link is required"),
});

export const vcardQrSchema = z.object({
  type: z.literal("vcard"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(1, "Phone is required"),
  whatsappNumber: z.string().optional(),
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

export const imagesQrSchema = z.object({
  type: z.literal("images"),
  title: z.string().optional(),
  description: z.string().optional(),
  fileUrl: z.string().optional(),
  fileUrls: z.array(z.string()).optional(),
  website: z.string().optional(),
  buttonLabel: z.string().optional(),
});

export const whatsappQrSchema = z.object({
  type: z.literal("whatsapp"),
  phone: z.string().min(9, { message: "Phone number is required" }),
  message: z.string().optional(),
});

export const emailQrSchema = z.object({
  type: z.literal("email"),
  email: z.string().email({ message: "Invalid email address" }),
  subject: z.string().optional(),
  body: z.string().optional(),
});

export const phoneQrSchema = z.object({
  type: z.literal("phone"),
  phone: z.string().min(9, { message: "Phone number is required" }),
});

export const businessQrSchema = z.object({
  type: z.literal("business"),
  companyName: z.string().min(1, "Company name is required"),
  industry: z.string().min(1, "Industry is required"),
  caption: z.string().optional(),
  photoUrl: z.string().optional(),
  location: z.string().optional(),
  mapsUrl: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  phone: z.string().optional(),
  whatsappNumber: z.string().optional(),
  openingHours: z.array(z.object({
    day: z.string(),
    enabled: z.boolean().optional(),
    slots: z.array(z.object({
      from: z.string(),
      to: z.string()
    })).optional()
  })).optional(),
  socialLinks: z.array(z.object({
    platform: z.string(),
    url: z.string().url()
  })).optional(),
});

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

export const linkTreeSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  links: z.array(z.object({
    label: z.string(),
    url: z.string(),
  })),
});

export type LinkTreeData = z.infer<typeof linkTreeSchema>;
