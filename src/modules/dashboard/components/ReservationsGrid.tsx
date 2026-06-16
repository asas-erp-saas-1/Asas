'use client'

import React, { useState, useEffect } from 'react';
import { 
  CalendarIcon, Clock, CheckCircle2, XCircle, Search, 
  MapPin, UserSquare2, ChevronRight, Filter, ChevronDown, Loader2, Send
} from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'react-hot-toast';

const STATUS_STYLE: Record<string, string> = {
  negotiation: "bg-asas-gold/10 text-asas-gold border-asas-gold/20",
  contract_sent: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  signed: "bg-green-500/10 text-green-400 border-green-500/20",
  completed: "bg-green-600/10 text-green-500 border-green-600/20",
  cancelled: "bg-red-500/10 text-red-500 border-red-500/20",
};

export function ReservationsGrid() {
  const [reservations, setReservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchReservations = async () => {
      try {
        const res = await fetch('/api/deals?limit=50');
        const json = await res.json();
        if (json.data) {
           const filtered = json.data.filter((d: any) => d.status === 'negotiation' || d.status === 'contract_sent');
           setReservations(filtered);
        }
      } catch (err) {
        console.error('Failed to fetch reservations', err);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleSendContract = async (id: string, e: React.MouseEvent) => {
     e.stopPropagation();
     setProcessingId(id);
     try {
         const res = await fetch('/api/deals', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status: 'contract_sent' })
         });
         
         if (res.ok) {
            toast.success('Contract sent successfully! Workflow advanced.');
            await fetchReservations();
         } else {
            const data = await res.json();
            toast.error(data.error || 'Failed to advance workflow');
         }
     } catch (err) {
         toast.error('Network error');
     } finally {
         setProcessingId(null);
     }
  };

  return (
    <div className="w-full h-full flex flex-col space-y-6 bg-transparent text-white animate-in fade-in duration-500 pt-4">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-2 hidden sm:flex">
            <div className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded text-[9px] text-purple-400 uppercase font-bold tracking-widest flex items-center gap-1">
               <CalendarIcon className="w-3 h-3" />
               <span>Booking Hub Active</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight flex items-center gap-3">
             Reservations
          </h1>
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#D4A64F] mt-2 flex items-center gap-2 hidden sm:flex">
            <span className="relative flex h-2 w-2">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-asas-gold opacity-75"></span>
             <span className="relative inline-flex rounded-full h-2 w-2 bg-asas-gold"></span>
            </span>
            Inventory Engine • 42 Pending Approvals
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input type="text" placeholder="Search by ID, client, unit..." 
            className="w-full pl-11 pr-4 py-3 text-sm font-medium border border-white/10 rounded-xl bg-black/40 text-white focus:outline-none focus:border-asas-gold focus:ring-1 focus:ring-asas-gold transition-all placeholder:text-white/30 shadow-sm" />
        </div>
        <button className="flex items-center justify-center gap-2 px-4 py-2 border border-white/10 bg-[#0A1829] hover:bg-white/5 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-sm">
           <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
         {loading ? (
             <div className="col-span-full py-12 flex justify-center text-white/50">
                <Loader2 className="w-8 h-8 animate-spin" />
             </div>
         ) : reservations.length === 0 ? (
             <div className="col-span-full py-12 text-center text-white/50 text-sm">
                No pending reservations found.
             </div>
         ) : reservations.map((res: any) => (
            <div key={res.id} className="p-5 rounded-2xl bg-[#0A1829] border border-white/5 hover:border-white/10 transition-colors group cursor-pointer flex flex-col justify-between h-48 relative overflow-hidden">
               <div className="flex justify-between items-start">
                  <div>
                     <h3 className="text-sm font-bold text-white group-hover:text-asas-gold transition-colors">{res.clients?.full_name || 'Inconnu'}</h3>
                     <p className="text-[10px] text-white/50 font-mono tracking-widest uppercase mt-1">REF: {res.reference}</p>
                  </div>
                  <span className={clsx('px-2 py-1 text-[9px] font-bold uppercase tracking-widest rounded border', STATUS_STYLE[res.status] || STATUS_STYLE.negotiation)}>
                     {res.status.replace('_', ' ')}
                  </span>
               </div>

               <div className="flex gap-4 items-center">
                  <div className="flex items-center gap-2 text-xs font-bold text-white/70">
                     <MapPin className="w-4 h-4 text-white/30" />
                     {res.properties?.projects?.name || 'Projet'} — Unité {res.properties?.title || 'Unknown'}
                  </div>
               </div>

               <div className="flex justify-between items-end pt-4 border-t border-white/5">
                  <div>
                     <span className="text-[9px] uppercase tracking-widest font-bold text-white/40 block mb-1">Prix Convenu</span>
                     <span className="text-asas-gold font-mono font-bold text-sm">{Number(res.agreedPrice).toLocaleString()} DA</span>
                  </div>
                  
                  {res.status === 'negotiation' && (
                     <div className="flex gap-2">
                        <button className="p-2 border border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors" title="Reject">
                           <XCircle className="w-4 h-4" />
                        </button>
                        <button 
                             onClick={(e) => handleSendContract(res.id, e)}
                             disabled={processingId === res.id}
                             className="px-4 py-2 bg-asas-gold hover:bg-[#E0B96B] disabled:opacity-50 text-[#051121] rounded-lg font-bold text-xs uppercase tracking-widest transition-colors flex items-center gap-2">
                           {processingId === res.id ? (
                               <Loader2 className="w-4 h-4 animate-spin" />
                           ) : (
                               <Send className="w-4 h-4" />
                           )}
                           Send Contract
                        </button>
                     </div>
                  )}
                  {res.status === 'contract_sent' && (
                     <div className="flex gap-2">
                         <span className="px-4 py-2 bg-white/5 border border-white/10 text-white/50 rounded-lg font-bold text-xs uppercase tracking-widest flex items-center gap-2 cursor-wait">
                           <Clock className="w-4 h-4" />
                           Awaiting Signature
                        </span>
                     </div>
                  )}
               </div>
            </div>
         ))}
      </div>
    </div>
  )
}
