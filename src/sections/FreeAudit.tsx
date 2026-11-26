import { useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Loader2, Send } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { siteConfig } from "@/lib/config";
import { submitAudit } from "@/lib/audit";
import {
  auditAreas,
  emptyAudit,
  normalizeWebsiteUrl,
  validateAudit,
  type AuditArea,
  type AuditErrors,
  type AuditValues,
} from "@/lib/auditValidation";
import { cn } from "@/utils/cn";

const COOLDOWN_MS = 30_000;
const MIN_FILL_MS = 2_500;

const fieldBase =
  "w-full rounded-xl border bg-white/[0.04] px-4 py-3 text-sm text-snow placeholder:text-muted/60 transition-all focus:border-electric/60 focus:bg-white/[0.07] focus:outline-none focus:ring-4 focus:ring-electric/10";

function Field({
  id,
  label,
  optional,
  error,
  children,
}: {
  id: string;
  label: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 flex items-center justify-between text-sm font-medium text-snow">
        <span>{label}</span>
        {optional && <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Optional</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs text-rose-300">
          {error}
        </p>
      )}
    </div>
  );
}

type TextKey = "name" | "email" | "websiteUrl" | "businessType" | "details";

export function FreeAudit() {
  const [values, setValues] = useState<AuditValues>(emptyAudit);
  const [errors, setErrors] = useState<AuditErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const openedAt = useRef(Date.now());
  const lastSent = useRef(0);

  const set = (k: TextKey) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const toggleArea = (a: AuditArea) =>
    setValues((v) => ({
      ...v,
      areas: v.areas.includes(a) ? v.areas.filter((x) => x !== a) : [...v.areas, a],
    }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;

    // Spam protection: hidden honeypot field that only bots fill in
    if (honeypot) {
      setStatus("error");
      setErrorMsg("We couldn't process this submission.");
      return;
    }

    const errs = validateAudit(values);
    setErrors(errs);
    if (Object.keys(errs).length) {
      setStatus("idle");
      const first = Object.keys(errs)[0];
      document.getElementById(`audit-${first}`)?.focus();
      return;
    }

    if (Date.now() - openedAt.current < MIN_FILL_MS) {
      setStatus("error");
      setErrorMsg("That was quick! Please review your details and submit again.");
      return;
    }

    const since = Date.now() - lastSent.current;
    if (since < COOLDOWN_MS) {
      setStatus("error");
      setErrorMsg(`Please wait ${Math.ceil((COOLDOWN_MS - since) / 1000)} seconds before sending another request.`);
      return;
    }

    const websiteUrl = normalizeWebsiteUrl(values.websiteUrl);
    if (!websiteUrl) return; // cannot happen after validation; keeps TypeScript happy

    setStatus("loading");
    setErrorMsg("");
    const result = await submitAudit({ ...values, websiteUrl }, honeypot);

    // Success is shown ONLY when the server confirmed delivery
    if (result.ok) {
      lastSent.current = Date.now();
      setValues(emptyAudit);
      setStatus("success");
    } else {
      setErrorMsg(result.message);
      setStatus("error");
    }
  };

  const aria = (k: TextKey) => ({
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `audit-${k}-error` : undefined,
  });
  const border = (k: TextKey) => (errors[k] ? "border-rose-400/60" : "border-white/10");

  return (
    <section id="audit" className="relative isolate overflow-hidden bg-ink-2 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Free Website Audit"
          title={
            <>
              Get a free <span className="text-gradient">website audit</span>
            </>
          }
          description="Share your website and what you'd like reviewed, and we'll take a look."
        />

        <Reveal className="mt-14">
          <div className="glass relative overflow-hidden rounded-3xl p-6 sm:p-9">
            <AnimatePresence mode="wait" initial={false}>
              {status === "success" ? (
                <motion.div
                  key="ok"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex min-h-[380px] flex-col items-center justify-center text-center"
                  role="status"
                >
                  <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
                    <CheckCircle2 className="h-9 w-9" />
                  </span>
                  <h3 className="mt-5 text-2xl font-extrabold text-snow">Audit request sent</h3>
                  <p className="mt-2 max-w-sm text-sm text-muted">
                    Thank you. Your request was submitted successfully and we&apos;ll be in touch.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setStatus("idle");
                      openedAt.current = Date.now();
                    }}
                    className="mt-6 text-sm font-semibold text-electric hover:text-snow"
                  >
                    Request another audit
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={onSubmit}
                  noValidate
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-5"
                >
                  {!siteConfig.auditEndpoint && (
                    <div className="flex items-start gap-3 rounded-xl border border-amber-300/25 bg-amber-300/[0.07] p-3.5 text-xs leading-relaxed text-amber-100/90">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                      <p>
                        <strong>Form backend not connected.</strong> Requests can&apos;t be delivered until a backend
                        endpoint is configured.
                      </p>
                    </div>
                  )}

                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field id="audit-name" label="Full Name" error={errors.name}>
                      <input
                        id="audit-name"
                        type="text"
                        autoComplete="name"
                        maxLength={100}
                        value={values.name}
                        onChange={set("name")}
                        placeholder="Your full name"
                        className={cn(fieldBase, border("name"))}
                        {...aria("name")}
                      />
                    </Field>
                    <Field id="audit-email" label="Email" error={errors.email}>
                      <input
                        id="audit-email"
                        type="email"
                        autoComplete="email"
                        maxLength={254}
                        value={values.email}
                        onChange={set("email")}
                        placeholder="you@company.com"
                        className={cn(fieldBase, border("email"))}
                        {...aria("email")}
                      />
                    </Field>
                  </div>

                  <Field id="audit-websiteUrl" label="Website URL" error={errors.websiteUrl}>
                    <input
                      id="audit-websiteUrl"
                      type="text"
                      inputMode="url"
                      autoComplete="url"
                      maxLength={2048}
                      aria-required="true"
                      value={values.websiteUrl}
                      onChange={set("websiteUrl")}
                      placeholder="https://yourwebsite.com"
                      className={cn(fieldBase, border("websiteUrl"))}
                      {...aria("websiteUrl")}
                    />
                  </Field>

                  <Field id="audit-businessType" label="Business Type" optional error={errors.businessType}>
                    <input
                      id="audit-businessType"
                      type="text"
                      maxLength={120}
                      value={values.businessType}
                      onChange={set("businessType")}
                      placeholder="e.g. online store, agency, restaurant"
                      className={cn(fieldBase, border("businessType"))}
                      {...aria("businessType")}
                    />
                  </Field>

                  <fieldset>
                    <legend className="mb-2 flex w-full items-center justify-between text-sm font-medium text-snow">
                      <span>Audit Requirements</span>
                      <span className="font-mono text-[10px] uppercase tracking-widest text-muted">Optional</span>
                    </legend>
                    <div className="flex flex-wrap gap-3">
                      {auditAreas.map((a) => {
                        const checked = values.areas.includes(a);
                        return (
                          <label
                            key={a}
                            className={cn(
                              "flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition-colors",
                              checked
                                ? "border-electric/60 bg-electric/10 text-snow"
                                : "border-white/10 bg-white/[0.04] text-muted hover:text-snow",
                            )}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleArea(a)}
                              className="h-4 w-4 accent-electric"
                            />
                            {a}
                          </label>
                        );
                      })}
                    </div>
                  </fieldset>

                  <Field id="audit-details" label="Additional Details" optional error={errors.details}>
                    <textarea
                      id="audit-details"
                      rows={4}
                      maxLength={3000}
                      value={values.details}
                      onChange={set("details")}
                      placeholder="Anything specific you'd like us to look at?"
                      className={cn(fieldBase, border("details"), "resize-y")}
                      {...aria("details")}
                    />
                    <p className="mt-1 text-right font-mono text-[10px] text-muted">{values.details.length}/3000</p>
                  </Field>

                  {/* Honeypot: hidden from people, bots tend to fill it */}
                  <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                    <label htmlFor="audit-hp">Leave this field empty</label>
                    <input
                      id="audit-hp"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>

                  <AnimatePresence>
                    {status === "error" && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        role="alert"
                        className="flex items-start gap-3 rounded-xl border border-rose-400/30 bg-rose-400/[0.08] p-3.5 text-sm text-rose-200"
                      >
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                        <p>{errorMsg}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    type="submit"
                    disabled={status === "loading"}
                    whileHover={status === "loading" ? undefined : { y: -2 }}
                    whileTap={status === "loading" ? undefined : { scale: 0.98 }}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_30px_-8px_rgba(37,99,235,0.7)] transition-shadow hover:shadow-[0_14px_44px_-6px_rgba(124,58,237,0.75)] disabled:cursor-wait disabled:opacity-70"
                  >
                    {status === "loading" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                      </>
                    ) : (
                      <>
                        Request Free Audit <Send className="h-4 w-4" />
                      </>
                    )}
                  </motion.button>
                  <p className="text-center text-xs text-muted">
                    We only use your details to respond to your audit request.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </div>
    </section>
  );
}