/**
 * ZK NEXORA — optional secure backend (zero dependencies, Node 18+).
 *
 *   POST /api/contact  → validates, rate-limits, then emails you via Resend (https://resend.com)
 *   POST /api/audit    → Free Website Audit request; same protections, emailed via Resend
 *   POST /api/chat     → proxies to any OpenAI-compatible chat API using a SERVER-SIDE key
 *   GET  /api/health   → { ok: true }
 *
 * Secrets live ONLY in server/.env (never in the frontend). Run:  node --env-file=server/.env server/index.mjs
 * See server/.env.example and README.md.
 */
import http from "node:http";

const env = process.env;
const PORT = Number(env.PORT) || 8787;
const ALLOWED_ORIGIN = env.ALLOWED_ORIGIN || ""; // e.g. https://yourdomain.com  (empty = same-origin only)
const MAX_BODY = 20 * 1024;

/* ---------- tiny in-memory rate limiter (per IP + route). Use Redis/etc. if you scale to many instances. ---------- */
const hits = new Map();
function rateLimited(key, limit, windowMs) {
  const now = Date.now();
  const arr = (hits.get(key) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(key, arr);
  return arr.length > limit;
}
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of hits) if (!v.some((t) => now - t < 3_600_000)) hits.delete(k);
}, 600_000).unref();

/* ---------- helpers ---------- */
const clientIp = (req) => (env.TRUST_PROXY === "true" ? String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() : "") || req.socket.remoteAddress || "unknown";

function send(res, status, body, origin) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    "Cache-Control": "no-store",
  };
  if (ALLOWED_ORIGIN && origin === ALLOWED_ORIGIN) {
    headers["Access-Control-Allow-Origin"] = ALLOWED_ORIGIN;
    headers["Vary"] = "Origin";
  }
  res.writeHead(status, headers);
  res.end(JSON.stringify(body));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on("data", (c) => {
      size += c.length;
      if (size > MAX_BODY) {
        if (size - c.length <= MAX_BODY) reject(Object.assign(new Error("too large"), { code: 413 }));
        chunks.length = 0; // stop buffering; the handler responds 413 and closes the socket
      } else chunks.push(c);
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}"));
      } catch {
        reject(Object.assign(new Error("bad json"), { code: 400 }));
      }
    });
    req.on("error", reject);
  });
}

const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const escapeHtml = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/* ---------- /api/contact ---------- */
function validateContact(b) {
  const v = {
    name: str(b.name, 100),
    email: str(b.email, 254),
    company: str(b.company, 120),
    service: str(b.service, 100),
    budget: str(b.budget, 60),
    message: str(b.message, 3000),
  };
  const errors = {};
  if (v.name.length < 2) errors.name = "invalid";
  if (!EMAIL_RE.test(v.email)) errors.email = "invalid";
  if (!v.service) errors.service = "invalid";
  if (v.message.length < 20) errors.message = "invalid";
  // header-injection guard
  if (/[\r\n]/.test(v.name + v.email)) errors.name = "invalid";
  return { v, errors };
}

async function handleContact(req, res, origin) {
  const ip = clientIp(req);
  if (rateLimited(`contact:${ip}`, 5, 15 * 60_000)) return send(res, 429, { error: "Too many requests." }, origin);

  let body;
  try {
    body = await readJson(req);
  } catch (e) {
    if (e.code === 413) res.on("finish", () => req.destroy());
    return send(res, e.code || 400, { error: "Invalid request." }, origin);
  }

  if (body.website) return send(res, 400, { error: "Invalid request." }, origin); // honeypot (if client sends it)

  const { v, errors } = validateContact(body);
  if (Object.keys(errors).length) return send(res, 422, { error: "Validation failed.", fields: Object.keys(errors) }, origin);

  if (!env.RESEND_API_KEY || !env.CONTACT_TO_EMAIL || !env.CONTACT_FROM_EMAIL) {
    // Honest: nothing is sent, and we say so.
    return send(res, 503, { error: "Email delivery is not configured on the server." }, origin);
  }

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env.CONTACT_FROM_EMAIL,
        to: [env.CONTACT_TO_EMAIL],
        reply_to: v.email,
        subject: `New ZK NEXORA enquiry — ${v.service}`,
        html:
          `<h2>New website enquiry</h2>` +
          `<p><b>Name:</b> ${escapeHtml(v.name)}
<b>Email:</b> ${escapeHtml(v.email)}
` +
          `<b>Company:</b> ${escapeHtml(v.company || "—")}
<b>Service:</b> ${escapeHtml(v.service)}
` +
          `<b>Budget:</b> ${escapeHtml(v.budget || "—")}</p><p style="white-space:pre-wrap">${escapeHtml(v.message)}</p>`,
      }),
    });
    if (!r.ok) {
      console.error("Resend error status:", r.status);
      return send(res, 502, { error: "Could not deliver message." }, origin);
    }
    return send(res, 200, { ok: true }, origin);
  } catch (e) {
    console.error("Contact delivery failed:", e?.message);
    return send(res, 502, { error: "Could not deliver message." }, origin);
  }
}

