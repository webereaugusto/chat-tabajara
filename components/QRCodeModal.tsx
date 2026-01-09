
import React, { useState, useEffect } from 'react';

interface QRCodeModalProps {
  onConnected: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ onConnected }) => {
  const [progress, setProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    // Simula o tempo que o usuário levaria para abrir o celular e escanear
    const startScanningTimeout = setTimeout(() => {
      setIsScanning(true);
    }, 2500);

    return () => clearTimeout(startScanningTimeout);
  }, []);

  useEffect(() => {
    if (!isScanning) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + 1.2;
        if (next >= 100) {
          clearInterval(interval);
          // Delay extra antes de chamar onConnected para feedback visual de conclusão
          setTimeout(() => {
            onConnected();
          }, 1200);
          return 100;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isScanning, onConnected]);

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-md w-full p-10 text-center animate-in fade-in zoom-in duration-500">
        <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 bg-green-500 rounded-3xl rotate-12 flex items-center justify-center text-white text-4xl shadow-xl shadow-green-500/20">
                <i className="fab fa-whatsapp -rotate-12"></i>
            </div>
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-3 tracking-tight">Conectar WhatsApp</h2>
        <p className="text-slate-500 mb-10 leading-relaxed px-4">Aponte a câmera do seu WhatsApp para o código abaixo para sincronizar seus contatos.</p>
        
        <div className="relative inline-block p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] mb-10">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=crm-whatsapp-auth-token-${Date.now()}`} 
              alt="QR Code"
              className={`w-56 h-56 transition-all duration-700 ${isScanning ? 'opacity-20 blur-sm scale-95' : 'opacity-100'}`}
            />
            
            {isScanning && (
                <div className="absolute inset-0 flex items-center justify-center flex-col p-8">
                    <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className="h-full bg-green-500 transition-all duration-300 ease-out shadow-[0_0_15px_rgba(34,197,94,0.6)]" 
                          style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="mt-6 flex flex-col items-center gap-2">
                        <i className="fas fa-sync-alt fa-spin text-green-600"></i>
                        <span className="text-sm font-bold text-slate-700 uppercase tracking-widest">Sincronizando {Math.round(progress)}%</span>
                        <span className="text-xs text-slate-400">Importando conversas recentes...</span>
                    </div>
                </div>
            )}
        </div>

        <div className="grid grid-cols-1 gap-4 text-left">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-slate-400 font-bold shrink-0">1</div>
                <p className="text-sm font-medium text-slate-600">Abra o <span className="text-slate-900 font-bold">WhatsApp</span> no seu celular</p>
            </div>
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-slate-400 font-bold shrink-0">2</div>
                <p className="text-sm font-medium text-slate-600">Toque em <span className="text-slate-900 font-bold">Aparelhos Conectados</span> e escaneie</p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
