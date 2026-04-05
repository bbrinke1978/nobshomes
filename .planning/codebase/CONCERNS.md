# Codebase Concerns

**Analysis Date:** 2026-04-05

## Tech Debt

**Type Unsafe Form Handling:**
- Issue: Use of `as unknown as Record<string, string>` type assertion to bypass TypeScript validation
- Files: `src/components/ContactForm.tsx` (line 23)
- Impact: Defeats type safety when converting FormData to URLSearchParams; masks potential type mismatches and makes code harder to maintain
- Fix approach: Create a proper type-safe helper function that validates FormData entries before conversion, or use a form library with built-in type safety like React Hook Form

**Decorative Background Images Without Semantics:**
- Issue: Hero section background image has empty alt text (`alt=""`) because it's purely decorative
- Files: `src/app/page.tsx` (line 63)
- Impact: While technically correct for decorative images, this pattern could be confused with missing alt text; unclear intent to future maintainers
- Fix approach: Add comment clarifying that image is decorative, or use CSS background-image instead of img tag for non-content images

**Missing ESLint/Prettier Configuration:**
- Issue: No linting or code formatting tools configured
- Files: Project root (no `.eslintrc*`, `eslint.config.*`, or `.prettierrc*`)
- Impact: Team may develop inconsistent code style; harder to enforce conventions across contributors; no automated code quality checks
- Fix approach: Add eslint-config-next and prettier to devDependencies, create configuration files with standard rules

**Inline Custom Animations via Tailwind Utilities:**
- Issue: Heavy use of custom animation utilities (`.animate-fade-in`, `.animate-fade-in-up`, `.stagger-*`) defined in globals.css
- Files: `src/app/globals.css` (lines 62-90), used throughout all page components
- Impact: Animation behavior scattered between globals.css and component markup; hard to adjust timing globally; animation delays hardcoded in stagger classes
- Fix approach: Move animations to Tailwind config or use a dedicated animation library; create reusable animation components or utilities

## Known Bugs

**Form Submission Endpoint Ambiguous:**
- Symptoms: ContactForm submits to "/" with Netlify form integration attributes, but client-side fetch handler also expects "/" endpoint
- Files: `src/components/ContactForm.tsx` (lines 20-24, 57)
- Trigger: When user submits the contact form on any page
- Workaround: Works because Netlify intercepts form submissions, but dual-approach creates confusion. Client-side fetch to "/" may conflict with server routing
- Impact: Fragile integration; unclear whether form relies on Netlify's client-side interception or server handler

**Footer Copyright Year Dynamically Calculated:**
- Symptoms: Uses `new Date().getFullYear()` at render time
- Files: `src/components/Footer.tsx` (line 93)
- Trigger: Every page load calculates copyright year
- Workaround: Works correctly but adds unnecessary computation
- Impact: Minor performance overhead; breaks static generation if footer is ever precomputed

## Security Considerations

**Contact Form Data Privacy Claims Without Verification:**
- Risk: Form includes privacy promise ("Your information is private. We never share or sell your data") but no privacy policy page or data handling documentation
- Files: `src/components/ContactForm.tsx` (lines 147-149), no corresponding /privacy page
- Current mitigation: Netlify form handling (server-side), but no documented retention policy or GDPR compliance
- Recommendations: 
  - Create `/privacy` and `/terms` pages with legal verbiage
  - Document how long form submissions are retained
  - Add GDPR consent checkbox if collecting EU users
  - Consider CCPA compliance if serving California residents

**External Image Sources Hardcoded:**
- Risk: Uses unsplash.com and googleapis.com (fonts) from external CDNs without integrity checks
- Files: `src/app/page.tsx`, `src/app/about/page.tsx`, `src/app/how-it-works/page.tsx`, `src/app/globals.css`
- Current mitigation: Images are public/non-sensitive; Google Fonts is industry standard
- Recommendations: 
  - Self-host images and fonts for better performance and reliability
  - Add Subresource Integrity (SRI) hashes to external CDN links if keeping them

