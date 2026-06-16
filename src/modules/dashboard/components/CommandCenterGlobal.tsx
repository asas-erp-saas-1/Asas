'use client'

import React, { useState, useEffect } from 'react';
import { 
  Building2, DollarSign, Filter, RefreshCcw, CheckSquare, 
  Home, Activity, AlertCircle, ArrowUpRight, ArrowDownRight, 
  Sun, Star, ChevronDown, Download, Users, Star as StarOutline,
  Loader2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, LineChart, Line
} from 'recharts';
import { EnterpriseAICopilot } from './EnterpriseAICopilot';

const barData = [
  { name: 'Juin', ca: 20, enc: 15 },
  { name: 'Juil', ca: 25, enc: 18 },
  { name: 'Août', ca: 22, enc: 16 },
  { name: 'Sept', ca: 38, enc: 25 },
  { name: 'Oct', ca: 40, enc: 28 },
  { name: 'Nov', ca: 30, enc: 22 },
  { name: 'Déc', ca: 32, enc: 24 },
  { name: 'Jan', ca: 35, enc: 26 },
  { name: 'Fév', ca: 38, enc: 28 },
  { name: 'Mar', ca: 42, enc: 30 },
  { name: 'Avr', ca: 38, enc: 28 },
  { name: 'Mai', ca: 48, enc: 35 },
];

const pieData = [
  { name: 'Nouveau Lead', value: 22.8, percent: '14%', color: '#3b82f6' },
  { name: 'Qualification', value: 31.2, percent: '19%', color: '#8b5cf6' },
  { name: 'Proposition', value: 45.6, percent: '28%', color: '#eab308' },
  { name: 'Négociation', value: 36.7, percent: '23%', color: '#10b981' },
  { name: 'Fermé Gagné', value: 26.1, percent: '16%', color: '#0ea5e9' },
];

const areaData = [
  { name: '22 Mai', val: 2 },
  { name: '23 Mai', val: 3 },
  { name: '24 Mai', val: 4 },
  { name: '25 Mai', val: 4.5 },
  { name: '26 Mai', val: 5 },
  { name: '27 Mai', val: 5.5 },
  { name: '28 Mai', val: 8.4 },
];

const sparklineData = Array.from({length: 12}, () => ({ value: Math.random() * 100 }));
const upSparkline = sparklineData.sort((a,b) => a.value - b.value);
const downSparkline = sparklineData.sort((a,b) => b.value - a.value);

