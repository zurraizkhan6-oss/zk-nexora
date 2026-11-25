import { useEffect, useRef } from "react";
import { cn } from "@/utils/cn";

interface Props {
  /** "hero" = strong presence, "subtle" = faint background for other sections */
  variant?: "hero" | "subtle";
  className?: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  z: number; // depth 0.3 - 1 (parallax + size)
  c: 0 | 1 | 2; // color index
}

const COLORS = [
  { rgb: "56,189,248" }, // electric blue
  { rgb: "37,99,235" }, // primary blue
  { rgb: "124,58,237" }, // purple
] as const;

/** Pre-render a soft glow sprite so we avoid expensive per-frame shadowBlur. */
function makeSprite(rgb: string): HTMLCanvasElement {
  const size = 48;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d")!;
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, `rgba(${rgb},1)`);
  grad.addColorStop(0.18, `rgba(${rgb},0.85)`);
  grad.addColorStop(0.45, `rgba(${rgb},0.22)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

/**
 * Real, interactive canvas particle network.
 * - Responsive (ResizeObserver) and DPR-capped
 * - Reacts to mouse + touch, with smoothed parallax
 * - Pauses when the tab is hidden or the canvas is off-screen
 * - Renders a single static frame when prefers-reduced-motion is set
 */
export function ParticleNetwork({ variant = "hero", className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const hero = variant === "hero";
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cfg = hero
      ? { areaPer: 9500, max: 130, link: 150, alpha: 1, speed: 0.22, mouseR: 190, dprCap: 2 }
      : { areaPer: 22000, max: 55, link: 125, alpha: 0.5, speed: 0.16, mouseR: 150, dprCap: 1.5 };

    const sprites = COLORS.map((c) => makeSprite(c.rgb));
    let w = 0;
    let h = 0;
    let dpr = 1;
    let particles: Particle[] = [];

    // pointer state (CSS pixels, relative to canvas)
    const pointer = { x: 0, y: 0, active: false };
    const parallax = { x: 0, y: 0, tx: 0, ty: 0 };

    let raf = 0;
    let running = false;
    let inView = true;
    let last = 0;

    const seed = () => {
      const count = Math.min(cfg.max, Math.max(18, Math.floor((w * h) / cfg.areaPer)));
      particles = Array.from({ length: count }, () => {
        const a = Math.random() * Math.PI * 2;
        const s = (0.35 + Math.random() * 0.65) * cfg.speed;
        const z = 0.3 + Math.random() * 0.7;
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: Math.cos(a) * s,
          vy: Math.sin(a) * s,
          r: 1 + z * 1.6,
          z,
          c: (Math.random() < 0.45 ? 0 : Math.random() < 0.5 ? 1 : 2) as 0 | 1 | 2,
        };
      });
    };

    const resize = () => {
      const rect = parent.getBoundingClientRect();
      w = Math.max(1, Math.floor(rect.width));
      h = Math.max(1, Math.floor(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, cfg.dprCap);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
      if (!running) draw(0);
    };

    const draw = (dt: number) => {
      ctx.clearRect(0, 0, w, h);

      // smooth parallax easing
      parallax.x += (parallax.tx - parallax.x) * 0.05;
      parallax.y += (parallax.ty - parallax.y) * 0.05;

      const n = particles.length;
      const px: number[] = new Array(n);
      const py: number[] = new Array(n);

      for (let i = 0; i < n; i++) {
        const p = particles[i];

        if (dt > 0) {
          // gentle mouse / touch repulsion
          if (pointer.active) {
            const dx = p.x - pointer.x;
            const dy = p.y - pointer.y;
            const d2 = dx * dx + dy * dy;
            const R = cfg.mouseR;
            if (d2 < R * R && d2 > 1) {
              const d = Math.sqrt(d2);
              const f = ((1 - d / R) * 0.9 * dt) / 16;
              p.vx += (dx / d) * f * 0.12;
              p.vy += (dy / d) * f * 0.12;
            }
          }
          // ease velocity back toward base drift
          const sp = Math.hypot(p.vx, p.vy);
          const maxSp = cfg.speed * 3;
          if (sp > maxSp) {
            p.vx = (p.vx / sp) * maxSp;
            p.vy = (p.vy / sp) * maxSp;
          }
          p.vx *= 0.995;
          p.vy *= 0.995;
          const minSp = cfg.speed * 0.35;
          if (sp < minSp) {
            const a = Math.random() * Math.PI * 2;
            p.vx += Math.cos(a) * 0.004;
            p.vy += Math.sin(a) * 0.004;
          }

          p.x += (p.vx * dt) / 16;
          p.y += (p.vy * dt) / 16;
          if (p.x < -20) p.x = w + 20;
          else if (p.x > w + 20) p.x = -20;
          if (p.y < -20) p.y = h + 20;
          else if (p.y > h + 20) p.y = -20;
        }

        px[i] = p.x + parallax.x * p.z * 26;
        py[i] = p.y + parallax.y * p.z * 26;
      }

      // connecting lines
      const L = cfg.link;
      const L2 = L * L;
      ctx.lineWidth = 1;
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          const dx = px[i] - px[j];
          if (dx > L || dx < -L) continue;
          const dy = py[i] - py[j];
          const d2 = dx * dx + dy * dy;
          if (d2 > L2) continue;
          const t = 1 - Math.sqrt(d2) / L;
          const col = COLORS[particles[i].c === particles[j].c ? particles[i].c : 0].rgb;
          ctx.strokeStyle = `rgba(${col},${(t * 0.42 * cfg.alpha).toFixed(3)})`;
          ctx.beginPath();
          ctx.moveTo(px[i], py[i]);
          ctx.lineTo(px[j], py[j]);
          ctx.stroke();
        }
      }

      // pointer links (bright "tethers" to the cursor / finger)
      if (pointer.active) {
        const R = cfg.mouseR * 1.25;
        for (let i = 0; i < n; i++) {
          const dx = px[i] - pointer.x;
          const dy = py[i] - pointer.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < R * R) {
            const t = 1 - Math.sqrt(d2) / R;
            ctx.strokeStyle = `rgba(56,189,248,${(t * 0.55 * cfg.alpha).toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(px[i], py[i]);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.stroke();
          }
        }
      }

      // glowing particles
      for (let i = 0; i < n; i++) {
        const p = particles[i];
        const size = p.r * 7 * (hero ? 1 : 0.8);
        ctx.globalAlpha = Math.min(1, (0.45 + p.z * 0.55) * cfg.alpha * (hero ? 1 : 1.2));
        ctx.drawImage(sprites[p.c], px[i] - size / 2, py[i] - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
    };

    const loop = (now: number) => {
      if (!running) return;
      const dt = Math.min(now - last, 50); // clamp after tab switches
      last = now;
      draw(dt);
      raf = requestAnimationFrame(loop);
    };

    const start = () => {
      if (running || reduced || document.hidden || !inView) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const setPointer = (clientX: number, clientY: number) => {
      const r = canvas.getBoundingClientRect();
      const x = clientX - r.left;
      const y = clientY - r.top;
      const inside = x >= 0 && y >= 0 && x <= r.width && y <= r.height;
      pointer.active = inside;
      if (inside) {
        pointer.x = x;
        pointer.y = y;
        parallax.tx = (x / r.width - 0.5) * -2;
        parallax.ty = (y / r.height - 0.5) * -2;
      }
    };

    const onMouse = (e: MouseEvent) => setPointer(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) setPointer(t.clientX, t.clientY);
    };
    const onLeave = () => {
      pointer.active = false;
      parallax.tx = 0;
      parallax.ty = 0;
    };
    const onVisibility = () => (document.hidden ? stop() : start());

    resize();

    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        inView ? start() : stop();
      },
      { threshold: 0 },
    );
    io.observe(canvas);

    if (!reduced) {
      window.addEventListener("mousemove", onMouse, { passive: true });
      window.addEventListener("touchstart", onTouch, { passive: true });
      window.addEventListener("touchmove", onTouch, { passive: true });
      window.addEventListener("touchend", onLeave, { passive: true });
      window.addEventListener("touchcancel", onLeave, { passive: true });
      document.addEventListener("mouseleave", onLeave);
    }
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("touchend", onLeave);
      window.removeEventListener("touchcancel", onLeave);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [variant]);

  return (
    <div aria-hidden="true" className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <canvas ref={canvasRef} className="absolute inset-0 block" />
    </div>
  );
}
