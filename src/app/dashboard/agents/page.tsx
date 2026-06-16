// src/app/dashboard/agents/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Users, TrendingUp, TrendingDown, ChevronRight, Award } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { clsx } from 'clsx'
import { AgentDashboard } from '@/modules/agents/components/AgentDashboard'

interface AgentRow {
  agentId:          string
  agentName:        string
  tier:             string
  rank:             number
  rankDelta:        number | null
  performanceScore: number
  closedDeals:      number
  activeDeals:      number
  totalRevenue:     number
  commissionEarned: number
  closingRatePct:   number
  avgDealSize:      number
}

const TIER_CONFIG: Record<string, { color: string; icon: string }> = {
  Elite:   { color: 'text-asas-gold bg-asas-gold/10 border-asas-gold/20', icon: '👑' },
  Gold:    { color: 'text-asas-copper bg-asas-copper/10 border-asas-copper/20', icon: '🥇' },
  Silver:  { color: 'text-[#B5BDC4] bg-[#B5BDC4]/10 border-[#B5BDC4]/20',   icon: '🥈' },
  Bronze:  { color: 'text-orange-500 bg-orange-500/10 border-orange-500/20',icon: '🥉' },
  Starter: { color: 'text-white bg-white/5 border-white/10',    icon: '⭐' },
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  return new Intl.NumberFormat('fr-DZ').format(Math.round(n))
}

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-20 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(score, 100)}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={clsx('h-full transition-colors', score >= 75 ? 'bg-[#34A853]' : score >= 50 ? 'bg-asas-gold' : score >= 25 ? 'bg-orange-500' : 'bg-red-500')}
        />
      </div>
      <span className={clsx('text-[9px] font-mono font-bold w-7 text-right', score >= 75 ? 'text-[#34A853]' : score >= 50 ? 'text-asas-gold' : score >= 25 ? 'text-orange-500' : 'text-red-500')}>
        {Math.round(score)}
      </span>
    </div>
  )
}

