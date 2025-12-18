import React, { useMemo, useState } from 'react';
import { Ticket, TicketStatus, UserSummary } from '../types';
import { TICKET_PRICE } from '../constants';
import { 
  Search, 
  Trash2, 
  X, 
  AlertTriangle, 
  UserMinus, 
  ChevronDown, 
  Pencil,
  PlusSquare
} from 'lucide-react';

interface UserSummaryListProps {
  tickets: Ticket[];
  onTogglePayment: (ticketId: string) => void;
  onRevokeTicket: (ticketId: string) => void;
  onRevokeAllFromUser: (userName: string) => void;
  onEditTicket: (ticketId: string) => void;
  onAddMoreTickets: (userName: string) => void;
}

const UserSummaryList: React.FC<UserSummaryListProps> = ({ 
  tickets, 
  onTogglePayment, 
  onRevokeTicket, 
  onRevokeAllFromUser, 
  onEditTicket,
  onAddMoreTickets
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedUsers, setExpandedUsers] = useState<Record<string, boolean>>({});
  const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string; ownerName: string } | null>(null);
  const [revokeAllConfirmation, setRevokeAllConfirmation] = useState<string | null>(null);

  const toggleUser = (userName: string) => {
    setExpandedUsers(prev => ({ ...prev, [userName]: !prev[userName] }));
  };

  const users: UserSummary[] = useMemo(() => {
    const userMap = new Map<string, UserSummary>();
    tickets.forEach(ticket => {
      if (!ticket.ownerName) return;
      if (!userMap.has(ticket.ownerName)) {
        userMap.set(ticket.ownerName, {
          name: ticket.ownerName,
          tickets: [],
          totalDebt: 0,
          totalPaid: 0,
          ticketCount: 0
        });
      }
      const user = userMap.get(ticket.ownerName)!;
      user.tickets.push(ticket);
      user.ticketCount++;
      if (ticket.status === TicketStatus.PAID) user.totalPaid += TICKET_PRICE;
      else if (ticket.status === TicketStatus.RESERVED) user.totalDebt += TICKET_PRICE;
    });
    let result = Array.from(userMap.values()).sort((a, b) => b.totalDebt - a.totalDebt);
    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(u => u.name.toLowerCase().includes(lower) || u.tickets.some(t => t.id.includes(lower)));
    }
    return result;
  }, [tickets, searchTerm]);

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
        <input
          type="text"
          className="w-full pl-14 pr-12 py-5 bg-slate-900 border border-slate-800 rounded-[2rem] focus:ring-2 focus:ring-emerald-500/20 shadow-xl text-base outline-none text-slate-100 placeholder-slate-600"
          placeholder="Buscar persona o #..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <button onClick={() => setSearchTerm('')} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500">
            <X size={20} />
          </button>
        )}
      </div>

      {users.length === 0 && (
        <div className="text-center py-20 bg-slate-900/50 rounded-[2rem] border border-dashed border-slate-800">
          <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">No se encontraron resultados</p>
        </div>
      )}

      {users.map((user) => {
        const isExpanded = expandedUsers[user.name] || false;
        
        return (
          <div key={user.name} className="bg-slate-900 rounded-[1.5rem] border border-slate-800 shadow-lg overflow-hidden transition-all duration-300">
            {/* User Header */}
            <div 
              onClick={() => toggleUser(user.name)}
              className="p-4 flex justify-between items-center cursor-pointer hover:bg-slate-800/50 select-none"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-black text-slate-100 truncate uppercase italic tracking-tight">{user.name}</h3>
                  <span className="shrink-0 text-[10px] bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-lg font-black">
                    {user.ticketCount}
                  </span>
                </div>
                <div className="flex gap-3 text-[10px] font-bold">
                  <span className="text-emerald-400 uppercase tracking-tighter">Pagado: ${user.totalPaid.toLocaleString()}</span>
                  {user.totalDebt > 0 && (
                    <span className="text-amber-500 uppercase tracking-tighter">Deuda: ${user.totalDebt.toLocaleString()}</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-1 ml-4">
                <button 
                  onClick={(e) => { e.stopPropagation(); onAddMoreTickets(user.name); }}
                  className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-all flex items-center gap-1"
                  title="Añadir más boletas"
                >
                  <PlusSquare size={18} />
                  <span className="text-[9px] font-black uppercase hidden sm:inline">Añadir</span>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); setRevokeAllConfirmation(user.name); }}
                  className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                  title="Eliminar registro"
                >
                  <UserMinus size={18} />
                </button>
                <div className={`text-slate-600 transition-transform duration-300 ml-1 ${isExpanded ? 'rotate-180' : ''}`}>
                  <ChevronDown size={20} />
                </div>
              </div>
            </div>

            {/* Expanded Ultra-Compact Grid */}
            <div className={`
              transition-all duration-300 ease-in-out overflow-hidden
              ${isExpanded ? 'max-h-[2000px] border-t border-slate-800 opacity-100' : 'max-h-0 opacity-0'}
            `}>
              <div className="p-3 bg-slate-950/40 grid grid-cols-2 sm:grid-cols-3 gap-2">
                {user.tickets.map(ticket => {
                  const isPaid = ticket.status === TicketStatus.PAID;
                  return (
                    <div 
                      key={ticket.id} 
                      className={`
                        flex items-center justify-between p-2 rounded-xl border bg-slate-900 shadow-sm
                        ${isPaid ? 'border-emerald-500/20' : 'border-amber-500/20'}
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`
                          w-8 h-8 flex items-center justify-center rounded-lg font-mono font-black text-sm shadow-inner
                          ${isPaid ? 'bg-emerald-500 text-slate-950' : 'bg-amber-500 text-slate-950'}
                        `}>
                          {ticket.id}
                        </div>
                        <button 
                          onClick={() => onTogglePayment(ticket.id)}
                          className={`
                            text-[8px] font-black uppercase px-1.5 py-0.5 rounded-md
                            ${isPaid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500'}
                          `}
                        >
                          {isPaid ? 'PAGO' : 'DEBE'}
                        </button>
                      </div>
                      
                      <div className="flex items-center gap-0.5">
                        <button onClick={() => onEditTicket(ticket.id)} className="p-1.5 text-slate-600 hover:text-slate-100" title="Mover número"><Pencil size={14} /></button>
                        <button onClick={() => setDeleteConfirmation({id: ticket.id, ownerName: user.name})} className="p-1.5 text-slate-600 hover:text-red-500" title="Liberar número"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}

      {/* Modals... */}
      {deleteConfirmation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 rounded-[2rem] shadow-2xl max-w-sm w-full p-8 text-center border border-slate-800">
            <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center text-red-500 mx-auto mb-4"><AlertTriangle size={30} /></div>
            <h3 className="text-xl font-black mb-2 uppercase italic">¿Liberar #{deleteConfirmation.id}?</h3>
            <p className="text-slate-500 text-xs mb-8">El número quedará disponible para la venta nuevamente.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmation(null)} className="flex-1 py-3 bg-slate-800 text-slate-400 rounded-xl font-bold uppercase text-xs">Atrás</button>
              <button onClick={() => { onRevokeTicket(deleteConfirmation.id); setDeleteConfirmation(null); }} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold uppercase text-xs">Liberar</button>
            </div>
          </div>
        </div>
      )}

      {revokeAllConfirmation && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 rounded-[2rem] shadow-2xl max-w-sm w-full p-8 text-center border border-slate-800">
            <div className="bg-red-500/10 w-16 h-16 rounded-full flex items-center justify-center text-red-500 mx-auto mb-4"><UserMinus size={30} /></div>
            <h3 className="text-xl font-black mb-2 uppercase italic">¿Eliminar Registro?</h3>
            <p className="text-slate-500 text-xs mb-8">Se liberarán todas las boletas de <b className="text-white">{revokeAllConfirmation}</b>.</p>
            <div className="flex gap-3">
              <button onClick={() => setRevokeAllConfirmation(null)} className="flex-1 py-3 bg-slate-800 text-slate-400 rounded-xl font-bold uppercase text-xs">Cancelar</button>
              <button onClick={() => { onRevokeAllFromUser(revokeAllConfirmation); setRevokeAllConfirmation(null); }} className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold uppercase text-xs">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSummaryList;