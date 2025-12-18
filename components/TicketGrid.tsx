import React from 'react';
import { Ticket, TicketStatus } from '../types';
import { STATUS_COLORS } from '../constants';
import { RefreshCw, X } from 'lucide-react';

interface TicketGridProps {
  tickets: Ticket[];
  onToggleTicket: (id: string) => void;
  swappingTicketId?: string | null;
  isFullScreen?: boolean;
}

const TicketGrid: React.FC<TicketGridProps> = ({ tickets, onToggleTicket, swappingTicketId, isFullScreen = false }) => {
  return (
    <div className={`
      grid rounded-2xl transition-all duration-500 w-full
      ${isFullScreen 
        ? 'grid-cols-10 gap-2 sm:gap-3 p-4 bg-slate-950 border border-slate-900 shadow-[0_0_50px_rgba(0,0,0,1)]'
        : 'grid-cols-5 sm:grid-cols-10 gap-3 sm:gap-4 p-5 bg-slate-900 border border-slate-800 shadow-2xl'
      }
    `}>
      {tickets.map((ticket) => {
        const isSwappingSource = ticket.id === swappingTicketId;
        
        // Logical check for when to show the "X" (Any occupied state)
        const isOccupied = 
          ticket.status === TicketStatus.SELECTED || 
          ticket.status === TicketStatus.RESERVED || 
          ticket.status === TicketStatus.PAID;

        // An interactive ticket is one that is available to be clicked
        // OR the one we are currently swapping FROM
        let isInteractive = ticket.status === TicketStatus.AVAILABLE || ticket.status === TicketStatus.SELECTED;
        
        if (swappingTicketId) {
            isInteractive = ticket.status === TicketStatus.AVAILABLE; 
        }

        return (
          <button
            type="button"
            key={ticket.id}
            onClick={() => isInteractive ? onToggleTicket(ticket.id) : null}
            disabled={!isInteractive && !isSwappingSource}
            className={`
              relative flex flex-col items-center justify-center rounded-xl font-black transition-all duration-300
              ${isSwappingSource ? 'bg-indigo-900 border-indigo-400 text-white ring-2 ring-indigo-500/50 z-10' : STATUS_COLORS[ticket.status]}
              ${!isInteractive && !isSwappingSource ? 'cursor-not-allowed opacity-100' : 'active:scale-90 cursor-pointer'}
              aspect-square ${isFullScreen ? 'text-xl sm:text-4xl' : 'text-lg sm:text-2xl'} border-2
            `}
          >
            {/* The Number - Pure white for all states for maximum legibility */}
            <span className="relative z-10 text-white drop-shadow-lg">
              {ticket.id}
            </span>
            
            {/* The "X" overlay - Red and prominent for any occupied ticket */}
            {isOccupied && !isSwappingSource && (
               <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                  <X 
                    className="w-full h-full text-red-900 opacity-60 p-0.5 sm:p-1" 
                    strokeWidth={isFullScreen ? 6 : 5}
                  />
               </div>
            )}
            
            {/* Swap indicator */}
            {isSwappingSource && (
              <RefreshCw className={`absolute top-1 right-1 animate-spin-slow opacity-80 ${isFullScreen ? 'w-4 h-4 sm:w-6 sm:h-6' : 'w-3 h-3 sm:w-4 sm:h-4'}`} />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default TicketGrid;