export const TICKET_PRICE = 5000;
export const TOTAL_NUMBERS = 100; // 00-99

export const STATUS_COLORS = {
  // Disponible: Fondo oscuro sólido, número en blanco puro (máximo contraste)
  AVAILABLE: 'bg-slate-800 border-slate-700 text-white hover:border-slate-500 transition-all',
  
  // Seleccionado, Reservado y Pagado: Todos ahora usan el mismo Rojo vibrante
  SELECTED: 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)] z-10', 
  RESERVED: 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]', 
  PAID: 'bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)]',
};

export const STATUS_LABELS = {
  AVAILABLE: 'Disponible',
  SELECTED: 'Seleccionado',
  RESERVED: 'Ocupado',
  PAID: 'Ocupado',
};