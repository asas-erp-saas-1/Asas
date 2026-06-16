'use client'
import { useEffect, useState, useMemo } from 'react'
import { Users, Plus, Search, Phone, Mail, ChevronRight, Globe, FileUser } from 'lucide-react'
import { clsx } from 'clsx'
import { ErrorTracker } from '@/lib/observability/errors'
import { ClientCreateModal } from './ClientCreateModal'
import { Client360Drawer } from './Client360Drawer'
import { DataTable } from '@/components/patterns/DataTable'
import { ColumnDef } from '@tanstack/react-table'

interface Client {
  id: string; full_name: string; phone: string | null; email: string | null
  type: string; source: string | null; nationality: string | null; created_at: string
}

const TYPE_CONFIG: Record<string, { color: string; label: string }> = {
  buyer:    { color: 'bg-asas-silver/10 text-asas-charcoal dark:text-asas-silver border-asas-silver/20', label: 'Acheteur' },
  seller:   { color: 'bg-asas-navy/10 text-asas-navy dark:text-asas-sand border-asas-navy/20', label: 'Vendeur' },
  investor: { color: 'bg-asas-gold/10 text-asas-gold border-asas-gold/20', label: 'Investisseur' },
  tenant:   { color: 'bg-asas-copper/10 text-asas-copper border-asas-copper/20', label: 'Locataire' },
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [total,   setTotal]   = useState(0)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)

  const loadClients = () => {
    const params = new URLSearchParams({ limit: '1000' })
    setLoading(true)
    fetch(`/api/clients?${params}`)
      .then(async r => {
        if (!r.ok) throw new Error(await r.text() || 'Failed to fetch clients');
        return r.json();
      })
      .then(d => { setClients(d.data ?? []); setTotal(d.count ?? 0) })
      .catch(err => {
        ErrorTracker.captureError(err, { context: 'ClientsPage fetch' });
        setClients([]);
        setTotal(0);
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadClients()
  }, [])

  const columns = useMemo<ColumnDef<Client>[]>(() => [
    {
      accessorKey: "full_name",
      header: "Profil",
      cell: ({ row }) => {
        const c = row.original
        return (
          <div className="flex flex-col space-y-1.5 py-1">
            <span className="text-sm font-bold text-white group-hover:text-asas-gold transition-colors">{c.full_name}</span>
            <span className="text-[9px] text-white/40 font-bold uppercase tracking-widest font-mono">ID: {c.id.slice(0, 8)}</span>
          </div>
        )
      }
    },
    {
      id: "contact",
      header: "Canal",
      cell: ({ row }) => {
        const c = row.original
        return (
          <div className="flex flex-col space-y-2 py-1">
            {c.phone && (
              <a href={`tel:${c.phone}`} onClick={e => e.stopPropagation()} className="flex items-center gap-3 text-xs font-bold text-white/80 hover:text-[#25D366] transition-colors w-fit">
                <Phone className="h-3.5 w-3.5 text-white/30" />{c.phone}
              </a>
            )}
            {c.email && (
              <a href={`mailto:${c.email}`} onClick={e => e.stopPropagation()} className="flex items-center gap-3 text-xs font-bold text-white/80 hover:text-asas-gold transition-colors w-fit">
                <Mail className="h-3.5 w-3.5 text-white/30" />{c.email}
              </a>
            )}
            {!c.phone && !c.email && <span className="text-xs text-white/30">—</span>}
          </div>
        )
      }
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => {
        const c = row.original
        const cfg = TYPE_CONFIG[c.type] ?? { color: 'bg-white/5 border-white/10 text-white/80', label: c.type }
        return (
          <span className={clsx('px-3 py-1.5 text-[9px] uppercase tracking-widest font-bold rounded-lg border', cfg.color)}>
            {cfg.label}
          </span>
        )
      }
    },
    {
      accessorKey: "source",
      header: "Source",
      cell: ({ row }) => (
        <span className="text-[9px] uppercase tracking-widest font-bold text-white/50 align-middle">
          {row.original.source || "—"}
        </span>
      )
    },
    {
      accessorKey: "nationality",
      header: "Localité",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {row.original.nationality ? (
            <>
              <Globe className="h-4 w-4 text-white/30" />
              <span className="text-xs font-bold text-white/80 uppercase tracking-widest">{row.original.nationality}</span>
            </>
          ) : <span className="text-white/20">—</span>}
        </div>
      )
    },
    {
      id: "actions",
      header: "",
      cell: () => (
        <div className="flex justify-end pr-2">
          <ChevronRight className="h-5 w-5 text-white/20 transition-transform group-hover:text-asas-gold group-hover:translate-x-1" />
        </div>
      )
    }
  ], [])

  return (
    <div className="flex flex-col h-full font-sans text-white relative pt-4 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-white/5 shrink-0 px-6">
        <div>
          <div className="flex items-center gap-2 mb-2 hidden sm:flex">
            <div className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 rounded text-[9px] text-purple-400 uppercase font-bold tracking-widest flex items-center gap-1">
               <Users className="w-3 h-3" />
               <span>Customer 360 Active</span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight flex items-center gap-3">
             Customer 360°
          </h1>
          <p className="text-[10px] uppercase tracking-widest font-bold text-[#D4A64F] mt-2 flex items-center gap-2 hidden sm:flex">
            <span className="relative flex h-2 w-2">
             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-asas-gold opacity-75"></span>
             <span className="relative inline-flex rounded-full h-2 w-2 bg-asas-gold"></span>
            </span>
            HubSpot Sync • {total} identités enregistrées
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-[#D4A64F] hover:bg-[#E0B96B] text-[#051121] rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(212,166,79,0.3)] hover:shadow-[0_0_20px_rgba(212,166,79,0.5)] shrink-0">
          <Plus className="h-4 w-4" strokeWidth={2} /> Nouveau Profil
        </button>
      </div>

      <div className="flex-1 w-full flex flex-col items-center justify-center relative overflow-hidden px-6 pb-6">
        {loading ? (
          <div className="w-full space-y-3 mt-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 w-full bg-white/5 border border-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col">
             <DataTable 
               columns={columns} 
               data={clients} 
               searchKey="full_name" 
               searchPlaceholder="Rechercher entité..." 
               onRowClick={(row) => setSelectedClientId(row.id)}
             />
          </div>
        )}
      </div>

      {isModalOpen && (
        <ClientCreateModal
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false)
            loadClients()
          }}
        />
      )}
      <Client360Drawer
        clientId={selectedClientId}
        onClose={() => setSelectedClientId(null)}
      />
    </div>
  )
}
