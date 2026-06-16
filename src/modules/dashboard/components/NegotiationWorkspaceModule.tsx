'use client'

import React from 'react';
import { 
  Handshake, MessageSquare, FileText, CheckCircle2, Clock, 
  Target, Euro, ArrowRight, UserCircle2, ShieldCheck, Mail, Phone, Video
} from 'lucide-react';
import { clsx } from 'clsx';

export function NegotiationWorkspaceModule() {
  return (
    <div className="w-full h-full flex flex-col space-y-6 animate-in fade-in duration-700 bg-transparent text-white pt-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-2 border-b border-white/5 pb-6 px-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="px-2 py-1 bg-orange-500/10 border border-orange-500/20 rounded text-[9px] text-orange-400 uppercase font-bold tracking-widest flex items-center gap-1">
                <Handshake className="w-3 h-3" />
                <span>Deal Room Active</span>
             </div>
          </div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tight flex items-center gap-3">
             Negotiation Workspace
          </h1>
          <p className="text-white/50 text-[11px] uppercase tracking-widest font-bold mt-2">Salle de négociation virtuelle, contrats et offres commerciales</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 px-6 pb-6 h-[calc(100vh-250px)]">
         {/* Deal Context */}
         <div className="w-full lg:w-1/3 flex flex-col gap-6">
            <div className="bg-[#0A1829] border border-white/5 rounded-2xl p-6 relative overflow-hidden group">
               <h3 className="text-[10px] uppercase font-bold tracking-widest text-[#D4A64F] mb-4">Deal Context</h3>
               <div className="space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                     <span className="text-xs text-white/50">Deal Name</span>
                     <span className="text-sm font-bold text-white">Résidence BAHIA - Attique A34</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                     <span className="text-xs text-white/50">Initial Offering</span>
                     <span className="text-sm font-mono text-white">42,500,000 DA</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-white/5 relative">
                     <div className="absolute inset-y-0 left-0 w-1 bg-asas-gold rounded-full"></div>
                     <span className="text-xs text-white/50 pl-3">Current Offer</span>
                     <span className="text-lg font-mono font-bold text-asas-gold">41,200,000 DA</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                     <span className="text-xs text-white/50">Probability (AI)</span>
                     <span className="text-sm font-mono text-green-400 font-bold">84%</span>
                  </div>
               </div>
            </div>

            <div className="bg-[#0A1829] border border-white/5 rounded-2xl p-6 flex-1 flex flex-col">
               <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Client Profile</h3>
               <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-[#051121] border border-white/10 flex items-center justify-center">
                     <UserCircle2 className="w-6 h-6 text-white/40" />
                  </div>
                  <div>
                     <p className="font-bold text-white">Amine Khelil</p>
                     <p className="text-[10px] text-white/40 uppercase tracking-widest">Investisseur VIP</p>
                  </div>
               </div>
               <div className="flex gap-2 border-b border-white/5 pb-6">
                  <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center gap-2 text-white/60 transition-colors">
                     <Mail className="w-4 h-4" />
                  </button>
                  <button className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg flex items-center justify-center gap-2 text-white/60 transition-colors">
                     <Phone className="w-4 h-4" />
                  </button>
                  <button className="flex-1 py-2 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-lg flex items-center justify-center gap-2 text-blue-400 transition-colors">
                     <Video className="w-4 h-4" />
                  </button>
               </div>
            </div>
         </div>

         {/* Negotiation Thread */}
         <div className="w-full lg:w-2/3 bg-[#0A1829] border border-white/5 rounded-2xl flex flex-col overflow-hidden relative">
            <div className="p-4 border-b border-white/5 bg-[#051121] flex justify-between items-center sticky top-0 z-10">
               <h3 className="text-xs font-bold text-white uppercase tracking-widest">Negotiation Timeline</h3>
            </div>
            
            <div className="flex-1 overflow-auto custom-scrollbar p-6 flex flex-col gap-6">
               <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20">
                     <FileText className="w-3 h-3 text-white/60" />
                  </div>
                  <div className="flex-1 max-w-xl">
                     <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm p-4 text-sm text-white/80">
                        <p className="mb-3">Bonjour MR. Khelil. Suite à notre visite, voici la proposition commerciale officielle pour l'attique A34. Le prix de base est fixé à 42,500,000 DA incluant deux places de parking en sous-sol.</p>
                        <div className="p-3 bg-black/40 border border-white/10 rounded-xl flex items-center gap-3">
                           <FileText className="w-5 h-5 text-red-500" />
                           <div className="flex-1">
                              <p className="text-xs font-bold text-white">DEVIS-2026-A34.pdf</p>
                              <p className="text-[10px] text-white/40">2.4 MB</p>
                           </div>
                           <button className="text-[10px] uppercase font-bold text-[#D4A64F] tracking-widest">View</button>
                        </div>
                     </div>
                     <span className="text-[9px] text-white/30 uppercase tracking-widest mt-1 inline-block">Mardi 10:45 • Agent Commercial</span>
                  </div>
               </div>

               <div className="flex gap-4 flex-row-reverse">
                  <div className="w-8 h-8 rounded-full bg-[#051121] flex items-center justify-center shrink-0 border border-white/20">
                     <UserCircle2 className="w-4 h-4 text-white/60" />
                  </div>
                  <div className="flex-1 max-w-xl flex flex-col items-end">
                     <div className="bg-[#D4A64F]/10 border border-[#D4A64F]/20 rounded-2xl rounded-tr-sm p-4 text-sm text-white/90">
                        <p>Merci pour le retour. Je souhaite une révision à 41M DA avec l'option domotique incluse. Si c'est validé, on pourra passer à la signature immédiate semaine prochaine.</p>
                     </div>
                     <span className="text-[9px] text-white/30 uppercase tracking-widest mt-1 inline-block">Mercredi 14:20 • Client (Portail)</span>
                  </div>
               </div>

               <div className="flex items-center justify-center my-2 relative">
                  <div className="absolute w-full h-px bg-white/5"></div>
                  <span className="bg-[#051121] px-4 py-1 rounded-full border border-white/10 text-[9px] text-white/40 uppercase tracking-widest font-bold z-10">AI Negotiation Copilot Suggested Response</span>
               </div>

               <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/30">
                     <MessageSquare className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1 max-w-xl">
                     <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl rounded-tl-sm p-4 text-sm text-white/80 relative overflow-hidden group">
                        <div className="absolute top-2 right-2 text-[8px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded uppercase font-bold tracking-widest border border-blue-500/30">Auto-Generated</div>
                        <p>Le directeur commercial vient de valider une contre-offre à <strong>41,200,000 DA</strong> incluant l'installation Smart Home Level 1. Nous avons mis à jour le contrat d'engagement.</p>
                     </div>
                     <div className="flex gap-2 mt-2">
                         <button className="px-3 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-white uppercase tracking-widest font-bold hover:bg-white/10 transition-colors">Send</button>
                         <button className="px-3 py-1 bg-transparent border border-white/10 rounded text-[10px] text-white/50 uppercase tracking-widest font-bold hover:bg-white/5 transition-colors">Edit</button>
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-4 border-t border-white/5 bg-[#051121] mt-auto">
               <div className="relative">
                  <textarea 
                     placeholder="Type a message or internal note..."
                     className="w-full bg-[#0A1829] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-white/20 resize-none h-20 placeholder:text-white/20"
                  ></textarea>
                  <div className="absolute bottom-3 right-3 flex items-center gap-2">
                     <button className="p-1.5 hover:bg-white/5 rounded text-white/40 transition-colors">
                        <ShieldCheck className="w-4 h-4" />
                     </button>
                     <button className="px-4 py-1.5 bg-[#D4A64F] hover:bg-[#E0B96B] text-black font-bold uppercase tracking-widest text-[10px] rounded-lg transition-colors">
                        Send
                     </button>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