export function CommandCenterGlobal() {
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const res = await fetch('/api/metrics/board');
        const json = await res.json();
        if (json.data) {
           setMetrics(json.data);
        }
      } catch (err) {
        console.error('Failed to fetch board metrics', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  return (
    <div className="w-full h-full flex flex-col space-y-6 animate-in fade-in duration-700 bg-transparent text-white pt-4">
      
      {/* 1. Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-2">
        <div>
          <h2 className="text-white/60 font-medium font-sans mb-1">Bonjour, <span className="text-white font-bold">Ahmed</span> 👋</h2>
          <h1 className="text-4xl font-display font-bold text-white tracking-tight flex items-center gap-2">
            Command Center Global <Star className="w-5 h-5 text-white/20" />
          </h1>
          <p className="text-white/50 text-[11px] uppercase tracking-widest font-bold mt-2">Vue d'ensemble en temps réel de votre entreprise</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#0A1829] border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-colors">
            ASAS Holding <ChevronDown className="w-3 h-3 text-white/50" />
          </button>
          <button className="flex items-center gap-2 px-5 py-2 bg-[#D4A64F] hover:bg-[#E0B96B] text-[#051121] rounded-xl text-xs font-bold uppercase tracking-widest transition-colors shadow-[0_0_15px_rgba(212,166,79,0.3)] hover:shadow-[0_0_20px_rgba(212,166,79,0.5)]">
            <Download className="w-4 h-4" /> Exporter le rapport
          </button>
        </div>
      </div>

      {/* 2. Top KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* KPI 1: Chiffre d'Affaires */}
        <div className="p-5 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-2 relative z-10">
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/60">Chiffre d'Affaires</span>
            <div className="w-8 h-8 rounded-lg bg-[#D4A64F]/10 flex items-center justify-center border border-[#D4A64F]/20">
              <DollarSign className="w-4 h-4 text-[#D4A64F]" />
            </div>
          </div>
          <div className="relative z-10">
            <span className="text-2xl font-display font-bold text-white">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : `${(metrics?.revenue || 0).toLocaleString()} DA`}
            </span>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3 text-green-400" />
              <span className="text-green-400 text-xs font-bold">18.6%</span>
              <span className="text-white/40 text-[10px] uppercase tracking-widest ml-1">vs mois dernier</span>
            </div>
          </div>
          <div className="h-16 mt-4 -mx-1 -mb-2 opacity-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={upSparkline}>
                <Line type="monotone" dataKey="value" stroke="#D4A64F" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* KPI 2: Pipeline */}
        <div className="p-5 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-2 relative z-10">
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/60">Total Clients</span>
            <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center border border-green-500/20">
              <Users className="w-4 h-4 text-green-400" />
            </div>
          </div>
          <div className="relative z-10">
            <span className="text-2xl font-display font-bold text-white">
               {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : metrics?.totalClients || 0}
            </span>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3 text-green-400" />
              <span className="text-green-400 text-xs font-bold">24.2%</span>
              <span className="text-white/40 text-[10px] uppercase tracking-widest ml-1">vs mois dernier</span>
            </div>
          </div>
          <div className="h-16 mt-4 -mx-1 -mb-2 opacity-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={upSparkline}>
                <Line type="monotone" dataKey="value" stroke="#4ade80" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* KPI 3: Unités */}
        <div className="p-5 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-2 relative z-10">
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/60">Unités Disponibles</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <Home className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <div className="relative z-10">
            <span className="text-2xl font-display font-bold text-white">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : metrics?.availableProperties || 0}
            </span>
            <div className="flex items-center gap-1 mt-1">
              <ArrowDownRight className="w-3 h-3 text-red-400" />
              <span className="text-red-400 text-xs font-bold">5.2%</span>
              <span className="text-white/40 text-[10px] uppercase tracking-widest ml-1">vs mois dernier</span>
            </div>
          </div>
          <div className="h-16 mt-4 -mx-1 -mb-2 opacity-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={downSparkline}>
                <Line type="monotone" dataKey="value" stroke="#a855f7" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* KPI 4: Encaissements */}
        <div className="p-5 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-2 relative z-10">
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/60">Encaissements</span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
              <RefreshCcw className="w-4 h-4 text-teal-400" />
            </div>
          </div>
          <div className="relative z-10">
            <span className="text-2xl font-display font-bold text-white">23.6 M DA</span>
            <div className="flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-3 h-3 text-green-400" />
              <span className="text-green-400 text-xs font-bold">12.7%</span>
              <span className="text-white/40 text-[10px] uppercase tracking-widest ml-1">vs mois dernier</span>
            </div>
          </div>
          <div className="h-16 mt-4 -mx-1 -mb-2 opacity-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={upSparkline}>
                <Line type="monotone" dataKey="value" stroke="#2dd4bf" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* KPI 5: Tâches */}
        <div className="p-5 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-2 relative z-10">
            <span className="text-[10px] uppercase font-bold tracking-widest text-white/60">Contrôle des Risques</span>
            <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center border border-red-500/20">
              <AlertCircle className="w-4 h-4 text-red-500" />
            </div>
          </div>
          <div className="relative z-10">
            <span className="text-2xl font-display font-bold text-white">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : metrics?.activeRisks || 0}
            </span>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-white/40 text-[10px] uppercase tracking-widest ml-1">Risques Actifs Globaux</span>
            </div>
          </div>
          <div className="h-16 mt-4 -mx-1 -mb-2 opacity-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={upSparkline}>
                <Line type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 3. Middle Module (Charts & Activities) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Combo bar chart */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0A1829] border border-white/5 flex flex-col h-[320px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-white tracking-tight">Chiffre d'Affaires & Encaissements</h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#D4A64F] rounded-full"></span>
                <span className="text-[9px] uppercase tracking-widest font-bold text-white/50">CA (DA)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-[9px] uppercase tracking-widest font-bold text-white/50">Encaissements (DA)</span>
              </div>
            </div>
          </div>
          <div className="flex-1 -ml-4 mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} barCategoryGap={6}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} tickFormatter={(v) => `${v}M`} />
                <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{backgroundColor: '#051121', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: '12px'}} />
                <Bar dataKey="ca" fill="#D4A64F" radius={[4, 4, 0, 0]} barSize={8} />
                <Bar dataKey="enc" fill="#22c55e" radius={[4, 4, 0, 0]} barSize={8} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-[#0A1829] border border-white/5 flex flex-col h-[320px]">
          <h3 className="text-sm font-bold text-white tracking-tight mb-2">Répartition des Pipeline</h3>
          <div className="flex flex-1 items-center">
            <div className="w-1/2 h-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={75} stroke="none" dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-display font-bold text-white">162.4 M</span>
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/40 mt-1">TOTAL</span>
              </div>
            </div>
            <div className="w-1/2 flex flex-col justify-center space-y-4 pl-4 border-l border-white/5">
              {pieData.map((item, i) => (
                <div key={i}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2 h-2 rounded-full" style={{backgroundColor: item.color}}></span>
                    <span className="text-[10px] font-bold text-white/70">{item.name}</span>
                  </div>
                  <div className="pl-4">
                     <span className="text-xs text-white/40">{item.value}M ({item.percent})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activités Récentes */}
        <div className="lg:col-span-3 p-6 rounded-2xl bg-[#0A1829] border border-white/5 flex flex-col h-[320px] overflow-hidden">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-white tracking-tight">Activités Récentes</h3>
            <span className="text-[10px] text-[#D4A64F] uppercase tracking-widest font-bold cursor-pointer hover:underline">Voir tout</span>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-5">
            {[ 
              { title: "Nouveau lead ajouté", desc: "Karim Benali - Appartement T3", time: "10:24", icon: Home, bg: "bg-blue-500/10", col: "text-blue-400" },
              { title: "Paiement reçu", desc: "12,450,000 DA de Nour Immo", time: "09:15", icon: DollarSign, bg: "bg-green-500/10", col: "text-green-400" },
              { title: "Contrat signé", desc: "Résidence EL YASMINE - Bloc B", time: "Hier, 16:45", icon: CheckSquare, bg: "bg-purple-500/10", col: "text-purple-400" },
              { title: "Tâche assignée", desc: "Suivi client - Ahmed Benkhaled", time: "Hier, 14:20", icon: AlertCircle, bg: "bg-orange-500/10", col: "text-orange-400" },
              { title: "Unité réservée", desc: "A-34 - 3ème étage", time: "Hier, 11:10", icon: Home, bg: "bg-blue-500/10", col: "text-blue-400" }
            ].map((activity, i) => (
              <div key={i} className="flex gap-4">
                 <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${activity.bg}`}>
                    <activity.icon className={`w-4 h-4 ${activity.col}`} />
                 </div>
                 <div className="flex-1">
                    <p className="text-[11px] font-bold text-white">{activity.title}</p>
                    <p className="text-[10px] text-white/50">{activity.desc}</p>
                 </div>
                 <span className="text-[9px] text-white/40">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Bottom Module */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Alertes & Risques */}
        <div className="lg:col-span-3 p-6 rounded-2xl bg-[#0A1829] border border-white/5 flex flex-col h-[280px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-white tracking-tight">Alertes & Risques</h3>
            <span className="text-[10px] text-[#D4A64F] uppercase tracking-widest font-bold cursor-pointer hover:underline">Voir tout</span>
          </div>
          <div className="flex-1 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 mt-1">
                  <span className="w-2 h-2 rounded-full bg-red-400"></span>
                </div>
                <div>
                  <p className="text-xs font-bold text-red-400">Retard de chantier</p>
                  <p className="text-[10px] text-white/50">Résidence EL YASMINE - Bloc C</p>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[9px] border border-red-500/30 text-red-400 rounded bg-red-500/10">Critique</span>
            </div>
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0 mt-1">
                  <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                </div>
                <div>
                  <p className="text-xs font-bold text-orange-400">Paiement en retard</p>
                  <p className="text-[10px] text-white/50">5 clients avec des échéances</p>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[9px] border border-orange-500/30 text-orange-400 rounded bg-orange-500/10">Important</span>
            </div>
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center shrink-0 mt-1">
                  <span className="w-2 h-2 rounded-full bg-yellow-400"></span>
                </div>
                <div>
                  <p className="text-xs font-bold text-yellow-400">Stock faible</p>
                  <p className="text-[10px] text-white/50">12 unités restantes dans 2 projets</p>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[9px] border border-yellow-500/30 text-yellow-400 rounded bg-yellow-500/10">Attention</span>
            </div>
            <div className="flex items-start justify-between">
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-1">
                  <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                </div>
                <div>
                  <p className="text-xs font-bold text-blue-400">Approbation requise</p>
                  <p className="text-[10px] text-white/50">3 contrats en attente de valid.</p>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[9px] border border-blue-500/30 text-blue-400 rounded bg-blue-500/10">Info</span>
            </div>
          </div>
        </div>

        {/* Performance des Projets (Table) */}
        <div className="lg:col-span-5 p-6 rounded-2xl bg-[#0A1829] border border-white/5 flex flex-col h-[280px]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-sm font-bold text-white tracking-tight">Performance des Projets</h3>
            <span className="text-[10px] text-[#D4A64F] uppercase tracking-widest font-bold cursor-pointer hover:underline">Voir tout</span>
          </div>
          <table className="w-full text-[11px] text-left">
            <thead>
              <tr className="text-white/40 font-bold uppercase tracking-widest border-b border-white/5">
                <th className="pb-3 font-medium">PROJET</th>
                <th className="pb-3 font-medium">AVANCEMENT</th>
                <th className="pb-3 text-right font-medium">VENDU</th>
                <th className="pb-3 text-right font-medium">CA PRÉVISIONNEL</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Résidence EL YASMINE', progress: 78, sold: '145/180', ca: '32.4 M DA' },
                { name: 'Résidence AL RAYANE', progress: 62, sold: '98/160', ca: '21.7 M DA' },
                { name: 'Résidence NOUR CITY', progress: 41, sold: '56/120', ca: '14.3 M DA' },
                { name: 'Résidence BAHIA', progress: 28, sold: '32/100', ca: '9.8 M DA' }
              ].map((proj, i) => (
                <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                  <td className="py-4 font-bold text-white">{proj.name}</td>
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-20 bg-white/10 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full rounded-full" style={{ width: `${proj.progress}%` }}></div>
                      </div>
                      <span className="text-[10px] text-white/50">{proj.progress}%</span>
                    </div>
                  </td>
                  <td className="py-4 text-right font-mono text-white/70">{proj.sold}</td>
                  <td className="py-4 text-right font-mono font-bold text-white/90">{proj.ca}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Flux de Trésorerie Area Chart */}
        <div className="lg:col-span-4 p-6 rounded-2xl bg-[#0A1829] border border-white/5 flex flex-col h-[280px]">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight mb-2">Flux de Trésorerie</h3>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-display font-bold text-white">8.4 M <span className="text-sm text-white/50 font-sans">DA</span></span>
              </div>
              <span className="text-[10px] text-white/50 uppercase tracking-widest mt-1 block">Solde de trésorerie actuel</span>
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center justify-between w-32 mb-1 text-[10px]">
                <span className="text-white/50 uppercase tracking-widest">Encaissements</span>
                <span className="text-green-400 font-bold">12.6 M DA</span>
              </div>
              <div className="flex items-center justify-between w-32 mb-1 text-[10px]">
                <span className="text-white/50 uppercase tracking-widest">Décaissements</span>
                <span className="text-red-400 font-bold">-4.2 M DA</span>
              </div>
              <div className="flex items-center justify-between w-32 text-[10px] pt-1 border-t border-white/10 mt-1">
                <span className="text-white/50 uppercase tracking-widest">Variation nette</span>
                <span className="text-green-400 font-bold">+8.4 M DA</span>
              </div>
            </div>
          </div>
          <div className="flex-1 mt-4 -mx-2 -mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={areaData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 10}} dy={10} />
                <Tooltip contentStyle={{backgroundColor: '#051121', border: '1px solid rgba(255,255,255,0.1)'}} />
                <Area type="monotone" dataKey="val" stroke="#22c55e" strokeWidth={2} fillOpacity={1} fill="url(#colorVal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 5. Lowest KPI modules */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-8">
        {/* Météo des Ventes */}
        <div className="p-5 rounded-2xl bg-[#0A1829] border border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-white tracking-tight mb-1">Météo des Ventes</h3>
            <p className="text-[10px] text-white/50 uppercase tracking-widest mb-3">Alger, Algérie</p>
            <div className="flex gap-3 items-center">
              <Sun className="w-8 h-8 text-yellow-400" />
              <div>
                <span className="text-2xl font-bold text-white font-display">24°C</span>
                <p className="text-[10px] text-white/70">Ensoleillé</p>
              </div>
            </div>
          </div>
        </div>

        {/* Taux de Conversion */}
        <div className="p-5 rounded-2xl bg-[#0A1829] border border-white/5 flex flex-col justify-between">
          <h3 className="text-xs font-bold text-white tracking-tight mb-2">Taux de Conversion</h3>
          <span className="text-2xl font-bold text-white font-display">23.7%</span>
          <div className="flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3 h-3 text-green-400" />
            <span className="text-green-400 text-xs font-bold">4.6%</span>
            <span className="text-white/40 text-[10px] uppercase tracking-widest ml-1">vs mois dernier</span>
          </div>
          <div className="h-8 mt-2 -mx-1 opacity-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={upSparkline.slice(0, 5)}>
                <Line type="monotone" dataKey="value" stroke="#4ade80" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Agents */}
        <div className="p-5 rounded-2xl bg-[#0A1829] border border-white/5 relative">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-white tracking-tight">Top Agents</h3>
            <span className="text-[9px] text-[#D4A64F] uppercase tracking-widest font-bold cursor-pointer hover:underline">Voir le classement</span>
          </div>
          <div className="flex justify-between items-end">
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold overflow-hidden border-2 border-white/5">YR</div>
                <div className="absolute -left-1 -bottom-1 w-4 h-4 bg-[#D4A64F] rounded-full border border-[#051121] flex items-center justify-center text-[8px] text-black font-black">1</div>
              </div>
              <p className="text-[9px] font-bold text-white">Yacine Rezki</p>
              <p className="text-[8px] text-white/50">CA: 12.4 M DA</p>
              <p className="text-[8px] text-green-400 flex items-center gap-0.5"><ArrowUpRight className="w-2 h-2"/> 18 unités</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold overflow-hidden border-2 border-white/5">SB</div>
                <div className="absolute -left-1 -bottom-1 w-4 h-4 bg-gray-300 rounded-full border border-[#051121] flex items-center justify-center text-[8px] text-black font-black">2</div>
              </div>
              <p className="text-[9px] font-bold text-white">Sarah Benali</p>
              <p className="text-[8px] text-white/50">CA: 9.7 M DA</p>
              <p className="text-[8px] text-green-400 flex items-center gap-0.5"><ArrowUpRight className="w-2 h-2"/> 14 unités</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="relative mb-2">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold overflow-hidden border-2 border-white/5">MK</div>
                <div className="absolute -left-1 -bottom-1 w-4 h-4 bg-orange-400 rounded-full border border-[#051121] flex items-center justify-center text-[8px] text-black font-black">3</div>
              </div>
              <p className="text-[9px] font-bold text-white">Mehdi Khaled</p>
              <p className="text-[8px] text-white/50">CA: 8.1 M DA</p>
              <p className="text-[8px] text-green-400 flex items-center gap-0.5"><ArrowUpRight className="w-2 h-2"/> 11 unités</p>
            </div>
          </div>
        </div>

        {/* Satisfaction */}
        <div className="p-5 rounded-2xl bg-[#0A1829] border border-white/5 flex flex-col justify-between">
          <h3 className="text-xs font-bold text-white tracking-tight mb-2">Satisfaction Clients</h3>
          <span className="text-2xl font-bold text-white font-display">4.7/5</span>
          <div className="flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3 h-3 text-green-400" />
            <span className="text-green-400 text-xs font-bold">0.3</span>
            <span className="text-white/40 text-[10px] uppercase tracking-widest ml-1">vs mois dernier</span>
          </div>
          <div className="flex gap-1 mt-2 mb-2">
            {[1,2,3,4].map(x => <Star key={x} className="w-3 h-3 fill-[#D4A64F] text-[#D4A64F]" />)}
            <StarOutline className="w-3 h-3 text-[#D4A64F]" />
          </div>
          <div className="h-8 -mx-1 opacity-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={upSparkline.slice(0, 5)}>
                <Line type="monotone" dataKey="value" stroke="#D4A64F" strokeWidth={2} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* 6. AI Operational Copilot */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pb-8">
         <div className="lg:col-span-12 h-[400px]">
             <EnterpriseAICopilot />
         </div>
      </div>
      
    </div>
  );
}
