import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { whatsappLink } from "@/lib/config";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.38c0-4.54 3.7-8.23 8.25-8.23 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.82c0 4.54-3.7 8.23-8.23 8.23Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.23.25-.87.85-.87 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.23-.16-.48-.29Z" />
    </svg>
  );
}

/**
 * Floating WhatsApp button.
 * - If VITE_WHATSAPP_NUMBER is configured → opens a real wa.me conversation.
 * - If not → no broken link: it shows a small honest note pointing to the contact form.
 */
export function WhatsAppButton() {
  const [note, setNote] = useState(false);

  useEffect(() => {
    if (!note) return;
    const t = window.setTimeout(() => setNote(false), 6000);
    return () => window.clearTimeout(t);
  }, [note]);

  const common =
    "group fixed bottom-[88px] right-5 z-[60] inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_10px_30px_-6px_rgba(37,211,102,0.6)] transition-shadow hover:shadow-[0_14px_40px_-4px_rgba(37,211,102,0.85)] sm:bottom-[96px] sm:right-6";
  const motionProps = {
    whileHover: { scale: 1.08 },
    whileTap: { scale: 0.92 },
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    transition: { type: "spring" as const, stiffness: 300, damping: 20, delay: 1.2 },
  };

  return (
    <>
      <AnimatePresence>
        {note && !whatsappLink && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10 }}
            className="glass fixed bottom-[160px] right-5 z-[60] w-64 rounded-2xl p-4 text-sm text-snow sm:bottom-[168px] sm:right-6"
          >
            <button type="button" onClick={() => setNote(false)} aria-label="Dismiss" className="absolute right-2 top-2 text-muted hover:text-snow">
              <X className="h-4 w-4" />
            </button>
            <p className="pr-5 text-muted">WhatsApp chat isn&apos;t set up yet. Please reach us through the contact form instead.</p>
            <a href="#contact" onClick={() => setNote(false)} className="mt-2 inline-block text-xs font-semibold text-electric hover:text-snow">
              Go to contact form →
            </a>
          </motion.div>
        )}
      </AnimatePresence>

      {whatsappLink ? (
        <motion.a href={whatsappLink} target="_blank" rel="noopener noreferrer" aria-label="Chat with ZK NEXORA on WhatsApp" className={common} {...motionProps}>
          <WhatsAppIcon className="h-7 w-7" />
        </motion.a>
      ) : (
        <motion.button type="button" onClick={() => setNote((n) => !n)} aria-label="WhatsApp (not configured yet)" className={common} {...motionProps}>
          <WhatsAppIcon className="h-7 w-7" />
        </motion.button>
      )}
    </>
  );
}
