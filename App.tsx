
import React, { useState, useEffect, useRef, useMemo } from 'react';
import QRCodeModal from './components/QRCodeModal.js';
import { generateLeadResponse } from './services/geminiService.js';

const INITIAL_CONTACTS = [
  { id: '1', name: 'João Silva', lastMessage: 'Gostaria de saber o preço...', avatar: 'https://picsum.photos/seed/joao/100', status: 'lead', unread: 2 },
  { id: '2', name: 'Maria Oliveira', lastMessage: 'Obrigada pelo retorno!', avatar: 'https://picsum.photos/seed/maria/100', status: 'customer' },
  { id: '3', name: 'Tech Solutions', lastMessage: 'Proposta enviada.', avatar: 'https://picsum.photos/seed/tech/100', status: 'lead' },
  { id: '4', name: 'Carlos Santos', lastMessage: 'Vou pensar e te aviso.', avatar: 'https://picsum.photos/seed/carlos/100', status: 'closed' },
];

const MOCK_MESSAGES = {
  '1': [
    { id: 'm1', sender: 'contact', text: 'Olá, vi seu anúncio no Instagram.', timestamp: new Date(Date.now() - 3600000) },
    { id: 'm2', sender: 'contact', text: 'Gostaria de saber o preço do plano premium.', timestamp: new Date(Date.now() - 3500000) },
  ],
  '2': [
    { id: 'm3', sender: 'user', text: 'Seu pedido foi enviado!', timestamp: new Date(Date.now() - 86400000) },
    { id: 'm4', sender: 'contact', text: 'Obrigada pelo retorno!', timestamp: new Date(Date.now() - 82400000) },
  ]
};

const App = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [contacts, setContacts] = useState(INITIAL_CONTACTS);
  const [activeContactId, setActiveContactId] = useState(null);
  const [messages, setMessages] = useState(MOCK_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const chatEndRef = useRef(null);

  const activeContact = useMemo(() => {
    if (!activeContactId) return null;
    return contacts.find(c => c.id === activeContactId) || null;
  }, [contacts, activeContactId]);
  
  const filteredContacts = useMemo(() => {
    const query = (searchQuery || '').toLowerCase();
    return contacts.filter(c => (c.name || '').toLowerCase().includes(query));
  }, [contacts, searchQuery]);

  useEffect(() => {
    if (activeContactId && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeContactId]);

  const handleSendMessage = (e) => {
    e?.preventDefault();
    if (!inputText.trim() || !activeContactId) return;

    const newMessage = {
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
    
    const contactMessages = messages[activeContactId] || [];
    const history = contactMessages
      .map(m => `${m.sender === 'user' ? 'Eu' : activeContact.name}: ${m.text}`)
      .join('\n');
    
    try {
      const suggestion = await generateLeadResponse(history, activeContact.name);
      setInputText(suggestion || '');
    } catch (err) {
      console.error("Erro na sugestão:", err);
    } finally {
      setIsAIThinking(false);
    }
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
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      <aside className="w-80 md:w-96 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 relative">
        <header className="p-4 bg-white flex items-center justify-between border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-600 flex items-center justify-center text-white shadow-lg">
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
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                <button 
                  onClick={handleResetConnection}
                  className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                >
                  <i className="fas fa-sync-alt"></i> Reiniciar Zap
                </button>
              </div>
            )}
          </div>
        </header>
        <div className="p-4">
          <input 
            type="text" 
            placeholder="Buscar..." 
            className="w-full px-4 py-2 bg-slate-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-green-500/20" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          {filteredContacts.map(contact => (
            <div 
              key={contact.id} 
              onClick={() => setActiveContactId(contact.id)} 
              className={`p-4 flex items-center gap-4 cursor-pointer border-b border-slate-50 transition-colors ${activeContactId === contact.id ? 'bg-green-50 border-l-4 border-l-green-600' : 'hover:bg-slate-50'}`}
            >
              <img src={contact.avatar} alt="" className="w-12 h-12 rounded-full bg-slate-200" />
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold truncate text-sm text-slate-800">{String(contact.name || 'Sem Nome')}</h3>
                  <span className="text-[10px] uppercase text-slate-400 font-bold ml-2">{String(contact.status || 'lead')}</span>
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">{String(contact.lastMessage || '')}</p>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col bg-white">
        {activeContact ? (
          <>
            <header className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={activeContact.avatar} alt="" className="w-10 h-10 rounded-full bg-slate-200" />
                <h2 className="font-bold text-slate-800">{String(activeContact.name)}</h2>
              </div>
            </header>
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
              {(messages[activeContact.id] || []).map((msg) => (
                <div key={msg.id} className={`flex mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-2xl text-sm shadow-sm max-w-[80%] ${msg.sender === 'user' ? 'bg-green-600 text-white rounded-tr-none' : 'bg-white text-slate-700 rounded-tl-none border border-slate-100'}`}>
                    {String(msg.text)}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <footer className="p-4 border-t border-slate-200 bg-white">
              <div className="flex gap-2 mb-3">
                <button 
                  onClick={handleSuggestResponse} 
                  disabled={isAIThinking}
                  className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-indigo-700 disabled:opacity-50 transition-all"
                >
                  <i className={isAIThinking ? "fas fa-spinner fa-spin" : "fas fa-magic"}></i>
                  IA Suggest
                </button>
              </div>
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input 
                  className="flex-1 bg-slate-100 p-3 rounded-xl outline-none text-sm focus:bg-slate-200 transition-colors" 
                  value={inputText} 
                  onChange={e => setInputText(e.target.value)} 
                  placeholder="Escreva uma mensagem..." 
                />
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white w-12 h-12 rounded-xl transition-all active:scale-95 shadow-lg shadow-green-100 flex items-center justify-center">
                  <i className="fas fa-paper-plane"></i>
                </button>
              </form>
            </footer>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-3xl text-slate-300 border border-slate-100">
              <i className="fab fa-whatsapp"></i>
            </div>
            <p className="font-medium">Selecione um contato para gerenciar</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
