# Technology Stack

**Analysis Date:** 2026-04-05

## Languages

**Primary:**
- TypeScript 5.8.3 - All source code in `src/` directory
- CSS (TailwindCSS with PostCSS) - Styling via `src/app/globals.css`

**Secondary:**
- JavaScript (ES2017 target) - Next.js configuration and scripts

## Runtime

**Environment:**
- Node.js 20 (specified in `netlify.toml`)

**Package Manager:**
- npm (v9+ implied by package-lock.json structure)
- Lockfile: `package-lock.json` (present in git)

## Frameworks

**Core:**
- Next.js 15.5.13 - Full-stack React framework with App Router
  - Running `npm run dev` for development
  - Running `npm run build` for production builds
  - Running `npm start` for production server

**UI & Components:**
- React 19.1.0 - Component library and state management
- React DOM 19.1.0 - React rendering to web

**Icon Library:**
- lucide-react 0.577.0 - SVG icons (imported in `src/app/page.tsx` and `src/components/`)

**Styling:**
- TailwindCSS 4.1.4 - Utility-first CSS framework
- @tailwindcss/postcss 4.1.4 - PostCSS integration for TailwindCSS 4

**Build & Development:**
- TypeScript 5.8.3 - Static type checking
- PostCSS - CSS processing pipeline (via `postcss.config.mjs`)

## Key Dependencies

**Critical:**
- next@15.5.13 - Framework that handles routing, server-side rendering, static generation, and build
- react@19.1.0 - Core UI library for component architecture
- tailwindcss@4.1.4 - CSS utility framework (application styling depends entirely on this)

**Icon & Visual:**
- lucide-react@0.577.0 - Icon components used throughout pages for UI affordance

## Configuration

**Environment:**
- No `.env` file required for current implementation
- Contact form submits via Netlify Form Handler (data-netlify="true" in `src/components/ContactForm.tsx`)
- Phone and email configured as constants in `src/lib/contact-data.ts`

**Build:**
- `tsconfig.json` - TypeScript compiler configuration with strict mode enabled
  - Target: ES2017
  - Module: esnext
  - JSX: preserve (for Next.js to handle)
  - Path aliases: `@/*` maps to `./src/*`
- `next.config.ts` - Empty Next.js config (using all defaults)
- `postcss.config.mjs` - PostCSS configuration with TailwindCSS plugin only

## Platform Requirements

**Development:**
- Node.js 20
- npm (or yarn/pnpm)
- Bash or compatible shell

**Production:**
- Deployment target: Netlify
  - Build command: `npm run build`
  - Publish directory: `.next`
  - Node version: 20 (enforced via `netlify.toml`)
  - Uses Netlify Next.js plugin (configured in build settings)

## Fonts & Assets

**External Resources:**
- Google Fonts (via CDN): 
  - Playfair Display (serif, wght 400-900) - Display headings
  - Source Sans 3 (sans-serif, wght 200-900) - Body text
  - Imported in `src/app/globals.css` line 35

**Image Services:**
- Unsplash (free image CDN) - Used in `src/app/page.tsx` for hero and content images
  - Hero background: `https://images.unsplash.com/photo-1568605114967-8130f3a36994`
  - Section image: `https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6`

---

*Stack analysis: 2026-04-05*
