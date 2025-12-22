
import React, { useState, useEffect, useRef } from 'react';
import { Ticket } from '../types';
import { ShoppingCart, X, Check, User } from 'lucide-react';

interface SalesControlProps {
  selectedTickets: Ticket[];
  ticketPrice: number;
  onConfirmSale: (name: string, isPaid: boolean) => void;
  onClearSelection: () => void;
  initialBuyerName?: string;
  hideInEditMode?: boolean;
  existingNames?: string[];
}

const SalesControl: React.FC<SalesControlProps> = ({ 
  selectedTickets, 
  ticketPrice,
  onConfirmSale, 
  onClearSelection,
  initialBuyerName = '',
  hideInEditMode = false,
  existingNames = []
}) => {
  const [buyerName, setBuyerName] = useState(initialBuyerName);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    setBuyerName(initialBuyerName);
  }, [initialBuyerName]);

  useEffect(() => {
    if (buyerName.trim().length > 0) {
      const filtered = existingNames
        .filter(name => 
          name.toLowerCase().includes(buyerName.toLowerCase()) && 
          name.toLowerCase() !== buyerName.toLowerCase()
        )
        .slice(0, 5);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions(existingNames.slice(0, 5));
      setShowSuggestions(false);
    }
  }, [buyerName, existingNames]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (selectedTickets.length === 0 || hideInEditMode) return null;

  const total = selectedTickets.length * ticketPrice;

  const handleSubmit = (payNow: boolean) => {
    if (!buyerName.trim()) return;
    onConfirmSale(buyerName, payNow);
    setBuyerName('');
    setShowSuggestions(false);
  };

  return (
    <div className="fixed bottom-8 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-3xl z-50 animate-slide-up">
      <div className="bg-slate-900/95 backdrop-blur-xl rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-800 p-2 md:pl-8 flex flex-col md:flex-row items-center gap-6 ring-1 ring-white/10 relative">
        
        <div className="flex items-center gap-5 w-full md:w-auto py-3 md:py-0 px-4 md:px-0 border-b border-slate-800 md:border-0">
          <div className="bg-emerald-500 p-3 rounded-2xl text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <ShoppingCart size={22} />
          </div>
          <div>
             <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Resumen ({selectedTickets.length})</p>
             <p className="text-xl font-black text-white leading-none tracking-tight">${total.toLocaleString()}</p>
          </div>
        </div>

        <div className="flex-1 w-full md:w-auto flex flex-col md:flex-row gap-3 px-4 md:px-0 pb-4 md:pb-0 relative" ref={containerRef}>
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Nombre del Cliente..."
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-base focus:ring-2 focus:ring-emerald-500/30 transition-all text-slate-100 placeholder-slate-600 font-bold italic"
            />
            
            {showSuggestions && (
              <div className="absolute bottom-full left-0 w-full mb-3 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-y-auto max-h-48 z-[60]">
                <div className="p-2">
                  <p className="px-3 py-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 mb-1">Participantes Sugeridos</p>
                  {suggestions.length > 0 ? suggestions.map((name, i) => (
                    <button
                      key={i}
                      onClick={() => { setBuyerName(name); setShowSuggestions(false); }}
                      className="w-full text-left px-4 py-3 text-sm font-bold text-slate-200 hover:bg-emerald-500 hover:text-slate-950 rounded-xl transition-colors flex items-center gap-3"
                    >
                      <User size={14} className="opacity-50" />
                      {name}
                    </button>
                  )) : (
                    <p className="px-4 py-3 text-xs text-slate-600 italic">Escribe para registrar uno nuevo</p>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            <button onClick={() => handleSubmit(false)} disabled={!buyerName.trim()} className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-20 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Reservar</button>
            <button onClick={() => handleSubmit(true)} disabled={!buyerName.trim()} className="flex-1 md:flex-none bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-20 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2"><Check size={14} strokeWidth={4} /> Confirmar</button>
          </div>
        </div>

        <button onClick={onClearSelection} className="absolute -top-3 -right-3 bg-slate-800 text-slate-500 hover:text-red-500 rounded-full p-2 shadow-2xl border border-slate-700 transition-colors ring-4 ring-slate-950"><X size={16} /></button>
      </div>
    </div>
  );
};

export default SalesControl;
