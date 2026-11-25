import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface Props {
  children: ReactNode;
  variant?: "primary" | "ghost";
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  external?: boolean;
  ariaLabel?: string;
}

const base =
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full px-6 py-3 text-sm font-semibold transition-shadow duration-300 disabled:cursor-not-allowed disabled:opacity-60 sm:text-[15px]";

const variants = {
  primary:
    "bg-brand-gradient text-white shadow-[0_10px_30px_-8px_rgba(37,99,235,0.7)] hover:shadow-[0_14px_44px_-6px_rgba(124,58,237,0.75)]",
  ghost: "glass text-snow hover:border-electric/50 hover:shadow-[0_0_30px_-8px_rgba(56,189,248,0.5)]",
};

export function Button({
  children,
  variant = "primary",
  href,
  onClick,
  type = "button",
  disabled,
  className,
  external,
  ariaLabel,
}: Props) {
  const inner = (
    <>
      {variant === "primary" && (
        <span
          aria-hidden
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full"
        />
      )}
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </>
  );
  const cls = cn(base, variants[variant], className);
  const motionProps = disabled
    ? {}
    : { whileHover: { y: -2, scale: 1.02 }, whileTap: { scale: 0.97 }, transition: { type: "spring" as const, stiffness: 400, damping: 22 } };

  if (href) {
    return (
      <motion.a
        href={href}
        className={cls}
        aria-label={ariaLabel}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        onClick={onClick}
        {...motionProps}
      >
        {inner}
      </motion.a>
    );
  }
  return (
    <motion.button type={type} className={cls} onClick={onClick} disabled={disabled} aria-label={ariaLabel} {...motionProps}>
      {inner}
    </motion.button>
  );
}
