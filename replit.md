# QR Ango - QR Code Generator

## Overview

QR Ango is a fully static QR code generator web application targeted at Portuguese-speaking users (primarily Angola). Users can generate QR codes for URLs, plain text, WhatsApp messages, emails, phone numbers, PDFs, links pages, vCards, image galleries, Facebook, Instagram, and business profiles. All QR generation logic runs entirely in the browser — no database or backend API is needed. The app includes a form to input data, generates a QR code preview, and allows downloading the result as a PNG image.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript, bundled via Vite
- **Routing**: Wouter (lightweight client-side router)
- **UI Components**: shadcn/ui (new-york style) built on Radix UI primitives with Tailwind CSS
- **Styling**: Tailwind CSS with CSS variables for theming (green/Angolan-inspired color palette). Fonts: DM Sans (body), Outfit (display)
- **Forms**: react-hook-form with Zod validation via @hookform/resolvers
- **State Management**: React hooks (useState). TanStack React Query is available but minimally used since the app is mostly client-side
- **Animations**: Framer Motion for transitions
- **QR Code Rendering**: `qrcode.react` (QRCodeSVG component)
- **Download**: `html-to-image` converts the QR element to PNG, `file-saver` triggers the download

### Backend
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript, run via `tsx` in development
- **Purpose**: Serves the static frontend only. No database. Minimal API structure.
- **API**: Single `/api/health` endpoint + Replit object storage routes (for file uploads)
- **Build**: esbuild bundles the server for production; Vite builds the client

### Shared Code (`shared/`)
- **Schema** (`shared/schema.ts`): Contains Zod validation schemas for all QR code form types using discriminated unions. No database tables — fully client-side validation only.

### Static URL Encoding Strategy

All QR types encode their data directly in the URL, requiring no backend storage:

| Type | URL Pattern | Encoding |
|------|------------|---------|
| URL | Direct URL | None |
| WhatsApp | `wa.me/...` | None |
| Email | `mailto:...` | None |
| Phone | `tel:...` | None |
| Text | Plain text | None |
| PDF | `/l#<base64>` | Base64 JSON |
| Links | `/l#<base64>` | Base64 JSON |
| vCard | `/c#<base64>` | Base64 JSON |
| Images | `/i/<encoded>` | URI-encoded JSON |
| Instagram | `/ig/<encoded>` | URI-encoded JSON |
| Facebook | `/fb/<encoded>` | URI-encoded JSON |
| **Business** | `/b#<lz>` | **LZ-String compressed JSON** |

The `business` type uses LZ-String compression to fit the richer data set (opening hours, social links, etc.) into a QR code URL without exceeding size limits. Cloudinary image URLs are also shortened before compression.

### Project Structure
```
client/               # Frontend React application
  src/
    components/       # App components (Header, Footer, QrForm, QrResult, LinkTree)
    components/ui/    # shadcn/ui component library
    hooks/            # Custom hooks (use-qr-generator, use-upload, use-toast)
    lib/              # Utilities (queryClient, cn helper)
    pages/            # Page components (Home, BusinessPage, VCardPage, etc.)
server/               # Express backend
  index.ts            # Server entry point
  routes.ts           # Minimal API route registration (health + object storage)
  vite.ts             # Vite dev server integration
  static.ts           # Static file serving for production
shared/               # Shared between client and server
  schema.ts           # Zod validation schemas only (no DB tables)
```

### Key Design Decisions

1. **Fully static**: All QR data is encoded in the URL (hash or path). No database, no server-side storage needed.

2. **Client-side generation**: QR codes are generated entirely in the browser using `qrcode.react`. No server round-trip needed.

3. **LZ-String for business QR**: The business profile type encodes rich JSON data using LZ-String compression to stay within QR code size limits.

4. **Direct Cloudinary uploads**: File uploads go directly from browser to Cloudinary using unsigned upload presets (`VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`). No server proxy needed.

5. **Discriminated union for form types**: The form schema uses Zod discriminated unions (`qrCodeFormSchema`) for type-safe validation.

6. **Portuguese (pt) localization**: All UI text is in Portuguese, targeting Angolan users. The theme uses green colors inspired by the Angolan flag.

### Development & Build
- **Dev**: `npm run dev` — runs Express with Vite middleware for HMR
- **Build**: `npm run build` — Vite builds the client to `dist/public`, esbuild bundles the server to `dist/index.cjs`
- **Production**: `npm start` — runs the bundled server which serves static files

## External Dependencies

- **Cloudinary**: Used for file uploads (PDFs, images). Client uploads directly using unsigned preset. Required env vars: `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`.
- **Google Fonts**: DM Sans, Outfit loaded via CDN in `index.html`
- **No database required**: The server starts with no `DATABASE_URL` needed.
- **Key npm packages**:
  - `qrcode.react` — QR code SVG rendering
  - `html-to-image` + `file-saver` — QR code PNG download
  - `lz-string` — compression for business QR URL encoding
  - `framer-motion` — animations
