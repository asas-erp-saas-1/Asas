'use client'

import React from 'react';
import { 
  FileText, Download, Filter, Target, BrainCircuit, Activity, 
  ArrowUpRight, ArrowDownRight, Printer, Share2, Layers
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  AreaChart, Area
} from 'recharts';

const reportData = [
  { name: 'Global Health', value: 92, previous: 88 },
  { name: 'Revenue', value: 85, previous: 80 },
  { name: 'Margin', value: 78, previous: 79 },
  { name: 'Risk', value: 45, previous: 60 },
  { name: 'Market', value: 88, previous: 82 },
];

export function ExecutiveReportingModule() {
  return (
    <div className="w-full h-full flex flex-col space-y-6 animate-in fade-in duration-700 bg-transparent text-white pt-4">
      {/* 1. Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-2">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-[9px] text-red-400 uppercase font-bold tracking-widest flex items-center gap-1">
                <FileText className="w-3 h-3" />
                <span>Executive Reports Active</span>
             </div>
          </div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tight flex items-center gap-3">
             Executive Reporting
          </h1>
          <p className="text-white/50 text-[11px] uppercase tracking-widest font-bold mt-2">Génération automatisée des rapports stratégiques et synthèses pour le comité de direction</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0A1829] border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-colors">
            <Filter className="w-4 h-4 text-white/50" /> Filter Criteria
          </button>
          <button className="flex items-center gap-2 px-5 py-2 bg-asas-gold hover:bg-[#E0B96B] text-[#051121] rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(212,166,79,0.3)] hover:shadow-[0_0_20px_rgba(212,166,79,0.5)]">
            <Download className="w-4 h-4" /> Download PDF Master Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full flex-1">
         {/* Available Reports list */}
         <div className="md:col-span-4 flex flex-col space-y-4">
            <h3 className="text-sm font-bold text-white tracking-tight px-2">Generated Reports</h3>
            
            <div className="flex flex-col gap-3">
               {[
                 { title: "Monthly Board Synopsis - Q2 2026", date: "Compiled 2 hours ago", size: "2.4 MB", type: "Full Synthesis" },
                 { title: "Financial Core Metrics - May", date: "Compiled yesterday", size: "1.1 MB", type: "Financials" },
                 { title: "Global Risk Assessment", date: "Compiled 3 days ago", size: "0.8 MB", type: "Risk Management" },
                 { title: "Market Positioning Analysis", date: "Compiled last week", size: "3.2 MB", type: "AI Analysis" },
               ].map((doc, i) => (
                  <div key={i} className="p-4 rounded-xl border border-white/5 bg-[#0A1829] hover:bg-white/5 transition-colors cursor-pointer group">
                     <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                           <div className="mt-1 w-8 h-8 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center shrink-0 border border-red-500/20">
                              <FileText className="w-4 h-4" />
                           </div>
                           <div>
                              <h4 className="text-xs font-bold text-white mb-1 group-hover:text-asas-gold transition-colors">{doc.title}</h4>
                              <p className="text-[10px] text-white/50">{doc.date} • {doc.size}</p>
                           </div>
                        </div>
                     </div>
                     <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/5">
                        <span className="text-[9px] uppercase tracking-widest text-[#D4A64F]">{doc.type}</span>
                        <div className="flex gap-2">
                           <button className="text-white/40 hover:text-white transition-colors"><Printer className="w-4 h-4" /></button>
                           <button className="text-white/40 hover:text-white transition-colors"><Share2 className="w-4 h-4" /></button>
                           <button className="text-white/40 hover:text-white transition-colors"><Download className="w-4 h-4" /></button>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Report Preview */}
         <div className="md:col-span-8 p-8 rounded-2xl bg-[#0A1829] border border-white/5 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.02),_transparent_60%)]"></div>
            
            <div className="w-full max-w-2xl bg-[#051121] rounded-lg border border-white/10 shadow-2xl overflow-hidden pointer-events-none relative aspect-[1/1.4] flex flex-col">
               {/* Document Header */}
               <div className="h-32 border-b border-white/10 bg-black/40 flex flex-col justify-end p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-asas-gold/10 rounded-full blur-3xl opacity-50 transform translate-x-1/2 -translate-y-1/2"></div>
                  <h2 className="text-2xl font-bold font-display text-white relative z-10">Monthly Board Synopsis</h2>
                  <p className="text-[10px] text-white/50 uppercase tracking-widest mt-2 relative z-10 font-mono">Q2 2026 // ASAS Holding Enterprise // Confidential</p>
               </div>

               {/* Document Body (Abstract Preview) */}
               <div className="flex-1 p-8 flex flex-col gap-6 opacity-70">
                  <div className="w-full h-8 bg-white/5 rounded"></div>
                  <div className="w-3/4 h-4 bg-white/5 rounded"></div>
                  <div className="w-5/6 h-4 bg-white/5 rounded"></div>
                  
                  <div className="flex gap-4 mt-6">
                     <div className="w-1/2 h-32 bg-white/5 rounded-lg border border-white/5"></div>
                     <div className="w-1/2 h-32 bg-white/5 rounded-lg border border-white/5"></div>
                  </div>

                  <div className="w-full h-4 bg-white/5 rounded mt-6"></div>
                  <div className="w-2/3 h-4 bg-white/5 rounded"></div>
               </div>

               <div className="absolute inset-0 bg-gradient-to-t from-[#051121] via-transparent to-transparent flex items-end justify-center pb-12">
                  <span className="px-4 py-2 bg-black/80 backdrop-blur border border-white/10 rounded-lg text-sm text-[#D4A64F] font-bold shadow-xl flex items-center gap-2">
                     <Layers className="w-4 h-4" /> Live Document Preview
                  </span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
