import { Heart, Mail, QrCode } from "lucide-react";
import { SiFacebook, SiInstagram, SiWhatsapp, SiLinkedin } from "react-icons/si";

const NAV_LINKS = [
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Funcionalidades", href: "#funcionalidades" },
  { label: "Vantagens", href: "#vantagens" },
  { label: "Depoimentos", href: "#depoimentos" },
  { label: "FAQ", href: "#faq" },
];

const SOCIAL_LINKS = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/angoqurcode",
    icon: SiFacebook,
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/angoqurcode",
    icon: SiInstagram,
  },
  {
    label: "WhatsApp",
    href: "https://wa.me/244923000000",
    icon: SiWhatsapp,
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/angoqurcode",
    icon: SiLinkedin,
  },
];

function scrollToSection(href: string) {
  const id = href.replace("#", "");
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
}

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-slate-900 text-slate-300">
      {/* Main grid */}
      <div className="container mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">

        {/* Column 1 — Brand */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">AngoQRCode</span>
          </div>
          <p className="text-sm leading-relaxed text-slate-400 max-w-xs">
            O gerador de QR codes gratuito feito para Angola. Crie, personalize e partilhe em segundos.
          </p>
          <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
            Feito com <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" /> em Angola
          </div>
        </div>

        {/* Column 2 — Navigation */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">
            Navegação
          </h3>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-sm text-slate-300 hover:text-white text-left transition-colors"
            data-testid="footer-link-criar"
          >
            Criar QR Code
          </button>
          {NAV_LINKS.map((link) => (
            <button
              key={link.href}
              onClick={() => scrollToSection(link.href)}
              className="text-sm text-slate-300 hover:text-white text-left transition-colors"
              data-testid={`footer-link-${link.href.replace("#", "")}`}
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Column 3 — Social + Contact */}
        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">
            Contacto
          </h3>
          <a
            href="mailto:contacto@angoqurcode.ao"
            className="flex items-center gap-2 text-sm text-slate-300 hover:text-white transition-colors"
            data-testid="footer-link-email"
          >
            <Mail className="h-4 w-4 text-slate-500" />
            contacto@angoqurcode.ao
          </a>
          <div className="flex items-center gap-3 mt-2">
            {SOCIAL_LINKS.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                data-testid={`footer-social-${s.label.toLowerCase()}`}
                className="w-9 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <s.icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="container mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
          <p>
            &copy; {new Date().getFullYear()}{" "}
            <a
              href="https://angoqurcode.ao"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-400 transition-colors"
            >
              AngoQRCode
            </a>
            . Todos os direitos reservados.
          </p>
          <p>Gratuito &middot; Sem registo &middot; Sem limites</p>
        </div>
      </div>
    </footer>
  );
}
