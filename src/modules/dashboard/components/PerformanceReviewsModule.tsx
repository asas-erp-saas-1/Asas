'use client'

import React from 'react';
import { 
  Users, Briefcase, FileText, Activity, TrendingUp, TrendingDown,
  Star, MessageSquare, Target, Calendar
} from 'lucide-react';

export function PerformanceReviewsModule() {
  return (
    <div className="w-full h-full flex flex-col space-y-6 animate-in fade-in duration-700 bg-transparent text-white pt-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-2 border-b border-white/5 pb-6 px-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="px-2 py-1 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded text-[9px] text-fuchsia-400 uppercase font-bold tracking-widest flex items-center gap-1">
                <Star className="w-3 h-3" />
                <span>Performance & OKR Active</span>
             </div>
          </div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tight flex items-center gap-3">
             Performance Reviews
          </h1>
          <p className="text-white/50 text-[11px] uppercase tracking-widest font-bold mt-2">Évaluation continue, OKRs et développement des talents</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2 bg-asas-gold hover:bg-[#E0B96B] text-[#051121] rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(212,166,79,0.3)] hover:shadow-[0_0_20px_rgba(212,166,79,0.5)]">
            <Target className="w-4 h-4" /> Démarrer un cycle
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-6">
         <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden group">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-[#D4A64F] mb-4">Moyenne Globale</h3>
            <span className="text-3xl font-display font-bold text-white">4.2<span className="text-lg text-white/50">/5</span></span>
         </div>
         <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden group">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-fuchsia-400 mb-4">Évaluations en cours</h3>
            <span className="text-3xl font-display font-bold text-white">14</span>
         </div>
         <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden group">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-green-400 mb-4">Objectifs Atteints (Q2)</h3>
            <span className="text-3xl font-display font-bold text-green-400">78%</span>
         </div>
      </div>
      
      <div className="flex-1 w-full flex gap-6 px-6 pb-6">
         <div className="flex-1 bg-[#0A1829] rounded-2xl border border-white/5 flex flex-col p-6">
            <h3 className="text-sm font-bold text-white tracking-tight mb-6">Campagne d'évaluation Q2 2026</h3>
            <div className="flex flex-col gap-3">
               {[
                 { name: 'Mehdi Khaled', role: 'Agent Commercial', score: 4.8, progress: 100, status: 'Completed' },
                 { name: 'Sarah Mebarki', role: 'Ingénieur Structure', score: 4.5, progress: 100, status: 'Completed' },
                 { name: 'Karim Benali', role: 'Architecte Senior', score: null, progress: 40, status: 'In Progress' },
               ].map((evalItem, i) => (
                  <div key={i} className="flex flex-col md:flex-row md:items-center gap-4 p-4 border border-white/5 bg-[#051121] rounded-xl hover:border-white/10 transition-colors">
                     <div className="flex-1">
                        <p className="text-sm font-bold text-white mb-1">{evalItem.name}</p>
                        <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">{evalItem.role}</p>
                     </div>
                     <div className="w-1/3">
                        <div className="flex justify-between items-center mb-1">
                           <span className="text-[9px] uppercase font-bold tracking-widest text-white/40">{evalItem.status}</span>
                           <span className="text-[9px] font-mono text-white/60">{evalItem.progress}%</span>
                        </div>
                        <div className="w-full h-1 bg-white/5 rounded overflow-hidden">
                           <div className="h-full bg-fuchsia-400 rounded" style={{ width: `${evalItem.progress}%` }}></div>
                        </div>
                     </div>
                     <div className="w-24 text-right">
                        {evalItem.score ? 
                           <span className="text-lg font-bold text-[#D4A64F]">{evalItem.score}</span> :
                           <span className="text-xs text-white/20 italic">Pending</span>
                        }
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
