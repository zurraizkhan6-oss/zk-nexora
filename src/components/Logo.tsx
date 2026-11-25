import { useId } from "react";
import { cn } from "@/utils/cn";

/**
 * Original ZK NEXORA mark:
 * a hexagon (the "node" / building block) containing a monogram where the Z's
 * diagonal flows into the K's spine — with a glowing node at the K's junction
 * representing the connected, next-generation idea behind NEXORA.
 */
export function LogoMark({ className, glow = true }: { className?: string; glow?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 40 40" className={cn("h-10 w-10", className)} role="img" aria-label="ZK NEXORA logo mark">
      <defs>
        <linearGradient id={`g${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#38BDF8" />
          <stop offset="0.55" stopColor="#2563EB" />
          <stop offset="1" stopColor="#7C3AED" />
        </linearGradient>
        <filter id={`f${id}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <polygon
        points="20,2 36.6,11 36.6,29 20,38 3.4,29 3.4,11"
        fill="rgba(13,20,40,0.9)"
        stroke={`url(#g${id})`}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <g filter={glow ? `url(#f${id})` : undefined}>
        <path
          d="M10.5 12.5H20L10.5 27.5H20"
          fill="none"
          stroke={`url(#g${id})`}
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M24 12.5V27.5M30.5 12.5L24 20L30.5 27.5"
          fill="none"
          stroke={`url(#g${id})`}
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="24" cy="20" r="2" fill="#F8FAFC" />
      </g>
    </svg>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <LogoMark />
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="font-heading text-lg font-extrabold tracking-tight text-snow">
            ZK <span className="text-gradient">NEXORA</span>
          </span>
          <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.28em] text-muted">Innovate · Build</span>
        </span>
      )}
    </span>
  );
}
