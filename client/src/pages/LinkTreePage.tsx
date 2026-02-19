import { LinkTree } from "@/components/LinkTree";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import type { LinkTreeData } from "@shared/schema";

export default function LinkTreePage() {
  const [location] = useLocation();
  const [data, setData] = useState<LinkTreeData | null>(null);

  useEffect(() => {
    try {
      // The data is encoded in the hash as base64
      const hash = window.location.hash.slice(1);
      if (hash) {
        const decoded = JSON.parse(atob(hash));
        setData(decoded);
      }
    } catch (e) {
      console.error("Failed to parse linktree data", e);
    }
  }, []);

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Página não encontrada</h1>
          <p className="text-slate-500">O link acessado parece ser inválido.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4">
      <LinkTree 
        title={data.title} 
        description={data.description} 
        links={data.links} 
      />
    </div>
  );
}
