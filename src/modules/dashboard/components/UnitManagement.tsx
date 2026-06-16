'use client'

import React, { useState, useEffect } from 'react';
import { 
  Building2, Plus, Search, Filter, Layers, LayoutGrid, CheckSquare, Settings, Loader2
} from 'lucide-react';
import { clsx } from 'clsx';

const STATUS_STYLE: Record<string, string> = {
  sold: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  available: "bg-green-500/10 text-green-400 border-green-500/20",
  reserved: "bg-asas-gold/10 text-asas-gold border-asas-gold/20",
};

export function UnitManagement() {
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUnits() {
      try {
        const res = await fetch('/api/properties?limit=50');
        const json = await res.json();
        if (json.data) setUnits(json.data);
      } catch (err) {
        console.error('Failed to fetch units', err);
      } finally {
        setLoading(false);
      }
    }
    fetchUnits();
  }, []);

  return (
    <div className="w-full h-full flex flex-col space-y-6 animate-in fade-in duration-500 bg-transparent text-white pt-4">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/5 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2 hidden sm:flex">
            <div className="px-2 py-1 bg-green-500/10 border border-green-500/20 rounded text-[9px] text-green-400 uppercase font-bold tracking-widest flex items-center gap-1">
               <CheckSquare className="w-3 h-3" />
               <span>Inventory Control Active</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight flex items-center gap-3 font-display">
            Unit Management
          </h1>
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#D4A64F] mt-2 flex items-center gap-2 hidden sm:flex">
            <span className="w-2 h-2 rounded-full bg-asas-gold animate-pulse shadow-[0_0_10px_rgba(212,166,79,0.6)]" />
            Stock Logic • {units.length} Unités
          </p>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-6 py-2.5 shrink-0 bg-[#D4A64F] hover:bg-[#E0B96B] text-[#051121] rounded-xl text-xs font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(212,166,79,0.3)] transition-all active:scale-95 border border-transparent outline-none">
             <Settings className="w-4 h-4" /> Bulk Actions
           </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-[#0A1829] p-4 rounded-xl border border-white/5 shadow-sm">
         <div className="relative flex-1 w-full sm:w-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
            <input type="text" placeholder="Search Unit ID..." className="w-full pl-11 pr-4 py-2 bg-black/40 border border-white/5 rounded-lg focus:outline-none focus:border-asas-gold text-white text-sm transition-all" />
         </div>
      </div>

      <div className="bg-[#0A1829] rounded-2xl border border-white/5 overflow-x-auto shadow-sm">
         <table className="w-full text-left">
            <thead className="bg-[#051121] border-b border-white/5">
               <tr>
                  <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Unit Title</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Type & Area</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Location</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">List Price</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
               {loading ? (
                  <tr>
                     <td colSpan={5} className="py-8 text-center">
                        <Loader2 className="w-6 h-6 animate-spin text-white/20 mx-auto" />
                     </td>
                  </tr>
               ) : units.length === 0 ? (
                  <tr>
                     <td colSpan={5} className="py-8 text-center text-white/50 text-sm">
                        No units found in database.
                     </td>
                  </tr>
               ) : units.map((unit) => (
                  <tr key={unit.id} className="hover:bg-white/5 cursor-pointer transition-colors group">
                     <td className="px-6 py-4">
                        <div className="font-bold text-sm text-white group-hover:text-asas-gold transition-colors">{unit.title}</div>
                     </td>
                     <td className="px-6 py-4">
                        <div className="font-bold text-sm text-white/80">{unit.type || 'Standard'}</div>
                        <div className="text-[10px] font-mono text-white/50 tracking-widest mt-1">{unit.area || '--'} m²</div>
                     </td>
                     <td className="px-6 py-4 leading-none">
                        <span className={clsx('px-2 py-1 rounded text-[9px] font-bold uppercase border tracking-widest inline-block', STATUS_STYLE[unit.status] || STATUS_STYLE.available)}>
                           {unit.status}
                        </span>
                     </td>
                     <td className="px-6 py-4">
                        <div className="text-[10px] font-bold uppercase text-white/60 tracking-widest bg-white/5 px-2 py-1 rounded border border-white/10 w-max">{unit.location || 'N/A'}</div>
                     </td>
                     <td className="px-6 py-4 font-mono text-sm font-bold text-white">
                        {unit.price || 0} DZD
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>

    </div>
  )
}
