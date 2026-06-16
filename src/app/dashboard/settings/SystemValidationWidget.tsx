'use client'

import { useState } from 'react'
import { Database, Zap, CheckCircle, RefreshCcw } from 'lucide-react'
import { clsx } from 'clsx'

export function SystemValidationWidget() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSeed = async () => {
    setLoading(true)
    setError(null)
    setSuccess(false)
    try {
      const res = await fetch('/api/system/seed', { method: 'POST' })
      const data = await res.json()
      if (res.ok) {
        setSuccess(true)
      } else {
        throw new Error(data.error || 'Failed to seed data')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#051121]/50 border border-white/5 rounded-xl p-8 shadow-sm relative overflow-hidden group mb-8 hover:border-asas-gold/20 transition-colors">
      <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
        <Database className="w-24 h-24 text-asas-gold" />
      </div>
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2 font-display mb-2 uppercase tracking-widest">
            <div className="w-8 h-8 rounded-xl bg-asas-gold/10 border border-asas-gold/20 flex items-center justify-center text-asas-gold shadow-[0_0_15px_rgba(212,166,79,0.15)]">
              <Zap className="h-4 w-4" />
            </div>
            Validation Staging (Pre-Release)
          </h2>
          <p className="text-[10px] font-bold text-white/50 max-w-xl pl-[40px]">
            Générez un ensemble complet de données opérationnelles (Promoteurs, Projets, Biens, Clients, Leads) pour valider l'architecture et les pipelines. Recommandé uniquement pour l'environnement de staging.
          </p>
          
          {error && <p className="mt-4 ml-[40px] text-[9px] font-bold text-red-400 bg-red-500/10 px-3 py-2 rounded-xl inline-block border border-red-500/20 uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.1)]">{error}</p>}
          {success && <p className="mt-4 ml-[40px] text-[9px] font-bold text-green-400 bg-green-500/10 px-3 py-2 rounded-xl inline-flex items-center gap-2 border border-green-500/20 uppercase tracking-widest shadow-[0_0_15px_rgba(74,222,128,0.1)]"><CheckCircle className="w-3 h-3"/> Environnement provisionné avec succès !</p>}
        </div>
        
        <div className="shrink-0">
          <button
            onClick={handleSeed}
            disabled={loading || success}
            className={clsx(
              "flex items-center gap-2 px-6 py-4 rounded-xl text-[9px] uppercase tracking-widest font-bold shadow-sm transition-all w-full md:w-auto justify-center cursor-pointer transform hover:scale-[1.02] active:scale-95 disabled:transform-none",
              success 
                ? "bg-green-500/10 text-green-400 border border-green-500/20"
                : "bg-white/5 border border-white/10 hover:bg-white/10 text-white hover:text-white"
            )}
          >
            {loading ? (
              <><RefreshCcw className="w-4 h-4 animate-spin text-white/50" /> Provisionnement...</>
            ) : success ? (
              <><CheckCircle className="w-4 h-4" /> Terminé</>
            ) : (
              <><Database className="w-4 h-4 text-white/50" /> Injecter Données de Test</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
