# Phase 1: Custom Domain - Research

**Researched:** 2026-04-05
**Domain:** DNS configuration (GoDaddy to Netlify), contact data deployment
**Confidence:** HIGH

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DOM-01 | Site loads on https://no-bshomes.com with valid SSL | A record (75.2.60.5) in GoDaddy + Netlify custom domain registration triggers free Let's Encrypt cert |
| DOM-02 | Site loads on https://www.no-bshomes.com (redirect or serve) | CNAME `www` → `nobshomes.netlify.app` in GoDaddy; Netlify handles redirect automatically |
| DOM-03 | Old nobshomes.netlify.app URL continues to work (Netlify default) | Netlify never removes the `.netlify.app` subdomain — no action required, verify only |
| CONT-01 | Phone number updated site-wide to 435-250-3678 | Already in code (`contact-data.ts` line 2); requires only a deploy to go live |
| CONT-02 | Email updated site-wide to contact@no-bshomes.com | Already in code (`contact-data.ts` line 3); requires only a deploy to go live |
</phase_requirements>

---

## Summary

Phase 1 has a narrow technical scope: configure two DNS records in GoDaddy, register the custom domain in Netlify, and deploy the existing codebase. The contact information (CONT-01 and CONT-02) is already correct in `src/lib/contact-data.ts` — phone `(435) 250-3678` and email `contact@no-bshomes.com` are both present. No code changes are required; the only action is triggering a deploy so the live site reflects the already-committed values.

The DNS work is similarly contained. The decision to keep GoDaddy as DNS provider (not transferring nameservers to Netlify) was locked during setup to preserve control over MX records for Phase 2 email setup. This means only two records need to be added in GoDaddy: an A record for the apex domain and a CNAME for `www`. Netlify provisions a free TLS certificate via Let's Encrypt automatically once its DNS verification succeeds — no manual certificate management is needed.

The main risks are propagation timing and the pre-existing GoDaddy DNS state. GoDaddy domains may have default A records or parking page records that conflict with the new configuration. These must be deleted before or at the same time the new records are added. Propagation typically completes in 1-2 hours but can take up to 24 hours; verification should use an external tool (`whatsmydns.net`) rather than a local browser to avoid DNS cache confusion.

**Primary recommendation:** Add the A record and CNAME in GoDaddy, register the domain in Netlify site settings, trigger a deploy, then verify from a mobile hotspot using `whatsmydns.net`.

---

## Standard Stack

This phase requires no NPM packages and no code changes. All work is DNS configuration and Netlify dashboard operations.

### Core
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| GoDaddy DNS Manager | N/A (web UI) | Add A and CNAME records for no-bshomes.com | Domain is registered at GoDaddy; locked decision to keep DNS here |
| Netlify Site Settings | N/A (web UI) | Register custom domain, trigger SSL provisioning | Site is hosted on Netlify; this is the official domain registration flow |
| Let's Encrypt (via Netlify) | N/A (automatic) | TLS certificate for HTTPS on both apex and www | Netlify provisions and renews automatically at no cost — zero manual steps |

### Supporting
| Tool | Purpose | When to Use |
|------|---------|-------------|
| `whatsmydns.net` | Check DNS propagation from multiple global regions | After adding GoDaddy records — confirms records are resolving correctly before testing in browser |
| Mobile hotspot | Bypass local DNS cache | Test the live domain from a fresh resolver to confirm the site loads |
| Netlify deploy (git push or manual trigger) | Push existing code live | Required so CONT-01 and CONT-02 contact data changes are visible on the live site |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| GoDaddy external DNS (A + CNAME) | Transfer nameservers to Netlify DNS | Netlify DNS gives better CDN performance and branch subdomain support, but moves MX record control away from GoDaddy — breaks Phase 2 email setup if done now |
| A record (75.2.60.5) | ALIAS/ANAME record | ALIAS is preferred by Netlify for apex domains but GoDaddy does not support ALIAS records — A record is the correct fallback |

---

## Architecture Patterns

### No Code Changes Required

CONT-01 and CONT-02 are already implemented in `src/lib/contact-data.ts`. The file exports a single `contactData` object consumed site-wide. No edits are needed — only a deploy.

```
src/lib/contact-data.ts   ← already has correct phone and email
                            deploy triggers propagation to live site
```

### DNS Configuration Pattern

```
GoDaddy DNS Manager → no-bshomes.com zone
├── A     @          75.2.60.5              ← apex domain to Netlify load balancer
├── CNAME www        nobshomes.netlify.app   ← www to Netlify site subdomain
└── (all other existing records left untouched — especially MX records for Phase 2)
```

After GoDaddy records are saved:
```
Netlify Site Settings → Domain management → Add custom domain
├── Add: no-bshomes.com          ← Netlify detects A record, provisions SSL
└── Add: www.no-bshomes.com      ← Netlify sets up redirect www → apex
```

