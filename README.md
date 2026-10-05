# CyroHost

Marketing site for CyroHost cloud, networking, edge, and web infrastructure.

## Account API

Sign-in is a separate Spring Boot service in `backend/`. Setup, PostgreSQL, OAuth, and email steps are in `backend/README.md`. The site keeps working if that API is not running; login then says the service is not reachable.

## Commands

```bash
npm install
npm run dev
npm run build
npm start
npm run lint
```

The dev server runs at `http://localhost:3000`.

## Contact form

`/contact` validates with Zod in the browser and again in `POST /api/contact`.

If `CONTACT_WEBHOOK_URL` is unset, the API returns `503` with `error: "not_configured"` and the page tells the visitor the message was **not** sent. Copy `.env.example` to `.env.local` and set the webhook only when a real endpoint exists. The webhook receives JSON: `name`, `email`, `organisation`, `interest`, `message`, `source`. No API keys belong in client code.

## What was verified on 3 October 2026

Checked against `https://www.cyrohost.com/` and `https://network-india.cyrohost.com/`.

- India VPS is published as AMD and Intel lines. Singapore VPS is published as Intel. No general VPS price, disk, or OS list was on those pages.
- Minecraft India starts at ₹100/month (AMD EPYC 4464P). Minecraft Singapore starts at ₹80/month (Intel Xeon E-2136).
- Hytale lists four card prices (₹1,000, ₹1,700, ₹2,600, ₹4,000) plus a separate “from ₹100/GB/month” line.
- FiveM is quote-based.
- Discord bot plans: ₹39, ₹59, and ₹110 per month.
- Bare metal is an enquiry. Shield is described without a capacity or price.
- Network India is a route and site map naming Mumbai, Noida, and other cities. It is not treated as colocation inventory.
- Germany is named on some product pages. The United States is marked on demand.

## Not confirmed

- `https://client.cyrohost.com/` timed out, including `/store`. No live catalogue was imported.
- `vps.cyrohost.com` did not resolve. It is still linked because it is the panel URL supplied for the project.
- `status.cyrohost.com` and the apex host `cyrohost.com` did not resolve from this environment. `www.cyrohost.com` did.
- `i.cyro.host`, the Discord-bot checkout host on the current site, did not resolve.
- `webhost.html` returned 404, so website-hosting prices are not shown.
- VDS, RDP, and S3-compatible storage had no public specification. Those routes are enquiries.
- IP transit, BGP, and IP leasing had no published capacity, ASN, peer, or pool size.
- Operating system images were not listed. This site does not claim Windows, Ubuntu, or AlmaLinux.
- Customer quotes on the current homepage were not republished.

## Lighthouse

Measured on 3 October 2026 against the production server, after the theme system and demand-rendered hero.

| | Performance | Accessibility | Best practices | SEO |
| --- | --- | --- | --- | --- |
| Desktop | 94 | 100 | 100 | 100 |
| Mobile | 95 | 100 | 100 | 100 |

Desktop FCP 0.5 s, LCP 0.7 s, TBT 190 ms, CLS 0. Mobile FCP 1.1 s, LCP 2.1 s, TBT 220 ms, CLS 0. Phones use the static rack drawing. Desktop still compiles the WebGL entrance on the main thread, so the performance score can move between runs.

To repeat the audits after `npm run build && npm start`:

```bash
npx lighthouse http://localhost:3000 --only-categories=performance,accessibility,best-practices,seo --preset=desktop --output=html --output-path=./lighthouse-desktop.html
npx lighthouse http://localhost:3000 --only-categories=performance,accessibility,best-practices,seo --form-factor=mobile --screenEmulation.mobile=true --output=html --output-path=./lighthouse-mobile.html
```

Chrome or Chromium has to be installed. The table above is from the audits run on 3 October 2026. Re-run the commands after further changes.
