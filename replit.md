# QR Ango - QR Code Generator

## Overview

QR Ango is a client-side QR code generator web application targeted at Portuguese-speaking users (primarily Angola). Users can generate QR codes for URLs, plain text, WhatsApp messages, emails, and phone numbers. The core QR generation logic runs entirely in the browser — no backend API is needed for the main functionality. The app includes a form to input data, generates a QR code preview, and allows downloading the result as a PNG image.

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
- **Purpose**: Serves the static frontend and provides a minimal API structure. The backend is intentionally lightweight since core functionality is client-side
- **API**: Single `/api/health` endpoint. Routes are structured for future expansion
- **Build**: esbuild bundles the server for production; Vite builds the client

### Shared Code (`shared/`)
- **Schema** (`shared/schema.ts`): Contains Zod validation schemas for QR code form types (url, text, whatsapp, email, phone) using discriminated unions. Also has a basic Drizzle `users` table (boilerplate, not actively used by core features)
- **Routes** (`shared/routes.ts`): API contract definitions using Zod (placeholder structure)

### Database
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Connection**: `node-postgres` (pg) Pool via `DATABASE_URL` environment variable
- **Schema Location**: `shared/schema.ts`
- **Migrations**: Output to `./migrations` directory via `drizzle-kit`
- **Note**: The database is not essential for core QR generation. It exists as boilerplate with a `users` table for potential future features (analytics, saved codes, user accounts). The `db:push` script syncs the schema to the database.

### Project Structure
```
client/               # Frontend React application
  src/
    components/       # App components (Header, Footer, QrForm, QrResult)
    components/ui/    # shadcn/ui component library
    hooks/            # Custom hooks (use-qr-generator, use-mobile, use-toast)
    lib/              # Utilities (queryClient, cn helper)
    pages/            # Page components (Home, not-found)
server/               # Express backend
  index.ts            # Server entry point
  routes.ts           # API route registration
  storage.ts          # Database storage layer (IStorage interface)
  db.ts               # Database connection
  vite.ts             # Vite dev server integration
  static.ts           # Static file serving for production
shared/               # Shared between client and server
  schema.ts           # Drizzle tables + Zod validation schemas
  routes.ts           # API contract definitions
```

### Key Design Decisions

1. **Client-side generation**: QR codes are generated entirely in the browser using `qrcode.react`. No server round-trip needed, making it fast and keeping infrastructure costs low.

2. **Discriminated union for form types**: The form schema uses Zod discriminated unions (`qrCodeFormSchema`) to validate different QR code types with type-specific fields. This provides excellent TypeScript inference and runtime validation.

3. **Monorepo-style structure**: Client, server, and shared code live in one repository with path aliases (`@/`, `@shared/`). The shared directory ensures type safety across the stack.

4. **Portuguese (pt) localization**: All UI text is in Portuguese, targeting Angolan users. The theme uses green colors inspired by the Angolan flag.

### Development & Build
- **Dev**: `npm run dev` — runs Express with Vite middleware for HMR
- **Build**: `npm run build` — Vite builds the client to `dist/public`, esbuild bundles the server to `dist/index.cjs`
- **Production**: `npm start` — runs the bundled server which serves static files
- **DB Push**: `npm run db:push` — pushes Drizzle schema to PostgreSQL

## External Dependencies

- **Cloudinary Integration**: Used for persistent file storage (PDFs, images). Required secrets: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.
- **Netlify Deployment Note**: Since core upload functionality depends on a Node.js backend (`/api/upload`), a static deployment on Netlify will not support file uploads unless migrated to Netlify Functions or a separate backend.
- **PostgreSQL**: Required database (via `DATABASE_URL` env var). Used by Drizzle ORM for storage. Not critical for core QR generation but required for the server to start.
- **Google Fonts**: DM Sans, Outfit, Fira Code, Geist Mono loaded via CDN in `index.html`
- **No external APIs**: Core functionality is entirely client-side. No third-party API keys needed for QR generation.
- **Key npm packages**:
  - `qrcode.react` — QR code SVG rendering
  - `html-to-image` + `file-saver` — QR code PNG download
  - `framer-motion` — animations
  - `drizzle-orm` + `drizzle-kit` — database ORM and migrations
  - `connect-pg-simple` — PostgreSQL session store (available but not actively used)