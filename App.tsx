import React, { useState, useEffect, useRef } from 'react';
import TicketGrid from './components/TicketGrid';
import UserSummaryList from './components/UserSummaryList';
import SalesControl from './components/SalesControl';
import { Ticket, TicketStatus } from './types';
import { TOTAL_NUMBERS, TICKET_PRICE } from './constants';
import { LayoutGrid, Users, Trophy, RefreshCw, Database, Download, Upload, Trash, CheckCircle, Maximize2, Minimize2, Check, UserPlus } from 'lucide-react';

const App: React.FC = () => {
  const [tickets, setTickets] = useState<Ticket[]>(() => {
    const saved = localStorage.getItem('raffleTickets_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading tickets", e);
      }
    }
    return Array.from({ length: TOTAL_NUMBERS }, (_, i) => ({
      id: i.toString().padStart(2, '0'),
      status: TicketStatus.AVAILABLE,
    }));
  });

  const [activeTab, setActiveTab] = useState<'grid' | 'users'>('grid');
  const [swappingTicketId, setSwappingTicketId] = useState<string | null>(null);
  const [addingTicketsToUser, setAddingTicketsToUser] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showDbMenu, setShowDbMenu] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [fullScreenName, setFullScreenName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsSaving(true);
    localStorage.setItem('raffleTickets_v2', JSON.stringify(tickets));
    const timer = setTimeout(() => setIsSaving(false), 600);
    return () => clearTimeout(timer);
  }, [tickets]);

  const handleToggleTicket = (id: string) => {
    if (swappingTicketId) {
       const targetTicket = tickets.find(t => t.id === id);
       if (targetTicket && targetTicket.status === TicketStatus.AVAILABLE) {
          setTickets(prev => {
             const oldTicket = prev.find(t => t.id === swappingTicketId)!;
             return prev.map(t => {
                if (t.id === swappingTicketId) return { ...t, status: TicketStatus.AVAILABLE, ownerName: undefined };
                if (t.id === id) return { ...t, status: oldTicket.status, ownerName: oldTicket.ownerName };
                return t;
             });
          });
          setSwappingTicketId(null);
       }
       return;
    }

    setTickets(prev => prev.map(t => {
      if (t.id !== id) return t;
      if (t.status === TicketStatus.AVAILABLE) return { ...t, status: TicketStatus.SELECTED };
      if (t.status === TicketStatus.SELECTED) return { ...t, status: TicketStatus.AVAILABLE };
      return t; 
    }));
  };

  const handleConfirmSale = (name: string, isPaid: boolean) => {
    setTickets(prev => prev.map(t => {
      if (t.status === TicketStatus.SELECTED) {
        return {
          ...t,
          status: isPaid ? TicketStatus.PAID : TicketStatus.RESERVED,
          ownerName: name
        };
      }
      return t;
    }));
    if (!isFullScreen) {
      setActiveTab('users');
    }
    setAddingTicketsToUser(null);
    setFullScreenName('');
  };

  const handleClearSelection = () => {
    setTickets(prev => prev.map(t => 
      t.status === TicketStatus.SELECTED ? { ...t, status: TicketStatus.AVAILABLE } : t
    ));
    setAddingTicketsToUser(null);
  };

  const handleTogglePayment = (id: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id !== id) return t;
      if (t.status === TicketStatus.RESERVED) return { ...t, status: TicketStatus.PAID };
      if (t.status === TicketStatus.PAID) return { ...t, status: TicketStatus.RESERVED };
      return t;
    }));
  };

  const handleRevokeTicket = (id: string) => {
    setTickets(prev => prev.map(t => 
      t.id === id ? { ...t, status: TicketStatus.AVAILABLE, ownerName: undefined } : t
    ));
  };

  const handleRevokeAllFromUser = (userName: string) => {
    setTickets(prev => prev.map(t => 
      t.ownerName === userName ? { ...t, status: TicketStatus.AVAILABLE, ownerName: undefined } : t
    ));
  };

  const handleStartSwap = (id: string) => {
    setSwappingTicketId(id);
    setActiveTab('grid');
    handleClearSelection();
  };

  const handleStartAddingToUser = (userName: string) => {
    setAddingTicketsToUser(userName);
    setActiveTab('grid');
    handleClearSelection();
  };

  const handleCancelSwap = () => {
    setSwappingTicketId(null);
  };

  const handleCancelAddMore = () => {
    setAddingTicketsToUser(null);
    handleClearSelection();
  };

  const handleDownloadBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tickets));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `rifa_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setShowDbMenu(false);
  };

  const totalRaised = tickets.filter(t => t.status === TicketStatus.PAID).length * TICKET_PRICE;
  const totalPending = tickets.filter(t => t.status === TicketStatus.RESERVED).length * TICKET_PRICE;
  const selectedCount = tickets.filter(t => t.status === TicketStatus.SELECTED).length;
  const percentSold = ((tickets.filter(t => t.status === TicketStatus.PAID || t.status === TicketStatus.RESERVED).length) / TOTAL_NUMBERS) * 100;

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-50 select-none ${isFullScreen ? 'h-screen overflow-hidden' : 'pb-40'}`}>
      
      {!isFullScreen && (
        <header className="bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-800">
          <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center justify-between w-full sm:w-auto">
               <div className="flex items-center space-x-3">
                  <div className="bg-emerald-500 text-slate-950 p-2 rounded-lg">
                    <Trophy size={20} />
                  </div>
                  <div>
                    <h1 className="text-xl font-black tracking-tight leading-none uppercase italic">RifaMaster</h1>
                    <div className="flex items-center mt-1">
                      {isSaving ? (
                        <span className="flex items-center text-[10px] text-slate-500 font-medium">
                          <RefreshCw size={10} className="mr-1 animate-spin" /> Sincronizando...
                        </span>
                      ) : (
                        <span className="flex items-center text-[10px] text-emerald-400 font-bold uppercase tracking-widest">
                          <CheckCircle size={10} className="mr-1" /> Datos Protegidos
                        </span>
                      )}
                    </div>
                  </div>
               </div>
               
               <div className="flex items-center gap-2 sm:ml-6">
                  <button 
                    onClick={() => setIsFullScreen(true)}
                    className="p-2.5 text-emerald-400 hover:bg-emerald-500/10 bg-slate-800 rounded-xl transition-all active:scale-95"
                    title="Modo Tablero Completo"
                  >
                    <Maximize2 size={20} />
                  </button>
                  <div className="relative">
                    <button 
                      onClick={() => setShowDbMenu(!showDbMenu)}
                      className="p-2.5 text-slate-400 hover:text-slate-100 bg-slate-800 rounded-xl transition-colors"
                    >
                      <Database size={20} />
                    </button>
                    {showDbMenu && (
                      <div className="absolute top-full right-0 mt-3 w-52 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 z-50 overflow-hidden ring-1 ring-white/10">
                        <div className="p-2 space-y-1">
                           <button onClick={handleDownloadBackup} className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition-colors">
                              <Download size={16} /> <span>Respaldar Datos</span>
                           </button>
                           <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition-colors">
                              <Upload size={16} /> <span>Cargar Datos</span>
                           </button>
                           <div className="h-px bg-slate-800 my-1 mx-2"></div>
                           <button onClick={() => { if(confirm('¿Borrar TODO?')) setTickets(Array.from({ length: TOTAL_NUMBERS }, (_, i) => ({ id: i.toString().padStart(2, '0'), status: TicketStatus.AVAILABLE }))); setShowDbMenu(false); }} className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-400 hover:bg-red-950/30 rounded-xl font-bold transition-colors">
                              <Trash size={16} /> <span>Reiniciar Rifa</span>
                           </button>
                        </div>
                      </div>
                    )}
                  </div>
               </div>
            </div>
            
            <div className="flex items-center space-x-6 text-sm w-full sm:w-auto overflow-x-auto scrollbar-hide">
               <div className="min-w-fit">
                 <p className="text-slate-500 text-[10px] uppercase font-black mb-1">Caja</p>
                 <p className="text-xl font-black text-emerald-400 leading-none">${totalRaised.toLocaleString()}</p>
               </div>
               <div className="min-w-fit">
                 <p className="text-slate-500 text-[10px] uppercase font-black mb-1">Cuentas</p>
                 <p className="text-xl font-black text-amber-500 leading-none">${totalPending.toLocaleString()}</p>
               </div>
               <div className="flex-1 sm:w-28 bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
                 <div className="bg-emerald-500 h-full rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]" style={{ width: `${percentSold}%`}}></div>
               </div>
            </div>
          </div>
        </header>
      )}

      {/* Title for Full Screen */}
      {isFullScreen && (
        <div className="fixed top-0 left-0 right-0 p-5 bg-slate-950/90 backdrop-blur-md z-50 border-b border-slate-900 flex flex-col items-center">
            <h2 className="text-xl font-black italic uppercase tracking-[0.3em] text-emerald-400">ESTADO DE LA RIFA</h2>
            <div className="flex gap-4 mt-2">
                <span className="text-[9px] font-black uppercase text-slate-500 tracking-tighter">Ventas: {percentSold.toFixed(0)}%</span>
                <span className="text-[9px] font-black uppercase text-slate-500 tracking-tighter">Recaudado: ${totalRaised.toLocaleString()}</span>
                {selectedCount > 0 && <span className="text-[9px] font-black uppercase text-red-400 tracking-tighter">Seleccionados: {selectedCount}</span>}
            </div>
        </div>
      )}

      <main className={`${isFullScreen ? 'h-full flex flex-col pt-24 pb-28' : 'max-w-5xl mx-auto px-4 py-8'}`}>
        {!isFullScreen && (
          <div className="flex space-x-8 border-b border-slate-800 mb-8">
            <button onClick={() => { setActiveTab('grid'); handleCancelSwap(); handleCancelAddMore(); }} className={`pb-4 px-2 text-sm font-black uppercase tracking-widest relative transition-all ${activeTab === 'grid' ? 'text-emerald-400' : 'text-slate-500'}`}>
              <div className="flex items-center gap-2.5"><LayoutGrid size={18} /><span>Tablero</span></div>
              {activeTab === 'grid' && <span className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500 rounded-t-full shadow-[0_0_10px_rgba(16,185,129,0.4)]"></span>}
            </button>
            <button onClick={() => { setActiveTab('users'); handleCancelSwap(); handleCancelAddMore(); }} className={`pb-4 px-2 text-sm font-black uppercase tracking-widest relative transition-all ${activeTab === 'users' ? 'text-emerald-400' : 'text-slate-500'}`}>
               <div className="flex items-center gap-2.5"><Users size={18} /><span>Participantes</span></div>
              {activeTab === 'users' && <span className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500 rounded-t-full shadow-[0_0_10px_rgba(16,185,129,0.4)]"></span>}
            </button>
          </div>
        )}

        <div className={`animate-fade-in flex-1 ${isFullScreen ? 'flex items-center justify-center' : ''}`}>
          {activeTab === 'grid' ? (
            <div className={isFullScreen ? 'w-full max-w-6xl px-4 flex items-center justify-center' : ''}>
              {swappingTicketId && !isFullScreen && (
                 <div className="bg-indigo-950/40 border border-indigo-500/30 rounded-2xl p-4 mb-8 flex justify-between items-center ring-1 ring-indigo-500/20">
                    <p className="text-sm font-semibold text-indigo-300 italic">Moviendo #{swappingTicketId}. Elije un nuevo destino disponible.</p>
                    <button onClick={handleCancelSwap} className="text-[10px] font-black bg-indigo-500 text-white px-4 py-2 rounded-xl uppercase">Cancelar</button>
                 </div>
              )}
              {addingTicketsToUser && !isFullScreen && (
                 <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-2xl p-4 mb-8 flex justify-between items-center ring-1 ring-emerald-500/20 animate-pulse">
                    <div className="flex items-center gap-3">
                      <UserPlus className="text-emerald-400" size={20} />
                      <p className="text-sm font-semibold text-emerald-300 italic">Seleccionando nuevas boletas para: <b className="text-white uppercase">{addingTicketsToUser}</b></p>
                    </div>
                    <button onClick={handleCancelAddMore} className="text-[10px] font-black bg-slate-800 text-slate-300 hover:text-white px-4 py-2 rounded-xl uppercase">Cancelar</button>
                 </div>
              )}
              <TicketGrid tickets={tickets} onToggleTicket={handleToggleTicket} swappingTicketId={swappingTicketId} isFullScreen={isFullScreen} />
            </div>
          ) : (
            <UserSummaryList 
              tickets={tickets} 
              onTogglePayment={handleTogglePayment}
              onRevokeTicket={handleRevokeTicket}
              onRevokeAllFromUser={handleRevokeAllFromUser}
              onEditTicket={handleStartSwap}
              onAddMoreTickets={handleStartAddingToUser}
            />
          )}
        </div>
      </main>

      {/* Control for Full Screen */}
      {isFullScreen && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 z-50 flex justify-center items-center shadow-[0_-20px_40px_rgba(0,0,0,0.6)]">
           <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-5xl px-4">
              <div className="flex-1 w-full sm:w-auto flex items-center gap-3">
                 <input 
                   type="text" 
                   placeholder="Nombre del Participante..." 
                   value={fullScreenName || (addingTicketsToUser || '')}
                   onChange={(e) => {
                      if (addingTicketsToUser) setAddingTicketsToUser(e.target.value);
                      else setFullScreenName(e.target.value);
                   }}
                   className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-emerald-500/30 transition-all text-slate-100 placeholder-slate-600 font-bold italic"
                 />
                 {selectedCount > 0 && (
                   <div className="flex gap-2">
                     <button 
                       onClick={() => handleConfirmSale(addingTicketsToUser || fullScreenName, false)}
                       disabled={!(addingTicketsToUser || fullScreenName).trim()}
                       className="bg-slate-800 text-amber-500 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-20 transition-all whitespace-nowrap"
                     >
                       Apartar
                     </button>
                     <button 
                       onClick={() => handleConfirmSale(addingTicketsToUser || fullScreenName, true)}
                       disabled={!(addingTicketsToUser || fullScreenName).trim()}
                       className="bg-emerald-500 text-slate-950 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-20 transition-all flex items-center gap-2 whitespace-nowrap"
                     >
                       <Check size={14} strokeWidth={4} /> Pagado
                     </button>
                   </div>
                 )}
              </div>

              <button 
                onClick={() => { setIsFullScreen(false); setAddingTicketsToUser(null); }}
                className="bg-slate-800 hover:bg-slate-700 text-slate-400 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 active:scale-95 transition-all shadow-lg border border-slate-700 sm:ml-auto"
              >
                <Minimize2 size={16} />
                SALIR DE VISTA GENERAL
              </button>
           </div>
        </div>
      )}

      {!swappingTicketId && !isFullScreen && (
        <SalesControl 
          selectedTickets={tickets.filter(t => t.status === TicketStatus.SELECTED)} 
          onConfirmSale={handleConfirmSale}
          onClearSelection={handleClearSelection}
          initialBuyerName={addingTicketsToUser || ''}
        />
      )}

      <input type="file" ref={fileInputRef} onChange={(e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (re) => {
          try { 
            const data = JSON.parse(re.target?.result as string);
            if (Array.isArray(data)) setTickets(data);
          } catch(err) { alert("Archivo inválido"); }
        };
        reader.readAsText(file);
      }} accept=".json" className="hidden" />
    </div>
  );
};

export default App;