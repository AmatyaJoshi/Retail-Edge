import React, { useEffect, useRef, useState } from "react";
import { BrowserMultiFormatReader } from "@zxing/browser";

interface BarcodeScannerProps {
  onDetected: (barcode: string) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onDetected, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    if (!scanning) return;
    const codeReader = new BrowserMultiFormatReader();
    let active = true;
    codeReader.decodeFromVideoDevice(undefined, videoRef.current!, (result) => {
      if (result && active) {
        onDetected(result.getText());
        active = false;
        setScanning(false);
        setTimeout(onClose, 400); // allow a short delay for feedback
      }
    });
    return () => {
      active = false;
    };
  }, [onDetected, onClose, scanning]);

  const handleRescan = () => setScanning(true);

  return (
    <div className="fixed inset-0 w-screen h-screen bg-black/80 backdrop-blur-md flex items-center justify-center z-[1000]">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-10 w-[650px] max-w-[98vw] relative flex flex-col items-center animate-fadeIn border-2 border-gray-200 dark:border-gray-600">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 bg-gray-100 dark:bg-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-full w-10 h-10 flex items-center justify-center text-lg cursor-pointer text-gray-500 dark:text-gray-400 shadow-lg hover:bg-gray-200 dark:hover:bg-gray-600 hover:scale-110 transition-all duration-200"
          aria-label="Close"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M6 6l8 8M6 14L14 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>
        
        <div className="mb-4 flex flex-col items-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-blue-600 dark:text-blue-400">
              <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M7 12h10M12 7v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <h2 className="m-0 font-bold text-2xl text-gray-900 dark:text-gray-100">Scan a Barcode</h2>
        </div>
        
        <p className="m-0 mb-6 text-gray-600 dark:text-gray-300 text-base text-center max-w-md">
          Align the barcode within the frame below. Scanning will happen automatically.
        </p>
        
        <div className={`w-full max-w-[540px] aspect-video rounded-2xl overflow-hidden border-4 mb-8 shadow-2xl relative bg-gray-900 ${
          scanning ? 'border-blue-500 shadow-blue-500/20' : 'border-green-500 shadow-green-500/20'
        }`}>
          <video
            ref={videoRef}
            className="w-full h-full object-cover bg-gray-900"
            autoPlay
            muted
            playsInline
          />
          {!scanning && (
            <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm flex items-center justify-center text-green-600 dark:text-green-400 font-bold text-2xl">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg border-2 border-green-200 dark:border-green-700">
                ✓ Barcode Detected
              </div>
            </div>
          )}
        </div>
        
        <div className="w-full flex flex-col gap-3 mt-2">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white border-none rounded-xl py-4 text-lg font-bold cursor-pointer shadow-lg flex items-center justify-center gap-3 transition-all duration-200 transform hover:scale-105"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M6 10h8M10 6l-4 4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Cancel
          </button>
          
          {!scanning && (
            <button
              onClick={handleRescan}
              className="w-full bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-500 rounded-xl py-4 text-lg font-bold cursor-pointer shadow-lg flex items-center justify-center gap-3 transition-all duration-200 transform hover:scale-105 hover:bg-blue-50 dark:hover:bg-gray-600"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Rescan
            </button>
          )}
        </div>
        
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95) translateY(-10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out;
          }
        `}</style>
      </div>
    </div>
  );
};

export default BarcodeScanner;
