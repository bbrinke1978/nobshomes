# Phase 2: Custom Email - Research

**Researched:** 2026-04-05
**Domain:** Custom domain email with Zoho Mail + GoDaddy DNS — email authentication (SPF, DKIM, DMARC)
**Confidence:** HIGH (Zoho official docs verified; GoDaddy official docs verified; DKIM record-type discrepancy in earlier STACK.md corrected)

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| EMAIL-01 | contact@no-bshomes.com receives email | MX records at GoDaddy pointing to Zoho Mail servers; mailbox created in Zoho Admin Console |
| EMAIL-02 | brian@no-bshomes.com receives email | User account created in Zoho Mail for brian; mailbox active |
| EMAIL-03 | shawn@no-bshomes.com receives email | User account created in Zoho Mail for shawn; mailbox active |
| EMAIL-04 | Email passes SPF, DKIM, and DMARC authentication checks | SPF TXT record + DKIM TXT record + DMARC TXT record at GoDaddy DNS; verified via MXToolbox |
| EMAIL-05 | Contact email updated site-wide to contact@no-bshomes.com | Already complete — `contact@no-bshomes.com` is set in `src/lib/contact-data.ts` and deployed |
</phase_requirements>

---

## Summary

Phase 2 is a pure DNS and email-provider configuration task — no code changes are required. The goal is to route email for `no-bshomes.com` through Zoho Mail (free plan) by adding MX, SPF, DKIM, and DMARC records to GoDaddy DNS. Because DNS for this domain stays at GoDaddy (a locked decision from Phase 1), all record management happens in GoDaddy's DNS manager.

Zoho Mail's free plan supports up to 5 users, 5 GB per user, and one custom domain — exactly right for 3 addresses (contact@, brian@, shawn@). The setup order matters: account creation and domain verification must happen before mailboxes are created, and SPF/DKIM/DMARC must be added before treating any email as "working." A critical correction from earlier STACK.md research: the DKIM record is a **TXT record**, not a CNAME, and the correct SPF include tag is `include:zohomail.com` (not `include:zoho.com`).

EMAIL-05 (updating the site contact email) is already complete. `src/lib/contact-data.ts` already contains `contact@no-bshomes.com` and is deployed to production. This requirement needs only a verification step, not an implementation step.

**Primary recommendation:** Follow the Zoho Mail Admin Console setup wizard in strict order — domain verification first, then MX records, then SPF + DKIM + DMARC, then create the three mailboxes. Do not mark any requirement done until MXToolbox confirms all three authentication records pass.

---

## Standard Stack

### Core Services

| Service | Plan/Version | Purpose | Why Standard |
|---------|-------------|---------|--------------|
| Zoho Mail | Free (5 users, 5 GB/user, 1 domain) | Mailbox hosting for `@no-bshomes.com` | Free tier sufficient for 3 addresses; no monthly cost; Domain Connect integration with GoDaddy reduces manual DNS entry; officially verified at zoho.com as of 2026-04-05 |
| GoDaddy DNS Manager | Existing (no changes to registrar/NS) | All DNS record management (MX, TXT, CNAME) | DNS stays at GoDaddy per Phase 1 locked decision — no nameserver transfer |

### DNS Records Required (Complete Set)

