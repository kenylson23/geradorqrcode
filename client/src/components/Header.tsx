import { HelpCircle, Menu } from "lucide-react";
import { Link } from "wouter";
import logoPngPath from "@assets/a-minimalist-logo-design-featuring-the-t_nBAXclrzTMSUXjQGrYGJ__1771525669705.png";

interface HeaderProps {
  currentStep: number;
}

export function Header({ currentStep }: HeaderProps) {
  return (
    <header className="w-full bg-white border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <img 
            src={logoPngPath} 
            alt="Ango QrCode Logo" 
            className="h-10 w-auto object-contain"
          />
        </Link>
        
        <div className="flex items-center gap-4">
          <div className="hidden lg:flex items-center gap-8 mr-8">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${currentStep >= 1 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>1</div>
              <span className={`text-sm ${currentStep === 1 ? 'font-semibold' : 'font-medium text-muted-foreground'}`}>Tipo de código QR</span>
              <div className="w-12 h-px bg-muted-foreground/30 mx-2" />
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${currentStep >= 2 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>2</div>
              <span className={`text-sm ${currentStep === 2 ? 'font-semibold' : 'font-medium text-muted-foreground'}`}>Conteúdo</span>
              <div className="w-12 h-px bg-muted-foreground/30 mx-2" />
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${currentStep >= 3 ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>3</div>
              <span className={`text-sm ${currentStep === 3 ? 'font-semibold' : 'font-medium text-muted-foreground'}`}>Design QR</span>
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
