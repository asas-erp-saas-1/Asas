'use client'

import React from 'react';
import { 
  Building2, Euro, Activity, FileText, Download, Users, Briefcase
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area
} from 'recharts';

export function InvestorReportingModule() {
  return (
    <div className="w-full h-full flex flex-col space-y-6 animate-in fade-in duration-700 bg-transparent text-white pt-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-2 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="px-2 py-1 bg-[#D4A64F]/10 border border-[#D4A64F]/20 rounded text-[9px] text-[#D4A64F] uppercase font-bold tracking-widest flex items-center gap-1">
                <Briefcase className="w-3 h-3" />
                <span>Investor Relations Active</span>
             </div>
          </div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tight flex items-center gap-3">
             Investor Reporting
          </h1>
          <p className="text-white/50 text-[11px] uppercase tracking-widest font-bold mt-2">Distribution des dividendes et rapports aux actionnaires</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-6 py-2 bg-asas-gold hover:bg-[#E0B96B] text-[#051121] rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(212,166,79,0.3)]">
            <Download className="w-4 h-4" /> Download Q2 Pack
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
         <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden group">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-[#D4A64F] mb-4">Total AUM</h3>
            <span className="text-3xl font-display font-bold text-white">4.2 B DA</span>
         </div>
         <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden group">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-[#D4A64F] mb-4">Dividend Yield</h3>
            <span className="text-3xl font-display font-bold text-white">8.4%</span>
         </div>
         <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden group">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-[#D4A64F] mb-4">Active Investors</h3>
            <span className="text-3xl font-display font-bold text-white">12</span>
         </div>
      </div>
      
      <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 flex-1 relative min-h-[400px]">
         <div className="absolute inset-0 flex items-center justify-center opacity-30 pointer-events-none">
            <span className="text-xl font-bold uppercase tracking-widest text-white/20">Investor data locked via RBAC</span>
         </div>
      </div>
    </div>
  );
}
