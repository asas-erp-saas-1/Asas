'use client'

import React from 'react';
import { 
  Zap, BrainCircuit, Activity, Power, Settings
} from 'lucide-react';

export function AutomationCenterModule() {
  return (
    <div className="w-full h-full flex flex-col space-y-6 animate-in fade-in duration-700 bg-transparent text-white pt-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-2 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded text-[9px] text-yellow-400 uppercase font-bold tracking-widest flex items-center gap-1">
                <Power className="w-3 h-3" />
                <span>RPA Active</span>
             </div>
          </div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tight flex items-center gap-3">
             Automation Center
          </h1>
          <p className="text-white/50 text-[11px] uppercase tracking-widest font-bold mt-2">Gestion des automatisations de processus métier</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
         <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden group hover:bg-white/5 cursor-pointer">
            <Zap className="w-6 h-6 text-yellow-400 mb-4" />
            <h3 className="text-sm font-bold text-white mb-2">Lead Auto-Assign</h3>
            <p className="text-[10px] text-white/50">Assigns incoming leads to agents based on availability matrix.</p>
            <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
               <span className="text-[9px] font-bold uppercase tracking-widest text-green-400">Active</span>
            </div>
         </div>
         <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden group hover:bg-white/5 cursor-pointer">
            <BrainCircuit className="w-6 h-6 text-asas-gold mb-4" />
            <h3 className="text-sm font-bold text-white mb-2">Pricing AI Agent</h3>
            <p className="text-[10px] text-white/50">Adjusts unit prices dynamically once a month.</p>
            <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
               <span className="text-[9px] font-bold uppercase tracking-widest text-green-400">Active</span>
            </div>
         </div>
      </div>
    </div>
  );
}
