import { ArrowRight, ExternalLink } from "lucide-react";
import { SiInstagram } from "react-icons/si";
import { Button } from "@/components/ui/button";

interface InstagramPageProps {
  params: { data: string };
}

export default function InstagramPage({ params }: InstagramPageProps) {
  let data: any = {};
  try {
    const decoded = decodeURIComponent(params.data);
    data = JSON.parse(decoded.startsWith("{") ? decoded : decodeURIComponent(escape(atob(params.data))));
  } catch {}

  const { title, description, buttonLabel, photoUrl, url } = data;
  const instagramUrl = url ? (url.startsWith("http") ? url : `https://${url}`) : "#";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)" }}>
      <div className="w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 pt-10 pb-14 flex flex-col items-center text-center relative"
          style={{ background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)" }}>
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-white rounded-t-3xl" />

          <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white/20 flex items-center justify-center mb-4">
            {photoUrl ? (
              <img src={photoUrl} alt={title || "Foto"} className="w-full h-full object-cover" />
            ) : (
              <SiInstagram className="w-12 h-12 text-white" />
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
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 hover:bg-slate-100 transition-colors"
          >
            <SiInstagram className="w-4 h-4 flex-shrink-0" style={{ color: "#E1306C" }} />
            <span className="truncate flex-1 text-xs text-slate-600">{instagramUrl}</span>
            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 opacity-50" />
          </a>

          <Button
            asChild
            className="w-full min-h-12 h-auto rounded-xl text-sm font-bold shadow-md transition-all active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)" }}
          >
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-3 px-4 whitespace-normal text-center"
            >
              <span className="leading-snug">{buttonLabel || "Visitar Perfil do Instagram"}</span>
              <ArrowRight className="w-4 h-4 flex-shrink-0" />
            </a>
          </Button>

          <div className="pt-2 border-t border-slate-100 text-center">
            <a href="https://angoqurcode.ao" target="_blank" rel="noopener noreferrer" className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold" style={{cursor:"pointer"}}>Gerado por AngoQrCode</a>
          </div>
        </div>
      </div>
    </div>
  );
}
