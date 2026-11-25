import { Reveal } from "./Reveal";
import { cn } from "@/utils/cn";

interface Props {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  align?: "center" | "left";
  className?: string;
}

export function SectionHeading({ eyebrow, title, description, align = "center", className }: Props) {
  return (
    <Reveal className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.22em] text-electric">
        <span className="h-1.5 w-1.5 rounded-full bg-electric shadow-[0_0_10px_#38BDF8]" />
        {eyebrow}
      </span>
      <h2 className="mt-5 text-3xl font-extrabold leading-[1.1] text-snow sm:text-4xl md:text-5xl">{title}</h2>
      {description && <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">{description}</p>}
    </Reveal>
  );
}
