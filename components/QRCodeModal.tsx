
import React, { useState, useEffect } from 'react';

interface QRCodeModalProps {
  onConnected: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = ({ onConnected }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onConnected, 800);
          return 100;
        }
        return prev + 5;
      });
    }, 150);
    return () => clearInterval(interval);
  }, [onConnected]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 text-center animate-in fade-in zoom-in duration-300">
        <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-3xl">
                <i className="fab fa-whatsapp"></i>
            </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Conectar WhatsApp</h2>
        <p className="text-slate-500 mb-8">Abra o WhatsApp no seu celular, toque em Aparelhos Conectados e escaneie o código.</p>
        
        <div className="relative inline-block p-4 bg-white border-4 border-slate-100 rounded-xl mb-8">
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=crm-whatsapp-mock-session-${Date.now()}`} 
              alt="QR Code"
              className="w-48 h-48"
            />
            {progress > 0 && progress < 100 && (
                <div className="absolute inset-0 bg-white/80 flex items-center justify-center flex-col">
                    <div className="w-3/4 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 transition-all duration-300" 
                          style={{ width: `${progress}%` }}
                        />
                    </div>
                    <span className="mt-2 text-xs font-medium text-slate-600">Sincronizando...</span>
                </div>
            )}
        </div>

        <div className="flex flex-col gap-3 text-left bg-slate-50 p-4 rounded-xl">
            <div className="flex items-start gap-3 text-sm text-slate-600">
                <span className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                <span>Toque em Menu ou Configurações e selecione Aparelhos Conectados.</span>
            </div>
            <div className="flex items-start gap-3 text-sm text-slate-600">
                <span className="w-5 h-5 bg-slate-200 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                <span>Aponte seu celular para esta tela para capturar o código.</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;
