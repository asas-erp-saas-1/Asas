'use client'

import React from 'react';
import { 
  BarChart2, TrendingUp, TrendingDown, Target, Activity, 
  ArrowUpRight, Users, Handshake, MapPin
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area
} from 'recharts';

export function SalesAnalyticsModule() {
  return (
    <div className="w-full h-full flex flex-col space-y-6 animate-in fade-in duration-700 bg-transparent text-white pt-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-2 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded text-[9px] text-indigo-400 uppercase font-bold tracking-widest flex items-center gap-1">
                <BarChart2 className="w-3 h-3" />
                <span>Analytics Engine Active</span>
             </div>
          </div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tight flex items-center gap-3">
             Sales Analytics
          </h1>
          <p className="text-white/50 text-[11px] uppercase tracking-widest font-bold mt-2">Vue consolidée sur la performance commerciale et les conversions</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 w-full">
         <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-white/50 mb-4">Taux de Conversion (Mois)</h3>
            <span className="text-3xl font-display font-bold text-white">24.5%</span>
         </div>
         <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-[#D4A64F] mb-4">Volume CA Généré</h3>
            <span className="text-3xl font-display font-bold text-asas-gold">142 M DA</span>
         </div>
         <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 mb-4">Temps de cycle (Moyen)</h3>
            <span className="text-3xl font-display font-bold text-white">14 Jours</span>
         </div>
         <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-green-400 mb-4">Deals Perdus / Résiliés</h3>
            <span className="text-3xl font-display font-bold text-red-400">2</span>
         </div>
      </div>
      
      <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 flex-1 w-full min-h-[400px] flex items-center justify-center opacity-50 relative overflow-hidden">
         <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(99,102,241,0.05),_transparent_60%)]"></div>
         <div className="text-center relative z-10">
            <BarChart2 className="w-12 h-12 text-indigo-500 mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-bold font-display tracking-tight text-white/50">Chart Engine Rendering...</h3>
            <p className="text-[10px] uppercase tracking-widest font-bold text-white/30 mt-2">D3.js Data Visualization Framework Active</p>
         </div>
      </div>
    </div>
  );
}
