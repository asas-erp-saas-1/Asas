// src/app/dashboard/layout.tsx
import { redirect } from 'next/navigation'
import { LayoutGrid, Users, Handshake, Building2, DollarSign, CheckSquare, BarChart2, Settings, LogOut, Bell, Search, Menu, UserSquare2, Calendar as CalendarIcon, Zap, Award, Megaphone, ShoppingCart, Receipt, Grid, Calculator, Power, Clock, ShieldAlert, Cloud, Webhook, Star, Target } from 'lucide-react';
import Link from 'next/link'
import { kernel } from '@/lib/kernel/core'
import { NextMobileMenu } from '@/components/MobileMenu'
import { ThemeToggle } from '@/components/ThemeToggle'
import { CommandPalette } from '@/components/CommandPalette'
import { DesktopOmnibarTrigger, MobileOmnibarTrigger } from '@/components/OmnibarTriggers'

const NAV_GROUPS = [
  {
    group: "EXECUTIVE OS",
    items: [
      { href: '/dashboard/overview',   label: 'Command Center',   Icon: LayoutGrid },
      { href: '/dashboard/intelligence', label: 'CEO Intelligence',   Icon: Zap },
      { href: '/dashboard/intelligence/forecasting', label: 'Forecasting',   Icon: BarChart2 },
      { href: '/dashboard/intelligence/reporting', label: 'Executive Reporting',   Icon: Receipt },
      { href: '/dashboard/multi-company', label: 'Multi-Company',             Icon: Building2 },
    ]
  },
  {
    group: "CRM & SALES OS",
    items: [
      { href: '/dashboard/leads',      label: 'Smart Leads', Icon: Users },
      { href: '/dashboard/opportunities', label: 'Opportunities', Icon: Target },
      { href: '/dashboard/deals',      label: 'Sales Pipeline',      Icon: Handshake },
      { href: '/dashboard/deals/workspace', label: 'Negotiation Room', Icon: Webhook },
      { href: '/dashboard/deals/analytics', label: 'Sales Analytics', Icon: BarChart2 },
      { href: '/dashboard/clients',    label: 'Customer 360°',       Icon: UserSquare2 },
      { href: '/dashboard/reservations', label: 'Reservations',    Icon: CalendarIcon },
    ]
  },
  {
    group: "REAL ESTATE OS",
    items: [
      { href: '/dashboard/properties', label: 'Property Universe',     Icon: Building2 },
      { href: '/dashboard/properties/analytics', label: 'Properties Analytics', Icon: BarChart2 },
      { href: '/dashboard/projects',   label: 'Projects',            Icon: LayoutGrid },
      { href: '/dashboard/unites',     label: 'Unit Management',    Icon: CheckSquare },
      { href: '/dashboard/unites/matrix', label: 'Availability Matrix', Icon: Grid },
      { href: '/dashboard/unites/pricing', label: 'Pricing Engine', Icon: Calculator },
      { href: '/dashboard/map',        label: 'Interactive Map', Icon: Search },
    ]
  },
  {
    group: "FINANCE OS",
    items: [
      { href: '/dashboard/finance',    label: 'Treasury Command', Icon: DollarSign },
      { href: '/dashboard/accounting', label: 'Accounting', Icon: Receipt },
      { href: '/dashboard/invoices',   label: 'Installments',      Icon: ShoppingCart },
      { href: '/dashboard/finance/reconciliation', label: 'Reconciliation', Icon: CheckSquare },
      { href: '/dashboard/finance/investors', label: 'Investor Reporting', Icon: Award },
    ],
    roles: ['owner', 'admin', 'finance']
  },
  {
    group: "OPERATIONS OS",
    items: [
      { href: '/dashboard/chantiers', label: 'Construction', Icon: Building2 },
      { href: '/dashboard/chantiers/risks', label: 'Delays & Risks', Icon: LayoutGrid },
      { href: '/dashboard/fournisseurs', label: 'Procurement', Icon: Users },
      { href: '/dashboard/qualite', label: 'Quality Control', Icon: CheckSquare },
    ],
    roles: ['owner', 'admin', 'finance']
  },
  {
    group: "HR & GOV OS",
    items: [
      { href: '/dashboard/agents',     label: 'Employee Hub',  Icon: Users },
      { href: '/dashboard/agents/attendance', label: 'Attendance System', Icon: Clock },
      { href: '/dashboard/agents/performance', label: 'Performance Reviews', Icon: Star },
      { href: '/dashboard/payroll',    label: 'Payroll', Icon: Receipt },
      { href: '/dashboard/recruitment', label: 'Recruitment', Icon: Megaphone },
    ],
    roles: ['owner', 'admin', 'finance']
  },
  {
    group: "AI & AUTOMATION",
    items: [
      { href: '/dashboard/copilot', label: 'AI Copilot', Icon: Zap },
      { href: '/dashboard/workflows',  label: 'Workflow Engine', Icon: Settings },
      { href: '/dashboard/automation', label: 'Automation Center', Icon: Power },
    ],
  },
  {
    group: "ADMIN OS",
    items: [
      { href: '/dashboard/settings', label: 'Global Setup', Icon: Settings },
      { href: '/dashboard/settings/security', label: 'Security & RBAC', Icon: ShieldAlert },
      { href: '/dashboard/settings/tenants', label: 'Tenant Management', Icon: Cloud },
      { href: '/dashboard/settings/api', label: 'API Integrations', Icon: Webhook },
      { href: '/dashboard/audit',    label: 'Audit Logs', Icon: Search },
    ],
    roles: ['owner', 'admin']
  }
]

