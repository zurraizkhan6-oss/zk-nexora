import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Globe, MessageSquareCode, Workflow, Megaphone, BrainCircuit, ChevronDown } from "lucide-react";
import { ParticleNetwork } from "@/components/ParticleNetwork";
import { LogoMark } from "@/components/Logo";
import { Button } from "@/components/Button";
import { goToContact } from "@/lib/actions";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};
const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const } },
};

const outerNodes = [
  { Icon: Globe, angle: 0 },
  { Icon: Workflow, angle: 120 },
  { Icon: Megaphone, angle: 240 },
];
const innerNodes = [
  { Icon: MessageSquareCode, angle: 60 },
  { Icon: BrainCircuit, angle: 240 },
];

function OrbitNode({ Icon, angle }: { Icon: typeof Globe; angle: number }) {
  return (
    <div className="absolute inset-0" style={{ transform: `rotate(${angle}deg)` }}>
      <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
        <div style={{ transform: `rotate(${-angle}deg)` }}>
          <div className="animate-orbit-rev">
            <div className="glass flex h-11 w-11 items-center justify-center rounded-2xl text-electric shadow-[0_0_24px_-4px_rgba(56,189,248,0.6)] sm:h-14 sm:w-14">
              <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section id="home" className="relative isolate flex min-h-[100svh] items-center overflow-hidden pb-20 pt-32 lg:pt-28">
      {/* background layers */}
      <div className="absolute inset-0 -z-10 bg-ink" />
      <div className="grid-bg absolute inset-0 -z-10" />
      <div className="animate-pulse-glow absolute -left-40 top-10 -z-10 h-[520px] w-[520px] rounded-full bg-brand/30 blur-[140px]" />
      <div
        className="animate-pulse-glow absolute -right-40 top-1/3 -z-10 h-[560px] w-[560px] rounded-full bg-violet/30 blur-[150px]"
        style={{ animationDelay: "-2s" }}
      />
      <ParticleNetwork variant="hero" className="-z-10" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-ink to-transparent" />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-[1.1fr_0.9fr]">
        <motion.div variants={container} initial="hidden" animate="show" className="text-center lg:text-left">
          <motion.div variants={item}>
            <span className="glass inline-flex items-center gap-2 rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-electric sm:text-xs">
              <Sparkles className="h-3.5 w-3.5" />
              Innovate Today. Build Tomorrow.
            </span>
          </motion.div>

          <motion.h1
            variants={item}
            className="mt-7 text-[2.6rem] font-extrabold leading-[1.04] text-snow sm:text-6xl lg:text-[4.4rem]"
          >
            Building Digital Experiences for the{" "}
            <span className="text-gradient animate-gradient">Future.</span>
          </motion.h1>

          <motion.p variants={item} className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg lg:mx-0">
            We build modern websites, intelligent AI solutions, and powerful digital experiences that help businesses
            move forward.
          </motion.p>

          <motion.div variants={item} className="mt-9 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start">
            <Button href="#portfolio" className="w-full sm:w-auto">
              Explore Our Work <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="ghost" onClick={() => goToContact()} className="w-full sm:w-auto">
              Start a Project
            </Button>
          </motion.div>

          <motion.ul
            variants={item}
            className="mt-10 flex flex-wrap items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted lg:justify-start"
          >
            {["Web", "AI Chatbots", "Automation", "Agentic AI", "Meta Ads"].map((t) => (
              <li key={t} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                {t}
              </li>
            ))}
          </motion.ul>
        </motion.div>

        {/* orbital visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto aspect-square w-[min(80vw,440px)]"
          aria-hidden="true"
        >
          <div className="animate-float absolute inset-0">
            <div className="absolute inset-[10%] rounded-full bg-brand-gradient opacity-20 blur-3xl" />

            {/* outer ring */}
            <div className="animate-orbit absolute inset-0 rounded-full border border-dashed border-white/15">
              {outerNodes.map((n) => (
                <OrbitNode key={n.angle} {...n} />
              ))}
            </div>
            {/* inner ring */}
            <div className="animate-orbit-slow absolute inset-[19%] rounded-full border border-electric/20">
              {innerNodes.map((n) => (
                <OrbitNode key={n.angle} {...n} />
              ))}
            </div>
            {/* core */}
            <div className="absolute inset-[34%] flex items-center justify-center rounded-full border border-white/10 bg-ink-2/80 shadow-[0_0_80px_-10px_rgba(37,99,235,0.8)] backdrop-blur-md">
              <LogoMark className="h-[62%] w-[62%]" />
            </div>
          </div>
        </motion.div>
      </div>

      <a
        href="#about"
        aria-label="Scroll to About section"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 font-mono text-[10px] uppercase tracking-[0.3em] text-muted transition-colors hover:text-snow md:flex"
      >
        Scroll
        <ChevronDown className="h-4 w-4 animate-bounce" />
      </a>
    </section>
  );
}
