'use client'

import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Download, Activity, ShieldAlert,
  Terminal, Database, Users, Server, Eye, FileText, Loader2, User
} from 'lucide-react';
import { clsx } from 'clsx';

export function AuditLogsModule() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch('/api/system/audit?limit=100');
        const json = await res.json();
        if (json.data) {
           setLogs(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch audit logs', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  return (
    <div className="w-full h-full flex flex-col space-y-6 animate-in fade-in duration-700 bg-transparent text-white pt-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-2 border-b border-white/5 pb-6 px-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="px-2 py-1 bg-gray-500/10 border border-gray-500/20 rounded text-[9px] text-gray-400 uppercase font-bold tracking-widest flex items-center gap-1">
                <Terminal className="w-3 h-3" />
                <span>System Auditing Active</span>
             </div>
          </div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tight flex items-center gap-3">
             Audit & Compliance
          </h1>
          <p className="text-white/50 text-[11px] uppercase tracking-widest font-bold mt-2">Traçabilité système, logs d'activité et requêtes sécurisées</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input 
              type="text" 
              placeholder="Query Logs..." 
              className="pl-10 pr-4 py-2 bg-[#0A1829] border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-white/30 w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0A1829] border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-colors">
            <Filter className="w-4 h-4 text-white/50" /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-asas-gold hover:bg-[#E0B96B] text-[#051121] rounded-xl text-xs font-bold uppercase tracking-widest transition-colors">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      <div className="flex-1 w-full bg-[#0A1829] border-t border-white/5 flex flex-col font-mono text-sm overflow-hidden mt-6">
         <div className="flex items-center justify-between px-6 py-3 border-b border-white/5 bg-[#051121] text-xs text-white/50 uppercase tracking-widest font-bold">
            <div className="w-48">Timestamp</div>
            <div className="w-64">Actor</div>
            <div className="w-32">Action</div>
            <div className="w-32">Entity Type</div>
            <div className="flex-1">Entity ID</div>
         </div>
         
         <div className="flex-1 overflow-auto custom-scrollbar px-6 py-2">
            {loading ? (
                <div className="flex justify-center items-center py-12">
                   <Loader2 className="w-8 h-8 animate-spin text-white/50" />
                </div>
            ) : logs.length === 0 ? (
                <div className="text-center py-12 text-white/50">No logs found for this tenant.</div>
            ) : logs.map((log) => (
               <div key={log.id} className="flex items-start py-3 border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors gap-4">
                  <div className="w-48 text-white/40">{new Date(log.createdAt).toLocaleString()}</div>
                  <div className="w-64 text-white flex items-center gap-2">
                     <span className="w-4 h-4 rounded-full bg-blue-500/20 flex items-center justify-center"><User className="w-2 h-2 text-blue-400"/></span>
                     {log.user?.email || 'System'}
                  </div>
                  <div className="w-32">
                     <span className={clsx(
                        "px-2 py-0.5 rounded text-[10px] uppercase font-bold",
                        log.action.includes('CREATE') ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                        log.action.includes('LIST') ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                        log.action.includes('VIEW') ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" :
                        "bg-asas-gold/10 text-asas-gold border border-asas-gold/20"
                     )}>
                        {log.action}
                     </span>
                  </div>
                  <div className="w-32 text-white/60">{log.entityType}</div>
                  <div className="flex-1 text-white/60 truncate">{log.entityId}</div>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}
