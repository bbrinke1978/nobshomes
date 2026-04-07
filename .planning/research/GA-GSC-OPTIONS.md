# GA4 + Google Search Console Integration Options

**Project:** No BS Homes (nobshomes — Next.js 15 / App Router / Netlify)
**Researched:** 2026-04-05
**Overall confidence:** HIGH (official docs + multiple verified sources)

---

## 1. Google Analytics 4 (GA4)

### How to Add GA4 to Next.js 15 App Router

**Recommendation: Use `@next/third-parties/google` — the official Next.js integration.**

Do not use raw `gtag.js` script injection via `next/script` in the root layout manually. The `@next/third-parties` package wraps this correctly, handles loading strategy (deferred post-hydration), and is maintained by the Next.js team.

**Confidence: HIGH** — Official Next.js documentation lists this as the recommended path.

#### Installation

```bash
npm install @next/third-parties
```

#### Root Layout Integration

Add to `app/layout.tsx`. Gate on production to avoid polluting analytics during development:

```tsx
import { GoogleAnalytics } from '@next/third-parties/google'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
      {process.env.NEXT_PUBLIC_GA_ID && process.env.NODE_ENV === 'production' && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  )
}
```

Add to `.env.local` (and Netlify environment variables):

```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

#### Pageview Tracking

Pageviews are tracked automatically when the browser history changes. No additional code needed for route transitions — the GoogleAnalytics component handles this.

---

### Conversion Tracking: Form Submissions

**The core tracking goal:** every contact form submission = a lead = a GA4 conversion event.

GA4 recommends the event name `generate_lead` for lead gen form submissions (it is a GA4 recommended event with a standard schema). Mark it as a conversion in GA4 Admin > Events.

#### sendGAEvent Implementation

The `sendGAEvent` function from `@next/third-parties/google` had a known bug (GitHub issue #61703) where custom events were not registering. This was fixed in PR #62192. As long as you are on a current version of `@next/third-parties`, the fix is included.

In the contact form component (must be a Client Component):

```tsx
'use client'

import { sendGAEvent } from '@next/third-parties/google'

export function ContactForm() {
  async function handleSubmit(formData: FormData) {
    // ... send to Netlify + HouseFinder API

    // Fire GA4 event after successful submission
    sendGAEvent('event', 'generate_lead', {
      event_category: 'contact_form',
      event_label: 'homepage_contact',
      value: 1,
    })
  }

  return <form action={handleSubmit}>...</form>
}
```

**If sendGAEvent has issues in your version**, the fallback is direct gtag:

```tsx
window.gtag('event', 'generate_lead', {
  event_category: 'contact_form',
  event_label: 'homepage_contact',
})
```

#### Making It a Conversion in GA4 Dashboard

1. Go to GA4 Admin > Events
2. Find `generate_lead`
3. Toggle "Mark as conversion" to ON

This is a one-time setup step in the GA4 UI, not in code.

---

### Additional Events Worth Tracking

For a "we buy houses" lead gen site, these events give meaningful signal:

| Event Name | When to Fire | Why |
|------------|-------------|-----|
| `generate_lead` | Form successfully submitted | Primary conversion — mark as conversion |
| `phone_click` | User clicks the phone number | High-intent signal — mark as conversion |
| `scroll` | User reaches 75% page depth | Engagement quality signal |
| `page_view` | (automatic) | Traffic baseline |

Phone click tracking:

```tsx
'use client'
import { sendGAEvent } from '@next/third-parties/google'

<a
  href="tel:4352503678"
  onClick={() => sendGAEvent('event', 'phone_click', {
    event_category: 'contact',
    event_label: 'header_phone',
  })}
>
  435-250-3678
