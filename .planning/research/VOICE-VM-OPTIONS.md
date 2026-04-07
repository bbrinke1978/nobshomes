# Google Voice Voicemail → HouseFinder Lead Pipeline Options

**Project:** No BS Homes / HouseFinder
**Researched:** 2026-04-05
**Phone number in question:** 435-250-3678 (Google Voice, Utah area code)
**Target system:** HouseFinder `POST /api/leads` endpoint (Next.js on Azure, PostgreSQL)

---

## Executive Summary

Google Voice does not have a public API. Full stop. No official, supported way exists to programmatically intercept voicemails as they arrive. However, Google Voice does email voicemail transcriptions to the linked Gmail account, and that email is the key automation surface. The recommended path for a 2-person team is **Google Apps Script watching Gmail for voicemail emails, parsing the transcription and caller number, and POSTing to HouseFinder's API**. This approach is free, runs on Google's infrastructure, requires zero ongoing maintenance, and can be live in an afternoon.

The main trade-off with the Apps Script path is that Google Voice's transcription accuracy is imperfect (roughly 70-80% word accuracy for casual speech, worse for addresses and names), so many leads will arrive with a message field that says "call me back" or garbled text. The phone number, however, is always accurate because it comes from the email subject line, not the transcription. A lead with just a phone number is still a workable lead for a "we buy houses" business — the team can return the call.

If the team wants fully structured data (name, address) automatically extracted from voicemail with high reliability, Twilio is the right long-term answer: it provides a programmable webhook on every incoming call, triggers instantly, and allows Google Cloud Speech-to-Text or Whisper to process the recording. But this means porting or replacing the existing 435 number, which adds friction and cost.

The recommendation is: **build the Apps Script pipeline now (free, works today), and revisit Twilio only if lead volume makes manual callback impractical.**

---

## 1. Google Voice Built-In Capabilities

### Does Google Voice transcribe voicemails?

**YES — HIGH confidence.** Google Voice automatically transcribes voicemails using Google AI. The transcription appears in the Voice app inbox and can be emailed. The feature is on by default for personal Google accounts and is available in Google Voice for Workspace (paid tier).

### How accurate is the transcription?

**MEDIUM confidence.** Google Voice uses an older transcription model compared to Google Cloud Speech-to-Text. Community reports and third-party evaluations consistently describe it as:

- Accurate enough to get the gist of a message (70-80% word accuracy in ideal conditions)
- Struggles significantly with: addresses (number sequences, street names), proper nouns (names), accents, and poor cell signal
- Better at short, clear messages ("Hi, I'm interested in selling my house, please call me back")
- Words it can't understand are displayed in gray in the app but the email still delivers the best-guess text

For the "we buy houses" use case: most callers leave one of two messages:
1. "Call me back" (minimal data — phone number is the only useful field)
2. "I have a house at [address] I want to sell" (address will often be garbled)

**Conclusion:** Do not rely on transcription to populate `address`, `city`, `state`, or `zip` fields reliably. The transcription is best treated as a free-form `message` field and the caller's number is the actual lead identifier.

### Does Google Voice have a public API?

**NO — HIGH confidence.** Google Voice has no official public API as of April 2026. This has been confirmed by Google community moderators and multiple independent sources. Unofficial Python libraries (pygooglevoice, jaraco/googlevoice) exist but are not maintained, frequently broken due to Google auth changes, and violate Google's Terms of Service. Do not use them.

### Google Voice voicemail email format

**MEDIUM confidence** (confirmed from multiple sources, not from direct email inspection):

| Field | Value |
|-------|-------|
| Sender address | `voice-noreply@google.com` (some sources say `noreply@google.com`) |
| Subject line | `New voicemail from [+1XXXXXXXXXX]` or `New voicemail from ([area code]) [number]` |
| Body | Plain text + HTML version; includes transcription text and a "Play message" link |
| Audio attachment | No inline attachment — audio is accessible via link only |
| Caller number | Always present in subject line, even if transcription is empty |

The subject line is the most reliable data source: the caller's phone number is formatted there consistently. Regex on the subject line reliably extracts the 10-digit caller number.

### Voicemail email forwarding settings

