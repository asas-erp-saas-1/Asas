import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Building2, Rocket, ArrowRight } from 'lucide-react';
import { kernel } from '@/lib/kernel/core';
import Link from 'next/link';

export default async function InvitePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder';
  
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll() { /* ... */ }
    }
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Need to login or signup first
    // Save invite code to a cookie to process after login? Or just pass it in URL
    return (
      <div className="flex min-h-[100dvh] w-full items-center justify-center bg-white dark:bg-[#141618] text-asas-charcoal dark:text-asas-sand px-4 py-12 relative overflow-hidden">
         <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-asas-sand dark:from-black/10 to-transparent pointer-events-none z-0"></div>
         <div className="w-full max-w-md p-8 border border-asas-silver/20 bg-white dark:bg-[#141618] rounded-sm shadow-sm text-center relative z-10">
            <h2 className="text-2xl font-bold mb-4 font-display uppercase tracking-widest text-asas-charcoal dark:text-asas-sand">Invitation Reçue</h2>
            <p className="text-asas-silver mb-8 text-[10px] uppercase font-bold tracking-widest">Connectez-vous ou créez un compte pour accepter l'invitation à rejoindre l'agence.</p>
            <div className="space-y-4">
              <Link href={`/login?invite=${code}`} className="block w-full px-6 py-4 bg-asas-navy hover:bg-asas-charcoal dark:hover:bg-black text-asas-sand rounded-sm font-bold transition-all text-[10px] uppercase tracking-widest text-center shadow-sm">
                Se Connecter
              </Link>
              <Link href={`/signup?invite=${code}`} className="block w-full px-6 py-4 bg-asas-sand/50 hover:bg-asas-silver/20 dark:bg-black/10 dark:hover:bg-black/20 text-asas-charcoal dark:text-asas-sand rounded-sm font-bold border border-asas-silver/20 transition-all text-[10px] uppercase tracking-widest text-center shadow-sm">
                Créer un compte
              </Link>
            </div>
         </div>
      </div>
    );
  }

  // Call the accept_invite RPC
  const { data, error } = await supabase.rpc('accept_invite', { _token: code });

  if (error) {
     return (
       <div className="flex min-h-[100dvh] w-full items-center justify-center bg-white dark:bg-[#141618] text-asas-charcoal dark:text-asas-sand px-4 py-12 relative overflow-hidden">
         <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-asas-sand dark:from-black/10 to-transparent pointer-events-none z-0"></div>
         <div className="w-full max-w-md p-8 border border-asas-silver/20 bg-white dark:bg-[#141618] rounded-sm shadow-sm text-center relative z-10">
            <h2 className="text-xl font-bold mb-4 text-[#EF4444] font-display uppercase tracking-widest">Lien invalide ou expiré</h2>
            <p className="text-asas-silver mb-8 text-[10px] uppercase font-bold tracking-widest">{error.message}</p>
            <Link href="/dashboard/overview" className="mt-4 inline-block w-full px-6 py-4 bg-asas-navy text-asas-sand rounded-sm font-bold text-[10px] uppercase tracking-widest text-center shadow-sm">Retour à l'accueil</Link>
         </div>
       </div>
     );
  }

  // Force session refresh for RLS if needed, although user is already updated
  redirect('/dashboard/overview');

  return null;
}
