'use client';

import { useEffect } from 'react';
import { AlertTriangle, Home } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Root boundary caught:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] p-8 text-center bg-[#051121] text-white">
      <div className="w-16 h-16 rounded-xl bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
        <AlertTriangle className="h-8 w-8 text-red-400" strokeWidth={1.5} />
      </div>
      <h2 className="text-xl font-bold mb-2 uppercase tracking-widest text-[#D4A64F]">Rupture de Processus</h2>
      <p className="text-white/50 mb-8 max-w-md text-sm leading-relaxed border border-white/5 bg-black/40 p-4 rounded-xl shadow-inner">
        Une anomalie critique a été détectée dans l'interface de l'application. Nos terminaux en ont été informés.
        <br/><br/>
        <span className="font-mono text-[10px] text-white/30 uppercase tracking-widest">{error.message}</span>
      </p>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-6 py-3 bg-[#D4A64F] text-[#06152D] rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-[#E0B96B] transition-colors shadow-[0_0_20px_rgba(212,166,79,0.3)]"
        >
          Relancer le Module
        </button>
        <a href="/login" className="flex items-center gap-2 px-6 py-3 bg-white/5 text-white/80 border border-white/10 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 hover:text-white transition-colors">
          <Home className="h-4 w-4" />
          Portail
        </a>
      </div>
    </div>
  );
}
