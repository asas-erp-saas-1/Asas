// src/app/dashboard/finance/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { DollarSign, TrendingDown, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { motion, Variants } from 'motion/react'
import { clsx } from 'clsx'

interface CashPosition {
  cashBalance:       number
  receivablesTotal:  number
  payablesTotal:     number
  netPosition:       number
  liquidityRatio:    number
  liquidityMode:     string
  survivalDaysLeft:  number | null
}

interface AgingBucket { label: string; amount: { amount: number }; count: number; pct: number }
interface AgingData { totalOutstanding: { amount: number }; buckets: AgingBucket[]; collectionEfficiency: number; overdueCount: number }

function fmt(n: number): string {
  if (Math.abs(n) >= 1_000_000_000) return (n/1_000_000_000).toFixed(1)+'G DZD'
  if (Math.abs(n) >= 1_000_000)     return (n/1_000_000).toFixed(1)+'M DZD'
  return new Intl.NumberFormat('fr-DZ').format(Math.round(n))+' DZD'
}

import { ExpensesSection } from './ExpensesSection'
import { LedgerSection } from './LedgerSection'

export default function FinancePage() {
  const [cash,    setCash]    = useState<CashPosition | null>(null)
  const [aging,   setAging]   = useState<AgingData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [cashRes, agingRes] = await Promise.all([
          fetch('/api/ledger?view=cash_position'),
          fetch('/api/ledger?view=aging'),
        ])
        if (cashRes.ok) setCash(await cashRes.json())
        if (agingRes.ok) setAging(await agingRes.json())
      } catch (err: any) {
        import('@/lib/observability/errors').then(mod => mod.ErrorTracker.captureError(err, { context: 'FinancePage load' }))
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex-1 space-y-6 max-w-6xl mx-auto w-full">
      <div className="h-24 w-1/3 bg-[#0A1829] border border-white/5 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-[#0A1829] border border-white/5 rounded-2xl animate-pulse" />)}
      </div>
      <div className="h-64 bg-[#0A1829] border border-white/5 rounded-xl animate-pulse" />
    </div>
  )

  const modeStyle = (cash?.liquidityMode ? {
    growth:   { banner: null },
    caution:  { banner: 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500 border' },
    survival: { banner: 'bg-red-500/10 border-red-500/20 text-red-500 border' },
  }[cash.liquidityMode as 'growth' | 'caution' | 'survival'] : null) ?? { banner: null }

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

  return (
    <div className="flex-1 text-white flex flex-col">
      <div className="w-full space-y-8 max-w-6xl mx-auto">
        <div className="relative z-10 w-full mb-10 pt-4 pb-6 border-b border-white/5">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 hidden sm:flex">
                <div className="px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded text-[9px] text-yellow-500 uppercase font-bold tracking-widest flex items-center gap-1">
                   <DollarSign className="w-3 h-3" />
                   <span>Financial Command Active</span>
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight flex items-center gap-3 font-display">
                Treasury Command
              </h1>
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#D4A64F] mt-2 flex items-center gap-2 hidden sm:flex">
                <span className="w-2 h-2 rounded-full bg-asas-gold animate-[ping_2s_ease-in-out_infinite] shadow-[0_0_10px_rgba(212,166,79,0.6)]" />
                Oracle ERP Logic • PRÉVISIONS & TRÉSORERIE SYSTÈME
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-white/40">
               Live Oracle Sync enabled
            </div>
          </div>
        </div>

        {/* Liquidity warning */}
        {cash && cash.liquidityMode !== 'growth' && modeStyle?.banner && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className={clsx('rounded-2xl px-6 py-4 flex items-start gap-4 shadow-[0_0_20px_rgba(0,0,0,0.5)]', modeStyle.banner)}>
            <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center shrink-0 border", cash.liquidityMode === 'survival' ? 'bg-red-500/20 border-red-500/30 text-red-400' : 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400')}>
               <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-xs uppercase tracking-widest block mb-2">
                {cash.liquidityMode === 'survival' ? '🚨 PROTOCOLE SURVIE ACTIF' : '⚠️ ATTENTION REQUISE'}
              </span>
               <p className="text-sm font-bold opacity-80">
                  {cash.liquidityMode === 'survival'
                  ? `${cash.survivalDaysLeft ?? '?'} jours de trésorerie restants au rythme actuel de dépense.`
                  : 'La trésorerie est en dessous du niveau de confort. Surveillez les encaissements de près.'}
               </p>
            </div>
          </motion.div>
        )}

        {/* Cash position cards */}
        {cash && (
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Solde Liquidité', value: cash.cashBalance,      icon: DollarSign, color: cash.cashBalance > 5_000_000 ? 'text-[#34A853]' : 'text-red-500', bg: 'bg-[#051121]', iconBg: 'bg-[#34A853]/10', iconColor: 'text-[#34A853]' },
              { label: 'Créances Clients',    value: cash.receivablesTotal, icon: Clock,      color: 'text-white', bg: 'bg-[#051121]', iconBg: 'bg-white/10', iconColor: 'text-white' },
              { label: 'Dettes & Commissions',    value: cash.payablesTotal,    icon: TrendingDown, color: 'text-asas-copper', bg: 'bg-[#051121]', iconBg: 'bg-asas-copper/10', iconColor: 'text-asas-copper' },
              { label: 'Position Nette',      value: cash.netPosition,      icon: CheckCircle, color: cash.netPosition >= 0 ? 'text-[#34A853]' : 'text-red-500', bg: 'bg-[#051121]', iconBg: cash.netPosition >= 0 ? 'bg-[#34A853]/10' : 'bg-red-500/10', iconColor: cash.netPosition >= 0 ? 'text-[#34A853]' : 'text-red-500' },
            ].map(({ label, value, icon: Icon, color, bg, iconBg, iconColor }, i) => (
              <motion.div key={label} variants={item} className={clsx("rounded-2xl border border-white/5 p-6 shadow-sm transition-all relative overflow-hidden group hover:border-[#E0B96B]/40 hover:bg-white/[0.02]", bg)}>
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                   <Icon className="w-16 h-16 text-white/30" />
                </div>
                <div className="flex items-center gap-4 mb-4 relative z-10">
                  <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center border border-white/10", iconBg, iconColor)}>
                      <Icon className="h-5 w-5" />
                  </div>
                  <p className="text-[9px] uppercase tracking-widest font-bold text-white/50 leading-tight">{label}</p>
                </div>
                <p className={clsx('text-xl md:text-2xl font-bold tracking-tighter relative z-10 font-mono', color)}>{fmt(value)}</p>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Receivables aging */}
        {aging && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-[#0A1829] rounded-2xl border border-white/5 p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-6 border-b border-white/5 gap-6">
              <div>
                  <h2 className="text-xl font-bold text-white tracking-tight font-display uppercase">Analyse d'Ancienneté</h2>
                  <p className="text-[9px] uppercase font-bold tracking-widest text-white/50 mt-2">Détail de l'échéancier des flux entrants en attente de vérification.</p>
              </div>
              <div className="flex items-center gap-6 bg-[#051121] rounded-xl p-4 shrink-0 border border-white/5">
                 <div>
                     <p className="text-[9px] uppercase tracking-widest text-white/50 font-bold mb-1">Défauts critiques</p>
                     <p className="text-xl font-bold text-white leading-none">{aging.overdueCount}</p>
                 </div>
                 <div className="w-px h-10 bg-white/10" />
                 <div>
                     <p className="text-[9px] uppercase tracking-widest text-white/50 font-bold mb-1">Efficience Encaissement</p>
                     <p className="text-xl font-bold text-[#34A853] leading-none">{Math.round(aging.collectionEfficiency * 100)}%</p>
                 </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {aging.buckets.map(bucket => (
                <div key={bucket.label} className={clsx('rounded-xl p-5 border relative overflow-hidden', bucket.label === '90+' ? 'border-red-500/20 bg-red-500/5' : bucket.label === '61-90' ? 'border-orange-500/20 bg-orange-500/5' : 'border-white/5 bg-[#051121]')}>
                  {bucket.label === '90+' && <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl" />}
                  <p className="text-[9px] uppercase tracking-widest font-bold text-white/50 mb-2 relative z-10">{bucket.label} jours</p>
                  <p className={clsx('text-xl font-bold tracking-tight relative z-10 font-mono', bucket.label === '90+' ? 'text-red-500' : bucket.label === '61-90' ? 'text-orange-500' : 'text-white')}>
                    {fmt(bucket.amount.amount)}
                  </p>
                  <div className="flex items-center justify-between mt-3 font-bold relative z-10">
                    <span className="text-[10px] text-white/40">{bucket.count} flux</span>
                    <span className="text-[10px] text-white/50 bg-white/5 px-2 py-0.5 rounded-[4px] border border-white/5">{bucket.pct}%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            <div>
              <div className="h-3 bg-[#051121] border border-white/5 rounded-full overflow-hidden flex shadow-inner">
                  {aging.buckets.map(bucket => (
                  <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${bucket.pct}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      key={bucket.label}
                      className={clsx('h-full transition-all duration-500', bucket.label === '0-30' ? 'bg-[#34A853]' : bucket.label === '31-60' ? 'bg-asas-gold' : bucket.label === '61-90' ? 'bg-orange-500' : 'bg-red-500')}
                  />
                  ))}
              </div>
              <div className="flex gap-6 mt-5 justify-center md:justify-start">
                  {[{ label:'0-30', c:'bg-[#34A853]'}, {label:'31-60',c:'bg-asas-gold'},{label:'61-90',c:'bg-orange-500'},{label:'90+',c:'bg-red-500'}].map(l => (
                  <span key={l.label} className="flex items-center gap-2 text-[9px] uppercase font-bold tracking-widest text-white/50">
                      <span className={clsx('h-2.5 w-2.5 rounded-full', l.c)} />{l.label} jours
                  </span>
                  ))}
              </div>
            </div>
          </motion.div>
        )}

        <LedgerSection />
        <ExpensesSection />
      </div>
    </div>
  )
}
