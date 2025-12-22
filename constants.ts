
export const DEFAULT_TICKET_PRICE = 5000;
export const TOTAL_NUMBERS = 100; // 00-99

export const STATUS_COLORS = {
  AVAILABLE: 'bg-slate-800/60 border-slate-700 text-white hover:border-emerald-500/50 hover:bg-slate-800/80 transition-all duration-300',
  SELECTED: 'bg-sky-600 border-sky-300 text-white shadow-[0_0_20px_rgba(14,165,233,0.5)] z-20 scale-[1.05] ring-2 ring-sky-400/20', 
  RESERVED: 'bg-red-950/60 border-red-500/40 text-red-400 shadow-[inner_0_0_12px_rgba(239,68,68,0.1)]', 
  PAID: 'bg-red-600/20 border-red-500/60 text-red-200 shadow-[0_0_15px_rgba(239,68,68,0.15)]',
};

export const STATUS_LABELS = {
  AVAILABLE: 'Disponible',
  SELECTED: 'Seleccionado',
  RESERVED: 'Apartado',
  PAID: 'Pagado',
};