### Netlify Domain Registration Flow

**What:** Custom domains must be explicitly registered in Netlify's domain management UI. Adding DNS records alone is not sufficient — Netlify must know the domain belongs to this site to provision TLS and route traffic.

**Steps:**
1. Netlify site dashboard > Site configuration > Domain management
2. "Add custom domain" > enter `no-bshomes.com`
3. Netlify shows DNS verification status — "Awaiting external DNS" until propagation
4. Netlify auto-provisions Let's Encrypt cert once DNS verifies
5. Add `www.no-bshomes.com` as an alias — Netlify redirects www to apex automatically

**Confidence:** HIGH — verified against official Netlify external DNS docs (docs.netlify.com, 2026-04-05)

### Anti-Patterns to Avoid

- **Deleting GoDaddy's existing MX records:** GoDaddy may have default MX records even on an unused domain. Leave them untouched — they are needed (or can be replaced) in Phase 2.
- **Testing from the same machine immediately after DNS change:** Local DNS caches will show the old result. Use a mobile hotspot or `whatsmydns.net`.
- **Waiting for DNS before registering the domain in Netlify:** Register the domain in Netlify first (or at the same time as DNS changes) so Netlify is ready to issue the certificate when DNS propagates.
- **Transferring nameservers to Netlify in this phase:** This is a locked decision — do not do this. It would require recreating MX records and could break Phase 2 email setup.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| TLS certificate | Manual cert generation/renewal | Netlify's automatic Let's Encrypt provisioning | Netlify handles issuance, renewal, and installation automatically — no certbot, no cron jobs |
| www redirect | Custom redirect rules in next.config.ts | Netlify's built-in www-to-apex redirect | Netlify handles this at the CDN edge when both domains are registered in the dashboard |
| DNS verification | Manual dig/nslookup scripts | `whatsmydns.net` web tool | Visual global propagation view from 20+ locations — faster and clearer than manual CLI checks |

**Key insight:** Everything in Phase 1 is infrastructure configuration, not code. The correct mental model is "click in two dashboards and wait."

---

## Common Pitfalls

### Pitfall 1: Conflicting Existing A Records in GoDaddy

