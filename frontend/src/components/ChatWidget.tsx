import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Send, X, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Matches Tailwind's `lg` breakpoint, used to switch the chat panel between a mobile bottom sheet and a desktop floating card. */
const useIsDesktop = () => {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches
  );

  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setIsDesktop(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isDesktop;
};

/** Magnetic cursor-follow: the button drifts toward a nearby cursor and settles back with a spring. */
const useMagnetic = (active: boolean) => {
  const ref = useRef<HTMLButtonElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 150, damping: 14, mass: 0.4 });
  const y = useSpring(my, { stiffness: 150, damping: 14, mass: 0.4 });
  const rotate = useTransform(x, [-18, 18], [-10, 10]);

  useEffect(() => {
    if (!active || prefersReducedMotion()) {
      mx.set(0);
      my.set(0);
      return;
    }
    const radius = 170;
    const strength = 0.4;
    const onMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      const dist = Math.hypot(dx, dy);
      if (dist < radius) {
        const pull = 1 - dist / radius;
        mx.set(dx * pull * strength);
        my.set(dy * pull * strength);
      } else {
        mx.set(0);
        my.set(0);
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => {
      window.removeEventListener("mousemove", onMove);
      mx.set(0);
      my.set(0);
    };
  }, [active, mx, my]);

  return { ref, x, y, rotate };
};

type ChatMessage = { role: "user" | "assistant"; content: string };

const WELCOME: ChatMessage = {
  role: "assistant",
  content:
    "Salam! I'm the Istiqlal Youth Academy assistant. Ask me about our committees, events, or how to join.",
};

export const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const magnetic = useMagnetic(!open);
  const isDesktop = useIsDesktop();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const { data } = await api.post("/chat", { messages: next });
      setMessages((cur) => [...cur, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((cur) => [
        ...cur,
        { role: "assistant", content: "Sorry, I couldn't reach the assistant right now. Please try again shortly." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={isDesktop ? { opacity: 0, y: 24, scale: 0.96 } : { y: "100%" }}
            animate={isDesktop ? { opacity: 1, y: 0, scale: 1 } : { y: 0 }}
            exit={isDesktop ? { opacity: 0, y: 16, scale: 0.97 } : { y: "100%" }}
            transition={isDesktop ? { duration: 0.2, ease: "easeOut" } : { type: "spring", damping: 28, stiffness: 260 }}
            className={cn(
              "fixed z-50 flex flex-col overflow-hidden border-border bg-card shadow-card",
              isDesktop
                ? "bottom-24 right-5 h-[min(520px,65vh)] w-[min(380px,calc(100vw-2.5rem))] rounded-2xl border"
                : "inset-x-0 bottom-0 h-[80vh] rounded-t-3xl border-t"
            )}
          >
            {!isDesktop && (
              <div className="flex justify-center pt-3 pb-1">
                <div className="h-1.5 w-12 rounded-full bg-foreground/15" />
              </div>
            )}
            {/* Header */}
            <div className="relative flex items-center gap-3 border-b border-border bg-gradient-to-r from-primary/15 to-transparent px-4 py-3">
              <img
                src="/chatbot-avatar.png"
                alt=""
                className="h-9 w-9 rounded-full object-cover shadow-glow"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">IYA Assistant</p>
                <p className="text-xs text-muted-foreground">Ask about committees, events, joining</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="ml-auto rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m, i) => (
                <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                      m.role === "user"
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm bg-muted text-foreground"
                    )}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-muted px-3.5 py-2.5">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.3s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60 [animation-delay:-0.15s]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/60" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 border-t border-border p-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
                placeholder="Type a message..."
                className="flex-1 rounded-full border border-input bg-background px-4 py-2 text-sm text-foreground outline-none ring-primary/40 focus:ring-2"
              />
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                aria-label="Send message"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        ref={magnetic.ref}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat assistant" : "Open chat assistant"}
        style={{ x: magnetic.x, y: magnetic.y, rotate: magnetic.rotate }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "fixed bottom-20 lg:bottom-5 right-5 z-50 flex items-center justify-center transition-[height,width]",
          open
            ? "h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-glow"
            : "h-24 w-24 bg-transparent drop-shadow-[0_8px_24px_hsl(var(--primary)/0.45)]"
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="close" initial={{ rotate: -45, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 45, opacity: 0 }}>
              <X className="h-6 w-6" />
            </motion.span>
          ) : (
            <motion.img
              key="open"
              src="/chatbot-avatar.png"
              alt=""
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              className="h-full w-full object-contain"
            />
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
};
