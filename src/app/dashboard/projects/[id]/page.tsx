'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Building2, ArrowLeft, Home, BadgePercent, CheckCircle2, ShieldCheck, FileCheck, Layers, Map } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { clsx } from 'clsx'
import type { Property } from '@/types/app'
import { ConstructionEngine } from '../ConstructionEngine'

export default function ProjectDetail() {
  const params = useParams()
  const id = params?.id as string
  const [project, setProject] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [workspaceTab, setWorkspaceTab] = useState<'commercial' | 'construction'>('commercial')

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects?id=${id}`)
      if (res.ok) {
        setProject(await res.json())
      }
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    load()
  }, [load])

  if (loading) return <div className="p-8 text-center text-asas-silver animate-pulse">Chargement du programme...</div>
  if (!project) return <div className="p-8 text-center text-red-500">Programme introuvable</div>

  const properties: Property[] = project.properties || []
  const sold = properties.filter(p => p.status === 'sold')
  const reserved = properties.filter(p => p.status === 'reserved')
  const available = properties.filter(p => p.status === 'available')
  
  const totalValue = properties.reduce((acc, p) => acc + (p.list_price || 0), 0)
  const securedValue = [...sold, ...reserved].reduce((acc, p) => acc + (p.list_price || 0), 0)

  // Group by type
  const byType = properties.reduce((acc, p) => {
    acc[p.type] = (acc[p.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="w-full relative pb-12 max-w-7xl mx-auto">
      {/* Decorative Blur */}
      <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-[radial-gradient(ellipse_at_top_right,_rgba(212,166,79,0.1),_transparent_70%)] pointer-events-none" />

      <Link href="/dashboard/projects" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/50 hover:text-asas-gold mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Programmes
      </Link>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative z-10">
        <div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight flex items-center gap-4 font-display">
            <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center p-3 shadow-inner backdrop-blur-md">
              <Building2 className="h-7 w-7 text-asas-gold" strokeWidth={1.5} />
            </div>
            {project.name}
          </h1>
          <p className="text-sm font-bold text-white/50 uppercase tracking-widest pl-1 mt-3 flex items-center gap-3">
             <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
             {project.city || 'Localisation non définie'} • {project.status === 'active' ? 'En Commercialisation' : project.status}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
          <Link href={`/dashboard/projects/${id}/canvas`} className="flex items-center justify-center gap-2 px-5 py-3 bg-asas-gold hover:bg-[#E0B96B] text-[#06152D] font-black text-sm rounded-xl transition-all shadow-[0_0_20px_rgba(212,166,79,0.3)] hover:-translate-y-0.5 active:translate-y-0 text-center uppercase tracking-widest">
             <Map className="w-4 h-4" /> Plan Interactif
          </Link>
          <div className="flex bg-[#0A1829]/60 backdrop-blur-md border border-white/5 rounded-2xl p-4 gap-6 shadow-xl">
             <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-white/40 mb-1">Chiffre d'Affaires Projeté</p>
                <p className="text-xl font-black text-white">{(totalValue / 1_000_000).toFixed(1)}M DZD</p>
             </div>
             <div className="w-px bg-white/10" />
             <div>
                <p className="text-[10px] uppercase tracking-widest font-bold text-green-400 mb-1">CA Sécurisé</p>
                <p className="text-xl font-black text-green-400">{(securedValue / 1_000_000).toFixed(1)}M DZD</p>
             </div>
          </div>
        </div>
      </div>

      {/* Operating Workspace Tab Selection */}
      <div className="flex bg-black/20 p-1.5 rounded-2xl gap-2 w-full max-w-lg mb-8 relative z-10 border border-white/5">
         <button 
           onClick={() => setWorkspaceTab('commercial')} 
           className={clsx(
             "flex-1 py-3 px-4 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-xl transition-all", 
             workspaceTab === 'commercial' 
               ? "bg-white/10 text-asas-gold shadow-md border border-white/10 backdrop-blur-md" 
               : "text-white/40 hover:text-white"
           )}
         >
           Grille Commerciale
         </button>
         <button 
           onClick={() => setWorkspaceTab('construction')} 
           className={clsx(
             "flex-1 py-3 px-4 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-xl transition-all", 
             workspaceTab === 'construction' 
               ? "bg-white/10 text-asas-gold shadow-md border border-white/10 backdrop-blur-md" 
               : "text-white/40 hover:text-white"
           )}
         >
           Suivi Chantier
         </button>
      </div>

      {workspaceTab === 'commercial' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10">
          
          {/* Lots Status Grid */}
          <div className="lg:col-span-2 space-y-6">
             <div className="bg-[#051121] rounded-[2rem] border border-white/5 shadow-2xl p-8">
               <div className="flex items-center justify-between mb-8">
                 <h2 className="text-xl font-extrabold text-white flex items-center gap-3">
                   <Layers className="w-6 h-6 text-asas-gold" /> État des Lots (Grille Comm.)
                 </h2>
                 <div className="flex gap-4">
                   <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" /><span className="text-[10px] uppercase tracking-widest font-bold text-white/50">Vendu</span></div>
                   <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-asas-gold/20 border border-asas-gold/50" /><span className="text-[10px] uppercase tracking-widest font-bold text-white/50">Réservé</span></div>
                   <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-black/50 border border-white/10" /><span className="text-[10px] uppercase tracking-widest font-bold text-white/50">Dispo</span></div>
                 </div>
               </div>

               {properties.length === 0 ? (
                 <div className="text-center py-10 text-white/30 border border-dashed border-white/10 rounded-2xl bg-black/20 text-xs font-bold uppercase tracking-widest">Aucun lot assigné à ce programme</div>
               ) : (
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                   {properties.map(p => (
                     <Link href={`/dashboard/properties?id=${p.id}`} key={p.id} className={clsx(
                       "p-4 rounded-2xl border transition-all hover:scale-[1.02]",
                       p.status === 'sold' ? "bg-green-500/5 border-green-500/30" :
                       p.status === 'reserved' ? "bg-asas-gold/5 border-asas-gold/30" :
                       "bg-black/20 border-white/5 hover:border-asas-gold/30"
                     )}>
                       <div className="flex justify-between items-start mb-2">
                         <span className="text-[10px] font-bold font-mono text-white/40">{p.type}</span>
                         <span className="text-[9px] font-black uppercase tracking-widest text-[#06152D] bg-asas-gold px-2 py-0.5 rounded-md">{p.area_sqm}m²</span>
                       </div>
                       <p className={clsx("font-extrabold text-sm", p.status === 'sold' ? 'text-green-400' : p.status === 'reserved' ? 'text-asas-gold' : 'text-white/90')}>
                         {p.reference_code || 'Sans Réf'}
                       </p>
                       <p className="text-[10px] font-bold font-mono text-white/50 mt-2">{(p.list_price / 1_000_000).toFixed(2)}M</p>
                     </Link>
                   ))}
                 </div>
               )}
             </div>

             {/* Échéancier VEFA Global */}
             <div className="bg-[#051121] rounded-[2rem] border border-white/5 shadow-2xl p-8">
                <h2 className="text-xl font-extrabold text-white flex items-center gap-3 mb-6">
                   <BadgePercent className="w-6 h-6 text-asas-gold" /> Échéancier Global des Appels de Fonds (VEFA)
                </h2>
                <p className="text-sm font-medium text-white/50 mb-6">Lorsque vous validez une phase de construction, les appels de fonds sont automatiquement générés pour toutes les transactions en cours sur ce projet.</p>
                
                <div className="space-y-4">
                   {project.tranches?.length ? project.tranches.map((tranche: any, i: number) => (
                     <div key={i} className={clsx("flex items-center justify-between p-4 rounded-xl border transition-colors", tranche.done ? "bg-green-500/5 border-green-500/20" : "bg-black/20 border-white/5")}>
                        <div className="flex items-center gap-4">
                           <div className={clsx("w-8 h-8 rounded-xl flex items-center justify-center", tranche.done ? "bg-green-500/10 text-green-400" : "bg-white/5 text-white/40")}>
                             {tranche.done ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-[10px] font-bold">{i+1}</span>}
                           </div>
                           <div>
                             <p className={clsx("text-sm font-bold", tranche.done ? "text-green-400" : "text-white")}>{tranche.label}</p>
                             <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-0.5">{tranche.pct}% du montant total</p>
                           </div>
                        </div>
                        {!tranche.done && (
                          <button 
                            onClick={async (e) => {
                              e.currentTarget.disabled = true;
                              const originalText = e.currentTarget.innerText;
                              e.currentTarget.innerText = "Déclenchement...";
                              try {
                                const res = await fetch('/api/command-gateway', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    commandId: crypto.randomUUID(),
                                    aggregateId: project.id,
                                    type: 'TRIGGER_PROJECT_TRANCHE',
                                    expectedVersion: 1,
                                    payload: { projectId: project.id, trancheLabel: tranche.label, tranchePct: tranche.pct }
                                  })
                                });
                                if (!res.ok) throw new Error('Failed');
                                
                                // Optimistic visual update (since we don't save tranches to DB yet)
                                const newTranches = [...project.tranches];
                                newTranches[i].done = true;
                                setProject({ ...project, tranches: newTranches });
                                
                                alert('Appels de fonds générés avec succès pour les transactions actives.');
                              } catch (err) {
                                console.error(err);
                                e.currentTarget.disabled = false;
                                e.currentTarget.innerText = originalText;
                                alert('Erreur lors du déclenchement de l\'appel de fonds');
                              }
                            }}
                            className="px-4 py-2 bg-black/40 hover:bg-asas-gold hover:text-[#06152D] border border-white/10 hover:border-asas-gold disabled:opacity-50 text-white/80 text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-sm transition-all focus:outline-none">
                            Déclencher
                          </button>
                        )}
                     </div>
                   )) : [
                     { label: "Réservation (Signature)", pct: 20, done: true },
                     { label: "Achèvement Fondations", pct: 15, done: true },
                     { label: "Dalle RDC", pct: 10, done: false },
                     { label: "Hors d'eau (Toiture)", pct: 20, done: false },
                     { label: "Menuiseries & Cloisons", pct: 15, done: false },
                     { label: "Remise des Clés", pct: 20, done: false },
                   ].map((tranche, i) => (
                     <div key={i} className={clsx("flex items-center justify-between p-4 rounded-2xl border transition-colors", tranche.done ? "bg-green-500/5 border-green-500/20" : "bg-transparent border-white/5 hover:border-white/10")}>
                        <div className="flex items-center gap-4">
                           <div className={clsx("w-8 h-8 rounded-xl flex items-center justify-center", tranche.done ? "bg-green-500/10 text-green-400" : "bg-white/5 text-white/40")}>
                             {tranche.done ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-[10px] font-bold">{i+1}</span>}
                           </div>
                           <div>
                             <p className={clsx("text-sm font-bold", tranche.done ? "text-green-400" : "text-white")}>{tranche.label}</p>
                             <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mt-0.5">{tranche.pct}% du montant total</p>
                           </div>
                        </div>
                        {!tranche.done && (
                          <button 
                            onClick={async (e) => {
                              e.currentTarget.disabled = true;
                              const originalText = e.currentTarget.innerText;
                              e.currentTarget.innerText = "Déclenchement...";
                              try {
                                const res = await fetch('/api/command-gateway', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    commandId: crypto.randomUUID(),
                                    aggregateId: project.id,
                                    type: 'TRIGGER_PROJECT_TRANCHE',
                                    expectedVersion: 1,
                                    payload: { projectId: project.id, trancheLabel: tranche.label, tranchePct: tranche.pct }
                                  })
                                });
                                if (!res.ok) throw new Error('Failed');
                                
                                // Optimistically update our "fake" tranches by mutating state mock
                                const newProject = { ...project };
                                if (!newProject.tranches) {
                                  newProject.tranches = [
                                    { label: "Réservation (Signature)", pct: 20, done: true },
                                    { label: "Achèvement Fondations", pct: 15, done: true },
                                    { label: "Dalle RDC", pct: 10, done: false },
                                    { label: "Hors d'eau (Toiture)", pct: 20, done: false },
                                    { label: "Menuiseries & Cloisons", pct: 15, done: false },
                                    { label: "Remise des Clés", pct: 20, done: false },
                                  ];
                                }
                                newProject.tranches[i].done = true;
                                setProject(newProject);
                                
                                alert('Appels de fonds générés avec succès pour les transactions actives.');
                              } catch (err) {
                                console.error(err);
                                e.currentTarget.disabled = false;
                                e.currentTarget.innerText = originalText;
                                alert('Erreur lors du déclenchement de l\'appel de fonds');
                              }
                            }}
                            className="px-4 py-2 bg-black/40 hover:bg-asas-gold hover:text-[#06152D] border border-white/10 hover:border-asas-gold disabled:opacity-50 text-white/80 text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-sm transition-all focus:outline-none">
                            Déclencher
                          </button>
                        )}
                     </div>
                   ))}
                </div>
             </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
             <div className="bg-white dark:bg-[#0A0A0A] rounded-sm border border-black/5 dark:border-white/5 p-6 shadow-xl">
               <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6">Mix Produit</h3>
               <div className="space-y-4">
                  {Object.entries(byType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         <Home className="w-4 h-4 text-indigo-500" />
                         <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{type}</span>
                      </div>
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-md">{count} lots</span>
                    </div>
                  ))}
               </div>
             </div>

             <div className="bg-white dark:bg-[#0A0A0A] rounded-3xl border border-black/5 dark:border-white/5 p-6 shadow-xl">
               <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-6 border-b border-black/5 dark:border-white/5 pb-4">Actes & Juridique</h3>
               <button className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-[#111111] hover:bg-indigo-500/5 border border-black/5 dark:border-white/5 hover:border-indigo-500/20 rounded-xl transition-colors mb-3 group">
                  <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-500 transition-colors">Permis de Construire</span>
                  <FileCheck className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" />
               </button>
               <button className="w-full flex items-center justify-between p-3 bg-gray-50 dark:bg-[#111111] hover:bg-indigo-500/5 border border-black/5 dark:border-white/5 hover:border-indigo-500/20 rounded-xl transition-colors group">
                  <span className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-500 transition-colors">Plan de Masse & EDD</span>
                  <ShieldCheck className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" />
               </button>
             </div>
          </div>

        </div>
      ) : (
        <div className="relative z-10">
          <ConstructionEngine projectId={id} projectCity={project.city || "Alger"} />
        </div>
      )}
    </div>
  )
}
