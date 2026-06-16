'use client'

import React from 'react';
import { 
  Building2, Server, Database, Cloud, Globe, Cpu, Clock, HardDrive, ArrowUpRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export function TenantManagementModule() {
  return (
    <div className="w-full h-full flex flex-col space-y-6 animate-in fade-in duration-700 bg-transparent text-white pt-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-2 border-b border-white/5 pb-6 px-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-[9px] text-blue-400 uppercase font-bold tracking-widest flex items-center gap-1">
                <Cloud className="w-3 h-3" />
                <span>Multi-Tenant Architecture Active</span>
             </div>
          </div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tight flex items-center gap-3">
             Tenant Management
          </h1>
          <p className="text-white/50 text-[11px] uppercase tracking-widest font-bold mt-2">Gestion des workspaces SaaS, isolation des données et ressources cloud</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-6">
         <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-[#D4A64F] mb-4">Active Tenants</h3>
            <span className="text-3xl font-display font-bold text-white">4</span>
         </div>
         <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-white/50 mb-4">Total DB Size</h3>
            <span className="text-3xl font-display font-bold text-white">12.4 GB</span>
         </div>
         <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-white/50 mb-4">API Load</h3>
            <span className="text-3xl font-display font-bold text-white">1,240 req/s</span>
         </div>
         <div className="p-6 rounded-2xl bg-[#0A1829] border border-blue-500/20 relative overflow-hidden">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-blue-400 mb-4">System Health</h3>
            <span className="text-3xl font-display font-bold text-blue-400">99.99%</span>
         </div>
      </div>

      <div className="px-6 pb-6 flex-1 w-full flex gap-6 min-h-[400px]">
         <div className="flex-1 bg-[#0A1829] border border-white/5 rounded-2xl p-6 flex flex-col">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Tenant Workspaces</h3>
            <div className="flex flex-col gap-4">
               {[
                 { name: 'ASAS Holding Corp', type: 'Enterprise', users: 145, db: '3.2 GB', limits: 'Unlimited', status: 'Healthy' },
                 { name: 'Promoteur AL RAYANE', type: 'Premium', users: 32, db: '1.4 GB', limits: '5 TB / mth', status: 'Healthy' },
                 { name: 'Constructions BAHIA', type: 'Standard', users: 15, db: '600 MB', limits: '1 TB / mth', status: 'Warning - Near Quota' },
               ].map((t, i) => (
                  <div key={i} className="p-4 border border-white/5 bg-[#051121] rounded-xl flex items-center justify-between group hover:border-[#D4A64F]/50 transition-colors cursor-pointer">
                     <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                           <Building2 className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                           <h4 className="font-bold text-white text-sm group-hover:text-asas-gold transition-colors">{t.name}</h4>
                           <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold mt-1">
                              {t.type} • {t.users} Users • {t.db}
                           </p>
                        </div>
                     </div>
                     <div className="text-right flex items-center gap-4">
                         <span className="text-[10px] font-mono text-white/30">{t.limits}</span>
                         <div className="w-24 flex items-center justify-end gap-2">
                             {t.status.includes('Warning') 
                               ? <div className="w-2 h-2 rounded-full bg-yellow-400"></div> 
                               : <div className="w-2 h-2 rounded-full bg-green-400"></div>}
                         </div>
                         <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-asas-gold transition-colors" />
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}
