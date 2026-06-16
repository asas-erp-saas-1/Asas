'use client'

import React, { useState } from 'react';
import { 
  Grid, Building, Maximize, Filter, Home, ArrowUpRight, 
  MapPin, CheckCircle2, XCircle, RotateCcw
} from 'lucide-react';

const FLOORS = 8;
const UNITS_PER_FLOOR = 6;

const generateMatrix = () => {
   const matrix = [];
   for (let i = FLOORS; i >= 1; i--) {
     const floor = [];
     for (let j = 1; j <= UNITS_PER_FLOOR; j++) {
        const rand = Math.random();
        let status = 'available'; // 60%
        if (rand > 0.6 && rand < 0.8) status = 'reserved'; // 20%
        if (rand >= 0.8) status = 'sold'; // 20%

        floor.push({ id: `U-${i}0${j}`, number: `${i}0${j}`, floor: i, status });
     }
     matrix.push({ floor: i, units: floor });
   }
   return matrix;
};

export function AvailabilityMatrixModule() {
  const [matrix] = useState(generateMatrix());

  const getBg = (status: string) => {
     if (status === 'available') return 'bg-white/5 border-white/10 hover:border-green-500/50 hover:bg-green-500/10 text-white';
     if (status === 'reserved') return 'bg-asas-gold/10 border-asas-gold/30 hover:bg-asas-gold/20 text-asas-gold';
     if (status === 'sold') return 'bg-blue-500/10 border-blue-500/30 text-blue-400 opacity-60';
     return '';
  };

  return (
    <div className="w-full h-full flex flex-col space-y-6 animate-in fade-in duration-700 bg-transparent text-white pt-4">
      {/* 1. Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-2">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="px-2 py-1 bg-green-500/10 border border-green-500/20 rounded text-[9px] text-green-400 uppercase font-bold tracking-widest flex items-center gap-1">
                <Grid className="w-3 h-3" />
                <span>Inventory Matrix Active</span>
             </div>
          </div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tight flex items-center gap-3">
             Availability Matrix
          </h1>
          <p className="text-white/50 text-[11px] uppercase tracking-widest font-bold mt-2">Vue d'ensemble de l'inventaire et des disponibilités en temps réel</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="px-4 py-2 bg-[#0A1829] border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-colors appearance-none outline-none">
             <option>Résidence EL YASMINE</option>
             <option>Résidence BAHIA</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0A1829] border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-colors">
            <Filter className="w-4 h-4 text-white/50" /> Filters
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex gap-6 items-center p-6 rounded-2xl bg-[#0A1829] border border-white/5">
         <div className="flex items-center gap-3">
            <span className="w-3 h-3 bg-white/10 border border-white/20 rounded-full"></span>
            <span className="text-xs font-bold text-white uppercase tracking-widest">Available (24)</span>
         </div>
         <div className="flex items-center gap-3">
            <span className="w-3 h-3 bg-asas-gold/40 border border-asas-gold rounded-full shadow-[0_0_10px_rgba(212,166,79,0.5)]"></span>
            <span className="text-xs font-bold text-asas-gold uppercase tracking-widest">Reserved (12)</span>
         </div>
         <div className="flex items-center gap-3">
            <span className="w-3 h-3 bg-blue-500/40 border border-blue-500 rounded-full"></span>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Sold (12)</span>
         </div>
      </div>

      {/* Building Matrix rendering */}
      <div className="flex-1 w-full bg-[#0A1829] rounded-2xl border border-white/5 overflow-x-auto p-8 flex justify-center items-end relative min-h-[600px]">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.02),_transparent_60%)] pointer-events-none"></div>
          
          <div className="flex flex-col gap-4 relative z-10 w-full max-w-4xl">
             {matrix.map((row) => (
                <div key={row.floor} className="flex flex-col md:flex-row items-center gap-4 w-full">
                   {/* Floor Indicator */}
                   <div className="w-16 flex justify-center items-center py-2 bg-black/40 border border-white/5 rounded-lg text-[10px] uppercase font-bold tracking-widest text-[#D4A64F] shrink-0">
                      Étage {row.floor}
                   </div>
                   
                   {/* Units on Floor */}
                   <div className="flex flex-1 gap-4 w-full">
                      {row.units.map(unit => (
                         <div 
                           key={unit.id} 
                           className={`flex-1 aspect-[4/3] rounded-xl border flex flex-col justify-center items-center transition-all cursor-pointer group relative overflow-hidden ${getBg(unit.status)}`}
                         >
                            {/* Glow and decoration */}
                            {unit.status === 'reserved' && <div className="absolute inset-0 bg-asas-gold/5 blur-xl group-hover:bg-asas-gold/10 transition-colors"></div>}
                            
                            <span className="text-lg font-display font-bold relative z-10 group-hover:-translate-y-1 transition-transform">{unit.number}</span>
                            <span className="text-[8px] uppercase tracking-widest opacity-60 mt-1 relative z-10">{unit.status}</span>
                            
                            {/* Hover Action preview */}
                            <div className="absolute inset-0 bg-black/80 backdrop-blur opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 z-20">
                               <Maximize className="w-5 h-5 text-white/70" />
                               <span className="text-[8px] uppercase tracking-widest text-white/50">Details</span>
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
             ))}

             {/* Ground Floor / Foundation Decoration */}
             <div className="w-full h-8 mt-4 border-t-4 border-white/10 bg-gradient-to-b from-black/40 to-transparent rounded-t-sm flex items-start justify-center pt-2 gap-8 relative overflow-hidden">
                <div className="absolute bottom-0 w-full h-[1px] bg-asas-gold/20"></div>
                <div className="flex gap-2 items-center">
                   <Home className="w-4 h-4 text-white/20" />
                   <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Main Entrance</span>
                </div>
                <div className="flex gap-2 items-center">
                   <Building className="w-4 h-4 text-white/20" />
                   <span className="text-[10px] text-white/20 uppercase tracking-widest font-bold">Parking Level -1</span>
                </div>
             </div>
          </div>
      </div>
    </div>
  );
}
