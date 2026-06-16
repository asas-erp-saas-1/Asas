'use client';

import Link from 'next/link';
import { ArrowRight, Building2, Workflow, BarChart3, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export function LandingContent() {
  return (
    <div className="min-h-screen bg-[#06152D] text-white overflow-hidden relative selection:bg-asas-gold/30 selection:text-white">
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
         <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-[radial-gradient(ellipse_at_top_right,_rgba(212,166,79,0.05),_transparent_70%)]"></div>
         <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-[radial-gradient(circle_at_bottom_left,_rgba(12,38,77,0.5),_transparent_60%)]"></div>
      </div>

      {/* Navigation */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#0A1629]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-white/10 to-transparent border border-asas-gold/30 flex items-center justify-center relative shadow-[0_0_15px_rgba(212,166,79,0.2)]">
              <div className="absolute inset-0 bg-asas-gold/10 rounded-xl blur-md"></div>
              <Building2 className="w-5 h-5 text-asas-gold relative z-10" />
            </div>
            <p className="font-display font-bold text-white tracking-tight leading-none text-xl flex items-center gap-2">
              ASAS <span className="text-white/20 font-light text-base">|</span> <span className="font-sans font-medium text-lg text-asas-gold">أساس</span>
            </p>
          </div>
          <div className="flex items-center gap-6 text-[10px] uppercase tracking-widest font-bold text-white/50">
            <Link href="#features" className="hover:text-white transition-colors">Fonctionnalités</Link>
            <Link href="/login" className="hidden sm:flex px-6 py-3 bg-asas-gold text-[#06152D] hover:bg-[#E0B96B] rounded-xl transition-all items-center gap-2 group shadow-[0_0_20px_rgba(212,166,79,0.3)]">
              Accès O.S <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20 relative z-10">
        {/* Hero Section */}
        <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 text-center flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-asas-gold/10 border border-asas-gold/20 text-[#D4A64F] text-[10px] font-bold uppercase tracking-[0.2em] mb-8 shadow-[0_0_15px_rgba(212,166,79,0.15)]"
          >
            <Zap className="w-3.5 h-3.5" />
            Nouvelle génération d'ERP Immobilier
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-8 font-display max-w-4xl"
          >
            Le premier véritable <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4A64F] to-[#E0B96B]">Système d'Exploitation</span> Immobilier.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-white/50 font-medium max-w-2xl mb-12 leading-relaxed"
          >
            ASAS unifie votre agence : CRM, gestion de pipeline, rapprochement bancaire, et génération de leads dans une interface d’une rapidité chirurgicale.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-asas-gold hover:bg-[#E0B96B] text-[#06152D] rounded-xl transition-all text-xs uppercase tracking-widest font-extrabold flex items-center justify-center gap-2 group shadow-[0_0_30px_rgba(212,166,79,0.3)] transform hover:scale-[1.02] active:scale-95">
              Initialiser ASAS <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" strokeWidth={2} />
            </Link>
            <Link href="#features" className="w-full sm:w-auto px-8 py-4 bg-[#0A1829]/60 backdrop-blur-xl border border-white/5 hover:border-white/10 hover:bg-white/5 text-white/80 rounded-xl transition-all text-xs uppercase tracking-widest font-extrabold flex items-center justify-center gap-2">
              Explorer l'architecture
            </Link>
          </motion.div>
        </section>

        {/* Feature Grid */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-24 relative">
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
           <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight font-display mb-4">Architecture modulaire.</h2>
              <p className="text-white/50 font-medium max-w-xl mx-auto">Chaque module est conçu pour fonctionner en parfaite synchronicité avec le reste du système.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FeatureCard 
                icon={<Building2 className="w-6 h-6 text-[#D4A64F]" />}
                title="Gestion de Propriétés"
                description="Inventaire en temps réel, suivi de disponibilité et cycle de vie complet de chaque actif immobilier."
              />
              <FeatureCard 
                icon={<Workflow className="w-6 h-6 text-green-400" />}
                title="CRM & Pipeline"
                description="Acquisition, tracking et conversion des leads via un pipeline ultra-fluide et prédictif."
              />
              <FeatureCard 
                icon={<BarChart3 className="w-6 h-6 text-blue-400" />}
                title="Analyses Financières"
                description="Rapprochement direct, prévisions de trésorerie et tableaux de bord analytiques complexes."
              />
           </div>
        </section>
      </main>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-[#0A1829]/60 backdrop-blur-3xl border border-white/5 p-8 rounded-[2rem] hover:border-white/10 transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] group overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] transform scale-150 group-hover:scale-110 transition-transform duration-700 pointer-events-none">
        {icon}
      </div>
      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 relative z-10 shadow-inner">
        {icon}
      </div>
      <h3 className="text-xl font-bold tracking-tight mb-3 text-white">{title}</h3>
      <p className="text-sm text-white/50 font-medium leading-relaxed">{description}</p>
    </div>
  )
}

