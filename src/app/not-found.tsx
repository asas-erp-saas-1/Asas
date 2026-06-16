export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-4 bg-[#051121] text-white">
      <div className="max-w-md p-8 bg-[#0A1629] border border-white/5 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <h2 className="text-4xl font-bold mb-4 font-display text-asas-gold">404</h2>
        <p className="mb-8 text-[13px] text-white/50 leading-relaxed uppercase tracking-widest font-bold">L'entité ou la ressource que vous avez demandée n'existe pas.</p>
        <a href="/dashboard" className="inline-flex px-6 py-3 bg-asas-gold hover:bg-[#E0B96B] text-[#06152D] rounded-xl font-bold tracking-widest uppercase text-[10px] transition-all shadow-[0_0_20px_rgba(212,166,79,0.3)] transform hover:scale-[1.02] active:scale-95">
          Retour au système central
        </a>
      </div>
    </div>
  );
}
