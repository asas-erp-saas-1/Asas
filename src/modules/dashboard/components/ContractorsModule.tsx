'use client'

import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, HardHat, Factory, Users, Hammer, ShieldCheck, Star, Loader2, Mail, Phone
} from 'lucide-react';
import { clsx } from 'clsx';

const STATUS_STYLE: Record<string, string> = {
  active: "bg-green-500/10 text-green-400 border-green-500/20",
  inactive: "bg-white/5 text-white/50 border-white/10",
  blacklisted: "bg-red-500/10 text-red-500 border-red-500/20",
};

export function ContractorsModule() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVendors() {
      try {
        const res = await fetch('/api/vendors?limit=50');
        const json = await res.json();
        if (json.data) {
           setVendors(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch vendors', err);
      } finally {
        setLoading(false);
      }
    }
    fetchVendors();
  }, []);

  return (
    <div className="w-full h-full flex flex-col space-y-6 animate-in fade-in duration-500 bg-transparent text-white pt-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/5 relative z-10 w-full">
        <div>
          <div className="flex items-center gap-2 mb-2 hidden sm:flex">
            <div className="px-2 py-1 bg-orange-500/10 border border-orange-500/20 rounded text-[9px] text-[#F97316] uppercase font-bold tracking-widest flex items-center gap-1">
               <Factory className="w-3 h-3" />
               <span>Procurement & Contractors</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight flex items-center gap-3 font-display">
            Contractor Network
          </h1>
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#F97316] mt-2 flex items-center gap-2 hidden sm:flex">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-[ping_2s_ease-in-out_infinite] shadow-[0_0_10px_rgba(249,115,22,0.6)]" />
            Vendor Engine • {vendors.length} Partenaires Actifs
          </p>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 px-6 py-2.5 shrink-0 bg-[#F97316] hover:bg-[#FB923C] text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all active:scale-95 border border-transparent outline-none">
             <Plus className="w-4 h-4" /> Add Vendor
           </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
           <input type="text" placeholder="Search vendors by name, specialty..." 
              className="w-full pl-11 pr-4 py-3 text-sm font-medium border border-white/10 rounded-xl bg-black/40 text-white focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-white/30 shadow-sm" />
        </div>
      </div>

        <div className="w-full overflow-hidden border border-white/5 rounded-2xl bg-[#051121] shadow-sm flex-1 flex flex-col">
          <div className="overflow-x-auto flex-1 custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#0A1829] border-b border-white/5 sticky top-0 z-10">
                 <tr>
                    <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Vendor Name</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Type & Specialty</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Contact Info</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Rating</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">Status</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                 {loading ? (
                    <tr>
                       <td colSpan={5} className="py-8 text-center">
                          <Loader2 className="w-6 h-6 animate-spin text-white/20 mx-auto" />
                       </td>
                    </tr>
                 ) : vendors.length === 0 ? (
                    <tr>
                       <td colSpan={5} className="py-8 text-center text-white/50 text-sm">
                          No vendors found in network.
                       </td>
                    </tr>
                 ) : vendors.map((vendor) => (
                    <tr key={vendor.id} className="hover:bg-white/5 transition-colors group cursor-pointer">
                       <td className="px-6 py-4">
                          <div className="font-bold text-sm text-white group-hover:text-orange-400 transition-colors drop-shadow-sm">{vendor.name}</div>
                          <div className="text-[10px] uppercase tracking-widest font-bold text-white/40 mt-1">ID: {vendor.id}</div>
                       </td>
                       <td className="px-6 py-4">
                          <div className="text-sm font-bold text-white/80 flex items-center gap-2">
                             {vendor.type === 'contractor' ? <HardHat className="w-4 h-4 text-orange-400" /> : <Hammer className="w-4 h-4 text-blue-400" />}
                             <span className="capitalize">{vendor.type}</span>
                          </div>
                          <div className="text-[10px] uppercase font-bold text-white/50 tracking-widest mt-1.5">{vendor.specialty || 'General'}</div>
                       </td>
                       <td className="px-6 py-4">
                          <div className="flex flex-col gap-1.5">
                             {vendor.contactEmail ? (
                                <div className="flex items-center gap-2 text-[11px] text-white/60">
                                   <Mail className="w-3 h-3" /> {vendor.contactEmail}
                                </div>
                             ) : (
                                <span className="text-[11px] text-white/30 hidden">No email</span>
                             )}
                             {vendor.contactPhone && (
                                <div className="flex items-center gap-2 text-[11px] text-white/60 font-mono">
                                   <Phone className="w-3 h-3" /> {vendor.contactPhone}
                                </div>
                             )}
                          </div>
                       </td>
                       <td className="px-6 py-4 leading-none">
                          <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1.5 rounded-full w-max border border-white/10">
                             <Star className="w-3 h-3 text-asas-gold fill-current drop-shadow-md" />
                             <span className="font-mono text-xs font-bold text-white drop-shadow-sm">{Number(vendor.rating || 0).toFixed(1)}</span>
                          </div>
                       </td>
                       <td className="px-6 py-4">
                          <span className={clsx('px-2.5 py-1 rounded text-[9px] font-bold uppercase border tracking-widest inline-block shadow-sm', STATUS_STYLE[vendor.status] || STATUS_STYLE.inactive)}>
                             {vendor.status}
                          </span>
                       </td>
                    </tr>
                 ))}
              </tbody>
            </table>
          </div>
        </div>
    </div>
  )
}
