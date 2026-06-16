'use client';
import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { Building2, Rocket, ArrowRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function OnboardingPage() {
  const [agencyName, setAgencyName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  
  const router = useRouter();

  const getSupabase = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
    return { supabase: createBrowserClient(supabaseUrl, supabaseKey), isMock: supabaseUrl === 'https://placeholder.supabase.co' };
  };

  useEffect(() => {
    const checkStatus = async () => {
      // Check for pending invite
      const pendingInvite = localStorage.getItem('asa_invite_code');
      if (pendingInvite) {
        // Clear it so we don't infinitely loop if it's invalid
        localStorage.removeItem('asa_invite_code');
        router.push(`/invite/${pendingInvite}`);
        return;
      }

      const { supabase, isMock } = getSupabase();
      if (isMock) {
        setChecking(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      // Check if user already has an agency
      const { data: profile } = await supabase
        .from('profiles')
        .select('agency_id')
        .eq('id', user.id)
        .single();
        
      if (profile?.agency_id) {
         router.push('/dashboard/overview');
      } else {
         setChecking(false);
      }
    };
    
    checkStatus();
  }, [router]);

  const handleOnboarding = async (e: React.FormEvent) => {
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

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // We should call a secure RPC to create the agency and link the profile
      const { data, error: rpcError } = await supabase.rpc('create_agency_and_link_owner', {
        _agency_name: agencyName,
        _agency_phone: phone,
        _user_id: user.id
      });

      if (rpcError) {
        // Fallback: doing it directly if RPC doesn't exist yet (though it should be protected by RLS)
        // Actually, let's just do it directly with the service role key internally, or an RPC. 
        // We will do a direct insert, assuming RLS allows insertion into agencies for authenticated users.
        const { data: newAgency, error: createError } = await supabase
          .from('agencies')
          .insert({ name: agencyName, phone: phone })
          .select('id')
          .single();
          
        if (createError) throw new Error("Impossible de créer l'agence. " + createError.message);
        
        const { error: linkError } = await supabase
          .from('profiles')
          .update({ agency_id: newAgency.id, role: 'owner' })
          .eq('id', user.id);
          
        if (linkError) throw new Error("Impossible de lier votre profil.");
      }

      // Force session refresh for RLS policies checking profiles.agency_id
      await supabase.auth.refreshSession();
      router.push('/dashboard/overview');
      
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (checking) {
     return (
       <div className="min-h-screen bg-[#06152D] flex flex-col items-center justify-center relative overflow-hidden font-sans">
         <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none"></div>
         <div className="absolute bottom-0 right-1/4 w-[600px] h-[300px] bg-asas-gold/10 rounded-full blur-[100px] pointer-events-none"></div>
         <div className="flex flex-col items-center gap-6 z-10">
           <div className="w-12 h-12 border-4 border-white/10 border-t-asas-gold rounded-full animate-spin"></div>
           <p className="text-white/60 font-medium tracking-wide">Préparation de votre espace...</p>
         </div>
       </div>
     );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#06152D] py-12 px-4 sm:px-6 relative overflow-hidden font-sans">
      
      {/* GLOBAL BACKGROUND SYSTEM */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
         <div className="absolute top-0 right-0 w-[80%] h-[80%] bg-[radial-gradient(ellipse_at_top_right,_rgba(12,38,77,0.8),_transparent_70%)]"></div>
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

      <motion.div 
         initial={{ opacity: 0, scale: 0.98, y: 10 }}
         animate={{ opacity: 1, scale: 1, y: 0 }}
         transition={{ duration: 0.5, ease: 'easeOut' }}
         className="w-full max-w-xl bg-[#0A1829]/60 backdrop-blur-3xl border border-white/5 rounded-3xl p-8 sm:p-12 shadow-[0_0_100px_rgba(0,0,0,0.5)] z-10 relative"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-osas-gold/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="flex flex-col items-center text-center mb-10 relative z-10">
          <div className="w-20 h-20 bg-gradient-to-b from-white/10 to-transparent border border-asas-gold/30 rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(199,161,90,0.15)] relative">
            <div className="absolute inset-0 bg-asas-gold/10 rounded-2xl blur-xl"></div>
            <Rocket className="w-10 h-10 text-asas-gold relative z-10" strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl font-display font-semibold text-white mb-3 tracking-tight">Configuration de l'espace</h2>
          <p className="text-white/50 text-base max-w-sm">
            Vous êtes le créateur de ce workspace. Initialisez l'environnement de votre entreprise en quelques secondes.
          </p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl flex items-start gap-3 overflow-hidden backdrop-blur-md"
            >
              <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
              <span className="font-medium">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleOnboarding} className="flex flex-col gap-6 relative z-10">
          <div className="bg-[#071321]/50 p-6 sm:p-8 rounded-2xl border border-white/5 space-y-6">
             <div>
               <label className="block text-sm font-medium text-white/80 mb-2">Nom de l'Entreprise</label>
               <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-asas-gold/0 via-asas-gold/30 to-asas-gold/0 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                  <div className="relative flex items-center bg-[#051121] border border-white/10 rounded-xl overflow-hidden transition-all group-focus-within:border-asas-gold/50 shadow-inner">
                     <div className="pl-4 pr-3 text-white/40">
                        <Building2 className="w-5 h-5" strokeWidth={1.5} />
                     </div>
                     <input
                       type="text"
                       required
                       value={agencyName}
                       onChange={(e) => setAgencyName(e.target.value)}
                       className="w-full bg-transparent py-4 pr-4 pl-1 text-white placeholder-white/30 focus:outline-none focus:ring-0"
                       placeholder="Ex: ASAS Global Solutions"
                     />
                  </div>
               </div>
             </div>
             <div>
               <label className="block text-sm font-medium text-white/80 mb-2">Téléphone Administratif (Optionnel)</label>
               <div className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-asas-gold/0 via-asas-gold/30 to-asas-gold/0 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
                  <div className="relative flex items-center bg-[#051121] border border-white/10 rounded-xl overflow-hidden transition-all group-focus-within:border-asas-gold/50 shadow-inner">
                     <div className="pl-4 pr-3 text-white/40">
                        <span className="font-mono text-sm">TEL</span>
                     </div>
                     <input
                       type="tel"
                       value={phone}
                       onChange={(e) => setPhone(e.target.value)}
                       className="w-full bg-transparent py-4 pr-4 pl-1 text-white placeholder-white/30 focus:outline-none focus:ring-0 font-mono tracking-wide"
                       placeholder="+213 550 00 00 00"
                     />
                  </div>
               </div>
             </div>
          </div>

          <div className="flex items-start gap-4 mt-2 px-2 text-sm text-white/50 bg-white/5 p-4 rounded-xl border border-white/5">
             <ShieldCheck className="w-5 h-5 shrink-0 text-asas-gold" strokeWidth={1.5} />
             <p className="leading-relaxed">L'architecture cloud est isolée dès la création. L'activation des modules avancés sera disponible instantanément après cette étape.</p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full relative overflow-hidden group mt-4 rounded-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#D4A64F] to-[#E0B96B] transition-transform duration-500 transform group-hover:scale-[1.03]"></div>
            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
            <div className="relative py-4 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(212,166,79,0.3)]">
               <span className="text-[#06152D] font-bold text-lg tracking-wide">{loading ? 'Génération de l\'environnement...' : 'Déployer l\'environnement'}</span>
               {!loading && <ArrowRight className="w-5 h-5 text-[#06152D]" strokeWidth={2} />}
            </div>
          </button>
        </form>
      </motion.div>
    </div>
  );
}
