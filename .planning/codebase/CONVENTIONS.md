# Coding Conventions

**Analysis Date:** 2026-04-05

## Naming Patterns

**Files:**
- Pages: PascalCase with `.tsx` extension (e.g., `Header.tsx`, `ContactForm.tsx`)
- App route pages: lowercase with hyphens (e.g., `/app/about/page.tsx`, `/app/faq/page.tsx`)
- Library/utility files: camelCase with `.ts` extension (e.g., `contact-data.ts`)
- Exported functions are named in PascalCase when they're React components (e.g., `export function Header()`)

**Functions:**
- React components: PascalCase (e.g., `Header`, `ContactForm`, `FAQItem`, `RootLayout`)
- Helper/utility functions: camelCase (e.g., `handleSubmit`)
- Event handlers: camelCase with `handle` prefix (e.g., `handleSubmit`, `onClick={() => setMobileOpen(!mobileOpen)}`)

**Variables:**
- State variables: camelCase (e.g., `mobileOpen`, `submitted`, `submitting`, `error`)
- Constants: camelCase (e.g., `navItems`, `trustPoints`, `situations`, `faqs`)
- Object keys: camelCase (e.g., `{ phone, phoneHref, email, company, slogan, address }`)

**Types:**
- React component props: Inline TypeScript annotation preferred (e.g., `export function RootLayout({ children }: { children: React.ReactNode })`)
- Custom types: PascalCase when defined (e.g., `Metadata` from Next.js)
- Metadata objects: camelCase property keys (e.g., `openGraph`, `title`, `description`)

## Code Style

**Formatting:**
- No explicit linter or formatter configured in package.json (eslint, prettier, or biome not in dependencies)
- Indentation: 2 spaces (observed throughout codebase)
- Line length: No strict limit observed, but lines are generally kept under 100 characters
- Semicolons: Used consistently at end of statements

**Linting:**
- No `.eslintrc`, `.prettierrc`, or `biome.json` files found
- TypeScript strict mode enabled via `tsconfig.json` with `"strict": true`
- Code relies on TypeScript compiler for type checking

## Import Organization

**Order:**
1. Third-party library imports (React, Next.js, lucide-react)
2. Relative imports from `@/` alias (components, lib, config)
3. Styles and CSS imports (globals.css)

**Example from `src/app/page.tsx`:**
```typescript
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ContactForm } from "@/components/ContactForm";
import { contactData } from "@/lib/contact-data";
import {
  Phone,
  Shield,
  Clock,
  DollarSign,
  Home,
  Handshake,
  ArrowRight,
  CheckCircle,
  Star,
} from "lucide-react";
import Link from "next/link";
```

**Path Aliases:**
- `@/*` → `./src/*` (configured in `tsconfig.json`)
- All component and lib imports use `@/` prefix for clean, absolute paths

## Error Handling

**Patterns:**
- Try-catch blocks in async functions with fallback error messages
- State-based error display: set error state in catch block, display to user
- Generic error messages for user-facing content (e.g., "Something went wrong. Please call us instead.")
- Example from `src/components/ContactForm.tsx`:
```typescript
try {
  const response = await fetch("/", { ... });
  if (response.ok) {
    setSubmitted(true);
  } else {
    setError("Something went wrong. Please call us instead.");
  }
} catch {
  setError("Something went wrong. Please call us instead.");
} finally {
  setSubmitting(false);
}
```

## Logging

**Framework:** `console` only (no dedicated logging library)

**Patterns:**
- No explicit logging observed in production code
- Console logging not used in components or form handlers

## Comments

**When to Comment:**
- Inline comments used sparingly
- Section markers with decorative dividers: `{/* ── Hero ── */}` format in JSX
- Comments only for non-obvious logic or layout structure

**JSDoc/TSDoc:**
- Not used in the codebase
- Prefer self-documenting code with clear naming

## Function Design

**Size:** 
- Components typically 30-150 lines
- Larger pages (e.g., `page.tsx`) contain multiple sections with inline data arrays for map operations
- Favor readable inline component structure over excessive extraction

**Parameters:**
- React components use destructured props with TypeScript inline annotations
- Functions accept minimal parameters, prefer reading from state/context
- Example: `export function RootLayout({ children }: { children: React.ReactNode })`

**Return Values:**
- React components return JSX (no wrapper objects)
- Form handlers return void (set state as side effect)
- Async functions return Promise<void> or implicit undefined on catch

## Module Design

**Exports:**
- Named exports for components: `export function HeaderName() { ... }`
- Default exports for page routes: `export default function PageName() { ... }`
- Centralized data exports: `export const contactData = { ... }` in lib files

**Barrel Files:**
- Not used; components imported directly with full paths
- Example: `import { Header } from "@/components/Header"` (not from index)

## CSS and Styling

**Framework:** Tailwind CSS v4.1.4

**Patterns:**
- Utility-first CSS with Tailwind classes
- Inline `style={{ fontFamily: "var(--font-display)" }}` used for CSS custom properties when Tailwind class unavailable
- Custom CSS variables defined in `src/app/globals.css`:
  - `--color-brand-*`: Blue palette (brand colors)
  - `--color-sand-*`: Warm sand/tan palette (accents)
  - `--font-display`: "Playfair Display" serif (headings)
  - `--font-body`: "Source Sans 3" sans-serif (body text)

**Classes:**
- Responsive prefixes used consistently: `sm:`, `md:`, `lg:` (Tailwind breakpoints)
- Custom classes in `globals.css`: `.btn-primary`, `.btn-secondary`, `.hero-gradient`, `.trust-glow`, `.animate-fade-in-up`, `.animate-fade-in`
- Stagger animation delays: `.stagger-1` through `.stagger-5`

## State Management

**Pattern:**
- React hooks (`useState`) for local component state
- No global state management (Redux, Zustand, Context API)
- Props passed down for component communication
- Example from `Header.tsx`: `const [mobileOpen, setMobileOpen] = useState(false);`

## Inline Data

**Pattern:**
- Data arrays defined as constants near top of component file
- Maps used to render lists with `.map((item) => (...))`
- Example from `page.tsx`:
```typescript
const trustPoints = [
  { icon: DollarSign, title: "Zero Fees", description: "..." },
  // ...
];
```

## Client-Side Components

**Directive:** `"use client"` at top of file when component uses hooks or interactivity
- Applied to: `src/components/ContactForm.tsx`, `src/components/Header.tsx`, `src/app/faq/page.tsx`
- Not used for server components (static pages, layout)

---

*Convention analysis: 2026-04-05*
