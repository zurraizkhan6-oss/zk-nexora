import { MotionConfig } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ChatWidget } from "@/components/ChatWidget";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { SEO } from "@/components/SEO";
import { Hero } from "@/sections/Hero";
import { About } from "@/sections/About";
import { Services } from "@/sections/Services";
import { Portfolio } from "@/sections/Portfolio";
import { Pricing } from "@/sections/Pricing";
import { FreeAudit } from "@/sections/FreeAudit";
import { Contact } from "@/sections/Contact";


export default function App() {
  return (
    // reducedMotion="user" makes Framer Motion honour prefers-reduced-motion
    <MotionConfig reducedMotion="user">
      <SEO />
      <a
        href="#main"
        className="sr-only z-[100] rounded-lg bg-brand px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>
      <Navbar />
      <main id="main">
        <Hero />
        <About />
        <Services />
        <Portfolio />
        <Pricing />
        <FreeAudit />
        <Contact />
      </main>
      <Footer />
      <WhatsAppButton />
      <ChatWidget />
    </MotionConfig>
  );
}