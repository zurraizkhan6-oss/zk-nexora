/**
 * Central site configuration.
 * Everything that is "yours to fill in" lives here or in a .env file.
 * NOTE: VITE_* variables are bundled into the public frontend code —
 * never put secrets (API keys, passwords) in them. Secrets belong in server/.env.
 */
const env = import.meta.env;

const clean = (v?: string) => (v ?? "").trim();

export const siteConfig = {
  name: "ZK NEXORA",
  tagline: "Innovate Today. Build Tomorrow.",
  /** Public site URL, e.g. https://yourdomain.com — used for canonical + Open Graph URLs */
  siteUrl: clean(env.VITE_SITE_URL).replace(/\/$/, ""),

  founder: {
    name: "Zurraiz Khan",
    role: "Founder & Developer",
    brand: "ZK NEXORA",
    /**
     * Replace the founder photo:
     *  1) put your image in /public/founder/ (e.g. /public/founder/zurraiz.jpg)
     *  2) set VITE_FOUNDER_PHOTO=/founder/zurraiz.jpg  (or edit the fallback below)
     * Leave empty to show the elegant "ZK" placeholder.
     */
   photo: clean(env.VITE_FOUNDER_PHOTO) || "/zurraiz.jpg",
  },

  /** International format, digits only (e.g. 15551234567). Leave empty = not configured. */
whatsappNumber: clean(env.VITE_WHATSAPP_NUMBER || "92306660058").replace(/[^\d]/g, ""),
  whatsappMessage:
    clean(env.VITE_WHATSAPP_MESSAGE) || "Hello ZK NEXORA, I'd like to talk about a project.",

  /** Form backend endpoint (Formspree-compatible JSON or the bundled server/index.mjs). */
  contactEndpoint: clean(env.VITE_CONTACT_ENDPOINT),

  /** Optional AI chat proxy endpoint (see server/index.mjs). Empty = built-in demo assistant. */
  chatApiUrl: clean(env.VITE_CHAT_API_URL),

  /** Optional public contact email shown in the footer/contact section. Empty = hidden. */
  contactEmail: clean(env.VITE_CONTACT_EMAIL),
} as const;

export const whatsappLink = siteConfig.whatsappNumber
  ? `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(siteConfig.whatsappMessage)}`
  : null;

export const navLinks = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#services" },
  { label: "Portfolio", href: "#portfolio" },
  { label: "Pricing", href: "#pricing" },
  { label: "Contact", href: "#contact" },
] as const;