</a>
```

---

### Privacy and Cookie Consent

**US-only site: No legal requirement for a consent banner.** Federal US law does not mandate cookie consent (CCPA applies to large companies meeting specific thresholds — No BS Homes does not qualify). GDPR only applies to EU residents.

**Confidence: MEDIUM** — Multiple legal sources agree on this for small US-only businesses.

**Recommendation:** Skip the cookie consent banner entirely for now. If the business ever expands internationally, revisit. Keep it simple — a banner will hurt conversion rate on a lead gen site.

The only mitigation needed: include a simple Privacy Policy page that mentions analytics data collection. This is standard practice and low effort.

---

### Key GA4 Metrics for a Lead Gen Site

Focus on these — ignore vanity metrics like total pageviews:

| Metric | Why It Matters | Where in GA4 |
|--------|---------------|-------------|
| Conversions (generate_lead) | The actual business outcome | Reports > Conversions |
| Conversion rate | What % of visitors become leads | Custom report: sessions vs. conversions |
| Engaged sessions | Quality traffic indicator (2+ pages or 10s+) | Engagement > Overview |
| Traffic by source/medium | Where leads come from (organic, direct, referral) | Acquisition > Traffic Acquisition |
| Landing page performance | Which pages drive submissions | Engagement > Landing Pages |
| Phone click events | High-intent micro-conversion | Reports > Events |

**Do not obsess over:** Bounce rate (replaced in GA4), average session duration (misleading for SPA-style sites), total users without conversion context.

---

## 2. Google Search Console

### Verification: Use DNS TXT Record (Recommended)

Since no-bshomes.com is registered through GoDaddy and GoDaddy DNS is being used, the **Domain property with DNS TXT verification** is the correct approach. This is superior to HTML file or meta tag methods because:

- Verifies ALL protocol variants (http/https) and all subdomains (www + apex) in one step
- Persists even if you change hosting providers (does not depend on Netlify)
- Not affected by caching or CDN layers

**Confidence: HIGH** — Confirmed by Google's official documentation and multiple GoDaddy-specific guides.

#### Step-by-Step: GoDaddy DNS TXT Verification

1. Go to [Google Search Console](https://search.google.com/search-console) and click "Add Property"
2. Choose **"Domain"** property type (not "URL prefix") — enter `no-bshomes.com`
3. GSC shows a TXT record value like `google-site-verification=XXXXX...`
4. Log into GoDaddy > My Products > DNS next to `no-bshomes.com`
5. Add a new TXT record:
   - **Type:** TXT
   - **Name/Host:** `@`
   - **Value:** paste the verification string from GSC
   - **TTL:** leave at default (1 hour)
6. Save, then click Verify in GSC
7. DNS propagation: 10 minutes to 48 hours (usually under 30 minutes)
8. Keep the TXT record forever — removing it de-verifies the property

**Do not delete this record** even after verification succeeds.

---

### Sitemap Generation for Next.js 15 App Router

Next.js 15 has first-class built-in sitemap support via the file convention. No third-party package needed.

**Recommendation: Use `app/sitemap.ts`** — do not use `next-sitemap` for a simple marketing site.

**Confidence: HIGH** — Official Next.js documentation.

#### Implementation

Create `app/sitemap.ts`:

```ts
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://no-bshomes.com',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://no-bshomes.com/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://no-bshomes.com/how-it-works',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://no-bshomes.com/faq',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://no-bshomes.com/contact',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
  ]
}
```

This auto-serves at `/sitemap.xml`. Submit this URL in GSC after verification.

Also create `app/robots.ts`:

```ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://no-bshomes.com/sitemap.xml',
  }
}
```

---

### Structured Data / Schema.org for Local Business

**Recommendation: Implement three schema types — LocalBusiness, Service, and FAQPage.**

This is the highest-ROI technical SEO action for a "we buy houses" site targeting Utah. Structured data directly influences local pack eligibility and rich snippet appearance.

**Confidence: MEDIUM** — Multiple sources agree; specific conversion impact claims from individual sites are LOW confidence.

#### LocalBusiness Schema

Place in the root `layout.tsx` so it appears on every page:

```tsx
const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'RealEstateAgent',  // More specific than LocalBusiness
  name: 'No BS Homes',
  description: 'We buy houses for cash in Utah. Fast, fair offers for distressed homeowners.',
  url: 'https://no-bshomes.com',
  telephone: '+1-435-250-3678',
  email: 'contact@no-bshomes.com',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Utah',  // Update with specific city once confirmed
    addressRegion: 'UT',
    addressCountry: 'US',
  },
  areaServed: [
    { '@type': 'State', name: 'Utah' },
    { '@type': 'City', name: 'Salt Lake City' },
    { '@type': 'City', name: 'Provo' },
    { '@type': 'City', name: 'Ogden' },
    { '@type': 'City', name: 'St. George' },
    // Add cities where Brian and Shawn actively operate
  ],
  sameAs: [
    // Add Google Business Profile URL once created
    // Add Facebook/LinkedIn if applicable
  ],
}
```

Inject it in `app/layout.tsx`:

```tsx
import Script from 'next/script'

