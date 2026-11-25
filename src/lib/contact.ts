import { siteConfig } from "./config";
import type { ContactValues } from "./validation";

export type SubmitResult =
  | { ok: true }
  | { ok: false; reason: "not-configured" | "network" | "server" | "rate-limited"; message: string };

/**
 * Sends the contact form to the configured backend.
 * Returns ok:true ONLY when the server actually responds with a 2xx status.
 * If no endpoint is configured, nothing is sent and an honest error is returned.
 */
export async function submitContact(values: ContactValues): Promise<SubmitResult> {
  if (!siteConfig.contactEndpoint) {
    return {
      ok: false,
      reason: "not-configured",
      message:
        "Our contact form isn't connected to a backend yet, so your message was NOT sent. Please try again later or use another contact method.",
    };
  }

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);

  try {
    const res = await fetch(siteConfig.contactEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        name: values.name.trim(),
        email: values.email.trim(),
        company: values.company.trim(),
        service: values.service,
        budget: values.budget,
        message: values.message.trim(),
      }),
      signal: controller.signal,
    });

    if (res.ok) return { ok: true };
    if (res.status === 429)
      return { ok: false, reason: "rate-limited", message: "Too many requests. Please wait a few minutes and try again." };
    return { ok: false, reason: "server", message: "Something went wrong on our side. Please try again shortly." };
  } catch {
    return {
      ok: false,
      reason: "network",
      message: "We couldn't reach the server. Please check your connection and try again.",
    };
  } finally {
    window.clearTimeout(timeout);
  }
}
