# External Integrations

**Analysis Date:** 2026-04-05

## APIs & External Services

**Form Handling:**
- Netlify Forms - Processes contact form submissions
  - Form config: `src/components/ContactForm.tsx` (line 57: `data-netlify="true"`)
  - Form name: `contact` (line 55-56)
  - Submission endpoint: Same-origin POST to `/` (line 20)
  - Scope: Collects name, phone, address, message from `src/components/ContactForm.tsx`

**Icon Service:**
- Lucide React - Local SVG icon library (no API calls, loaded as npm package)
  - Used for: UI affordance icons (Phone, Shield, Clock, DollarSign, Home, Handshake, etc.)

## Data Storage

**Databases:**
- Not applicable - No database integration detected

**File Storage:**
- Local filesystem only - Static assets served by Netlify
- Unsplash CDN - External images (read-only, no authenticated access)

**Contact Form Data:**
- Handled by Netlify Forms - Data stored in Netlify dashboard
  - No explicit database configuration needed

**Caching:**
- Browser/CDN caching via Netlify's edge delivery
- Next.js static optimization: Pages are pre-rendered at build time

## Authentication & Identity

**Auth Provider:**
- None detected - Public website with no user authentication
- Contact form has no authentication requirement

## Monitoring & Observability

**Error Tracking:**
- Not explicitly configured - Could use Netlify error notifications

**Logs:**
- Netlify deployment logs (automatic via hosting platform)
- Browser console logs from `src/components/ContactForm.tsx` (error handling at lines 31-32)

**Form Submission Tracking:**
- Netlify Forms dashboard (web UI for viewing submissions)
- Email notifications possible via Netlify setup (not visible in code)

## CI/CD & Deployment

**Hosting:**
- Netlify
  - Build command: `npm run build` (netlify.toml line 2)
  - Publish directory: `.next` (netlify.toml line 3)
  - Node version: 20 (netlify.toml line 6)

**CI Pipeline:**
- Git-based continuous deployment
  - Triggered on pushes to connected repository
  - Automatic builds and deployments via Netlify

**Build Process:**
- Next.js build outputs to `.next/` directory
- Static pages served directly by Netlify CDN

## Environment Configuration

**Required env vars:**
- None - Current implementation has no environment variables
- Contact phone/email hardcoded in `src/lib/contact-data.ts`

**Secrets location:**
- Not applicable - No API keys, database credentials, or secrets in use

**Configuration:**
- `netlify.toml` - Netlify deployment configuration
- `tsconfig.json` - TypeScript compiler options
- `next.config.ts` - Next.js runtime configuration (currently empty)

## Webhooks & Callbacks

**Incoming:**
- Netlify Forms - Webhook support available but not explicitly configured
  - Form submissions POST to `/` endpoint
  - Contact form data structure: name, phone, address, message (optional)

**Outgoing:**
- None detected - No API calls to external services from application code
- Potential Netlify webhook to external service could be configured (not visible in current code)

## Third-Party Resources

**Content Delivery:**
- Google Fonts - CSS font files (https://fonts.googleapis.com)
- Unsplash - Image hosting for demo content (https://images.unsplash.com)

**Package Dependencies (npm):**
- All production packages are open source from npm registry
- No paid SaaS integrations detected

## Security Considerations

**Form Data Privacy:**
- Contact form data submitted to Netlify Forms
- Privacy notice present in form: `Your information is private. We never share or sell your data.` (src/components/ContactForm.tsx line 148)
- Netlify manages data storage and access

---

*Integration audit: 2026-04-05*
