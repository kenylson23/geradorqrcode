import { HelpCircle } from "lucide-react";
import { Link } from "wouter";
import logoPngPath from "@assets/image_1771526445503.png";

interface HeaderProps {
  currentStep: number;
}

const STEPS = [
  { n: 1, label: "Tipo" },
  { n: 2, label: "Conteúdo" },
  { n: 3, label: "Design" },
];

export function Header({ currentStep }: HeaderProps) {
  return (
    <header className="w-full bg-white border-b border-border shadow-sm sticky top-0 z-50">
      {/* Main header row */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-12 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <img
            src={logoPngPath}
            alt="Ango QrCode Logo"
            className="h-10 w-auto object-contain"
          />
        </Link>

        <div className="flex items-center gap-4">
          {/* Desktop stepper */}
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
          </div>
        </div>
      </div>

      {/* Mobile stepper — only visible below lg */}
      <div className="lg:hidden border-t border-slate-100 px-4 py-2">
        <div className="flex items-center justify-center gap-0">
          {STEPS.map((step, idx) => {
            const done = currentStep > step.n;
            const active = currentStep === step.n;
            return (
              <div key={step.n} className="flex items-center">
                {/* Circle + label */}
                <div className="flex flex-col items-center gap-0.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all
                      ${done ? 'bg-[#2ECC71] text-white' : active ? 'bg-[#2ECC71] text-white ring-4 ring-[#2ECC71]/20' : 'bg-slate-100 text-slate-400'}`}
                    data-testid={`step-indicator-${step.n}`}
                  >
                    {done ? (
                      <svg className="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : step.n}
                  </div>
                  <span
                    className={`text-[10px] font-medium leading-none
                      ${active ? 'text-[#2ECC71]' : done ? 'text-slate-400' : 'text-slate-300'}`}
                  >
                    {step.label}
                  </span>
                </div>

                {/* Connector line between steps */}
                {idx < STEPS.length - 1 && (
                  <div className="flex items-center mx-1.5 mb-3">
                    <div
                      className={`h-0.5 w-12 rounded-full transition-all duration-300
                        ${currentStep > step.n ? 'bg-[#2ECC71]' : 'bg-slate-200'}`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </header>
  );
}
