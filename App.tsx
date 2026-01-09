
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Contact, Message } from './types';
import QRCodeModal from './components/QRCodeModal';
import { generateLeadResponse } from './services/geminiService';

const INITIAL_CONTACTS: Contact[] = [
  { id: '1', name: 'João Silva', lastMessage: 'Gostaria de saber o preço...', avatar: 'https://picsum.photos/seed/joao/100', status: 'lead', unread: 2 },
  { id: '2', name: 'Maria Oliveira', lastMessage: 'Obrigada pelo retorno!', avatar: 'https://picsum.photos/seed/maria/100', status: 'customer' },
  { id: '3', name: 'Tech Solutions', lastMessage: 'Proposta enviada.', avatar: 'https://picsum.photos/seed/tech/100', status: 'lead' },
  { id: '4', name: 'Carlos Santos', lastMessage: 'Vou pensar e te aviso.', avatar: 'https://picsum.photos/seed/carlos/100', status: 'closed' },
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  '1': [
    { id: 'm1', sender: 'contact', text: 'Olá, vi seu anúncio no Instagram.', timestamp: new Date(Date.now() - 3600000) },
    { id: 'm2', sender: 'contact', text: 'Gostaria de saber o preço do plano premium.', timestamp: new Date(Date.now() - 3500000) },
  ],
  '2': [
    { id: 'm3', sender: 'user', text: 'Seu pedido foi enviado!', timestamp: new Date(Date.now() - 86400000) },
    { id: 'm4', sender: 'contact', text: 'Obrigada pelo retorno!', timestamp: new Date(Date.now() - 82400000) },
  ]
};

