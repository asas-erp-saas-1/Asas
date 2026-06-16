'use client'

import React from 'react';
import { 
  TrendingUp, TrendingDown, Target, BrainCircuit, Activity, 
  ArrowUpRight, ArrowDownRight, RefreshCcw, Download, Calendar, Share, Plus
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  ComposedChart, Bar, Line, CartesianGrid, Legend
} from 'recharts';

const timelineData = [
  { name: 'Q1 2026', revenue: 42, target: 40, prediction: 42, cost: 28 },
  { name: 'Q2 2026', revenue: 48, target: 45, prediction: 49, cost: 31 },
  { name: 'Q3 2026', revenue: 55, target: 50, prediction: 57, cost: 35 },
  { name: 'Q4 2026', revenue: null, target: 60, prediction: 64, cost: 40 },
  { name: 'Q1 2027', revenue: null, target: 65, prediction: 69, cost: 42 },
  { name: 'Q2 2027', revenue: null, target: 70, prediction: 75, cost: 45 },
];

export function StrategicForecastingModule() {
  return (
    <div className="w-full h-full flex flex-col space-y-6 animate-in fade-in duration-700 bg-transparent text-white pt-4">
      {/* 1. Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-2">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded text-[9px] text-purple-400 uppercase font-bold tracking-widest flex items-center gap-1">
                <BrainCircuit className="w-3 h-3" />
                <span>AI Predictive Engine</span>
             </div>
          </div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tight flex items-center gap-3">
             Strategic Forecasting
          </h1>
          <p className="text-white/50 text-[11px] uppercase tracking-widest font-bold mt-2">Projection financière à 24 mois par intelligence artificielle</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0A1829] border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-colors">
            <Calendar className="w-4 h-4 text-white/50" /> 24 Months
          </button>
          <button className="flex items-center gap-2 px-5 py-2 bg-[#D4A64F] hover:bg-[#E0B96B] text-[#051121] rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(212,166,79,0.3)] hover:shadow-[0_0_20px_rgba(212,166,79,0.5)]">
            <RefreshCcw className="w-4 h-4" /> Run Simulation
          </button>
        </div>
      </div>

      {/* 2. Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden group hover:border-[#D4A64F]/30 transition-colors">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4A64F]">Projected ARR (2026)</span>
            <div className="w-8 h-8 rounded-lg bg-[#D4A64F]/10 flex items-center justify-center border border-[#D4A64F]/20">
              <TrendingUp className="w-4 h-4 text-[#D4A64F]" />
            </div>
          </div>
          <div className="relative z-10">
            <span className="text-3xl font-display font-bold text-white">284 M <span className="text-lg text-white/50">DA</span></span>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-3 h-3 text-green-400" />
              <span className="text-green-400 text-xs font-bold">+12%</span>
              <span className="text-white/40 text-[10px] uppercase tracking-widest ml-1">vs Initial Target</span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/60">AI Confidence Score</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
              <Activity className="w-4 h-4 text-indigo-400" />
            </div>
          </div>
          <div className="relative z-10">
            <span className="text-3xl font-display font-bold text-white">94<span className="text-lg text-white/50">%</span></span>
            <div className="flex items-center gap-1 mt-2">
              <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 text-[9px] rounded uppercase font-bold tracking-widest border border-indigo-500/30">Stable Market</span>
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/60">Estimated Cost Variance</span>
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
              <TrendingDown className="w-4 h-4 text-orange-400" />
            </div>
          </div>
          <div className="relative z-10">
            <span className="text-3xl font-display font-bold text-white">-4.2<span className="text-lg text-white/50">%</span></span>
            <div className="flex items-center gap-1 mt-2">
              <ArrowDownRight className="w-3 h-3 text-red-400" />
              <span className="text-red-400 text-xs font-bold">Inflation Alert</span>
              <span className="text-white/40 text-[10px] uppercase tracking-widest ml-1">in materials</span>
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/60">Next Goal</span>
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20">
              <Target className="w-4 h-4 text-green-400" />
            </div>
          </div>
          <div className="relative z-10">
            <span className="text-3xl font-display font-bold text-white">Q4 Peak</span>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-white/40 text-[10px] uppercase tracking-widest ml-1">Targeting 60M Revenue</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Main Chart */}
      <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 flex flex-col h-[500px]">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Revenue & Cost Trajectory</h3>
            <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">AI Augmented Projection Model</p>
          </div>
        </div>
        <div className="flex-1 w-full -ml-4 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={timelineData}>
              <CartesianGrid stroke="rgba(255,255,255,0.02)" vertical={false} />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} tickFormatter={(v) => `${v}M`} />
              <Tooltip 
                 contentStyle={{backgroundColor: '#051121', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px'}}
                 itemStyle={{fontSize: '12px'}}
                 labelStyle={{fontSize: '10px', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase'}}
              />
              <Legend wrapperStyle={{fontSize: '10px', textTransform: 'uppercase', color: '#64748b'}} />
              
              <Bar dataKey="cost" name="Projected Costs" fill="#1e293b" radius={[4, 4, 0, 0]} barSize={40} />
              <Bar dataKey="revenue" name="Actual Revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
              
              <Line type="monotone" dataKey="prediction" name="AI Prediction (Rev)" stroke="#D4A64F" strokeWidth={3} dot={{r: 4, fill: '#D4A64F', strokeWidth: 2, stroke: '#051121'}} />
              <Line type="monotone" dataKey="target" name="Business Target" stroke="#22c55e" strokeWidth={2} strokeDasharray="5 5" dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
