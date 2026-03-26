import { useEffect, useState } from "react";
import { decompressFromEncodedURIComponent as lzDecompress } from "lz-string";
import { LinkTree } from "@/components/LinkTree";

function expandCloudinaryUrl(val: string): string {
  if (!val || !val.startsWith('c:')) return val;
  return 'https://res.cloudinary.com/' + val.slice(2);
}

export default function LinksPage() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      const hash = window.location.hash.slice(1);
      if (!hash) { setError(true); return; }
      const decompressed = lzDecompress(hash);
      if (!decompressed) { setError(true); return; }
      const parsed = JSON.parse(decompressed);

      parsed.photoUrl = expandCloudinaryUrl(parsed.photoUrl || '');
      if (Array.isArray(parsed.links)) {
        parsed.links = parsed.links.map((l: any) => ({
          ...l,
          imageUrl: expandCloudinaryUrl(l.imageUrl || ''),
        }));
      }

      setData(parsed);
    } catch (e) {
      console.error("Failed to parse links data", e);
      setError(true);
    }
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 text-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Página não encontrada</h1>
          <p className="text-slate-500">O link acessado parece ser inválido ou expirado.</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center">
      <div className="w-full max-w-md min-h-screen">
        <LinkTree
          title={data.title}
          description={data.description}
          photoUrl={data.photoUrl}
          links={data.links || []}
        />
      </div>
    </div>
  );
}
