'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Brain, Send, Bot, User, Loader2, Sparkles, Activity } from 'lucide-react';
import { clsx } from 'clsx';
import { toast } from 'react-hot-toast';

export function EnterpriseAICopilot() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
     { role: 'assistant', content: 'I am your Enterprise Operational AI. Ask me about current business health, pipeline risks, or strategic forecasts.' }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
     if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
     }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!query.trim()) return;

     const userMsg = query;
     setQuery('');
     setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
     setLoading(true);

     try {
        const res = await fetch('/api/ai/copilot', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ prompt: userMsg })
        });

        if (res.ok) {
           const data = await res.json();
           setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        } else {
           toast.error('Copilot encountered an error.');
        }
     } catch (err) {
        toast.error('Network Error');
     } finally {
        setLoading(false);
     }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#0A1829] border border-white/5 rounded-2xl overflow-hidden relative">
       {/* Background accent */}
       <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-blue-500/20 via-asas-gold/40 to-blue-500/20" />
       
       <div className="p-4 border-b border-white/5 bg-[#051121] flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center border border-blue-500/20 relative">
                <Brain className="w-4 h-4 text-blue-400" />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#051121]"></span>
             </div>
             <div>
                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                   Operations Copilot
                   <span className="px-2 py-0.5 rounded text-[8px] uppercase tracking-widest font-bold bg-white/10 text-white/70">Beta</span>
                </h3>
                <p className="text-[10px] text-blue-400/70 font-mono tracking-widest uppercase">AI Strategic Assistant</p>
             </div>
          </div>
       </div>

       <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar" ref={scrollRef}>
          {messages.map((msg, i) => (
             <div key={i} className={clsx("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                 <div className={clsx(
                    "w-6 h-6 rounded-full shrink-0 flex items-center justify-center mt-1",
                    msg.role === 'user' ? "bg-white/10" : "bg-blue-500/20 border border-blue-500/30"
                 )}>
                    {msg.role === 'user' ? <User className="w-3 h-3 text-white/70" /> : <Bot className="w-3 h-3 text-blue-400" />}
                 </div>
                 <div className={clsx(
                    "max-w-[80%] rounded-xl px-4 py-3 text-sm font-medium leading-relaxed shadow-sm",
                    msg.role === 'user' 
                       ? "bg-white/10 text-white rounded-tr-sm" 
                       : "bg-[#051121] border border-white/10 text-white/90 rounded-tl-sm"
                 )}>
                    <div className="whitespace-pre-wrap">{msg.content}</div>
                 </div>
             </div>
          ))}
          {loading && (
             <div className="flex gap-3 flex-row">
                 <div className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center mt-1 bg-blue-500/20 border border-blue-500/30">
                    <Bot className="w-3 h-3 text-blue-400" />
                 </div>
                 <div className="max-w-[80%] rounded-xl px-4 py-3 text-sm bg-[#051121] border border-white/10 text-white/50 rounded-tl-sm flex items-center gap-2">
                    <Loader2 className="w-3 h-3 animate-spin" /> Analyzing enterprise graph...
                 </div>
             </div>
          )}
       </div>

       <div className="p-3 bg-[#051121] border-t border-white/5">
          <form onSubmit={handleSubmit} className="relative flex items-center">
             <input 
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Ask about deals, risks, or performance..." 
                className="w-full bg-[#0A1829] border border-white/10 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 shadow-inner"
             />
             <button 
                type="submit" 
                disabled={!query.trim() || loading}
                className="absolute right-2 p-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:bg-white/10 text-white rounded-lg transition-colors">
                <Send className="w-4 h-4" />
             </button>
          </form>
       </div>
    </div>
  )
}
