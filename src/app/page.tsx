"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const messages = useQuery(api.messages.get);
  const sendMessage = useMutation(api.messages.send);

  const [newMessageText, setNewMessageText] = useState("");
  const [author, setAuthor] = useState("");
  const [authorError, setAuthorError] = useState(false);
  const [quickActionTab, setQuickActionTab] = useState<"emoji" | "text">("emoji");
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLElement>(null);
  const [hasUnread, setHasUnread] = useState(false);
  const [lastSeenMessageId, setLastSeenMessageId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Set the initial time after the first render to avoid Hydration/Purity errors, and periodically update
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentTime(Date.now());
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Auto-scroll on initial load or if already at the bottom when a new message arrives
  useEffect(() => {
    if (!messages) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    // Check if user is near the bottom
    const isScrolledToBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 100;

    if (isScrolledToBottom || !lastSeenMessageId) {
      // Scroll to bottom and mark as read
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      if (messages.length > 0) {
        // Suppress eslint warning: it's intended to track this implicitly 
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLastSeenMessageId(messages[0]._id);
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHasUnread(false);
    } else {
      // User is scrolled up and received a new message
      // Make sure the new message is not theirs
      const newMessages = messages.filter(msg => msg._id !== lastSeenMessageId && msg._creationTime > (messages.find(m => m._id === lastSeenMessageId)?._creationTime || 0));
      const hasOthersNewMessages = newMessages.some(msg => msg.author !== author);
      
      if (hasOthersNewMessages) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHasUnread(true);
      }
    }
  }, [messages, lastSeenMessageId, author]);

  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const isScrolledToBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 50;

    if (isScrolledToBottom) {
      setHasUnread(false);
      if (messages && messages.length > 0) {
        setLastSeenMessageId(messages[0]._id); // the query returns descending, so [0] is newest
      }
    }
  };

  const scrollToBottomContext = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setHasUnread(false);
    if (messages && messages.length > 0) {
      setLastSeenMessageId(messages[0]._id);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim()) {
      setAuthorError(true);
      // Remove error after 3 seconds
      setTimeout(() => setAuthorError(false), 3000);
      return;
    }
    setAuthorError(false);
    if (!newMessageText.trim()) return;

    const messageToSend = newMessageText;
    setNewMessageText(""); // optimistic clear

    await sendMessage({ text: messageToSend, author });
    // Scroll down aggressively after sending
    setTimeout(scrollToBottomContext, 50);
  };

  // Helper functions for formatting dates and times
  const formatRelativeTime = (timestampMs: number) => {
    if (currentTime === 0) return ""; // prevent hydration mismatch before client mount
    // const rtf = new Intl.RelativeTimeFormat("sl-SI", { numeric: "always", style: "short" });
    const diffInSeconds = Math.round((timestampMs - currentTime) / 1000);
    const diffInMinutes = Math.round(diffInSeconds / 60);
    const diffInHours = Math.round(diffInMinutes / 60);

    if (Math.abs(diffInSeconds) < 60) {
      return "pravkar";
    } else if (Math.abs(diffInMinutes) < 60) {
      return `pred ${Math.abs(diffInMinutes)} min`;
    } else if (Math.abs(diffInHours) < 24) {
      return `pred ${Math.abs(diffInHours)} h`;
    }

    // fallback for older messages
    return new Intl.DateTimeFormat("sl-SI", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(timestampMs);
  };

  const getDaySeparatorLabel = (timestampMs: number) => {
    const messageDate = new Date(timestampMs);
    const today = new Date(currentTime);
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (
      messageDate.getDate() === today.getDate() &&
      messageDate.getMonth() === today.getMonth() &&
      messageDate.getFullYear() === today.getFullYear()
    ) {
      return "DANES";
    }

    if (
      messageDate.getDate() === yesterday.getDate() &&
      messageDate.getMonth() === yesterday.getMonth() &&
      messageDate.getFullYear() === yesterday.getFullYear()
    ) {
      return "VČERAJ";
    }

    return new Intl.DateTimeFormat("sl-SI", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(messageDate).toUpperCase();
  };


  return (
    <div className="flex flex-col h-[100dvh] bg-[#F4F6F8] text-[#444] font-sans overflow-hidden">
      {/* Sport2GO Header (Sticky) */}
      <header className="bg-gradient-to-r from-[#F0CA68] to-[#EAA145] border-b border-[#EAA145]/30 p-4 shadow-md flex items-center justify-between z-20 flex-shrink-0 relative">
        <div className="flex items-center space-x-2">
          <img 
            src="https://www.sport2go.app/image/logo.svg" 
            alt="SPORT2GO Logo" 
            className="h-7 md:h-8 w-auto drop-shadow-sm"
          />
          <span className="text-xl md:text-2xl text-white tracking-widest leading-none drop-shadow-sm flex items-baseline select-none font-sans" style={{fontFamily: 'var(--font-montserrat)'}}>
            <span className="font-extrabold pr-0.5" style={{fontWeight: 800}}>SPORT</span>
            <span className="font-medium opacity-90" style={{fontWeight: 500}}>2GO</span>
          </span>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <input
            id="authorInput"
            type="text"
            className={`transition-all placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#f1dfb2] ${
              authorError ? "border-red-400 focus:ring-red-400" : ""
            }`}
            style={{
              padding: "8px 15px",
              boxShadow: "none",
              background: "#fff",
              width: "120px",
              margin: "0 auto",
              fontWeight: 300,
              fontSize: "14px",
              borderRadius: "4px",
              border: authorError ? "1px solid #fca5a5" : "1px solid #f1dfb2",
              color: "#444"
            }}
            value={author}
            onChange={(e) => {
              setAuthor(e.target.value);
              if (e.target.value.trim()) setAuthorError(false);
            }}
            placeholder="Vpiši ime"
            maxLength={20}
          />
        </div>
      </header>

      {/* Chat Area (Scrollable) */}
      <main 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 relative bg-[#F4F6F8]"
      >
        {messages === undefined ? (
          <div className="flex h-full items-center justify-center">
            <div className="animate-pulse flex space-x-3 items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-[#5BA582]/40"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#5BA582]/70 animate-[pulse_1s_ease-in-out_infinite_200ms]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#5BA582] animate-[pulse_1s_ease-in-out_infinite_400ms]"></div>
            </div>
          </div>
        ) : (
          messages.slice().reverse().map((msg, index, arr) => {
            const isMe = msg.author === author;
            
            // Check if day changed from previous message
            let showDateSeparator = false;
            let dateLabel = "";
            if (index === 0) {
              showDateSeparator = true;
              dateLabel = getDaySeparatorLabel(msg._creationTime);
            } else {
              const prevMsg = arr[index - 1];
              const currentMsgDate = new Date(msg._creationTime);
              const prevMsgDate = new Date(prevMsg._creationTime);
              
              if (
                currentMsgDate.getDate() !== prevMsgDate.getDate() ||
                currentMsgDate.getMonth() !== prevMsgDate.getMonth() ||
                currentMsgDate.getFullYear() !== prevMsgDate.getFullYear()
              ) {
                showDateSeparator = true;
                dateLabel = getDaySeparatorLabel(msg._creationTime);
              }
            }

            const timeLabel = formatRelativeTime(msg._creationTime);

            return (
              <div key={msg._id} className="flex flex-col space-y-4">
                {/* Date Separator */}
                {showDateSeparator && (
                  <div className="flex justify-center my-2">
                    <span className="bg-gray-200/60 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                      {dateLabel}
                    </span>
                  </div>
                )}
                
                {/* Message Bubble Row */}
                <div
                  className={`flex ${
                    isMe ? "justify-end" : "justify-start"
                  } items-end space-x-2 animate-in fade-in slide-in-from-bottom-2 duration-300 w-full`}
                >
                  {/* Avatar for Others */}
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center shadow-sm border border-gray-300 overflow-hidden mb-6">
                      <svg className="w-5 h-5 text-gray-400 mt-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                  )}

                  <div className={`flex flex-col max-w-[75%] md:max-w-[70%] ${isMe ? "items-end" : "items-start"}`}>
                    {!isMe && (
                      <span className="text-[11px] text-gray-500 font-medium mb-1 ml-1 tracking-wide uppercase">
                        {msg.author}
                      </span>
                    )}
                    <div
                      className={`px-4 py-2.5 text-sm md:text-[15px] leading-relaxed break-words shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100/50 ${
                        isMe
                          ? "bg-[#5BA582] text-white font-medium rounded-2xl rounded-br-sm"
                          : "bg-white text-gray-700 rounded-2xl rounded-bl-sm"
                      }`}
                    >
                      {msg.text}
                    </div>
                    <div className="flex items-center space-x-1 mt-1 mx-1">
                      <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                        {timeLabel}
                      </span>
                    </div>
                  </div>

                  {/* Avatar for Me */}
                  {isMe && (
                    <div className="w-8 h-8 rounded-full bg-[#5BA582]/20 flex-shrink-0 flex items-center justify-center shadow-sm border border-[#5BA582]/30 overflow-hidden mb-6">
                      <svg className="w-5 h-5 text-[#5BA582] mt-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path>
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} className="h-4" />
      </main>

      {/* Unread Indicator Floating Button */}
      {hasUnread && (
        <div className="absolute bottom-[110px] md:bottom-28 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none">
          <button
            onClick={scrollToBottomContext}
            className="bg-[#ECA245] hover:bg-[#D99133] text-white font-bold text-xs py-2 px-5 rounded-full shadow-[0_4px_14px_rgba(236,162,69,0.4)] border border-[#ECA245] transition-all flex items-center space-x-2 animate-bounce cursor-pointer group pointer-events-auto"
          >
            <span>Nova sporočila</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
      )}

      {/* Name Required Toast (Tooltip) */}
      {authorError && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="bg-red-500/90 backdrop-blur-sm text-white font-semibold text-xs py-2 px-4 rounded-full shadow-[0_4px_14px_rgba(239,68,68,0.4)] border border-red-400">
            Ime je obvezno!
          </div>
        </div>
      )}

      {/* Input Area (Sticky Footer) */}
      <footer className="bg-white border-t border-gray-200 flex-shrink-0 z-20 pb-safe shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.04)]">
        
        {/* Collapsible Quick Actions Panel */}
        <div 
          className={`overflow-hidden transition-all duration-300 ease-in-out bg-[#FAFAFA] border-b border-gray-100 ${
            isQuickActionsOpen ? "h-[110px] opacity-100" : "h-0 opacity-0"
          }`}
        >
          <div className="p-3">
            {/* Quick Actions Tabs */}
            <div className="flex w-full max-w-4xl mx-auto mb-2 px-1">
              <div className="flex bg-gray-200/50 rounded-lg p-0.5 space-x-1">
                <button
                  type="button"
                  onClick={() => setQuickActionTab("emoji")}
                  className={`text-[11px] px-4 py-1.5 rounded-md font-semibold transition-all ${
                    quickActionTab === "emoji" ? "bg-white text-[#5BA582] shadow-sm transform scale-100" : "text-gray-500 hover:text-[#5BA582] hover:bg-white/50"
                  }`}
                >
                  Ikone (Emoji)
                </button>
                <button
                  type="button"
                  onClick={() => setQuickActionTab("text")}
                  className={`text-[11px] px-4 py-1.5 rounded-md font-semibold transition-all ${
                    quickActionTab === "text" ? "bg-white text-[#5BA582] shadow-sm transform scale-100" : "text-gray-500 hover:text-[#5BA582] hover:bg-white/50"
                  }`}
                >
                  Predpripravljeno
                </button>
              </div>
            </div>

            {/* Quick Actions Content */}
            <div className="flex items-center space-x-2 w-full max-w-4xl mx-auto px-1 overflow-x-auto pb-1 scrollbar-hide h-[60px]">
              {quickActionTab === "emoji" ? (
                <div className="flex items-center space-x-2 my-auto">
                  <button
                    type="button"
                    onClick={() => setNewMessageText((prev) => prev + "🟨 ")}
                    className="w-12 h-12 flex items-center justify-center text-xl hover:scale-105 active:scale-95 hover:bg-white rounded-xl transition-all flex-shrink-0 shadow-sm border border-transparent hover:border-gray-200"
                    title="Rumen karton"
                    aria-label="Rumen karton"
                  >
                    🟨
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMessageText((prev) => prev + "🟥 ")}
                    className="w-12 h-12 flex items-center justify-center text-xl hover:scale-105 active:scale-95 hover:bg-white rounded-xl transition-all flex-shrink-0 shadow-sm border border-transparent hover:border-gray-200"
                    title="Rdeč karton"
                    aria-label="Rdeč karton"
                  >
                    🟥
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMessageText((prev) => prev + "🍻 ")}
                    className="w-12 h-12 flex items-center justify-center text-xl hover:scale-105 active:scale-95 hover:bg-white rounded-xl transition-all flex-shrink-0 shadow-sm border border-transparent hover:border-gray-200"
                    title="Pivo"
                    aria-label="Pivo"
                  >
                    🍻
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMessageText((prev) => prev + "⚽ ")}
                    className="w-12 h-12 flex items-center justify-center text-xl hover:scale-105 active:scale-95 hover:bg-white rounded-xl transition-all flex-shrink-0 shadow-sm border border-transparent hover:border-gray-200"
                    title="Žoga"
                    aria-label="Žoga"
                  >
                    ⚽
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMessageText((prev) => prev + "⏱️ ")}
                    className="w-12 h-12 flex items-center justify-center text-xl hover:scale-105 active:scale-95 hover:bg-white rounded-xl transition-all flex-shrink-0 shadow-sm border border-transparent hover:border-gray-200"
                    title="Čas/Sodnik"
                    aria-label="Čas/Sodnik"
                  >
                    ⏱️
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2 my-auto h-full pb-2">
                  <button
                    type="button"
                    onClick={() => setNewMessageText("Danes si bil zanič! 👎")}
                    className="text-xs font-medium bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-full whitespace-nowrap hover:bg-[#5BA582] hover:text-white hover:border-[#5BA582] transition-colors shadow-sm active:scale-95 h-fit"
                  >
                    Danes si bil zanič
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMessageText("Dobra igra! 👏")}
                    className="text-xs font-medium bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-full whitespace-nowrap hover:bg-[#5BA582] hover:text-white hover:border-[#5BA582] transition-colors shadow-sm active:scale-95 h-fit"
                  >
                    Dobra igra
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMessageText("Častiš pivo! 🍻")}
                    className="text-xs font-medium bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-full whitespace-nowrap hover:bg-[#5BA582] hover:text-white hover:border-[#5BA582] transition-colors shadow-sm active:scale-95 h-fit"
                  >
                    Častiš pivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMessageText("Spet zamujaš! ⏳")}
                    className="text-xs font-medium bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-full whitespace-nowrap hover:bg-[#5BA582] hover:text-white hover:border-[#5BA582] transition-colors shadow-sm active:scale-95 h-fit"
                  >
                    Spet zamujaš
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center w-full max-w-4xl mx-auto space-x-2 sm:space-x-3 gap-1 relative"
          >
            <button
              type="button"
              onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
              className={`p-2.5 rounded-full transition-colors flex-shrink-0 ${
                isQuickActionsOpen 
                  ? "bg-gray-100 text-[#5BA582] hover:bg-gray-200" 
                  : "bg-transparent text-gray-400 hover:text-[#5BA582] hover:bg-gray-50"
              }`}
              title="Hitre akcije"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-6 h-6 transition-transform duration-300 ${isQuickActionsOpen ? "rotate-45" : ""}`}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>

            <input
              type="text"
              className="flex-1 bg-gray-50 text-gray-800 font-medium rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-[#5BA582]/50 focus:bg-white transition-all border border-gray-200 placeholder-gray-400 text-sm sm:text-[15px] shadow-inner"
              placeholder="Napiši sporočilo..."
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
            />
            
            <button
              type="submit"
              disabled={!newMessageText.trim() || !author.trim()}
              className="bg-[#5BA582] hover:bg-[#4d8c6f] text-white rounded-2xl w-12 h-12 transition-all disabled:opacity-40 disabled:hover:bg-[#5BA582] disabled:cursor-not-allowed flex-shrink-0 shadow-md active:scale-95 flex items-center justify-center relative"
              aria-label="Pošlji"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-5 h-5 -rotate-45 relative -left-0.5 -top-0.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}
