// src/modules/agents/components/AgentDashboard.tsx
'use client'
import { useEffect, useState } from 'react'
import { clsx } from 'clsx'

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  return new Intl.NumberFormat('fr-DZ').format(Math.round(n))
}

export function AgentDashboard({ agentId, agentName }: { agentId: string, agentName: string }) {
  const [data, setData] = useState<any>(null)
  const [agreements, setAgreements] = useState<any[]>([])
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(false)

  const loadProfile = () => {
    fetch(`/api/agents/kpis?view=snapshot&agentId=${agentId}`)
      .then(r => r.json()).then(setData)
  }

  const loadAgreements = () => {
    fetch(`/api/agents/commissions?agentId=${agentId}`)
      .then(r => r.json()).then(d => setAgreements(d.unpaid || []))
  }

  useEffect(() => {
    loadProfile()
  }, [agentId])

  const openSettleModal = () => {
    loadAgreements()
    setShowModal(true)
  }

  const settle = async (agreementId: string, amount: number) => {
    setLoading(true)
    try {
      const res = await fetch('/api/command-gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          commandId: crypto.randomUUID(),
          aggregateId: agreementId,
          type: 'SETTLE_COMMISSION',
          expectedVersion: 1,
          payload: { agreementId, amount, agentId }
        })
      })
      if (!res.ok) throw new Error('Echec')
      loadProfile()
      loadAgreements()
    } catch (e) {
      alert('Erreur technique')
    } finally {
      setLoading(false)
    }
  }

  if (!data) return <div className="p-6 md:p-8 text-white/50 text-xs font-bold uppercase tracking-widest animate-pulse">Décryptage du profil...</div>

  return (
    <div className="p-6 md:p-8 bg-[#051121] border-y lg:border border-white/5 lg:rounded-2xl lg:m-6 shadow-sm relative">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-white uppercase tracking-wide font-display">{agentName} <span className="text-white/40 ml-2 text-sm font-sans tracking-widest">I-Performance</span></h2>
        <span className="px-3 py-1 bg-white/5 rounded-[4px] text-[9px] font-bold uppercase tracking-widest text-white/50 border border-white/5">
           Rang #{data.rank} • {data.tier}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 bg-[#0A1829] border border-white/5 rounded-xl shadow-sm relative overflow-hidden group hover:border-[#141618] hover:bg-white/[0.02] transition-all">
          <div className="absolute inset-0 bg-asas-gold/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <p className="text-[9px] uppercase font-bold tracking-widest text-white/50 mb-2 relative z-10">Pipeline Liquidé</p>
          <p className="text-3xl font-bold font-mono text-white mt-1 relative z-10">{data.closedDeals} <span className="text-[9px] text-white/30 font-bold uppercase tracking-widest font-sans">Protocoles</span></p>
        </div>
        
        <div className="p-6 bg-asas-gold/10 border border-asas-gold/20 rounded-xl shadow-sm relative overflow-hidden">
          <p className="text-[9px] uppercase font-bold tracking-widest text-asas-gold mb-2">Conversion Réussie</p>
          <p className="text-3xl font-bold font-mono text-asas-gold mt-1">{Math.round(data.closingRatePct)}%</p>
        </div>

        <div className="p-6 bg-[#34A853]/10 border border-[#34A853]/20 rounded-xl shadow-sm relative overflow-hidden">
          <p className="text-[9px] uppercase font-bold tracking-widest text-[#34A853] mb-2">Revenu Généré (Total)</p>
          <p className="text-3xl font-bold font-mono text-[#34A853] mt-1">{fmt(data.totalRevenue)} <span className="text-sm font-sans">DZD</span></p>
        </div>

        <div className="p-6 bg-orange-500/10 border border-orange-500/20 rounded-xl shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <p className="text-[9px] uppercase font-bold tracking-widest text-orange-500 mb-2">Commissions à Payer</p>
            <p className="text-3xl font-bold font-mono text-orange-500 mt-1">{fmt(data.commissionOutstanding)} <span className="text-sm font-sans">DZD</span></p>
            {data.commissionEarned > 0 && (
              <p className="text-[9px] text-orange-500/70 mt-2 font-bold uppercase tracking-widest">Déjà versé : {fmt(data.commissionEarned)} DZD</p>
            )}
          </div>
          {data.commissionOutstanding > 0 && (
            <button onClick={openSettleModal} className="mt-4 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white text-[10px] uppercase tracking-widest font-bold rounded-lg shadow-sm transition-colors w-full cursor-pointer">
              Régler Commission
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#051121]/80 backdrop-blur-sm">
          <div className="bg-[#051121] border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-6 border-b border-white/5">
              <h3 className="text-lg font-bold text-white font-display uppercase tracking-widest">Détail des Commissions (En Attente)</h3>
              <p className="text-[9px] text-white/50 font-bold uppercase tracking-widest mt-2">Solder les accords pour {agentName}</p>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {agreements.length === 0 ? (
                <p className="text-white/50 text-[9px] font-bold uppercase tracking-widest">Aucune commission en attente.</p>
              ) : (
                <div className="space-y-4">
                  {agreements.map((a) => (
                    <div key={a.agreement_id} className="p-5 border border-white/5 rounded-xl bg-[#0A1829] flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold text-white uppercase tracking-widest">Transaction #{a.deal_id.slice(0,6)}</p>
                        <p className="text-[9px] uppercase tracking-widest font-bold text-white/50 mt-1">Reste à payer : <span className="font-mono text-white">{a.outstanding_balance.toLocaleString()} DZD</span></p>
                      </div>
                      <button 
                        disabled={loading}
                        onClick={() => settle(a.agreement_id, a.outstanding_balance)}
                        className="px-4 py-2.5 bg-asas-gold hover:bg-[#E0B96B] text-[#051121] text-[9px] uppercase tracking-widest font-bold rounded-lg disabled:opacity-50 cursor-pointer shadow-sm"
                      >
                        Valider Pmt
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="p-6 border-t border-white/5 bg-[#0A1829] flex justify-end">
              <button disabled={loading} onClick={() => setShowModal(false)} className="px-5 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-[9px] uppercase tracking-widest font-bold rounded-lg transition-colors cursor-pointer">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

