'use client'

import React from 'react';
import { 
  Building2, TrendingUp, BarChart2, PieChart, Info, MapPin
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar } from 'recharts';

export function PropertiesAnalyticsModule() {
  return (
    <div className="w-full h-full flex flex-col space-y-6 animate-in fade-in duration-700 bg-transparent text-white pt-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-2 border-b border-white/5 pb-6 px-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="px-2 py-1 bg-sky-500/10 border border-sky-500/20 rounded text-[9px] text-sky-400 uppercase font-bold tracking-widest flex items-center gap-1">
                <BarChart2 className="w-3 h-3" />
                <span>Real Estate Intel Active</span>
             </div>
          </div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tight flex items-center gap-3">
             Properties Analytics
          </h1>
          <p className="text-white/50 text-[11px] uppercase tracking-widest font-bold mt-2">Capabilités prédictives et performances des actifs immobiliers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-6">
         <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden group">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-[#D4A64F] mb-4">Total Assets Value</h3>
            <span className="text-3xl font-display font-bold text-white">4.2 Md DA</span>
         </div>
         <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden group">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-sky-400 mb-4">M² Commercialisé</h3>
            <span className="text-3xl font-display font-bold text-white">12,450</span>
         </div>
         <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden group">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-green-400 mb-4">Average Yield</h3>
            <span className="text-3xl font-display font-bold text-green-400">8.4%</span>
         </div>
         <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden group">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-white/50 mb-4">Days on Market</h3>
            <span className="text-3xl font-display font-bold text-white">14</span>
         </div>
      </div>
      
      <div className="flex-1 w-full bg-[#0A1829] border-t border-white/5 flex items-center justify-center relative overflow-hidden min-h-[400px]">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(14,165,233,0.05),_transparent_60%)] pointer-events-none"></div>
         <div className="text-center relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-[#051121] border border-white/10 flex items-center justify-center mb-6">
               <PieChart className="w-8 h-8 text-sky-400 opacity-80" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 font-display">Analytics Grid Initializing...</h3>
            <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold max-w-sm">
               D3.js Visualization Engine Standby. Awaiting property data stream from intelligence core.
            </p>
         </div>
      </div>
    </div>
  );
}
