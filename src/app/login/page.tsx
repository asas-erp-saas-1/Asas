'use client';
import { Suspense, useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter, useSearchParams } from 'next/navigation';
import { Building2, ShieldCheck, ArrowRight, Lock, Cloud, Shield, Activity, Users, TrendingUp, DollarSign } from 'lucide-react';
import Link from 'next/link';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [showMfa, setShowMfa] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [factorId, setFactorId] = useState('');

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { supabase, isMock } = getSupabase();

    if (isMock) {
      setTimeout(() => {
        router.push('/dashboard/overview');
      }, 1000);
      return;
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      if (signInError.message === 'Failed to fetch') {
        setError("Erreur de connexion au serveur d'authentification. Vérifiez votre URL Supabase (NEXT_PUBLIC_SUPABASE_URL) ou votre connexion.");
      } else {
        setError(signInError.message === 'Invalid login credentials' ? 'Email ou mot de passe incorrect' : signInError.message);
      }
      setLoading(false);
      return;
    }

    // Check MFA
    const { data: mfaData, error: mfaError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (mfaError) {
      setError(mfaError.message);
      setLoading(false);
      return;
    }

    if (mfaData.nextLevel === 'aal2' && mfaData.currentLevel === 'aal1') {
      // User has MFA enabled, find a TOTP factor
      const factors = await supabase.auth.mfa.listFactors();
      const totpFactor = factors.data?.totp?.[0];
      if (totpFactor) {
        setFactorId(totpFactor.id);
        setShowMfa(true);
      } else {
        await checkAgencyAndRedirect(supabase, data.user!.id);
      }
      setLoading(false);
      return;
    }

    await checkAgencyAndRedirect(supabase, data.user!.id);
  };

  const checkAgencyAndRedirect = async (supabase: any, userId: string) => {
    if (inviteCode) {
       router.push(`/invite/${inviteCode}`);
       return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('agency_id')
      .eq('id', userId)
      .single();

    if (profile && !profile.agency_id) {
       router.push('/onboarding');
    } else {
       router.push('/dashboard/overview');
    }
  };

  const handleMfaChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { supabase } = getSupabase();

    const challenge = await supabase.auth.mfa.challenge({ factorId });
    if (challenge.error) {
      setError(challenge.error.message);
      setLoading(false);
      return;
    }

    const verify = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.data.id,
      code: mfaCode,
    });

    if (verify.error) {
      setError(verify.error.message);
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    await checkAgencyAndRedirect(supabase, user!.id);
  };

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
            {showMfa ? 'Vérification.' : 'Bon retour,'}
          </h2>
          <p className="text-white/60 text-base">
            {showMfa ? 'Veuillez confirmer votre identité.' : 'Connectez-vous à votre espace ASAS OS.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl mb-6 flex items-start gap-3 backdrop-blur-md">
             <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <span className="font-medium">{error}</span>
          </div>
        )}

        {!showMfa ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">Adresse Email</label>
              <div className="relative group">
                 {/* Input Glow */}
                 <div className="absolute -inset-0.5 bg-gradient-to-r from-asas-gold/0 via-asas-gold/30 to-asas-gold/0 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                 <div className="relative flex items-center bg-[#071321]/80 border border-white/10 rounded-xl overflow-hidden transition-all group-focus-within:border-asas-gold/50 shadow-inner">
                    <div className="pl-4 pr-3 text-white/40">
                       <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent py-4 pr-4 pl-1 text-white placeholder-white/30 focus:outline-none focus:ring-0"
                      placeholder="nom@entreprise.com"
                    />
                 </div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-white/80">Mot de passe</label>
                <a href="#" className="text-sm font-medium text-asas-gold hover:text-white transition-colors">Oublié ?</a>
              </div>
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
                 <span className="text-[#06152D] font-bold text-lg tracking-wide">{loading ? 'Connexion...' : 'Se connecter'}</span>
                 {!loading && <ArrowRight className="w-5 h-5 text-[#06152D]" strokeWidth={2} />}
              </div>
            </button>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-[#0A1829] text-white/40 tracking-wider uppercase text-xs font-semibold">Ou continuer avec</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
               <button type="button" className="flex items-center justify-center gap-3 w-full py-3.5 border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-white text-sm font-medium group relative overflow-hidden">
                  <svg className="w-5 h-5 z-10 relative" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  <span className="z-10 relative">Google</span>
               </button>
               <button type="button" className="flex items-center justify-center gap-3 w-full py-3.5 border border-white/10 bg-white/5 hover:bg-white/10 rounded-xl transition-all text-white text-sm font-medium group relative overflow-hidden">
                  <svg className="w-5 h-5 z-10 relative" viewBox="0 0 21 21"><path d="M10 0H0v10h10V0zM21 0H11v10h10V0zM10 11H0v10h10V11zM21 11H11v10h10V11z" fill="#00a4ef"/></svg>
                  <span className="z-10 relative">Microsoft</span>
               </button>
            </div>

            {/* Enterprise Trust Section */}
            <div className="mt-8 border border-white/10 bg-white/5 rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
              
              <div className="flex items-center gap-3 mb-4">
                 <ShieldCheck className="w-5 h-5 text-asas-gold" strokeWidth={1.5} />
                 <h3 className="text-sm font-semibold text-white">Sécurité de niveau entreprise</h3>
              </div>
              <div className="grid grid-cols-3 gap-2">
                 <div className="flex flex-col items-center justify-center text-center gap-2">
                   <Lock className="w-4 h-4 text-white/50" />
                   <span className="text-[10px] text-white/50 leading-tight">Données<br/>chiffrées</span>
                 </div>
                 <div className="flex flex-col items-center justify-center text-center gap-2 border-l border-white/10">
                   <Cloud className="w-4 h-4 text-white/50" />
                   <span className="text-[10px] text-white/50 leading-tight">Infra cloud<br/>sécurisée</span>
                 </div>
                 <div className="flex flex-col items-center justify-center text-center gap-2 border-l border-white/10">
                   <Shield className="w-4 h-4 text-white/50" />
                   <span className="text-[10px] text-white/50 leading-tight">Conforme<br/>RGPD</span>
                 </div>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-white/50">
              Nouveau sur ASAS OS ?{' '}
              <Link href="/signup" className="font-semibold text-asas-gold hover:text-white transition-colors">
                Créer un compte
              </Link>
            </p>
          </form>
        ) : (
          <form onSubmit={handleMfaChallenge} className="flex flex-col gap-6">
            <div className="flex justify-center p-4">
              <div className="w-20 h-20 bg-blue-900/40 rounded-full flex items-center justify-center border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                 <ShieldCheck className="w-10 h-10 text-blue-400" strokeWidth={1.5} />
              </div>
            </div>
            <p className="text-sm text-center text-white/60 mb-2">
              Ouvrez votre application d'authentification (Google Authenticator, Authy, etc.) et saisissez le code à 6 chiffres.
            </p>
            <div>
              <label className="block text-sm font-medium text-center text-white/80 mb-2">Code d'authentification</label>
              <input
                type="text"
                required
                maxLength={6}
                value={mfaCode}
                onChange={(e) => setMfaCode(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full bg-[#071321]/80 border border-white/10 rounded-xl px-4 py-5 text-white focus:outline-none focus:ring-2 focus:ring-asas-gold/50 focus:border-asas-gold transition-all font-mono text-center text-4xl tracking-[0.4em] font-light shadow-inner"
                placeholder="000000"
                autoComplete="one-time-code"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading || mfaCode.length !== 6}
              className="w-full relative overflow-hidden group mt-4 rounded-xl disabled:opacity-50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#D4A64F] to-[#E0B96B] transition-transform duration-500 transform group-hover:scale-[1.03]"></div>
              <div className="relative py-4 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(212,166,79,0.3)]">
                 <span className="text-[#06152D] font-bold text-lg tracking-wide">{loading ? 'Vérification...' : 'Valider authentification'}</span>
              </div>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
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
           <LoginForm />
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
                 Le système d'exploitation<br/>
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E0B96B] to-[#D4A64F]">de votre entreprise</span>
              </h2>
              <p className="text-lg text-white/60 max-w-lg leading-relaxed font-light">
                 Centralisez, gérez et développez votre activité en toute simplicité. Pilotez vos processus avec une intelligence artificielle intégrée.
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

