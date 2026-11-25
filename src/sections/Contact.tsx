import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Loader2, Send, Mail, MessageCircle, Clock } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { ParticleNetwork } from "@/components/ParticleNetwork";
import { onContactPrefill } from "@/lib/actions";
import { siteConfig, whatsappLink } from "@/lib/config";
import { serviceOptions } from "@/lib/data";
import { submitContact } from "@/lib/contact";
import { budgetOptions, validateContact, type ContactErrors, type ContactValues } from "@/lib/validation";
import { cn } from "@/utils/cn";

const empty: ContactValues = { name: "", email: "", company: "", service: "", budget: "", message: "" };
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

export function Contact() {
  const [values, setValues] = useState<ContactValues>(empty);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const openedAt = useRef(Date.now());
  const lastSent = useRef(0);

  useEffect(
    () =>
      onContactPrefill(({ service, plan }) => {
        setValues((v) => ({
          ...v,
          service: service ?? v.service,
          message: plan && !v.message.trim() ? `I'm interested in the ${plan} package.` : v.message,
        }));
        setStatus((s) => (s === "success" ? "idle" : s));
        openedAt.current = Date.now();
      }),
    [],
  );

  const set = (k: keyof ContactValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === "loading") return;

    // spam protection: honeypot (hidden field bots fill in) + minimum fill time + cooldown
    if (honeypot) {
      setStatus("error");
      setErrorMsg("We couldn't process this submission.");
      return;
    }

    const errs = validateContact(values);
    setErrors(errs);
    if (Object.keys(errs).length) {
      setStatus("idle");
      const first = Object.keys(errs)[0];
      document.getElementById(`field-${first}`)?.focus();
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
      setErrorMsg(`Please wait ${Math.ceil((COOLDOWN_MS - since) / 1000)} seconds before sending another message.`);
      return;
    }

    setStatus("loading");
    setErrorMsg("");
    const result = await submitContact(values);
    if (result.ok) {
      lastSent.current = Date.now();
      setValues(empty);
      setStatus("success");
    } else {
      setErrorMsg(result.message);
      setStatus("error");
    }
  };

  const aria = (k: keyof ContactValues) => ({
    "aria-invalid": errors[k] ? true : undefined,
    "aria-describedby": errors[k] ? `field-${k}-error` : undefined,
  });
  const border = (k: keyof ContactValues) => (errors[k] ? "border-rose-400/60" : "border-white/10");

  return (
    <section id="contact" className="relative isolate overflow-hidden bg-ink py-24 sm:py-32">
      <ParticleNetwork variant="subtle" className="-z-10" />
      <div className="absolute bottom-0 right-0 -z-10 h-96 w-96 rounded-full bg-violet/20 blur-[130px]" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Contact"
          title={
            <>
              Let&apos;s build something <span className="text-gradient">remarkable</span>
            </>
          }
          description="Tell us about your project and we'll get back to you."
        />

        <div className="mt-16 grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal className="space-y-5">
            <div className="glass rounded-3xl p-7">
              <h3 className="text-xl font-bold text-snow">How it works</h3>
              <ol className="mt-5 space-y-5">
                {[
                  ["01", "Tell us your idea", "Share what you want to build and any goals or deadlines."],
                  ["02", "We review it", "We assess your requirements and prepare a tailored proposal."],
                  ["03", "We start building", "Once agreed, we design and develop with clear communication."],
                ].map(([n, t, d]) => (
                  <li key={n} className="flex gap-4">
                    <span className="font-mono text-sm text-electric">{n}</span>
                    <div>
                      <p className="font-semibold text-snow">{t}</p>
                      <p className="mt-1 text-sm text-muted">{d}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {(siteConfig.contactEmail || whatsappLink) && (
              <div className="glass space-y-3 rounded-3xl p-7">
                <h3 className="text-lg font-bold text-snow">Direct contact</h3>
                {siteConfig.contactEmail && (
                  <a href={`mailto:${siteConfig.contactEmail}`} className="flex items-center gap-3 text-sm text-muted hover:text-snow">
                    <Mail className="h-4 w-4 text-electric" /> {siteConfig.contactEmail}
                  </a>
                )}
                {whatsappLink && (
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted hover:text-snow">
                    <MessageCircle className="h-4 w-4 text-electric" /> Message us on WhatsApp
                  </a>
                )}
              </div>
            )}

            <p className="flex items-center gap-2 px-2 font-mono text-xs text-muted">
              <Clock className="h-3.5 w-3.5" /> Founder: {siteConfig.founder.name}
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="glass relative overflow-hidden rounded-3xl p-6 sm:p-9">
              <AnimatePresence mode="wait" initial={false}>
                {status === "success" ? (
                  <motion.div
                    key="ok"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex min-h-[420px] flex-col items-center justify-center text-center"
                    role="status"
                  >
                    <span className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/10 text-emerald-300">
                      <CheckCircle2 className="h-9 w-9" />
                    </span>
                    <h3 className="mt-5 text-2xl font-extrabold text-snow">Message sent</h3>
                    <p className="mt-2 max-w-sm text-sm text-muted">
                      Thank you — your message was delivered successfully. We&apos;ll review it and get back to you.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setStatus("idle");
                        openedAt.current = Date.now();
                      }}
                      className="mt-6 text-sm font-semibold text-electric hover:text-snow"
                    >
                      Send another message
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
                    {!siteConfig.contactEndpoint && (
                      <div className="flex items-start gap-3 rounded-xl border border-amber-300/25 bg-amber-300/[0.07] p-3.5 text-xs leading-relaxed text-amber-100/90">
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
                        <p>
                          <strong>Form backend not connected.</strong> This form is fully functional on the front end, but
                          messages can&apos;t be delivered until a backend endpoint is configured.
                        </p>
                      </div>
                    )}

                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field id="field-name" label="Full Name" error={errors.name}>
                        <input id="field-name" type="text" autoComplete="name" maxLength={100} value={values.name} onChange={set("name")} placeholder="Your full name" className={cn(fieldBase, border("name"))} {...aria("name")} />
                      </Field>
                      <Field id="field-email" label="Email Address" error={errors.email}>
                        <input id="field-email" type="email" autoComplete="email" maxLength={254} value={values.email} onChange={set("email")} placeholder="you@company.com" className={cn(fieldBase, border("email"))} {...aria("email")} />
                      </Field>
                    </div>

                    <Field id="field-company" label="Company Name" optional error={errors.company}>
                      <input id="field-company" type="text" autoComplete="organization" maxLength={120} value={values.company} onChange={set("company")} placeholder="Your company" className={cn(fieldBase, border("company"))} {...aria("company")} />
                    </Field>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field id="field-service" label="Service" error={errors.service}>
                        <select id="field-service" value={values.service} onChange={set("service")} className={cn(fieldBase, border("service"), !values.service && "text-muted/60")} {...aria("service")}>
                          <option value="" className="bg-ink-2">Select a service</option>
                          {serviceOptions.map((o) => (
                            <option key={o} value={o} className="bg-ink-2 text-snow">{o}</option>
                          ))}
                        </select>
                      </Field>
                      <Field id="field-budget" label="Budget" optional error={errors.budget}>
                        <select id="field-budget" value={values.budget} onChange={set("budget")} className={cn(fieldBase, border("budget"), !values.budget && "text-muted/60")} {...aria("budget")}>
                          <option value="" className="bg-ink-2">Select a range</option>
                          {budgetOptions.map((o) => (
                            <option key={o} value={o} className="bg-ink-2 text-snow">{o}</option>
                          ))}
                        </select>
                      </Field>
                    </div>

                    <Field id="field-message" label="Project Details" error={errors.message}>
                      <textarea id="field-message" rows={5} maxLength={3000} value={values.message} onChange={set("message")} placeholder="Tell us about your project, goals and timeline…" className={cn(fieldBase, border("message"), "resize-y")} {...aria("message")} />
                      <p className="mt-1 text-right font-mono text-[10px] text-muted">{values.message.length}/3000</p>
                    </Field>

                    {/* Honeypot: hidden from people, bots tend to fill it */}
                    <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                      <label htmlFor="field-website">Leave this field empty</label>
                      <input id="field-website" type="text" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
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
                          Send Message <Send className="h-4 w-4" />
                        </>
                      )}
                    </motion.button>
                    <p className="text-center text-xs text-muted">We only use your details to respond to your enquiry.</p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
