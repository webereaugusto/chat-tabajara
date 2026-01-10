import React, { useState, useEffect } from 'react';

interface QRCodeModalProps {
  onConnected: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ onConnected }) => {
  const [progress, setProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [qrKey, setQrKey] = useState(Date.now());

  const handleStartScan = () => {
    setIsScanning(true);
  };

  useEffect(() => {
    if (!isScanning) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1.5;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(onConnected, 1000);
          return 100;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isScanning, onConnected]);

  return (
    <div className="fixed inset-0 bg-slate-950 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[3rem] shadow-2xl max-w-lg w-full p-12 text-center animate-in fade-in zoom-in duration-700">
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-green-500 rounded-[2rem] rotate-12 flex items-center justify-center text-white text-5xl shadow-2xl shadow-green-500/20">
            <i className="fab fa-whatsapp -rotate-12"></i>
          </div>
        </div>
        
        <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Zappy CRM</h2>
        <p className="text-slate-500 mb-10 text-lg leading-relaxed">
          Conecte sua instância do WhatsApp para começar a gerenciar seus leads com IA.
        </p>
        
        <div className="relative group cursor-pointer inline-block p-8 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3rem] mb-10 transition-all hover:border-green-400" onClick={!isScanning ? handleStartScan : undefined}>
          <img 
            src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=zappy-auth-${qrKey}`} 
            alt="QR Code"
            className={`w-64 h-64 transition-all duration-700 rounded-2xl ${isScanning ? 'opacity-10 blur-md scale-90' : 'opacity-100'}`}
          />
          
          {!isScanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-green-600 text-white px-6 py-3 rounded-full font-bold shadow-xl animate-bounce">
                Clique para Conectar
              </div>
            </div>
          )}

          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center flex-col p-10">
              <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden shadow-inner mb-6">
                <div 
                  className="h-full bg-green-500 transition-all duration-300 ease-out" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex flex-col items-center gap-3">
                <i className="fas fa-circle-notch fa-spin text-green-600 text-2xl"></i>
                <span className="text-lg font-black text-slate-800 tracking-widest uppercase">Sincronizando...</span>
                <span className="text-slate-400 font-medium">{Math.round(progress)}% Concluído</span>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-5 bg-slate-50 p-5 rounded-3xl border border-slate-100 text-left">
            <div className="w-12 h-12 bg-white shadow-md rounded-2xl flex items-center justify-center text-green-600 font-black text-xl shrink-0">1</div>
            <p className="text-slate-600 font-medium">Abra o <span className="text-slate-900 font-bold">WhatsApp</span> no seu celular</p>
          </div>
          <div className="flex items-center gap-5 bg-slate-50 p-5 rounded-3xl border border-slate-100 text-left">
            <div className="w-12 h-12 bg-white shadow-md rounded-2xl flex items-center justify-center text-green-600 font-black text-xl shrink-0">2</div>
            <p className="text-slate-600 font-medium">Vá em <span className="text-slate-900 font-bold">Aparelhos Conectados</span> e escaneie o código</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;