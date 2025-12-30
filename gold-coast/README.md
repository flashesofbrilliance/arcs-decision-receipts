# Gold Coast Productions — Next.js App

Local Dev
- Install Node 18+, then:
- cd gold-coast
- npm install
- npm run dev (http://localhost:3001)

Structure
- app/: app router pages (home, packages, samples, how-it-works, checkout/[tier], legal)
- components/: PackageCard, SamplesGrid, AudioPlayer, CTAButton, BriefForm
- config/: packages.ts (tiers + Stripe links), samples.ts (audio list), site.ts (contact)

Integrations
- Stripe Payment Links: update config/packages.ts paymentLink with live URLs
- Brief form API: POST /api/brief sends autoresponder + internal email (Resend) and saves to Airtable
  - Optionally appends to Google Sheets if Google env vars are set

Environment Variables
- RESEND_API_KEY, RESEND_FROM, RESEND_TO
- AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE (default: Briefs)
- DEV_LOG=1 (optional): enables log-only fallback when env vars are missing (for local dev)
- UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN (optional): enables global rate limiting + idempotency across regions
- STRIPE_SIGNING_SECRET (optional): verify Stripe webhooks at /api/stripe/webhook to mark briefs as Paid
- LOG_WEBHOOK_URL (optional): receive structured JSON logs for events and errors
- GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_SHEETS_ID (optional): append briefs to Google Sheets

Deploy
- Vercel: import project, set framework to Next.js, build command auto
- Add domain; set env vars above in Vercel project settings

Stripe Webhook
- Point Stripe webhook to: https://your-domain.com/api/stripe/webhook
- Events: checkout.session.completed
- Signing secret: STRIPE_SIGNING_SECRET

Notes
- Audio files: reference external URLs or host under public/audio
- Keep licensing terms in /legal aligned with offer copy
- Rate limiting: API limits to 10 requests per 10 min per IP (in‑memory). For production multi‑region, use a shared store.
- Honeypot: Brief form includes a hidden field to reduce bot spam. Avoid removing it.
- Logging: If LOG_WEBHOOK_URL is set, brief submit/errors and Stripe events are posted with context and timestamps.

Verification (Research Report)
- Source used for hashing: `report-no-hash.md`
- Public report with embedded hash: `report.md`
- Checksum file: `report.sha256`
- Verify via checksum file: `shasum -a 256 -c report.sha256`
- Or compute directly: `shasum -a 256 report-no-hash.md` (expect `289b9318b0760c32f61f05cb1ae9134c39a5b1863d4df21afce0fefbe492a0da`)
- Helper script: `./verify-report.sh` (remember to `chmod +x verify-report.sh` once)