export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let profile = {
    full_name: 'Unknown User',
    role: 'agent',
    avatar_url: null,
  };
  let identity;
  let shouldRedirectTo: string | null = null;
  let unhandledError = null;

  try {
    try {
      identity = await kernel.identity();
      const profiles = await kernel.query<any>('profiles', {
        filters: { id: identity.userId, agency_id: identity.tenantId }
      });
      if (profiles && profiles.length > 0) {
        profile = {
          ...profiles[0],
          role: identity.role
        };
      }
    } catch (error: any) {
      const errorMsg = error?.message || '';
      console.error('Failed to resolve identity in layout:', errorMsg);
      if (errorMsg.includes('Tenant isolation failure')) {
        shouldRedirectTo = '/onboarding';
      } else {
        shouldRedirectTo = '/login';
      }
    }

    if (shouldRedirectTo) {
      redirect(shouldRedirectTo);
    }

    if (!identity) {
      return null;
    }

    const roleDisplay = profile.role === 'owner' ? 'CEO / Admin' : profile.role;
    const initial = profile.full_name ? profile.full_name.charAt(0).toUpperCase() : 'U';

    const role = profile.role || 'agent';

    return (
      <div className="flex bg-[#06152D] h-[100dvh] overflow-hidden selection:bg-asas-gold/30 selection:text-white text-white font-sans">
        
        {/* Global Background Ambient Effects for the Layout */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
           <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-[radial-gradient(ellipse_at_top_right,_rgba(212,166,79,0.05),_transparent_70%)]"></div>
           <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-[radial-gradient(circle_at_bottom_left,_rgba(12,38,77,0.5),_transparent_60%)]"></div>
        </div>

        <NextMobileMenu profile={profile} initial={initial} roleDisplay={roleDisplay} />
        
        {/* Sidebar - Desktop */}
        <aside className="w-[280px] bg-[#0A1829]/60 backdrop-blur-2xl border-r border-white/5 flex-col shrink-0 hidden md:flex z-10 relative">
          <div className="px-6 py-8 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-white/10 to-transparent border border-asas-gold/30 flex items-center justify-center relative shadow-[0_0_15px_rgba(212,166,79,0.2)]">
                <div className="absolute inset-0 bg-asas-gold/10 rounded-xl blur-md"></div>
                <Building2 className="w-5 h-5 text-asas-gold relative z-10" />
              </div>
              <div>
                <p className="font-display font-bold text-white tracking-tight leading-none text-xl flex items-center gap-2">
                  ASAS <span className="text-white/20 font-light text-base">|</span> <span className="font-sans font-medium text-lg text-asas-gold">أساس</span>
                </p>
                <p className="text-[9px] uppercase font-bold tracking-[0.2em] text-white/40 leading-tight mt-1">Enterprise OS</p>
              </div>
            </div>
          </div>

          <div className="px-4 py-4 flex-1 overflow-y-auto custom-scrollbar relative z-10 space-y-8">
            {NAV_GROUPS.map((navGroup) => {
               if (navGroup.roles && !navGroup.roles.includes(role)) return null;
               return (
                 <div key={navGroup.group}>
                   <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest mb-3 px-4">{navGroup.group}</p>
                   <nav className="flex flex-col gap-1">
                     {navGroup.items.map(({ href, label, Icon }) => (
                       <Link key={href} href={href}
                         className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-white/60 rounded-xl hover:bg-white/5 hover:text-white transition-all group relative overflow-hidden">
                         <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-0 rounded-r-md bg-asas-gold transition-all duration-300 group-hover:h-1/2 opacity-0 group-hover:opacity-100 shadow-[0_0_10px_rgba(212,166,79,0.8)]"></div>
                         <Icon className="h-4 w-4 text-white/40 group-hover:text-asas-gold transition-colors" />
                         <span className="group-hover:translate-x-1 transition-transform tracking-wide">{label}</span>
                       </Link>
                     ))}
                   </nav>
                 </div>
               )
            })}
          </div>

          <div className="mt-auto px-6 py-6 border-t border-white/5 shrink-0 relative z-10 bg-black/10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#051121] border border-white/10 flex items-center justify-center text-asas-gold font-bold shrink-0 shadow-inner">
                 {initial}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-white truncate">{(profile as any)?.full_name}</p>
                <p className="text-xs text-white/40 capitalize truncate mt-0.5 tracking-wide">{roleDisplay}</p>
              </div>
            </div>
            
            <form action="/auth/signout" method="post">
              <button type="submit" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white/50 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all hover:border-white/10">
                <LogOut className="h-4 w-4" /> Déconnexion
              </button>
            </form>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10 bg-[#0A1629] border-l border-white/5 shadow-[0_0_50px_rgba(0,0,0,0.5)] md:rounded-l-3xl my-0 md:my-2 mr-0 md:mr-2">
          {/* Top Header */}
          <header className="h-[72px] bg-[#0A1629]/80 backdrop-blur-xl border-b border-white/5 flex items-center justify-between px-6 sm:px-8 shrink-0 z-20 sticky top-0">
            <div className="flex items-center gap-4 w-full max-w-xl">
              <div className="md:hidden flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-b from-white/10 to-transparent border border-asas-gold/30 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-asas-gold" />
                </div>
              </div>
              
              <DesktopOmnibarTrigger />
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <MobileOmnibarTrigger />
              <ThemeToggle />
              <button className="relative p-2.5 text-white/50 hover:text-white hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10">
                <Bell className="w-5 h-5" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
              </button>
              <div className="w-px h-6 bg-white/10 hidden sm:block mx-1"></div>
              <div className="hidden sm:flex items-center gap-3 pl-2 cursor-pointer group">
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold text-white leading-none group-hover:text-asas-gold transition-colors">{(profile as any)?.full_name}</span>
                  <span className="text-[10px] uppercase tracking-widest text-white/40 mt-1">{roleDisplay}</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#051121] border border-white/10 flex items-center justify-center text-asas-gold font-bold shadow-inner group-hover:border-asas-gold/30 transition-colors">
                  {initial}
                </div>
              </div>
            </div>
          </header>

          {/* Scrollable Main Area */}
          <main className="flex-1 overflow-y-auto flex flex-col w-full text-white custom-scrollbar relative pb-28 md:pb-0">
            <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full flex-1 flex flex-col">
              {children}
            </div>
          </main>
        </div>
        <CommandPalette />
      </div>
    )
  } catch (err: any) {
    if (err?.message === 'NEXT_REDIRECT' || err?.digest?.startsWith('NEXT_REDIRECT')) throw err;
    unhandledError = err;
  }

  if (unhandledError) {
    return (
      <div className="p-8 bg-red-900 border border-red-500 rounded text-black m-8">
        <h1 className="text-xl font-bold">Layout Unhandled Crash</h1>
        <pre className="mt-4 p-4 bg-black text-red-500 border border-red-500/50 rounded">{String(unhandledError.message)}</pre>
        <pre className="mt-4 text-xs opacity-50">{String((unhandledError as any)?.stack)}</pre>
      </div>
    );
  }
}
