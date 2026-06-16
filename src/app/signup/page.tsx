'use client';
import { Suspense, useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, ArrowRight, Lock, User, Mail, ShieldCheck, Activity, Users, TrendingUp } from 'lucide-react';
import Link from 'next/link';

function SignupForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteCode = searchParams?.get('invite');

  useEffect(() => {
    if (inviteCode) {
      localStorage.setItem('asa_invite_code', inviteCode);
    }
  }, [inviteCode]);

  const getSupabase = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
    return { supabase: createBrowserClient(supabaseUrl, supabaseKey), isMock: supabaseUrl === 'https://placeholder.supabase.co' };
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { supabase, isMock } = getSupabase();

    if (isMock) {
      setTimeout(() => {
        setSuccess(true);
      }, 1000);
      return;
    }

    // Register user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user && authData.session) {
      if (inviteCode) {
        router.push(`/invite/${inviteCode}`);
      } else {
        router.push('/onboarding');
      }
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-[480px] mx-auto min-h-screen py-10 flex flex-col justify-center relative z-10 px-4 sm:px-0">
        <div className="bg-[#0A1829]/60 backdrop-blur-3xl border border-white/5 rounded-3xl p-8 sm:p-12 shadow-[0_0_100px_rgba(0,0,0,0.5)] text-center">
            <div className="w-20 h-20 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
               <svg className="w-10 h-10 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
               </svg>
            </div>
            <h2 className="text-3xl font-display font-semibold text-white mb-4 tracking-tight">Vérifiez votre Email</h2>
            <p className="text-white/60 text-base mb-8 leading-relaxed">
              Un lien de confirmation a été envoyé à <strong className="text-white font-medium">{email}</strong>.<br/>Cliquez sur ce lien pour activer votre compte.
            </p>
            <button onClick={() => router.push('/login')} className="w-full relative overflow-hidden group mt-2 rounded-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-[#D4A64F] to-[#E0B96B] transition-transform duration-500 transform group-hover:scale-[1.03]"></div>
              <div className="relative py-4 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(212,166,79,0.3)]">
                 <span className="text-[#06152D] font-bold text-lg tracking-wide">Retour à la connexion</span>
              </div>
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[480px] mx-auto min-h-screen py-10 flex flex-col justify-center relative z-10 px-4 sm:px-0">
      
      {/* Floating Glass Card */}
      <div className="bg-[#0A1829]/60 backdrop-blur-3xl border border-white/5 rounded-3xl p-8 sm:p-12 shadow-[0_0_100px_rgba(0,0,0,0.5)]">
        
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-white/10 to-transparent border border-asas-gold/30 flex items-center justify-center shadow-lg mb-6 relative">
            <div className="absolute inset-0 bg-asas-gold/10 rounded-2xl blur-xl"></div>
            <Building2 className="w-8 h-8 text-asas-gold relative z-10" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight flex items-center gap-2">
            ASAS <span className="text-asas-gold">OS</span>
          </h1>
          <p className="text-sm font-medium text-white/50 tracking-widest uppercase mt-2">
            Enterprise Management Platform
          </p>
        </div>

        <div className="mb-8 font-sans">
          <h2 className="text-3xl font-semibold text-white mb-2 tracking-tight">
            Créer un compte
          </h2>
          <p className="text-white/60 text-base">
            Démarrez avec l'environnement ASAS OS.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl mb-6 flex items-start gap-3 backdrop-blur-md">
             <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSignup} className="flex flex-col gap-6">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Nom Complet</label>
            <div className="relative group">
               {/* Input Glow */}
               <div className="absolute -inset-0.5 bg-gradient-to-r from-asas-gold/0 via-asas-gold/30 to-asas-gold/0 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
               <div className="relative flex items-center bg-[#071321]/80 border border-white/10 rounded-xl overflow-hidden transition-all group-focus-within:border-asas-gold/50 shadow-inner">
                  <div className="pl-4 pr-3 text-white/40">
                     <User className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-transparent py-4 pr-4 pl-1 text-white placeholder-white/30 focus:outline-none focus:ring-0"
                    placeholder="Jean Dupont"
                  />
               </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Email Professionnel</label>
            <div className="relative group">
               {/* Input Glow */}
               <div className="absolute -inset-0.5 bg-gradient-to-r from-asas-gold/0 via-asas-gold/30 to-asas-gold/0 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
               <div className="relative flex items-center bg-[#071321]/80 border border-white/10 rounded-xl overflow-hidden transition-all group-focus-within:border-asas-gold/50 shadow-inner">
                  <div className="pl-4 pr-3 text-white/40">
                     <Mail className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent py-4 pr-4 pl-1 text-white placeholder-white/30 focus:outline-none focus:ring-0"
                    placeholder="jean@monentreprise.com"
                  />
               </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Mot de passe</label>
            <div className="relative group">
               {/* Input Glow */}
               <div className="absolute -inset-0.5 bg-gradient-to-r from-asas-gold/0 via-asas-gold/30 to-asas-gold/0 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
               <div className="relative flex items-center bg-[#071321]/80 border border-white/10 rounded-xl overflow-hidden transition-all group-focus-within:border-asas-gold/50 shadow-inner">
                  <div className="pl-4 pr-3 text-white/40">
                     <Lock className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-transparent py-4 pr-4 pl-1 text-white placeholder-white/30 focus:outline-none focus:ring-0 tracking-widest"
                    placeholder="••••••••"
                  />
               </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full relative overflow-hidden group mt-2 rounded-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#D4A64F] to-[#E0B96B] transition-transform duration-500 transform group-hover:scale-[1.03]"></div>
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
            <div className="relative py-4 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(212,166,79,0.3)]">
               <span className="text-[#06152D] font-bold text-lg tracking-wide">{loading ? 'Création...' : 'S\'inscrire'}</span>
               {!loading && <ArrowRight className="w-5 h-5 text-[#06152D]" strokeWidth={2} />}
            </div>
          </button>
          
          <p className="mt-8 text-center text-sm text-white/50">
            Déjà un compte ?{' '}
            <Link href="/login" className="font-semibold text-asas-gold hover:text-white transition-colors">
              Se connecter
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex text-asas-sand bg-[#06152D] relative overflow-hidden font-sans">
      
      {/* GLOBAL BACKGROUND SYSTEM */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
         {/* Deep radial gradient */}
         <div className="absolute top-0 right-0 w-full h-[150%] bg-[radial-gradient(ellipse_at_top_right,_rgba(12,38,77,0.8),_transparent_70%)]"></div>
         <div className="absolute bottom-0 left-0 w-[60%] h-[80%] bg-[radial-gradient(circle_at_bottom_left,_rgba(8,27,51,1),_transparent_60%)]"></div>
         
         {/* Futuristic Grid Overlay */}
         <div className="absolute inset-0 opacity-[0.03] mix-blend-screen"
              style={{
                backgroundImage: `linear-gradient(rgba(255, 255, 255, 1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 1) 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
                transform: 'perspective(1000px) rotateX(40deg) scale(1.5) translateY(-10%)',
                transformOrigin: 'top center'
              }}>
         </div>

         {/* Glow Orbs */}
         <div className="absolute top-[20%] left-[20%] w-[30vw] h-[30vw] bg-blue-500/10 rounded-full blur-[120px] animate-pulse"></div>
         <div className="absolute bottom-[20%] right-[10%] w-[40vw] h-[40vw] bg-asas-gold/5 rounded-full blur-[150px]"></div>
      </div>

      {/* LEFT SIDE - AUTH PANEL */}
      <div className="w-full lg:w-[45%] flex-shrink-0 flex items-center justify-center relative z-10">
        <Suspense fallback={<div className="flex justify-center p-8"><div className="w-8 h-8 border-2 border-asas-gold border-t-transparent rounded-full animate-spin"></div></div>}>
          <SignupForm />
        </Suspense>
        <div className="absolute bottom-8 left-0 right-0 text-center text-xs text-white/30 font-medium">
           © {new Date().getFullYear()} ASAS OS. Tous droits réservés.
        </div>
      </div>

      {/* RIGHT SIDE - ENTERPRISE VISUALIZATION */}
      <div className="hidden lg:flex lg:flex-1 relative z-10 items-center justify-center p-12 lg:p-20 border-l border-white/5 bg-gradient-to-r from-transparent to-black/20">
        
        <div className="w-full max-w-[800px] flex flex-col gap-12 pt-10">
           
           {/* Marketing Text */}
           <div>
              <h2 className="text-4xl lg:text-5xl font-display font-medium text-white leading-tight mb-4 tracking-tight">
                 Conçu pour<br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E0B96B] to-[#D4A64F]">l'hyper-croissance</span>
              </h2>
              <p className="text-lg text-white/60 max-w-lg leading-relaxed font-light">
                 Déployez l'ERP immobilier nouvelle génération en quelques minutes. Une plateforme robuste, intelligente et évolutive.
              </p>
           </div>

           {/* Dashboard Preview Mockup Container */}
           <div className="relative w-full aspect-[16/10] bg-[#0A1629] rounded-2xl border border-white/10 shadow-[0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden flex transform-gpu hover:scale-[1.02] transition-transform duration-700">
              
              {/* Fake Sidebar */}
              <div className="w-[200px] h-full bg-[#051121] border-r border-white/5 flex flex-col pt-6">
                 <div className="px-5 mb-8 flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-asas-gold" />
                    <span className="font-display font-bold text-sm tracking-widest text-white">ASAS OS</span>
                 </div>
                 <div className="flex flex-col px-3 gap-1">
                    {['Tableau de bord', 'Clients', 'Ventes', 'Projets', 'Facturation', 'RH & Paie', 'Stocks'].map((item, i) => (
                      <div key={i} className={`px-3 py-2.5 rounded-lg text-xs font-medium flex items-center gap-3 ${i === 0 ? 'bg-asas-gold/10 text-asas-gold' : 'text-white/50 hover:bg-white/5 hover:text-white'}`}>
                        {i === 0 && <Activity className="w-4 h-4" />}
                        {i === 1 && <Users className="w-4 h-4" />}
                        {i === 2 && <TrendingUp className="w-4 h-4" />}
                        {i > 2 && <div className="w-4 h-4 bg-white/10 rounded-sm"></div>}
                        {item}
                      </div>
                    ))}
                 </div>
              </div>

              {/* Fake Main Content */}
              <div className="flex-1 h-full bg-[#0A1629] p-8 flex flex-col relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-asas-gold/5 rounded-full blur-[80px]"></div>
                 
                 <div className="flex justify-between items-center mb-8">
                    <h3 className="text-xl font-display font-medium text-white tracking-tight">Tableau de bord</h3>
                    <div className="flex gap-2">
                       <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10"></div>
                       <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10"></div>
                    </div>
                 </div>

                 {/* KPI Cards */}
                 <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-[#051121]/50 border border-white/5 rounded-xl p-5">
                       <p className="text-white/40 text-[10px] uppercase tracking-wider font-semibold mb-2">Chiffre d'affaires</p>
                       <p className="text-2xl font-display text-white mb-2">2,45M €</p>
                       <p className="text-green-400 text-xs font-medium">+12.5%</p>
                       <div className="mt-4 h-8 w-full border-b border-green-500/30 relative">
                          <svg className="w-full h-full text-green-500/50" viewBox="0 0 100 30" preserveAspectRatio="none">
                             <path d="M0 30 L 10 25 L 20 28 L 30 20 L 40 22 L 50 15 L 60 18 L 70 8 L 80 12 L 90 2 L 100 5 V 30 H 0 Z" fill="currentColor" opacity="0.2"/>
                             <path d="M0 30 L 10 25 L 20 28 L 30 20 L 40 22 L 50 15 L 60 18 L 70 8 L 80 12 L 90 2 L 100 5" fill="none" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                       </div>
                    </div>
                    <div className="bg-[#051121]/50 border border-white/5 rounded-xl p-5">
                       <p className="text-white/40 text-[10px] uppercase tracking-wider font-semibold mb-2">Clients actifs</p>
                       <p className="text-2xl font-display text-white mb-2">1,245</p>
                       <p className="text-green-400 text-xs font-medium">+8.2%</p>
                       <div className="mt-4 h-8 w-full border-b border-green-500/30 relative">
                          <svg className="w-full h-full text-green-500/50" viewBox="0 0 100 30" preserveAspectRatio="none">
                             <path d="M0 30 L 10 15 L 20 18 L 30 10 L 40 12 L 50 8 L 60 15 L 70 5 L 80 8 L 90 2 L 100 6 V 30 H 0 Z" fill="currentColor" opacity="0.2"/>
                             <path d="M0 30 L 10 15 L 20 18 L 30 10 L 40 12 L 50 8 L 60 15 L 70 5 L 80 8 L 90 2 L 100 6" fill="none" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                       </div>
                    </div>
                 </div>

                 {/* Main Chart Fake */}
                 <div className="flex-1 bg-[#051121]/50 border border-white/5 rounded-xl p-5 flex flex-col relative overflow-hidden">
                    <p className="text-white/60 text-sm font-medium mb-4">Évolution des ventes</p>
                    <div className="flex-1 relative mt-4 border-l border-b border-white/10">
                       <div className="absolute bottom-0 w-full h-[60%] bg-gradient-to-t from-asas-gold/10 to-transparent"></div>
                       {/* Chart Line */}
                       <svg className="w-full h-full absolute inset-0 text-asas-gold" viewBox="0 0 100 100" preserveAspectRatio="none">
                          <path d="M0 80 Q 10 70 20 75 T 40 60 T 60 50 T 80 30 T 100 10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          <circle cx="20" cy="75" r="2" fill="currentColor" />
                          <circle cx="40" cy="60" r="2" fill="currentColor" />
                          <circle cx="60" cy="50" r="2" fill="currentColor" />
                          <circle cx="80" cy="30" r="2" fill="currentColor" />
                          <circle cx="100" cy="10" r="3" fill="#fff" stroke="currentColor" strokeWidth="2" />
                       </svg>
                       <div className="absolute top-[5%] right-[2%] bg-asas-gold text-[#06152D] font-bold text-[10px] px-2 py-1 rounded-md shadow-lg">2,45M €</div>
                    </div>
                 </div>

              </div>
           </div>

           {/* Features Highlight */}
           <div className="grid grid-cols-2 gap-x-12 gap-y-8">
              <div className="flex items-start gap-4">
                 <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
                    <TrendingUp className="w-5 h-5 text-blue-400" />
                 </div>
                 <div>
                    <h4 className="text-white font-semibold text-lg mb-1">Performance</h4>
                    <p className="text-white/50 text-sm">Optimisez vos processus et accélérez votre croissance.</p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="w-12 h-12 rounded-full bg-asas-gold/10 flex items-center justify-center border border-asas-gold/20 shrink-0">
                    <Activity className="w-5 h-5 text-asas-gold" />
                 </div>
                 <div>
                    <h4 className="text-white font-semibold text-lg mb-1">Vision 360°</h4>
                    <p className="text-white/50 text-sm">Pilotage en temps réel avec indicateurs clés et IA intégrée.</p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center border border-green-500/20 shrink-0">
                    <ShieldCheck className="w-5 h-5 text-green-400" />
                 </div>
                 <div>
                    <h4 className="text-white font-semibold text-lg mb-1">Sécurité</h4>
                    <p className="text-white/50 text-sm">Vos données sont en sécurité maximale (chiffrement, RGPD).</p>
                 </div>
              </div>
              <div className="flex items-start gap-4">
                 <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20 shrink-0">
                    <Activity className="w-5 h-5 text-purple-400" />
                 </div>
                 <div>
                    <h4 className="text-white font-semibold text-lg mb-1">Évolutif</h4>
                    <p className="text-white/50 text-sm">Conçu pour grandir avec vous, adapté aux PME et Grands Comptes.</p>
                 </div>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}
