import { motion } from "framer-motion";
import { Check, Star } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { Button } from "@/components/Button";
import { ParticleNetwork } from "@/components/ParticleNetwork";
import { plans } from "@/lib/data";
import { goToContact } from "@/lib/actions";
import { cn } from "@/utils/cn";

export function Pricing() {
  return (
    <section id="pricing" className="relative isolate overflow-hidden bg-ink-2 py-24 sm:py-32">
      <ParticleNetwork variant="subtle" className="-z-10" />
      <div className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Pricing"
          title={
            <>
              Packages shaped around <span className="text-gradient">your goals</span>
            </>
          }
          description="Every project is different, so we quote based on your requirements. Choose the package that fits best and request a quote — final scope and pricing are confirmed with you."
        />

        <div className="mt-16 grid items-stretch gap-6 lg:grid-cols-3">
          {plans.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.1} className="h-full">
              <motion.div
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className={cn(
                  "relative flex h-full flex-col rounded-3xl p-8",
                  p.featured
                    ? "border border-electric/40 bg-gradient-to-b from-brand/20 to-violet/10 glow-blue backdrop-blur-xl"
                    : "glass",
                )}
              >
                {p.featured && (
                  <span className="absolute -top-3.5 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-brand-gradient px-4 py-1.5 font-mono text-[11px] uppercase tracking-widest text-white shadow-lg">
                    <Star className="h-3 w-3 fill-current" /> Featured
                  </span>
                )}
                <h3 className="text-2xl font-extrabold text-snow">{p.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{p.tagline}</p>

                <div className="my-7 border-y border-white/10 py-5">
                  <p className="font-heading text-2xl font-extrabold text-gradient">Request a Quote</p>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted">Tailored to your scope</p>
                </div>

                <ul className="flex-1 space-y-3.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-snow/90">
                      <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-electric/15 text-electric">
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  variant={p.featured ? "primary" : "ghost"}
                  onClick={() => goToContact({ plan: p.name })}
                  className="mt-8 w-full"
                >
                  Request a Quote
                </Button>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
