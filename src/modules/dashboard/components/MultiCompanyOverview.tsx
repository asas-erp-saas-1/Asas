'use client'

import React from 'react';
import { 
  Building2, Globe, TrendingUp, Users, DollarSign, Activity,
  Network, ArrowUpRight, ArrowDownRight, Layers, CreditCard
} from 'lucide-react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, 
  Bar, XAxis, YAxis
} from 'recharts';

const holdingData = [
  { name: 'Real Estate Dev', value: 45, color: '#D4A64F', revenue: '2.4B DA', growth: '+12%' },
  { name: 'Construction', value: 25, color: '#22c55e', revenue: '1.2B DA', growth: '+8%' },
  { name: 'Property Mgmt', value: 20, color: '#3b82f6', revenue: '950M DA', growth: '+15%' },
  { name: 'Investments', value: 10, color: '#8b5cf6', revenue: '450M DA', growth: '-2%' },
];

const sharedServicesData = [
  { name: 'HR Center', cost: 120, baseline: 140 },
  { name: 'IT Ops', cost: 85, baseline: 90 },
  { name: 'Finance Hub', cost: 95, baseline: 80 },
  { name: 'Marketing', cost: 60, baseline: 65 }
];

export function MultiCompanyOverview() {
  return (
    <div className="w-full h-full flex flex-col space-y-6 animate-in fade-in duration-700 bg-transparent text-white pt-4">
      
      {/* 1. Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-2">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-[9px] text-blue-400 uppercase font-bold tracking-widest flex items-center gap-1">
                <Network className="w-3 h-3" />
                <span>Multi-Entity Consolidation Active</span>
             </div>
          </div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tight flex items-center gap-3">
             ASAS Holding Structure
          </h1>
          <p className="text-white/50 text-[11px] uppercase tracking-widest font-bold mt-2">Consolidated view of all subsidiaries and shared services</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2 bg-[#D4A64F] hover:bg-[#E0B96B] text-[#051121] rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(212,166,79,0.3)] hover:shadow-[0_0_20px_rgba(212,166,79,0.5)]">
            <Globe className="w-4 h-4" /> Global Reporting
          </button>
        </div>
      </div>

      {/* 2. Top Holding KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/60">Consolidated Revenue</span>
            <DollarSign className="w-4 h-4 text-asas-gold" />
          </div>
          <span className="text-3xl font-display font-bold text-white">5.0B <span className="text-sm font-sans tracking-normal text-white/50">DA</span></span>
          <div className="flex items-center gap-1 mt-2">
            <ArrowUpRight className="w-3 h-3 text-green-400" />
            <span className="text-green-400 text-xs font-bold">+10.5%</span>
            <span className="text-white/40 text-[10px] uppercase tracking-widest ml-1">YoY Growth</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/60">Total Headcount</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-3xl font-display font-bold text-white">1,240 <span className="text-sm font-sans tracking-normal text-white/50">Employees</span></span>
          <div className="flex items-center gap-1 mt-2">
            <Layers className="w-3 h-3 text-white/40" />
            <span className="text-white/60 text-[10px] uppercase tracking-widest ml-1">Across 4 Entities</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/60">Intercompany Debt</span>
            <Activity className="w-4 h-4 text-orange-400" />
          </div>
          <span className="text-3xl font-display font-bold text-white">245M <span className="text-sm font-sans tracking-normal text-white/50">DA</span></span>
          <div className="flex items-center gap-1 mt-2">
             <span className="text-orange-400 text-xs font-bold">Needs Reconciliation</span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/60">Holding Net Margin</span>
            <TrendingUp className="w-4 h-4 text-green-400" />
          </div>
          <span className="text-3xl font-display font-bold text-white">28.4<span className="text-lg text-white/50">%</span></span>
          <div className="flex items-center gap-1 mt-2">
            <ArrowUpRight className="w-3 h-3 text-green-400" />
            <span className="text-green-400 text-xs font-bold">+1.2%</span>
            <span className="text-white/40 text-[10px] uppercase tracking-widest ml-1">vs target</span>
          </div>
        </div>
      </div>

      {/* 3. Entities Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
         {/* Entities List */}
         <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            {holdingData.map((entity, i) => (
               <div key={i} className="p-5 rounded-2xl bg-[#0A1829] border border-white/5 hover:border-white/10 transition-colors group cursor-pointer">
                  <div className="flex justify-between items-start mb-4">
                     <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                           <Building2 className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                        </div>
                        <div>
                           <h3 className="text-sm font-bold text-white">{entity.name}</h3>
                           <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Subsidiary</p>
                        </div>
                     </div>
                     <span className="px-2 py-0.5 bg-green-500/10 text-green-400 text-[10px] font-bold rounded">{entity.growth}</span>
                  </div>
                  
                  <div className="pt-4 border-t border-white/5 flex justify-between items-end">
                     <div>
                        <span className="text-[10px] text-white/50 uppercase tracking-widest mb-1 block">YTD Revenue</span>
                        <span className="text-xl font-bold font-mono text-white">{entity.revenue}</span>
                     </div>
                     <div className="text-right">
                        <span className="text-[10px] text-white/50 uppercase tracking-widest mb-1 block">Holding Share</span>
                        <span className="text-lg font-bold" style={{ color: entity.color }}>{entity.value}%</span>
                     </div>
                  </div>
               </div>
            ))}
         </div>

         {/* Distribution Chart */}
         <div className="lg:col-span-4 p-6 rounded-2xl bg-[#0A1829] border border-white/5 flex flex-col h-[320px]">
             <h3 className="text-sm font-bold text-white tracking-tight mb-2">Revenue Distribution</h3>
             <div className="flex-1 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={holdingData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} stroke="none" dataKey="value">
                      {holdingData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="mt-4 flex flex-col gap-2">
                {holdingData.map((item, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></span>
                      <span className="text-[10px] font-bold text-white/70">{item.name}</span>
                    </div>
                    <span className="text-[10px] text-white/50 font-mono">{item.value}%</span>
                  </div>
                ))}
             </div>
         </div>
      </div>

      {/* 4. Shared Services Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pb-10">
         <div className="lg:col-span-6 p-6 rounded-2xl bg-[#0A1829] border border-white/5 flex flex-col h-[360px]">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">Shared Services Costs Allocation</h3>
                <p className="text-[10px] text-white/40 uppercase tracking-widest mt-1">Actual vs Projected (M DA)</p>
              </div>
            </div>
            <div className="flex-1 -ml-4 -mb-2">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={sharedServicesData} layout="vertical" margin={{ top: 0, right: 0, bottom: 0, left: 40 }}>
                   <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} />
                   <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} />
                   <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{backgroundColor: '#051121', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px'}} />
                   <Bar dataKey="cost" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={12} name="Actual Cost" />
                   <Bar dataKey="baseline" fill="#1e293b" radius={[0, 4, 4, 0]} barSize={12} name="Baseline" />
                 </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Internal Board Notifications */}
         <div className="lg:col-span-6 p-6 rounded-2xl bg-[#0A1829] border border-white/5 flex flex-col h-[360px]">
            <h3 className="text-sm font-bold text-white tracking-tight mb-6">Executive Board Directives</h3>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
               
               <div className="p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                     <span className="px-2 py-0.5 bg-asas-gold/10 text-asas-gold text-[9px] font-bold rounded uppercase tracking-widest border border-asas-gold/20">Mandatory</span>
                     <span className="text-[9px] text-white/40">2 hours ago</span>
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1">Standardize Q3 Accounting Protocol</h4>
                  <p className="text-[10px] text-white/50 leading-relaxed">All subsidiaries must migrate to the new centralized ASAS-ERP general ledger structure by end of month.</p>
               </div>

               <div className="p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                     <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[9px] font-bold rounded uppercase tracking-widest border border-blue-500/20">Information</span>
                     <span className="text-[9px] text-white/40">Yesterday</span>
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1">New Investment Fund Securitization</h4>
                  <p className="text-[10px] text-white/50 leading-relaxed">Holding structure successfully secured 400M DA facility for upcoming coastal megaproject expansion.</p>
               </div>

               <div className="p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                     <span className="px-2 py-0.5 bg-red-500/10 text-red-500 text-[9px] font-bold rounded uppercase tracking-widest border border-red-500/20">Alert</span>
                     <span className="text-[9px] text-white/40">2 days ago</span>
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1">Audit Compliance Flag - Construction Div</h4>
                  <p className="text-[10px] text-white/50 leading-relaxed">Procurement discrepancies identified in Q2 batch 4. Mandatory external audit scheduled for next week.</p>
               </div>

            </div>
         </div>
      </div>

    </div>
  );
}
