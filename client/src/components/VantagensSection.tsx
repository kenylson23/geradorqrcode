import { useEffect, useRef } from "react";
import {
  RefreshCw, BarChart2, Paintbrush, FileImage, FileDown, Gift,
} from "lucide-react";

const ITEMS = [
  {
    icon: RefreshCw,
    title: "QR Code Dinâmico",
    desc: "Edite o destino a qualquer hora sem precisar de reimprimir o material.",
  },
  {
    icon: BarChart2,
    title: "Analytics de Scans",
    desc: "Acompanhe quantas vezes o seu QR foi escaneado e de onde.",
  },
  {
    icon: Paintbrush,
    title: "Design Personalizado",
    desc: "Adicione cores, logo e moldura ao seu QR code de forma simples.",
  },
  {
    icon: FileImage,
    title: "PDF e Imagens",
    desc: "Hospede documentos e imagens directamente no QR, sem terceiros.",
  },
  {
    icon: FileDown,
    title: "Múltiplos Formatos",
    desc: "Descarregue em PNG, SVG ou PDF com resolução máxima.",
  },
  {
    icon: Gift,
    title: "Totalmente Gratuito",
    desc: "Crie quantos QR codes quiser, sem registo e sem limites.",
  },
];

export function VantagensSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const topFlareRef = useRef<HTMLDivElement>(null);
  const topGlowRef = useRef<HTMLDivElement>(null);
  const bottomFlareRef = useRef<HTMLDivElement>(null);
  const bottomGlowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const topFlare = topFlareRef.current;
    const topGlow = topGlowRef.current;
    const bottomFlare = bottomFlareRef.current;
    const bottomGlow = bottomGlowRef.current;
    if (!container || !topFlare || !topGlow || !bottomFlare || !bottomGlow) return;

    let hasAnimated = false;
    let cycleTimeout: ReturnType<typeof setTimeout> | null = null;

    function setOpacity(el: HTMLDivElement, value: string) {
      el.style.opacity = value;
    }

    function runCycle() {
      // top flare blink
      setTimeout(() => { setOpacity(topFlare, "0"); setOpacity(topGlow, "0"); }, 3000);
      setTimeout(() => { setOpacity(topFlare, "1"); setOpacity(topGlow, "1"); }, 4500);
      // bottom flare blink (offset)
      setTimeout(() => { setOpacity(bottomFlare, "0"); setOpacity(bottomGlow, "0"); }, 2000);
      setTimeout(() => { setOpacity(bottomFlare, "1"); setOpacity(bottomGlow, "1"); }, 5500);

      cycleTimeout = setTimeout(runCycle, 6000);
    }

    function startAnimations() {
      setTimeout(() => { setOpacity(topFlare, "1"); setOpacity(topGlow, "1"); }, 500);
      setTimeout(() => { setOpacity(bottomFlare, "1"); setOpacity(bottomGlow, "1"); }, 800);
      runCycle();
    }

    function resetAnimations() {
      if (cycleTimeout) clearTimeout(cycleTimeout);
      setOpacity(topFlare, "0"); setOpacity(topGlow, "0");
      setOpacity(bottomFlare, "0"); setOpacity(bottomGlow, "0");
      hasAnimated = false;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated) {
            hasAnimated = true;
            startAnimations();
          } else if (!entry.isIntersecting && hasAnimated) {
            resetAnimations();
          }
        });
      },
      { threshold: 0.3, rootMargin: "50px" }
    );

    observer.observe(container);
    return () => {
      observer.disconnect();
      if (cycleTimeout) clearTimeout(cycleTimeout);
    };
  }, []);

  return (
    <section id="vantagens" className="py-14 md:py-24 bg-slate-950">
      <div className="max-w-5xl mx-auto px-6">
        {/* Header */}
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-4 tracking-tight">
          Por que usar o AngoQRCode?
        </h2>
        <p className="text-center text-white/50 mb-10 md:mb-16 text-base">
          Tudo que precisa para criar QR codes profissionais
        </p>

        {/* Outer frosted wrapper */}
        <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.02] border border-white/10 rounded-3xl p-6 md:p-10 backdrop-blur-sm">

          {/* Inner dotted grid container */}
          <div
            ref={containerRef}
            className="relative grid gap-8 md:grid-cols-3 overflow-hidden rounded-2xl p-6 md:p-8"
            style={{
              backgroundColor: "#0f0f14",
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Edge highlight lines */}
            <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            {/* Specular flare — top-right */}
            <div
              ref={topFlareRef}
              aria-hidden
              className="pointer-events-none absolute top-0 right-0 h-px w-60 bg-gradient-to-r from-transparent via-blue-400/80 to-purple-500/70 opacity-0 transition-all duration-1000 ease-in-out"
            />
            <div
              ref={topGlowRef}
              aria-hidden
              className="pointer-events-none absolute top-0 right-0 h-2 w-60 rounded-full blur-sm bg-gradient-to-r from-transparent via-blue-400/30 to-purple-500/30 opacity-0 transition-all duration-1000 ease-in-out"
            />

            {/* Specular flare — bottom-left */}
            <div
              ref={bottomFlareRef}
              aria-hidden
              className="pointer-events-none absolute bottom-0 left-0 h-px w-60 bg-gradient-to-l from-transparent via-cyan-400/80 to-teal-500/70 opacity-0 transition-all duration-1000 ease-in-out"
            />
            <div
              ref={bottomGlowRef}
              aria-hidden
              className="pointer-events-none absolute bottom-0 left-0 h-2 w-60 rounded-full blur-sm bg-gradient-to-l from-transparent via-cyan-400/30 to-teal-500/30 opacity-0 transition-all duration-1000 ease-in-out"
            />

            {/* Cards */}
            {ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="group"
                  data-testid={`card-vantagem-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-white/10 border border-white/10 text-white group-hover:scale-110 transition-transform duration-200">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-white/60 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
