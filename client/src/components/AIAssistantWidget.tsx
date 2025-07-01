'use client';

import { useState, useRef, useEffect } from 'react';
import Markdown from 'markdown-to-jsx';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const initialMessage: Message = {
  role: 'assistant',
  content: "Hi! I'm Zayra, your Retail Edge Assistant. How can I help you with this application?",
};

export default function AIAssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, open]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages: Message[] = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages.slice(-5) })
      });
      const data = await res.json();
      setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
    } catch (e) {
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="fixed bottom-8 right-8 z-50 font-sans" style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif' }}>
      {open ? (
        <div className="w-[380px] bg-gradient-to-br from-white via-[#f3f4fa] to-[#e9eafd] border border-[#d1d5fa] rounded-2xl shadow-2xl flex flex-col animate-fade-in max-h-[80vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#d1d5fa] bg-gradient-to-r from-[#2e3cff] via-[#6c38ff] to-[#a259ff] rounded-t-2xl shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md border-2 border-[#6c38ff] overflow-hidden">
                <img src="/zayra-logo.png" alt="Zayra Logo" className="w-full h-full object-contain" />
              </div>
              <div>
                <div className="font-bold text-white text-lg leading-tight tracking-wide drop-shadow-glow">Zayra</div>
                <div className="text-xs text-[#e0e0ff]">Retail Edge AI Assistant</div>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-[#e0e0ff] hover:text-white text-2xl font-bold">×</button>
          </div>
          {/* Chat Body */}
          <div className="flex-1 p-5 overflow-y-auto bg-gradient-to-br from-white via-[#f3f4fa] to-[#e9eafd]" style={{ maxHeight: '60vh' }}>
            {messages.map((m, i) => (
              <div key={i} className={`mb-4 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2e3cff] to-[#a259ff] flex items-center justify-center mr-2 shadow-md">
                    <span className="text-white font-bold">Z</span>
                  </div>
                )}
                <span className={`inline-block px-4 py-2 rounded-2xl shadow-lg text-base max-w-[75%] break-words whitespace-pre-wrap ${m.role === 'user' ? 'bg-gradient-to-r from-[#6c38ff] to-[#2e3cff] text-white rounded-br-none' : 'bg-white text-[#23234d] rounded-bl-none border border-[#d1d5fa]'}`}>
                  {m.role === 'assistant' ? <Markdown options={{ forceBlock: true }}>{m.content}</Markdown> : m.content}
                </span>
                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-[#e9eafd] flex items-center justify-center ml-2 shadow-md">
                    <span className="text-[#a259ff] font-bold">U</span>
                  </div>
                )}
              </div>
            ))}
            {loading && <div className="text-[#a259ff] text-sm pl-2 animate-pulse">Zayra is typing...</div>}
            <div ref={messagesEndRef} />
          </div>
          {/* Input */}
          <div className="flex items-center gap-2 p-4 border-t border-[#d1d5fa] bg-white rounded-b-2xl">
            <input
              className="flex-1 border border-[#d1d5fa] rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#6c38ff] text-base bg-[#f3f4fa] text-[#23234d] placeholder-[#a59cff]"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && sendMessage()}
              placeholder="Type your question..."
              maxLength={256}
              disabled={loading}
            />
            <button
              className="bg-gradient-to-r from-[#6c38ff] to-[#2e3cff] hover:from-[#a259ff] hover:to-[#6c38ff] text-white rounded-xl px-5 py-2 font-semibold shadow-lg disabled:opacity-50 transition"
              onClick={sendMessage}
              disabled={loading || !input.trim()}
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <button
          className="bg-white rounded-full shadow-2xl p-0 flex items-center justify-center border-4 border-[#a259ff] w-16 h-16 group transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#6c38ff] hover:border-[#2e3cff]"
          onClick={() => setOpen(true)}
          title="Open Zayra Assistant"
        >
          <span className="flex items-center justify-center w-full h-full">
            {/* Futuristic sparkle/star icon */}
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="18" cy="18" r="16" fill="url(#zayraBtnBg)" />
              <g filter="url(#glow)">
                <path d="M18 8 L20 16 L28 18 L20 20 L18 28 L16 20 L8 18 L16 16 Z" fill="url(#zayraBtnStar)" />
              </g>
              <defs>
                <radialGradient id="zayraBtnBg" cx="0.5" cy="0.5" r="0.5" fx="0.5" fy="0.5" gradientTransform="matrix(36 0 0 36 0 0)" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#fff" />
                  <stop offset="1" stopColor="#e9eafd" />
                </radialGradient>
                <linearGradient id="zayraBtnStar" x1="8" y1="8" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#2e3cff" stopOpacity="0.95" />
                  <stop offset="1" stopColor="#a259ff" stopOpacity="0.8" />
                </linearGradient>
                <filter id="glow" x="0" y="0" width="36" height="36" filterUnits="userSpaceOnUse">
                  <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
            </svg>
          </span>
        </button>
      )}
    </div>
  );
}

function formatAssistantMessage(message: string) {
  // Implement your formatting logic here
  return message;
}