**HIGH confidence.** Settings are at `voice.google.com → Settings → Voicemail → Get voicemail via email`. Toggle is on by default for personal accounts. The email goes to the Gmail address linked to the Google Voice account. You cannot route to a different email address from within Google Voice settings — it's locked to the linked account. If Brian's Voice account is linked to his Gmail, voicemail emails arrive in Brian's Gmail inbox.

---

## 2. The Email-Based Pipeline (Recommended for Now)

### How it works

```
Caller leaves voicemail on 435-250-3678
        |
        v
Google Voice transcribes it
        |
        v
Email sent to linked Gmail (voice-noreply@google.com)
Subject: "New voicemail from +14350001234"
Body: "Hi I want to sell my house on Main Street..."
        |
        v
Google Apps Script (time trigger, every 5 minutes)
Searches Gmail: from:voice-noreply@google.com is:unread
        |
        v
Parses subject → extracts caller phone number
Parses body → extracts transcription text
        |
        v
HTTP POST to housefinder-app.azurewebsites.net/api/leads
{
  "phone": "4350001234",
  "message": "Hi I want to sell my house on Main Street...",
  "leadSource": "voicemail",
  "name": "",
  "address": "",
  "city": "",
  "state": "UT",
  "zip": ""
}
        |
        v
Lead appears in HouseFinder dashboard
```

### Apps Script implementation pattern

Google Apps Script runs free on Google's infrastructure. The relevant APIs:

```javascript
// Search Gmail for unread voicemail emails
function processVoicemailEmails() {
  var threads = GmailApp.search('from:voice-noreply@google.com is:unread');

  threads.forEach(function(thread) {
    var messages = thread.getMessages();
    messages.forEach(function(message) {
      if (message.isUnread()) {
        var subject = message.getSubject();
        var body = message.getPlainBody();

        // Extract caller phone number from subject
        // Subject format: "New voicemail from +14359001234"
        var phoneMatch = subject.match(/\+?1?(\d{10})/);
        var callerPhone = phoneMatch ? phoneMatch[1] : '';

        // The body contains the transcription
        // Need to strip HTML and extract just the transcription text
        // Pattern varies — transcription typically appears before the "Play message" link

        var payload = JSON.stringify({
          phone: callerPhone,
          message: body.substring(0, 1000), // cap at 1000 chars
          leadSource: 'voicemail',
          name: '',
          address: '',
          city: '',
          state: 'UT',
          zip: ''
        });

        var options = {
          method: 'post',
          contentType: 'application/json',
          payload: payload,
          headers: {
            'Authorization': 'Bearer YOUR_API_KEY'
          },
          muteHttpExceptions: true
        };

        var response = UrlFetchApp.fetch(
          'https://housefinder-app.azurewebsites.net/api/leads',
          options
        );

        // Mark as read to prevent reprocessing
        message.markRead();
      }
    });
  });
}
```

Set a time-based trigger in Apps Script to run every 5-10 minutes. This is free, unlimited, and requires no external service.

**IMPORTANT CAVEAT:** The exact format of the voicemail email body varies slightly and Google does not document it officially. The body parsing regex must be validated against actual emails received on the 435 number before going live. The phone number extraction from the subject line is reliable. The body text extraction requires testing.

### Pros

