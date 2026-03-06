"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useRef, useEffect } from "react";

export default function Home() {
  const messages = useQuery(api.messages.get);
  const sendMessage = useMutation(api.messages.send);

  const [newMessageText, setNewMessageText] = useState("");
  const [author, setAuthor] = useState("Anonymous");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom on new message
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    await sendMessage({ text: newMessageText, author });
    setNewMessageText("");
  };

  return (
    <div className="flex flex-col h-screen bg-neutral-950 text-neutral-100 font-sans">
      {/* Header */}
      <header className="bg-neutral-900 border-b border-neutral-800 p-4 shadow-sm flex items-center justify-between z-10">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
          Convex Chat
        </h1>
        <div className="flex items-center space-x-2">
          <label className="text-xs text-neutral-400" htmlFor="authorInput">
            Zaslon ime:
          </label>
          <input
            id="authorInput"
            type="text"
            className="bg-neutral-800 text-sm border-none rounded-md px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:outline-none w-32"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages === undefined ? (
          <div className="flex h-full items-center justify-center">
            <div className="animate-pulse flex space-x-2 items-center">
              <div className="w-2 h-2 rounded-full bg-blue-500"></div>
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-[pulse_1s_ease-in-out_infinite_200ms]"></div>
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-[pulse_1s_ease-in-out_infinite_400ms]"></div>
            </div>
          </div>
        ) : (
          messages.slice().reverse().map((msg) => {
            const isMe = msg.author === author;
            return (
              <div
                key={msg._id}
                className={`flex flex-col ${
                  isMe ? "items-end" : "items-start"
                }`}
              >
                {!isMe && (
                  <span className="text-xs text-neutral-500 mb-1 ml-1">
                    {msg.author}
                  </span>
                )}
                <div
                  className={`px-4 py-2 rounded-2xl max-w-[80%] break-words ${
                    isMe
                      ? "bg-blue-600 text-white rounded-tr-sm"
                      : "bg-neutral-800 text-neutral-100 rounded-tl-sm"
                  } shadow-md`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="p-4 bg-neutral-900 border-t border-neutral-800">
        <form
          onSubmit={handleSendMessage}
          className="flex items-center max-w-4xl mx-auto space-x-3 gap-2"
        >
          <input
            type="text"
            className="flex-1 bg-neutral-800 text-neutral-100 rounded-full px-5 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all border border-neutral-700"
            placeholder="Vpiši sporočilo..."
            value={newMessageText}
            onChange={(e) => setNewMessageText(e.target.value)}
          />
          <button
            type="submit"
            disabled={!newMessageText.trim()}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-full p-3 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            aria-label="Pošlji"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 -rotate-45"
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
