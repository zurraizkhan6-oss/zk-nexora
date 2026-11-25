import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Info } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { portfolioCategories, projects, type PortfolioCategory, type Project } from "@/lib/data";
import { cn } from "@/utils/cn";

function ProjectVisual({ project }: { project: Project }) {
  const Icon = project.icon;
  return (
    <div className={cn("relative aspect-[16/10] overflow-hidden bg-gradient-to-br", project.gradient)}>
      <div className="grid-bg absolute inset-0 opacity-70" />
      {/* faux browser window */}
      <div className="absolute inset-x-6 bottom-0 top-7 overflow-hidden rounded-t-xl border border-white/15 bg-ink/80 shadow-2xl backdrop-blur transition-transform duration-500 group-hover:-translate-y-2">
        <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="h-2 w-2 rounded-full bg-white/20" />
          <span className="ml-3 h-2 w-24 rounded-full bg-white/10" />
        </div>
        <div className="flex gap-3 p-4">
          <div className="flex-1 space-y-2.5">
            <div className="h-3 w-3/4 rounded-full bg-white/25" />
            <div className="h-2 w-full rounded-full bg-white/10" />
            <div className="h-2 w-5/6 rounded-full bg-white/10" />
            <div className="mt-4 h-6 w-20 rounded-full bg-brand-gradient" />
          </div>
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06] text-electric">
            <Icon className="h-8 w-8" />
          </div>
        </div>
      </div>
      <span className="absolute left-4 top-3 rounded-full border border-amber-300/30 bg-amber-300/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-amber-200 backdrop-blur">
        Demo concept
      </span>
    </div>
  );
}

export function Portfolio() {
  const [filter, setFilter] = useState<"All" | PortfolioCategory>("All");
  const visible = projects.filter((p) => filter === "All" || p.category === filter);

  return (
    <section id="portfolio" className="relative isolate overflow-hidden bg-ink py-24 sm:py-32">
      <div className="absolute left-1/2 top-0 -z-10 h-96 w-[700px] -translate-x-1/2 rounded-full bg-brand/15 blur-[130px]" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Portfolio"
          title={
            <>
              Concepts that show what we <span className="text-gradient">can build</span>
            </>
          }
          description="Explore the kinds of digital products we create."
        />

        <Reveal className="mx-auto mt-8 flex max-w-2xl items-start gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-4 text-sm text-amber-100/90">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" />
          <p>
            <strong className="font-semibold">Demo projects.</strong> The projects below are sample concepts created to
            illustrate our capabilities. They are <u>not</u> real client projects. Real work will be added here as it is published.
          </p>
        </Reveal>

        <Reveal className="mt-10 flex flex-wrap justify-center gap-2" delay={0.05}>
          {portfolioCategories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setFilter(c)}
              aria-pressed={filter === c}
              className={cn(
                "relative rounded-full border px-5 py-2 text-sm font-medium transition-colors",
                filter === c ? "border-transparent text-white" : "border-white/10 text-muted hover:border-white/25 hover:text-snow",
              )}
            >
              {filter === c && (
                <motion.span
                  layoutId="portfolio-filter"
                  className="absolute inset-0 rounded-full bg-brand-gradient"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative">{c}</span>
            </button>
          ))}
        </Reveal>

        <motion.div layout className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((p) => (
              <motion.article
                layout
                key={p.id}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -8 }}
                className="glass group overflow-hidden rounded-3xl transition-colors hover:border-electric/40 hover:shadow-[0_30px_60px_-25px_rgba(37,99,235,0.6)]"
              >
                <ProjectVisual project={p} />
                <div className="p-6">
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-electric">{p.category}</span>
                  <h3 className="mt-2 text-xl font-bold text-snow">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{p.description}</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {p.tags.map((t) => (
                      <li key={t} className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] text-muted">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
