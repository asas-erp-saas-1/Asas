'use client';

import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Building2, XCircle, Clock, CheckCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface Property {
  id: string;
  reference_code: string | null;
  type: string;
  rooms: string | null;
  area_sqm: number | null;
  list_price: number;
  status: string;
  projects?: { id: string; name: string } | null;
}

const STATUS_COLORS: Record<string, string> = {
  available: 'bg-asas-emerald/80 border-asas-emerald shadow-[0_0_15px_rgba(16,185,129,0.3)]',
  reserved: 'bg-asas-gold/80 border-asas-gold shadow-[0_0_15px_rgba(212,166,79,0.3)]',
  sold: 'bg-asas-navy/80 border-asas-navy shadow-[0_0_15px_rgba(10,25,47,0.3)]',
  off_market: 'bg-asas-copper/80 border-asas-copper shadow-[0_0_15px_rgba(184,115,51,0.3)]'
};

const LEGEND = [
  { status: 'available', label: 'Disponible', color: 'bg-asas-emerald' },
  { status: 'reserved',  label: 'Réservé',    color: 'bg-asas-gold' },
  { status: 'sold',      label: 'Vendu',      color: 'bg-asas-navy' },
  { status: 'off_market',label: 'Retiré',     color: 'bg-asas-copper' },
];

export function InteractiveGridMap({ properties, onSelect }: { properties: Property[], onSelect: (id: string) => void }) {
  // Group properties into a synthetic grid view for demonstration of the "Next Level" module
  const floors = useMemo(() => {
    // Distribute into 5 fictitious floors for visualization
    const distribution: Record<string, Property[]> = {
      'RDC': [], 'Étage 1': [], 'Étage 2': [], 'Étage 3': [], 'Attique': []
    };
    const levels = ['RDC', 'Étage 1', 'Étage 2', 'Étage 3', 'Attique'];
    properties.forEach((p, i) => {
      const level = levels[i % levels.length] as string;
      if (distribution[level]) {
         distribution[level].push(p);
      }
    });
    return distribution;
  }, [properties]);

  return (
    <div className="w-full bg-[#0A1629] rounded-2xl border border-white/5 p-8 relative overflow-hidden shadow-2xl flex flex-col font-sans">
      
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-full h-[500px] bg-[radial-gradient(ellipse_at_top_right,_rgba(212,166,79,0.1),_transparent_60%)] pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none [transform:perspective(1000px)_rotateX(60deg)_translateY(-100px)_scale(2)] opacity-30"></div>

      {/* Header */}
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
        <div>
          <h2 className="text-2xl font-display text-white font-bold tracking-tight">Plan de Masse Multidimensionnel</h2>
          <p className="text-white/50 text-sm mt-1 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-asas-gold opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-asas-gold"></span>
            </span>
            Telemetry Synced Live
          </p>
        </div>
        <div className="flex gap-4 p-3 bg-white/5 rounded-xl border border-white/10 backdrop-blur-md">
          {LEGEND.map(l => (
            <div key={l.status} className="flex items-center gap-2 px-2">
              <div className={`w-3 h-3 rounded-full ${l.color} shadow-lg shadow-current`}></div>
              <span className="text-xs font-semibold text-white/70 uppercase tracking-widest">{l.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid Canvas */}
      <div className="relative z-10 flex-1 flex flex-col items-center gap-6 py-10 w-full overflow-x-auto custom-scrollbar">
         {Object.entries(floors).reverse().map(([floorName, units], floorIndex) => (
           <div key={floorName} className="flex items-center gap-8 w-max">
             {/* Floor Label */}
             <div className="w-24 text-right">
                <span className="text-lg font-display text-white/50 font-bold uppercase tracking-wider">{floorName}</span>
             </div>
             
             {/* Units Row */}
             <div className="flex gap-4 perspective-[1200px]">
               {units.map((unit, unitIdx) => (
                 <motion.div
                   key={unit.id}
                   initial={{ opacity: 0, y: 20, rotateX: 20 }}
                   animate={{ opacity: 1, y: 0, rotateX: 0 }}
                   transition={{ delay: (floorIndex * 0.1) + (unitIdx * 0.05), type: 'spring', stiffness: 200 }}
                   onClick={() => onSelect(unit.id)}
                   className={clsx(
                     'relative group cursor-pointer border rounded-2xl w-32 h-32 flex flex-col items-center justify-center transition-all duration-300 transform-gpu hover:-translate-y-4 hover:scale-105',
                     STATUS_COLORS[unit.status] || 'bg-white/5 border-white/10 text-white/50'
                   )}
                 >
                   <div className="absolute inset-0 bg-white/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   
                   {/* Reflection shine */}
                   <div className="absolute top-0 left-0 w-full h-[40%] bg-gradient-to-b from-white/20 to-transparent rounded-t-2xl pointer-events-none"></div>

                   <span className="text-2xl font-bold text-white mb-1 shadow-sm">{unit.reference_code || 'N/A'}</span>
                   <span className="text-xs font-semibold text-white/70 uppercase tracking-widest bg-black/20 px-2 py-0.5 rounded-md backdrop-blur-sm">
                     {unit.type || 'Unit'}
                   </span>
                   {unit.area_sqm && (
                     <span className="text-[10px] text-white/50 mt-2 font-mono">{unit.area_sqm} m²</span>
                   )}
                   
                   {/* Interactive Overlay Info */}
                   <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] uppercase tracking-widest font-bold py-1 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap border border-white/10 shadow-xl group-hover:-translate-y-2">
                     {new Intl.NumberFormat('fr-DZ').format(unit.list_price)} DZD
                   </div>
                 </motion.div>
               ))}
               {units.length === 0 && (
                 <div className="w-64 h-32 border-2 border-dashed border-white/10 rounded-2xl flex items-center justify-center text-white/20 text-xs font-medium uppercase tracking-widest">
                   Niveau Vide
                 </div>
               )}
             </div>
           </div>
         ))}
      </div>

    </div>
  );
}
