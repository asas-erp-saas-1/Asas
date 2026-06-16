'use client'

import { useState, useEffect, useCallback } from 'react'
import { Building2, LayoutTemplate, ShieldCheck, HardHat, CalendarRange, ArrowRight, Activity, Percent, Plus, Search, FileText } from "lucide-react"
import { motion, Variants } from "motion/react"
import { clsx } from 'clsx'
import Link from 'next/link'
import { ProjectCreateModal } from './ProjectCreateModal'

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
}

interface Project {
  id: string
  name: string
  city: string | null
  status: string
  completion_date: string | null
  developers: { name: string } | null
  properties: { id: string, status: string }[]
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set('q', search)
      
      const res = await fetch(`/api/projects?${params}`)
      if (res.ok) {
        const data = await res.json()
        setProjects(data.data || [])
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="w-full relative pb-12">
      {/* Decorative Blur - Removed to match ASAS aesthetic */}

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2 hidden sm:flex">
            <div className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded text-[9px] text-purple-400 uppercase font-bold tracking-widest flex items-center gap-1">
               <Building2 className="w-3 h-3" />
               <span>Project Operations Active</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight flex items-center gap-3 font-display">
            Projects & Subdivisions
          </h1>
          <p className="text-[10px] font-bold text-[#D4A64F] uppercase tracking-widest mt-2 flex items-center gap-2 hidden sm:flex">
            <span className="w-2 h-2 rounded-full bg-asas-gold animate-pulse shadow-[0_0_10px_rgba(212,166,79,0.6)]" />
            Odoo Logic • Module de Pilotage Chantiers & Projets
          </p>
        </div>
        
        <div className="flex items-center gap-3">
           <Link href="/dashboard/projects/bordereaux" className="flex items-center gap-2 px-6 py-2.5 shrink-0 bg-[#0A1829]/60 backdrop-blur-md border border-white/5 hover:border-white/20 text-white rounded-xl text-[10px] uppercase tracking-widest font-bold transition-transform active:scale-95 shadow-sm hover:bg-white/5">
             <FileText className="w-4 h-4 text-asas-gold" /> Bordereaux
           </Link>
           <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-6 py-2.5 shrink-0 bg-[#D4A64F] hover:bg-[#E0B96B] text-[#06152D] rounded-xl text-[10px] uppercase tracking-widest font-bold shadow-[0_0_20px_rgba(212,166,79,0.3)] transition-all active:scale-95 disabled:opacity-50 border border-transparent outline-none">
             <Plus className="w-4 h-4" /> Nouveau Programme
           </button>
        </div>
      </motion.div>

      {isModalOpen && (
        <ProjectCreateModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => { setIsModalOpen(false); load() }} 
        />
      )}

      {/* Main Container */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", bounce: 0, duration: 0.8 }}
        className="bg-[#051121] border border-white/5 shadow-[0_0_30px_rgba(0,0,0,0.5)] rounded-3xl relative overflow-hidden"
      >
        {/* Statistics Banner */}
        <div className="bg-[#0A1829]/60 border-b border-white/5 p-8 relative overflow-hidden backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-[50%] h-[150%] bg-[radial-gradient(ellipse_at_top_right,_rgba(212,166,79,0.1),_transparent_70%)] pointer-events-none"></div>
          <div className="relative z-10 max-w-xl">
            <span className="inline-block px-3 py-1 bg-asas-gold/10 text-asas-gold border border-asas-gold/20 text-[9px] font-bold uppercase tracking-widest rounded-lg mb-4">
              Opérations de Promotion
            </span>
            <h2 className="text-2xl font-bold text-white mb-2 font-display">Performance Globale des Programmes</h2>
            <p className="text-sm font-medium text-white/50 leading-relaxed mb-6">
              Vue consolidée de l'avancement technique de vos chantiers et de la structuration foncière. Pilotez vos appels de fonds en corrélant l'avancement travaux et la commercialisation.
            </p>
          </div>
        </div>

        {/* Feature Grid */}
        <motion.div variants={container} initial="hidden" animate="show" className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
          {[
            { icon: LayoutTemplate, title: "Découpage Parcellaire", desc: "Arborescence Projet > Bâtiments > Étages > Unités.", color: "text-white/60", bg: "bg-white/5 border border-white/10" },
            { icon: HardHat, title: "Suivi de Chantier", desc: "Rapports de progression visuels et état d'avancement.", color: "text-asas-gold", bg: "bg-asas-gold/10 border border-asas-gold/20" },
            { icon: Percent, title: "Appels de Fonds", desc: "Déclenchement financier selon l'avancement technique.", color: "text-green-400", bg: "bg-green-500/10 border border-green-500/20" },
            { icon: ShieldCheck, title: "Gestion Documentaire", desc: "Centralisation des plans d'exécution et des permis.", color: "text-blue-400", bg: "bg-blue-500/10 border border-blue-500/20" },
          ].map((feature, i) => (
            <motion.div key={i} variants={item} className="p-6 bg-black/20 border border-white/5 rounded-2xl hover:border-asas-gold/30 hover:bg-white/5 transition-all group shadow-sm backdrop-blur-md">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm ${feature.bg}`}>
                <feature.icon className={`w-5 h-5 ${feature.color}`} strokeWidth={1.5} />
              </div>
              <h3 className="text-sm font-bold text-white mb-2 tracking-wide font-display">{feature.title}</h3>
              <p className="text-xs text-white/40 font-medium leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Toolbar */}
        <div className="px-8 pb-4">
          <div className="flex items-center gap-2 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input type="text" placeholder="Rechercher un programme..." value={search} onChange={e => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 text-sm bg-black/20 border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-asas-gold focus:border-asas-gold text-white transition-all font-medium placeholder:text-white/30" />
            </div>
          </div>
        </div>

        {/* Active Projects Data */}
        <div className="p-8 border-t border-white/5 bg-transparent">
          <motion.h3 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-6 flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-asas-gold" /> Programmes Actifs ({projects.length})
            </div>
          </motion.h3>

          {loading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {[1, 2].map(i => <div key={i} className="h-32 bg-white/5 rounded-2xl border border-white/5 animate-pulse" />)}
             </div>
          ) : projects.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 text-white/40 bg-black/10 rounded-2xl border border-white/5 border-dashed">
                <Building2 className="h-10 w-10 opacity-50 text-asas-gold mb-4" />
                <p className="text-lg font-bold text-white mb-1 font-display">Aucun programme</p>
                <p className="text-[10px] uppercase tracking-widest font-bold">Ajoutez des projets immobiliers pour commencer</p>
             </div>
          ) : (
            <motion.div 
              variants={container} 
              initial="hidden" 
              whileInView="show" 
              viewport={{ once: true }} 
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {projects.map((project) => {
                const totalProps = project.properties?.length || 0;
                const soldProps = project.properties?.filter(p => p.status === 'sold').length || 0;
                const progressPct = totalProps > 0 ? Math.round((soldProps / totalProps) * 100) : 0;
                
                return (
                  <Link href={`/dashboard/projects/${project.id}`} key={project.id}>
                    <motion.div variants={item} className="bg-[#0A1829]/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6 hover:border-asas-gold/40 hover:bg-white/5 transition-all cursor-pointer group h-full shadow-[0_0_15px_rgba(0,0,0,0.2)]">
                      <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-xl bg-black/30 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 group-hover:border-asas-gold/30 transition-all shadow-inner">
                          <Building2 className="w-6 h-6 text-white/60 group-hover:text-asas-gold transition-colors" />
                        </div>
                        <div className="min-w-0 flex flex-col justify-center">
                          <h4 className="text-white font-bold text-lg mb-1 group-hover:text-asas-gold transition-colors truncate font-display">{project.name}</h4>
                          <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-white/40">
                            <span className={clsx("flex items-center gap-1", project.status === 'active' ? 'text-blue-400' : '')}>
                              <HardHat className="w-3 h-3" /> {project.status === 'active' ? 'En cours' : project.status}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 truncate"><LayoutTemplate className="w-3 h-3 text-white/30" /> {totalProps} lots</span>
                            {project.completion_date && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1"><CalendarRange className="w-3 h-3 text-white/30" /> Liv. {new Date(project.completion_date).getFullYear()}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress (Commercialization) */}
                      <div className="flex flex-col gap-2 w-full xl:w-48 shrink-0 bg-black/20 p-3 rounded-xl border border-white/5">
                        <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-white/50">
                          <span>Commercialisation</span>
                          <span className="text-asas-gold">{progressPct}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-black/50 rounded-full overflow-hidden shadow-inner">
                          <motion.div initial={{ width: 0 }} whileInView={{ width: `${progressPct}%` }} transition={{ duration: 1, delay: 0.2 }} className="h-full bg-gradient-to-r from-asas-gold to-[#E0B96B] shadow-[0_0_10px_rgba(212,166,79,0.8)]" />
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                )
              })}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
