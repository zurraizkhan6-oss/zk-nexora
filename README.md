# ZK NEXORA — Website

**Innovate Today. Build Tomorrow.**
Premium, futuristic technology-agency website for ZK NEXORA (Founder: Zurraiz Khan).

Built with **React 19 + TypeScript + Vite + Tailwind CSS v4 + Framer Motion + Lucide React**.

> **Note on Next.js:** the project environment this was built in is a Vite + React setup, so the site is a
> Vite single-page app using the same architecture you asked for. SEO metadata, JSON-LD, robots.txt and
> sitemap.xml are included (static `index.html`), and the secure server logic lives in `server/`.
> If you later need server-side rendering, the `components/`, `sections/` and `lib/` folders port directly to Next.js.

## Run locally

```bash
npm install
npm run dev        # development at http://localhost:5173
npm run build      # production build → dist/index.html
npm run preview    # preview the production build
```

Optional backend (contact form email + AI chat proxy):

```bash
cp server/.env.example server/.env   # fill in your secrets
node --env-file=server/.env server/index.mjs   # Node 18.18+/20+
```

## Folder structure

```
.env.example            Frontend (public) config template
index.html              Title, meta, Open Graph, JSON-LD, fonts
public/                 robots.txt, sitemap.xml, (put /founder/photo here)
server/
  index.mjs             Secure API: /api/contact, /api/chat (validation, rate limit, no deps)
  .env.example          Server-side secrets template
src/
  App.tsx               Page composition
  main.tsx
  styles/globals.css    Design tokens (colors, fonts), glass/gradient utilities
  lib/
    config.ts           Founder, WhatsApp, endpoints, nav (edit here / .env)
    data.ts             Services, demo portfolio, pricing, principles
    chatbot.ts          Assistant knowledge + optional API client
    validation.ts       Form validation
    contact.ts          Form submission client
    actions.ts          "Jump to contact + prefill" helper
  components/           Logo, Navbar, Footer, ParticleNetwork, ChatWidget,
                        WhatsAppButton, Button, Reveal, SectionHeading, SEO
  sections/             Hero, About, Services, Portfolio, Pricing, Contact
```

## Configure things (copy `.env.example` → `.env`, then rebuild)

| What | How |
| --- | --- |
| **WhatsApp** | `VITE_WHATSAPP_NUMBER=15551234567` (international format, digits only). Until set, the button shows an honest "not set up yet" note and creates no link. |
| **Contact form backend** | Set `VITE_CONTACT_ENDPOINT` to either a Formspree-style JSON endpoint, or your deployed `server/index.mjs` (`https://api.yourdomain.com/api/contact`). The form only shows "Message sent" after a real 2xx response. With no endpoint it clearly says the message was not sent. For the bundled server also set `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL`, `ALLOWED_ORIGIN` in `server/.env`. |
| **AI chatbot** | Default: honest demo assistant answering from website info. For real AI: set `LLM_API_KEY` (+ optional `LLM_API_URL`, `LLM_MODEL`) in `server/.env`, deploy the server, then set `VITE_CHAT_API_URL=https://api.yourdomain.com/api/chat`. The key never reaches the browser. If the API fails, the widget falls back to the demo and says so. |
| **Founder photo** | Put your image in `public/founder/` (e.g. `zurraiz.jpg`) and set `VITE_FOUNDER_PHOTO=/founder/zurraiz.jpg`, or edit `founder.photo` in `src/lib/config.ts`. |
| **Domain / SEO** | Set `VITE_SITE_URL=https://yourdomain.com` (adds canonical + og:url). Replace `YOUR-DOMAIN.com` in `public/sitemap.xml` and `public/robots.txt`. |
| **Real portfolio** | Edit `projects` in `src/lib/data.ts`. Current items are labelled **Demo concept** — remove the label/banner only once they are real projects. |
| **Optional email display** | `VITE_CONTACT_EMAIL` shows an email in the footer/contact section. |

Remember: `VITE_*` variables are public. Secrets belong only in `server/.env`.

## Save / back up the project

- Download the whole project folder from your platform's export/download option (or copy the folder).
- Do **not** include `node_modules/` or `dist/` in a backup — `npm install` and `npm run build` recreate them.
- Zip example: `zip -r zk-nexora-backup.zip . -x "node_modules/*" "dist/*" ".env" "server/.env"`
- Keep `.env` files in a private password manager, not in shared backups.
