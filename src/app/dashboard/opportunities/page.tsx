'use client';

import { useState, useEffect, useCallback } from 'react';
import { Target, Search, Plus, Filter, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const STAGES = [
  { key: 'prospecting', label: 'Prospection', color: 'bg-white/10 text-white/70 border-white/20' },
  { key: 'qualification', label: 'Qualification', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  { key: 'proposal', label: 'Proposition', color: 'bg-asas-gold/10 text-asas-gold border-asas-gold/20' },
  { key: 'negotiation', label: 'Négociation', color: 'bg-asas-copper/10 text-asas-copper border-asas-copper/20' },
  { key: 'closed_won', label: 'Gagné', color: 'bg-green-500/10 text-green-400 border-green-500/20' },
  { key: 'closed_lost', label: 'Perdu', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
] as const;

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/crm/opportunities');
      if (res.ok) {
        const json = await res.json();
        setOpportunities(json.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStage = destination.droppableId;
    
    // Optimistic Update
    setOpportunities(current => 
      current.map(opp => opp.id === draggableId ? { ...opp, stage: newStage } : opp)
    );

    try {
      const res = await fetch(`/api/crm/opportunities/${draggableId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage: newStage }),
      });
      if (!res.ok) throw new Error('Failed to update');
    } catch (err) {
      fetchOpportunities(); // revert
    }
  };

  const byStage = (stage: string) => opportunities.filter(o => o.stage === stage);

  const filtered = opportunities.filter(o => 
     o.contact?.firstName?.toLowerCase().includes(search.toLowerCase()) ||
     o.contact?.lastName?.toLowerCase().includes(search.toLowerCase()) ||
     o.contact?.companyName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col flex-1 h-full overflow-hidden bg-transparent text-white">
      {/* Header */}
      <div className="px-6 py-5 shrink-0 z-10 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-5">
           <div>
              <div className="flex items-center gap-2 mb-2 hidden sm:flex">
                 <div className="px-2 py-1 bg-asas-gold/10 border border-asas-gold/20 rounded text-[9px] text-asas-gold uppercase font-bold tracking-widest flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    <span>CRM Platform Active</span>
                 </div>
              </div>
              <h1 className="text-3xl sm:text-4xl font-display font-bold text-white tracking-tight flex items-center gap-3">
                 Opportunities
              </h1>
              <p className="text-[10px] uppercase font-bold tracking-widest text-white/50 mt-2">
                Pipeline CRM • {opportunities.length} Active Deals
              </p>
           </div>
           
           <div className="flex items-center gap-3">
             <div className="relative w-full md:w-64">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
               <input
                 type="text"
                 placeholder="Search opportunity..."
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
                 className="w-full pl-11 pr-4 py-2 bg-[#0A1629] text-sm font-medium border border-white/10 rounded-xl focus:outline-none focus:border-asas-gold text-white placeholder:text-white/30"
               />
             </div>
             <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-asas-gold text-[#06152D] rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(212,166,79,0.3)]">
               <Plus className="h-4 w-4" /> New Opp
             </button>
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar py-4">
        <DragDropContext onDragEnd={onDragEnd}>
           <div className="flex h-full gap-4 px-6 min-w-max items-start">
             {loading ? (
                [...Array(6)].map((_, i) => <div key={i} className="w-[300px] h-[70vh] bg-white/5 animate-pulse rounded-2xl" />)
             ) : (
                STAGES.map(col => {
                  const items = filtered.filter(f => f.stage === col.key);
                  return (
                    <div key={col.key} className="w-[300px] flex flex-col bg-black/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden max-h-full">
                       <div className="px-5 py-4 border-b border-white/5 bg-black/20 flex items-center justify-between shrink-0">
                          <span className="text-sm font-bold text-white tracking-widest uppercase">{col.label}</span>
                          <span className={clsx("text-[10px] font-bold px-2 py-0.5 rounded-md border tracking-widest", col.color)}>
                            {items.length}
                          </span>
                       </div>
                       
                       <Droppable droppableId={col.key}>
                          {(provided, snapshot) => (
                             <div 
                               ref={provided.innerRef} 
                               {...provided.droppableProps}
                               className={clsx("flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar min-h-[150px]", snapshot.isDraggingOver && "bg-white/5")}
                             >
                               {items.map((opp, index) => (
                                 <Draggable key={opp.id} draggableId={opp.id} index={index}>
                                   {(dragProvided, dragSnapshot) => (
                                      <div
                                        ref={dragProvided.innerRef}
                                        {...dragProvided.draggableProps}
                                        {...dragProvided.dragHandleProps}
                                        className={clsx("bg-[#051121] rounded-xl border p-4 shadow-sm relative overflow-hidden group", dragSnapshot.isDragging ? "ring-1 ring-asas-gold/50 rotate-1 border-asas-gold/50" : "border-white/10")}
                                      >
                                         <p className="font-bold text-sm text-white">{opp.contact?.firstName} {opp.contact?.lastName}</p>
                                         <p className="text-[10px] text-white/50">{opp.contact?.companyName}</p>
                                         <div className="mt-3 flex items-center justify-between text-xs font-mono font-bold text-white/80">
                                            <span>Est: {opp.estimatedValue || '?'} DZD</span>
                                            <span className={clsx(opp.probability > 60 ? 'text-green-400' : 'text-blue-400')}>{opp.probability || 0}%</span>
                                         </div>
                                      </div>
                                   )}
                                 </Draggable>
                               ))}
                               {provided.placeholder}
                             </div>
                          )}
                       </Droppable>
                    </div>
                  );
                })
             )}
           </div>
        </DragDropContext>
      </div>
    </div>
  );
}
