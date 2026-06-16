'use client'

import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Check, Copy, Share2, Smartphone, RefreshCw, Send, Mail } from 'lucide-react'
import { clsx } from 'clsx'

export function AppInviteWidget() {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('agent')
  const [copied, setCopied] = useState(false)
  const [inviteToken, setInviteToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [errorResponse, setErrorResponse] = useState<string | null>(null)

  const generateInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setErrorResponse(null);
    try {
      const res = await fetch('/api/invite/generate', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, email }) 
      });
      
      if (res.ok) {
        const data = await res.json();
        setInviteToken(data.token);
        setSuccess(true);
      } else {
        const data = await res.json();
        setErrorResponse(data.error || 'Erreur lors de la génération.');
      }
    } catch (err) {
      console.error(err);
      setErrorResponse('Erreur réseau.');
    }
    setLoading(false);
  }

  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return "https://app.asas.dz";
  }

  const inviteLink = `${getBaseUrl()}/invite/${inviteToken}`
  const welcomeMessage = `Salam, voici ton invitation pour rejoindre l'agence sur ASAS ERP !\nRôle: ${role.toUpperCase()}\nLien: ${inviteLink}`

  const handleCopy = () => {
    navigator.clipboard.writeText(welcomeMessage)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(welcomeMessage)}`, '_blank')
  }

  const resetForm = () => {
    setSuccess(false);
    setEmail('');
    setInviteToken('');
  }

  return (
    <div className="bg-[#051121]/50 border border-white/5 rounded-xl p-8 shadow-sm relative overflow-hidden mb-8 group hover:border-asas-gold/20 transition-colors">
      <div className="relative z-10 flex flex-col md:flex-row gap-8">
        <div className="flex-1 text-white">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.15)]">
               <Share2 className="w-4 h-4 text-blue-400" />
             </div>
             <h2 className="text-sm font-bold uppercase tracking-widest font-display text-white">Inviter un Collaborateur</h2>
          </div>
          <p className="text-[10px] font-bold text-white/50 leading-relaxed mb-6 max-w-lg">
            Générez une invitation sécurisée pour un nouvel agent ou manager. Une fois générée, vous pouvez copier le lien ou l'envoyer par WhatsApp.
          </p>

          {!success ? (
            <form onSubmit={generateInvite} className="space-y-4 max-w-sm">
              <div>
                <label className="block text-[9px] uppercase tracking-widest font-bold text-white/50 mb-2">Email du collaborateur</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-white/40" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 bg-black/50 border border-white/10 text-white rounded-xl text-[11px] focus:outline-none focus:border-asas-gold/50 transition-colors shadow-inner"
                    placeholder="agent@agence.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[9px] uppercase tracking-widest font-bold text-white/50 mb-2">Rôle</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3 py-2 bg-black/50 border border-white/10 text-white rounded-xl text-[11px] focus:outline-none focus:border-asas-gold/50 transition-colors appearance-none cursor-pointer shadow-inner"
                >
                  <option value="agent">Agent Commercial</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              {errorResponse && (
                <p className="text-[10px] text-red-500 font-bold">{errorResponse}</p>
              )}

              <button 
                type="submit"
                disabled={loading}
                className={clsx(
                  "w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[9px] uppercase tracking-widest font-bold transition-all shadow-sm cursor-pointer border border-transparent shadow-[0_0_15px_rgba(212,166,79,0.2)] transform hover:scale-[1.02] active:scale-95",
                  "bg-asas-gold text-[#06152D] hover:bg-[#E0B96B]",
                  loading && "opacity-50 transform-none hover:bg-asas-gold"
                )}
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin text-[#06152D]" /> : <Send className="w-4 h-4" />}
                Générer l'invitation
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button 
                  onClick={handleCopy}
                  className={clsx(
                    "flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[9px] uppercase tracking-widest font-bold transition-all shadow-sm cursor-pointer",
                    copied ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-white/5 text-white border border-white/10 hover:bg-white/10"
                  )}
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Lien Copié !" : "Copier le lien d'invitation"}
                </button>
                <button 
                  onClick={handleWhatsApp}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[9px] uppercase tracking-widest font-bold text-[#25D366] bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-colors shadow-sm cursor-pointer"
                >
                  <Smartphone className="w-4 h-4" />
                  Envoyer par WhatsApp
                </button>
              </div>
              <button 
                onClick={resetForm}
                className="text-[9px] uppercase tracking-widest font-bold text-white/50 hover:text-asas-gold transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-3 h-3 text-white/50" /> Nouvelle invitation
              </button>
            </div>
          )}
        </div>

        {success && (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full md:w-auto p-4 bg-white/5 border border-white/10 rounded-xl self-start"
          >
            <div className="bg-black/50 rounded-xl p-4 w-full md:w-72 shadow-inner border border-white/5">
              <p className="text-[9px] text-white/50 font-bold mb-2 uppercase tracking-widest flex items-center justify-between">
                Aperçu du message
              </p>
              <p className="text-[10px] font-bold text-white font-mono whitespace-pre-wrap">{welcomeMessage}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
