
import React, { forwardRef } from 'react';
import { Ticket, TicketStatus } from '../types';
import { STATUS_COLORS } from '../constants';
import { RefreshCw, X, Check } from 'lucide-react';

interface TicketGridProps {
  tickets: Ticket[];
  onToggleTicket: (id: string) => void;
  swappingTicketId?: string | null;
  isFullScreen?: boolean;
  activeOwnerName?: string | null;
}

const TicketGrid = forwardRef<HTMLDivElement, TicketGridProps>(({ 
  tickets, 
  onToggleTicket, 
  swappingTicketId, 
  isFullScreen = false, 
  activeOwnerName = null 
}, ref) => {
  return (
    <div 
      ref={ref}
      id="raffle-grid-capture"
      className={`
        grid transition-all duration-500 w-full mx-auto
        ${isFullScreen 
          ? 'grid-cols-10 grid-rows-10 h-full w-full gap-1 p-1 bg-slate-950 overflow-hidden' 
          : 'grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-3 p-4 bg-slate-900/50 border border-slate-800/50 shadow-2xl rounded-[2rem] backdrop-blur-sm'
        }
      `}
    >
      {tickets.map((ticket) => {
        const isSwappingSource = ticket.id === swappingTicketId;
        const belongsToActiveUser = activeOwnerName && ticket.ownerName === activeOwnerName;
        const isPaid = ticket.status === TicketStatus.PAID;
        const isReserved = ticket.status === TicketStatus.RESERVED;
        const isSelected = ticket.status === TicketStatus.SELECTED;
        
        const isOccupied = isReserved || isPaid || isSelected;

        let isInteractive = ticket.status === TicketStatus.AVAILABLE || isSelected;
        
        if (swappingTicketId) {
            isInteractive = ticket.status === TicketStatus.AVAILABLE; 
        } else if (activeOwnerName) {
            isInteractive = ticket.status === TicketStatus.AVAILABLE || belongsToActiveUser;
        }

        return (
          <button
            type="button"
            key={ticket.id}
            onClick={() => isInteractive ? onToggleTicket(ticket.id) : null}
            disabled={!isInteractive && !isSwappingSource}
            className={`
              relative flex flex-col items-center justify-center font-black transition-all duration-300 rounded-lg sm:rounded-xl border-2
              ${isSwappingSource ? 'bg-indigo-600 border-indigo-400 text-white ring-4 ring-indigo-500/30 z-10 scale-105' : STATUS_COLORS[ticket.status]}
              ${belongsToActiveUser ? 'bg-emerald-500/40 border-emerald-400 text-emerald-50 shadow-[0_0_20px_rgba(52,211,153,0.5)] z-10 scale-105' : ''}
              ${!isInteractive && !isSwappingSource ? 'cursor-not-allowed opacity-100' : 'active:scale-90 cursor-pointer'}
              ${isFullScreen ? 'h-full w-full text-[2.2vh] sm:text-[2.8vh]' : 'aspect-square text-lg sm:text-2xl'}
            `}
          >
            {/* Numero del ticket: En pantalla completa los ocupados son casi invisibles */}
            <span className={`
              relative z-10 transition-all duration-300 drop-shadow-md
              ${isFullScreen && (isReserved || isPaid) ? 'opacity-[0.05]' : (isOccupied && !isSwappingSource && !belongsToActiveUser ? 'opacity-90' : 'opacity-100')}
              ${isSelected ? 'scale-110 text-white' : ''}
              ${(isReserved || isPaid) && !isFullScreen ? 'text-red-200' : ''}
            `}>
              {ticket.id}
            </span>
            
            {/* Indicadores de estado: Ocultos o muy tenues en pantalla completa para limpieza visual */}
            {isOccupied && !isSwappingSource && !isSelected && (
               <div className={`absolute inset-0 z-0 flex items-center justify-center pointer-events-none p-1 ${isFullScreen ? 'opacity-[0.03]' : 'opacity-20'}`}>
                  {isPaid ? (
                    <Check className="text-red-400 w-full h-full" strokeWidth={4} />
                  ) : (
                    <X className="text-red-400 w-full h-full" strokeWidth={4} />
                  )}
               </div>
            )}
            
            {/* Efecto de intercambio */}
            {isSwappingSource && (
              <RefreshCw className={`absolute bottom-1 right-1 animate-spin-slow text-white/70 w-2 h-2 sm:w-4 sm:h-4`} />
            )}
            
            {/* Brillo decorativo superior para realismo táctil */}
            <div className="absolute top-0 left-0 right-0 h-[40%] bg-gradient-to-b from-white/10 to-transparent rounded-t-lg pointer-events-none"></div>
          </button>
        );
      })}
    </div>
  );
});

export default TicketGrid;
