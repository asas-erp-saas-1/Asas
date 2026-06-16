'use client'

import React, { useState, useEffect } from 'react';
import { 
  Users, Clock, Calendar, CheckSquare, XCircle, AlertTriangle, 
  MapPin, Fingerprint, Activity, ChevronRight, Loader2
} from 'lucide-react';

export function AttendanceSystemModule() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({ attendanceRate: "0.0", onSite: 0, late: 0, absent: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAttendance() {
      try {
        const res = await fetch('/api/attendance?limit=50');
        const json = await res.json();
        if (json.data) {
          const formatted = json.data.map((record: any) => ({
            id: record.id.toString(),
            name: record.user?.name || `Employee ${record.userId}`,
            role: record.user?.role || 'Unknown Role',
            status: record.status === 'present' ? 'Présent' : record.status === 'late' ? 'En retard' : 'Absent',
            timeIn: record.timeIn ? new Date(record.timeIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '--:--',
            location: record.location || 'Boutique / Bureau',
            type: record.user?.department || 'System'
          }));
          setEmployees(formatted);
          if (json.stats) setStats(json.stats);
        }
      } catch (err) {
        console.error('Failed to fetch attendance API', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAttendance();
  }, []);

  return (
    <div className="w-full h-full flex flex-col space-y-6 animate-in fade-in duration-700 bg-transparent text-white pt-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 py-2 border-b border-white/5 pb-6 px-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded text-[9px] text-cyan-400 uppercase font-bold tracking-widest flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Time Tracking Active</span>
             </div>
          </div>
          <h1 className="text-4xl font-display font-bold text-white tracking-tight flex items-center gap-3">
             Attendance & Time
          </h1>
          <p className="text-white/50 text-[11px] uppercase tracking-widest font-bold mt-2">Suivi des présences, pointages et gestion du temps opérationnel</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-5 py-2 bg-[#0A1829] border border-white/10 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-white/5 transition-colors">
             <Calendar className="w-4 h-4 text-white/50" /> Aujourd'hui
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 px-6">
         <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-[#D4A64F] mb-4">Taux de Présence</h3>
            <span className="text-3xl font-display font-bold text-white">{loading ? '-' : stats.attendanceRate}%</span>
         </div>
         <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-white/50 mb-4">Employés sur Site</h3>
            <span className="text-3xl font-display font-bold text-white">{loading ? '-' : stats.onSite}</span>
         </div>
         <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-yellow-400 mb-4">Retards Signalés</h3>
            <span className="text-3xl font-display font-bold text-yellow-400">{loading ? '-' : stats.late}</span>
         </div>
         <div className="p-6 rounded-2xl bg-[#0A1829] border border-white/5 relative overflow-hidden">
            <h3 className="text-[10px] uppercase font-bold tracking-widest text-red-400 mb-4">Absences Injustifiées</h3>
            <span className="text-3xl font-display font-bold text-red-400">{loading ? '-' : stats.absent}</span>
         </div>
      </div>

      <div className="flex-1 w-full flex flex-col px-6 pb-6">
         <div className="bg-[#0A1829] border border-white/5 rounded-2xl overflow-hidden flex flex-col h-full">
            <div className="px-6 py-4 border-b border-white/5 flex justify-between items-center bg-[#051121]">
               <h3 className="text-xs font-bold text-white uppercase tracking-widest">Journal de Pointage (Live)</h3>
               <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                     <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-[9px] uppercase tracking-widest text-white/50 font-bold">Biométrie Sync</span>
               </div>
            </div>
            
            <div className="flex-1 overflow-auto custom-scrollbar p-6">
               {loading ? (
                  <div className="flex items-center justify-center h-full">
                     <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
                  </div>
               ) : (
                  <div className="flex flex-col gap-3">
                     {employees.map(emp => (
                        <div key={emp.id} className="flex items-center justify-between p-4 bg-[#051121] border border-white/5 rounded-xl hover:bg-white/[0.02] transition-colors group">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                 <Fingerprint className="w-4 h-4 text-white/40" />
                              </div>
                              <div>
                                 <h4 className="text-sm font-bold text-white group-hover:text-asas-gold transition-colors">{emp.name}</h4>
                                 <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest">{emp.role}</span>
                                    <span className="w-1 h-1 rounded-full bg-white/20"></span>
                                    <span className="text-[10px] text-white/40 font-mono tracking-widest">{emp.type}</span>
                                 </div>
                              </div>
                           </div>

                           <div className="flex items-center gap-8">
                              <div className="flex flex-col items-end">
                                 <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold mb-1">Status</span>
                                 {emp.status === 'Présent' && <span className="text-xs font-bold text-green-400 bg-green-400/10 px-2 py-0.5 rounded border border-green-500/20">Présent</span>}
                                 {emp.status === 'Absent' && <span className="text-xs font-bold text-red-400 bg-red-400/10 px-2 py-0.5 rounded border border-red-500/20">Absent</span>}
                                 {emp.status === 'En retard' && <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded border border-yellow-500/20">Retard</span>}
                              </div>

                              <div className="flex flex-col items-end w-24">
                                 <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold mb-1">Pointage</span>
                                 <span className="text-xs font-mono text-white">{emp.timeIn}</span>
                              </div>

                              <div className="flex flex-col items-end w-40 hidden md:flex">
                                 <span className="text-[9px] uppercase tracking-widest text-white/40 font-bold mb-1">Localisation</span>
                                 <div className="flex items-center gap-1 text-white/70">
                                    <MapPin className="w-3 h-3 text-white/30" />
                                    <span className="text-xs font-bold truncate max-w-[120px]">{emp.location}</span>
                                 </div>
                              </div>

                              <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white/20 group-hover:text-white">
                                 <ChevronRight className="w-5 h-5" />
                              </button>
                           </div>
                        </div>
                     ))}
                  </div>
               )}
            </div>
         </div>
      </div>
    </div>
  );
}