| Record Type | Host | Value | Priority | Purpose |
|-------------|------|-------|----------|---------|
| MX | `@` | `mx.zoho.com` | 10 | Primary mail server |
| MX | `@` | `mx2.zoho.com` | 20 | Secondary mail server |
| MX | `@` | `mx3.zoho.com` | 50 | Tertiary mail server |
| TXT | `@` | `v=spf1 include:zohomail.com -all` | — | SPF: authorizes Zoho to send |
| TXT | `zoho._domainkey` (or selector from Zoho console) | `v=DKIM1; k=rsa; p=[public key from Zoho]` | — | DKIM: cryptographic sender verification |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:contact@no-bshomes.com` | — | DMARC: policy enforcement and reporting |

**IMPORTANT CORRECTION from STACK.md:** The DKIM record is a **TXT record**, not a CNAME. The STACK.md listed it as `CNAME | zmail._domainkey`. Verified against both Zoho DKIM configuration docs and Zoho GoDaddy-specific guide: Zoho DKIM uses TXT records. The selector name comes from the Zoho Admin Console (you name it during DKIM key generation — `zoho` is a common choice).

**IMPORTANT CORRECTION from STACK.md:** The correct SPF include tag is `include:zohomail.com`, not `include:zoho.com`. Verified against Zoho SPF configuration docs.

### Verification Tools

| Tool | URL | Purpose |
|------|-----|---------|
| MXToolbox MX Lookup | mxtoolbox.com/mx-lookup | Verify MX records are resolving |
| MXToolbox SPF Check | mxtoolbox.com/spf.aspx | Verify SPF record is valid |
| MXToolbox DKIM Check | mxtoolbox.com/dkim.aspx | Verify DKIM record is published |
| MXToolbox DMARC Check | mxtoolbox.com/dmarc.aspx | Verify DMARC record is published |
| mail-tester.com | mail-tester.com | Send a real test email, get spam score 10/10 |
| dnschecker.org | dnschecker.org | Verify MX/TXT propagation from multiple global locations |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zoho Mail free | Google Workspace ($7/user/month) | Google Workspace adds Drive/Meet/Docs; total cost $21/month for 3 users; overkill for this use case |
| Zoho Mail free | GoDaddy Professional Email ($1-6/user/month) | Single-vendor convenience; ongoing cost; no clear benefit over Zoho free |
| Manual DNS entry in GoDaddy | Zoho Domain Connect (one-click OAuth) | Domain Connect is easier but does the same thing; manual entry gives more control and visibility |

---

## Architecture Patterns

### Setup Order (Critical — Do Not Reorder)

The Zoho Mail setup wizard enforces this order, and the DNS records must be in place before mailboxes are usable:

```
1. Create Zoho Mail account (zoho.com/mail → Sign Up Free)
2. Add no-bshomes.com as organization domain
3. Verify domain ownership in Zoho Admin Console
   └── Zoho generates a TXT record value for you to add to GoDaddy
   └── Add the verification TXT record at GoDaddy
   └── Click "Verify" in Zoho Admin Console
4. Add MX records to GoDaddy (3 records: mx.zoho.com priorities 10/20/50)
5. Add SPF TXT record to GoDaddy (v=spf1 include:zohomail.com -all)
6. Generate DKIM key in Zoho Admin Console → add TXT record to GoDaddy
7. Add DMARC TXT record to GoDaddy (_dmarc host, p=none to start)
8. Create 3 mailboxes in Zoho Admin Console:
   ├── contact@no-bshomes.com
   ├── brian@no-bshomes.com
   └── shawn@no-bshomes.com
