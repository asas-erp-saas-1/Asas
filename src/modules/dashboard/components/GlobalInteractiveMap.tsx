'use client'

import React from 'react';
import { 
  Search, Map as MapIcon, Maximize, Layers, SlidersHorizontal, Settings
} from 'lucide-react';

export function GlobalInteractiveMap() {
  return (
    <div className="w-full h-full flex flex-col space-y-6 animate-in fade-in duration-500 bg-transparent text-white pt-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/5 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2 hidden sm:flex">
            <div className="px-2 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded text-[9px] text-indigo-400 uppercase font-bold tracking-widest flex items-center gap-1">
               <MapIcon className="w-3 h-3" />
               <span>Geospatial Intelligence Active</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight flex items-center gap-3 font-display">
            Interactive Map
          </h1>
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#D4A64F] mt-2 flex items-center gap-2 hidden sm:flex">
            <span className="w-2 h-2 rounded-full bg-asas-gold animate-pulse shadow-[0_0_10px_rgba(212,166,79,0.6)]" />
            GIS System • 14 Active Coordinates
          </p>
        </div>
      </div>

      <div className="flex-1 w-full relative rounded-2xl overflow-hidden border border-white/10 bg-[#0A1829] min-h-[600px] shadow-[0_0_50px_rgba(0,0,0,0.5)]">
         {/* Minimalist Map UI Overlay */}
         
         <div className="absolute top-4 left-4 right-4 flex justify-between gap-4 z-10 pointer-events-none">
            <div className="bg-[#051121]/80 backdrop-blur-xl border border-white/10 p-2 rounded-xl flex items-center gap-2 pointer-events-auto shadow-xl">
               <Search className="w-4 h-4 text-white/40 ml-2" />
               <input type="text" placeholder="Search region or project..." className="bg-transparent border-none outline-none text-sm text-white w-64 placeholder:text-white/40" />
            </div>
            
            <div className="flex flex-col gap-2 pointer-events-auto">
               <button className="w-10 h-10 bg-[#051121]/80 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors shadow-lg">
                  <Layers className="w-4 h-4" />
               </button>
               <button className="w-10 h-10 bg-[#051121]/80 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors shadow-lg">
                  <SlidersHorizontal className="w-4 h-4" />
               </button>
            </div>
         </div>

         {/* Abstract map rendering placeholder */}
         <div className="absolute inset-0 flex items-center justify-center">
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]"></div>
            
            <div className="flex flex-col items-center gap-4 relative z-10">
               <MapIcon className="w-16 h-16 text-asas-gold/40" />
               <span className="text-sm font-bold uppercase tracking-widest text-white/40 bg-black/40 px-4 py-2 rounded-lg backdrop-blur border border-white/5">
                  Secure Mapbox Token Required
               </span>
               <p className="text-[10px] text-white/30 text-center max-w-sm leading-relaxed">
                 Configure your GIS access token in Settings to activate the real-time geospatial overlay. The data connectors are fully initialized.
               </p>
            </div>
         </div>
      </div>
    </div>
  )
}