**No Environment Variable Validation:**
- Risk: Contact phone number and email hardcoded in `src/lib/contact-data.ts`
- Files: `src/lib/contact-data.ts`
- Current mitigation: Contact data is public marketing information
- Recommendations:
  - Move to environment variables for easier updates across environments
  - Add schema validation in a config loader if expanding configuration

## Performance Bottlenecks

**Unsplash Images Not Optimized:**
- Problem: Hero and content images loaded from Unsplash CDN at full resolution without Next.js Image optimization
- Files: `src/app/page.tsx` (lines 61-65, 201-206), `src/app/about/page.tsx` (line 46), `src/app/how-it-works/page.tsx` (lines 117-121)
- Cause: Using plain `<img>` tags instead of Next.js `Image` component; no srcset or responsive sizing
- Improvement path: 
  - Replace `<img>` with Next.js `Image` component
  - Add width/height props for proper aspect ratio
  - Use `next/image` optimization to reduce payload by 30-50%

**Google Fonts Loaded Unconditionally:**
- Problem: Both "Playfair Display" and "Source Sans 3" fonts loaded from googleapis.com with `display=swap` (may cause layout shift)
- Files: `src/app/globals.css` (line 35)
- Cause: All fonts loaded eagerly; no font subsetting or preloading strategy
- Improvement path:
  - Self-host fonts to avoid external CDN request
  - Use `font-display: optional` for non-critical fonts to eliminate CLS
  - Consider font subsetting to reduce download size

**Background Noise SVG Overlay on Every Page:**
- Problem: Subtle noise grain rendered via fixed pseudo-element with high z-index (9999) on all pages
- Files: `src/app/globals.css` (lines 50-59)
- Cause: Always-on visual effect with complex SVG filter definition
- Improvement path:
  - Consider removing effect or using CSS `backdrop-filter` alternative
  - If keeping, apply only to specific sections instead of global overlay

## Fragile Areas

**Hardcoded Stagger Animation Classes:**
- Files: `src/app/page.tsx`, `src/app/about/page.tsx`, `src/app/how-it-works/page.tsx`, all using `.stagger-1` through `.stagger-4` or higher
- Why fragile: CSS animation delays are hardcoded as separate utility classes; changing stagger logic requires touching both CSS and JSX; no validation that stagger class numbers match CSS definitions
- Safe modification: Create a reusable AnimationStagger component that handles both class assignment and delay calculation; or move to Framer Motion for type-safe animations
- Test coverage: No tests for animation timing or sequencing; animations are purely visual and untested

**Contact Form Netlify Integration:**
- Files: `src/components/ContactForm.tsx` (lines 55-58)
- Why fragile: Mixes Netlify form attributes (`data-netlify="true"`) with custom client-side fetch handler; unclear which path form data takes; no error recovery if Netlify service is down
- Safe modification: Choose one approach—either pure Netlify forms (remove fetch handler) or API endpoint (remove Netlify attributes); add proper error boundaries
- Test coverage: No tests for form submission; manual testing required to verify delivery

**Hard-coded Button and Link Styling:**
- Files: Multiple components rely on `.btn-primary`, `.btn-secondary` CSS classes defined globally
- Why fragile: If button styles need variation (different colors per section), would require additional CSS classes; no TypeScript component type for button variants
- Safe modification: Extract button styling into React components with variant props rather than CSS-only utilities
- Test coverage: Button visuals untested; styling regressions can occur without notice

**Loose Page Structure Dependencies:**
- Files: `src/app/page.tsx`, `src/app/about/page.tsx`, `src/app/how-it-works/page.tsx`, `src/app/faq/page.tsx` all import Header/Footer
- Why fragile: Each page manually imports and places Header/Footer; if layout changes, must update 5+ files; no RootLayout wrapper preventing duplication
- Safe modification: Move Header/Footer to `src/app/layout.tsx` as standard layout instead of per-page imports
- Test coverage: No integration tests for page structure; layout changes require manual testing

## Scaling Limits

**Single Page Component Size:**
- Current capacity: `src/app/page.tsx` is 296 lines with inline data and JSX; readable but approaching unmaintainability
- Limit: Beyond 400 lines, component becomes difficult to navigate and refactor
- Scaling path: Extract data (trustPoints, situations, etc.) to separate files; create reusable section components (`HeroSection`, `TrustPointsGrid`, `SituationsGrid`)

