"use client";

import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useState, useRef, useEffect, useLayoutEffect } from "react";
import Header from "../../../components/Header";

import { useRouter, useParams } from 'next/navigation';
import Cookies from "js-cookie";
import { translations, Language } from "../../i18n";
import { useLanguage } from "@/components/LanguageContext";

export default function ChatTeamPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const params = useParams();
  const teamId = params.teamId as Id<"teams">;

  const sendMessage = useMutation(api.messages.send);
  const votePoll = useMutation(api.messages.votePoll);
  const toggleReaction = useMutation(api.messages.toggleReaction);
  const togglePin = useMutation(api.messages.togglePin);
  const deleteMessage = useMutation(api.messages.deleteMessage);
  const updatePresence = useMutation(api.users.updatePresence);

  const currentUser = useQuery(api.users.current, isAuthenticated ? {} : "skip");
  const currentTeam = useQuery(api.teams.getTeam, { teamId });
  const participantsList = useQuery(api.teams.getTeamParticipants, { teamId });
  const pinnedMessage = useQuery(api.messages.getPinnedMessage, { teamId });
  const router = useRouter();

  const { language: currentLang } = useLanguage();
  const t = (translations as any)[currentLang] || translations["sl"];

  const [newMessageText, setNewMessageText] = useState("");
  const author = currentUser?.name || currentUser?.email?.split("@")[0] || "Uporabnik";
  const authorImage = currentUser?.image ?? "";
  
  const [quickActionTab, setQuickActionTab] = useState<"emoji" | "text" | "poll" | "location">("emoji");
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  
  // Poll state
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);

  // Pagination & Messages
  const [limit, setLimit] = useState(30);
  const messagesPaginated = useQuery(api.messages.get, { teamId, paginationOpts: { cursor: null, numItems: limit } });
  const messages = messagesPaginated?.page || undefined;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLElement>(null);
  const prevScrollHeightRef = useRef<number>(0);
  const prevMessagesLengthRef = useRef<number>(0);
  
  const [hasUnread, setHasUnread] = useState(false);
  const [lastSeenMessageId, setLastSeenMessageId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Active message for reactions long-press/click
  const [activeReactionMessageId, setActiveReactionMessageId] = useState<Id<"messages"> | null>(null);

  useLayoutEffect(() => {
    if (messages) {
      if (
        messages.length > prevMessagesLengthRef.current && 
        prevScrollHeightRef.current > 0
      ) {
        const container = scrollContainerRef.current;
        if (container) {
          const diff = container.scrollHeight - prevScrollHeightRef.current;
          // Adjust scroll if we were at the top grabbing history
          if (container.scrollTop < 10) {
             container.scrollTop = diff;
          }
        }
      }
      prevMessagesLengthRef.current = messages.length;
      prevScrollHeightRef.current = 0; // reset
    }
  }, [messages]);

  // Modals state
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
  const [selectedPollForDetails, setSelectedPollForDetails] = useState<any | null>(null);

  // Online Presence Heartbeat
  useEffect(() => {
    if (isAuthenticated) {
      updatePresence(); // Initial ping
      const presenceTimer = setInterval(() => {
        updatePresence();
      }, 60000); // Ping every 60s
      return () => clearInterval(presenceTimer);
    }
  }, [isAuthenticated, updatePresence]);

  useEffect(() => {
    setCurrentTime(Date.now());
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    } else if (isAuthenticated && currentUser !== undefined && !currentUser?.isProfileComplete) {
      router.push("/profile");
    }
  }, [isLoading, isAuthenticated, currentUser, router]);

  // Infinite Scroll logic: fetch more when scrolling up
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Load more if we hit top
    if (container.scrollTop === 0 && messagesPaginated?.isDone === false) {
       prevScrollHeightRef.current = container.scrollHeight;
       setLimit(prev => prev + 30);
    }

    const isScrolledToBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 50;

    if (isScrolledToBottom) {
      setHasUnread(false);
      if (messages && messages.length > 0) {
        setLastSeenMessageId(messages[0]._id); 
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

  useEffect(() => {
    if (messagesPaginated && messages) {
       // if we just loaded the first batch, scroll to bottom
       if (messages.length <= 30 && !lastSeenMessageId) {
          setTimeout(scrollToBottomContext, 100);
       } else if (messages.length > 0) {
          // check if there's a new message
          const newMessages = messages.filter(msg => msg._id !== lastSeenMessageId && msg._creationTime > (messages.find(m => m._id === lastSeenMessageId)?._creationTime || 0));
          const hasOthersNewMessages = newMessages.some(msg => msg.author !== author);
          
          if (hasOthersNewMessages) {
            setHasUnread(true);
          }
       }
    }
  }, [messagesPaginated, lastSeenMessageId, author]);

  // When quick actions open, make sure we stay at the bottom
  useEffect(() => {
    if (isQuickActionsOpen) {
       setTimeout(scrollToBottomContext, 200); // Wait for CSS transition
    }
  }, [isQuickActionsOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessageText.trim()) return;

    const messageToSend = newMessageText;
    setNewMessageText(""); 

    await sendMessage({ 
      text: messageToSend, 
      author, 
      authorImage,
      teamId
    });
    setTimeout(scrollToBottomContext, 50);
  };

  const handleSendPoll = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanOptions = pollOptions.filter(opt => opt.trim() !== "");
    if (!pollQuestion.trim() || cleanOptions.length < 2) return;

    await sendMessage({
      author,
      authorImage,
      teamId,
      text: "Poslal/a je anketo.",
      type: "poll",
      pollData: {
        question: pollQuestion,
        options: cleanOptions.map((opt, i) => ({
          id: `opt-${Date.now()}-${i}`,
          text: opt,
          votes: []
        }))
      }
    });

    setPollQuestion("");
    setPollOptions(["", ""]);
    setIsQuickActionsOpen(false);
    setTimeout(scrollToBottomContext, 50);
  };

  const handleSendLocation = async () => {
    if (!navigator.geolocation) {
      alert("Geolokacija ni podprta v vašem brskalniku.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await sendMessage({
          author,
          authorImage,
          teamId,
          text: "Poslal/a je lokacijo.",
          type: "location",
          locationData: { lat: latitude, lng: longitude }
        });
        setIsQuickActionsOpen(false);
        setTimeout(scrollToBottomContext, 50);
      },
      (error) => {
        alert("Ne morem dobiti lokacije. Preverite pravice za dostop.");
        console.error(error);
      }
    );
  };

  const formatRelativeTime = (timestampMs: number) => {
    if (currentTime === 0) return ""; 
    const diffInSeconds = Math.round((currentTime - timestampMs) / 1000);
    const diffInMinutes = Math.round(diffInSeconds / 60);
    const diffInHours = Math.round(diffInMinutes / 60);

    if (Math.abs(diffInSeconds) < 60) return "pravkar";
    if (Math.abs(diffInMinutes) < 60) return `pred ${Math.abs(diffInMinutes)} min`;
    if (Math.abs(diffInHours) < 24) return `pred ${Math.abs(diffInHours)} h`;

    return new Intl.DateTimeFormat("sl-SI", { hour: "2-digit", minute: "2-digit" }).format(timestampMs);
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
    ) return "DANES";

    if (
      messageDate.getDate() === yesterday.getDate() &&
      messageDate.getMonth() === yesterday.getMonth() &&
      messageDate.getFullYear() === yesterday.getFullYear()
    ) return "VČERAJ";

    return new Intl.DateTimeFormat("sl-SI", { day: "numeric", month: "long", year: "numeric" }).format(messageDate).toUpperCase();
  };

  const handleReaction = async (messageId: Id<"messages">, emoji: string) => {
    await toggleReaction({ messageId, emoji, author });
    setActiveReactionMessageId(null);
  };

  const handleDeleteMessage = async (messageId: Id<"messages">) => {
    if (window.confirm("Res želite izbrisati to sporočilo?")) {
      await deleteMessage({ messageId });
      setActiveReactionMessageId(null);
    }
  };

  if (isLoading || !isAuthenticated || (currentUser !== undefined && !currentUser?.isProfileComplete) || currentTeam === undefined || messages === undefined) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-[#F4F6F8]">
        <div className="animate-pulse flex space-x-3 items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[#5BA582]/40"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#5BA582]/70 animate-[pulse_1s_ease-in-out_infinite_200ms]"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#5BA582] animate-[pulse_1s_ease-in-out_infinite_400ms]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[100dvh] bg-[#F4F6F8] text-[#444] font-sans overflow-hidden">
      <Header />
      <div className="h-[100px] md:h-[60px] shrink-0" />

      {/* Main Chat Area */}
      <div className="flex flex-1 overflow-hidden relative flex-col w-full h-full">
        {/* Active Chat Header */}
        <div className="absolute top-0 left-0 right-0 h-14 bg-white/80 backdrop-blur-md border-b border-gray-100 z-20 flex items-center shadow-sm w-full">
          <div className="max-w-6xl mx-auto w-full px-4 md:px-6 flex items-center">
            <button onClick={() => router.push('/chat')} className="mr-3 text-gray-500 hover:bg-gray-100 p-1.5 rounded-full transition-colors flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            {currentTeam?.image && (
              <img src={currentTeam.image} className="w-8 h-8 rounded-full object-cover mr-2 flex-shrink-0 border border-gray-200" alt={currentTeam?.name} />
            )}
            <div className="flex flex-col cursor-pointer truncate" onClick={() => setIsParticipantsModalOpen(true)}>
              <span className="font-bold text-gray-800 tracking-wide text-[15px] leading-tight truncate" style={{fontFamily: 'var(--font-montserrat)'}}>
                {currentTeam?.name || "Ekipa"}
              </span>
              <span className="text-[10px] text-gray-400 font-medium leading-tight">Dotakni se za udeležence</span>
            </div>
          </div>
        </div>
        
        {/* Pinned Message Sticky Bar */}
        {pinnedMessage && (
          <div className="absolute top-14 left-0 right-0 bg-white/95 backdrop-blur-md border-b border-gray-200 z-10 w-full shadow-sm cursor-pointer hover:bg-white transition-colors"
               onClick={() => {
                 // smooth scroll to the pinned message if it's already rendered
                 const target = document.getElementById(`msg-${pinnedMessage._id}`);
                 if (target) {
                   target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                   target.classList.add('ring-2', 'ring-[#dba032]', 'animate-pulse');
                   setTimeout(() => target.classList.remove('ring-2', 'ring-[#dba032]', 'animate-pulse'), 1500);
                 }
               }}
          >
            <div className="max-w-6xl mx-auto w-full px-5 py-2 flex items-center justify-between space-x-3">
              <div className="flex items-center space-x-3 truncate">
                <div className="text-[10px] bg-[#dba032]/10 text-[#dba032] font-bold px-2 py-1 rounded inline-flex items-center shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path d="M9.813 5.146a.5.5 0 01.708 0l3.333 3.333a.5.5 0 010 .708L10.5 12.541V16.5a.5.5 0 01-1 0v-3.959L6.146 9.187a.5.5 0 010-.708l3.333-3.333a.5.5 0 01.334-.146z" /></svg>
                </div>
                <div className="flex flex-col truncate">
                   <div className="text-[10px] font-bold text-gray-500 uppercase">{pinnedMessage.author}</div>
                   <div className="text-xs text-gray-700 truncate font-semibold">
                      {pinnedMessage.type === 'poll' ? `Anketa: ${pinnedMessage.pollData?.question}` : 
                       pinnedMessage.type === 'location' ? 'Deli lokacijo' : 
                       pinnedMessage.text}
                   </div>
                </div>
              </div>
              <button onClick={(e) => { e.stopPropagation(); togglePin({ messageId: pinnedMessage._id }); }} className="text-gray-400 hover:text-gray-700 shrink-0 p-1">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        <main 
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className={`flex-1 overflow-y-auto space-y-5 relative bg-[#F4F6F8] ${pinnedMessage ? 'pt-28' : 'pt-14'} pb-4 flex flex-col`}
        >
          <div className="max-w-6xl mx-auto w-full px-4 md:px-6 flex flex-col space-y-4 pt-4 mt-auto">
          {messagesPaginated?.isDone === false && messages.length > 0 && (
             <div className="flex justify-center my-2 text-xs text-gray-400 animate-pulse">Nalagam starejša sporočila...</div>
          )}
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center space-y-4 text-center text-gray-400 h-full min-h-[50vh] animate-in fade-in duration-500">
               <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                 <span className="text-5xl">👋</span>
               </div>
               <h3 className="font-bold text-gray-700 text-lg">Tukaj je še čisto tiho...</h3>
               <p className="text-sm max-w-xs">Bodi prvi in pošlji sporočilo, fotografijo ali anketo vaši ekipi!</p>
            </div>
          )}
          {messages.length > 0 && messages.slice().reverse().map((msg, index, arr) => {
            const isMe = msg.author === author;
            const isPinned = msg.isPinned;
            
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
            
            // Collect reactions
            const reactionEntries = Object.entries(msg.reactions || {});

            return (
              <div key={msg._id} id={`msg-${msg._id}`} className="flex flex-col space-y-2 relative" onClick={() => activeReactionMessageId === msg._id && setActiveReactionMessageId(null)}>
                {showDateSeparator && (
                  <div className="flex justify-center mt-2 mb-4">
                    <span className="bg-gray-200/60 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                      {dateLabel}
                    </span>
                  </div>
                )}
                

                <div className={`flex ${isMe ? "justify-end" : "justify-start"} items-end space-x-2 animate-in fade-in slide-in-from-bottom-2 duration-300 w-full mb-2`}>
                  {!isMe && (
                    <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center shadow-sm border border-gray-300 overflow-hidden mb-5">
                      {msg.authorImage ? (
                        <img src={msg.authorImage} alt={msg.author} className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-5 h-5 text-gray-400 mt-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                      )}
                    </div>
                  )}

                  <div 
                     className={`flex flex-col relative max-w-[85%] md:max-w-[75%] ${isMe ? "items-end" : "items-start"}`}
                     onContextMenu={(e) => { e.preventDefault(); setActiveReactionMessageId(msg._id); }}
                     onClick={() => activeReactionMessageId !== msg._id && setActiveReactionMessageId(msg._id)}
                  >
                    {!isMe && (
                      <span className="text-[11px] text-gray-500 font-bold mb-1 ml-1 tracking-wide">
                        {msg.author.split(' ')[0]} {/* Shorter, more visible names */}
                      </span>
                    )}

                    {/* Reaction Popup */}
                    {activeReactionMessageId === msg._id && (
                       <div className={`absolute z-30 -top-12 ${isMe ? 'right-0' : 'left-0'} bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] rounded-full px-2 py-1.5 flex items-center space-x-1 animate-in zoom-in-95 border border-gray-100`}>
                          {["👍", "❤️", "😂", "😮", "😢", "😡"].map(emoji => (
                             <button key={emoji} onClick={(e) => { e.stopPropagation(); handleReaction(msg._id, emoji); }} className="text-xl hover:scale-125 transition-transform px-1 cursor-pointer">{emoji}</button>
                          ))}
                          <button onClick={(e) => { e.stopPropagation(); togglePin({ messageId: msg._id }); setActiveReactionMessageId(null); }} className={`text-gray-400 hover:text-gray-600 px-2 border-l border-gray-100 ${isMe ? '' : 'pr-1'}`}>📌</button>
                          {isMe && (
                             <button onClick={(e) => { e.stopPropagation(); handleDeleteMessage(msg._id); }} className="text-red-400 hover:text-red-600 pl-2 border-l border-gray-100">🗑️</button>
                          )}
                       </div>
                    )}

                    {/* Rich Message: Location */}
                    {msg.type === "location" && msg.locationData ? (
                      <div className={`p-2 shadow-sm border border-gray-100/50 ${isMe ? "bg-[#5BA582] rounded-2xl rounded-br-sm" : "bg-white rounded-2xl rounded-bl-sm"} ${isPinned ? 'ring-2 ring-[#dba032]' : ''}`}>
                         {/* Location embedded maps ... omitted for brevity in preview, handled by links */}
                         <div className="rounded-xl overflow-hidden bg-gray-100 relative w-[220px] h-[140px] flex items-center justify-center cursor-pointer" onClick={(e) => { e.stopPropagation(); window.open(`https://www.google.com/maps?q=${msg.locationData?.lat},${msg.locationData?.lng}`, '_blank'); }}>
                            <span className="text-3xl mb-2">🗺️</span>
                            <span className="text-xs font-bold text-[#5BA582] text-center px-2">Odpri Lokacijo</span>
                         </div>
                      </div>
                    ) : msg.type === "poll" && msg.pollData ? (
                      /* Rich Message: Poll (Compact) */
                      <div className={`w-[240px] md:w-[280px] p-4 shadow-sm border ${isMe ? "bg-[#ebf4ef] border-[#5BA582]/20 rounded-2xl rounded-br-sm" : "bg-white border-gray-100 rounded-2xl rounded-bl-sm"} ${isPinned ? 'ring-2 ring-[#dba032]' : ''}`}>
                         <h4 className="font-bold text-gray-800 text-[14px] leading-tight mb-3 flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#ECA245] mr-1.5 flex-shrink-0"><path fillRule="evenodd" d="M3 2.25a.75.75 0 0 1 .75.75v16.5h17.25a.75.75 0 0 1 0 1.5H3.75A1.5 1.5 0 0 1 2.25 19.5V3a.75.75 0 0 1 .75-.75Zm6.75 14.25a.75.75 0 0 1 .75-.75h11.25a.75.75 0 0 1 0 1.5H10.5a.75.75 0 0 1-.75-.75Zm0-4.5a.75.75 0 0 1 .75-.75h11.25a.75.75 0 0 1 0 1.5H10.5a.75.75 0 0 1-.75-.75Zm0-4.5a.75.75 0 0 1 .75-.75h11.25a.75.75 0 0 1 0 1.5H10.5a.75.75 0 0 1-.75-.75Z" clipRule="evenodd"/></svg>
                            <span>{msg.pollData.question}</span>
                         </h4>
                         <div className="flex flex-col space-y-2">
                            {msg.pollData.options.map((opt) => {
                               const totalVotes = msg.pollData!.options.reduce((sum, o) => sum + o.votes.length, 0);
                               const percent = totalVotes === 0 ? 0 : Math.round((opt.votes.length / totalVotes) * 100);
                               const hasVoted = opt.votes.includes(author);
                               return (
                                 <button key={opt.id} onClick={(e) => { e.stopPropagation(); votePoll({ messageId: msg._id, optionId: opt.id, author }); }} className={`relative w-full text-left overflow-hidden rounded-lg border transition-all active:scale-95 ${hasVoted ? "border-[#5BA582] ring-1 ring-[#5BA582]/50" : "border-gray-200 hover:border-[#5BA582]/50"}`}>
                                    <div className={`absolute left-0 top-0 bottom-0 z-0 ${hasVoted ? "bg-[#5BA582]/15" : "bg-gray-100"}`} style={{ width: `${percent}%` }} />
                                    <div className="relative z-10 p-2 flex justify-between items-center text-[12px]">
                                       <span className={`font-semibold truncate pr-2 ${hasVoted ? "text-[#5BA582]" : "text-gray-600"}`}>{opt.text}</span>
                                       <span className="font-bold text-gray-500">{hasVoted ? '✓' : ''} {percent}%</span>
                                    </div>
                                 </button>
                               );
                            })}
                         </div>
                         <div className="mt-2 text-xs text-[#5BA582] font-semibold text-center cursor-pointer hover:underline" onClick={(e) => { e.stopPropagation(); setSelectedPollForDetails(msg.pollData); }}>
                             Ogled glasov ({msg.pollData.options.reduce((sum, o) => sum + o.votes.length, 0)})
                         </div>
                      </div>
                    ) : (
                      /* Standard Text Message */
                      <div className={`px-4 py-2.5 text-sm md:text-[15px] leading-relaxed break-words shadow-sm border border-gray-100/50 ${isMe ? "bg-[#5BA582] text-white font-medium rounded-2xl rounded-br-sm" : "bg-white text-gray-700 rounded-2xl rounded-bl-sm"} ${isPinned ? 'ring-2 ring-[#dba032]' : ''}`}>
                        {msg.text}
                      </div>
                    )}

                    {/* Reactions Display below message */}
                    {msg.reactions && msg.reactions.length > 0 && (
                       <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          {msg.reactions.map((r) => (
                             <button 
                                key={r.emoji} 
                                onClick={(e) => { e.stopPropagation(); handleReaction(msg._id, r.emoji); }}
                                className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full border flex items-center ${r.users.includes(author) ? 'bg-[#5BA582]/10 border-[#5BA582]/30 text-[#5BA582]' : 'bg-white border-gray-200 text-gray-500'}`}
                             >
                                <span className="mr-0.5">{r.emoji}</span>
                                {r.users.length > 1 && <span>{r.users.length}</span>}
                             </button>
                          ))}
                       </div>
                    )}

                    <div className="flex items-center space-x-1 mt-0.5 mx-1">
                      <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">{timeLabel}</span>
                    </div>
                  </div>

                  {/* Avatar for Me */}
                  {isMe && (
                    <div className="w-8 h-8 rounded-full bg-[#5BA582]/20 flex-shrink-0 flex items-center justify-center shadow-sm border border-[#5BA582]/30 overflow-hidden mb-5">
                      {msg.authorImage ? (
                        <img src={msg.authorImage} alt={msg.author} className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-5 h-5 text-[#5BA582] mt-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} className="h-2 shrink-0" />
          </div>
        </main>

        {/* Unread Message Jump Button */}
        {hasUnread && (
          <div className="absolute bottom-[80px] md:bottom-[100px] left-1/2 transform -translate-x-1/2 z-30">
            <button onClick={scrollToBottomContext} className="bg-[#ECA245] hover:bg-[#D99133] text-white font-bold text-xs py-2 px-5 rounded-full shadow-lg border border-[#ECA245] transition-transform animate-bounce flex items-center space-x-2">
              <span>Nova sporočila</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
            </button>
          </div>
        )}

        {/* Modern Mobile-Optimized Input Area */}
        <footer className="bg-white border-t border-gray-200 flex-shrink-0 z-20 w-full mt-auto">
          {/* Quick Actions Panel */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out bg-[#FAFAFA] border-b border-gray-100 ${isQuickActionsOpen ? (quickActionTab === "poll" ? "h-[220px]" : "h-[110px]") : "h-0"}`}>
            <div className="p-3 w-full">
              <div className="max-w-6xl mx-auto w-full">
               <div className="flex w-full mb-2 overflow-x-auto scrollbar-hide space-x-1 bg-gray-200/50 rounded-lg p-0.5">
                  {(["emoji", "text", "poll", "location"] as const).map(tab => (
                     <button key={tab} type="button" onClick={() => setQuickActionTab(tab)} className={`text-[11px] px-3 py-1.5 rounded-md font-semibold ${quickActionTab === tab ? "bg-white text-[#5BA582] shadow-sm transform scale-100" : "text-gray-500 hover:text-[#5BA582]"}`}>
                        {tab === 'emoji' ? 'Ikone' : tab === 'text' ? 'Tekst' : tab === 'poll' ? 'Anketa' : 'Lokacija'}
                     </button>
                  ))}
               </div>

               <div className={`flex w-full overflow-x-auto scrollbar-hide ${quickActionTab === "poll" ? "h-[160px]" : "h-[60px]"}`}>
                 {quickActionTab === "emoji" && (
                   <div className="flex items-center space-x-2 my-auto">
                     {['🟨', '🟥', '🍻', '⚽', '⏱️'].map(emoji => (
                        <button key={emoji} type="button" onClick={() => setNewMessageText(prev => prev + emoji + " ")} className="w-12 h-12 flex items-center justify-center text-xl hover:scale-105 active:scale-95 bg-white rounded-xl shadow-sm border border-gray-100">{emoji}</button>
                     ))}
                   </div>
                 )}
                 {quickActionTab === "text" && (
                   <div className="flex items-center space-x-2 my-auto h-full pb-2">
                     {["Danes si bil zanič! 👎", "Dobra igra! 👏", "Častiš pivo! 🍻", "Spet zamujaš! ⏳"].map(txt => (
                        <button key={txt} type="button" onClick={() => setNewMessageText(txt)} className="text-xs font-medium bg-white text-gray-700 px-4 py-2.5 rounded-full whitespace-nowrap border border-gray-200 shadow-sm active:scale-95 h-fit">{txt}</button>
                     ))}
                   </div>
                 )}
                 {quickActionTab === "poll" && (
                   <form className="flex flex-col w-full space-y-2 h-full overflow-y-auto pr-2 pb-2" onSubmit={handleSendPoll}>
                     <input type="text" placeholder="Vprašanje ankete..." value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} className="w-full text-sm py-2 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5BA582] bg-white" />
                     <div className="grid grid-cols-2 gap-2">
                       {pollOptions.map((opt, i) => (
                         <input key={i} type="text" placeholder={`Opcija ${i + 1}`} value={opt} onChange={e => { const newOpts = [...pollOptions]; newOpts[i] = e.target.value; setPollOptions(newOpts); }} className="w-full text-xs py-1.5 px-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#5BA582] bg-white" />
                       ))}
                     </div>
                     <div className="flex justify-between items-center mt-1">
                       <button type="button" onClick={() => setPollOptions([...pollOptions, ""])} disabled={pollOptions.length >= 4} className="text-xs text-[#5BA582] font-semibold hover:underline">+ Dodaj opcijo</button>
                       <button type="submit" disabled={!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2} className="bg-[#5BA582] text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-sm disabled:opacity-50">Objavi Anketo</button>
                     </div>
                   </form>
                 )}
                 {quickActionTab === "location" && (
                   <div className="flex items-center justify-center w-full h-full">
                     <button type="button" onClick={handleSendLocation} className="flex items-center justify-center w-full max-w-sm border border-dashed border-[#5BA582] rounded-xl py-2 space-x-2 text-[#5BA582] font-bold text-xs"><span className="text-lg">📍</span> <span>Deli trenutno lokacijo</span></button>
                   </div>
                 )}
               </div>
              </div>
            </div>
          </div>

          <div className="p-2 md:p-4 w-full">
             <form onSubmit={handleSendMessage} className="flex items-center w-full max-w-6xl mx-auto gap-2 relative">
                <button type="button" onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)} className={`p-2 rounded-full transition-colors flex-shrink-0 ${isQuickActionsOpen ? "bg-gray-100 text-[#5BA582]" : "text-gray-400 hover:text-[#5BA582]"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-6 h-6 transition-transform ${isQuickActionsOpen ? "rotate-45" : ""}`}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                </button>
                <input type="text" className="flex-1 bg-gray-50 text-gray-800 font-medium rounded-2xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#5BA582]/30 border border-gray-200 text-sm shadow-inner" placeholder={t.send + "..."} value={newMessageText} onChange={e => setNewMessageText(e.target.value)} />
                <button type="submit" disabled={!newMessageText.trim()} className="bg-[#5BA582] text-white rounded-2xl w-10 h-10 transition-all disabled:opacity-40 flex-shrink-0 shadow-md flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 -rotate-45 relative -left-0.5 -top-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
             </form>
          </div>
        </footer>
      </div>

      {/* Participants Modal */}
      {isParticipantsModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:w-[400px] max-h-[85vh] flex flex-col shadow-xl animate-in slide-in-from-bottom-5 sm:slide-in-from-bottom-0 sm:zoom-in-95">
             <div className="flex justify-between items-center p-4 border-b border-gray-100">
               <h3 className="font-bold text-gray-800 text-lg" style={{fontFamily: 'var(--font-montserrat)'}}>Udeleženci klepeta</h3>
               <button onClick={() => setIsParticipantsModalOpen(false)} className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-full transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
             </div>
             <div className="overflow-y-auto p-4 flex-1 space-y-3">
               {participantsList === undefined ? (
                  <div className="flex justify-center p-8"><div className="w-5 h-5 border-2 border-[#5BA582] border-t-white rounded-full animate-spin"></div></div>
               ) : !participantsList || participantsList.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm">Ni udeležencev.</p>
               ) : (
                  participantsList.map(p => {
                     // Check presence
                     const isOnline = p.lastSeen && (Date.now() - p.lastSeen < 300000); // 5 minutes
                     return (
                       <div key={p._id} className="flex items-center space-x-3 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100/50">
                          <div className="relative w-10 h-10 shrink-0">
                             {p.image ? (
                                <img src={p.image} className="w-full h-full object-cover rounded-full border border-gray-200" alt={p.name} />
                             ) : (
                                <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-bold text-sm">
                                   {p.name.substring(0, 2).toUpperCase()}
                                </div>
                             )}
                             {isOnline && (
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                             )}
                          </div>
                          <div className="flex flex-col flex-1 truncate">
                             <div className="flex items-center space-x-2">
                                <span className="font-bold text-gray-800 text-sm truncate">{p.name}</span>
                                {p.role === "admin" && <span className="text-[9px] font-bold tracking-wider text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded uppercase">Admin</span>}
                             </div>
                             <span className="text-xs text-gray-400">{isOnline ? 'Prisoten/a nedavno' : 'Nedosegljiv/a'}</span>
                          </div>
                       </div>
                     );
                  })
               )}
             </div>
          </div>
        </div>
      )}

      {/* Poll Details Modal */}
      {selectedPollForDetails && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:w-[400px] max-h-[85vh] flex flex-col shadow-xl animate-in slide-in-from-bottom-5 sm:slide-in-from-bottom-0 sm:zoom-in-95">
             <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/80 rounded-t-2xl">
               <div className="flex flex-col pr-4">
                 <h3 className="font-bold text-gray-800 text-sm md:text-base leading-tight">📊 {selectedPollForDetails.question}</h3>
                 <span className="text-xs text-[#5BA582] font-semibold mt-1">
                   Skupaj glasov: {selectedPollForDetails.options.reduce((sum: number, o: any) => sum + o.votes.length, 0)}
                 </span>
               </div>
               <button onClick={() => setSelectedPollForDetails(null)} className="text-gray-400 hover:bg-gray-200 bg-white shadow-sm p-1.5 rounded-full transition-colors shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
             </div>
             <div className="overflow-y-auto p-4 flex-1 space-y-5">
               {selectedPollForDetails.options.map((opt: any) => (
                 <div key={opt.id} className="flex flex-col">
                    <div className="flex justify-between items-center mb-2 pb-1 border-b border-gray-100">
                      <span className="font-bold text-gray-700 text-sm">{opt.text}</span>
                      <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-0.5 rounded-full">{opt.votes.length} glasov</span>
                    </div>
                    {opt.votes.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                         {opt.votes.map((voter: string, idx: number) => (
                            <span key={idx} className="bg-[#ebf4ef] text-[#5BA582] text-xs font-semibold px-2.5 py-1 rounded-md border border-[#5BA582]/20 shadow-sm">
                               {voter}
                            </span>
                         ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">Ni glasov.</span>
                    )}
                 </div>
               ))}
             </div>
          </div>
        </div>
      )}

    </div>
  );
}
