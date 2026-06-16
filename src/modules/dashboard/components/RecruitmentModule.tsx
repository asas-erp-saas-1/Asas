'use client'

import React, { useState, useEffect } from 'react';
import { 
  Users, Activity, UserPlus, Briefcase, FileText, CheckCircle2, 
  Clock, XCircle, Search, Filter, Calendar, Loader2
} from 'lucide-react';
import { clsx } from 'clsx';

export function RecruitmentModule() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [stats, setStats] = useState({ openRoles: 0, activeCandidates: 0, interviews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/recruitment?limit=50');
        const json = await res.json();
        if (json.data) {
           setCandidates(json.data);
           setStats(json.stats || { openRoles: 0, activeCandidates: 0, interviews: 0 });
        }
      } catch (err) {
        console.error('Failed to fetch recruitment data', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="w-full h-full flex flex-col space-y-6 animate-in fade-in duration-700 bg-transparent text-white pt-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-2 border-b border-white/5 pb-6 px-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="px-2 py-1 bg-teal-500/10 border border-teal-500/20 rounded text-[9px] text-teal-400 uppercase font-bold tracking-widest flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                <span>Recruitment Center Active</span>
             </div>
          </div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tight flex items-center gap-3">
             Talent Acquisition
          </h1>
          <p className="text-white/50 text-[11px] uppercase tracking-widest font-bold mt-2">Gestion des recrutements, candidatures et processus d'embauche</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0A1829] border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-colors">
            <Filter className="w-4 h-4 text-white/50" /> Filter
          </button>
          <button className="flex items-center gap-2 px-5 py-2 bg-teal-500 hover:bg-teal-400 text-black rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(20,184,166,0.3)] hover:shadow-[0_0_20px_rgba(20,184,166,0.5)]">
            <UserPlus className="w-4 h-4" /> Nouvelle Offre
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-6">
         <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden group">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-white/60 mb-4">Postes Ouverts</h3>
            <span className="text-3xl font-display font-bold text-white">{loading ? '-' : stats.openRoles}</span>
         </div>
         <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden group">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-[#D4A64F] mb-4">Candidatures Actives</h3>
            <span className="text-3xl font-display font-bold text-asas-gold">{loading ? '-' : stats.activeCandidates}</span>
         </div>
         <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden group">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-teal-400 mb-4">Entretiens Prévus</h3>
            <span className="text-3xl font-display font-bold text-white">{loading ? '-' : stats.interviews}</span>
         </div>
         <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden group">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-white/60 mb-4">Délai moyen (Jours)</h3>
            <span className="text-3xl font-display font-bold text-white">18</span>
         </div>
      </div>

      <div className="flex-1 w-full bg-[#0A1829] border-t border-white/5 overflow-hidden flex flex-col p-6">
         <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-widest flex items-center justify-between">
             <span>Pipeline des Candidatures</span>
             {loading && <Loader2 className="w-4 h-4 animate-spin text-white/50" />}
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full">
            {['Nouveau', 'En entretien', 'Offre envoyée', 'Refusé'].map((columnTitle) => {
               const columnCandidates = candidates.filter(c => c.status === columnTitle);
               return (
                 <div key={columnTitle} className="flex flex-col bg-black/20 rounded-xl border border-white/5 p-4 h-full min-h-[400px]">
                    <h4 className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-4 flex justify-between">
                       {columnTitle} <span className="bg-white/10 px-2 py-0.5 rounded text-white">{columnCandidates.length}</span>
                    </h4>
                    <div className="flex flex-col gap-3 overflow-y-auto custom-scrollbar">
                       {!loading && columnCandidates.length === 0 && (
                          <div className="text-center p-4">
                             <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">Aucun candidat</span>
                          </div>
                       )}
                       {columnCandidates.map((c: any) => (
                         <div key={c.id} className="bg-[#051121] border border-white/10 p-4 rounded-lg cursor-pointer hover:border-asas-gold/30 transition-colors group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2">
                               <div className={clsx("text-[9px] font-bold font-mono px-1.5 py-0.5 rounded", c.score > 80 ? "bg-green-500/10 text-green-400" : c.score > 60 ? "bg-asas-gold/10 text-asas-gold" : "bg-red-500/10 text-red-500")}>
                                 {c.score}
                               </div>
                            </div>
                            <h5 className="text-sm font-bold text-white mb-1 drop-shadow-sm">{c.name}</h5>
                            <p className="text-[10px] text-white/60 font-medium mb-3">{c.role}</p>
                            <div className="flex items-center gap-2 text-[9px] text-white/40 font-mono uppercase tracking-widest">
                               <Calendar className="w-3 h-3" /> {c.appliedAt}
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
               )
            })}
         </div>
      </div>
    </div>
  );
}