- Free (runs on Google's quota, which is generous for light use)
- No external dependencies — everything runs within Google's ecosystem
- Can be live in 2-4 hours
- No ongoing maintenance unless Google changes their email format
- Caller phone number is always captured accurately
- Processes emails within 5-10 minutes of voicemail

### Cons

- 5-10 minute latency (not real-time)
- Google Voice transcription accuracy ~70-80% (worse for addresses)
- Email format is undocumented and could change if Google updates Voice
- Cannot extract structured name/address fields reliably
- One-email-to-one-Gmail restriction (can't route to multiple inboxes)
- Apps Script has execution time limits (6 min per execution, 90 min/day total — well within scope for this use case)

### Reliability assessment

**MEDIUM confidence on long-term stability.** The email-based pipeline has worked for years because Google's email format has been stable. The risk is that Google could change the format or disable the feature, but there's no indication they plan to do so. For a 2-person operation receiving occasional voicemails (not dozens per day), this is fully adequate.

---

## 3. Google Cloud / Telephony Options

### Google Cloud Speech-to-Text

Google Cloud Speech-to-Text is significantly more accurate than Google Voice's built-in transcription — it's what powers Google Assistant and modern Pixel voicemail. However, using it requires:

1. Getting the audio file out of Google Voice (not possible programmatically — Voice doesn't expose audio via API or email attachment)
2. OR using a different phone system that provides audio recordings via webhook

This makes Google Cloud Speech-to-Text **irrelevant for the current Google Voice setup** — there's no path to get audio from Google Voice into Cloud Speech-to-Text without a human downloading it manually.

### Twilio — The Full Programmable Alternative

Twilio Programmable Voice gives you a webhook on every inbound call. You configure what happens: record the voicemail if no answer, transcribe it, POST the result to your server. This is the gold standard for voicemail automation.

**Twilio pricing (HIGH confidence, verified from official pricing page):**

| Item | Cost |
|------|------|
| Local phone number | $1.15/month |
| Inbound call | $0.0085/minute |
| Call recording | $0.0025/minute |
| Basic transcription | $0.0500/minute (per recording minute, not call minute) |
| Conversational AI transcription | $0.024-0.027/minute |

For a typical "we buy houses" voicemail business receiving 10-50 calls/month, monthly Twilio cost would be under $5-10 total.

**What you get that Google Voice doesn't provide:**
- Webhook fires instantly when voicemail is recorded (no polling)
- Audio recording accessible as a URL for custom transcription
- Caller number always in the webhook payload (structured, not parsed from email)
- You control the transcription engine (Twilio's basic, Twilio's Conversational AI, or pipe audio to Whisper/Cloud Speech-to-Text)
- Metadata: call duration, time of call, call SID for deduplication

**Porting the 435 number to Twilio:**
- YES — Google Voice numbers can be ported to Twilio (HIGH confidence, confirmed from Twilio help docs)
- Process: Unlock the number in Google Voice settings first, then submit port request via Twilio console
- Timeline: 2-4 weeks for simple ports
- After porting, the number works identically on Twilio — callers dial the same 435-250-3678

**Twilio webhook flow to HouseFinder:**

```
Caller dials 435-250-3678 (now on Twilio)
        |
        v
Twilio webhook fires to YOUR endpoint (e.g., housefinder or a Cloudflare Worker)
If no answer → TwiML plays greeting → Record voicemail
        |
        v
Twilio POSTs recording URL + transcription to your statusCallback URL
        |
        v
Your handler POSTs to HouseFinder /api/leads
{
  "phone": "4352503678",  // always structured
  "message": "transcription text",
  "leadSource": "voicemail"
}
```

**Vonage / Plivo — Other programmable voice platforms:**
Both offer similar webhook functionality at comparable pricing. Vonage has slightly worse developer experience. Plivo is cheaper but smaller ecosystem. Neither has a meaningful advantage over Twilio for this use case. Twilio's documentation, community, and Node.js SDK are significantly better. Stick with Twilio if going the programmable voice route.

---

## 4. Zapier / Make / n8n Automation

### Zapier

**Can Zapier connect Google Voice to a webhook?** No — Google Voice is not available as a native Zapier integration (confirmed from Zapier's own integration listing and community responses).

**Gmail trigger → Webhook → HouseFinder API via Zapier:**
This WOULD work as a flow:

1. Zapier trigger: Gmail — "New Email Matching Search" with filter `from:voice-noreply@google.com`
2. Zapier action: Webhooks by Zapier — POST to HouseFinder

**Cost issue:** Webhooks by Zapier require the Professional plan ($29.99/month billed annually). The free tier caps at 100 tasks/month and does NOT include webhooks. For occasional voicemail automation, paying $30/month is unjustifiable when Google Apps Script does the same thing for free.

**Latency:** Free tier polls every 15 minutes. Paid plans poll every 1-5 minutes. Still not real-time.

**Verdict: Do not use Zapier for this.** Apps Script is free and faster.

### Make.com (formerly Integromat)

Make.com has a "Mailhook" feature — a special email address you can send emails to that triggers a scenario. However, getting Google Voice voicemail emails into Make's mailhook requires either:
- Forwarding Gmail to the Make mailhook address (adds forwarding config to Gmail)
- OR using Gmail trigger module (requires OAuth, polling)

**Make.com pricing:**
- Free: 1,000 operations/month, 2 active scenarios, 15-minute minimum interval
- Core: $9/month (10,000 operations, 1-minute interval)

**Verdict:** Make.com at $9/month is reasonably priced and more capable than Zapier's free tier, but still inferior to the free Apps Script approach for this specific workflow. Make makes sense if the team wants a no-code visual interface and is already using Make for other automations.

### n8n

n8n is a powerful open-source workflow automation tool. It can do Gmail trigger → HTTP Request in a clean visual workflow.

- Self-hosted: Free (but requires server to run on — adds ops burden)
- Cloud: Starts at $22/month

**Verdict: Overkill for this use case.** Two people managing occasional voicemail-to-lead automation don't need a self-hosted workflow engine. Apps Script is the right fit.

---

## 5. Google Apps Script — The Recommended Approach (Detailed)

### Why Apps Script wins for this team

- **Free:** No monthly cost, no task limits that matter (Google Voice voicemails for a 2-person "we buy houses" operation will be under 100/month)
- **Already in the ecosystem:** Gmail is already receiving the voicemail emails
- **Zero infrastructure:** Runs on Google's servers, no server to manage
- **Editable in browser:** No deployment pipeline, no CI/CD — just edit the script and save
- **UrlFetchApp:** Can POST JSON to HouseFinder's API directly

### What the HouseFinder API needs to support

The existing `POST /api/leads` endpoint accepts: `name`, `phone`, `address`, `city`, `state`, `zip`, `message`. Voicemail leads will populate:
- `phone`: caller's number (reliable)
- `message`: transcription text (unreliable but useful)
- `leadSource`: "voicemail" (new lead source type — verify HouseFinder schema accepts this)
- `name`, `address`, `city`, `state`, `zip`: left empty or defaulted

**Action required:** Confirm the HouseFinder leads table/schema allows null or empty values for `name` and `address`. If there's a NOT NULL constraint on those columns, the API call will fail. This needs to be verified before building the pipeline.

### Script deployment steps

1. Open `script.google.com` with the Gmail account linked to Google Voice
2. Create new project, paste the processing function
3. Set a time-driven trigger: every 5 minutes (or every 10 minutes if quota is a concern)
4. Grant Gmail and UrlFetch permissions
5. Test with a real voicemail to validate email parsing
6. Done

### Handling the "just call me back" problem

Many callers won't leave their name or address. The lead record will have:
- `phone`: populated (caller number from subject line)
- `message`: "call me back" or similar
- Everything else: empty

This is still a valid lead. The HouseFinder dashboard should be able to show these and the team calls back. The question is whether the API accepts a record with only `phone` and `message` populated. **This is the most important thing to test before launch.**

### Duplicate prevention

If the script runs every 5 minutes and marks processed emails as read, it should not create duplicate leads. However, edge cases exist:
- Script times out mid-run and some emails get marked read but no lead was created
- Script creates the lead but fails to mark email as read (creates duplicate next run)

Mitigation: Apply a Gmail label "processed-voicemail" and search for emails WITHOUT that label. This is more robust than read/unread state.

---

## 6. Data Extraction from Voicemail Transcription

### What callers typically say to a "we buy houses" number

Based on the nature of the business, expect these call types:

| Call Type | Frequency | Data Available |
|-----------|-----------|---------------|
| "Call me back, I want to sell my house" | ~40% | Phone only |
| "I have a house at [address], call me" | ~30% | Phone + garbled address |
| Full pitch with name, address, situation | ~20% | Phone + partial structured data |
| Spam / wrong number / dead air | ~10% | Phone only, should be filtered |

### Can we extract name/address from transcription?

**Technically yes, practically unreliable.** Options:

**Option A: Regex/pattern matching**
Simple patterns like `\d+ [A-Za-z]+ (Street|St|Ave|Avenue|Road|Rd|Drive|Dr|Lane|Ln)` can catch some addresses. Unreliable on garbled transcriptions. Better than nothing, but produces many false positives and misses.

**Option B: LLM extraction (OpenAI / Gemini)**
Pass the transcription text to a small language model with prompt: "Extract name, address, city, state, zip from this voicemail transcription. Return JSON. Return null for fields you cannot determine." This works well when the transcription is good (callers who clearly state their info). Costs ~$0.001-0.003 per voicemail with GPT-4o-mini.

**Option C: Accept incomplete data**
Store the full transcription as `message`. Let the HouseFinder team read it and manually fill in address if possible when they call back. This is the simplest and most accurate approach.

**Recommendation:** Start with Option C (simplest). If lead volume grows and manual review becomes burdensome, add Option B (LLM extraction) — it's cheap, straightforward, and handles imperfect transcriptions better than regex.

---

## 7. Comparison Matrix

| Approach | Cost | Complexity | Latency | Reliability | Maintenance | Caller Number | Transcription Quality |
|----------|------|------------|---------|-------------|-------------|---------------|----------------------|
| **Apps Script (Gmail)** | Free | Low | 5-10 min | High | Low | Always | GV built-in (~75%) |
| **Zapier (Gmail → Webhook)** | $30/mo | Low | 1-15 min | High | Low | Always | GV built-in (~75%) |
| **Make.com (Gmail)** | $9/mo | Low | 1-15 min | High | Low | Always | GV built-in (~75%) |
| **Twilio (port number)** | ~$5/mo | High | ~30 sec | Very High | Medium | Structured | Configurable (better) |
| **Twilio + Whisper** | ~$10/mo | Very High | ~60 sec | Very High | High | Structured | Excellent (>95%) |
| **n8n self-hosted** | VPS cost | Very High | 1-5 min | Medium | High | Always | GV built-in (~75%) |

### Recommendation by team profile

**2-person team, want it working this week, minimal ops burden:** Apps Script. Full stop.

**Want real-time notification (under 1 minute):** Port to Twilio. $5/month, takes 2-4 weeks to port.

**Want name/address auto-extracted reliably:** Twilio + Whisper/Cloud Speech-to-Text + LLM extraction. $10-15/month, 2+ weeks to implement.

**Want no-code visual editor:** Make.com at $9/month is acceptable. Still slower and costs money vs Apps Script.

---

## 8. Google Business Profile Connection

### Can GBP calls route through Google Voice?

**YES, with caveats — MEDIUM confidence.**

Google Business Profile allows you to set a phone number for your listing. You can use the Google Voice 435 number as the primary GBP number. Calls from Google Maps/Search will dial that number and go to Google Voice as normal.

**GBP's native call tracking ended July 31, 2024** (HIGH confidence). GBP no longer provides its own call tracking analytics. What previously showed call counts in the Business Dashboard is gone. You're now responsible for your own call tracking.

### NAP consistency and local SEO impact

**Using Google Voice number for local SEO is a gray area — MEDIUM confidence.**

Key concern: NAP (Name, Address, Phone) consistency across the web. If the 435-250-3678 number appears on the website, GBP, and local directories consistently, NAP is consistent and local SEO is fine.

The risk is that some local SEO practitioners argue Google Voice numbers are "virtual" numbers and may get lower trust signals than true local numbers. **No confirmed evidence this causes ranking penalties** as of 2026, but the concern exists in the SEO community.

If you port to Twilio: Twilio numbers are also "virtual" from a technical standpoint and carry the same theoretical risk. In practice, using the same 435 number consistently (regardless of carrier) is what matters for NAP.

**Recommended setup for GBP:**
1. Primary number on GBP: 435-250-3678 (the Google Voice number)
2. Keep this number consistent across: website, GBP, Yelp, Facebook, and any directories
3. Do not use a different tracking number on GBP unless you add the real number as secondary

### Call tracking for Google Ads (if relevant later)

If the team ever runs Google Local Services Ads or Google Ads, Google will provide a Google Forwarding Number (GFN) that overlays on GBP automatically for ads traffic. This is Google's own tracking and doesn't affect local SEO signals.

---

## 9. Recommended Implementation Plan

### Phase 1: Apps Script Pipeline (Do This Week)

**Prerequisites (must verify before building):**
1. Google Voice email forwarding is enabled (Settings → Voicemail → Get voicemail via email)
2. HouseFinder `POST /api/leads` accepts null/empty for `name` and `address`
3. HouseFinder schema allows `leadSource: "voicemail"` (or confirm what value to use)
4. The HouseFinder API is secured (requires auth token) — Apps Script needs to send this header

**Build steps:**
1. Send a test voicemail to 435-250-3678 from another phone
2. Examine the actual email that arrives in Gmail — note exact sender, subject format, body structure
3. Write Apps Script with regex tuned to the actual email format observed
4. Set time trigger (every 5 minutes)
5. Test end-to-end: voicemail → Gmail → Script → HouseFinder lead appears
6. Add error handling and label-based deduplication

**Time estimate:** 2-4 hours for a developer comfortable with JavaScript and REST APIs.

### Phase 2: LLM Data Extraction (If Needed)

Add an OpenAI/Gemini API call inside the Apps Script to attempt extracting name/address from transcription. Return empty strings if extraction fails. Adds ~$0.003/voicemail in cost.

### Phase 3: Twilio Migration (If Volume Warrants)

If voicemail volume grows significantly or real-time lead notification becomes important, port the 435 number to Twilio. This gives: instant webhook, better transcription options, structured caller data, call recordings stored in the cloud.

---

## 10. Open Questions / Validation Required

| Question | Why It Matters | How to Answer |
|----------|---------------|---------------|
| Does HouseFinder `/api/leads` accept null for `name`/`address`? | If not, the POST will fail | Check the endpoint schema or Drizzle ORM validation |
| What `leadSource` value should voicemail leads use? | Schema may have an enum | Check HouseFinder leads table definition |
| Is the HouseFinder API protected by auth? | Apps Script needs the right header | Check the endpoint implementation |
| What is the exact format of Google Voice voicemail emails on this account? | Body parsing regex depends on it | Send a test voicemail and inspect the email source |
| Is Google Voice linked to Brian's personal Gmail or the contact@no-bshomes.com address? | Determines where Apps Script runs | Check Voice account settings |

---

## Sources

- Google Voice official help — Forward voicemail transcripts: https://support.google.com/voice/answer/9182115
- Google Voice official help — Check voicemail: https://support.google.com/voice/answer/168515
- Twilio Programmable Voice pricing (US): https://www.twilio.com/en-us/voice/pricing/us (verified April 2026)
- Twilio number porting from Google Voice: https://help.twilio.com/articles/223179728
- Zapier pricing (April 2026): https://zapier.com/pricing — webhooks require Professional plan (~$30/mo)
- Make.com webhooks documentation: https://www.make.com/en/help/tools/webhooks
- Google Apps Script Gmail Service reference: https://developers.google.com/apps-script/reference/gmail
- Google Apps Script external APIs guide: https://developers.google.com/apps-script/guides/services/external
- Gmail parser pattern via Apps Script: https://www.ismailzai.com/blog/google-apps-script-gmail-parser
- Google Voice API status (no public API): https://www.quo.com/blog/google-voice-api/ (MEDIUM confidence — consistent with community reports)
- GBP call tracking deprecation (July 2024): https://www.altavistasp.com/google-business-profile-call-tracking-is-going-away-what-you-need-to-know/
- Call tracking and local SEO: https://www.callrail.com/blog/call-tracking-google-my-business

**Confidence levels:**
- Google Voice has no public API: HIGH (multiple sources, community confirmation, no counter-evidence found)
- Voicemail email sender/subject format: MEDIUM (consistent across multiple sources, not from direct inspection of the 435 number's emails)
- Apps Script Gmail + UrlFetchApp pattern: HIGH (official Google documentation)
- Twilio pricing: HIGH (verified from official pricing page April 2026)
- GV transcription accuracy percentages: LOW (no authoritative benchmark for Google Voice specifically; general STT benchmarks used as proxy)
- GBP call tracking ending: HIGH (multiple sources confirm July 31, 2024 deprecation)
- NAP/local SEO impact of virtual numbers: LOW (community opinion, no confirmed data)