9. Wait 24-48 hours for DNS propagation
10. Verify all records via MXToolbox
11. Send test email from each address to a Gmail account
12. Check test email lands in inbox (not spam) and sender identity shows correctly
```

### Pattern 1: GoDaddy Domain Verification for Zoho

**What:** Zoho requires you to prove you own the domain before it will route email for it. This is done by adding a temporary TXT record to GoDaddy DNS.

**When to use:** Step 3 above — before any mailboxes can be created.

**DNS record format:**
```
Type: TXT
Host: @
Value: zoho-verification=[code from Zoho Admin Console]
TTL: 1 hour (default)
```

After Zoho verifies, you can delete this verification TXT record (it is no longer needed). The MX, SPF, DKIM, and DMARC records that follow are permanent.

### Pattern 2: SPF Record — Single Record Rule

**What:** SPF has a hard constraint: DNS allows exactly one SPF TXT record per domain. Multiple SPF records cause a "permerror" that fails all SPF authentication.

**When this matters:** If GoDaddy has any existing email forwarding or default SPF records (GoDaddy sometimes adds one automatically), it must be deleted before adding the Zoho SPF record.

```
Type: TXT
Host: @
Value: v=spf1 include:zohomail.com -all
```

The `-all` qualifier is correct for this setup: only Zoho servers are authorized to send for this domain. If you later add another sending service (e.g., a transactional email provider for form notifications), you must merge it into this same record (e.g., `v=spf1 include:zohomail.com include:sendgrid.net -all`).

### Pattern 3: DKIM TXT Record

**What:** DKIM attaches a cryptographic signature to outgoing emails. The public key is published in DNS; Zoho holds the private key. Recipients verify the signature against the DNS record.

**How to get the value:** Generate the key in Zoho Admin Console under Domains > Email Configuration > DKIM > Add. Choose a selector name (e.g., `zoho`). Zoho generates the public key value.

```
Type: TXT
Host: zoho._domainkey   (or whatever selector name you chose)
Value: v=DKIM1; k=rsa; p=[long public key string from Zoho console]
```

Note: GoDaddy's DNS manager auto-appends the domain, so enter just `zoho._domainkey` not `zoho._domainkey.no-bshomes.com`.

### Pattern 4: DMARC — Start Monitoring Only

**What:** DMARC ties together SPF and DKIM and tells receiving servers what to do with mail that fails both checks. Start with `p=none` to avoid accidentally blocking legitimate mail while authentication settles.

```
Type: TXT
Host: _dmarc
Value: v=DMARC1; p=none; rua=mailto:contact@no-bshomes.com
```

After 30 days of clean DMARC reports arriving at `contact@`, tighten to `p=quarantine`. After another 30 days of clean reports, move to `p=reject`.

### Anti-Patterns to Avoid

- **Adding DKIM as CNAME instead of TXT:** Zoho Mail uses TXT records for DKIM. CNAME would be incorrect and the record would fail verification. (CNAME-based DKIM is used by some other providers, e.g., Google Workspace, but not Zoho.)
- **Using `include:zoho.com` in SPF:** The correct include tag is `include:zohomail.com`. Using `include:zoho.com` may or may not work — do not guess; use the verified value.
- **Creating duplicate SPF records:** One TXT `v=spf1` record per domain. If GoDaddy has a default one, delete it first.
- **Skipping DMARC:** It takes 5 minutes to add. Without it, there is no visibility into spoofing and receiving servers have no policy to follow. `p=none` does not harm delivery.
- **Testing only from your own email account:** Test by sending to Gmail and checking the raw message headers for Authentication-Results to confirm SPF pass, DKIM pass, DMARC pass.
- **Marking email "done" before MXToolbox confirms all three:** MX records delivering mail does not mean SPF/DKIM/DMARC are configured correctly. Run the full MXToolbox suite before closing any EMAIL-0x requirement.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Mailbox hosting | Self-hosted mail server (Postfix/Dovecot) | Zoho Mail free plan | Email server administration is a full-time job; deliverability requires IP reputation that a new server doesn't have; spam filter management, TLS certs, MX failover — all handled by Zoho |
| SPF/DKIM generation | Hand-crafting SPF/DKIM records | Zoho Admin Console wizard | Zoho generates the exact DKIM public key; SPF value is provided in their docs; copying from docs prevents typos in critical security records |
| Email deliverability testing | Manual inbox testing | MXToolbox + mail-tester.com | These tools check record validity, propagation, and spam scoring systematically; manual testing misses edge cases (different receiving domains, spam header analysis) |
| DMARC report analysis | Reading raw XML DMARC reports | Start with `rua` pointing to contact@ inbox | At this scale, raw DMARC reports are sufficient; no third-party DMARC reporting service needed until volume grows |

**Key insight:** Email infrastructure is one of the most deceptively complex areas of web operations. A mail server that "works" for sending test emails can still fail deliverability because of missing DNS records, IP reputation issues, or policy misconfigurations that only surface with real recipient inboxes. Use Zoho's established infrastructure entirely.

---

## Common Pitfalls

### Pitfall 1: Wrong SPF Include Tag

**What goes wrong:** Using `include:zoho.com` instead of `include:zohomail.com` in the SPF record. Some older documentation, blog posts, and the project's own STACK.md use the wrong value.

**Why it happens:** Zoho has multiple products and domains. `zoho.com` is the main corporate domain. `zohomail.com` is the correct include for the mail product's SPF.

**How to avoid:** Copy the value from Zoho's official SPF configuration page: `v=spf1 include:zohomail.com -all`. Do not derive from memory or old notes.

**Warning signs:** MXToolbox SPF check shows "softfail" or "neutral" for messages sent from Zoho despite the record existing.

### Pitfall 2: DKIM Record Added as CNAME

**What goes wrong:** Adding the DKIM record as a CNAME (as listed in the project's STACK.md) instead of a TXT record. The CNAME approach is used by Google Workspace; Zoho uses TXT.

**Why it happens:** Different email providers use different DKIM implementation methods. Some providers use CNAME delegation to their own DKIM signing infrastructure; Zoho embeds the public key directly in a TXT record.

**How to avoid:** In GoDaddy DNS manager, select **TXT** (not CNAME) when adding the DKIM record. The value starts with `v=DKIM1; k=rsa; p=`.

**Warning signs:** Zoho Admin Console shows DKIM verification failed; MXToolbox DKIM check returns "record not found."

### Pitfall 3: GoDaddy Has an Existing SPF Record

**What goes wrong:** GoDaddy sometimes pre-populates a TXT `v=spf1` record for domains that had GoDaddy email or email forwarding enabled. If you add a Zoho SPF record without deleting the existing one, you end up with two SPF records — causing `permerror` that fails all SPF checks.

**Why it happens:** SPF's DNS lookup model treats multiple `v=spf1` TXT records as a fatal error.

**How to avoid:** Before adding the Zoho SPF record, check GoDaddy's DNS manager for any existing TXT records at `@`. Delete any that start with `v=spf1` or `spf1`.

**Warning signs:** MXToolbox SPF check shows "PermError: too many SPF records."

### Pitfall 4: Email Forwarding Conflicts with MX Records

**What goes wrong:** If GoDaddy email forwarding (the free forwarding service built into domain registration) was previously enabled for `contact@`, `brian@`, or `shawn@`, it may conflict with the new MX records.

**Why it happens:** GoDaddy's email forwarding uses its own MX records. Adding Zoho MX records alongside forwarding MX records causes split delivery — some email goes to GoDaddy forwarding, some to Zoho.

**How to avoid:** In GoDaddy, before adding Zoho MX records, navigate to the domain's email forwarding settings and delete any active forwarding entries. Then clear any GoDaddy default MX records before adding the Zoho ones.

**Warning signs:** Some emails arrive, others don't; senders report delivery failures intermittently.

### Pitfall 5: DNS Propagation Confusion

**What goes wrong:** After adding DNS records, you test immediately from the same machine and see no effect — or you see a partial effect (MX works, DKIM not yet). This leads to incorrect conclusions about whether records were added correctly.

**Why it happens:** DNS records cache at multiple layers (OS, ISP, Zoho's own resolver). MX records typically propagate in 15-60 minutes; TXT records for DKIM can take up to 48 hours.

**How to avoid:** After adding records, use `dnschecker.org` to verify propagation from multiple geographic locations. Use MXToolbox (which queries authoritative DNS, not cached) for verification rather than your local machine's `nslookup`. Wait the full propagation window before concluding a record is wrong.

**Warning signs:** MXToolbox shows the record correctly but `nslookup` on your machine does not (local cache issue, not a problem).

### Pitfall 6: Not Verifying Each Address Individually

**What goes wrong:** Creating 3 mailboxes and testing only `contact@`. If a mailbox creation step was missed or has a typo, `brian@` or `shawn@` may silently not exist.

**How to avoid:** Send a test email to each of the three addresses from an external account (personal Gmail). Confirm receipt in the Zoho inbox for each.

---

## Code Examples

This phase has no code changes. All work is DNS record entry and web console configuration. The only code-adjacent task is confirming EMAIL-05 is already complete.

### EMAIL-05 Status Verification

The contact email is already set to `contact@no-bshomes.com` in production. Verify in code:

```typescript
// src/lib/contact-data.ts — already deployed, no changes needed
export const contactData = {
  phone: "(435) 250-3678",
  phoneHref: "tel:+14352503678",
  email: "contact@no-bshomes.com",   // ✓ Already correct
  ...
};
```

The planner should include a verification task for EMAIL-05 (confirm the deployed site shows `contact@no-bshomes.com` in the contact section) but no implementation task.

### MXToolbox Verification Commands (reference for task verification steps)

```
# After DNS propagation (run from mxtoolbox.com or these direct URLs):

