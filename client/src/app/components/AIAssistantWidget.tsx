'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Markdown from 'markdown-to-jsx';
import { useAIAssistant } from '../contexts/AIAssistantContext';
import { usePageData } from '../contexts/PageDataContext';
import { useUser } from '@clerk/nextjs';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const initialMessage: Message = {
  role: 'assistant',
  content: "Hi! I'm Zayra, your Retail Edge Assistant. How can I help you with this application?",
};

interface Position {
  x: number;
  y: number;
}

interface ChatBoxPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function AIAssistantWidget() {
  const { user, isLoaded } = useUser();
  const { isOpen, openAssistant, closeAssistant } = useAIAssistant();
  const { answerDataQuery } = usePageData();
  const [open, setOpen] = useState(isOpen);
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [showIndicator, setShowIndicator] = useState(false);
  const [isTranslucent, setIsTranslucent] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);

  // Draggable state - start at bottom-right corner
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const widgetRef = useRef<HTMLDivElement>(null);
  const chatBoxRef = useRef<HTMLDivElement>(null);

  // Drag handlers
  const dragStartPos = useRef({ x: 0, y: 0 });
  const [justDragged, setJustDragged] = useState(false);

  // Intro bubble logic
  const [showIntro, setShowIntro] = useState(true);

  // Activity tracking for auto-hide
  const lastActivityRef = useRef<number>(Date.now());
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const indicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const translucentTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);


  // Chat box dimensions
  const CHAT_BOX_WIDTH = 380;
  const CHAT_BOX_HEIGHT = 600;
  const WIDGET_SIZE = 64;
  const MARGIN = 24;

  // Set client-side flag and initialize position to bottom-right
  useEffect(() => {
    setIsClient(true);
    
    if (typeof window === 'undefined') return;
    
      const { innerWidth, innerHeight } = window;
    setPosition({
      x: innerWidth - WIDGET_SIZE - MARGIN,
      y: innerHeight - WIDGET_SIZE - MARGIN,
    });
  }, []);

  // Hide intro when widget is opened or after timeout
  useEffect(() => {
    if (open && showIntro) {
      setShowIntro(false);
    } else if (showIntro) {
      // Auto-hide intro bubble after 10 seconds
      const introTimeout = setTimeout(() => {
        setShowIntro(false);
      }, 10000);
      
      return () => clearTimeout(introTimeout);
    }
  }, [open, showIntro]);

  // Activity tracking for translucent behavior
  const handleActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    
    // Clear existing timeouts
    if (translucentTimeoutRef.current) {
      clearTimeout(translucentTimeoutRef.current);
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    if (indicatorTimeoutRef.current) {
      clearTimeout(indicatorTimeoutRef.current);
    }

    // Only start translucent behavior if intro bubble is gone
    if (!open && !dragging && !showIntro) {
      setIsTranslucent(true);
      setIsHidden(false);
      setShowIndicator(false);

      // Set timeout to make widget fully visible again after inactivity
      translucentTimeoutRef.current = setTimeout(() => {
        if (!open && !dragging && !showIntro) {
          setIsTranslucent(false);
        }
      }, 3000); // Wait 3 seconds of inactivity to become fully visible

      // Set hide timeout (8 seconds after activity stops)
      hideTimeoutRef.current = setTimeout(() => {
        if (!open && !dragging && !showIntro) {
          setIsHidden(true);
          setShowIndicator(true);
          setIsTranslucent(false);
        }
      }, 8000);
    }
  }, [open, dragging, showIntro]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // More specific events for better activity detection
    const events = [
      'mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click',
      'input', 'focus', 'blur', 'change', 'submit', 'wheel'
    ];
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity, { passive: true });
    });

    // Only start translucent if intro bubble is not showing
    if (!showIntro) {
      setIsTranslucent(true);
    }

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
      if (translucentTimeoutRef.current) clearTimeout(translucentTimeoutRef.current);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (indicatorTimeoutRef.current) clearTimeout(indicatorTimeoutRef.current);
    };
  }, [handleActivity]);

  // Separate effect to handle state updates when open/dragging changes
  useEffect(() => {
    if (open || dragging) {
      // Clear timeouts when widget is open or being dragged
      if (translucentTimeoutRef.current) {
        clearTimeout(translucentTimeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      if (indicatorTimeoutRef.current) {
        clearTimeout(indicatorTimeoutRef.current);
      }
      
      // Reset states
      setIsHidden(false);
      setShowIndicator(false);
      setIsTranslucent(false);
    }
  }, [open, dragging]);

  // Fetch user profile photo (same as navbar)
  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.id) {
        try {
          const profileResponse = await fetch(`/api/user-profile?clerkId=${user.id}`);
          if (profileResponse.ok) {
            const profileData = await profileResponse.json();
            setUserPhotoUrl(profileData.photoUrl || null);
            return;
          }
        } catch (error) {
          // ignore
        }
      }
      setUserPhotoUrl(null);
    };
    if (isLoaded && user) fetchUserData();
  }, [user, isLoaded]);

  // Get user initials (same as navbar)
  const getUserInitials = () => {
    if (!user) return 'U';
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || 'U';
  };

  // Smart positioning for chat box
  const getChatBoxPosition = (): ChatBoxPosition => {
    // Check if we're on the client side
    if (typeof window === 'undefined') {
      return { x: 0, y: 0, width: CHAT_BOX_WIDTH, height: CHAT_BOX_HEIGHT };
    }
    
    const { innerWidth, innerHeight } = window;
    
    // Start with bottom-right position
    let x = position.x - CHAT_BOX_WIDTH + WIDGET_SIZE;
    let y = position.y - CHAT_BOX_HEIGHT - MARGIN;
    
    // Adjust if chat box goes off-screen to the left
    if (x < MARGIN) {
      x = MARGIN;
    }
    
    // Adjust if chat box goes off-screen to the top
    if (y < MARGIN) {
      y = MARGIN;
    }
    
    // If still too tall, position from bottom
    if (y + CHAT_BOX_HEIGHT > innerHeight - MARGIN) {
      y = innerHeight - CHAT_BOX_HEIGHT - MARGIN;
    }
    
    // If still too wide, position from right
    if (x + CHAT_BOX_WIDTH > innerWidth - MARGIN) {
      x = innerWidth - CHAT_BOX_WIDTH - MARGIN;
    }
    
    // Ensure minimum position
    x = Math.max(MARGIN, x);
    y = Math.max(MARGIN, y);
    
    return { x, y, width: CHAT_BOX_WIDTH, height: CHAT_BOX_HEIGHT };
  };

  // Smart positioning for intro bubble
  const getIntroBubblePosition = () => {
    // Check if we're on the client side
    if (typeof window === 'undefined') {
      return { left: '50%', transform: 'translateX(-50%)', top: '-90px' };
    }
    
    const { innerWidth, innerHeight } = window;
    const bubbleWidth = 260;
    const bubbleHeight = 90;
    const offsetY = 16; // px above the widget
    
    // Calculate available space in each direction
    const spaceAbove = position.y - MARGIN;
    const spaceBelow = innerHeight - position.y - WIDGET_SIZE - MARGIN;
    const spaceLeft = position.x - MARGIN;
    const spaceRight = innerWidth - position.x - WIDGET_SIZE - MARGIN;
    
    let bubbleX = 0;
    let bubbleY = 0;

    // If widget is on the right half of the screen, adapt bubble position based on vertical placement
    if (position.x > innerWidth / 2) {
      const screenThird = innerHeight / 3;
      if (position.y < screenThird) {
        // Top-right: bubble below and to the left
        return {
          left: 'auto',
          right: 0,
          top: WIDGET_SIZE + offsetY,
          width: bubbleWidth,
          positionRight: true
        };
      } else if (position.y > 2 * screenThird) {
        // Bottom-right: bubble above and to the left
        return {
          left: 'auto',
          right: 0,
          top: -bubbleHeight - offsetY,
          width: bubbleWidth,
          positionRight: true
        };
      } else {
        // Middle-right: bubble vertically centered to the left
        return {
          left: 'auto',
          right: 0,
          top: -bubbleHeight / 2 + WIDGET_SIZE / 2,
          width: bubbleWidth,
          positionRight: true
        };
      }
    } else {
      // Determine vertical position (above or below widget)
      if (spaceAbove >= bubbleHeight + offsetY) {
        // Position above widget
        bubbleY = -bubbleHeight - offsetY;
      } else if (spaceBelow >= bubbleHeight + offsetY) {
        // Position below widget
        bubbleY = WIDGET_SIZE + offsetY;
      } else if (spaceRight >= bubbleWidth + offsetY) {
        // Position to the right
        bubbleX = WIDGET_SIZE + offsetY;
        bubbleY = -bubbleHeight / 2 + WIDGET_SIZE / 2;
      } else if (spaceLeft >= bubbleWidth + offsetY) {
        // Position to the left
        bubbleX = -bubbleWidth - offsetY;
        bubbleY = -bubbleHeight / 2 + WIDGET_SIZE / 2;
      } else {
        // Fallback: center above with reduced size
        bubbleY = -bubbleHeight - offsetY;
      }
      return {
        left: bubbleX,
        top: bubbleY,
        width: bubbleWidth,
        positionRight: false
      };
    }
  };

  // Add this near the top, with other refs and state
  const positionRef = useRef(position);
  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  // Snap widget to nearest corner when chat is closed
  const snapToNearestCorner = () => {
    // Check if we're on the client side
    if (typeof window === 'undefined') {
      return;
    }
    
    const { innerWidth, innerHeight } = window;
    const currentX = positionRef.current.x;
    const currentY = positionRef.current.y;
    
    // Calculate distances to each corner
    const corners = [
      { x: MARGIN, y: MARGIN }, // Top-left
      { x: innerWidth - WIDGET_SIZE - MARGIN, y: MARGIN }, // Top-right
      { x: MARGIN, y: innerHeight - WIDGET_SIZE - MARGIN }, // Bottom-left
      { x: innerWidth - WIDGET_SIZE - MARGIN, y: innerHeight - WIDGET_SIZE - MARGIN }, // Bottom-right
    ];
    
    let nearestCorner = corners[0];
    let minDistance = Infinity;
    
    corners.forEach(corner => {
      const distance = Math.sqrt(
        Math.pow(currentX - corner.x, 2) + Math.pow(currentY - corner.y, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestCorner = corner;
      }
    });
    
    if (nearestCorner) {
      // Add smooth animation by using CSS transition
      setPosition(nearestCorner);
    }
  };

  // --- DRAG HANDLERS ---
  // For both widget and chat box, always use the widget's position for drag offset
  const onWidgetMouseDown = (e: React.MouseEvent) => {
    setDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    setJustDragged(false);
    document.body.style.userSelect = 'none';
    // Reset states when user interacts with widget
    lastActivityRef.current = Date.now();
    if (isHidden) {
      setIsHidden(false);
      setShowIndicator(false);
      setIsTranslucent(false);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!dragging) return;

    const onMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      // Clamp position so widget stays in viewport
      const minX = MARGIN;
      const minY = MARGIN;
      const maxX = innerWidth - WIDGET_SIZE - MARGIN;
      const maxY = innerHeight - WIDGET_SIZE - MARGIN;
      let newX = e.clientX - dragOffset.current.x;
      let newY = e.clientY - dragOffset.current.y;
      newX = Math.max(minX, Math.min(newX, maxX));
      newY = Math.max(minY, Math.min(newY, maxY));
      setPosition({ x: newX, y: newY });
      if (Math.abs(e.clientX - dragStartPos.current.x) > 5 || Math.abs(e.clientY - dragStartPos.current.y) > 5) {
        setJustDragged(true);
      }
    };
    const onMouseUp = () => {
      setDragging(false);
      document.body.style.userSelect = '';
      setTimeout(() => {
        snapToNearestCorner();
      }, 100);
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [dragging]);

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
      // First, try to answer from page data
      const dataAnswer = answerDataQuery(input);
      
      if (dataAnswer) {
        // If we found a data answer, use it directly
        setMessages([...newMessages, { role: 'assistant', content: dataAnswer }]);
      } else {
        // Fallback to LLM for general questions
        const res = await fetch('/api/ai-assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: newMessages.slice(-5) })
        });
        const data = await res.json();
        setMessages([...newMessages, { role: 'assistant', content: data.reply }]);
      }
    } catch (e) {
      setMessages([...newMessages, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
    }
    setLoading(false);
  };

  const handleOpen = () => {
    if (!justDragged) {
      setOpen(true);
      openAssistant();
      setIsHidden(false);
      setShowIndicator(false);
      setIsTranslucent(false);
      lastActivityRef.current = Date.now();
      
      // Clear any pending timeouts when opening
      if (translucentTimeoutRef.current) {
        clearTimeout(translucentTimeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      if (indicatorTimeoutRef.current) {
        clearTimeout(indicatorTimeoutRef.current);
      }
    }
  };

  const handleClose = () => {
    setOpen(false);
    closeAssistant();
    // Snap to nearest corner when closing
    setTimeout(snapToNearestCorner, 100);
  };

  // Sync with context
  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  // Handle window resize
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      const { innerWidth, innerHeight } = window;
      // Always snap to bottom right after resize
      setPosition({
        x: innerWidth - WIDGET_SIZE - MARGIN,
        y: innerHeight - WIDGET_SIZE - MARGIN,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [position.x, position.y]);

  // Don't render anything during SSR
  if (!isClient) {
    return null;
  }

  // Don't render if hidden and not showing indicator
  if (isHidden && !showIndicator && !open) {
  return (
            <div
          ref={widgetRef}
          className="fixed z-50 font-sans"
          style={{ 
            left: position.x, 
            top: position.y, 
            position: 'fixed',
            transition: dragging ? 'none' : 'left 0.3s cubic-bezier(0.4,0,0.2,1), top 0.3s cubic-bezier(0.4,0,0.2,1)'
          }}
        >
        <div style={{ position: 'relative' }}>
          <button
            className="bg-white/15 backdrop-blur-md rounded-full p-0 flex items-center justify-center border-4 border-[#a259ff] w-12 h-12 group transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#6c38ff] hover:border-[#2e3cff] hover:bg-white hover:opacity-100 opacity-50"
            onClick={handleOpen}
            title="Open Zayra Assistant"
            onMouseDown={onWidgetMouseDown}
            onMouseEnter={() => {
              // Show widget fully immediately when hovering
              if (hoverTimeoutRef.current) {
                clearTimeout(hoverTimeoutRef.current);
              }
              
              // Show widget fully immediately on hover
              setIsHidden(false);
              setShowIndicator(false);
              setIsTranslucent(false);
              lastActivityRef.current = Date.now();
            }}
            onMouseLeave={() => {
              // Start translucent timer when mouse leaves
              if (translucentTimeoutRef.current) {
                clearTimeout(translucentTimeoutRef.current);
              }
              translucentTimeoutRef.current = setTimeout(() => {
                if (!open && !dragging) {
                  setIsTranslucent(true);
                }
              }, 1000); // Become translucent after 1 second of no hover
            }}
            style={{ cursor: 'grab' }}
          >
            <span className="flex items-center justify-center w-full h-full">
              <svg width="24" height="24" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        </div>
      </div>
    );
  }

  const chatBoxPosition = getChatBoxPosition();

  return (
    <>
      {/* Chat Box */}
      {open && (
        <div
          ref={chatBoxRef}
          className="fixed z-50 font-sans animate-fade-in"
          style={{
            left: chatBoxPosition.x,
            top: chatBoxPosition.y,
            width: chatBoxPosition.width,
            height: chatBoxPosition.height,
            position: 'fixed',
            cursor: dragging ? 'grabbing' : undefined,
            transition: dragging ? 'none' : 'left 0.3s cubic-bezier(0.4,0,0.2,1), top 0.3s cubic-bezier(0.4,0,0.2,1)'
          }}
        >
          <div className="w-full h-full bg-gradient-to-br from-[#2e3cff] via-[#6c38ff] to-[#a259ff] border-2 border-[#6c38ff] rounded-3xl flex flex-col shadow-2xl dark:bg-gradient-to-br dark:from-[#232b3e] dark:via-[#334155] dark:to-[#1a223a] dark:border-blue-500 dark:ring-2 dark:ring-blue-700">
            {/* Header */}
            <div
              className="relative flex items-center justify-center h-32 w-full border-b border-[#d1d5fa] rounded-t-2xl cursor-move select-none bg-no-repeat dark:border-blue-500"
              style={{
                backgroundImage: 'url(/zayra-branding.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                cursor: dragging ? 'grabbing' : 'grab'
              }}
              onMouseDown={onWidgetMouseDown}
            >
              <button onClick={handleClose} className="text-[#e0e0ff] hover:text-white text-2xl font-bold transition-colors absolute right-4 top-1/2 -translate-y-1/2">×</button>
            </div>
            
          {/* Chat Body */}
            <div className="flex-1 p-5 overflow-y-auto bg-gradient-to-br from-white via-[#f3f4fa] to-[#e9eafd] dark:bg-gradient-to-br dark:from-[#181f2a] dark:via-[#232b3e] dark:to-[#1a223a] custom-scrollbar">
            {messages.map((m, i) => (
              <div key={i} className={`mb-4 flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2e3cff] to-[#a259ff] flex items-center justify-center mr-2 shadow-md">
                    <span className="text-white font-bold">Z</span>
                  </div>
                )}
                  <span className={`inline-block px-4 py-2 rounded-2xl shadow text-base max-w-[75%] break-words whitespace-pre-wrap ${
                    m.role === 'user' 
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-br-none dark:from-blue-600 dark:to-indigo-700' 
                      : 'bg-white text-[#23234d] rounded-bl-none border border-[#d1d5fa] dark:bg-[#232b3e] dark:text-[#e0eaff] dark:border-[#334155]'
                  }`}>
                  {m.role === 'assistant' ? <Markdown options={{ forceBlock: true }}>{m.content}</Markdown> : m.content}
                </span>
                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-[#e9eafd] flex items-center justify-center ml-2 shadow-md overflow-hidden">
                    {userPhotoUrl ? (
                      <img src={userPhotoUrl} alt="User Avatar" className="w-full h-full object-cover" />
                    ) : user && user.imageUrl ? (
                      <img src={user.imageUrl} alt="User Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[#a259ff] font-bold">
                        {getUserInitials()}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
            {loading && <div className="text-[#a259ff] text-sm pl-2 animate-pulse">Zayra is typing...</div>}
            <div ref={messagesEndRef} />
          </div>
            
          {/* Input */}
          <div className="flex items-center gap-2 p-4 border-t border-[#d1d5fa] bg-white rounded-b-2xl dark:bg-[#181f2a] dark:border-[#334155]">
            <input
              className="flex-1 border border-[#d1d5fa] rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-base bg-[#f3f4fa] text-[#23234d] placeholder-[#a59cff] dark:bg-[#232b3e] dark:text-[#e0eaff] dark:border-[#334155] dark:placeholder-[#475569] focus:dark:ring-blue-500"
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
        </div>
      )}

      {/* Widget Button */}
      {!open && (
        <div
          ref={widgetRef}
          className="fixed z-50 font-sans"
          style={{ 
            left: position.x, 
            top: position.y, 
            position: 'fixed',
            transition: dragging ? 'none' : 'left 0.3s cubic-bezier(0.4,0,0.2,1), top 0.3s cubic-bezier(0.4,0,0.2,1)'
          }}
        >
          <div style={{ position: 'relative' }}>
            {showIntro && !open && (() => {
              const bubblePos = getIntroBubblePosition();
              return (
                <div
                  className="absolute z-50 animate-fade-in flex flex-col items-center"
                  style={{
                    left: bubblePos.positionRight ? undefined : bubblePos.left,
                    right: bubblePos.positionRight ? bubblePos.right : undefined,
                    top: bubblePos.top,
                    width: bubblePos.width
                  }}
                >
                  <div className="bg-white dark:bg-gray-800 border border-[#a259ff] dark:border-blue-500 shadow-lg dark:shadow-gray-900/50 rounded-xl px-4 py-3 text-sm text-[#2e3cff] dark:text-gray-100 flex items-start gap-2 relative">
                    <div className="flex-1">
                      <div className="font-semibold mb-1">👋 Hi, I'm <span className='text-[#a259ff] dark:text-blue-400'>Zayra</span>!</div>
                      <div className="dark:text-gray-300">I'm here to help you around the app.<br/>You can drag me to a new place if I'm in the way!</div>
                    </div>
                    <button
                      className="ml-2 text-[#a259ff] dark:text-blue-400 hover:text-[#2e3cff] dark:hover:text-blue-300 text-lg font-bold focus:outline-none"
                      aria-label="Close introduction"
                      onClick={() => setShowIntro(false)}
                      tabIndex={0}
                    >×</button>
                  </div>
                </div>
              );
            })()}
            <button
              className={`rounded-full p-0 flex items-center justify-center border-4 border-[#a259ff] w-16 h-16 group transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#6c38ff] hover:border-[#2e3cff] hover:opacity-100 ${
                isTranslucent ? 'bg-white/20 backdrop-blur-md opacity-60' : 'bg-white opacity-100'
              }`}
              onClick={handleOpen}
              title="Open Zayra Assistant"
              onMouseDown={onWidgetMouseDown}
              onMouseEnter={() => {
                // Clear any pending timeouts
                if (hoverTimeoutRef.current) {
                  clearTimeout(hoverTimeoutRef.current);
                }
                if (translucentTimeoutRef.current) {
                  clearTimeout(translucentTimeoutRef.current);
                }
                
                // Make widget fully visible when hovering
                setIsTranslucent(false);
                if (isHidden) {
                  setIsHidden(false);
                  setShowIndicator(false);
                }
                lastActivityRef.current = Date.now();
              }}
              onMouseLeave={() => {
                // Start translucent timer when mouse leaves
                if (translucentTimeoutRef.current) {
                  clearTimeout(translucentTimeoutRef.current);
                }
                translucentTimeoutRef.current = setTimeout(() => {
                  if (!open && !dragging) {
                    setIsTranslucent(true);
                  }
                }, 500); // Become translucent after 0.5 seconds of no hover
              }}
              style={{ cursor: 'grab' }}
            >
              <span className="flex items-center justify-center w-full h-full">
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
          </div>
      </div>
      )}
    </>
  );
}

function formatAssistantMessage(message: string) {
  return message;
}