const App: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>(INITIAL_CONTACTS);
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  const activeContact = contacts.find(c => c.id === activeContactId);
  
  const filteredContacts = useMemo(() => {
    return contacts.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [contacts, searchQuery]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeContactId]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || !activeContactId) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputText,
      timestamp: new Date(),
    };

    setMessages(prev => ({
      ...prev,
      [activeContactId]: [...(prev[activeContactId] || []), newMessage]
    }));
    
    setContacts(prev => prev.map(c => 
      c.id === activeContactId ? { ...c, lastMessage: inputText } : c
    ));

    setInputText('');
  };

  const handleSuggestResponse = async () => {
    if (!activeContactId || !activeContact) return;
    setIsAIThinking(true);
    
    const history = (messages[activeContactId] || [])
      .map(m => `${m.sender === 'user' ? 'Eu' : activeContact.name}: ${m.text}`)
      .join('\n');
    
    const suggestion = await generateLeadResponse(history, activeContact.name);
    setInputText(suggestion || '');
    setIsAIThinking(false);
  };

  const updateStatus = (id: string, status: Contact['status']) => {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, status } : c));
  };

  const handleResetConnection = () => {
    setIsConnected(false);
    setActiveContactId(null);
    setShowSettings(false);
  };

  if (!isConnected) {
    return <QRCodeModal onConnected={() => setIsConnected(true)} />;
  }

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-80 md:w-96 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 relative">
        <header className="p-4 bg-white flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center text-white shadow-lg shadow-green-200">
              <i className="fab fa-whatsapp text-lg"></i>
            </div>
            <h1 className="font-bold text-slate-800 text-lg">Zappy CRM</h1>
          </div>
          <div className="relative">
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${showSettings ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}
            >
              <i className="fas fa-cog"></i>
            </button>
            
            {showSettings && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-2 border-b border-slate-50">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Instância</p>
                  <p className="text-xs text-green-600 font-medium flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                    Conectado
                  </p>
                </div>
                <button 
                  onClick={handleResetConnection}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                >
                  <i className="fas fa-sync-alt"></i>
                  Reiniciar Conexão (QR)
                </button>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-full text-left px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                >
                  <i className="fas fa-times"></i>
                  Fechar
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="p-4 bg-white border-b border-slate-100">
          <div className="relative">
            <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
            <input 
              type="text" 
              placeholder="Buscar contatos..." 
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {filteredContacts.map(contact => (
            <div 
              key={contact.id}
              onClick={() => setActiveContactId(contact.id)}
              className={`p-4 flex items-center gap-4 cursor-pointer transition-all border-b border-slate-50 hover:bg-slate-50 ${activeContactId === contact.id ? 'bg-green-50/50 hover:bg-green-50/50 border-l-4 border-l-green-600' : 'border-l-4 border-l-transparent'}`}
            >
              <div className="relative">
                <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${contact.status === 'closed' ? 'bg-slate-400' : 'bg-green-500'}`}></div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  <h3 className="font-semibold text-slate-800 truncate">{contact.name}</h3>
                  <span className="text-[9px] text-slate-400 uppercase font-black tracking-tighter">
                    {contact.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">{contact.lastMessage}</p>
              </div>
              {contact.unread && contact.unread > 0 && activeContactId !== contact.id && (
                <span className="w-5 h-5 bg-green-600 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-lg shadow-green-100">
                  {contact.unread}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* User Info Bottom */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
            <img src="https://ui-avatars.com/api/?name=Admin&background=0D8ABC&color=fff" alt="User" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-700 truncate">Administrador CRM</p>
            <p className="text-[10px] text-slate-500 truncate">Sessão Ativa</p>
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col bg-white h-full relative">
        {activeContact ? (
          <>
            <header className="px-6 py-4 bg-white border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <img src={activeContact.avatar} alt={activeContact.name} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <h2 className="font-bold text-slate-800 leading-tight">{activeContact.name}</h2>
                  <div className="flex gap-1.5 mt-1">
                    {['lead', 'customer', 'closed'].map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(activeContact.id, s as Contact['status'])}
                        className={`text-[9px] px-2 py-0.5 rounded-full border transition-all font-bold uppercase ${activeContact.status === s ? 'bg-slate-800 text-white border-slate-800' : 'text-slate-400 border-slate-100 hover:border-slate-300'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                 <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors border border-slate-100">
                    <i className="fas fa-phone-alt text-sm"></i>
                 </button>
                 <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors border border-slate-100">
                    <i className="fas fa-video text-sm"></i>
                 </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 flex flex-col gap-4">
              <div className="flex justify-center my-4">
                <span className="px-3 py-1 bg-white/80 backdrop-blur-sm border border-slate-100 rounded-full text-[10px] text-slate-400 font-bold uppercase tracking-widest">Início da Conversa</span>
              </div>
              {messages[activeContact.id]?.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[75%] p-3 rounded-2xl text-sm shadow-sm ${msg.sender === 'user' ? 'bg-green-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'}`}>
                    {msg.text}
                    <div className={`text-[10px] mt-1 flex items-center gap-1 ${msg.sender === 'user' ? 'text-green-200 justify-end' : 'text-slate-400'}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      {msg.sender === 'user' && <i className="fas fa-check-double text-[8px]"></i>}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <footer className="p-4 bg-white border-t border-slate-200 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
              <div className="max-w-4xl mx-auto">
                <div className="flex gap-2 mb-3">
                  <button 
                    onClick={handleSuggestResponse}
                    disabled={isAIThinking}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 disabled:shadow-none"
                  >
                    <i className={`fas ${isAIThinking ? 'fa-spinner fa-spin' : 'fa-wand-magic-sparkles'}`}></i>
                    {isAIThinking ? 'IA Analisando...' : 'Copilot IA'}
                  </button>
                  <button className="flex items-center gap-2 bg-slate-100 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all">
                    <i className="fas fa-bolt"></i>
                    Respostas Rápidas
                  </button>
                </div>
                <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
                  <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-green-500 transition-all">
                    <textarea 
                      placeholder="Responda ao cliente..."
                      rows={1}
                      className="w-full px-3 py-1 bg-transparent border-none outline-none resize-none text-sm min-h-[40px] max-h-32"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                    <div className="flex justify-between items-center px-2 pt-1">
                       <div className="flex gap-3 text-slate-400 text-sm">
                          <i className="fas fa-paperclip cursor-pointer hover:text-slate-600"></i>
                          <i className="fas fa-smile cursor-pointer hover:text-slate-600"></i>
                          <i className="fas fa-microphone cursor-pointer hover:text-slate-600"></i>
                       </div>
                       <span className="text-[10px] text-slate-300 font-medium">Shift + Enter para nova linha</span>
                    </div>
                  </div>
                  <button 
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white w-12 h-12 flex items-center justify-center rounded-2xl shadow-lg shadow-green-100 transition-all active:scale-95"
                  >
                    <i className="fas fa-paper-plane"></i>
                  </button>
                </form>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center bg-slate-50">
            <div className="w-24 h-24 bg-white shadow-xl rounded-3xl flex items-center justify-center text-4xl mb-6 border border-slate-100">
              <i className="fab fa-whatsapp text-green-500"></i>
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Pronto para vender?</h2>
            <p className="max-w-xs text-sm text-slate-500">Selecione um cliente ao lado para começar o atendimento sincronizado via WhatsApp.</p>
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-xl font-bold text-slate-800">12</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Leads Hoje</p>
              </div>
              <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <p className="text-xl font-bold text-slate-800">84%</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Conversão</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