MX Lookup:    https://mxtoolbox.com/SuperTool.aspx?action=mx%3ano-bshomes.com
SPF Check:    https://mxtoolbox.com/SuperTool.aspx?action=spf%3ano-bshomes.com
DKIM Check:   https://mxtoolbox.com/SuperTool.aspx?action=dkim%3ano-bshomes.com%3azoho
DMARC Check:  https://mxtoolbox.com/SuperTool.aspx?action=dmarc%3ano-bshomes.com
Blacklist:    https://mxtoolbox.com/SuperTool.aspx?action=blacklist%3ano-bshomes.com
```

For the DKIM check, the selector value (`zoho` in the URL above) must match whatever selector name you chose in the Zoho Admin Console during key generation.

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| SPF `~all` (soft fail) | SPF `-all` (hard fail) for single-provider setups | Google/Microsoft 2024-2025 enforcement tightening | `-all` is appropriate when Zoho is the only sending service; `~all` is only needed when multiple senders are in use |
| DMARC optional | DMARC required for Gmail/Yahoo bulk senders (2024) | February 2024 (Google/Yahoo policy) | Even for low-volume senders, `p=none` DMARC is now expected; without it, domain is at higher spam risk |
| DKIM 1024-bit keys | DKIM 2048-bit keys recommended | Industry-wide shift ~2022 | Choose 2048-bit when Zoho Admin Console offers the option during key generation |

**Deprecated/outdated:**

- `include:zoho.com` in SPF: Appears in older blog posts and the project's own STACK.md; the correct current value is `include:zohomail.com` per Zoho's official SPF docs.
- CNAME-based DKIM for Zoho: Appears in the project's STACK.md under `zmail._domainkey`. This is incorrect for Zoho Mail — Zoho uses TXT-based DKIM. CNAME-based DKIM is a Google Workspace pattern.

---

## Open Questions

1. **Zoho free plan regional availability**
   - What we know: Zoho's docs state the free plan "may not be available in certain regions"
   - What's unclear: Whether US-based signups face any restriction (no evidence of US restriction found)
   - Recommendation: Attempt signup immediately; if free plan is unavailable, the lowest paid tier (Mail Lite) costs ~$1/user/month ($3/month total for 3 users) — document as a risk but proceed with free plan first

2. **Existing GoDaddy email forwarding state**
   - What we know: Phase 1 set only A and CNAME records; no email was configured in Phase 1
   - What's unclear: Whether GoDaddy added any default MX or email forwarding records automatically when the domain was registered
   - Recommendation: First task in the plan should be to audit the GoDaddy DNS manager for any pre-existing MX records or TXT SPF records before adding Zoho records

3. **Zoho Domain Connect (one-click) vs. manual DNS entry**
   - What we know: Zoho's GoDaddy guide supports OAuth-based one-click DNS configuration that adds MX/SPF records automatically
   - What's unclear: Whether Domain Connect adds DKIM and DMARC automatically or only MX+SPF
   - Recommendation: Use manual DNS entry — it takes 10 extra minutes and gives full visibility into exactly what records exist; Domain Connect is a convenience shortcut that can obscure what was actually added

---

## Sources

### Primary (HIGH confidence)
- [Zoho Mail: Custom Domain Email](https://www.zoho.com/mail/custom-domain-email.html) — Free plan limits: 5 users, 5 GB/user, 1 domain; verified 2026-04-05
- [Zoho Mail: GoDaddy DNS Mapping](https://www.zoho.com/mail/help/adminconsole/godaddy.html) — MX record values, DKIM as TXT (not CNAME), SPF value `include:zohomail.com`; verified 2026-04-05
- [Zoho Mail: SPF Configuration](https://www.zoho.com/mail/help/adminconsole/spf-configuration.html) — Confirms `include:zohomail.com` (not `include:zoho.com`); single-record rule; `-all` vs `~all` guidance
- [Zoho Mail: DKIM Configuration](https://www.zoho.com/mail/help/adminconsole/dkim-configuration.html) — Confirms TXT record format; selector naming; 4-48 hour propagation
- [Zoho Mail: DMARC Policy](https://www.zoho.com/mail/help/adminconsole/dmarc-policy.html) — `_dmarc` host; recommended starting value `v=DMARC1; p=none; rua=mailto:...`; phased rollout
- [GoDaddy Help: Add an MX Record](https://www.godaddy.com/help/add-an-mx-record-19234) — GoDaddy UI steps; field definitions; propagation timeline
- [Zoho Mail: Complete Setup Guide](https://www.zoho.com/mail/complete-guide-to-setup-zohomail.html) — Step-by-step setup order; domain verification before mailbox creation
- [Zoho Mail: Pricing](https://www.zoho.com/mail/zohomail-pricing.html) — Free plan confirmed: no credit card required, forever free; paid plan pricing

### Secondary (MEDIUM confidence)
- [MXToolbox DMARC Email Tools](https://mxtoolbox.com/dmarc/dmarc-email-tools) — Verification tools available: SPF Check, DKIM Check, DMARC Check, MX Lookup, Blacklist Check
- WebSearch results confirming Zoho free plan available in 2026; regional restrictions noted but no US-specific restriction found

### Tertiary (LOW confidence)
- General web search results on GoDaddy MX record behavior alongside A/CNAME records — cross-verified against GoDaddy official docs

---

## Metadata

**Confidence breakdown:**
- DNS record values: HIGH — verified directly from Zoho official docs; two corrections made vs. STACK.md (SPF include tag, DKIM record type)
- Setup order and process: HIGH — verified against Zoho Admin Console setup guide
- Zoho free plan availability: MEDIUM — confirmed as of 2026-04-05; regional availability caveat noted
- Verification tools: HIGH — MXToolbox is the industry standard; verified it supports all three checks
- GoDaddy-specific behavior: MEDIUM — official GoDaddy docs checked; no undocumented MX/A conflicts found

**Research date:** 2026-04-05
**Valid until:** 2026-07-05 (90 days — Zoho free plan terms could change; verify at signup)

**Key corrections from prior STACK.md research:**
1. DKIM record type: CNAME (STACK.md) → **TXT** (verified, Zoho official docs)
2. SPF include tag: `include:zoho.com` (STACK.md) → **`include:zohomail.com`** (verified, Zoho official docs)
