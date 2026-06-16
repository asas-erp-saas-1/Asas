'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Users, Shield, ShieldAlert, ShieldCheck, Mail, ArrowLeft, CheckCircle2, UserX } from 'lucide-react'
import Link from 'next/link'
import { clsx } from 'clsx'
import { AppInviteWidget } from '@/app/dashboard/settings/AppInviteWidget'

type Profile = {
  id: string
  full_name: string
  email: string
  role: 'owner' | 'manager' | 'agent' | 'accountant' | 'marketer' | 'promoter'
  status: 'active' | 'suspended'
  last_active: string | null
}

const ROLE_LABELS: Record<string, string> = {
  owner: 'Administrateur',
  manager: 'Manager',
  agent: 'Agent Commercial',
  accountant: 'Comptable',
  marketer: 'Marketeur',
  promoter: 'Promoteur'
}

const ROLE_ICONS: Record<string, React.ReactNode> = {
  owner: <ShieldAlert className="w-4 h-4 text-purple-500" />,
  manager: <ShieldCheck className="w-4 h-4 text-asas-navy dark:text-asas-sand" />,
  agent: <Shield className="w-4 h-4 text-asas-silver" />,
  accountant: <Shield className="w-4 h-4 text-asas-copper" />,
  marketer: <Shield className="w-4 h-4 text-pink-500" />,
  promoter: <Shield className="w-4 h-4 text-blue-500" />
}

export function TeamManagementClient({ initialProfiles, currentUserRole }: { initialProfiles: Profile[], currentUserRole: string }) {
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles)
  const [processing, setProcessing] = useState<string | null>(null)

  const handleRoleChange = async (profileId: string, newRole: string) => {
    setProcessing(profileId)
    try {
      const res = await fetch(`/api/settings/team/${profileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change_role', role: newRole })
      })
      if (!res.ok) throw new Error('Role update failed')
      setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, role: newRole as any } : p))
    } catch (e) {
      console.error(e)
      alert("Erreur lors de la modification du rôle.")
    } finally {
      setProcessing(null)
    }
  }

  const handleStatusChange = async (profileId: string, newStatus: string) => {
    setProcessing(profileId)
    try {
      const res = await fetch(`/api/settings/team/${profileId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'change_status', status: newStatus })
      })
      if (!res.ok) throw new Error('Status update failed')
      setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, status: newStatus as any } : p))
    } catch (e) {
      console.error(e)
      alert("Erreur lors de la suspension.")
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto space-y-8 font-sans text-white">
      <div className="flex items-center gap-4 mb-4 shrink-0">
        <Link href="/dashboard/settings" className="p-2 bg-[#051121]/50 border border-white/5 rounded-xl hover:bg-[#0A1629] transition-colors shadow-sm">
          <ArrowLeft className="w-5 h-5 text-white/50" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-center gap-3 font-display uppercase">
            <div className="w-10 h-10 rounded-xl bg-asas-gold/10 border border-asas-gold/20 flex items-center justify-center shadow-[0_0_15px_rgba(212,166,79,0.15)]">
              <Users className="h-5 w-5 text-asas-gold" />
            </div>
            Gestion des Accès (RBAC)
          </h1>
          <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest mt-2 pl-[52px]">Contrôle des rôles et autorisations d'équipe</p>
        </div>
      </div>

      <AppInviteWidget />

      <div className="bg-[#051121]/50 border border-white/5 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[600px]">
             <thead className="bg-[#0A1629] border-b border-white/5">
                <tr>
                   <th className="px-6 py-4 text-[9px] uppercase font-bold tracking-widest text-white/50">Utilisateur</th>
                   <th className="px-6 py-4 text-[9px] uppercase font-bold tracking-widest text-white/50">Contact</th>
                   <th className="px-6 py-4 text-[9px] uppercase font-bold tracking-widest text-white/50">Rôle RBAC</th>
                   <th className="px-6 py-4 text-[9px] uppercase font-bold tracking-widest text-white/50">Statut</th>
                   <th className="px-6 py-4 text-[9px] uppercase font-bold tracking-widest text-white/50 text-right">Actions</th>
                </tr>
             </thead>
             <tbody className="divide-y divide-white/5">
                <AnimatePresence>
                   {profiles.map((p) => {
                     const isProcessing = processing === p.id;
                     return (
                        <motion.tr 
                          key={p.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className={clsx(
                             "group transition-colors",
                             isProcessing ? "opacity-50 pointer-events-none" : "hover:bg-white/5"
                          )}
                        >
                           <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center text-white font-bold font-mono shadow-inner">
                                    {p.full_name.charAt(0).toUpperCase() || 'U'}
                                 </div>
                                 <span className="text-[10px] uppercase tracking-widest font-bold text-white">{p.full_name}</span>
                              </div>
                           </td>
                           <td className="px-6 py-5">
                              <div className="flex items-center gap-2 text-[10px] font-bold text-white/50">
                                 <Mail className="w-3 h-3" /> {p.email}
                              </div>
                           </td>
                           <td className="px-6 py-5">
                              <div className="flex items-center gap-2">
                                {ROLE_ICONS[p.role]}
                                <select 
                                   disabled={currentUserRole !== 'owner' || p.role === 'owner'}
                                   value={p.role}
                                   onChange={(e) => handleRoleChange(p.id, e.target.value)}
                                   className="bg-transparent text-[10px] uppercase font-bold tracking-widest text-white outline-none cursor-pointer appearance-none disabled:opacity-50 hover:opacity-80 transition-opacity"
                                >
                                   <option value="owner" className="bg-[#051121] text-white" disabled>Administrateur</option>
                                   <option value="manager" className="bg-[#051121] text-white">Manager</option>
                                   <option value="agent" className="bg-[#051121] text-white">Agent Commercial</option>
                                </select>
                              </div>
                           </td>
                           <td className="px-6 py-5">
                              {p.status === 'active' ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[9px] font-bold uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_15px_rgba(74,222,128,0.1)]">
                                  <CheckCircle2 className="w-3 h-3" /> Actif
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[9px] font-bold uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                                  <UserX className="w-3 h-3" /> Suspendu
                                </span>
                              )}
                           </td>
                           <td className="px-6 py-5 text-right">
                              {currentUserRole === 'owner' && p.role !== 'owner' && (
                                 <button
                                   onClick={() => handleStatusChange(p.id, p.status === 'active' ? 'suspended' : 'active')}
                                   className={clsx(
                                      "text-[9px] font-bold transition-colors px-3 py-1.5 rounded-xl uppercase tracking-widest cursor-pointer",
                                      p.status === 'active' ? "text-red-400 hover:bg-red-500/10" : "text-green-400 hover:bg-green-500/10"
                                   )}
                                 >
                                   {p.status === 'active' ? 'Suspendre' : 'Réactiver'}
                                 </button>
                              )}
                           </td>
                        </motion.tr>
                     )
                   })}
                </AnimatePresence>
             </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