/* ---------- /api/audit (Free Website Audit) ---------- */
const AUDIT_AREAS = ["Design", "SEO", "Speed", "Mobile", "Overall"];

/**
 * Checks that the submitted website address is a plausible public http(s) URL.
 * Returns { href, host } or null. The server NEVER requests this URL — it is only
 * validated and then shown (HTML-escaped) in the email.
 */
function normalizeWebsiteUrl(raw) {
  const t = typeof raw === "string" ? raw.trim() : "";
  if (!t || t.length > 2048 || /\s/.test(t)) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(t) ? t : `https://${t}`;
  let u;
  try {
    u = new URL(withScheme);
  } catch {
    return null;
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") return null;
  if (u.username || u.password) return null;
  const host = u.hostname.toLowerCase();
  if (!host.includes(".") || host.startsWith("[") || host.endsWith(".local")) return null;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return null;
  if ((host.split(".").pop() || "").length < 2) return null;
  return { href: u.toString(), host };
}

function validateAudit(b) {
  const site = normalizeWebsiteUrl(b.websiteUrl);
  const areas = Array.isArray(b.auditAreas) ? [...new Set(b.auditAreas.filter((a) => AUDIT_AREAS.includes(a)))] : [];
  const v = {
    name: str(b.name, 100),
    email: str(b.email, 254),
    websiteUrl: site ? site.href : "",
    host: site ? site.host : "",
    businessType: str(b.businessType, 120),
    areas,
    details: str(b.details, 3000),
  };
  const errors = {};
  if (v.name.length < 2) errors.name = "invalid";
  if (!EMAIL_RE.test(v.email)) errors.email = "invalid";
  if (!site) errors.websiteUrl = "invalid";
  // header-injection guard
  if (/[\r\n]/.test(v.name + v.email)) errors.name = "invalid";
  return { v, errors };
}

async function handleAudit(req, res, origin) {
  const ip = clientIp(req);
  if (rateLimited(`audit:${ip}`, 5, 15 * 60_000)) return send(res, 429, { error: "Too many requests." }, origin);

  let body;
  try {
    body = await readJson(req);
  } catch (e) {
    if (e.code === 413) res.on("finish", () => req.destroy());
    return send(res, e.code || 400, { error: "Invalid request." }, origin);
  }

  if (body.website) return send(res, 400, { error: "Invalid request." }, origin); // honeypot (if client sends it)

  const { v, errors } = validateAudit(body);
  if (Object.keys(errors).length) return send(res, 422, { error: "Validation failed.", fields: Object.keys(errors) }, origin);

  if (!env.RESEND_API_KEY || !env.CONTACT_TO_EMAIL || !env.CONTACT_FROM_EMAIL) {
    // Honest: nothing is sent, and we say so.
    return send(res, 503, { error: "Email delivery is not configured on the server." }, origin);
  }

  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env.CONTACT_FROM_EMAIL,
        to: [env.CONTACT_TO_EMAIL],
        reply_to: v.email,
        subject: `Free Website Audit request — ${v.host}`,
        html:
          `<h2>New Free Website Audit request</h2>` +
          `<p><b>Name:</b> ${escapeHtml(v.name)}<br>` +
          `<b>Email:</b> ${escapeHtml(v.email)}<br>` +
          `<b>Website:</b> ${escapeHtml(v.websiteUrl)}<br>` +
          `<b>Business type:</b> ${escapeHtml(v.businessType || "—")}<br>` +
          `<b>Audit requirements:</b> ${escapeHtml(v.areas.length ? v.areas.join(", ") : "Not specified")}</p>` +
          `<p><b>Additional details:</b></p>` +
          `<p style="white-space:pre-wrap">${escapeHtml(v.details || "—")}</p>`,
      }),
    });
    if (!r.ok) {
      console.error("Resend error status (audit):", r.status);
      return send(res, 502, { error: "Could not deliver request." }, origin);
    }
    return send(res, 200, { ok: true }, origin);
  } catch (e) {
    console.error("Audit delivery failed:", e?.message);
    return send(res, 502, { error: "Could not deliver request." }, origin);
  }
}

