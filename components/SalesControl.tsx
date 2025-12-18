import React, { useState, useEffect } from 'react';
import { Ticket } from '../types';
import { TICKET_PRICE } from '../constants';
import { ShoppingCart, X, Check } from 'lucide-react';

interface SalesControlProps {
  selectedTickets: Ticket[];
  onConfirmSale: (name: string, isPaid: boolean) => void;
  onClearSelection: () => void;
  initialBuyerName?: string;
}

const SalesControl: React.FC<SalesControlProps> = ({ 
  selectedTickets, 
  onConfirmSale, 
  onClearSelection,
  initialBuyerName = ''
}) => {
  const [buyerName, setBuyerName] = useState(initialBuyerName);
  
  // Update internal name if initial name changes (e.g. from "Add more" mode)
  useEffect(() => {
    setBuyerName(initialBuyerName);
  }, [initialBuyerName]);

  if (selectedTickets.length === 0) return null;

  const total = selectedTickets.length * TICKET_PRICE;

  const handleSubmit = (payNow: boolean) => {
    if (!buyerName.trim()) return;
    onConfirmSale(buyerName, payNow);
    setBuyerName('');
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

        <div className="flex-1 w-full md:w-auto flex flex-col md:flex-row gap-3 px-4 md:px-0 pb-4 md:pb-0">
          <input
            type="text"
            placeholder="Nombre del Cliente..."
            value={buyerName}
            onChange={(e) => setBuyerName(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl px-5 py-4 text-base focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/40 transition-all text-slate-100 placeholder-slate-600 font-bold italic"
          />
          
          <div className="flex gap-3">
            <button
              onClick={() => handleSubmit(false)}
              disabled={!buyerName.trim()}
              className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-20 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Reservar
            </button>
            <button
              onClick={() => handleSubmit(true)}
              disabled={!buyerName.trim()}
              className="flex-1 md:flex-none bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-20 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2"
            >
              <Check size={14} strokeWidth={4} /> Confirmar
            </button>
          </div>
        </div>

        <button 
          onClick={onClearSelection}
          className="absolute -top-3 -right-3 bg-slate-800 text-slate-500 hover:text-red-500 rounded-full p-2 shadow-2xl border border-slate-700 transition-colors ring-4 ring-slate-950"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default SalesControl;