**Hard-coded Contact Data:**
- Current capacity: Contact data in `src/lib/contact-data.ts` works for single location/phone
- Limit: Adding multiple locations, multiple phone numbers, or language variants requires data restructuring
- Scaling path: Move to database or CMS; create configuration schema with validation; add i18n for multi-language support

**Manual FAQ Management:**
- Current capacity: FAQ hardcoded as array in `src/app/faq/page.tsx` (60 items maximum before UX degrades)
- Limit: Beyond 50 FAQs, search/filtering becomes necessary; page load grows
- Scaling path: Move FAQs to database or headless CMS; implement search, filtering, and pagination

## Dependencies at Risk

**Lucide React Icon Library:**
- Risk: Currently using v0.577.0 with caret dependency (^0.577.0); may auto-upgrade to breaking changes
- Impact: Breaking icon changes could break pages using missing/renamed icons
- Migration plan: Pin to exact version in package.json; evaluate before upgrades; consider alternatives like React Icons if stability is critical

**Tailwind CSS v4:**
- Risk: Using @tailwindcss/postcss v4.1.4; relatively new major version with potential breaking changes in minor releases
- Impact: CSS output could change unpredictably; custom theme colors might not apply correctly across versions
- Migration plan: Pin to exact version; pin @tailwindcss/postcss to same major version as tailwindcss

**Next.js Version 15:**
- Risk: Using Next.js 15.5.13 (latest major version); rapid development cycle with breaking changes in minor versions
- Impact: next build output or server behavior could change; layout.tsx behavior may shift
- Migration plan: Lock package-lock.json to tested version; test upgrades in CI before deploying; review release notes for each minor version

## Missing Critical Features

**No Analytics or Error Tracking:**
- Problem: No way to track user interactions, form submissions, or page errors in production
- Blocks: Can't measure conversion funnel; can't diagnose production issues without user reports
- Priority: Medium—marketing-focused site needs conversion metrics

**No 404/Error Pages:**
- Problem: No custom 404.tsx or error.tsx in app directory
- Blocks: Users see generic Next.js error page; poor brand experience on misnavigation
- Priority: Medium—should add custom error pages for consistency

**No Automated Form Validation:**
- Problem: Contact form uses HTML5 required attributes only; no real-time validation or user feedback
- Blocks: Users may submit invalid phone numbers or empty required fields; no client-side error messaging besides generic catch
- Priority: High—form is primary conversion path

**No Mobile Navigation Close on Link Click:**
- Problem: Mobile menu stays open after navigation (though page scrolls); poor UX
- Files: `src/components/Header.tsx` (line 81 manually closes via onClick)
- Blocks: Mobile users may be confused by visible menu after navigation
- Priority: Low—workaround exists, but should be fixed

## Test Coverage Gaps

**No Unit Tests for Components:**
- What's not tested: ContactForm submission handler, form state management, error handling
- Files: `src/components/ContactForm.tsx`, `src/components/Header.tsx`, `src/components/Footer.tsx`
- Risk: Form regressions undetected; TypeScript compilation doesn't catch logic errors
- Priority: High—form is critical business logic

**No Integration Tests for Pages:**
- What's not tested: Page rendering, navigation, mobile responsiveness, animation sequencing
- Files: All page components in `src/app/*/page.tsx`
- Risk: Broken layouts, missing content, or styling issues discovered in production
- Priority: High—pages are user-facing

**No E2E Tests:**
- What's not tested: Full user flows (landing → form submission → confirmation), multi-device behavior
- Risk: Form submission flow, phone click, link navigation all untested in real browser
- Priority: Medium—critical paths should have E2E coverage

**No Accessibility Testing:**
- What's not tested: Keyboard navigation, screen reader support, contrast ratios, ARIA labels
- Files: All components
- Risk: Blind/keyboard-only users cannot navigate site; may violate WCAG 2.1 AA standards
- Priority: Medium—legal and UX requirement

---

*Concerns audit: 2026-04-05*
