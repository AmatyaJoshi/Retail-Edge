'use client';

import { useEffect, useState } from 'react';

interface BarcodeReaderProps {
  onBarcodeDetected: (barcode: string) => void;
  isActive?: boolean;
}

/**
 * A component that listens for barcode scanner input
 * 
 * Many barcode scanners function as keyboard emulators,
 * sending keypresses in rapid succession followed by an Enter key.
 * This component detects this pattern and triggers a callback.
 */
export default function BarcodeReader({ onBarcodeDetected, isActive = true }: BarcodeReaderProps) {
  const [buffer, setBuffer] = useState<string>('');
  const [lastKeyTime, setLastKeyTime] = useState<number>(0);
  
  // Configuration
  const scannerDelayMs = 20; // Maximum time between characters from scanner (milliseconds)
  const minBarcodeLength = 5; // Minimum valid barcode length
  
  useEffect(() => {
    if (!isActive) return;
    
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input element
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }
      
      const currentTime = new Date().getTime();
      
      // Check if this is likely scanner input (very fast typing)
      const isLikelyScanner = currentTime - lastKeyTime < scannerDelayMs;
      
      // If Enter key is pressed and we have a buffer
      if (event.key === 'Enter' && buffer) {
        // Only process if buffer meets minimum length and likely from scanner
        if (buffer.length >= minBarcodeLength && isLikelyScanner) {
          onBarcodeDetected(buffer);
          event.preventDefault();
        }
        
        // Reset the buffer
        setBuffer('');
        return;
      }
      
      // For non-Enter keys, add to buffer if alphanumeric or special character
      if (event.key.length === 1 || event.key === '-' || event.key === '_') {
        setBuffer(prev => prev + event.key);
        setLastKeyTime(currentTime);
      }
    };
    
    // Add listener
    window.addEventListener('keydown', handleKeyDown);
    
    // Clean up
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [buffer, lastKeyTime, isActive, onBarcodeDetected]);
  
  // This component doesn't render anything visible
  return null;
}