// Inside RootLayout, in the <head> or directly in <body>:
<Script
  id="local-business-schema"
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
/>
```

**Use `RealEstateAgent` type** — it is a valid schema.org subtype of `LocalBusiness` and is more specific to the business model than generic `LocalBusiness`.

#### FAQPage Schema

Place on the FAQ page only (`app/faq/page.tsx` or `app/faq/layout.tsx`):

```tsx
const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How fast can I sell my house in Utah?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No BS Homes can typically close in 7-14 days...',
      },
    },
    {
      '@type': 'Question',
      name: 'Do you buy houses in foreclosure in Utah?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, we specialize in buying houses facing foreclosure...',
      },
    },
    // Match actual FAQ content
  ],
}
```

FAQPage schema can produce rich snippets in search results, showing Q&A directly on the SERP — high value for "we buy houses" queries.

#### NAP Consistency Requirements

NAP (Name, Address, Phone) must be **exactly identical** everywhere: website footer, Google Business Profile, schema markup, and any directory listings.

Current contact info to use consistently everywhere:
- **Name:** No BS Homes
- **Phone:** 435-250-3678 (format consistently — pick one: `(435) 250-3678` or `435-250-3678` or `435.250.3678`)
- **Email:** contact@no-bshomes.com
- **Address:** TBD — once a business address is established, use it consistently

Display NAP in plain text in the site footer (not an image). This is required for search engine parsing and for schema to match visible content.

---

### Most Valuable GSC Data for a Lead Gen Site

| Report | What to Watch | Action Trigger |
|--------|-------------|----------------|
| Performance > Queries | Which "we buy houses [city]" queries get impressions | Write more content targeting queries with impressions but low CTR |
| Performance > Pages | Which pages get clicks from organic search | Double down on content on top pages |
| Coverage | Index errors, excluded pages | Fix errors immediately — excluded pages = invisible to Google |
| Core Web Vitals | LCP, FID, CLS scores | Poor scores hurt rankings; Next.js/Netlify should be fine |
| Links | External sites linking to you | Monitor for spam links that could harm rankings |

**Most important GSC query to watch:** Impressions + clicks for `we buy houses utah`, `sell my house fast utah`, `cash home buyers [city] utah`. These are the exact queries that produce leads.

---

## 3. Google Business Profile

### GBP to GSC Connection

GBP (Google Business Profile, formerly Google My Business) and GSC are separate systems that do not natively sync in real time. However, they work together for local SEO in the following ways:

- GSC organic search data includes Local Pack traffic, but does not distinguish it from standard organic
- To separate Local Pack traffic from organic, add UTM parameters to the GBP "Website" URL field: `https://no-bshomes.com/?utm_source=google&utm_medium=organic&utm_campaign=gbp`
- GBP Insights tracks calls, direction requests, and map views — this data is not in GSC at all

**Important limitation (confirmed by Sterling Sky research):** GSC cannot track Local Pack impressions when the mobile 3-pack does not show a "Website" button — increasingly common as Google pushes AI Overviews. This means GSC undercounts local traffic.

**Confidence: MEDIUM** — Sterling Sky is a credible local SEO authority, verified by multiple sources.

### Local SEO Signals for "We Buy Houses [City]" Searches

Priority actions (roughly in order of impact):

1. **Create and fully complete Google Business Profile** — This is the single most impactful local SEO action. It is free and takes 1-2 hours.
   - Category: "Real estate investor" or "We buy houses"
   - Add all services explicitly
   - Upload photos (exterior of a property purchased, team photos)
   - Get initial reviews from anyone Brian and Shawn have worked with

2. **Consistent NAP everywhere** — GBP, website footer, schema markup must match exactly

3. **Service area in GBP** — Set service area to Utah cities where deals happen, not just one city

4. **LocalBusiness schema on website** — As described above, with `areaServed` matching GBP service area

5. **City-specific landing pages** (longer term) — A page for "We Buy Houses Salt Lake City" with local content. Not in MVP scope but high-value for ranking in specific cities.

6. **Reviews** — Google reviews on GBP directly influence local pack ranking. Ask every satisfied seller for a review.

### NAP Consistency Across the Site

Implement a site-wide footer component that renders the phone number and email as clickable links. Use the same format everywhere:

```
No BS Homes
Phone: (435) 250-3678
Email: contact@no-bshomes.com
```

The phone number in the footer should also match the schema markup. Inconsistency between schema, footer, and GBP confuses both search engines and users.

---

## 4. Implementation Complexity

### What Can Be Done in a Single Day

| Task | Time Estimate | Complexity |
|------|--------------|------------|
| Create GA4 property, get Measurement ID | 15 min | Trivial |
| Install `@next/third-parties`, add GoogleAnalytics to layout | 30 min | Low |
| Add `NEXT_PUBLIC_GA_ID` to Netlify env vars | 10 min | Trivial |
| Add `sendGAEvent` to contact form on submit | 30 min | Low |
| Mark `generate_lead` as conversion in GA4 | 10 min | Trivial |
| Add phone click tracking | 20 min | Low |
| Add DNS TXT record in GoDaddy for GSC | 20 min | Low |
| Verify GSC property | 5 min (+ wait time) | Trivial |
| Create `app/sitemap.ts` and `app/robots.ts` | 30 min | Low |
| Submit sitemap in GSC | 5 min | Trivial |
| Add LocalBusiness JSON-LD to root layout | 45 min | Low-Medium |
| Add FAQPage JSON-LD to FAQ page | 30 min | Low |
| Add NAP to site footer | 30 min | Low |
| Create Google Business Profile | 60-90 min | Low |

