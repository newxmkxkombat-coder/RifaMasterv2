
import React from 'react';
import { Ticket, TicketStatus } from '../types';
import { STATUS_COLORS } from '../constants';
import { RefreshCw, X } from 'lucide-react';

interface TicketGridProps {
  tickets: Ticket[];
  onToggleTicket: (id: string) => void;
  swappingTicketId?: string | null;
  isFullScreen?: boolean;
  activeOwnerName?: string | null;
}

const TicketGrid: React.FC<TicketGridProps> = ({ 
  tickets, 
  onToggleTicket, 
  swappingTicketId, 
  isFullScreen = false, 
  activeOwnerName = null 
}) => {
  return (
    <div 
      className={`
        grid transition-all duration-300 w-full mx-auto
        ${isFullScreen 
          ? 'grid-cols-10 grid-rows-10 h-full w-full gap-1 p-2 bg-slate-950 overflow-hidden' 
          : 'grid-cols-5 sm:grid-cols-10 gap-2 sm:gap-4 p-5 bg-slate-900 border border-slate-800 shadow-2xl rounded-2xl'
        }
      `}
    >
      {tickets.map((ticket) => {
        const isSwappingSource = ticket.id === swappingTicketId;
        const belongsToActiveUser = activeOwnerName && ticket.ownerName === activeOwnerName;
        
        const isOccupied = 
          ticket.status === TicketStatus.SELECTED || 
          ticket.status === TicketStatus.RESERVED || 
          ticket.status === TicketStatus.PAID;

        let isInteractive = ticket.status === TicketStatus.AVAILABLE || ticket.status === TicketStatus.SELECTED;
        
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
              relative flex flex-col items-center justify-center font-black transition-all duration-200 rounded-md sm:rounded-lg
              ${isSwappingSource ? 'bg-indigo-900 border-indigo-400 text-white ring-2 ring-indigo-500/50 z-10' : STATUS_COLORS[ticket.status]}
              ${belongsToActiveUser ? 'bg-emerald-950 border-emerald-500 text-white shadow-[0_0_5px_rgba(16,185,129,0.3)]' : ''}
              ${!isInteractive && !isSwappingSource ? 'cursor-not-allowed opacity-100' : 'active:scale-90 cursor-pointer'}
              ${isFullScreen ? 'h-full w-full text-[2.5vh] sm:text-[3vh]' : 'aspect-square text-lg sm:text-2xl'} border-2
            `}
          >
            <span className={`relative z-10 text-white drop-shadow-lg ${isOccupied && !isSwappingSource ? 'opacity-40' : 'opacity-100'}`}>
              {ticket.id}
            </span>
            
            {isOccupied && !isSwappingSource && (
               <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none overflow-hidden">
                  <X 
                    className={`w-full h-full opacity-100 scale-75 ${belongsToActiveUser ? 'text-emerald-400' : 'text-red-600'}`} 
                    strokeWidth={4}
                  />
               </div>
            )}
            
            {isSwappingSource && (
              <RefreshCw className={`absolute top-0.5 right-0.5 animate-spin-slow opacity-80 w-2 h-2 sm:w-3 sm:h-3`} />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default TicketGrid;
