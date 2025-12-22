
import React, { useState, useEffect, useRef, useMemo } from 'react';
import TicketGrid from './components/TicketGrid';
import UserSummaryList from './components/UserSummaryList';
import SalesControl from './components/SalesControl';
import { Ticket, TicketStatus } from './types';
import { TOTAL_NUMBERS, DEFAULT_TICKET_PRICE } from './constants';
import { 
  LayoutGrid, 
  Users, 
  Trophy, 
  RefreshCw, 
  Database, 
  Download, 
  Upload, 
  Trash, 
  CheckCircle, 
  Maximize2, 
  Minimize2, 
  Check, 
  UserPlus,
  FileText,
  Copy,
  X as CloseIcon,
  User as UserIcon,
  Camera,
  Loader2,
  DollarSign
} from 'lucide-react';

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

  const [ticketPrice, setTicketPrice] = useState<number>(() => {
    const saved = localStorage.getItem('raffleTicketPrice');
    return saved ? parseInt(saved, 10) : DEFAULT_TICKET_PRICE;
  });

  const [allTimeParticipants, setAllTimeParticipants] = useState<string[]>(() => {
    const saved = localStorage.getItem('raffleAllTimeParticipants');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<'grid' | 'users'>('grid');
  const [swappingTicketId, setSwappingTicketId] = useState<string | null>(null);
  const [addingTicketsToUser, setAddingTicketsToUser] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showDbMenu, setShowDbMenu] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [fullScreenName, setFullScreenName] = useState('');
  
  const fsInputContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const [fsSuggestions, setFsSuggestions] = useState<string[]>([]);
  const [showFsSuggestions, setShowFsSuggestions] = useState(false);

  const [exportModal, setExportModal] = useState<{ isOpen: boolean; content: string }>({
    isOpen: false,
    content: ''
  });
  const [copied, setCopied] = useState(false);

  const financialStats = useMemo(() => {
    const paidCount = tickets.filter(t => t.status === TicketStatus.PAID).length;
    const reservedCount = tickets.filter(t => t.status === TicketStatus.RESERVED).length;
    const totalSold = paidCount + reservedCount;
    
    return {
      paid: paidCount * ticketPrice,
      pending: reservedCount * ticketPrice,
      total: totalSold * ticketPrice,
      count: totalSold
    };
  }, [tickets, ticketPrice]);

  useEffect(() => {
    setIsSaving(true);
    localStorage.setItem('raffleTickets_v2', JSON.stringify(tickets));
    localStorage.setItem('raffleTicketPrice', ticketPrice.toString());
    localStorage.setItem('raffleAllTimeParticipants', JSON.stringify(allTimeParticipants));
    const timer = setTimeout(() => setIsSaving(false), 600);
    return () => clearTimeout(timer);
  }, [tickets, ticketPrice, allTimeParticipants]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fsInputContainerRef.current && !fsInputContainerRef.current.contains(event.target as Node)) {
        setShowFsSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const currentName = fullScreenName || addingTicketsToUser || '';
    if (currentName.trim().length > 0) {
      const filtered = allTimeParticipants
        .filter(name => name.toLowerCase().includes(currentName.toLowerCase()) && name.toLowerCase() !== currentName.toLowerCase())
        .slice(0, 5);
      setFsSuggestions(filtered);
      setShowFsSuggestions(filtered.length > 0);
    } else {
      setFsSuggestions(allTimeParticipants.slice(0, 5));
      setShowFsSuggestions(false);
    }
  }, [fullScreenName, addingTicketsToUser, allTimeParticipants]);

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

    if (addingTicketsToUser) {
        setTickets(prev => prev.map(t => {
            if (t.id !== id) return t;
            if (t.status === TicketStatus.AVAILABLE) {
                return { ...t, status: TicketStatus.RESERVED, ownerName: addingTicketsToUser };
            }
            if (t.ownerName === addingTicketsToUser) {
                return { ...t, status: TicketStatus.AVAILABLE, ownerName: undefined };
            }
            return t;
        }));
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
    const normalizedName = name.trim();
    if (!normalizedName) return;

    setTickets(prev => prev.map(t => {
      if (t.status === TicketStatus.SELECTED) {
        return {
          ...t,
          status: isPaid ? TicketStatus.PAID : TicketStatus.RESERVED,
          ownerName: normalizedName
        };
      }
      return t;
    }));
    
    // Memory logic: add to allTimeParticipants if not exists
    if (!allTimeParticipants.some(p => p.toLowerCase() === normalizedName.toLowerCase())) {
      setAllTimeParticipants(prev => [...prev, normalizedName].sort((a, b) => a.localeCompare(b)));
    }

    setAddingTicketsToUser(null);
    setFullScreenName('');
    setShowFsSuggestions(false);
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

  // Fix: Added missing handleEnterFullScreen function to handle transition to full screen mode
  const handleEnterFullScreen = () => {
    setIsFullScreen(true);
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

  const handleResetRaffle = () => {
    const firstConfirm = confirm('¿Estás seguro de que quieres reiniciar la rifa? Esta acción no se puede deshacer.');
    if (firstConfirm) {
      const secondConfirm = confirm('⚠️ ÚLTIMA ADVERTENCIA: Se borrarán todos los participantes actuales, pagos y números ocupados. ¿Deseas proceder con el reinicio total?');
      if (secondConfirm) {
        setTickets(Array.from({ length: TOTAL_NUMBERS }, (_, i) => ({ 
          id: i.toString().padStart(2, '0'), 
          status: TicketStatus.AVAILABLE 
        })));
        setShowDbMenu(false);
      }
    }
  };

  const handleCaptureBoard = async () => {
    if (!gridRef.current) return;
    setIsCapturing(true);
    try {
      const html2canvas = (window as any).html2canvas;
      const canvas = await html2canvas(gridRef.current, {
        backgroundColor: '#020617', 
        scale: 2, 
        logging: false,
        useCORS: true
      });
      const image = canvas.toDataURL("image/png");
      const fileName = `rifa_tablero_${new Date().getTime()}.png`;
      downloadImage(image, fileName);
    } catch (error) {
      console.error("Capture failed", error);
      alert("No se pudo tomar la captura.");
    } finally {
      setIsCapturing(false);
    }
  };

  const downloadImage = (dataUrl: string, name: string) => {
    const link = document.createElement('a');
    link.download = name;
    link.href = dataUrl;
    link.click();
  };

  const handlePrepareExportText = () => {
    const userMap = new Map<string, { numbers: string[], paid: boolean }[]>();
    tickets.forEach(ticket => {
      if (ticket.ownerName && (ticket.status === TicketStatus.RESERVED || ticket.status === TicketStatus.PAID)) {
        const userEntry = userMap.get(ticket.ownerName) || [];
        userEntry.push({
          numbers: [ticket.id],
          paid: ticket.status === TicketStatus.PAID
        });
        userMap.set(ticket.ownerName, userEntry);
      }
    });

    if (userMap.size === 0) {
      alert("No hay ventas registradas para exportar.");
      return;
    }

    let textContent = "🎟️ *ESTADO ACTUAL DE LA RIFA* 🎟️\n";
    textContent += "━━━━━━━━━━━━━━━━━━━━━━\n\n";
    const sortedNames = Array.from(userMap.keys()).sort((a, b) => a.localeCompare(b));
    sortedNames.forEach((name, index) => {
      const ticketsForUser = userMap.get(name)!;
      const allNumbers = ticketsForUser.flatMap(t => t.numbers).sort((a, b) => a.localeCompare(b));
      const totalTickets = ticketsForUser.length;
      const paidCount = ticketsForUser.filter(t => t.paid).length;
      const unpaidCount = totalTickets - paidCount;
      let statusText = unpaidCount === 0 ? "✨ *AL DÍA (Todo Pagado)*" : `⏳ *PENDIENTE (${unpaidCount} boleta${unpaidCount > 1 ? 's' : ''} por pagar)*`;
      textContent += `👤 *${name.toUpperCase()}*\n🔢 Números: ${allNumbers.join(' - ')}\n💰 Estado: ${statusText}\n`;
      if (index < sortedNames.length - 1) textContent += "----------------------\n\n";
    });
    textContent += "\n━━━━━━━━━━━━━━━━━━━━━━\n";
    textContent += `📊 *RESUMEN TOTAL:*\n✅ Vendidos: ${tickets.filter(t => t.status !== TicketStatus.AVAILABLE).length}/${TOTAL_NUMBERS}\n💵 Recaudado: $${financialStats.paid.toLocaleString()}\n━━━━━━━━━━━━━━━━━━━━━━`;
    setExportModal({ isOpen: true, content: textContent });
    setShowDbMenu(false);
  };

  const availableCount = tickets.filter(t => t.status === TicketStatus.AVAILABLE).length;
  const selectedCount = tickets.filter(t => t.status === TicketStatus.SELECTED).length;

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
                    <h1 className="text-xl font-black tracking-tight leading-none uppercase italic text-white">RifaMaster</h1>
                    <div className="flex items-center mt-1">
                      {isSaving ? (
                        <span className="flex items-center text-[10px] text-slate-500 font-medium"><RefreshCw size={10} className="mr-1 animate-spin" /> Sincronizando...</span>
                      ) : (
                        <span className="flex items-center text-[10px] text-emerald-400 font-bold uppercase tracking-widest"><CheckCircle size={10} className="mr-1" /> Datos Protegidos</span>
                      )}
                    </div>
                  </div>
               </div>
               
               <div className="flex items-center gap-2 sm:ml-6">
                  {/* Price Input Interface */}
                  <div className="flex items-center bg-slate-800 rounded-xl px-3 border border-slate-700 focus-within:border-emerald-500/50 transition-colors">
                    <DollarSign size={14} className="text-emerald-500 mr-1" />
                    <input 
                      type="number"
                      value={ticketPrice}
                      onChange={(e) => setTicketPrice(Math.max(0, parseInt(e.target.value) || 0))}
                      className="bg-transparent border-none outline-none w-20 py-2 text-xs font-black text-white"
                      placeholder="Valor"
                      title="Cambiar valor de boleta"
                    />
                  </div>

                  <button 
                    type="button"
                    onClick={handleEnterFullScreen}
                    className="p-2.5 text-emerald-400 hover:bg-emerald-500/10 bg-slate-800 rounded-xl transition-all active:scale-95"
                    title="Modo Tablero Completo"
                  >
                    <Maximize2 size={20} />
                  </button>
                  <div className="relative">
                    <button 
                      type="button"
                      onClick={() => setShowDbMenu(!showDbMenu)}
                      className="p-2.5 text-slate-400 hover:text-slate-100 bg-slate-800 rounded-xl transition-colors"
                    >
                      <Database size={20} />
                    </button>
                    {showDbMenu && (
                      <div className="absolute top-full right-0 mt-3 w-64 bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 z-50 overflow-hidden ring-1 ring-white/10">
                        <div className="p-2 space-y-1">
                           <button type="button" onClick={handlePrepareExportText} className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-emerald-400 hover:bg-emerald-950/30 rounded-xl font-bold transition-colors">
                              <FileText size={16} /> <span>Exportar Lista (Texto)</span>
                           </button>
                           <div className="h-px bg-slate-800 my-1 mx-2"></div>
                           <button type="button" onClick={handleDownloadBackup} className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition-colors">
                              <Download size={16} /> <span>Respaldar Datos (JSON)</span>
                           </button>
                           <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-slate-300 hover:bg-slate-800 rounded-xl transition-colors">
                              <Upload size={16} /> <span>Cargar Datos</span>
                           </button>
                           <div className="h-px bg-slate-800 my-1 mx-2"></div>
                           <button type="button" onClick={handleResetRaffle} className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-400 hover:bg-red-950/30 rounded-xl font-bold transition-colors">
                              <Trash size={16} /> <span>Reiniciar Rifa</span>
                           </button>
                        </div>
                      </div>
                    )}
                  </div>
               </div>
            </div>
          </div>
        </header>
      )}

      {!isFullScreen && (
        <section className="max-w-5xl mx-auto px-4 mt-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <span className="text-[10px] font-black uppercase text-emerald-500 tracking-wider">Recaudado:</span>
              <span className="text-[10px] font-black text-white italic">${financialStats.paid.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
              <span className="text-[10px] font-black uppercase text-amber-500 tracking-wider">Por Cobrar:</span>
              <span className="text-[10px] font-black text-white italic">${financialStats.pending.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 border border-slate-700 rounded-full">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Venta Total:</span>
              <span className="text-[10px] font-black text-white italic">${financialStats.total.toLocaleString()}</span>
              <span className="text-[9px] font-bold text-slate-600">({financialStats.count}/{TOTAL_NUMBERS})</span>
            </div>
          </div>
        </section>
      )}

      {exportModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl">
          <div className="bg-slate-900 rounded-[2.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.8)] border border-slate-800 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black uppercase italic tracking-tight text-white">Lista de Participantes</h3>
                <p className="text-xs text-slate-500 font-bold mt-1 uppercase tracking-widest">Detalle de pagos incluido</p>
              </div>
              <button type="button" onClick={() => setExportModal({ isOpen: false, content: '' })} className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded-full transition-all"><CloseIcon size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-8"><div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 font-mono text-emerald-400 text-sm leading-relaxed whitespace-pre-wrap select-all min-h-[200px]">{exportModal.content}</div></div>
            <div className="p-8 bg-slate-950/50 border-t border-slate-800 flex flex-col sm:flex-row gap-4">
              <button type="button" onClick={() => { navigator.clipboard.writeText(exportModal.content); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className={`flex-1 py-5 rounded-[1.5rem] font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all ${copied ? 'bg-emerald-500 text-slate-950' : 'bg-slate-100 text-slate-950 hover:bg-white'}`}>{copied ? <Check size={20} strokeWidth={3} /> : <Copy size={20} />}{copied ? '¡Copiado!' : 'Copiar Todo'}</button>
              <button type="button" onClick={() => setExportModal({ isOpen: false, content: '' })} className="flex-1 py-5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-[1.5rem] font-black uppercase tracking-widest text-sm">Cerrar Ventana</button>
            </div>
          </div>
        </div>
      )}

      {isFullScreen && (
        <div className="fixed top-0 left-0 right-0 p-2 z-50 flex justify-center pointer-events-none">
            <div className="bg-slate-900/40 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-800/50 flex gap-4">
                <span className="text-[8px] font-black uppercase text-emerald-400 tracking-[0.2em]">Disponibles: {availableCount}</span>
                {selectedCount > 0 && <span className="text-[8px] font-black uppercase text-red-400 tracking-[0.2em]">Seleccionados: {selectedCount}</span>}
            </div>
        </div>
      )}

      <main className={`${isFullScreen ? 'fixed inset-0 flex flex-col pt-8 pb-[140px] bg-slate-950' : 'max-w-5xl mx-auto px-4 py-8'}`}>
        {!isFullScreen && (
          <div className="flex space-x-8 border-b border-slate-800 mb-8">
            <button type="button" onClick={() => { setActiveTab('grid'); handleClearSelection(); }} className={`pb-4 px-2 text-sm font-black uppercase tracking-widest relative transition-all ${activeTab === 'grid' ? 'text-emerald-400' : 'text-slate-500'}`}>
              <div className="flex items-center gap-2.5"><LayoutGrid size={18} /><span>Tablero</span></div>
              {activeTab === 'grid' && <span className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500 rounded-t-full shadow-[0_0_10px_rgba(16,185,129,0.4)]"></span>}
            </button>
            <button type="button" onClick={() => { setActiveTab('users'); handleClearSelection(); }} className={`pb-4 px-2 text-sm font-black uppercase tracking-widest relative transition-all ${activeTab === 'users' ? 'text-emerald-400' : 'text-slate-500'}`}>
               <div className="flex items-center gap-2.5"><Users size={18} /><span>Participantes</span></div>
              {activeTab === 'users' && <span className="absolute bottom-0 left-0 w-full h-1 bg-emerald-500 rounded-t-full shadow-[0_0_10px_rgba(16,185,129,0.4)]"></span>}
            </button>
          </div>
        )}

        <div className={`flex-1 min-h-0 ${isFullScreen ? 'px-1' : ''}`}>
          {activeTab === 'grid' ? (
            <TicketGrid 
              ref={gridRef}
              tickets={tickets} 
              onToggleTicket={handleToggleTicket} 
              swappingTicketId={swappingTicketId} 
              isFullScreen={isFullScreen} 
              activeOwnerName={addingTicketsToUser}
            />
          ) : (
            <UserSummaryList 
              tickets={tickets} 
              ticketPrice={ticketPrice}
              onTogglePayment={handleTogglePayment}
              onRevokeTicket={handleRevokeTicket}
              onRevokeAllFromUser={handleRevokeAllFromUser}
              onEditTicket={handleStartSwap}
              onAddMoreTickets={handleStartAddingToUser}
            />
          )}
        </div>
      </main>

      {isFullScreen && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800 z-50 flex flex-col items-center gap-4">
           <div className="flex justify-between items-center w-full max-w-4xl px-2">
              <button type="button" onClick={handleCaptureBoard} disabled={isCapturing} className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-6 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 active:scale-95 transition-all shadow-lg disabled:opacity-50">{isCapturing ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}{isCapturing ? 'Capturando...' : 'Tomar Captura'}</button>
              <button type="button" onClick={() => { setIsFullScreen(false); setAddingTicketsToUser(null); }} className="bg-slate-800 hover:bg-slate-700 text-slate-400 px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-3 active:scale-95 transition-all shadow-lg border border-slate-700"><Minimize2 size={16} />SALIR</button>
           </div>
           <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-4xl px-2">
              <div className="flex-1 w-full sm:w-auto relative" ref={fsInputContainerRef}>
                 <div className="flex items-center gap-3">
                    <input 
                      type="text" 
                      placeholder="Nombre del Participante..." 
                      value={fullScreenName || (addingTicketsToUser || '')}
                      onChange={(e) => {
                          if (addingTicketsToUser) setAddingTicketsToUser(e.target.value);
                          else setFullScreenName(e.target.value);
                      }}
                      onFocus={() => setShowFsSuggestions(true)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-5 py-3 text-sm focus:ring-2 focus:ring-emerald-500/30 transition-all text-slate-100 placeholder-slate-600 font-bold italic"
                    />
                    {(selectedCount > 0 || addingTicketsToUser) && (
                      <div className="flex gap-2">
                        <button type="button" onClick={() => handleConfirmSale(addingTicketsToUser || fullScreenName, false)} disabled={!(addingTicketsToUser || fullScreenName).trim()} className="bg-slate-800 text-amber-500 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-20 transition-all whitespace-nowrap">Apartar</button>
                        <button type="button" onClick={() => handleConfirmSale(addingTicketsToUser || fullScreenName, true)} disabled={!(addingTicketsToUser || fullScreenName).trim()} className="bg-emerald-500 text-slate-950 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest disabled:opacity-20 transition-all flex items-center gap-2 whitespace-nowrap"><Check size={14} strokeWidth={4} /> Confirmar</button>
                      </div>
                    )}
                 </div>
                 {showFsSuggestions && (
                    <div className="absolute bottom-full left-0 w-full mb-3 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-y-auto max-h-48 z-[60]">
                       <div className="p-2">
                          <p className="px-3 py-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 mb-1">Participantes Registrados</p>
                          {fsSuggestions.length > 0 ? fsSuggestions.map((name, i) => (
                            <button key={i} type="button" onClick={() => { if(addingTicketsToUser) setAddingTicketsToUser(name); else setFullScreenName(name); setShowFsSuggestions(false); }} className="w-full text-left px-4 py-3 text-sm font-bold text-slate-200 hover:bg-emerald-500 hover:text-slate-950 rounded-xl transition-colors flex items-center gap-3"><UserIcon size={14} className="opacity-50" />{name}</button>
                          )) : <p className="px-4 py-3 text-xs text-slate-600 italic">Escribe para registrar uno nuevo</p>}
                       </div>
                    </div>
                 )}
              </div>
           </div>
        </div>
      )}

      {!swappingTicketId && !isFullScreen && (
        <SalesControl 
          selectedTickets={tickets.filter(t => t.status === TicketStatus.SELECTED)} 
          ticketPrice={ticketPrice}
          onConfirmSale={handleConfirmSale}
          onClearSelection={handleClearSelection}
          initialBuyerName={addingTicketsToUser || ''}
          hideInEditMode={!!addingTicketsToUser}
          existingNames={allTimeParticipants}
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
