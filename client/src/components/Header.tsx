import { QrCode } from "lucide-react";
import { Link } from "wouter";

export function Header() {
  return (
    <header className="w-full py-6 bg-gradient-to-r from-primary/10 via-background to-background border-b border-primary/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group cursor-pointer transition-opacity hover:opacity-80">
          <div className="bg-primary text-primary-foreground p-2 rounded-xl shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform duration-300">
            <QrCode className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold font-display text-foreground tracking-tight">
              QR Ango
            </h1>
            <p className="text-xs text-muted-foreground font-medium">Gerador Rápido</p>
          </div>
        </Link>
        
        <nav className="hidden md:flex items-center gap-6">
          <a href="#funciona" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Como Funciona</a>
          <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">FAQ</a>
          <button className="px-5 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm hover:bg-primary/20 transition-colors">
            Versão Pro
          </button>
        </nav>
      </div>
    </header>
  );
}
