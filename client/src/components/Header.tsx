import { QrCode, HelpCircle, Menu } from "lucide-react";
import { Link } from "wouter";

export function Header() {
  return (
    <header className="w-full bg-white border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-lg">
            <QrCode className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold text-foreground leading-tight">
              Online
            </h1>
            <span className="text-lg font-bold text-foreground -mt-1">
              QR Generator
            </span>
          </div>
        </Link>
        
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-8 mr-8">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold">1</div>
              <span className="text-sm font-semibold">Tipo de código QR</span>
              <div className="w-12 h-px bg-muted-foreground/30 mx-2" />
              <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold">2</div>
              <span className="text-sm font-medium text-muted-foreground">Conteúdo</span>
              <div className="w-12 h-px bg-muted-foreground/30 mx-2" />
              <div className="w-6 h-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-bold">3</div>
              <span className="text-sm font-medium text-muted-foreground">Design QR</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg border border-border hover:bg-muted transition-colors">
              <HelpCircle className="h-5 w-5 text-muted-foreground" />
            </button>
            <button className="p-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
