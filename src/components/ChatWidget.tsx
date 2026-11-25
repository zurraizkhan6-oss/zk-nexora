import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bot, Send, X, Sparkles, RotateCcw } from "lucide-react";
import { getReply, newId, suggestedQuestions, welcomeMessage, type ChatMessage } from "@/lib/chatbot";
import { siteConfig } from "@/lib/config";
import { cn } from "@/utils/cn";

const STORAGE_KEY = "zknexora:chat:v1";

function loadHistory(): ChatMessage[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ChatMessage[];
      if (Array.isArray(parsed) && parsed.length) return parsed;
    }
  } catch {
    /* ignore */
  }
  return [welcomeMessage];
}

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(loadHistory);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const live = Boolean(siteConfig.chatApiUrl);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch {
      /* ignore */
    }
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing, open]);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 350);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const send = useCallback(
    async (text: string) => {
      const clean = text.trim().slice(0, 500);
      if (!clean || typing) return;
      const userMsg: ChatMessage = { id: newId(), role: "user", text: clean };
      const history = [...messages, userMsg];
      setMessages(history);
      setInput("");
      setTyping(true);
      const started = Date.now();
      const { message } = await getReply(history);
      // brief minimum so the typing indicator is perceivable for instant local answers
      const wait = Math.max(0, 700 - (Date.now() - started));
      window.setTimeout(() => {
        setMessages((m) => [...m, { id: newId(), role: "assistant", ...message }]);
        setTyping(false);
      }, wait);
    },
    [messages, typing],
  );

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void send(input);
  };

  const reset = () => {
    setMessages([welcomeMessage]);
    setTyping(false);
  };

  const showSuggestions = messages.length <= 1 && !typing;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.section
            role="dialog"
            aria-label="ZK NEXORA AI Assistant"
            initial={{ opacity: 0, y: 30, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            style={{ transformOrigin: "bottom right" }}
            className="fixed inset-0 z-[70] flex flex-col overflow-hidden border border-white/10 bg-ink-2/95 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] backdrop-blur-2xl sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[600px] sm:max-h-[calc(100dvh-8rem)] sm:w-[400px] sm:rounded-3xl"
          >
            {/* header */}
            <header className="flex items-center gap-3 border-b border-white/10 bg-gradient-to-r from-brand/25 to-violet/25 px-4 py-3.5">
              <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient text-white">
                <Bot className="h-5 w-5" />
                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-ink-2 bg-emerald-400" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="truncate font-heading text-sm font-bold text-snow">ZK NEXORA AI Assistant</h2>
                <p className="truncate font-mono text-[10px] uppercase tracking-wider text-muted">
                  {live ? "AI connected" : "Demo mode · answers from site info"}
                </p>
              </div>
              <button type="button" onClick={reset} aria-label="Start a new conversation" title="New conversation" className="rounded-lg p-2 text-muted transition-colors hover:bg-white/10 hover:text-snow">
                <RotateCcw className="h-4 w-4" />
              </button>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close chat" className="rounded-lg p-2 text-muted transition-colors hover:bg-white/10 hover:text-snow">
                <X className="h-5 w-5" />
              </button>
            </header>

            {/* messages */}
            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-5" aria-live="polite">
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
                >
                  <div className={cn("max-w-[85%]", m.role === "user" && "text-right")}>
                    <div
                      className={cn(
                        "whitespace-pre-line rounded-2xl px-4 py-2.5 text-left text-sm leading-relaxed",
                        m.role === "user"
                          ? "rounded-br-md bg-brand-gradient text-white"
                          : "rounded-bl-md border border-white/10 bg-white/[0.06] text-snow/95",
                      )}
                    >
                      {m.text}
                    </div>
                    {m.actions && m.actions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {m.actions.map((a) => {
                          const external = a.href.startsWith("http");
                          return (
                            <a
                              key={a.label}
                              href={a.href}
                              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : { onClick: () => setOpen(false) })}
                              className="rounded-full border border-electric/30 bg-electric/10 px-3 py-1 text-xs font-medium text-electric transition-colors hover:bg-electric/20"
                            >
                              {a.label}
                            </a>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}

              {typing && (
                <div className="flex justify-start" aria-label="Assistant is typing" role="status">
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.06] px-4 py-3.5">
                    {[0, 1, 2].map((i) => (
                      <motion.span
                        key={i}
                        className="h-2 w-2 rounded-full bg-electric"
                        animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
                        transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {showSuggestions && (
                <div className="space-y-2 pt-1">
                  <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-muted">
                    <Sparkles className="h-3 w-3" /> Suggested questions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.map((q, i) => (
                      <motion.button
                        key={q}
                        type="button"
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + i * 0.07 }}
                        onClick={() => void send(q)}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-2 text-left text-xs text-snow/90 transition-colors hover:border-electric/50 hover:bg-electric/10"
                      >
                        {q}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* input */}
            <form onSubmit={onSubmit} className="border-t border-white/10 p-3">
              <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] py-1.5 pl-4 pr-1.5 focus-within:border-electric/50">
                <label htmlFor="chat-input" className="sr-only">
                  Type your message
                </label>
                <input
                  id="chat-input"
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  maxLength={500}
                  placeholder="Ask about our services…"
                  autoComplete="off"
                  className="min-w-0 flex-1 rounded-none bg-transparent text-sm text-snow placeholder:text-muted/60 focus:outline-none focus-visible:outline-none"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || typing}
                  aria-label="Send message"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white transition-opacity disabled:opacity-40"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 text-center font-mono text-[10px] text-muted/80">
                {live ? "AI responses may be imperfect." : "Demo assistant — not a live AI connection."}
              </p>
            </form>
          </motion.section>
        )}
      </AnimatePresence>

      {/* floating button */}
      <motion.button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close ZK NEXORA AI Assistant" : "Open ZK NEXORA AI Assistant"}
        aria-expanded={open}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 1 }}
        className={cn(
          "group fixed bottom-5 right-5 z-[60] inline-flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient text-white glow-blue sm:bottom-6 sm:right-6",
          open && "max-sm:hidden",
        )}
      >
        {!open && <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-brand/40 [animation-duration:2.6s]" />}
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={open ? "x" : "b"} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
            {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </>
  );
}