**What goes wrong:** GoDaddy creates default DNS records for new domains (often a parking page A record pointing to GoDaddy's own servers). If these are not removed before adding the Netlify A record, the zone has multiple A records for `@`, which causes unpredictable routing.

**Why it happens:** Developers add the new A record without auditing what's already in the GoDaddy DNS zone.

**How to avoid:** Open GoDaddy DNS Manager before making any changes. Look for existing A records on `@` or `www`. Delete any parking/default records before adding the Netlify records. Screenshot the pre-change state as a reference.

**Warning signs:** Site still shows GoDaddy parking page after propagation; `dig no-bshomes.com A` returns multiple IP addresses.

### Pitfall 2: DNS Propagation Cache Confusion

**What goes wrong:** After adding GoDaddy records, the developer tests from their local browser and sees the old state (parking page or NXDOMAIN). They assume the records didn't save. In reality, their local resolver has cached the old TTL.

**Why it happens:** Different resolvers cache DNS records for different durations. GoDaddy's default TTL may be 1 hour or more.

**How to avoid:** Use `whatsmydns.net` to check from multiple global resolvers. Use a mobile hotspot (different ISP resolver) for browser testing. Do not rely on the same machine used to make the DNS changes.

**Warning signs:** Netlify shows "Awaiting external DNS" for more than 2 hours; site loads on one device but not another.

### Pitfall 3: Netlify SSL Stuck on "Provisioning"

**What goes wrong:** Netlify shows the domain as registered but the SSL certificate remains in "Awaiting" or "Provisioning" state indefinitely.

**Why it happens:** Let's Encrypt validates domain ownership via DNS — if the A record hasn't propagated to Netlify's own resolvers yet, the ACME challenge fails and cert provisioning stalls.

**How to avoid:** Wait for `whatsmydns.net` to show the correct A record resolving from North America before checking Netlify's certificate status. If stuck after 24 hours, use Netlify's "Renew certificate" button in the SSL section to retry the Let's Encrypt challenge.

**Warning signs:** `https://no-bshomes.com` shows browser SSL error; Netlify dashboard shows "Certificate provisioning" for more than 4 hours after DNS has propagated.

### Pitfall 4: Nameserver Transfer (Locked Decision Violation)

**What goes wrong:** Netlify's domain management UI prominently suggests switching nameservers to Netlify DNS as the "recommended" approach. Following this recommendation during Phase 1 would complicate Phase 2 email setup.

**Why it happens:** Netlify's UI is optimized for the common case (full DNS delegation), not for projects that need to preserve GoDaddy DNS control for email.

**How to avoid:** Choose "Use external DNS" (the non-default path) in Netlify's domain setup flow. Add A/CNAME records in GoDaddy. Do not touch nameservers.

**Warning signs:** Netlify shows a "Change nameservers" prompt — dismiss it; do not follow it.

---

## Code Examples

### Verify Current contact-data.ts State (Already Done)

```typescript
// src/lib/contact-data.ts — current state (no changes needed)
export const contactData = {
  phone: "(435) 250-3678",      // CONT-01: correct
  phoneHref: "tel:+14352503678",
  email: "contact@no-bshomes.com", // CONT-02: correct
  company: "No BS Homes",
  slogan: "The Best Last Option",
  address: "Price, Utah",
  brothers: {
    brian: "Brian",
    shawn: "Shawn",
  },
};
```

This file is the single source of truth for contact data. No other files need editing for CONT-01 or CONT-02.

### GoDaddy DNS Records to Add

```
Record Type: A
Host:        @
Value:       75.2.60.5
TTL:         1 hour (or lowest available)

Record Type: CNAME
Host:        www
Value:       nobshomes.netlify.app
TTL:         1 hour (or lowest available)
```

Source: Netlify official external DNS docs — A record IP `75.2.60.5` verified 2026-04-05.

### Verification Commands

```bash
# Check apex domain A record (run after GoDaddy save)
dig no-bshomes.com A +short
# Expected: 75.2.60.5

# Check www CNAME
dig www.no-bshomes.com CNAME +short
# Expected: nobshomes.netlify.app.

# Check SSL certificate
curl -vI https://no-bshomes.com 2>&1 | grep -E "SSL|subject|issuer|expire"
# Expected: valid Let's Encrypt cert, subject = no-bshomes.com
```

---

## State of the Art

| Old Approach | Current Approach | Impact |
|--------------|------------------|--------|
| Manual TLS cert (certbot + cron) | Netlify automatic Let's Encrypt | No cert management needed |
| Separate www subdomain config | Netlify built-in www redirect | One setting in dashboard, no code |
| Hard-coded contact info in multiple files | Single `contact-data.ts` source of truth | CONT-01 and CONT-02 already done — zero edits needed |

---

## Open Questions

1. **Existing GoDaddy DNS record state**
   - What we know: GoDaddy domains often have default parking A records
   - What's unclear: Whether no-bshomes.com currently has any A, CNAME, or MX records that need to be audited before making changes
   - Recommendation: First task in the plan should be "Audit GoDaddy DNS zone" — screenshot current state, identify any records to remove

2. **Netlify site name confirmation**
   - What we know: Git status and repo context indicate the site is `nobshomes.netlify.app`
   - What's unclear: Whether the Netlify site name is exactly `nobshomes` or something else (e.g., a random-slug name)
   - Recommendation: Confirm in Netlify dashboard before writing the CNAME value — use the exact subdomain shown in Site settings > General

3. **Deploy trigger for CONT-01 / CONT-02**
   - What we know: The contact data is correct in code; it needs to be deployed
   - What's unclear: Whether the current production deploy already reflects these values (the commits show logo changes but not when contact-data.ts was last updated)
   - Recommendation: Treat a fresh deploy as required — push to master and confirm the live site shows the correct phone and email before marking CONT-01/CONT-02 done

---

## Sources

### Primary (HIGH confidence)
- [Netlify: Configure external DNS](https://docs.netlify.com/manage/domains/configure-domains/configure-external-dns/) — A record IP 75.2.60.5 verified; CNAME pattern verified; confirmed GoDaddy does not support ALIAS records (2026-04-05)
- `.planning/research/STACK.md` — DNS configuration section, GoDaddy-to-Netlify pattern, "keep GoDaddy DNS" decision rationale (project research, 2026-04-05)
- `.planning/research/PITFALLS.md` — Pitfalls 1, 2, 5 (nameserver switch, Netlify Forms, DNS propagation) directly applicable to this phase (project research, 2026-04-05)
- `src/lib/contact-data.ts` — Direct code inspection confirming CONT-01 and CONT-02 values are present

### Secondary (MEDIUM confidence)
- `.planning/STATE.md` — "Stay on GoDaddy DNS (A/CNAME records only) — no nameserver transfer" decision confirmed as locked
- `.planning/REQUIREMENTS.md` — DOM-01, DOM-02, DOM-03, CONT-01, CONT-02 requirement text and phase mapping

---

## Metadata

**Confidence breakdown:**
- DNS configuration: HIGH — A record IP verified against official Netlify docs; GoDaddy external DNS pattern verified
- Contact data status: HIGH — direct code inspection of contact-data.ts confirms values are present
- Propagation timing: MEDIUM — "1-2 hours typical, up to 24 hours" is consistent across sources but is probabilistic, not guaranteed
- GoDaddy existing DNS state: LOW — unknown until audited in the dashboard

**Research date:** 2026-04-05
**Valid until:** 2026-05-05 (DNS and Netlify APIs are stable; no fast-moving changes expected)
