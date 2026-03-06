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
    <div className="flex flex-col h-[100dvh] bg-black text-white font-sans overflow-hidden">
      {/* Sport2GO Header (Sticky) */}
      <header className="bg-black border-b border-neutral-800 p-4 shadow-sm flex items-center justify-between z-20 flex-shrink-0">
        <h1 className="text-2xl font-black italic tracking-widest text-[#00E5FF]">
          SPORT<span className="text-white">2</span>GO
        </h1>
        <div className="flex flex-col items-end space-y-1">
          <div className="flex items-center space-x-2">
            <label className="text-xs text-neutral-400 font-medium" htmlFor="authorInput">
              Ime: <span className="text-red-500">*</span>
            </label>
            <input
              id="authorInput"
              type="text"
              className={`bg-neutral-900/50 text-sm border ${
                authorError ? "border-red-500 ring-1 ring-red-500" : "border-neutral-700"
              } rounded-md px-3 py-1.5 focus:ring-1 focus:ring-[#00E5FF] focus:border-[#00E5FF] outline-none w-32 md:w-48 transition-all`}
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
            <span className="text-[10px] text-red-500 font-medium tracking-wide">Ime je obvezno!</span>
          )}
        </div>
      </header>

      {/* Chat Area (Scrollable) */}
      <main 
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-4 space-y-4 relative bg-neutral-950"
      >
        {messages === undefined ? (
          <div className="flex h-full items-center justify-center">
            <div className="animate-pulse flex space-x-3 items-center">
              <div className="w-2.5 h-2.5 rounded-full bg-[#00E5FF]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] animate-[pulse_1s_ease-in-out_infinite_200ms]"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] animate-[pulse_1s_ease-in-out_infinite_400ms]"></div>
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
                  <span className="text-xs text-neutral-400 font-semibold mb-1 ml-1 tracking-wide">
                    {msg.author}
                  </span>
                )}
                <div
                  className={`px-4 py-2.5 text-sm md:text-base rounded-2xl max-w-[85%] break-words ${
                    isMe
                      ? "bg-[#00E5FF] text-black font-medium rounded-br-sm"
                      : "bg-neutral-800 text-neutral-100 rounded-bl-sm"
                  } shadow-sm`}
                >
                  {msg.text}
                </div>
                <div className="flex items-center space-x-1 mt-1 mx-1">
                  <span className="text-[10px] sm:text-xs text-neutral-600 font-medium">
                    {dateLabelText},{' '}
                  </span>
                  <span className="text-[10px] sm:text-xs text-neutral-500 font-medium">
                    {timestamp}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} className="h-2" />
      </main>

      {/* Unread Indicator Floating Button */}
      {hasUnread && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-30">
          <button
            onClick={scrollToBottomContext}
            className="bg-[#00E5FF] hover:bg-cyan-300 text-black font-semibold text-xs py-2 px-4 rounded-full shadow-lg border border-[#00E5FF] transition-all flex items-center space-x-2 animate-bounce cursor-pointer group"
          >
            <span>Nova sporočila</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-y-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>
        </div>
      )}

      {/* Input Area (Sticky Footer) */}
      <footer className="p-3 sm:p-4 bg-black border-t border-neutral-800 flex-shrink-0 z-20 pb-safe">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center w-full max-w-4xl mx-auto space-x-2 sm:space-x-3 gap-1"
        >
          <input
            type="text"
            className="flex-1 bg-neutral-900 text-white rounded-full px-5 py-3 sm:py-3.5 focus:outline-none focus:ring-2 focus:ring-[#00E5FF] transition-all border border-neutral-800 placeholder-neutral-500 shadow-inner text-sm sm:text-base"
            placeholder="Napiši sporočilo..."
            value={newMessageText}
            onChange={(e) => setNewMessageText(e.target.value)}
          />
          <button
            type="submit"
            disabled={!newMessageText.trim() || !author.trim()}
            className="bg-[#00E5FF] hover:bg-cyan-300 text-black rounded-full p-3 sm:p-3.5 transition-colors disabled:opacity-40 disabled:hover:bg-[#00E5FF] disabled:cursor-not-allowed flex-shrink-0 shadow-sm"
            aria-label="Pošlji"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-5 h-5 sm:w-6 sm:h-6 -rotate-45 ml-0.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </form>
      </footer>
    </div>
  );
}
