import { useEffect } from "react";
import { siteConfig } from "@/lib/config";

function setMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

/**
 * Adds canonical + og:url at runtime when VITE_SITE_URL is configured
 * (we never guess a domain). Static title/description/OG tags live in index.html.
 */
export function SEO() {
  useEffect(() => {
    if (!siteConfig.siteUrl) return;
    const url = siteConfig.siteUrl + "/";
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = url;
    setMeta("property", "og:url", url);
  }, []);
  return null;
}