/* ---------- /api/chat ---------- */
const SYSTEM_PROMPT = `You are the ZK NEXORA AI Assistant on the ZK NEXORA website.
Facts you may use (do not invent anything else):
- ZK NEXORA is a technology agency founded by Zurraiz Khan (Founder & Developer). Tagline: "Innovate Today. Build Tomorrow."
- Services: Web Development, Business Websites, Landing Page Development, AI Chatbots, AI Automation, Agentic AI Solutions, Meta Ads & Digital Marketing.
- Packages: Starter, Professional, Custom Solution. No public prices — visitors should request a quote via the contact form.
- The portfolio shows clearly labelled demo concepts, not real client projects.
Rules: be concise and friendly. If you don't know something from the facts above, say so and suggest the contact form. Never invent prices, clients, awards, qualifications or contact details.`;

async function handleChat(req, res, origin) {
  const ip = clientIp(req);
  if (rateLimited(`chat:${ip}`, 20, 10 * 60_000)) return send(res, 429, { error: "Too many requests." }, origin);

  let body;
  try {
    body = await readJson(req);
  } catch (e) {
    if (e.code === 413) res.on("finish", () => req.destroy());
    return send(res, e.code || 400, { error: "Invalid request." }, origin);
  }

  const messages = Array.isArray(body.messages) ? body.messages.slice(-10) : [];
  const clean = messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, 500) }));
  if (!clean.length || clean[clean.length - 1].role !== "user") return send(res, 422, { error: "Invalid messages." }, origin);

  if (!env.LLM_API_KEY) return send(res, 503, { error: "AI is not configured on the server." }, origin);

  try {
    const r = await fetch(env.LLM_API_URL || "https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.LLM_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: env.LLM_MODEL || "gpt-4o-mini",
        max_tokens: 400,
        temperature: 0.3,
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...clean],
      }),
    });
    if (!r.ok) {
      console.error("LLM error status:", r.status);
      return send(res, 502, { error: "AI service unavailable." }, origin);
    }
    const data = await r.json();
    const reply = data?.choices?.[0]?.message?.content;
    if (!reply) return send(res, 502, { error: "AI service unavailable." }, origin);
    return send(res, 200, { reply: String(reply).slice(0, 2000) }, origin);
  } catch (e) {
    console.error("Chat failed:", e?.message);
    return send(res, 502, { error: "AI service unavailable." }, origin);
  }
}

/* ---------- router ---------- */
const server = http.createServer(async (req, res) => {
  const origin = req.headers.origin || "";
  const url = (req.url || "").split("?")[0];

  if (req.method === "OPTIONS") {
    const headers = { "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "600" };
    if (ALLOWED_ORIGIN && origin === ALLOWED_ORIGIN) headers["Access-Control-Allow-Origin"] = ALLOWED_ORIGIN;
    res.writeHead(204, headers);
    return res.end();
  }
  if (req.method === "GET" && url === "/api/health") return send(res, 200, { ok: true }, origin);
  if (req.method === "POST" && url === "/api/contact") return handleContact(req, res, origin);
  if (req.method === "POST" && url === "/api/audit") return handleAudit(req, res, origin);
  if (req.method === "POST" && url === "/api/chat") return handleChat(req, res, origin);
  return send(res, 404, { error: "Not found." }, origin);
});

server.listen(PORT, () => console.log(`ZK NEXORA API listening on http://localhost:${PORT}`));