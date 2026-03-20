import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

interface ImagePageProps {
  params: { data: string };
}

export default function ImagePage({ params }: ImagePageProps) {
  const [current, setCurrent] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);

  let data: any = {};
  try {
    const decoded = decodeURIComponent(params.data);
    data = JSON.parse(decoded.startsWith("{") ? decoded : decodeURIComponent(escape(atob(params.data))));
  } catch {}

  const { title, description, website, buttonLabel } = data;
  const images: string[] = data.fileUrls && data.fileUrls.length > 0
    ? data.fileUrls
    : data.fileUrl ? [data.fileUrl] : [];

  const isSingle = images.length === 1;

  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length);
  const next = () => setCurrent((c) => (c + 1) % images.length);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center">
      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-5 right-5 w-11 h-11 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/25 transition-colors z-10"
            onClick={() => setLightbox(null)}
          >
            <X className="w-5 h-5" />
          </button>

          {!isSingle && (
            <>
              <button
                className="absolute left-4 w-11 h-11 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/25 transition-colors z-10"
                onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + images.length) % images.length); }}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                className="absolute right-4 w-11 h-11 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/25 transition-colors z-10"
                onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % images.length); }}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <img
            src={images[lightbox]}
            alt={`Imagem ${lightbox + 1}`}
            className="max-h-[88vh] max-w-[92vw] object-contain select-none"
            onClick={(e) => e.stopPropagation()}
          />

          {!isSingle && (
            <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-3">
              <p className="text-white/60 text-sm font-medium">{lightbox + 1} / {images.length}</p>
              <div className="flex gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setLightbox(i); }}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === lightbox ? "bg-white scale-125" : "bg-white/35"}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="w-full max-w-md flex flex-col min-h-screen">
        {/* Image area */}
        {images.length > 0 && (
          <div className="relative w-full bg-slate-900 flex-shrink-0">
            {isSingle ? (
              <div
                className="w-full relative cursor-zoom-in group"
                onClick={() => setLightbox(0)}
              >
                <img
                  src={images[0]}
                  alt={title || "Imagem"}
                  className="w-full object-cover"
                  style={{ minHeight: "280px", maxHeight: "75vh" }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                <div className="absolute bottom-4 right-4 w-10 h-10 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-5 h-5 text-white" />
                </div>
              </div>
            ) : (
              <div className="relative overflow-hidden">
                <div
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${current * 100}%)` }}
                >
                  {images.map((src, i) => (
                    <div
                      key={i}
                      className="w-full flex-shrink-0 cursor-zoom-in"
                      onClick={() => setLightbox(i)}
                    >
                      <img
                        src={src}
                        alt={`Imagem ${i + 1}`}
                        className="w-full object-cover"
                        style={{ height: "62vw", maxHeight: "420px", minHeight: "240px" }}
                      />
                    </div>
                  ))}
                </div>

                {/* Arrows */}
                <button
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/65 transition-colors shadow-lg"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/65 transition-colors shadow-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Dots */}
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      className={`rounded-full transition-all duration-200 ${i === current ? "w-5 h-2 bg-white" : "w-2 h-2 bg-white/45 hover:bg-white/70"}`}
                    />
                  ))}
                </div>

                {/* Counter */}
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  {current + 1}/{images.length}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Thumbnail strip for multiple images */}
        {images.length > 1 && (
          <div className="flex gap-2 px-3 py-2.5 bg-slate-900 overflow-x-auto scrollbar-hide flex-shrink-0">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                  i === current
                    ? "border-white shadow-[0_0_0_1px_rgba(255,255,255,0.3)]"
                    : "border-transparent opacity-50 hover:opacity-80"
                }`}
              >
                <img src={src} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 bg-white rounded-t-3xl -mt-3 p-6 space-y-4 relative z-10 shadow-[0_-8px_30px_rgba(0,0,0,0.25)]">
          {title && (
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">{title}</h1>
          )}
          {description && (
            <p className="text-slate-500 leading-relaxed whitespace-pre-wrap text-sm">{description}</p>
          )}

          {(website || buttonLabel) && (
            <div className="pt-1">
              <Button
                asChild
                className="w-full h-12 rounded-xl text-sm font-bold shadow-md transition-all active:scale-[0.98]"
              >
                <a
                  href={website || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  {buttonLabel || "Ver mais"}
                  <ArrowRight className="w-4 h-4" />
                </a>
              </Button>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Gerado por AngoQrCode</p>
          </div>
        </div>
      </div>
    </div>
  );
}
