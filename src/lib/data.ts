import {
  Globe,
  Building2,
  Rocket,
  MessageSquareCode,
  Workflow,
  BrainCircuit,
  Megaphone,
  ShoppingBag,
  LineChart,
  Bot,
  Network,
  type LucideIcon,
} from "lucide-react";

export interface Service {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string; // tailwind gradient classes
}

export const services: Service[] = [
  {
    id: "web-development",
    title: "Web Development",
    description:
      "Custom, fast and scalable web applications built with modern frameworks, clean code and a strong focus on user experience.",
    icon: Globe,
    accent: "from-electric to-brand",
  },
  {
    id: "business-websites",
    title: "Business Websites",
    description:
      "Professional, trustworthy websites that present your brand clearly, rank well in search and are easy to maintain.",
    icon: Building2,
    accent: "from-brand to-violet",
  },
  {
    id: "landing-pages",
    title: "Landing Page Development",
    description:
      "High-impact, conversion-focused landing pages designed to turn campaign traffic into enquiries and customers.",
    icon: Rocket,
    accent: "from-violet to-electric",
  },
  {
    id: "ai-chatbots",
    title: "AI Chatbots",
    description:
      "Conversational assistants for your website or support channels that answer questions using your own business information.",
    icon: MessageSquareCode,
    accent: "from-electric to-violet",
  },
  {
    id: "ai-automation",
    title: "AI Automation",
    description:
      "Automate repetitive workflows — from lead handling to internal processes — so your team can focus on higher-value work.",
    icon: Workflow,
    accent: "from-brand to-electric",
  },
  {
    id: "agentic-ai",
    title: "Agentic AI Solutions",
    description:
      "AI agents that can plan, use tools and complete multi-step tasks, designed with clear guardrails and human oversight.",
    icon: BrainCircuit,
    accent: "from-violet to-brand",
  },
  {
    id: "meta-ads",
    title: "Meta Ads & Digital Marketing",
    description:
      "Campaign strategy, creative direction and tracking for Meta (Facebook & Instagram) ads and broader digital marketing.",
    icon: Megaphone,
    accent: "from-electric to-brand",
  },
];

export const serviceOptions = services.map((s) => s.title).concat(["Something else / Not sure yet"]);

/* ---------------- Portfolio (DEMO concepts only) ---------------- */
export type PortfolioCategory = "Web" | "Landing" | "AI" | "Marketing";

export interface Project {
  id: string;
  title: string;
  category: PortfolioCategory;
  description: string;
  tags: string[];
  icon: LucideIcon;
  gradient: string;
}

export const portfolioCategories: ("All" | PortfolioCategory)[] = ["All", "Web", "Landing", "AI", "Marketing"];

export const projects: Project[] = [
  {
    id: "nova-commerce",
    title: "Nova Commerce",
    category: "Web",
    description: "A concept online storefront with product catalogue, filtering and a streamlined checkout flow.",
    tags: ["React", "TypeScript", "Tailwind CSS"],
    icon: ShoppingBag,
    gradient: "from-brand/60 via-electric/30 to-ink-2",
  },
  {
    id: "atlas-business",
    title: "Atlas Business Site",
    category: "Web",
    description: "A concept multi-page corporate website with clear service pages, strong SEO structure and fast load times.",
    tags: ["React", "SEO", "Responsive"],
    icon: Building2,
    gradient: "from-violet/50 via-brand/30 to-ink-2",
  },
  {
    id: "launchpad",
    title: "Launchpad",
    category: "Landing",
    description: "A concept product landing page focused on a single, clear call to action and motion-led storytelling.",
    tags: ["Framer Motion", "Tailwind CSS", "Conversion"],
    icon: Rocket,
    gradient: "from-electric/50 via-violet/30 to-ink-2",
  },
  {
    id: "helix-assistant",
    title: "Helix Support Assistant",
    category: "AI",
    description: "A concept customer-support chatbot that answers from a curated knowledge base and hands off to a human.",
    tags: ["LLM", "Chatbot", "Knowledge Base"],
    icon: Bot,
    gradient: "from-violet/60 via-electric/25 to-ink-2",
  },
  {
    id: "flowsync",
    title: "FlowSync Automation",
    category: "AI",
    description: "A concept workflow that captures leads, enriches them and routes them to the right team automatically.",
    tags: ["Automation", "APIs", "Webhooks"],
    icon: Network,
    gradient: "from-brand/60 via-violet/30 to-ink-2",
  },
  {
    id: "adpulse",
    title: "AdPulse Campaign Dashboard",
    category: "Marketing",
    description: "A concept reporting view that brings Meta Ads performance and landing page results into one place.",
    tags: ["Meta Ads", "Analytics", "Reporting"],
    icon: LineChart,
    gradient: "from-electric/50 via-brand/30 to-ink-2",
  },
];

/* ---------------- Pricing (no invented prices) ---------------- */
export interface Plan {
  id: string;
  name: string;
  tagline: string;
  features: string[];
  featured?: boolean;
}

export const plans: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "For individuals and small businesses getting online.",
    features: [
      "Landing page or compact website",
      "Responsive, mobile-first design",
      "Basic on-page SEO setup",
      "Contact form integration",
      "Handover and launch guidance",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    tagline: "For growing businesses that need more depth.",
    featured: true,
    features: [
      "Multi-page business website or web app",
      "Custom UI/UX and animations",
      "AI chatbot or automation integration",
      "Analytics and performance tuning",
      "Priority communication during the project",
    ],
  },
  {
    id: "custom",
    name: "Custom Solution",
    tagline: "For ambitious, tailored or AI-driven products.",
    features: [
      "Fully tailored scope and architecture",
      "Agentic AI and advanced automation",
      "Third-party and API integrations",
      "Meta Ads & marketing strategy support",
      "Ongoing collaboration options",
    ],
  },
];

/* ---------------- About ---------------- */
export const principles = [
  { title: "Engineering first", text: "Clean, maintainable code and sound architecture — so what we build keeps working as you grow." },
  { title: "Design that earns trust", text: "Premium, clear and accessible interfaces that make your brand feel credible from the first second." },
  { title: "Practical AI", text: "AI used where it creates real value — transparent about what it can and cannot do." },
  { title: "Clear collaboration", text: "Honest scoping, straightforward communication and no surprises." },
];
