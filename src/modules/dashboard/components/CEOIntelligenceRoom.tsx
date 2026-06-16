'use client'

import React, { useState, useEffect } from 'react';
import { 
  Building2, DollarSign, Target, TrendingUp, AlertOctagon, 
  BrainCircuit, Activity, ArrowUpRight, ArrowDownRight, 
  Map, ShieldAlert, Download, Star, ChevronDown, Crosshair, Factory, Loader2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  BarChart, Bar, LineChart, Line, ScatterChart, Scatter, ZAxis, Cell
} from 'recharts';

export function CEOIntelligenceRoom() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch('/api/metrics/ceo');
        const json = await res.json();
        if (json.data) {
           setMetrics(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch CEO metrics', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  const treasuryData = metrics?.treasuryData || [];
  const riskData = metrics?.riskData || [];
  const departmentData = metrics?.departmentData || [];
  return (
    <div className="w-full h-full flex flex-col space-y-6 animate-in fade-in duration-700 bg-transparent text-white pt-4">
      
      {/* 1. Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-2">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="px-2 py-1 bg-asas-gold/10 border border-asas-gold/20 rounded text-[9px] text-asas-gold uppercase font-bold tracking-widest flex items-center gap-1">
                <BrainCircuit className="w-3 h-3" />
                <span>Executive Intelligence AI Active</span>
             </div>
          </div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tight flex items-center gap-3">
             CEO Intelligence Room
          </h1>
          <p className="text-white/50 text-[11px] uppercase tracking-widest font-bold mt-2">Vue stratégique globale et aide à la décision</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0A1829] border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-colors">
            Q2 2026 Forecast <ChevronDown className="w-3 h-3 text-white/50" />
          </button>
          <button className="flex items-center gap-2 px-5 py-2 bg-[#22c55e] hover:bg-[#16a34a] text-[#051121] rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_20px_rgba(34,197,94,0.5)]">
            <Download className="w-4 h-4" /> Board Report
          </button>
        </div>
      </div>

      {/* 2. Top Strategic KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* KPI 1: Global Business Health */}
        <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden group hover:border-asas-gold/30 transition-colors">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#D4A64F]">Business Health Score</span>
            <div className="w-8 h-8 rounded-lg bg-[#D4A64F]/10 flex items-center justify-center border border-[#D4A64F]/20">
              <Activity className="w-4 h-4 text-[#D4A64F]" />
            </div>
          </div>
          <div className="relative z-10">
            <span className="text-4xl font-display font-bold text-white">
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : metrics?.businessHealth}<span className="text-lg text-white/50">{loading ? '' : '/100'}</span>
            </span>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-3 h-3 text-green-400" />
              <span className="text-green-400 text-xs font-bold">+2.1 pts</span>
              <span className="text-white/40 text-[10px] uppercase tracking-widest ml-1">vs target</span>
            </div>
          </div>
          <div className="h-1 bg-white/5 mt-6 rounded-full overflow-hidden">
             <div className="h-full bg-gradient-to-r from-asas-gold to-green-500 rounded-full shadow-[0_0_10px_rgba(212,166,79,0.5)]" style={{ width: `${metrics?.businessHealth || 0}%` }}></div>
          </div>
        </div>

        {/* KPI 2: Enterprise Value */}
        <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/60">Portfolio AUM</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Building2 className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div className="relative z-10">
            <span className="text-3xl font-display font-bold text-white">
               {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (metrics?.portfolioAum / 1000000).toFixed(1)} <span className="text-sm font-sans tracking-normal text-white/50">{loading ? '' : 'M DA'}</span>
            </span>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-3 h-3 text-green-400" />
              <span className="text-green-400 text-xs font-bold">+14.2%</span>
              <span className="text-white/40 text-[10px] uppercase tracking-widest ml-1">YoY Growth</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Treasury Runway */}
        <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/60">Treasury Runway</span>
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20">
              <DollarSign className="w-4 h-4 text-green-400" />
            </div>
          </div>
          <div className="relative z-10">
            <span className="text-3xl font-display font-bold text-white">
               {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : metrics?.treasuryRunway} <span className="text-sm font-sans tracking-normal text-white/50">{loading ? '' : 'Months'}</span>
            </span>
            <div className="flex items-center gap-1 mt-2">
              <ArrowUpRight className="w-3 h-3 text-green-400" />
              <span className="text-green-400 text-xs font-bold">+2 mo</span>
              <span className="text-white/40 text-[10px] uppercase tracking-widest ml-1">since last quarter</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Margin */}
        <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/60">Net Profit Margin</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <TrendingUp className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <div className="relative z-10">
            <span className="text-3xl font-display font-bold text-white">
               {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : metrics?.profitMargin}<span className="text-lg text-white/50">{loading ? '' : '%'}</span>
            </span>
            <div className="flex items-center gap-1 mt-2">
              <ArrowDownRight className="w-3 h-3 text-red-500" />
              <span className="text-red-500 text-xs font-bold">-0.8%</span>
              <span className="text-white/40 text-[10px] uppercase tracking-widest ml-1">vs target (Inflation)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Middle Core Intelligence Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Treasury Projection Area Chart */}
        <div className="lg:col-span-8 p-6 rounded-2xl bg-[#0A1829] border border-white/5 flex flex-col h-[400px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Enterprise Cash Flow Forecast (AI Model)</h3>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Projected liquidity up to Q4 2026</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-asas-gold rounded-full shadow-[0_0_5px_rgba(212,166,79,0.5)]"></span>
                <span className="text-[9px] uppercase tracking-widest font-bold text-white/50">Forecasted Liquidity</span>
              </div>
            </div>
          </div>
          <div className="flex-1 -mx-2 -mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={treasuryData}>
                <defs>
                  <linearGradient id="colorTreasury" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4A64F" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#D4A64F" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} tickFormatter={(v) => `${v}M`} />
                <Tooltip contentStyle={{backgroundColor: '#051121', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px'}} />
                <Area type="monotone" dataKey="val" stroke="#D4A64F" strokeWidth={3} fillOpacity={1} fill="url(#colorTreasury)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Recommendations Panel */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-gradient-to-b from-[#0A1829] to-[#06152D] border border-asas-gold/20 flex flex-col h-[400px] shadow-[0_0_30px_rgba(212,166,79,0.05)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-[radial-gradient(ellipse_at_top_right,_rgba(212,166,79,0.1),_transparent_70%)] pointer-events-none"></div>
          
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-asas-gold" /> AI Strategic Insights
            </h3>
            <span className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[9px] text-white/70">Real-Time</span>
          </div>
          
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2 relative z-10">
             {/* Insight 1 */}
             <div className="p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="flex items-start gap-3">
                   <div className="mt-0.5 w-6 h-6 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center shrink-0">
                      <Target className="w-3 h-3" />
                   </div>
                   <div>
                      <h4 className="text-[11px] font-bold text-white mb-1 group-hover:text-asas-gold transition-colors">Pricing Optimization Detected</h4>
                      <p className="text-[10px] text-white/60 leading-relaxed">Demand for Project Bahia increased by 14%. AI recommends adjusting pricing curve by +2.5% for remaining inventory.</p>
                      <span className="text-[9px] text-[#D4A64F] font-bold mt-2 uppercase tracking-widest block group-hover:underline">Approve Adjustment &rarr;</span>
                   </div>
                </div>
             </div>

             {/* Insight 2 */}
             <div className="p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="flex items-start gap-3">
                   <div className="mt-0.5 w-6 h-6 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                      <ShieldAlert className="w-3 h-3" />
                   </div>
                   <div>
                      <h4 className="text-[11px] font-bold text-white mb-1 group-hover:text-asas-gold transition-colors">Supply Chain Risk: Steel</h4>
                      <p className="text-[10px] text-white/60 leading-relaxed">Global commodity trackers show incoming steel shortage in Q3. Recommending advance bulk purchase.</p>
                      <span className="text-[9px] text-[#D4A64F] font-bold mt-2 uppercase tracking-widest block group-hover:underline">View Mitigation Plan &rarr;</span>
                   </div>
                </div>
             </div>

             {/* Insight 3 */}
             <div className="p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                <div className="flex items-start gap-3">
                   <div className="mt-0.5 w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                      <TrendingUp className="w-3 h-3" />
                   </div>
                   <div>
                      <h4 className="text-[11px] font-bold text-white mb-1 group-hover:text-asas-gold transition-colors">Sales Velocity Benchmark</h4>
                      <p className="text-[10px] text-white/60 leading-relaxed">Team B conversion rate is outperforming baseline by 30%. Recommending workflow replication across all branches.</p>
                      <span className="text-[9px] text-[#D4A64F] font-bold mt-2 uppercase tracking-widest block group-hover:underline">Analyze Workflow &rarr;</span>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Tactical Level */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-10">
        
        {/* Risk & Opportunity Matrix (Scatter Chart) */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-[#0A1829] border border-white/5 flex flex-col h-[360px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Risk / Impact Matrix</h3>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Probability vs Financial Impact</p>
            </div>
            <AlertOctagon className="w-5 h-5 text-white/20" />
          </div>
          <div className="flex-1 -ml-4 -mb-2 relative">
            {/* Quadrant background lines */}
            <div className="absolute inset-4 border-l border-b border-white/10" />
            <div className="absolute inset-4 flex items-center justify-center border-l border-t border-dashed border-white/5 w-1/2 h-1/2 top-0 right-0" />
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <XAxis type="number" dataKey="x" name="Probability" unit="%" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} />
                <YAxis type="number" dataKey="y" name="Impact" unit="" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} />
                <ZAxis type="number" dataKey="z" range={[100, 500]} name="Value" />
                <Tooltip cursor={{strokeDasharray: '3 3'}} contentStyle={{backgroundColor: '#051121', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '10px'}} />
                <Scatter name="Risks" data={riskData} fill="#8884d8">
                  {riskData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
             <span className="absolute bottom-6 right-6 text-[9px] uppercase tracking-widest font-bold text-red-500/50">High Risk Sector</span>
          </div>
        </div>

        {/* Departmental Performance */}
        <div className="lg:col-span-6 p-6 rounded-2xl bg-[#0A1829] border border-white/5 flex flex-col h-[360px]">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Department OKR Attainment</h3>
              <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Quarterly Objectives Progress</p>
            </div>
            <Crosshair className="w-5 h-5 text-white/20" />
          </div>
          <div className="flex-1 flex flex-col justify-center gap-6">
             {departmentData.map((dept: any, i: number) => (
               <div key={i}>
                 <div className="flex justify-between items-center mb-2">
                   <span className="text-[11px] font-bold text-white">{dept.name}</span>
                   <span className="text-[11px] text-white/70">{dept.actual}% <span className="text-white/30">/ {dept.target}%</span></span>
                 </div>
                 <div className="h-2 bg-white/5 rounded-full overflow-hidden flex">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        dept.actual >= 90 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 
                        dept.actual >= 80 ? 'bg-asas-gold shadow-[0_0_10px_rgba(212,166,79,0.5)]' : 
                        'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]'
                      }`}
                      style={{ width: `${dept.actual}%` }}
                    ></div>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>

    </div>
  );
}
