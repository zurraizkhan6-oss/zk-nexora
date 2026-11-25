import { Target, Eye, Cpu, ShieldCheck, Handshake, Code2, User } from "lucide-react";
import { motion } from "framer-motion";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { ParticleNetwork } from "@/components/ParticleNetwork";
import { LogoMark } from "@/components/Logo";
import { siteConfig } from "@/lib/config";
import { principles } from "@/lib/data";

const principleIcons = [Code2, ShieldCheck, Cpu, Handshake];

function FounderPhoto() {
  const { photo, name } = siteConfig.founder;
  return (
    <div className="relative mx-auto aspect-[4/5] w-full max-w-sm">
      <div className="absolute -inset-3 rounded-[2rem] bg-brand-gradient opacity-30 blur-2xl" />
      <div className="glass relative h-full overflow-hidden rounded-[2rem] p-2">
        {photo ? (
          <img src={photo} alt={`Portrait of ${name}`} loading="lazy" className="h-full w-full rounded-[1.6rem] object-cover" />
        ) : (
          // Replaceable placeholder — see src/lib/config.ts (founder.photo)
          <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-[1.6rem] bg-gradient-to-br from-ink-2 via-ink to-ink-2">
            <div className="grid-bg absolute inset-0 opacity-60" />
            <div className="absolute h-56 w-56 rounded-full bg-violet/30 blur-3xl" />
            <LogoMark className="relative h-28 w-28" />
            <span className="relative mt-5 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              <User className="h-3 w-3" /> Photo placeholder
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function About() {
  return (
    <section id="about" className="relative isolate overflow-hidden bg-ink py-24 sm:py-32">
      <ParticleNetwork variant="subtle" className="-z-10" />
      <div className="absolute left-0 top-1/3 -z-10 h-96 w-96 rounded-full bg-brand/15 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="About ZK NEXORA"
          title={
            <>
              Technology built with <span className="text-gradient">purpose</span>
            </>
          }
          description="ZK NEXORA is a technology agency focused on modern web experiences and practical AI solutions."
        />

        <div className="mt-16 grid items-center gap-14 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <FounderPhoto />
            <div className="mt-8 text-center">
              <h3 className="text-2xl font-extrabold text-snow">{siteConfig.founder.name}</h3>
              <p className="mt-1 font-mono text-sm text-electric">{siteConfig.founder.role}</p>
              <p className="mt-1 text-sm text-muted">{siteConfig.founder.brand}</p>
            </div>
          </Reveal>

          <div className="space-y-6">
            <Reveal>
              <div className="glass rounded-3xl p-7 sm:p-8">
                <h3 className="text-xl font-bold text-snow">Who we are</h3>
                <p className="mt-3 leading-relaxed text-muted">
                  ZK NEXORA was founded by {siteConfig.founder.name}. The name carries the idea behind the brand —{" "}
                  <span className="text-snow">ZK</span> represents the founder&apos;s initials, and{" "}
                  <span className="text-snow">NEXORA</span> represents next-generation innovation and future technology.
                </p>
                <h3 className="mt-6 text-xl font-bold text-snow">What we do</h3>
                <p className="mt-3 leading-relaxed text-muted">
                  We design and develop modern websites and web applications, build AI chatbots and automations, create
                  agentic AI solutions, and support businesses with Meta Ads and digital marketing.
                </p>
              </div>
            </Reveal>

            <div className="grid gap-6 sm:grid-cols-2">
              <Reveal delay={0.05}>
                <div className="glass h-full rounded-3xl p-7 transition-colors hover:border-electric/40">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-white">
                    <Target className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-snow">Our mission</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    To help businesses move forward by turning ideas into reliable, well-designed and intelligent digital products.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.12}>
                <div className="glass h-full rounded-3xl p-7 transition-colors hover:border-violet/50">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-white">
                    <Eye className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 text-lg font-bold text-snow">Our vision</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    A future where every business — large or small — can use modern technology and AI with confidence.
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>

        {/* approach */}
        <div className="mt-24">
          <Reveal>
            <h3 className="text-center text-2xl font-extrabold text-snow sm:text-3xl">Our approach to technology &amp; innovation</h3>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((p, i) => {
              const Icon = principleIcons[i];
              return (
                <Reveal key={p.title} delay={i * 0.08}>
                  <motion.div
                    whileHover={{ y: -6 }}
                    className="glass h-full rounded-3xl p-6 transition-colors hover:border-white/25"
                  >
                    <Icon className="h-6 w-6 text-electric" />
                    <h4 className="mt-4 text-base font-bold text-snow">{p.title}</h4>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{p.text}</p>
                  </motion.div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
