# Good morning — MoTechCo wake-up checklist

Everything below was built and pushed while you slept. Your live site should update within 2–5 minutes after Netlify finishes deploying.

---

## What shipped overnight

### Branding & UX
- Lilac/purple gradient hero (the look you liked) with ✨ MoTechCo branding
- Human, warm copy — less robotic, more “real job search” tone
- **Analyzer nav fixed:** ← Home pill, back bar, footer link to landing
- New **About** and **Contact** pages (no more broken nav links)
- Before/after score section on landing
- Mobile polish across landing + analyzer

### Premium features
- **3 quick fixes** on free tier (backend + frontend)
- Sample **72/100 demo report** (`index.html?demo=1`)
- Blurred unlock preview for locked content
- Application kit tabs (rewrite, letter, LinkedIn, interview)
- **Download application kit** (one .txt with everything generated)
- **Print kit as PDF** (browser print → Save as PDF)
- Cold-start UX: backend warm-up + progress messages for Render wake-up

### Pricing
- Launch price: **$6.99 one-time** (vs “$29/mo elsewhere” on landing)
- Backend default label updated — see Stripe step below if checkout amount differs

---

## Test these URLs (after Netlify deploys)

| URL | What you should see |
|-----|---------------------|
| https://resume.motechco.ca/ | New landing (purple hero, “You've sent enough applications…”) |
| https://resume.motechco.ca/index.html | Analyzer with ← Home nav |
| https://resume.motechco.ca/index.html?demo=1 | Sample 72/100 report |
| https://resume.motechco.ca/about.html | About page |
| https://resume.motechco.ca/contact.html | Contact page |

**Hard refresh:** Ctrl + Shift + R (clears old cached CSS)

---

## Your action items (in order)

### 1. Stripe price — 5 minutes
If checkout still charges **$4.99**, either:
- Create a **$6.99 CAD** one-time Price in [Stripe Dashboard](https://dashboard.stripe.com/products) → update `STRIPE_PRICE_ID` on Render, **or**
- Set `PREMIUM_PRICE_LABEL=$4.99` on Render to match existing price (label only changes)

Also add on Render (optional):
```
PREMIUM_PRICE_LABEL=$6.99
COMPARE_AT_LABEL=$29/mo elsewhere
```

### 2. Resend email DNS — 15 minutes (Namecheap)
“Email my free score” returns **403** until domain is verified.

Add these DNS records for **motechco.ca** where your nameservers point:

| Type | Host | Value |
|------|------|-------|
| TXT | `resend._domainkey` | (from Resend dashboard) |
| MX | `send` | (from Resend dashboard) |
| TXT | `send` | (from Resend dashboard) |
| TXT | `_dmarc` | `v=DMARC1; p=none;` |

Then verify in [Resend Domains](https://resend.com/domains).

### 3. Google Search Console — 10 minutes
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Select property **resume.motechco.ca**
3. **Sitemaps** → resubmit: `https://resume.motechco.ca/sitemap.xml` (now includes about + contact)
4. **URL inspection** → request indexing for:
   - `/`
   - `/index.html`
   - `/landing.html`
   - `/ats-checker-canada.html`

### 4. Confirm Render env
On [Render dashboard](https://dashboard.render.com) → backend service:
- `PREMIUM_FREE_MODE` = **false** (or delete it)
- `GEMINI_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, `FRONTEND_URL` set
- `RESEND_API_KEY`, `RESEND_FROM`, `CONTACT_EMAIL` set

---

## Marketing — copy/paste templates

### Reddit (r/resumes, r/jobs, r/CanadianJobs)
**Title:** Free resume score + job keyword match — no signup

**Body:**
> I built a tool for people tired of $30/mo resume subscriptions.
> Paste the job ad + upload PDF → free score + 3 fixes to try.
> One-time $6.99 unlocks full report, rewrite, cover letter, LinkedIn About, interview prep for that job.
> https://resume.motechco.ca/index.html?demo=1 (sample report, no upload)
> Feedback welcome — still improving it.

### LinkedIn post
> Sent 40 applications and heard nothing back?
> I built MoTechCo — paste the job posting, get your resume score + missing keywords free.
> One payment ($6.99) for the full application kit — not another monthly tool.
> Try the sample report: https://resume.motechco.ca/index.html?demo=1

### Coach outreach (5 DMs this week)
> Hi [name] — I built a resume analyzer your clients can use between sessions (ATS score, job match, rewrite + cover letter kit). Partner page: https://resume.motechco.ca/for-coaches.html — open to a quick chat?

---

## Local preview (VS Code)

1. Open folder: `C:\Users\oniye\frontendAnalyser`
2. Right-click **`landing.html`** → Open with Live Server
3. Do **not** rely on `/` locally — Live Server opens `index.html` by default
4. Analyzer home link: `http://127.0.0.1:5500/landing.html`

---

## What’s intentionally not built yet

- **3-application bundle** ($14.99) — needs second Stripe Price + backend token logic. Can add next week.
- **LinkedIn job URL paste** — nice UX upgrade for v2.
- **Application tracker** — save jobs locally; good retention feature for later.

---

## If something looks wrong

| Problem | Fix |
|---------|-----|
| Old purple “Upload Your Resume” page | Hard refresh or wait for Netlify deploy |
| Nav missing on analyzer | You’re on old deploy — check Netlify publish log |
| Analysis times out | Wait 60s, click Run again (Render cold start) |
| “Premium unlocked” but sticky bar shows | Clear site data / check PREMIUM_FREE_MODE on Render |
| Checkout wrong price | Update STRIPE_PRICE_ID to $6.99 product |

---

## Support email
mowebsiteco@gmail.com

Good luck with traffic — the product is ready to show strangers now. 💜
