/**
 * Free Website Audit — field types and validation rules.
 * Used by src/sections/FreeAudit.tsx and src/lib/audit.ts.
 */

export const auditAreas = ["Design", "SEO", "Speed", "Mobile", "Overall"] as const;
export type AuditArea = (typeof auditAreas)[number];

export interface AuditValues {
  name: string;
  email: string;
  websiteUrl: string;
  businessType: string;
  areas: AuditArea[];
  details: string;
}

export type AuditErrors = Partial<
  Record<"name" | "email" | "websiteUrl" | "businessType" | "details", string>
>;

export const emptyAudit: AuditValues = {
  name: "",
  email: "",
  websiteUrl: "",
  businessType: "",
  areas: [],
  details: "",
};

/**
 * Returns a cleaned-up http(s) URL, or null if the address is not valid.
 * If the visitor types "example.com", https:// is added automatically.
 */
export function normalizeWebsiteUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed || trimmed.length > 2048 || /\s/.test(trimmed)) return null;

  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;

  let url: URL;
  try {
    url = new URL(withScheme);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  if (url.username || url.password) return null;

  const host = url.hostname.toLowerCase();
  if (!host.includes(".") || host.startsWith("[") || host.endsWith(".local")) return null;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return null;
  if ((host.split(".").pop() ?? "").length < 2) return null;

  return url.toString();
}

/** Checks the form values and returns an object of error messages (empty object = all good). */
export function validateAudit(v: AuditValues): AuditErrors {
  const e: AuditErrors = {};

  const name = v.name.trim();
  if (name.length < 2) e.name = "Please enter your full name.";
  else if (name.length > 100) e.name = "Name is too long.";

  const email = v.email.trim();
  if (!email) e.email = "Please enter your email address.";
  else if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email))
    e.email = "Please enter a valid email address.";

  if (!v.websiteUrl.trim()) e.websiteUrl = "Website URL is required.";
  else if (!normalizeWebsiteUrl(v.websiteUrl))
    e.websiteUrl = "Enter a valid website address, e.g. https://example.com";

  if (v.businessType.length > 120) e.businessType = "Business type is too long.";
  if (v.details.length > 3000) e.details = "Please keep details under 3000 characters.";

  return e;
}