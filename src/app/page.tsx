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
          <span className="text-xl md:text-2xl text-white tracking-widest leading-none drop-shadow-sm flex items-baseline select-none">
            <span className="font-extrabold pr-0.5">SPORT</span>
            <span className="font-semibold opacity-90">2GO</span>
          </span>
        </div>
        <div className="flex flex-col items-end space-y-1">
          <div className="flex items-center space-x-2">
            <label className="text-xs text-black/70 font-semibold" htmlFor="authorInput">
              Ime: <span className="text-red-700">*</span>
            </label>
            <input
              id="authorInput"
              type="text"
              className={`bg-white/95 text-sm border ${
                authorError 
                  ? "border-red-500 ring-2 ring-red-500" 
                  : !author.trim()
                    ? "border-white/80 ring-2 ring-white/60 animate-[pulse_2s_ease-in-out_infinite]"
                    : "border-white/50"
              } text-gray-800 font-medium rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-[#5BA582] focus:border-transparent focus:animate-none outline-none w-32 md:w-48 transition-all shadow-sm placeholder-gray-400`}
              value={author}
              onChange={(e) => {
                setAuthor(e.target.value);
                if (e.target.value.trim()) setAuthorError(false);
              }}
              placeholder="Vpiši ime"
              maxLength={20}
            />
          </div>
          {authorError && (
            <span className="text-[10px] text-red-800 font-bold tracking-wide absolute -bottom-4 right-5 drop-shadow-sm">Ime je obvezno!</span>
          )}
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
          messages.slice().reverse().map((msg) => {
            const isMe = msg.author === author;
            // Format the creation time
            const timestamp = new Intl.DateTimeFormat("sl-SI", {
              hour: "2-digit",
              minute: "2-digit",
            }).format(msg._creationTime);

            const dateLabelText = new Intl.DateTimeFormat("sl-SI", {
              day: "numeric",
              month: "short",
              year: "numeric"
            }).format(msg._creationTime);

            return (
              <div
                key={msg._id}
                className={`flex flex-col ${
                  isMe ? "items-end" : "items-start"
                } animate-in fade-in slide-in-from-bottom-2 duration-300`}
              >
                {!isMe && (
                  <span className="text-[11px] text-gray-500 font-semibold mb-1 ml-2 tracking-wide uppercase">
                    {msg.author}
                  </span>
                )}
                <div
                  className={`px-5 py-3 text-sm md:text-[15px] leading-relaxed max-w-[85%] break-words shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100/50 ${
                    isMe
                      ? "bg-[#5BA582] text-white font-medium rounded-2xl rounded-tr-sm"
                      : "bg-white text-gray-700 rounded-2xl rounded-tl-sm"
                  }`}
                >
                  {msg.text}
                </div>
                <div className="flex items-center space-x-1 mt-1.5 mx-2">
                  <span className="text-[10px] text-gray-400 font-medium">
                    {dateLabelText},{' '}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">
                    {timestamp}
                  </span>
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
            <div className="flex items-center space-x-2 w-full max-w-4xl mx-auto px-1 overflow-x-auto pb-1 scrollbar-hide">
              {quickActionTab === "emoji" ? (
                <>
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
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setNewMessageText("Danes si bil zanič! 👎")}
                    className="text-xs font-medium bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-full whitespace-nowrap hover:bg-[#5BA582] hover:text-white hover:border-[#5BA582] transition-colors shadow-sm active:scale-95"
                  >
                    Danes si bil zanič
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMessageText("Dobra igra! 👏")}
                    className="text-xs font-medium bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-full whitespace-nowrap hover:bg-[#5BA582] hover:text-white hover:border-[#5BA582] transition-colors shadow-sm active:scale-95"
                  >
                    Dobra igra
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMessageText("Častiš pivo! 🍻")}
                    className="text-xs font-medium bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-full whitespace-nowrap hover:bg-[#5BA582] hover:text-white hover:border-[#5BA582] transition-colors shadow-sm active:scale-95"
                  >
                    Častiš pivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewMessageText("Spet zamujaš! ⏳")}
                    className="text-xs font-medium bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-full whitespace-nowrap hover:bg-[#5BA582] hover:text-white hover:border-[#5BA582] transition-colors shadow-sm active:scale-95"
                  >
                    Spet zamujaš
                  </button>
                </>
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
