import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { Logo } from "./Logo";
import { navLinks, siteConfig } from "@/lib/config";
import { cn } from "@/utils/cn";


/**
 * "Let's Talk" opens WhatsApp using the number and message from src/lib/config.ts.
 * If no WhatsApp number is configured, the buttons fall back to the #contact section.
 */
const whatsappHref = siteConfig.whatsappNumber
  ? `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(siteConfig.whatsappMessage)}`
  : null;

const talkLinkProps = whatsappHref
  ? {
      href: whatsappHref,
      target: "_blank",
      rel: "noopener noreferrer",
      "aria-label": "Let's Talk on WhatsApp (opens in a new tab)",
    }
  : { href: "#contact" };


export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("#home");


  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      const y = window.scrollY + 140;
      let current = "#home";
      for (const l of navLinks) {
        const el = document.querySelector<HTMLElement>(l.href);
        if (el && el.offsetTop <= y) current = l.href;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);


  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-[65] transition-all duration-300",
        open
          ? "border-b border-white/10 bg-ink"
          : scrolled
            ? "border-b border-white/10 bg-ink/75 backdrop-blur-xl"
            : "border-b border-transparent",
      )}
    >
      <nav className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-5 sm:px-8" aria-label="Main navigation">
        <a href="#home" aria-label="ZK NEXORA — home" onClick={() => setOpen(false)}>
          <Logo />
        </a>


        <ul className="hidden items-center gap-1 lg:flex">
          {navLinks.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  active === l.href ? "text-snow" : "text-muted hover:text-snow",
                )}
              >
                {active === l.href && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 -z-10 rounded-full border border-white/10 bg-white/[0.07]"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  />
                )}
                {l.label}
              </a>
            </li>
          ))}
        </ul>


        <div className="flex items-center gap-3">
          <motion.a
            {...talkLinkProps}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
            className="hidden items-center gap-1.5 rounded-full bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(37,99,235,0.8)] transition-shadow hover:shadow-[0_10px_34px_-6px_rgba(124,58,237,0.8)] sm:inline-flex"
          >
            Let&apos;s Talk <ArrowUpRight className="h-4 w-4" />
          </motion.a>
          <button
            type="button"
            className="glass inline-flex h-11 w-11 items-center justify-center rounded-xl text-snow lg:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={open ? "x" : "m"}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.18 }}
              >
                {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </motion.span>
            </AnimatePresence>
          </button>
        </div>
      </nav>


      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "calc(100dvh - 72px)", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden lg:hidden"
          >
            <motion.ul
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } } }}
              className="flex flex-col gap-2 px-5 pb-10 pt-6"
            >
              {navLinks.map((l) => (
                <motion.li
                  key={l.href}
                  variants={{ hidden: { opacity: 0, x: -20 }, show: { opacity: 1, x: 0 } }}
                >
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center justify-between rounded-2xl border border-white/10 px-5 py-4 font-heading text-xl font-bold",
                      active === l.href ? "bg-white/[0.08] text-snow" : "bg-white/[0.03] text-muted",
                    )}
                  >
                    {l.label}
                    <ArrowUpRight className="h-5 w-5 text-electric" />
                  </a>
                </motion.li>
              ))}
              <motion.li variants={{ hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }} className="mt-3">
                <a
                  {...talkLinkProps}
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 rounded-2xl bg-brand-gradient px-5 py-4 text-base font-bold text-white"
                >
                  Let&apos;s Talk <ArrowUpRight className="h-5 w-5" />
                </a>
              </motion.li>
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}