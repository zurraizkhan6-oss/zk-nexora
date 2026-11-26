import { siteConfig } from "./config";
import type { SubmitResult } from "./contact";
import type { AuditValues } from "./auditValidation";

export async function submitAudit(
  values: AuditValues,
  honeypot = ""
): Promise<SubmitResult> {
  if (!siteConfig.auditEndpoint) {
    return {
      ok: false,
      reason: "not-configured",
      message: "Our audit form is not connected yet. Please try again later.",
    };
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(siteConfig.auditEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        name: values.name.trim(),
        email: values.email.trim(),
        websiteUrl: values.websiteUrl,
        businessType: values.businessType.trim(),
        auditAreas: values.areas,
        details: values.details.trim(),
        website: honeypot,
      }),
      signal: controller.signal,
    });

    if (res.ok) return { ok: true };

    if (res.status === 429) {
      return {
        ok: false,
        reason: "rate-limited",
        message: "Too many requests. Please wait and try again.",
      };
    }

    if (res.status === 422) {
      return {
        ok: false,
        reason: "server",
        message: "Please check your details and try again.",
      };
    }

    return {
      ok: false,
      reason: "server",
      message: "Something went wrong. Please try again.",
    };
  } catch {
    return {
      ok: false,
      reason: "network",
      message: "Could not reach the server. Please check your connection.",
    };
  } finally {
    window.clearTimeout(timeout);
  }
}