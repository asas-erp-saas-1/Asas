'use client'

import React from 'react';
import { 
  Plus, Search, Receipt, Calculator, Banknote
} from 'lucide-react';

export function PayrollModule() {
  return (
    <div className="w-full h-full flex flex-col space-y-6 animate-in fade-in duration-500 bg-transparent text-white pt-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/5 relative z-10 w-full">
        <div>
          <div className="flex items-center gap-2 mb-2 hidden sm:flex">
            <div className="px-2 py-1 bg-violet-500/10 border border-violet-500/20 rounded text-[9px] text-violet-400 uppercase font-bold tracking-widest flex items-center gap-1">
               <Receipt className="w-3 h-3" />
               <span>Compensation & Payroll</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight flex items-center gap-3 font-display">
            Payroll Engine
          </h1>
          <p className="text-[10px] uppercase font-bold tracking-widest text-violet-400 mt-2 flex items-center gap-2 hidden sm:flex">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-[ping_2s_ease-in-out_infinite] shadow-[0_0_10px_rgba(139,92,246,0.6)]" />
            Oracle Logic GRH • Commission Automation
          </p>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-6 py-2.5 shrink-0 bg-violet-500 hover:bg-violet-400 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all active:scale-95 border border-transparent outline-none">
             <Plus className="w-4 h-4" /> Run Payroll
           </button>
        </div>
      </div>

      <div className="flex-1 w-full flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(139,92,246,0.05),_transparent_50%)]"></div>
        <div className="text-center relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 rounded-2xl bg-violet-500/10 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
            <Banknote className="w-10 h-10 text-violet-400" />
          </div>
          <h2 className="text-xl font-bold font-display text-white mb-2 tracking-tight">Compensation Automation</h2>
          <p className="text-xs font-medium text-white/50 leading-relaxed mb-8 max-w-sm">
            Agent base salaries, performance bonuses, and real estate deal commissions are automatically processed and passed to the finance engine.
          </p>
        </div>
      </div>
    </div>
  )
}
