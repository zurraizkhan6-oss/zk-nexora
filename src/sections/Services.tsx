import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { services } from "@/lib/data";
import { goToContact } from "@/lib/actions";
import { cn } from "@/utils/cn";

const grid = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};
const card = {
  hidden: { opacity: 0, y: 36 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const } },
};

export function Services() {
  return (
    <section id="services" className="relative isolate overflow-hidden bg-ink-2 py-24 sm:py-32">
      <div className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
      <div className="absolute right-0 top-20 -z-10 h-96 w-96 rounded-full bg-violet/15 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Services"
          title={
            <>
              Everything you need to <span className="text-gradient">build &amp; grow</span>
            </>
          }
          description="From high-performing websites to intelligent automation — practical solutions designed around your business."
        />

        <motion.div
          variants={grid}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {services.map((s, i) => {
            const Icon = s.icon;
            const wide = i === services.length - 1;
            return (
              <motion.article
                key={s.id}
                variants={card}
                whileHover={{ y: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className={cn(
                  "glass group relative flex flex-col overflow-hidden rounded-3xl p-7 transition-colors duration-300 hover:border-electric/40",
                  wide && "sm:col-span-2 lg:col-span-3 lg:flex-row lg:items-center lg:gap-10",
                )}
              >
                {/* hover glow */}
                <div
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-gradient-to-br opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-30",
                    s.accent,
                  )}
                />
                <span
                  className={cn(
                    "relative inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
                    s.accent,
                  )}
                >
                  <Icon className="h-7 w-7" />
                </span>
                <div className={cn("relative", wide ? "mt-5 lg:mt-0 lg:flex-1" : "mt-5")}>
                  <h3 className="text-xl font-bold text-snow">{s.title}</h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted sm:text-[15px]">{s.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => goToContact({ service: s.title })}
                  className={cn(
                    "relative inline-flex items-center gap-1.5 self-start text-sm font-semibold text-electric transition-all hover:gap-2.5 hover:text-snow",
                    wide ? "mt-6 lg:mt-0 lg:shrink-0" : "mt-6",
                  )}
                  aria-label={`Learn more about ${s.title} — contact us`}
                >
                  Learn more <ArrowUpRight className="h-4 w-4" />
                </button>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
