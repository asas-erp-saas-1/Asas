'use client'

import React from 'react';
import { 
  Plus, Search, Settings, GitPullRequest
} from 'lucide-react';

export function WorkflowEngineModule() {
  return (
    <div className="w-full h-full flex flex-col space-y-6 animate-in fade-in duration-500 bg-transparent text-white pt-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/5 relative z-10 w-full">
        <div>
          <div className="flex items-center gap-2 mb-2 hidden sm:flex">
            <div className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded text-[9px] text-[#06b6d4] uppercase font-bold tracking-widest flex items-center gap-1">
               <GitPullRequest className="w-3 h-3" />
               <span>Business Process Engine</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight flex items-center gap-3 font-display">
            Workflow Engine
          </h1>
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#06b6d4] mt-2 flex items-center gap-2 hidden sm:flex">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-[ping_2s_ease-in-out_infinite] shadow-[0_0_10px_rgba(6,182,212,0.6)]" />
            BPMN Automation • Global Logic Enabled
          </p>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-6 py-2.5 shrink-0 bg-[#06b6d4] hover:bg-cyan-400 text-[#051121] rounded-xl text-xs font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all active:scale-95 border border-transparent outline-none">
             <Plus className="w-4 h-4" /> New Sequence
           </button>
        </div>
      </div>

      <div className="flex-1 w-full flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(6,182,212,0.05),_transparent_50%)]"></div>
        <div className="text-center relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(6,182,212,0.2)]">
            <Settings className="w-10 h-10 text-cyan-400" />
          </div>
          <h2 className="text-xl font-bold font-display text-white mb-2 tracking-tight">Automation Framework</h2>
          <p className="text-xs font-medium text-white/50 leading-relaxed mb-8 max-w-sm">
            Configure system-wide triggers, email sequences, multi-step transaction approvals, and inter-department orchestration visually. Data integration is initialized.
          </p>
        </div>
      </div>
    </div>
  )
}
