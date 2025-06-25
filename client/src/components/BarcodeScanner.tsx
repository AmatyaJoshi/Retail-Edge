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
    <div style={{
      position: "fixed",
      inset: 0,
      inlineSize: "100vw",
      blockSize: "100vh",
      background: "rgba(0,0,0,0.7)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 18,
        boxShadow: "0 6px 32px rgba(0,0,0,0.18)",
        padding: 36,
        inlineSize: 600,
        maxInlineSize: "98vw",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        animation: "fadeIn 0.3s"
      }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            insetBlockStart: 14,
            insetInlineEnd: 14,
            background: "#f5f5f5",
            border: "none",
            borderRadius: "50%",
            inlineSize: 36,
            blockSize: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
            cursor: "pointer",
            color: "#888",
            boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
            transition: "background 0.2s"
          }}
          aria-label="Close"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M6 6l8 8M6 14L14 6" stroke="#888" strokeWidth="2" strokeLinecap="round"/></svg>
        </button>
        <div style={{ margin: "0 0 12px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <svg width="38" height="38" viewBox="0 0 24 24" fill="none" style={{ marginBlockEnd: 4 }}>
            <rect x="2" y="2" width="20" height="20" rx="5" stroke="#1976d2" strokeWidth="2" fill="#e3f0fc" />
            <path d="M7 12h10M12 7v10" stroke="#1976d2" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <h2 style={{ margin: 0, fontWeight: 700, fontSize: 22, color: "#222" }}>Scan a Barcode</h2>
        </div>
        <p style={{ margin: "0 0 18px 0", color: "#555", fontSize: 15, textAlign: "center" }}>
          Align the barcode within the frame below. Scanning will happen automatically.
        </p>
        <div style={{
          inlineSize: "100%",
          maxInlineSize: 520,
          aspectRatio: "16/9",
          borderRadius: 16,
          overflow: "hidden",
          border: scanning ? "2.5px solid #1976d2" : "2.5px solid #43a047",
          marginBlockEnd: 28,
          boxShadow: scanning ? "0 2px 8px rgba(25,118,210,0.10)" : "0 2px 8px rgba(67,160,71,0.10)",
          position: "relative",
          background: "#222"
        }}>
          <video
            ref={videoRef}
            style={{ inlineSize: "100%", blockSize: "100%", objectFit: "cover", background: "#222" }}
            autoPlay
            muted
            playsInline
          />
          {!scanning && (
            <div style={{
              position: "absolute",
              inset: 0,
              background: "rgba(67,160,71,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#43a047",
              fontWeight: 600,
              fontSize: 20
            }}>
              ✓ Barcode Detected
            </div>
          )}
        </div>
        <div style={{ inlineSize: "100%", display: "flex", flexDirection: "column", gap: 10, marginBlockStart: 8 }}>
          <button
            onClick={onClose}
            style={{
              inlineSize: "100%",
              background: "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px 0",
              fontSize: 17,
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 1px 4px rgba(25,118,210,0.10)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "background 0.2s"
            }}
            onMouseOver={e => (e.currentTarget.style.background = '#1456a0')}
            onMouseOut={e => (e.currentTarget.style.background = '#1976d2')}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M6 10h8M10 6l-4 4 4 4" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Cancel
          </button>
          {!scanning && (
            <button
              onClick={handleRescan}
              style={{
                inlineSize: "100%",
                background: "#fff",
                color: "#1976d2",
                border: "2px solid #1976d2",
                borderRadius: 8,
                padding: "12px 0",
                fontSize: 17,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 1px 4px rgba(25,118,210,0.07)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                transition: "background 0.2s, color 0.2s, border 0.2s"
              }}
              onMouseOver={e => (e.currentTarget.style.background = '#e3f0fc')}
              onMouseOut={e => (e.currentTarget.style.background = '#fff')}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 4v12M4 10h12" stroke="#1976d2" strokeWidth="2" strokeLinecap="round"/></svg>
              Rescan
            </button>
          )}
        </div>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.98); }
            to { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default BarcodeScanner;
