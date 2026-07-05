# MoTechCo Resume Analyzer — Monetization Setup

## Render (backend)

Add these environment variables:

| Variable | Example | Purpose |
|----------|---------|---------|
| `GEMINI_API_KEY` | `AIza...` | AI analysis |
| `STRIPE_SECRET_KEY` | `sk_live_...` or `sk_test_...` | Stripe payments |
| `STRIPE_PRICE_ID` | `price_...` | One-time premium report price |
| `FRONTEND_URL` | `https://resume.motechco.ca` | Stripe redirect URLs |
| `PREMIUM_PRICE_LABEL` | `$4.99` | Display label (optional) |
| `PREMIUM_FREE_MODE` | `true` | Bypass paywall for testing only |
| `AI_REQUESTS_PER_MINUTE` | `6` | Max AI calls per visitor per minute (protects quota) |
| `CONTACT_EMAIL` | `mowebsiteco@gmail.com` | Support email shown on site |

## Permanent fix for Google AI quota errors

Creating new API keys only resets the **free** limit temporarily. The permanent fix:

1. Open [Google AI Studio](https://aistudio.google.com)
2. Go to your project → **Google Cloud Console** (link in settings)
3. **Billing** → link a billing account (credit card)
4. Keep your **same** `GEMINI_API_KEY` on Render — no need to rotate keys
5. Usage is **pay-as-you-go** (Gemini Flash is very cheap; a resume analysis is usually fractions of a cent)

At $4.99 premium per report, AI cost is tiny compared to revenue.

Optional: upgrade Render from free tier to reduce cold-start delays (separate from Gemini quota).

## Stripe setup (5 minutes)

1. Create account at https://dashboard.stripe.com
2. **Products → Add product** → one-time price $4.99 → copy **Price ID** (`price_...`)
3. **Developers → API keys** → copy **Secret key**
4. Paste into Render env vars above and redeploy

## Email delivery (optional)

Add on Render to actually send reports to users:

| Variable | Value |
|----------|--------|
| `RESEND_API_KEY` | from https://resend.com |
| `RESEND_FROM` | `MoTechCo <hello@yourdomain.com>` |

Without these, users can still **download** or **print** their report from the site.

## Free vs Premium

- **Free:** score + top 3 strengths preview
- **Premium:** full report + job match + share card (after Stripe payment)

## Traffic / SEO

- Landing page: https://resume.motechco.ca/
- Analyzer: https://resume.motechco.ca/index.html
- `robots.txt` and `sitemap.xml` included
