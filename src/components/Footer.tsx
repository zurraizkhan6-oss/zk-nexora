import { Logo } from "./Logo";
import { navLinks, siteConfig, whatsappLink } from "@/lib/config";
import { services } from "@/lib/data";

export function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-ink-2/60">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Logo />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-muted">
              {siteConfig.tagline} Websites, AI solutions and digital experiences built for what&apos;s next.
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-electric">Navigate</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="text-muted transition-colors hover:text-snow">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-electric">Services</h3>
            <ul className="mt-4 space-y-2.5 text-sm">
              {services.map((s) => (
                <li key={s.id}>
                  <a href="#services" className="text-muted transition-colors hover:text-snow">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.2em] text-electric">Get in touch</h3>
            <ul className="mt-4 space-y-2.5 text-sm text-muted">
              <li>
                <a href="#contact" className="transition-colors hover:text-snow">
                  Contact form
                </a>
              </li>
              {siteConfig.contactEmail && (
                <li>
                  <a href={`mailto:${siteConfig.contactEmail}`} className="transition-colors hover:text-snow">
                    {siteConfig.contactEmail}
                  </a>
                </li>
              )}
              {whatsappLink && (
                <li>
                  <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-snow">
                    WhatsApp
                  </a>
                </li>
              )}
              <li className="pt-2 text-xs">
                Founder: {siteConfig.founder.name}
                <br />
                {siteConfig.founder.role}
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-white/10 pt-6 text-xs text-muted sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} ZK NEXORA. All rights reserved.</p>
          <p className="font-mono tracking-wider">Innovate Today. Build Tomorrow.</p>
        </div>
      </div>
    </footer>
  );
}
