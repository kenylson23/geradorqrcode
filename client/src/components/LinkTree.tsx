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
      {(title || !links.some(l => l.label && l.url)) && (
        <h2 className="text-xl font-bold text-foreground mb-1 text-center">{title || "Meu Linktree"}</h2>
      )}
      {(description || !links.some(l => l.label && l.url)) && (
        <p className="text-sm text-muted-foreground mb-6 text-center px-4">{description || "Confira meus links importantes"}</p>
      )}
      
      <div className="w-full space-y-3">
        {links.some(link => link.label && link.url) ? (
          links.map((link, index) => (
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
          ))
        ) : (
          <div className="w-full opacity-50 space-y-3">
            <Button variant="outline" className="w-full h-14 rounded-2xl flex items-center justify-between px-6 border-dashed">
              <span className="font-semibold text-foreground">Link de Exemplo 1</span>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </Button>
            <Button variant="outline" className="w-full h-14 rounded-2xl flex items-center justify-between px-6 border-dashed">
              <span className="font-semibold text-foreground">Link de Exemplo 2</span>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        )}
      </div>
      
      <div className="mt-8 pt-4 border-t border-border w-full text-center">
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Gerado por AngoQrCode</p>
      </div>
    </div>
  );
}
