import { Facebook, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FacebookPageProps {
  params: { data: string };
}

export default function FacebookPage({ params }: FacebookPageProps) {
  let data: any = {};
  try {
    const decoded = decodeURIComponent(params.data);
    data = JSON.parse(decoded.startsWith("{") ? decoded : decodeURIComponent(escape(atob(params.data))));
  } catch {}

  const { title, description, buttonLabel, photoUrl, url } = data;
  const facebookUrl = url ? (url.startsWith("http") ? url : `https://${url}`) : "#";

  return (
    <div className="min-h-screen bg-[#1877F2] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-[#1877F2] px-6 pt-10 pb-14 flex flex-col items-center text-center relative">
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-white rounded-t-3xl" />

          <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-[#1877F2]/30 flex items-center justify-center mb-4">
            {photoUrl ? (
              <img src={photoUrl} alt={title || "Foto"} className="w-full h-full object-cover" />
            ) : (
              <Facebook className="w-12 h-12 text-white" />
            )}
          </div>

          {title && (
            <h1 className="text-white text-xl font-bold leading-tight">{title}</h1>
          )}
        </div>

        {/* Content */}
        <div className="px-6 pt-2 pb-8 space-y-5">
          {description && (
            <p className="text-slate-500 text-sm text-center leading-relaxed">{description}</p>
          )}

          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-600 text-sm hover:bg-slate-100 transition-colors"
          >
            <Facebook className="w-4 h-4 text-[#1877F2] flex-shrink-0" />
            <span className="truncate flex-1 text-xs">{facebookUrl}</span>
            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
          </a>

          <Button
            asChild
            className="w-full min-h-12 h-auto rounded-xl text-sm font-bold bg-[#1877F2] hover:bg-[#166fe5] shadow-md transition-all active:scale-[0.98]"
          >
            <a
              href={facebookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-4 whitespace-normal text-center"
            >
              <span className="leading-snug">{buttonLabel || "Visitar Página do Facebook"}</span>
              <ArrowRight className="w-4 h-4 flex-shrink-0" />
            </a>
          </Button>

          <div className="pt-2 border-t border-slate-100 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Gerado por AngoQrCode</p>
          </div>
        </div>
      </div>
    </div>
  );
}
