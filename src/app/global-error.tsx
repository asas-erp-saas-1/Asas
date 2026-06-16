'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body className="bg-[#051121] text-white flex flex-col items-center justify-center min-h-screen p-4 font-sans text-center selection:bg-asas-gold/30 selection:text-white">
        <div className="max-w-md p-8 bg-[#0A1629] border border-red-500/20 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.1)]">
          <div className="w-16 h-16 rounded-xl bg-red-500/10 flex items-center justify-center mx-auto mb-6 border border-red-500/30 shadow-inner">
            <span className="text-red-400 font-mono text-3xl font-bold">!</span>
          </div>
          <h2 className="text-lg font-bold uppercase tracking-widest mb-4 text-[#D4A64F] drop-shadow-md">ASAS OS — Erreur Critique</h2>
          <p className="text-[13px] text-white/50 mb-6 leading-relaxed">
            L'environnement d'exécution a rencontré une anomalie système irrécupérable.
          </p>
          {error?.message && (
            <pre className="text-[10px] font-mono text-red-400 bg-black/50 p-4 rounded-xl mb-6 overflow-auto max-h-32 text-left border border-red-500/10 shadow-inner">
              {error.message}
            </pre>
          )}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => reset()}
              className="px-6 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[10px] uppercase font-bold tracking-widest rounded-xl transition-colors shadow-[0_0_15px_rgba(239,68,68,0.2)]"
            >
              Tentative de réinitialisation
            </button>
            <a
              href="/login"
              className="px-6 py-3 bg-asas-gold hover:bg-[#E0B96B] text-[#06152D] border border-transparent text-[10px] uppercase font-bold tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(212,166,79,0.3)] transform hover:scale-[1.02] active:scale-95"
            >
              Retour à la plateforme
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
