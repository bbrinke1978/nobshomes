# Architecture

**Analysis Date:** 2026-04-05

## Pattern Overview

**Overall:** Server-Rendered Multi-Page Application (Next.js App Router)

**Key Characteristics:**
- Server-Side Rendering (SSR) with React 19 Server Components
- File-based routing with Next.js App Router pattern
- Component-driven UI with reusable presentational components
- Static configuration and content (no database)
- Netlify form integration for form submissions
- Single-page marketing site focused on conversion flows

## Layers

**Presentation Layer:**
- Purpose: Render user-facing pages and interactive components
- Location: `src/components/`, `src/app/`
- Contains: React components (Header, Footer, ContactForm, page components)
- Depends on: Next.js framework, lucide-react icons, Tailwind CSS, lib configuration
- Used by: Next.js router, directly imported by page files

**Layout Layer:**
- Purpose: Define page structure and metadata
- Location: `src/app/layout.tsx`
- Contains: Root layout with global HTML structure, metadata, global CSS
- Depends on: Next.js Metadata API
- Used by: All pages inherit from root layout

**Configuration Layer:**
- Purpose: Store centralized business data and constants
- Location: `src/lib/contact-data.ts`
- Contains: Contact information, company details, branded constants
- Depends on: None
- Used by: Multiple components (Header, Footer, ContactForm, pages)

**Styling Layer:**
- Purpose: Define theme, colors, animations, reusable utility classes
- Location: `src/app/globals.css`, Tailwind CSS config (inline in CSS)
- Contains: Custom color palette (brand, sand, warm, cream), typography, animations, button styles
- Depends on: Tailwind CSS, Google Fonts (Playfair Display, Source Sans 3)
- Used by: All components via Tailwind classes

## Data Flow

**Page Rendering Flow:**

1. User navigates to route (e.g., `/`, `/how-it-works`, `/about`, `/faq`)
2. Next.js App Router matches route to page file in `src/app/`
3. Page component renders with layout wrapper from `src/app/layout.tsx`
4. Layout imports global CSS (`src/app/globals.css`) and applies metadata
5. Page imports shared components (Header, Footer, ContactForm) and lib data (contactData)
6. Components render with Tailwind utility classes and custom CSS animations

**Contact Form Submission Flow:**

1. User fills ContactForm component (name, phone, address, message)
2. Form onSubmit handler prevents default, creates FormData
3. Client-side fetch POST to `/` with Netlify form name binding
4. Netlify receives form data and handles backend submission
5. Success state triggers success message; error state shows fallback message
6. Submitted state prevents further edits

**Navigation Flow:**

1. Header component renders sticky navigation with logo and nav links
2. Desktop view shows full nav with phone CTA button
3. Mobile view shows hamburger menu that toggles mobileOpen state
4. All links use Next.js Link component for SPA-style navigation
5. Footer provides secondary navigation and contact options

**State Management:**

- Header: Simple local state for mobile menu toggle (`mobileOpen`)
- ContactForm: Local state for submission status, loading, and errors (`submitted`, `submitting`, `error`)
- FAQ Page: Each FAQItem component has local expanded state (`open`)
- No global state manager (Context API or Redux) — all state is local component state

## Key Abstractions

**Reusable Components:**

- **Header** (`src/components/Header.tsx`): 
  - Purpose: Navigation and branding
  - Pattern: Client component with mobile menu state
  - Used by: Every page

- **Footer** (`src/components/Footer.tsx`):
  - Purpose: Footer navigation, contact info, branding
  - Pattern: Server component with hardcoded links and content
  - Used by: Every page

- **ContactForm** (`src/components/ContactForm.tsx`):
  - Purpose: Lead capture via Netlify Forms
  - Pattern: Client component with form state and async submission
  - Used by: `/`, `/how-it-works`

**Page Templates:**

- **Homepage** (`src/app/page.tsx`):
  - Hero section with trust points and situations grid
  - "How It Works" preview
  - Multiple CTAs for phone and form

- **How It Works** (`src/app/how-it-works/page.tsx`):
  - Step-by-step breakdown of process
  - Promises/guarantees checklist
  - Contact form integration

- **About** (`src/app/about/page.tsx`):
  - Brand story (Brian & Shawn)
  - Values section with three pillars
  - CTA buttons

- **FAQ** (`src/app/faq/page.tsx`):
  - Accordion component pattern with controlled state
  - 10 Q&A pairs with expandable answers
  - Client component for interactivity

**Configuration Object:**

- **contactData** (`src/lib/contact-data.ts`):
  - Exported as singleton object with phone, email, company, address, brothers
  - Imported by Header, Footer, ContactForm, and all pages
  - Single source of truth for contact information

## Entry Points

**Root Layout:**
- Location: `src/app/layout.tsx`
- Triggers: Every request to any route
- Responsibilities: HTML structure, metadata, global CSS import, RootLayout wrapper

**Page Routes:**
- Location: `src/app/page.tsx` (home), `src/app/[path]/page.tsx` (subpages)
- Triggers: URL navigation to `/`, `/how-it-works`, `/about`, `/faq`
- Responsibilities: Page-specific content, component composition, SEO metadata

**Client Entry Points:**
- Location: Components with `"use client"` directive (Header, Footer, ContactForm, FAQItem pattern)
- Triggers: When component requires browser APIs (state, event handlers)
- Responsibilities: Interactivity, form submission, mobile menu toggle, accordion expansion

## Error Handling

**Strategy:** Graceful fallback with user messaging

**Patterns:**

- **Form submission errors**: ContactForm catches fetch failures and displays "Something went wrong. Please call us instead." message
- **No explicit 404 handling**: Next.js default 404 page used
- **No error boundaries**: Not currently implemented; single-page app has minimal failure points
- **Client-side validation**: HTML5 required attributes on form inputs

## Cross-Cutting Concerns

**Logging:** None — no backend logging currently implemented

**Validation:** 
- HTML5 validation on form inputs (required attributes)
- No JavaScript validation layer

**Authentication:**
- Not applicable — public marketing site with no protected content

**Styling/Theme:**
- Centralized in `src/app/globals.css` with custom Tailwind theme
- Uses CSS variables for color palette (--color-brand-*, --color-sand-*)
- Consistent animations (fadeInUp, fadeIn with stagger delays)

---

*Architecture analysis: 2026-04-05*
