import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Link } from "wouter";

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
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
            onClick={() => setLightbox(null)}
          >
            <X className="w-5 h-5" />
          </button>
          {!isSingle && (
            <>
              <button
                className="absolute left-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                onClick={(e) => { e.stopPropagation(); setLightbox((lightbox - 1 + images.length) % images.length); }}
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                className="absolute right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                onClick={(e) => { e.stopPropagation(); setLightbox((lightbox + 1) % images.length); }}
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
          <img
            src={images[lightbox]}
            alt={`Imagem ${lightbox + 1}`}
            className="max-h-[85vh] max-w-full object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
          {!isSingle && (
            <p className="absolute bottom-6 text-white/60 text-sm">{lightbox + 1} / {images.length}</p>
          )}
        </div>
      )}

      <div className="w-full max-w-md flex flex-col min-h-screen">
        {/* Image area */}
        {images.length > 0 && (
          <div className="relative w-full bg-slate-900">
            {isSingle ? (
              <div
                className="w-full cursor-zoom-in"
                onClick={() => setLightbox(0)}
              >
                <img
                  src={images[0]}
                  alt={title || "Imagem"}
                  className="w-full object-cover"
                  style={{ maxHeight: "70vh" }}
                />
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
                        style={{ height: "55vw", maxHeight: "380px" }}
                      />
                    </div>
                  ))}
                </div>

                {/* Arrows */}
                <button
                  onClick={prev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/60 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Dots */}
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      className={`w-2 h-2 rounded-full transition-all ${i === current ? "bg-white scale-110" : "bg-white/40"}`}
                    />
                  ))}
                </div>

                {/* Counter */}
                <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                  {current + 1}/{images.length}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Thumbnail strip for multiple images */}
        {images.length > 1 && (
          <div className="flex gap-2 p-3 overflow-x-auto bg-slate-900 scrollbar-hide">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === current ? "border-white scale-105" : "border-transparent opacity-60 hover:opacity-100"}`}
              >
                <img src={src} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 bg-white rounded-t-3xl -mt-3 p-6 space-y-4 relative z-10">
          {title && (
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">{title}</h1>
          )}
          {description && (
            <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{description}</p>
          )}

          {(website || buttonLabel) && (
            <div className="pt-2">
              <Button
                asChild
                className="w-full h-13 rounded-xl text-base font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
              >
                <a
                  href={website || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  {buttonLabel || "Ver mais"}
                  <ArrowRight className="w-5 h-5" />
                </a>
              </Button>
            </div>
          )}

          <div className="pt-6 border-t border-slate-100 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Gerado por AngoQrCode</p>
          </div>
        </div>
      </div>
    </div>
  );
}
