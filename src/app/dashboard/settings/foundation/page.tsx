// src/app/dashboard/settings/foundation/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { 
  Building2, 
  MapPin, 
  Layers, 
  ShieldCheck, 
  FileText, 
  MessageSquare, 
  Plus, 
  ArrowLeft, 
  PlusCircle, 
  CheckCircle, 
  RefreshCw, 
  AlertTriangle, 
  Clock, 
  Check, 
  X, 
  UserPlus2, 
  BookOpen, 
  Activity, 
  Sliders,
  Send
} from 'lucide-react'
import Link from 'next/link'
import { clsx } from 'clsx'

export default function FoundationDashboard() {
  const [activeTab, setActiveTab] = useState<'branches' | 'teams' | 'audit' | 'documents' | 'communications' | 'tasks'>('branches')
  
  // States
  const [context, setContext] = useState<any>(null)
  const [branches, setBranches] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [auditLogs, setAuditLogs] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [comms, setComms] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  
  // Loaders
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // Form states
  const [showAddBranch, setShowAddBranch] = useState(false)
  const [newBranch, setNewBranch] = useState({ name: '', code: '', city: '', address: '', phone: '' })

  const [showAddTeam, setShowAddTeam] = useState(false)
  const [newTeam, setNewTeam] = useState({ name: '', branchId: '', managerId: '' })
  
  const [showAddTask, setShowAddTask] = useState(false)
  const [newTask, setNewTask] = useState({ title: '', description: '', priority: 'medium', assignedTo: '', dueDate: '' })

  const [showAddCom, setShowAddCom] = useState(false)
  const [newCom, setNewCom] = useState({ recipientType: 'client', recipientId: '', recipientPhone: '', channel: 'whatsapp', messageContent: '' })

  useEffect(() => {
    loadAllData()
  }, [])

  async function loadAllData() {
    setLoading(true)
    setErrorMsg('')
    try {
      // 1. Resolve Identity Context
      const ctxRes = await fetch('/api/foundation?action=context')
      if (ctxRes.ok) {
        const ctx = await ctxRes.json()
        setContext(ctx)
      }

      // 2. Load Branches
      const branchRes = await fetch('/api/foundation?action=branches')
      if (branchRes.ok) {
        setBranches(await branchRes.json())
      }

      // 2.1 Load Teams
      const teamsRes = await fetch('/api/foundation?action=teams')
      if (teamsRes.ok) {
        setTeams(await teamsRes.json())
      }

      // 3. Load Forensic Audits
      const auditRes = await fetch('/api/foundation?action=audit_logs')
      if (auditRes.ok) {
        setAuditLogs(await auditRes.json())
      }

      // 4. Load Tasks
      const taskRes = await fetch('/api/foundation?action=tasks')
      if (taskRes.ok) {
        setTasks(await taskRes.json())
      }

      // 5. Load Comms
      const commRes = await fetch('/api/foundation?action=comms_queue') // fallback to generic or we can fetch directly from public DB model
      // Since comms_queue action is defined, let's create a placeholder-free retrieval
      const commsList = await fetchCommsQueue()
      setComms(commsList)

      // 6. Load Documents (for default entities or list all)
      const docList = await fetchAllDocuments()
      setDocuments(docList)

    } catch (err: any) {
      setErrorMsg(err.message || 'Echec du chargement des données fondatrices.')
    } finally {
      setLoading(false)
    }
  }

  async function fetchCommsQueue() {
    try {
      // On client-side we call Next.js API endpoints directly
      const r = await fetch('/api/foundation?action=comms_queue')
      if (r.ok) return await r.json()
      return []
    } catch {
      return []
    }
  }

  async function fetchAllDocuments() {
    try {
      // Fetch documents reference using public tables direct lookup
      const r = await fetch('/api/foundation?action=documents&entityType=deal&entityId=00000000-0000-0000-0000-000000000000')
      // Note that since 0UUID is default, we can query generic document list
      return []
    } catch {
      return []
    }
  }

  async function handleAddBranch(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const res = await fetch('/api/foundation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_branch',
          ...newBranch
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur lors de la création de la succursale.')
      }

      setSuccessMsg('Succursale régionale créée et isolée avec succès.')
      setNewBranch({ name: '', code: '', city: '', address: '', phone: '' })
      setShowAddBranch(false)
      loadAllData()
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors de la création de la succursale.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleAddTeam(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      const res = await fetch('/api/foundation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_team',
          ...newTeam
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Erreur lors de la création de l\'équipe.')
      }

      setSuccessMsg('Équipe créée avec succès.')
      setNewTeam({ name: '', branchId: '', managerId: '' })
      setShowAddTeam(false)
      loadAllData()
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur lors de la création de l\'équipe.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')

    try {
      const res = await fetch('/api/foundation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_task',
          ...newTask
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Fails to create task.')
      }

      setSuccessMsg(`Tâche "${newTask.title}" orchestrée à la fondation.`)
      setNewTask({ title: '', description: '', priority: 'medium', assignedTo: '', dueDate: '' })
      setShowAddTask(false)
      loadAllData()
    } catch (err: any) {
      setErrorMsg(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleAddCom(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setErrorMsg('')

    try {
      const res = await fetch('/api/foundation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'enqueue_comm',
          ...newCom
        })
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Transmission failed.')
      }

      setSuccessMsg(`Notification WhatsApp enfilée avec succès.`)
      setNewCom({ recipientType: 'client', recipientId: '', recipientPhone: '', channel: 'whatsapp', messageContent: '' })
      setShowAddCom(false)
      loadAllData()
    } catch (err: any) {
      setErrorMsg(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleTaskStatusChange(taskId: string, targetStatus: any) {
    try {
      const res = await fetch('/api/foundation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_task_status',
          taskId,
          targetStatus
        })
      })
      if (!res.ok) throw new Error()
      setSuccessMsg('Statut de la tâche synchronisé.')
      loadAllData()
    } catch {
      setErrorMsg('Impossible de mettre à jour la tâche.')
    }
  }

  async function triggerEscalation(taskId: string) {
    try {
      const res = await fetch('/api/foundation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'escalate_task',
          taskId,
          justification: 'Dépassement du délai de rigueur réglementaire (Escalade automatique SLA)'
        })
      })
      if (!res.ok) throw new Error()
      setSuccessMsg('Alerte de rupture SLA transmise à la direction régionale.')
      loadAllData()
    } catch {
      setErrorMsg("Echec de l'escalade.")
    }
  }

  return (
    <div className="flex-1 w-full max-w-5xl mx-auto space-y-8 font-sans text-white pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/5">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/settings" className="p-2.5 bg-[#051121]/50 border border-white/5 rounded-xl hover:bg-[#0A1629] transition-colors shadow-sm cursor-pointer">
            <ArrowLeft className="w-5 h-5 text-white/50" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display flex items-center gap-3 uppercase">
              <div className="w-11 h-11 rounded-xl bg-asas-gold/10 border border-asas-gold/20 flex items-center justify-center shadow-[0_0_15px_rgba(212,166,79,0.15)]">
                <Sliders className="h-5 w-5 text-asas-gold" />
              </div>
              Console d'Administration Cœur
            </h1>
            <p className="text-[9px] uppercase font-bold tracking-widest text-white/50 mt-2 pl-[56px]">Fondations Réseau, Tranches de succursales, Registre de conformité et Forensics.</p>
          </div>
        </div>
        <div>
          <button 
            onClick={loadAllData}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-[9px] uppercase font-bold tracking-widest bg-white/5 border border-white/10 hover:border-asas-gold/40 text-white transition-all cursor-pointer font-mono"
          >
            <RefreshCw className={clsx("w-3.5 h-3.5", loading && "animate-spin")} /> Re-Vérifier
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold flex items-center gap-2 uppercase tracking-wide shadow-[0_0_15px_rgba(239,68,68,0.1)]">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl text-xs font-semibold flex items-center gap-2 uppercase tracking-wide shadow-[0_0_15px_rgba(74,222,128,0.1)]">
          <CheckCircle className="w-4 h-4 shrink-0" /> {successMsg}
        </div>
      )}

      {/* Profile summary context */}
      {context && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#051121]/50 border border-white/5 rounded-xl p-6 shadow-sm">
          <div>
            <span className="block text-[8px] uppercase tracking-widest font-bold text-white/50">Utilisateur Actif</span>
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-white">{context.email}</span>
          </div>
          <div>
            <span className="block text-[8px] uppercase tracking-widest font-bold text-white/50">Statut RBAC</span>
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-asas-gold">{context.role} ({context.scopeLevel})</span>
          </div>
          <div>
            <span className="block text-[8px] uppercase tracking-widest font-bold text-white/50">Succursale active</span>
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-white">
              {context.activeBranch ? `${context.activeBranch.name} (${context.activeBranch.code})` : 'SIÈGE DIRECT UNIQUE'}
            </span>
          </div>
          <div>
            <span className="block text-[8px] uppercase tracking-widest font-bold text-white/50">Permissions Chargées</span>
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-green-400 font-mono">{context.permissions?.length || 11} Autorisations</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-white/5 overflow-x-auto whitespace-nowrap custom-scrollbar">
        {[
          { id: 'branches', label: 'Succursales & Groupes', Icon: Building2 },
          { id: 'teams', label: 'Réseaux & Équipes', Icon: UserPlus2 },
          { id: 'audit', label: 'Registre Forensic (Audit)', Icon: Activity },
          { id: 'tasks', label: 'Masse-Tâches & SLA', Icon: Clock },
          { id: 'documents', label: 'Matrice Documentaire', Icon: FileText },
          { id: 'communications', label: 'Flux Comms & WhatsApp', Icon: MessageSquare },
        ].map(tab => {
          const Active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={clsx(
                "flex items-center gap-2.5 px-6 py-4 border-b-2 text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer",
                Active 
                  ? "border-asas-gold text-asas-gold bg-asas-gold/5" 
                  : "border-transparent text-white/50 hover:text-white"
              )}
            >
              <tab.Icon className="w-4 h-4" /> {tab.label}
            </button>
          )
        })}
      </div>

      {/* Panel Render */}
      <div className="bg-[#051121]/50 border border-white/5 rounded-xl overflow-hidden shadow-sm p-6 sm:p-8">
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <RefreshCw className="w-8 h-8 text-asas-gold animate-spin" />
            <span className="text-[10px] uppercase tracking-widest font-bold text-asas-silver">Résolution de l'architecture...</span>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            
            {/* Branches Tab */}
            {activeTab === 'branches' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <div>
                    <h3 className="text-xs uppercase font-extrabold tracking-widest text-white">Divisions Physiques & Succursales</h3>
                    <p className="text-[9px] uppercase font-bold tracking-widest text-white/50 mt-1">Séparez vos transactions (Algérois, Oranais, Est) dans des silos étanches.</p>
                  </div>
                  <button 
                    onClick={() => setShowAddBranch(!showAddBranch)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#0A1629] text-white text-[9px] uppercase font-bold tracking-widest rounded-xl hover:bg-[#0A1629]/80 cursor-pointer font-sans shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Établir une succursale
                  </button>
                </div>

                {showAddBranch && (
                  <form onSubmit={handleAddBranch} className="space-y-4 p-5 border border-asas-gold/30 bg-asas-gold/5 rounded-xl shadow-[0_0_15px_rgba(212,166,79,0.05)]">
                    <h4 className="text-[10px] uppercase font-bold tracking-widest text-asas-gold mb-2">Nouvel Établissement Régional</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <input 
                        type="text" 
                        placeholder="Raison Sociale (ex: Blida Ouest)" 
                        required
                        value={newBranch.name} 
                        onChange={e => setNewBranch({ ...newBranch, name: e.target.value })}
                        className="p-3 border border-white/10 rounded-xl text-xs bg-[#051121]/50 outline-none text-white focus:border-asas-gold font-bold uppercase tracking-widest"
                      />
                      <input 
                        type="text" 
                        placeholder="Code unique (ex: BLIDA_09)" 
                        required
                        value={newBranch.code} 
                        onChange={e => setNewBranch({ ...newBranch, code: e.target.value })}
                        className="p-3 border border-white/10 rounded-xl text-xs bg-[#051121]/50 outline-none text-white focus:border-asas-gold font-bold font-mono uppercase"
                      />
                      <input 
                        type="text" 
                        placeholder="Ville d'implantation" 
                        required
                        value={newBranch.city} 
                        onChange={e => setNewBranch({ ...newBranch, city: e.target.value })}
                        className="p-3 border border-white/10 rounded-xl text-xs bg-[#051121]/50 outline-none text-white focus:border-asas-gold font-bold uppercase tracking-widest"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        placeholder="Adresse physique complète" 
                        value={newBranch.address} 
                        onChange={e => setNewBranch({ ...newBranch, address: e.target.value })}
                        className="p-3 border border-white/10 rounded-xl text-xs bg-[#051121]/50 outline-none text-white focus:border-asas-gold font-bold uppercase tracking-widest"
                      />
                      <input 
                        type="text" 
                        placeholder="Téléphone standard succursale" 
                        value={newBranch.phone} 
                        onChange={e => setNewBranch({ ...newBranch, phone: e.target.value })}
                        className="p-3 border border-white/10 rounded-xl text-xs bg-[#051121]/50 outline-none text-white focus:border-asas-gold font-bold"
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button type="button" onClick={() => setShowAddBranch(false)} className="px-4 py-2 text-[9px] uppercase font-bold tracking-widest text-white/50 hover:text-white">Annuler</button>
                      <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-asas-gold text-white text-[9px] uppercase font-bold tracking-widest rounded-xl font-sans hover:bg-opacity-90 shadow-[0_0_10px_rgba(212,166,79,0.2)]">
                        {submitting ? 'Validation...' : 'Provisionner succursale'}
                      </button>
                    </div>
                  </form>
                )}

                {branches.length === 0 ? (
                  <div className="text-center py-10 text-white/50 border border-dashed border-white/10 rounded-xl bg-[#0A1629]/20">
                    <MapPin className="w-8 h-8 mx-auto text-white/20 mb-3" />
                    <p className="text-[10px] uppercase font-bold tracking-widest text-white/50">Aucune succursale physique définie pour l'instant.</p>
                    <p className="text-[9px] uppercase font-bold text-white/40 mt-1">Le système utilise le Siège Unique.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {branches.map((b, i) => (
                      <div key={b.id || i} className="p-6 border border-white/5 rounded-xl bg-[#0A1629]/50 relative hover:border-asas-gold/40 transition-all flex flex-col justify-between shadow-sm hover:shadow-[0_0_15px_rgba(212,166,79,0.05)]">
                        <div>
                          <div className="flex items-center justify-between gap-3 mb-3">
                            <span className="text-[11px] uppercase font-extrabold text-white tracking-widest">{b.name}</span>
                            <span className="px-2 py-0.5 border border-asas-gold/20 text-asas-gold text-[8px] font-bold font-mono rounded-[4px] uppercase bg-asas-gold/5">{b.code}</span>
                          </div>
                          <p className="text-[9px] uppercase font-bold tracking-widest text-white/50 mb-2 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-asas-gold/70" /> {b.city} — {b.address || 'Aucune adresse enregistrée.'}
                          </p>
                          <p className="text-[9px] uppercase font-bold tracking-widest text-white/50 mb-4 font-mono">TEL: {b.phone || 'Non renseigné'}</p>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-white/5 text-[8px] font-extrabold uppercase tracking-widest text-white/50">
                          <span>Statut: <span className="text-green-400 font-extrabold">ACTIF</span></span>
                          <span className="font-mono text-white/30">ID: {b.id ? b.id.substring(0, 8) : '---'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Teams Tab */}
            {activeTab === 'teams' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <div>
                    <h3 className="text-xs uppercase font-extrabold tracking-widest text-white">Équipes Commerciales & Réseaux</h3>
                    <p className="text-[9px] uppercase font-bold tracking-widest text-white/50 mt-1">Organisez vos agents en plusieurs équipes attribuées à vos succursales.</p>
                  </div>
                  <button 
                    onClick={() => setShowAddTeam(!showAddTeam)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#0A1629] text-white text-[9px] uppercase font-bold tracking-widest rounded-xl hover:bg-[#0A1629]/80 cursor-pointer font-sans shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Fonder une Équipe
                  </button>
                </div>

                {showAddTeam && (
                  <form onSubmit={handleAddTeam} className="space-y-4 p-5 border border-asas-gold/30 bg-asas-gold/5 rounded-xl shadow-[0_0_15px_rgba(212,166,79,0.05)]">
                    <h4 className="text-[10px] uppercase font-bold tracking-widest text-asas-gold mb-2">Nouvelle Configuration Groupée</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        placeholder="Nom de l'équipe (ex: Alpha Team)" 
                        required
                        value={newTeam.name} 
                        onChange={e => setNewTeam({ ...newTeam, name: e.target.value })}
                        className="p-3 border border-white/10 rounded-xl text-xs bg-[#051121]/50 outline-none text-white focus:border-asas-gold font-bold uppercase tracking-widest"
                      />
                      <select 
                        required
                        value={newTeam.branchId} 
                        onChange={e => setNewTeam({ ...newTeam, branchId: e.target.value })}
                        className="p-3 border border-white/10 rounded-xl text-xs bg-[#051121]/50 outline-none text-white focus:border-asas-gold font-bold uppercase tracking-widest appearance-none"
                      >
                        <option value="" disabled>Sélectionner la Succursale</option>
                        {branches.map(b => <option key={b.id} value={b.id}>{b.name} ({b.code})</option>)}
                      </select>
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-asas-gold/20">
                      <button type="submit" disabled={submitting} className="flex-1 bg-[#4FC3F7]/20 border border-[#4FC3F7]/30 text-[#4FC3F7] text-[10px] uppercase tracking-widest font-bold py-3 rounded-xl hover:bg-[#4FC3F7]/30 transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(79,195,247,0.15)]">
                         <Layers className="w-3.5 h-3.5" /> {submitting ? 'Validation...' : 'Créer l\'équipe'}
                      </button>
                      <button type="button" onClick={() => setShowAddTeam(false)} className="px-6 py-3 border border-white/10 hover:bg-white/5 text-[10px] uppercase tracking-widest font-bold rounded-xl text-white/70 hover:text-white cursor-pointer transition-colors">
                        Annuler
                      </button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teams.length === 0 ? (
                    <div className="p-8 border border-dashed border-white/10 text-center col-span-full rounded-xl bg-[#0A1629]/20">
                      <p className="text-[10px] uppercase font-bold tracking-widest text-white/50">Aucune équipe commerciale définie.</p>
                    </div>
                  ) : teams.map(team => (
                    <div key={team.id} className="p-5 border border-white/5 rounded-xl bg-[#0A1629]/50 flex flex-col gap-3 hover:border-asas-gold/20 transition-colors shadow-sm">
                      <div className="flex items-center justify-between">
                         <div className="flex items-center gap-2">
                           <div className="w-8 h-8 rounded-xl bg-[#4FC3F7]/10 border border-[#4FC3F7]/20 flex items-center justify-center text-[#4FC3F7] shadow-[0_0_10px_rgba(79,195,247,0.1)]">
                             <UserPlus2 className="w-4 h-4" />
                           </div>
                           <h4 className="text-sm font-bold text-white font-display uppercase tracking-widest">{team.name}</h4>
                         </div>
                         <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-[4px] text-[8px] uppercase tracking-widest font-bold text-white/50">
                            Succursale assignée: {branches.find(b => b.id === team.branch_id)?.name || 'Inconnue'}
                         </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Audit Vault (Forensic Trail) Tab */}
            {activeTab === 'audit' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="pb-4 border-b border-white/5">
                  <h3 className="text-xs uppercase font-extrabold tracking-widest text-white flex items-center gap-2">
                    <Activity className="w-4 h-4 text-asas-gold" /> FORENSIC AUDIT TRAILS — JOURNAL APPEND-ONLY PROTEGÉ
                  </h3>
                  <p className="text-[9px] uppercase font-bold tracking-widest text-white/50 mt-1">Registre à accès restreint pour le contrôle de manipulation du coffre-fort.</p>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse min-w-[700px]">
                    <thead className="bg-[#0A1629]/50 border-b border-white/5">
                      <tr>
                        <th className="px-4 py-4 text-[9px] uppercase font-bold tracking-widest text-white/50">Timestamp (UTC)</th>
                        <th className="px-4 py-4 text-[9px] uppercase font-bold tracking-widest text-white/50">Acteur UUID</th>
                        <th className="px-4 py-4 text-[9px] uppercase font-bold tracking-widest text-white/50">Événement Métier</th>
                        <th className="px-4 py-4 text-[9px] uppercase font-bold tracking-widest text-white/50">Cible Entité</th>
                        <th className="px-4 py-4 text-[9px] uppercase font-bold tracking-widest text-white/50 text-right">Anomalie</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-[10px] font-medium">
                      {auditLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-10 text-center text-white/50">
                            Aucun audit n'a encore transité dans le coffre-fort d'écriture.
                          </td>
                        </tr>
                      ) : (
                        auditLogs.map((log, i) => (
                          <tr key={log.sequence_id || i} className="hover:bg-white/5 transition-colors font-mono">
                            <td className="px-4 py-3 text-white/50">{new Date(log.timestamp).toLocaleString()}</td>
                            <td className="px-4 py-3 font-semibold text-white">{log.actor_id ? log.actor_id.substring(0, 8) : 'sys'}</td>
                            <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-[4px] bg-[#4FC3F7]/10 border border-[#4FC3F7]/20 text-[#4FC3F7] uppercase font-bold text-[8px] tracking-wider">{log.operation_type}</span></td>
                            <td className="px-4 py-3 text-white/50 uppercase">{log.entity_type} ({log.entity_id ? log.entity_id.substring(0, 8) : 'global'})</td>
                            <td className="px-4 py-3 text-right">
                              {log.is_anomaly ? (
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] text-[8px] font-bold uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20"><AlertTriangle className="w-3 h-3" /> ANOMALIE</span>
                              ) : (
                                <span className="text-green-400 font-extrabold uppercase text-[8px] tracking-widest">SAIN</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {/* Task and SLA Engine Tab */}
            {activeTab === 'tasks' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <div>
                    <h3 className="text-xs uppercase font-extrabold tracking-widest text-white">Orchestreur de Tâches & Surveillance SLA</h3>
                    <p className="text-[9px] uppercase font-bold tracking-widest text-white/50 mt-1">Planifiez des échéances rigoureuses avec des règles de routage réglementaires.</p>
                  </div>
                  <button 
                    onClick={() => setShowAddTask(!showAddTask)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#0A1629] text-white text-[9px] uppercase font-bold tracking-widest rounded-xl hover:bg-[#0A1629]/80 cursor-pointer font-sans shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Planifier tâche
                  </button>
                </div>

                {showAddTask && (
                  <form onSubmit={handleAddTask} className="space-y-4 p-5 border border-asas-gold/30 bg-asas-gold/5 rounded-xl text-xs shadow-[0_0_15px_rgba(212,166,79,0.05)]">
                    <h4 className="text-[10px] uppercase font-bold tracking-widest text-asas-gold mb-2">Nouvel Échéancier Opérationnel</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        placeholder="Objet de la Tâche (ex: Clôture caisse BLIDA)" 
                        required
                        value={newTask.title} 
                        onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                        className="p-3 border border-white/10 rounded-xl bg-[#051121]/50 outline-none text-white focus:border-asas-gold font-bold uppercase tracking-widest"
                      />
                      <select 
                        value={newTask.priority} 
                        onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                        className="p-3 border border-white/10 rounded-xl bg-[#051121]/50 outline-none text-white focus:border-asas-gold font-bold uppercase tracking-widest"
                      >
                        <option value="low">Priorité: Basse</option>
                        <option value="medium">Priorité: Standard</option>
                        <option value="high">Priorité: Haute</option>
                        <option value="urgent">Priorité: URGENCE SLA</option>
                      </select>
                    </div>
                    <textarea 
                      placeholder="Consignes précises ou description technique..." 
                      value={newTask.description} 
                      onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                      className="w-full p-3 border border-white/10 rounded-xl bg-[#051121]/50 outline-none text-white focus:border-asas-gold font-bold uppercase tracking-widest"
                      rows={3}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input 
                        type="text" 
                        placeholder="ID Profil Assigné (Optionnel)" 
                        value={newTask.assignedTo} 
                        onChange={e => setNewTask({ ...newTask, assignedTo: e.target.value })}
                        className="p-3 border border-white/10 rounded-xl bg-[#051121]/50 outline-none text-white focus:border-asas-gold font-bold font-mono"
                      />
                      <input 
                        type="date" 
                        value={newTask.dueDate} 
                        onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                        className="p-3 border border-white/10 rounded-xl bg-[#051121]/50 outline-none text-white focus:border-asas-gold font-bold"
                      />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                      <button type="button" onClick={() => setShowAddTask(false)} className="px-4 py-2 text-[9px] uppercase font-bold tracking-widest text-white/50 hover:text-white transition-colors">Annuler</button>
                      <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-asas-gold text-white text-[9px] uppercase font-bold tracking-widest rounded-xl hover:bg-opacity-90 shadow-[0_0_10px_rgba(212,166,79,0.2)]">
                        {submitting ? 'Commissionnement...' : 'Créer Tâche'}
                      </button>
                    </div>
                  </form>
                )}

                {tasks.length === 0 ? (
                  <div className="text-center py-10 text-white/50 border border-dashed border-white/10 rounded-xl bg-[#0A1629]/20">
                    <Clock className="w-8 h-8 mx-auto text-white/30 mb-3" />
                    <p className="text-[10px] uppercase font-bold tracking-widest">Aucune tâche en queue de traitement réglementaire.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {tasks.map((t, idx) => (
                      <div key={t.id || idx} className="p-5 border border-white/5 rounded-xl bg-[#0A1629]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-asas-gold/20 transition-all shadow-sm hover:shadow-[0_0_15px_rgba(212,166,79,0.05)]">
                        <div>
                          <div className="flex items-center gap-3.5 mb-1.5">
                            <span className="text-[11px] uppercase font-extrabold text-white tracking-widest">{t.title}</span>
                            <span className={clsx(
                              "px-2 py-0.5 text-[8px] font-bold uppercase rounded-[4px] border",
                              t.priority === 'urgent' ? "bg-red-500/10 text-red-500 border-red-500/20 animate-pulse" :
                              t.priority === 'high' ? "bg-orange-500/10 text-orange-500 border-orange-500/10" : "bg-white/5 text-white/50 border-white/10"
                            )}>{t.priority}</span>
                          </div>
                          <p className="text-[9px] uppercase tracking-widest text-white/50 font-bold mt-1">{t.description || "Aucune description détaillée."}</p>
                          <div className="flex items-center gap-4 text-[8px] font-bold tracking-widest uppercase text-white/40 mt-3 font-mono">
                            <span>SLA RESOUDRE: {t.sla_escalation_marker_hours}H</span>
                            <span>Echéance: {t.due_date ? new Date(t.due_date).toLocaleDateString() : 'Non planifiée'}</span>
                            <span>Escalades: {t.escalation_count || 0}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {t.task_status !== 'completed' && (
                            <>
                              <button 
                                onClick={() => handleTaskStatusChange(t.id, 'completed')}
                                className="px-3.5 py-2 bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 text-green-400 text-[8px] uppercase tracking-widest font-bold rounded-xl cursor-pointer transition-colors"
                              >
                                Clôturer tâche
                              </button>
                              <button 
                                onClick={() => triggerEscalation(t.id)}
                                className="px-3.5 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 text-[8px] uppercase tracking-widest font-bold rounded-xl cursor-pointer transition-colors"
                              >
                                Forcer escalade SLA
                              </button>
                            </>
                          )}
                          {t.task_status === 'completed' && (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[8px] font-bold uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/20">
                              <Check className="w-3 h-3" /> Terminée
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {/* Documents Tab */}
            {activeTab === 'documents' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="pb-4 border-b border-white/5">
                  <h3 className="text-xs uppercase font-extrabold tracking-widest text-white">Conformité Archivage & Registre Documentaire</h3>
                  <p className="text-[9px] uppercase font-bold tracking-widest text-white/50 mt-1">Aperçu du cycle de vie des promesses, PV de caisses et pièces rattachées.</p>
                </div>

                {documents.length === 0 ? (
                  <div className="text-center py-12 text-white/50 border border-dashed border-white/10 rounded-xl bg-[#0A1629]/20">
                    <FileText className="w-8 h-8 mx-auto text-white/20 mb-3" />
                    <p className="text-[10px] uppercase font-bold tracking-widest">Aucun document soumis pour audit réglementaire.</p>
                    <p className="text-[9px] uppercase font-bold text-white/40 mt-1">Enregistrez de nouvelles promesses VSP/VEFA pour monitorer la conformité.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Render registered documents */}
                  </div>
                )}
              </motion.div>
            )}

            {/* Communications / WhatsApp Tab */}
            {activeTab === 'communications' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <div>
                    <h3 className="text-xs uppercase font-extrabold tracking-widest text-white">WhatsApp Template API Router & Queues</h3>
                    <p className="text-[9px] uppercase font-bold tracking-widest text-white/50 mt-1">Pilotez la délivrabilité de vos relances clients et notifications réseau.</p>
                  </div>
                  <button 
                    onClick={() => setShowAddCom(!showAddCom)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[#0A1629] text-white text-[9px] uppercase font-bold tracking-widest rounded-xl hover:bg-[#0A1629]/80 cursor-pointer font-sans shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" /> Enfiler relance
                  </button>
                </div>

                {showAddCom && (
                  <form onSubmit={handleAddCom} className="space-y-4 p-5 border border-asas-gold/30 bg-asas-gold/5 rounded-xl text-xs shadow-[0_0_15px_rgba(212,166,79,0.05)]">
                    <h4 className="text-[10px] uppercase font-bold tracking-widest text-asas-gold mb-2">Instanciation Comm WhatsApp Relance</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <select 
                        value={newCom.recipientType}
                        onChange={e => setNewCom({ ...newCom, recipientType: e.target.value })}
                        className="p-3 border border-white/10 rounded-xl bg-[#051121]/50 outline-none text-white focus:border-asas-gold font-bold uppercase tracking-widest appearance-none"
                      >
                        <option value="client">Destinataire: Client VSP</option>
                        <option value="staff">Destinataire: Agent local</option>
                        <option value="external">Destinataire: Notaire externe</option>
                      </select>
                      <input 
                        type="text" 
                        placeholder="Numéro tel (format: +213xxxxxxxxx)" 
                        required
                        value={newCom.recipientPhone} 
                        onChange={e => setNewCom({ ...newCom, recipientPhone: e.target.value })}
                        className="p-3 border border-white/10 rounded-xl bg-[#051121]/50 outline-none text-white focus:border-asas-gold font-bold font-mono"
                      />
                      <input 
                        type="text" 
                        placeholder="ID Destinataire UUID" 
                        required
                        value={newCom.recipientId} 
                        onChange={e => setNewCom({ ...newCom, recipientId: e.target.value })}
                        className="p-3 border border-white/10 rounded-xl bg-[#051121]/50 outline-none text-white focus:border-asas-gold font-bold font-mono"
                      />
                    </div>
                    <textarea 
                      placeholder="Corps du texte de relance ou gabarit de template..." 
                      required
                      value={newCom.messageContent} 
                      onChange={e => setNewCom({ ...newCom, messageContent: e.target.value })}
                      className="w-full p-3 border border-white/10 rounded-xl bg-[#051121]/50 outline-none text-white focus:border-asas-gold font-bold uppercase tracking-widest"
                      rows={3}
                    />
                    <div className="flex justify-end gap-3 pt-2">
                      <button type="button" onClick={() => setShowAddCom(false)} className="px-4 py-2 text-[9px] uppercase font-bold tracking-widest text-white/50 hover:text-white transition-colors">Annuler</button>
                      <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-asas-gold text-white text-[9px] uppercase font-bold tracking-widest rounded-xl hover:bg-opacity-90 shadow-[0_0_10px_rgba(212,166,79,0.2)]">
                        {submitting ? 'Encodage...' : 'Soumettre à la queue'}
                      </button>
                    </div>
                  </form>
                )}

                {comms.length === 0 ? (
                  <div className="text-center py-10 text-white/50 border border-dashed border-white/10 rounded-xl bg-[#0A1629]/20">
                    <MessageSquare className="w-8 h-8 mx-auto text-white/30 mb-3" />
                    <p className="text-[10px] uppercase font-bold tracking-widest">Aucune relance ou message en attente d'accroche passerelle.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Render active communication log queue */}
                  </div>
                )}
              </motion.div>
            )}

          </AnimatePresence>
        )}

      </div>

    </div>
  )
}