**Total for "done in a day" core setup: ~5-6 hours**

This covers GA4 tracking, GSC verification, sitemap, structured data, and GBP creation.

### What Needs Ongoing Work

| Task | Cadence | Why |
|------|---------|-----|
| GSC query review | Monthly | Find high-impression / low-CTR queries to target with content |
| GA4 conversion review | Weekly at first | Verify events are firing correctly; catch tracking breaks |
| GBP review responses | As they come in | Signals to Google that business is active |
| GBP posts | 2x/month | Keeps GBP listing active and fresh |
| Core Web Vitals in GSC | Quarterly | Fix if scores degrade |
| Schema validation | After any layout change | Use Google's Rich Results Test to verify JSON-LD is valid |

### What to Defer

- Google Tag Manager (GTM): Overkill for this site. Direct `sendGAEvent` is sufficient. GTM adds complexity without benefit when the dev controls the codebase.
- City-specific landing pages: High SEO value but content creation effort — defer until GA4 shows which city queries drive the most impressions.
- Google Ads conversion tracking: Only relevant if paid campaigns are ever started.
- Cookie consent banner: Not legally required for US-only site at this scale.

---

## Implementation Order

This is the recommended sequence for an implementation sprint:

1. **GA4 setup** (property creation + layout integration) — Validate events fire before moving on
2. **Contact form event tracking** — Verify `generate_lead` appears in GA4 DebugView
3. **Mark `generate_lead` as conversion** in GA4 Admin
4. **GSC verification** (add TXT to GoDaddy DNS — can wait while DNS propagates)
5. **`sitemap.ts` + `robots.ts`** — Deploy to Netlify
6. **Submit sitemap** in GSC after verification completes
7. **LocalBusiness + FAQPage JSON-LD** — Validate with [Google Rich Results Test](https://search.google.com/test/rich-results)
8. **NAP in footer** — Ensure phone and email match schema exactly
9. **Create Google Business Profile** — This takes a few days for postcard verification anyway

---

## Sources

- [Next.js Third Party Libraries Guide](https://nextjs.org/docs/app/guides/third-party-libraries) — Official Next.js docs for `@next/third-parties` (HIGH confidence)
- [Next.js Sitemap File Convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap) — Official Next.js docs (HIGH confidence)
- [Next.js robots.txt File Convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots) — Official Next.js docs (HIGH confidence)
- [How to Add GA4 to Next.js 15](https://www.sujalvanjare.com/blog/how-to-add-google-analytics-nextjs-15) — Verified implementation example (MEDIUM confidence)
- [sendGAEvent bug #61703](https://github.com/vercel/next.js/issues/61703) — Confirmed bug + fix in next.js repo (HIGH confidence)
- [GA4 Conversion Tracking 2025](https://www.conversios.io/blog/event-based-conversion-tracking-ga4-setup/) — Event-based conversion setup (MEDIUM confidence)
- [GA4 Form Tracking in 2025](https://www.owox.com/blog/articles/online-forms-efficiency) — Form tracking best practices (MEDIUM confidence)
- [GSC Domain Verification with GoDaddy](https://clicknathan.com/web-design/verify-godaddy-domain-with-google-search-console/) — Step-by-step GoDaddy TXT record (MEDIUM confidence)
- [Google Search Console Verify Ownership](https://support.google.com/webmasters/answer/9008080?hl=en) — Official Google support (HIGH confidence)
- [Structured Data for Real Estate Investor Sites](https://investornitro.com/blog/structured-data-for-real-estate-investor-sites/) — LocalBusiness + FAQ schema for "we buy houses" niche (MEDIUM confidence)
- [Next.js JSON-LD Guide](https://nextjs.org/docs/app/guides/json-ld) — Official Next.js structured data guidance (HIGH confidence)
- [GSC vs GBP — Local Pack Tracking](https://www.sterlingsky.ca/search-console-tracking-local-pack/) — Sterling Sky on GSC local data limitations (MEDIUM confidence, credible SEO authority)
- [Local SEO 2025 — GBP](https://www.techwyse.com/blog/search-engine-optimization/local-seo-2025-google-business-profile) — Current GBP strategy (MEDIUM confidence)
- [NAP Consistency for Local SEO 2025](https://wpmaps.com/blog/nap-consistency-a-strategy-to-boost-local-seo/) — NAP importance and implementation (MEDIUM confidence)
- [Cookie Consent Requirements US vs EU](https://secureprivacy.ai/blog/google-consent-mode-ga4-cmp-requirements-2025) — US consent law status (MEDIUM confidence)
