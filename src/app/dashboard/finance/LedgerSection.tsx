'use client'

import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { FileText, Search, Plus, Filter, ArrowRight } from 'lucide-react'
import { clsx } from 'clsx'

function fmt(n: number): string {
  return new Intl.NumberFormat('fr-DZ', { style: 'currency', currency: 'DZD' }).format(n)
}

export function LedgerSection() {
  const [entries, setEntries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/ledger?view=journal')
      .then(res => res.json())
      .then(data => {
        setEntries(data.entries || [])
        setLoading(false)
      })
      .catch(console.error)
  }, [])

  return (
    <div className="bg-[#0A1829] rounded-2xl border border-white/5 shadow-sm mt-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between p-6 border-b border-white/5 gap-4 bg-[#051121] rounded-t-2xl">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight uppercase font-display flex items-center gap-2">
            <FileText className="w-5 h-5 text-asas-gold" /> The General Ledger
          </h2>
          <p className="text-[9px] uppercase tracking-widest font-bold text-white/50 mt-1">Grand Livre • Écritures Journalisées (Immutables)</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 border border-white/10 hover:bg-white/5 rounded-xl transition-colors text-white/50">
            <Filter className="w-4 h-4" />
          </button>
          <button className="px-4 py-2 bg-asas-gold text-[#051121] text-[10px] uppercase tracking-widest font-bold rounded-xl shadow-sm hover:bg-[#E0B96B] transition-colors flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nouvelle Écriture
          </button>
        </div>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="animate-pulse space-y-4">
             <div className="h-10 bg-white/5 rounded-xl" />
             <div className="h-10 bg-white/5 rounded-xl" />
             <div className="h-10 bg-white/5 rounded-xl" />
          </div>
        ) : entries.length === 0 ? (
          <div className="py-12 flex flex-col items-center justify-center text-white/50 bg-[#051121] border border-dashed border-white/10 rounded-2xl">
             <FileText className="w-8 h-8 mb-3 opacity-50" />
             <p className="text-[10px] uppercase font-bold tracking-widest">Le grand livre est vide</p>
             <p className="text-xs mt-1">Aucune écriture comptable n'a été trouvée.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                   <tr className="border-b border-white/5">
                     <th className="py-3 px-4 text-[9px] uppercase tracking-widest font-bold text-white/50">Date & Réf</th>
                     <th className="py-3 px-4 text-[9px] uppercase tracking-widest font-bold text-white/50">Description</th>
                     <th className="py-3 px-4 text-[9px] uppercase tracking-widest font-bold text-white/50">Compte</th>
                     <th className="py-3 px-4 text-[9px] uppercase tracking-widest font-bold text-white/50 text-right">Débit</th>
                     <th className="py-3 px-4 text-[9px] uppercase tracking-widest font-bold text-white/50 text-right">Crédit</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                   {entries.map((req, i) => (
                      <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="py-3 px-4 whitespace-nowrap">
                           <p className="text-xs font-bold text-white">{new Date(req.entry_date || req.created_at).toLocaleDateString('fr-DZ')}</p>
                           <p className="text-[9px] font-mono font-bold text-white/40 uppercase">{req.reference || `JNL-${req.id.slice(0,6)}`}</p>
                        </td>
                        <td className="py-3 px-4">
                           <p className="text-sm text-white">{req.description}</p>
                           <p className="text-[9px] uppercase tracking-widest font-bold text-white/50 mt-0.5 border border-white/5 bg-white/5 w-fit px-1.5 py-0.5 rounded-[4px]">{req.journal_type || 'Général'}</p>
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                           <div className="space-y-1">
                             {req.lines?.map((line: any, idx: number) => (
                               <p key={idx} className="text-[10px] font-mono text-white/80 flex items-center gap-1.5">
                                 {line.transaction_type === 'credit' && <span className="w-3"></span>}
                                 {line.account?.code || line.account_id?.slice(0,5)} - {line.account?.name || 'Compte'}
                               </p>
                             ))}
                           </div>
                        </td>
                        <td className="py-3 px-4 text-right align-top">
                           <div className="space-y-1">
                             {req.lines?.map((line: any, idx: number) => (
                               <p key={idx} className={clsx("text-xs font-mono font-bold", line.transaction_type === 'debit' ? 'text-[#34A853]' : 'opacity-0')}>
                                 {line.transaction_type === 'debit' ? fmt(line.amount) : '-'}
                               </p>
                             ))}
                           </div>
                        </td>
                        <td className="py-3 px-4 text-right align-top">
                           <div className="space-y-1">
                             {req.lines?.map((line: any, idx: number) => (
                               <p key={idx} className={clsx("text-xs font-mono font-bold", line.transaction_type === 'credit' ? 'text-white' : 'opacity-0')}>
                                 {line.transaction_type === 'credit' ? fmt(line.amount) : '-'}
                               </p>
                             ))}
                           </div>
                        </td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
        )}
      </div>
    </div>
  )
}
