# Codebase Structure

**Analysis Date:** 2026-04-05

## Directory Layout

```
nobshomes/
├── src/                           # Source code root
│   ├── app/                       # Next.js App Router pages and layout
│   │   ├── layout.tsx             # Root layout wrapper for all pages
│   │   ├── page.tsx               # Homepage (/)
│   │   ├── globals.css            # Global styles, theme, animations
│   │   ├── about/
│   │   │   └── page.tsx           # About Us page (/about)
│   │   ├── faq/
│   │   │   └── page.tsx           # FAQ page (/faq)
│   │   └── how-it-works/
│   │       └── page.tsx           # How It Works page (/how-it-works)
│   ├── components/                # Reusable React components
│   │   ├── Header.tsx             # Navigation header with mobile menu
│   │   ├── Footer.tsx             # Site footer with links and contact
│   │   └── ContactForm.tsx        # Netlify form for lead capture
│   └── lib/                       # Utilities and configuration
│       └── contact-data.ts        # Contact info constants
├── public/                        # Static assets
│   └── images/
│       └── logo/                  # Logo files (stamp, horizontal variants)
├── next.config.ts                 # Next.js configuration
├── tsconfig.json                  # TypeScript configuration
├── package.json                   # Dependencies and scripts
├── package-lock.json              # Dependency lock file
├── Logos/                         # Local branding asset directory
└── .planning/codebase/            # GSD codebase analysis documents
```

## Directory Purposes

**src/**
- Purpose: All TypeScript/TSX source code
- Contains: Components, pages, library code
- Key files: `app/layout.tsx` (entry point for all routes)

**src/app/**
- Purpose: Next.js App Router — file-based routing and page definitions
- Contains: Page components (.tsx files) that map to URL routes, global styles
- Key files: `page.tsx` (routes), `layout.tsx` (shared layout)

**src/components/**
- Purpose: Reusable, presentational React components shared across pages
- Contains: Header, Footer, ContactForm (all used on multiple pages)
- Key files: All components are imported by multiple pages

**src/lib/**
- Purpose: Non-component code — utilities, configuration, constants
- Contains: Data objects, helper functions, configuration
- Key files: `contact-data.ts` (single source of truth for contact info)

**public/**
- Purpose: Static assets served at root URL (images, favicon, etc.)
- Contains: Logo files and images referenced in img tags
- Key files: `images/logo/` subdirectory with logo variants

## Key File Locations

**Entry Points:**
- `src/app/layout.tsx`: Root layout wrapper with HTML, metadata, global CSS
- `src/app/page.tsx`: Homepage (/)
- `src/app/about/page.tsx`: About Us page (/about)
- `src/app/how-it-works/page.tsx`: How It Works page (/how-it-works)
- `src/app/faq/page.tsx`: FAQ page (/faq)

**Configuration:**
- `next.config.ts`: Next.js config (currently minimal/empty)
- `tsconfig.json`: TypeScript compiler options, path aliases (`@/*` → `./src/*`)
- `src/app/globals.css`: Global CSS with theme, colors, animations
- `package.json`: Project metadata and dependencies

**Core Components:**
- `src/components/Header.tsx`: Navigation (sticky, responsive with mobile menu)
- `src/components/Footer.tsx`: Footer with links, contact, branding
- `src/components/ContactForm.tsx`: Netlify-integrated form with client state

**Business Logic:**
- `src/lib/contact-data.ts`: Contact information singleton object

**Styling:**
- `src/app/globals.css`: All global styles, custom properties, animations
- Tailwind CSS utility classes used throughout components (no component-scoped CSS)

## Naming Conventions

**Files:**
- Page components: `page.tsx` (required by Next.js App Router)
- Components: PascalCase with .tsx extension (e.g., `Header.tsx`, `ContactForm.tsx`)
- Library files: camelCase with .ts extension (e.g., `contact-data.ts`)
- Styles: `globals.css` for global scope

**Directories:**
- Route directories: kebab-case matching URL segments (e.g., `/how-it-works`, `/faq`)
- Component folders: PascalCase or lowercase plural (e.g., `components/`, `lib/`)
- Asset folders: lowercase plural (e.g., `public/images/`)

**Functions/Variables:**
- React components: PascalCase (e.g., `Header`, `ContactForm`, `FAQItem`)
- Exports: Named exports for components, default exports for pages
- State variables: camelCase (e.g., `mobileOpen`, `submitted`, `submitting`)
- Constants: camelCase or SCREAMING_SNAKE_CASE (e.g., `contactData`, `trustPoints`)

**CSS Classes:**
- Tailwind utilities: kebab-case (e.g., `bg-white`, `rounded-2xl`, `animate-fade-in`)
- Custom classes: kebab-case (e.g., `.hero-gradient`, `.btn-primary`, `.trust-glow`)
- Animation classes: `.animate-fade-in-up`, `.stagger-1` through `.stagger-5`
- Color variables: CSS custom properties like `--color-brand-500`, `--color-sand-300`

## Where to Add New Code

**New Feature (e.g., new page):**
- Page component: `src/app/[feature-name]/page.tsx`
- Add route to Header navigation items if needed
- Import Header, Footer, and shared components
- Add page-specific data objects if needed

**New Component (reusable across pages):**
- Implementation: `src/components/ComponentName.tsx`
- Use `"use client"` directive if interactivity is needed (state, event handlers)
- Export as named export
- Import in pages that need it

**New Utility/Configuration:**
- Implementation: `src/lib/util-name.ts`
- Export as named exports
- Import where needed

**Form-related code:**
- If form is reusable: Create component in `src/components/FormName.tsx`
- If form is page-specific: Can be inline in page component
- Always use Netlify form integration (name attribute, data-netlify="true")

**Static content/data:**
- If used on multiple pages: `src/lib/content-name.ts` as exported object
- If page-specific: Inline in page component as const array/object

## Special Directories

**node_modules/**
- Purpose: Installed npm dependencies
- Generated: Yes (by npm install)
- Committed: No (in .gitignore)

**public/**
- Purpose: Static assets served at root URL
- Generated: No
- Committed: Yes (contains logo and images)

**.next/**
- Purpose: Next.js build output and cache
- Generated: Yes (by next build)
- Committed: No (in .gitignore)

**Logos/**
- Purpose: Local branding/design asset storage
- Generated: No (user-managed)
- Committed: Yes

**.planning/codebase/**
- Purpose: GSD codebase analysis documents
- Generated: Yes (by GSD tools)
- Committed: Yes (helps future implementation)

## Add New Page: Step-by-Step

1. Create directory: `src/app/[route-name]/`
2. Create file: `src/app/[route-name]/page.tsx`
3. Import layout components: `Header`, `Footer` from `@/components`
4. Import data if needed: `contactData` from `@/lib/contact-data`
5. Use page structure:
   ```tsx
   import { Header } from "@/components/Header";
   import { Footer } from "@/components/Footer";
   import { contactData } from "@/lib/contact-data";
   
   export default function PageName() {
     return (
       <>
         <Header />
         <main>
           {/* Page sections here */}
         </main>
         <Footer />
       </>
     );
   }
   ```
6. Update Header navigation items if public-facing route: Edit `src/components/Header.tsx` navItems array
7. Add Footer links if needed: Edit `src/components/Footer.tsx` link sections

---

*Structure analysis: 2026-04-05*
