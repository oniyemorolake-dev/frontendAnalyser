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

## Stripe setup (5 minutes)

1. Create account at https://dashboard.stripe.com
2. **Products → Add product** → one-time price $4.99 → copy **Price ID** (`price_...`)
3. **Developers → API keys** → copy **Secret key**
4. Paste into Render env vars above and redeploy

## Netlify (frontend)

No extra config needed. Deploy from `frontendAnalyser` repo.

## Free vs Premium

- **Free:** score + top 3 strengths preview
- **Premium:** full report + job match + share card (after Stripe payment)

## Traffic / SEO

- Landing page: https://resume.motechco.ca/
- Analyzer: https://resume.motechco.ca/index.html
- `robots.txt` and `sitemap.xml` included
