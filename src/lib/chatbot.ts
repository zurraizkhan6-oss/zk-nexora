import { siteConfig, whatsappLink } from "./config";
import { plans, services } from "./data";

export interface ChatAction {
  label: string;
  href: string;
}
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  actions?: ChatAction[];
}

export const suggestedQuestions = [
  "What services do you offer?",
  "Tell me about the founder",
  "How does pricing work?",
  "Do you build AI chatbots?",
  "How can I contact you?",
];

export const welcomeMessage: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text:
    "Hi! I'm the ZK NEXORA AI Assistant. I can answer questions about our services, pricing approach, portfolio and how to get in touch.\n\nNote: I'm currently a demo assistant that answers from the information on this website.",
};

interface Intent {
  keywords: string[];
  reply: () => Omit<ChatMessage, "id" | "role">;
}

const contactActions = (): ChatAction[] => {
  const a: ChatAction[] = [{ label: "Open contact form", href: "#contact" }];
  if (whatsappLink) a.push({ label: "Chat on WhatsApp", href: whatsappLink });
  return a;
};

const intents: Intent[] = [
  {
    keywords: ["hello", "hi", "hey", "salam", "good morning", "good evening"],
    reply: () => ({
      text: "Hello! 👋 How can I help you today? You can ask about our services, pricing, portfolio or the founder.",
    }),
  },
  {
    keywords: ["service", "offer", "what do you do", "what can you", "provide", "help with"],
    reply: () => ({
      text:
        "ZK NEXORA offers:\n" +
        services.map((s) => `• ${s.title}`).join("\n") +
        "\n\nAsk me about any of these for more detail.",
      actions: [{ label: "View services", href: "#services" }],
    }),
  },
  {
    keywords: ["web development", "web app", "website", "web dev", "business website", "landing"],
    reply: () => ({
      text:
        "On the web side we build custom web applications, professional business websites and conversion-focused landing pages — responsive, fast and SEO-friendly.",
      actions: [{ label: "Services", href: "#services" }, { label: "Start a project", href: "#contact" }],
    }),
  },
  {
    keywords: ["chatbot", "chat bot", "assistant", "conversational"],
    reply: () => ({
      text:
        "Yes — we build AI chatbots that answer questions using your own business information. We're transparent about their limits and can add a hand-off to a human. Share your use case through the contact form and we'll discuss it.",
      actions: [{ label: "Discuss a chatbot", href: "#contact" }],
    }),
  },
  {
    keywords: ["automation", "automate", "workflow"],
    reply: () => ({
      text:
        "AI Automation means streamlining repetitive workflows — such as lead handling or internal processes — so your team can focus on higher-value work.",
      actions: [{ label: "Talk about automation", href: "#contact" }],
    }),
  },
  {
    keywords: ["agent", "agentic", "autonomous"],
    reply: () => ({
      text:
        "Agentic AI solutions are AI agents that can plan, use tools and complete multi-step tasks — built with clear guardrails and human oversight.",
      actions: [{ label: "Discuss an agent", href: "#contact" }],
    }),
  },
  {
    keywords: ["meta", "facebook", "instagram", "ads", "marketing", "advertising"],
    reply: () => ({
      text:
        "We provide Meta Ads (Facebook & Instagram) and digital marketing support: campaign strategy, creative direction and tracking.",
      actions: [{ label: "Ask about marketing", href: "#contact" }],
    }),
  },
  {
    keywords: ["price", "pricing", "cost", "quote", "how much", "package", "plan", "budget", "rate"],
    reply: () => ({
      text:
        "We don't publish fixed prices because every project is different. We have three packages — " +
        plans.map((p) => p.name).join(", ") +
        " — and you can request a quote with your requirements.",
      actions: [{ label: "See packages", href: "#pricing" }, { label: "Request a quote", href: "#contact" }],
    }),
  },
  {
    keywords: ["founder", "zurraiz", "khan", "owner", "who runs", "who is", "team", "who are you"],
    reply: () => ({
      text:
        `ZK NEXORA was founded by ${siteConfig.founder.name}, ${siteConfig.founder.role}. "ZK" represents the founder's initials and "NEXORA" represents next-generation innovation.`,
      actions: [{ label: "About us", href: "#about" }],
    }),
  },
  {
    keywords: ["mission", "vision", "approach", "philosophy", "values"],
    reply: () => ({
      text:
        "Our approach combines engineering-first quality, design that earns trust, practical AI and clear collaboration. You can read our mission and vision on the About section.",
      actions: [{ label: "Read more", href: "#about" }],
    }),
  },
  {
    keywords: ["portfolio", "our work", "your work", "examples", "example", "case study", "clients"],
    reply: () => ({
      text:
        "Our portfolio section currently shows clearly labelled DEMO concepts that illustrate what we can build — they are not real client projects.",
      actions: [{ label: "View portfolio", href: "#portfolio" }],
    }),
  },
  {
    keywords: ["contact", "reach", "email", "phone", "whatsapp", "talk", "call", "get in touch", "hire", "start"],
    reply: () => ({
      text: whatsappLink
        ? "You can send us a message through the contact form or reach us directly on WhatsApp."
        : "The best way to reach us is the contact form on this website. Tell us about your project and we'll respond.",
      actions: contactActions(),
    }),
  },
  {
    keywords: ["thank", "thanks", "thx"],
    reply: () => ({ text: "You're welcome! Is there anything else you'd like to know?" }),
  },
];

const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();

/** Offline answer built only from website information. */
export function localReply(input: string): Omit<ChatMessage, "id" | "role"> {
  const text = ` ${normalize(input)} `;
  let best: { score: number; intent?: Intent } = { score: 0 };
  for (const intent of intents) {
    let score = 0;
    for (const k of intent.keywords) {
      if (text.includes(` ${k} `) || (k.length > 4 && text.includes(k))) score += k.split(" ").length;
    }
    if (score > best.score) best = { score, intent };
  }
  if (best.intent) return best.intent.reply();
  return {
    text:
      "I don't have verified information about that on this website. I can help with our services, pricing approach, portfolio and contact options — or you can ask the team directly.",
    actions: contactActions(),
  };
}

const uid = () => Math.random().toString(36).slice(2, 10);
export const newId = uid;

/**
 * Gets a reply. If VITE_CHAT_API_URL is configured, it calls your secure proxy
 * (server/index.mjs). Otherwise — or if it fails — falls back to the local demo
 * engine and says so honestly.
 */
export async function getReply(history: ChatMessage[]): Promise<{ message: Omit<ChatMessage, "id" | "role">; live: boolean }> {
  const last = history[history.length - 1]?.text ?? "";

  if (siteConfig.chatApiUrl) {
    const controller = new AbortController();
    const t = window.setTimeout(() => controller.abort(), 20000);
    try {
      const res = await fetch(siteConfig.chatApiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.slice(-10).map((m) => ({ role: m.role, content: m.text })),
        }),
        signal: controller.signal,
      });
      if (res.ok) {
        const data = (await res.json()) as { reply?: string };
        if (data.reply) return { message: { text: String(data.reply) }, live: true };
      }
    } catch {
      /* fall through to demo fallback */
    } finally {
      window.clearTimeout(t);
    }
    const fb = localReply(last);
    return {
      message: { ...fb, text: "(The AI service is unavailable right now, so this is a demo answer from our website info.)\n\n" + fb.text },
      live: false,
    };
  }

  return { message: localReply(last), live: false };
}
