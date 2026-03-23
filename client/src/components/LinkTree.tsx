import { ExternalLink, ChevronRight } from "lucide-react";
import { SiTiktok, SiYoutube, SiInstagram, SiFacebook, SiWhatsapp } from "react-icons/si";

const SOCIAL_ICONS: Record<string, { Icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>, color: string }> = {
  instagram: { Icon: SiInstagram, color: "#E1306C" },
  tiktok:    { Icon: SiTiktok,    color: "#000000" },
  facebook:  { Icon: SiFacebook,  color: "#1877F2" },
  whatsapp:  { Icon: SiWhatsapp,  color: "#25D366" },
  youtube:   { Icon: SiYoutube,   color: "#FF0000" },
};

interface LinkTreeProps {
  title?: string;
  description?: string;
  photoUrl?: string;
  links: Array<{
    label: string;
    url: string;
    imageUrl?: string;
    socialType?: string;
  }>;
}

export function LinkTree({ title, description, photoUrl, links }: LinkTreeProps) {
  return (
    <div className="w-full min-h-full flex flex-col bg-[#F8FAF9] font-sans">
      {/* Header with Background and Profile Photo */}
      <div className="relative w-full h-40 bg-[#A8C3B8]">
        <div className="absolute -bottom-16 left-1/2 -translate-x-1/2">
          <div className="w-32 h-32 rounded-full border-[6px] border-white overflow-hidden bg-white shadow-sm">
            {photoUrl ? (
              <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-slate-200 flex items-center justify-center">
                <div className="w-16 h-16 bg-slate-300 rounded-full" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="mt-20 px-6 flex flex-col items-center text-center">
        <h2 className="text-2xl font-bold text-[#1A2B3C] mb-2">{title || "Stephanie Nichols"}</h2>
        <p className="text-[#6B7280] text-sm leading-relaxed max-w-[280px]">
          {description || "Follow all of my social media channels for travel tips and inspirational stories!"}
        </p>
      </div>

      {/* Links List */}
      <div className="mt-8 px-4 pb-12 space-y-3">
        {links.some(link => link.label && link.url) ? (
          links.map((link, index) => {
            const social = link.socialType ? SOCIAL_ICONS[link.socialType] : null;
            return link.label && link.url ? (
              <a 
                key={index}
                href={link.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-4 bg-white p-3 rounded-[24px] shadow-sm hover:shadow-md transition-shadow group border border-transparent hover:border-slate-100"
              >
                <div
                  className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center"
                  style={social ? { backgroundColor: social.color } : { backgroundColor: "#f1f5f9" }}
                >
                  {social ? (
                    <social.Icon size={22} style={{ color: "#ffffff" }} />
                  ) : link.imageUrl ? (
                    <img src={link.imageUrl} alt={link.label} className="w-full h-full object-cover" />
                  ) : (
                    <ExternalLink className="w-5 h-5 text-slate-300" />
                  )}
                </div>
                <span className="flex-1 font-semibold text-[#374151] text-sm line-clamp-2">{link.label}</span>
                <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-400" />
              </a>
            ) : null;
          })
        ) : (
          /* Empty state skeletons */
          [1, 2].map((i) => (
            <div key={i} className="flex items-center gap-4 bg-white/60 p-3 rounded-[24px] border border-dashed border-slate-200">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex-shrink-0" />
              <div className="flex-1 h-4 bg-slate-100 rounded-full w-2/3" />
              <ChevronRight className="w-5 h-5 text-slate-200" />
            </div>
          ))
        )}
      </div>

      <div className="mt-auto py-6 flex flex-col items-center">
        <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Gerado por AngoQrCode</span>
      </div>
    </div>
  );
}