export default function AgentsPage() {
  const [agents,     setAgents]    = useState<AgentRow[]>([])
  const [loading,    setLoading]   = useState(true)
  const [selectedId, setSelected]  = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch('/api/agents/kpis?view=rankings&limit=50')
        const data = await res.json()
        setAgents(data.rankings ?? [])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const selected = agents.find(a => a.agentId === selectedId)

  return (
    <div className="flex flex-1 h-full bg-[#051121] overflow-hidden font-sans shadow-sm">
      {/* Left: rankings */}
      <div className={clsx('flex flex-col bg-[#051121] border-r border-white/5 overflow-hidden transition-all duration-300 z-10', selectedId ? 'hidden lg:flex lg:w-1/2 xl:w-[45%]' : 'w-full')}>
        {/* Header */}
        <div className="px-6 py-5 shrink-0 z-10 w-full border-b border-white/5 bg-[#0A1829]">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 hidden sm:flex">
                <div className="px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded text-[9px] text-[#D4A64F] uppercase font-bold tracking-widest flex items-center gap-1">
                   <Users className="w-3 h-3" />
                   <span>Employee Management Active</span>
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight flex items-center gap-3">
                 Employee Hub
              </h1>
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#D4A64F] mt-2 flex items-center gap-2 hidden sm:flex">
                <span className="relative flex h-2 w-2">
                 <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-asas-gold opacity-75"></span>
                 <span className="relative inline-flex rounded-full h-2 w-2 bg-asas-gold"></span>
                </span>
                Oracle Logic GRH • {agents.length || 0} agents actifs au total
              </p>
            </div>
          </div>
        </div>

        {/* Rankings table */}
        <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
          {loading ? (
            <div className="space-y-3 p-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-20 bg-white/5 rounded-xl border border-white/5 animate-pulse" />
              ))}
            </div>
          ) : agents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-white/50 py-20">
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
                 <Users className="h-10 w-10 text-white/30" />
              </div>
              <p className="font-extrabold text-white text-lg font-display uppercase tracking-widest">Aucun agent trouvé</p>
              <p className="text-[9px] uppercase tracking-widest font-bold mt-2">Les données de classement n'ont pas pu être chargées.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#0A1829] sticky top-0 z-10">
                <tr>
                  <th className="px-6 py-4 text-[9px] uppercase font-bold tracking-widest text-white/50 w-16 text-center">#</th>
                  <th className="px-4 py-4 text-[9px] uppercase font-bold tracking-widest text-white/50">Agent</th>
                  <th className="px-4 py-4 text-[9px] uppercase font-bold tracking-widest text-white/50 hidden md:table-cell">Score Performance</th>
                  <th className="px-4 py-4 text-[9px] uppercase font-bold tracking-widest text-white/50 hidden lg:table-cell text-right">Transactions</th>
                  <th className="px-4 py-4 text-[9px] uppercase font-bold tracking-widest text-white/50 hidden xl:table-cell text-right">Revenu</th>
                  <th className="px-4 py-4 text-[9px] uppercase font-bold tracking-widest text-white/50 hidden lg:table-cell text-right">Conversion</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 bg-[#051121]">
                <AnimatePresence>
                {agents.map((agent, i) => {
                  const tierCfg = TIER_CONFIG[agent.tier] ?? TIER_CONFIG['Starter']!
                  const isSelected = selectedId === agent.agentId;
                  return (
                    <motion.tr
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      key={agent.agentId}
                      onClick={() => setSelected(isSelected ? null : agent.agentId)}
                      className={clsx('cursor-pointer transition-colors group relative', isSelected ? 'bg-[#0A1829]' : 'hover:bg-white/[0.02]')}
                    >
                      {/* Active indicator */}
                      {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-asas-gold shadow-[0_0_10px_rgba(212,166,79,0.5)]" />}
                      
                      {/* Rank */}
                      <td className="px-6 py-5 text-center align-middle">
                        <div className={clsx(
                          'h-6 w-6 mx-auto rounded-lg flex items-center justify-center text-[10px] font-bold font-mono',
                          agent.rank === 1 ? 'bg-asas-gold text-[#051121] shadow-[0_0_10px_rgba(212,166,79,0.3)]' :
                          agent.rank === 2 ? 'bg-asas-silver text-[#051121] shadow-[0_0_10px_rgba(181,189,196,0.3)]' :
                          agent.rank === 3 ? 'bg-asas-copper text-[#051121]' :
                          'bg-transparent text-white/40 border border-white/10'
                        )}>
                          {agent.rank}
                        </div>
                      </td>

                      {/* Name + tier + delta */}
                      <td className="px-4 py-5 align-middle">
                        <div className="flex flex-col gap-1.5">
                          <p className={clsx("text-sm font-bold", isSelected ? 'text-asas-gold' : 'text-white')}>{agent.agentName}</p>
                          <div className="flex items-center gap-2">
                            <span className={clsx('text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-[4px] font-bold border', tierCfg.color)}>
                              {tierCfg.icon} {agent.tier}
                            </span>
                            {agent.rankDelta !== null && (
                              <span className={clsx('text-[10px] font-bold flex items-center gap-0.5', agent.rankDelta > 0 ? 'text-[#34A853]' : agent.rankDelta < 0 ? 'text-red-400' : 'text-white/30')}>
                                {agent.rankDelta > 0 ? <TrendingUp className="h-3 w-3" /> : agent.rankDelta < 0 ? <TrendingDown className="h-3 w-3" /> : null}
                                {agent.rankDelta > 0 ? `+${agent.rankDelta}` : agent.rankDelta < 0 ? String(agent.rankDelta) : '–'}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Score bar */}
                      <td className="px-4 py-5 hidden md:table-cell align-middle">
                        <ScoreBar score={agent.performanceScore} />
                      </td>

                      {/* Closed deals */}
                      <td className="px-4 py-5 text-right hidden lg:table-cell align-middle">
                         <div className="flex flex-col items-end">
                            <span className="text-sm font-bold font-mono text-white">{agent.closedDeals} conclues</span>
                            <span className="text-[9px] uppercase tracking-widest font-bold text-white/40 mt-1">{agent.activeDeals} en cours</span>
                         </div>
                      </td>

                      {/* Revenue */}
                      <td className="px-4 py-5 text-right hidden xl:table-cell align-middle">
                        <span className="text-[10px] font-bold font-mono text-[#34A853] bg-[#34A853]/10 border border-[#34A853]/20 px-2 py-1 rounded-[4px]">
                           {fmt(agent.totalRevenue)} DZD
                        </span>
                      </td>

                      {/* Close rate */}
                      <td className="px-4 py-5 text-right hidden lg:table-cell align-middle">
                        <span className={clsx('text-[10px] font-mono font-bold', agent.closingRatePct >= 40 ? 'text-[#34A853]' : agent.closingRatePct >= 20 ? 'text-asas-gold' : 'text-white/30')}>
                          {Math.round(agent.closingRatePct)}%
                        </span>
                      </td>

                      <td className="pr-6 align-middle text-right">
                        <ChevronRight className={clsx("h-4 w-4 transition-transform", isSelected ? 'text-asas-gold translate-x-1' : 'text-white/20 opacity-0 group-hover:opacity-100')} />
                      </td>
                    </motion.tr>
                  )
                })}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Right: agent detail */}
      {selectedId && (
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 overflow-y-auto bg-[#0A1829] border-l border-white/5">
          <div className="lg:hidden bg-[#0A1829] border-b border-white/5 px-4 py-2 sticky top-0 z-20">
            <button onClick={() => setSelected(null)} className="p-2 text-[9px] uppercase tracking-widest font-bold text-asas-gold flex items-center gap-1 hover:text-[#E0B96B] transition-colors bg-white/5 rounded-xl">
               <ChevronRight className="h-4 w-4 rotate-180 -ml-1" /> Retour au Classement
            </button>
          </div>
          <div className="p-4 md:p-6 lg:scroll-mt-0">
             {selected && <AgentDashboard agentId={selectedId} agentName={selected.agentName} />}
          </div>
        </motion.div>
      )}
    </div>
  )
}
