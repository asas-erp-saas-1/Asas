'use client'

import React from 'react';
import { 
  ShieldAlert, Lock, Key, Users, Server, Database, Globe,
  CheckCircle2, XCircle, AlertTriangle, Eye
} from 'lucide-react';

export function SecurityCenterModule() {
  return (
    <div className="w-full h-full flex flex-col space-y-6 animate-in fade-in duration-700 bg-transparent text-white pt-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-2 border-b border-white/5 pb-6 px-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-[9px] text-red-500 uppercase font-bold tracking-widest flex items-center gap-1">
                <ShieldAlert className="w-3 h-3" />
                <span>RBAC Engine Active</span>
             </div>
          </div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tight flex items-center gap-3">
             Security & Access
          </h1>
          <p className="text-white/50 text-[11px] uppercase tracking-widest font-bold mt-2">Contrôle d'accès basé sur les rôles, sécurité réseau et gouvernance</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-6">
         <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden group">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-[#D4A64F] mb-4">Global Security Score</h3>
            <span className="text-3xl font-display font-bold text-white">98<span className="text-lg text-white/40">/100</span></span>
         </div>
         <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden group">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-white/50 mb-4">Active Sessions</h3>
            <span className="text-3xl font-display font-bold text-white">412</span>
         </div>
         <div className="p-6 rounded-2xl bg-[#0A1829] border border-red-500/20 relative overflow-hidden group">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-red-400 mb-4">Anomalies Detected</h3>
            <span className="text-3xl font-display font-bold text-red-500">0</span>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-6 pb-6 h-[500px]">
         {/* Roles Matrix */}
         <div className="bg-[#0A1829] border border-white/5 rounded-2xl p-6 flex flex-col overflow-hidden">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6">Roles & Permissions Matrix</h3>
            <div className="flex-1 overflow-auto custom-scrollbar pr-2">
               {['Administrator', 'Executive', 'Sales Manager', 'Agent', 'Finance Lead', 'Accountant', 'Project Manager', 'Site Supervisor'].map((role, i) => (
                  <div key={role} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] px-2 rounded-lg transition-colors cursor-pointer group">
                     <span className="text-xs font-bold text-white group-hover:text-asas-gold transition-colors">{role}</span>
                     <div className="flex gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                        <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Access Logs */}
         <div className="bg-[#0A1829] border border-white/5 rounded-2xl p-6 flex flex-col overflow-hidden">
            <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-6 flex justify-between items-center">
               Access Audit Log
               <span className="text-[9px] text-[#D4A64F] border border-[#D4A64F]/30 bg-[#D4A64F]/10 px-2 py-0.5 rounded">Live</span>
            </h3>
            <div className="flex-1 overflow-auto custom-scrollbar">
               {[
                  { user: 'Karim B.', action: 'Logged In', ip: '105.100.x.x', time: 'Just now', ok: true },
                  { user: 'Sarah M.', action: 'Accessed Treasury', ip: 'Office Secure', time: '2m ago', ok: true },
                  { user: 'System', action: 'Daily Backup Run', ip: 'Internal', time: '15m ago', ok: true },
                  { user: 'Unknown', action: 'Failed Auth Attempt', ip: '185.20.x.x', time: '1h ago', ok: false },
                  { user: 'Mehdi K.', action: 'Exported Clients', ip: '105.101.x.x', time: '2h ago', ok: true },
               ].map((log, i) => (
                  <div key={i} className="flex gap-4 items-start mb-4">
                     <div className="mt-1">
                        {log.ok ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                     </div>
                     <div className="flex-1">
                        <p className="text-xs font-bold text-white"><span className="text-white/60">{log.user}</span> - {log.action}</p>
                        <p className="text-[9px] font-mono text-white/40 mt-0.5">{log.ip} • {log.time}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>

    </div>
  );
}
