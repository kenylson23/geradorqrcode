import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LinkTreeProps {
  title?: string;
  description?: string;
  links: Array<{
    label: string;
    url: string;
  }>;
}

export function LinkTree({ title, description, links }: LinkTreeProps) {
  return (
    <div className="w-full max-w-sm mx-auto p-4 flex flex-col items-center bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-border">
      {title && (
        <h2 className="text-xl font-bold text-foreground mb-1 text-center">{title}</h2>
      )}
      {description && (
        <p className="text-sm text-muted-foreground mb-6 text-center px-4">{description}</p>
      )}
      
      <div className="w-full space-y-3">
        {links.map((link, index) => (
          link.label && link.url && (
            <Button
              key={index}
              asChild
              variant="outline"
              className="w-full h-14 rounded-2xl flex items-center justify-between px-6 hover-elevate active-elevate-2 bg-slate-50 dark:bg-slate-800 border-border hover:border-primary/50 transition-all group"
            >
              <a href={link.url} target="_blank" rel="noopener noreferrer">
                <span className="font-semibold text-foreground truncate mr-2">{link.label}</span>
                <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </a>
            </Button>
          )
        ))}
      </div>
      
      <div className="mt-8 pt-4 border-t border-border w-full text-center">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Gerado por QR Code Angola</p>
      </div>
    </div>
  );
}
