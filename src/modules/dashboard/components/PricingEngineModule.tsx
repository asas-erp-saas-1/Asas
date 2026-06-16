'use client'

import React, { useState } from 'react';
import { 
  Building2, BrainCircuit, Activity, Calculator, Euro, 
  ArrowUpRight, ArrowDownRight, Tag, Settings, Save, AlertCircle
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area
} from 'recharts';

const pricingCurve = [
  { p: 10, price: 120, baseline: 110 },
  { p: 20, price: 125, baseline: 110 },
  { p: 30, price: 130, baseline: 110 },
  { p: 40, price: 138, baseline: 110 },
  { p: 50, price: 145, baseline: 110 },
  { p: 60, price: 155, baseline: 110 },
  { p: 70, price: 165, baseline: 110 },
  { p: 80, price: 180, baseline: 110 },
  { p: 90, price: 195, baseline: 110 },
  { p: 100, price: 210, baseline: 110 },
];

export function PricingEngineModule() {
  const [markup, setMarkup] = useState(15);
  return (
    <div className="w-full h-full flex flex-col space-y-6 animate-in fade-in duration-700 bg-transparent text-white pt-4">
      {/* 1. Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-2 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="px-2 py-1 bg-[#D4A64F]/10 border border-[#D4A64F]/20 rounded text-[9px] text-[#D4A64F] uppercase font-bold tracking-widest flex items-center gap-1">
                <BrainCircuit className="w-3 h-3" />
                <span>Yield Management Active</span>
             </div>
          </div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tight flex items-center gap-3">
             Pricing Engine
          </h1>
          <p className="text-white/50 text-[11px] uppercase tracking-widest font-bold mt-2">Ajustement dynamique des prix au m² basé sur la vélocité des ventes</p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <select className="px-4 py-2 bg-[#0A1829] border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-colors appearance-none outline-none">
             <option>Résidence EL YASMINE</option>
             <option>Résidence BAHIA</option>
          </select>
          <button className="flex items-center gap-2 px-6 py-2 bg-asas-gold hover:bg-[#E0B96B] text-[#051121] rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(212,166,79,0.3)] hover:shadow-[0_0_20px_rgba(212,166,79,0.5)]">
            <Save className="w-4 h-4" /> Commit Yield Config
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 w-full flex-1">
         {/* Controls & Metrics */}
         <div className="md:col-span-4 flex flex-col space-y-6">
            <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden group">
               <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2 mb-4">
                 <Settings className="w-4 h-4 text-white/50" /> Dynamic Configuration
               </h3>
               
               <div className="space-y-6">
                  <div>
                     <div className="flex justify-between mb-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-white/60">Global Markup</label>
                        <span className="text-xs font-mono font-bold text-asas-gold">{markup}%</span>
                     </div>
                     <input 
                       type="range" 
                       min="-10" 
                       max="50" 
                       value={markup}
                       onChange={(e) => setMarkup(parseInt(e.target.value))}
                       className="w-full accent-asas-gold"
                     />
                  </div>
                  <div>
                     <div className="flex justify-between mb-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-white/60">Floor Premium (Per Floor)</label>
                        <span className="text-xs font-mono font-bold text-white/80">+ 2,500 DA</span>
                     </div>
                     <input type="range" className="w-full accent-blue-500" value="25" readOnly />
                  </div>
                  <div>
                     <div className="flex justify-between mb-2">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-white/60">Velocity Sensitivity</label>
                        <span className="text-xs font-mono font-bold text-white/80">Aggressive</span>
                     </div>
                     <select className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-xs text-white/80 outline-none">
                        <option>Aggressive (Update per 5% sold)</option>
                        <option>Moderate (Update per 10% sold)</option>
                        <option>Conservative (Update per 20% sold)</option>
                     </select>
                  </div>
               </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden group hover:border-[#D4A64F]/30 transition-colors">
               <h3 className="text-xs font-bold text-white/60 tracking-tight uppercase mb-4">Projected Financial Impact</h3>
               <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-end pb-2 border-b border-white/5">
                     <span className="text-[10px] text-white/40 uppercase tracking-widest">Base Revenue</span>
                     <span className="text-sm font-mono text-white/80">420.5 M DA</span>
                  </div>
                  <div className="flex justify-between items-end pb-2 border-b border-white/5">
                     <span className="text-[10px] text-white/40 uppercase tracking-widest">Yield Optimization</span>
                     <span className="text-sm font-mono text-green-400 font-bold">+ 54.2 M DA</span>
                  </div>
                  <div className="flex justify-between items-end pt-2">
                     <span className="text-xs font-bold text-asas-gold uppercase tracking-widest">Total Projected</span>
                     <span className="text-xl font-mono text-white font-bold">474.7 M DA</span>
                  </div>
               </div>
            </div>
         </div>

         {/* Pricing Curve Chart */}
         <div className="md:col-span-8 p-6 rounded-2xl bg-[#0A1829] border border-white/5 flex flex-col h-[500px]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">AI Yield Curve</h3>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Price per m² vs Percentage of Inventory Sold</p>
              </div>
              <div className="flex items-center gap-2 bg-red-500/10 px-3 py-1.5 rounded-lg border border-red-500/20">
                 <AlertCircle className="w-4 h-4 text-red-400" />
                 <span className="text-[10px] uppercase font-bold tracking-widest text-red-400">Current Velocity: +14% Target</span>
              </div>
            </div>
            
            <div className="flex-1 w-full -ml-4 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={pricingCurve}>
                  <defs>
                     <linearGradient id="colorCurve" x1="0" y1="0" x2="0" y2="1">
                       <stop offset="5%" stopColor="#D4A64F" stopOpacity={0.4}/>
                       <stop offset="95%" stopColor="#D4A64F" stopOpacity={0}/>
                     </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.02)" vertical={false} />
                  <XAxis dataKey="p" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} dy={10} tickFormatter={(v) => `${v}% Sold`} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} tickFormatter={(v) => `${v}k`} domain={['dataMin - 10', 'dataMax + 10']} />
                  <Tooltip 
                     contentStyle={{backgroundColor: '#051121', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px'}}
                     itemStyle={{fontSize: '12px'}}
                     labelStyle={{fontSize: '10px', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase'}}
                  />
                  <Area type="monotone" dataKey="baseline" name="Baseline (Cost+Margin)" stroke="#1e293b" strokeWidth={2} fillOpacity={0} />
                  <Area type="monotone" dataKey="price" name="Dynamic Price / m²" stroke="#D4A64F" strokeWidth={3} fill="url(#colorCurve)" dot={{r: 4, fill: '#D4A64F', strokeWidth: 2, stroke: '#051121'}} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
         </div>
      </div>
    </div>
  );
}
