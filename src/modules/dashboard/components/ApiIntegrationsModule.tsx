'use client'

import React from 'react';
import { 
  Puzzle, Code, Key, Webhook, Activity, Zap, Server
} from 'lucide-react';
import { clsx } from 'clsx';

const INTEGRATIONS = [
  { id: '1', name: 'HubSpot CRM', status: 'Connected', type: 'CRM', ping: '12ms' },
  { id: '2', name: 'WhatsApp Business API', status: 'Connected', type: 'Communication', ping: '45ms' },
  { id: '3', name: 'Stripe', status: 'Disconnected', type: 'Payments', ping: '--' },
  { id: '4', name: 'Autodesk BIM 360', status: 'Connected', type: 'Construction', ping: '110ms' },
  { id: '5', name: 'Google Workspace', status: 'Connected', type: 'Productivity', ping: '18ms' },
];

export function ApiIntegrationsModule() {
  return (
    <div className="w-full h-full flex flex-col space-y-6 animate-in fade-in duration-700 bg-transparent text-white pt-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-2 border-b border-white/5 pb-6 px-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded text-[9px] text-purple-400 uppercase font-bold tracking-widest flex items-center gap-1">
                <Webhook className="w-3 h-3" />
                <span>Webhooks & API Active</span>
             </div>
          </div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tight flex items-center gap-3">
             API & Integrations
          </h1>
          <p className="text-white/50 text-[11px] uppercase tracking-widest font-bold mt-2">Gestion des clés API, Webhooks et applications tierces connectées</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2 bg-asas-gold hover:bg-[#E0B96B] text-[#051121] rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(212,166,79,0.3)]">
            <Key className="w-4 h-4" /> Generate API Key
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-6 pb-6">
         {INTEGRATIONS.map(int => (
            <div key={int.id} className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors">
               <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                     <Puzzle className="w-6 h-6 text-white/60 group-hover:text-white transition-colors" />
                  </div>
                  <div className={clsx(
                     "px-2 py-1 rounded text-[9px] uppercase font-bold tracking-widest border",
                     int.status === 'Connected' ? "bg-green-500/10 border-green-500/20 text-green-400" : "bg-white/5 border-white/10 text-white/40"
                  )}>
                     {int.status}
                  </div>
               </div>
               <h3 className="text-lg font-bold text-white mb-2">{int.name}</h3>
               <p className="text-[10px] text-white/50 uppercase tracking-widest font-bold mb-6">{int.type}</p>
               
               <div className="flex justify-between items-center border-t border-white/5 pt-4">
                  <div className="flex items-center gap-2 text-white/40 text-[10px] font-mono">
                     <Activity className="w-3 h-3" />
                     Ping: <span className={int.status === 'Connected' ? "text-green-400" : ""}>{int.ping}</span>
                  </div>
                  <button className="text-[10px] uppercase font-bold text-[#D4A64F] hover:text-[#E0B96B] tracking-widest">
                     Configure
                  </button>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}
