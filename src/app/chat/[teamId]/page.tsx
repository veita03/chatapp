"use client";

import { useQuery, useMutation, usePaginatedQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useState, useRef, useEffect, useLayoutEffect, useMemo } from "react";
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
  const markTeamRead = useMutation(api.teams.markTeamRead);
  const createEvent = useMutation(api.events.createEvent);

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
  
  const [quickActionTab, setQuickActionTab] = useState<"emoji" | "text" | "poll" | "location" | "event">("emoji");
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  
  // Poll state
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState<string[]>(["", ""]);

  // Event state
  const [eventTitle, setEventTitle] = useState("");
  const [eventDate, setEventDate] = useState("");

  // Mention state
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionIndex, setMentionIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatGlasovi = (count: number) => {
    const absCount = Math.abs(count);
    const mod100 = absCount % 100;
    if (mod100 === 1) return `${count} glas`;
    if (mod100 === 2) return `${count} glasa`;
    if (mod100 === 3 || mod100 === 4) return `${count} glasovi`;
    return `${count} glasov`;
  };

  const renderMessageText = (text: string, isMe: boolean, participantsList: any[] | undefined) => {
    if (!text) return null;
    if (!participantsList) return <span>{text}</span>;

    // Collect all possible mention targets ("Vsi" + actual member names)
    // Sort by length descending so longer names match first (e.g. "John Doe" before "John")
    const names = ["Vsi", ...participantsList.map(p => p.name)]
       .filter(Boolean)
       .map(name => name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')) // escape regex chars
       .sort((a, b) => b.length - a.length);

    if (names.length === 0) return <span>{text}</span>;

    // Create a regex that looks for @ followed by any of the known exact names
    const mentionRegex = new RegExp(`(@(?:${names.join('|')}))`, 'gi');
    
    // Split text using the capturing group so the mentions are kept as separate items in the array
    const parts = text.split(mentionRegex);

    return parts.map((part, i) => {
      // Check if this part matches one of our known names (case insensitive)
      const isMention = part.startsWith('@') && names.some(n => new RegExp(`^@${n}$`, 'i').test(part));
      
      if (isMention) {
        return (
          <span key={i} className={`inline-block px-1 rounded-md font-bold ${isMe ? "bg-white/25 text-white shadow-sm" : "bg-[#5BA582]/15 text-[#5BA582] shadow-sm"}`}>
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  const mentionedUsers = useMemo(() => {
    if (mentionQuery === null || !participantsList) return [];
    const q = mentionQuery.toLowerCase();
    const allOpt = { _id: "all", name: "vsi", image: undefined }; // lowercased for display logic later if needed
    const filtered = participantsList.filter(p => p.name.toLowerCase().includes(q));
    if ("vsi".includes(q) || "all".includes(q)) {
      return [allOpt, ...filtered].slice(0, 5); // limit to top 5
    }
    return filtered.slice(0, 5);
  }, [mentionQuery, participantsList]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setNewMessageText(val);

    const cursorPos = e.target.selectionStart || 0;
    const textBeforeCursor = val.slice(0, cursorPos);
    // Match @ at start of string OR @ after a space
    const match = textBeforeCursor.match(/(?:^|\s)@(\S*)$/);
    
    if (match) {
      setMentionQuery(match[1]);
      setMentionIndex(0);
    } else {
      setMentionQuery(null);
    }
  };

  const handleMentionSelect = (user: any) => {
    if (!inputRef.current) return;
    const cursorPos = inputRef.current.selectionStart || 0;
    const textBeforeCursor = newMessageText.slice(0, cursorPos);
    const textAfterCursor = newMessageText.slice(cursorPos);
    
    const match = textBeforeCursor.match(/(?:^|\s)@(\S*)$/);
    if (match) {
      const matchText = match[0];
      const startIdx = textBeforeCursor.length - matchText.length;
      // if match text starts with space, keep the space
      const prefix = matchText.startsWith(' ') ? ' ' : '';
      const newText = newMessageText.slice(0, startIdx) + prefix + `@${user.name === "vsi" ? "Vsi" : user.name} ` + textAfterCursor;
      setNewMessageText(newText);
      setMentionQuery(null);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  };

  // Pagination & Messages
  const { results, status, loadMore } = usePaginatedQuery(
    api.messages.get,
    { teamId },
    { initialNumItems: 30 }
  );
  const messages = results;

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLElement>(null);
  const prevScrollHeightRef = useRef<number>(0);
  const prevMessagesLengthRef = useRef<number>(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [initialReadTime, setInitialReadTime] = useState<number | null>(null);
  const [jumpedToUnread, setJumpedToUnread] = useState(false);
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Active message for reactions long-press/click
  const [activeReactionMessageId, setActiveReactionMessageId] = useState<Id<"messages"> | null>(null);

  // Capture the very first read time payload from DB before it gets overwritten by markTeamRead
  useEffect(() => {
    if (currentTeam && initialReadTime === null) {
      setInitialReadTime((currentTeam as any).lastReadTime || 0);
    }
  }, [currentTeam, initialReadTime]);

  // Jump to First Unread or Bottom
  useEffect(() => {
    if (messages && messages.length > 0 && initialReadTime !== null && !jumpedToUnread) {
      const unreadTimestamp = initialReadTime;
      
      const unreadMessagesCount = messages.filter(m => m._creationTime > unreadTimestamp).length;
      
      if (unreadMessagesCount > 0 && unreadTimestamp > 0) {
        setUnreadCount(unreadMessagesCount);
        
        // Find the last READ message to anchor the scroll so new messages are immediately below view
        let lastReadMsgId = null;
        for (let i = 0; i < messages.length; i++) {
           if (messages[i]._creationTime <= unreadTimestamp) {
              lastReadMsgId = messages[i]._id;
              break;
           }
        }
        
        if (lastReadMsgId) {
          setTimeout(() => {
             const el = document.getElementById(`msg-${lastReadMsgId}`);
             if (el) {
                // Ensure it scrolls so it is at the VERY BOTTOM of the visible area
                el.scrollIntoView({ behavior: "auto", block: "end" });
             }
          }, 100);
        } else {
           // If no read messages exist, jump to the top (oldest message loaded)
           setTimeout(() => {
             scrollContainerRef.current?.scrollTo({ top: 0, behavior: "auto" });
           }, 100);
        }
      } else {
         messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
      }
      setJumpedToUnread(true);
    }
  }, [messages, initialReadTime, jumpedToUnread]);

  useLayoutEffect(() => {
    if (messages) {
      if (
        messages.length > prevMessagesLengthRef.current && 
        prevScrollHeightRef.current > 0
      ) {
        const container = scrollContainerRef.current;
        if (container) {
          const diff = container.scrollHeight - prevScrollHeightRef.current;
          // Adjust scroll if we were at the top grabbing history safely
          if (container.scrollTop < 50) {
             container.scrollTop = container.scrollTop + diff;
          }
        }
      }
      prevMessagesLengthRef.current = messages.length;
      if (status !== "LoadingMore") {
         prevScrollHeightRef.current = 0; // reset
      }
    }
  }, [messages, status]);

  // Mark Team as Read dynamically
  useEffect(() => {
     if (isAuthenticated && teamId && messages) {
        markTeamRead({ teamId });
     }
  }, [isAuthenticated, teamId, messages?.length]);

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
    if (container.scrollTop < 10 && status === "CanLoadMore") {
       prevScrollHeightRef.current = container.scrollHeight;
       loadMore(30);
    }

    const isScrolledToBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight < 50;

    if (isScrolledToBottom) {
      setUnreadCount(0);
    } else if (unreadCount > 0 && messages && initialReadTime !== null) {
      // Dynamically calculate how many unread messages are still BELOW the visible area
      const visibleBottomLine = container.scrollTop + container.clientHeight;
      
      let countBelow = 0;
      for (const msg of messages) {
         if (msg._creationTime > initialReadTime) {
            const el = document.getElementById(`msg-${msg._id}`);
            if (el) {
               // If the element's top edge is below the container's visible window
               if (el.offsetTop > visibleBottomLine) {
                  countBelow++;
               }
            }
         }
      }
      // Only ever decrease the count via natural scrolling
      setUnreadCount(prev => Math.min(prev, countBelow));
    }
  };

  const scrollToBottomContext = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setUnreadCount(0);
  };

  const lastKnownMessageTime = useRef<number>(0);

  useEffect(() => {
    if (messages && messages.length > 0) {
      const latestMsg = messages[0];
      
      if (lastKnownMessageTime.current > 0 && latestMsg._creationTime > lastKnownMessageTime.current) {
        // A new message arrived while the chat was already initialized!
        if (latestMsg.author !== author) {
           const container = scrollContainerRef.current;
           const isNearBottom = container && (container.scrollHeight - container.scrollTop - container.clientHeight < 150);
           
           if (!isNearBottom) {
             setUnreadCount(prev => prev + 1);
           } else {
             setTimeout(scrollToBottomContext, 100);
           }
        } else {
           // I sent it, always scroll
           setTimeout(scrollToBottomContext, 100);
        }
      }
      lastKnownMessageTime.current = Math.max(lastKnownMessageTime.current, latestMsg._creationTime);
    }
  }, [messages, author]);
  // When quick actions open, make sure we stay at the bottom
  useEffect(() => {
    if (isQuickActionsOpen) {
       setTimeout(scrollToBottomContext, 200); // Wait for CSS transition
    }
  }, [isQuickActionsOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If mention popup is open and user presses enter, prevent send and instead select the mention
    if (mentionQuery !== null && mentionedUsers.length > 0) {
       handleMentionSelect(mentionedUsers[mentionIndex]);
       return;
    }

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

  const handleSendEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDate) return;

    try {
       // We know currentTeam has an active season since chat operates inside a team context mapping 1:1 to teams right now.
       // We'll just fetch seasons or assume the frontend doesn't know seasonId natively yet.
       // Actually, we must query the active season for this team to pass to createEvent. 
       // For now, let's fetch it inline or we'll add it to the team query payload.
       // Wait, getTeam query doesn't return seasonId. I'll modify the backend mutation to fetch the active season automatically if none provided, or I can just mock it here and fix backend next. Let's fix backend to auto-find season.
       // For now, I'll pass a dummy string and let backend handle the actual lookup.
       
       const parsedDate = new Date(eventDate).getTime();
       
       await createEvent({
          teamId,
          title: eventTitle.trim(),
          date: parsedDate,
       });

       setEventTitle("");
       setEventDate("");
       setIsQuickActionsOpen(false);
       setTimeout(scrollToBottomContext, 50);
    } catch (err: any) {
       alert(err.message || "Napaka pri ustvarjanju dogodka.");
    }
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

      {/* Main Chat Area Wrapper */}
      <div className="flex flex-1 overflow-hidden relative flex-col w-full h-full max-w-6xl mx-auto sm:px-8 sm:py-6">
        {/* Desktop Card / Mobile Full Screen */}
        <div className="flex-1 flex flex-col relative w-full h-full bg-white sm:rounded-2xl sm:shadow-[0_2px_15px_-3px_rgba(0,0,0,0.07),0_10px_20px_-2px_rgba(0,0,0,0.04)] sm:border sm:border-gray-100/50 overflow-hidden">
        
          {/* Active Chat Header */}
          <div className="h-14 bg-white border-b border-gray-100 z-20 flex items-center w-full px-4 md:px-6 shrink-0 relative shadow-sm">
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
        
        {/* Pinned Message Sticky Bar */}
        {pinnedMessage && (
          <div className="bg-white/95 backdrop-blur-md border-b border-gray-200 z-10 w-full shadow-sm cursor-pointer hover:bg-white transition-colors shrink-0"
               onClick={() => {
                 // smooth scroll to the pinned message if it's already rendered
                 const target = document.getElementById(`msg-${pinnedMessage._id}`);
                 if (target) {
                   target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                   target.style.transition = 'opacity 0.3s ease-in-out, transform 0.3s ease';
                   target.classList.add('opacity-50', 'scale-[0.98]');
                   setTimeout(() => {
                      target.classList.remove('opacity-50', 'scale-[0.98]');
                   }, 300);
                 }
               }}
          >
            <div className="w-full px-5 py-2 flex items-center justify-between space-x-3">
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
          onClick={() => { if(activeReactionMessageId) setActiveReactionMessageId(null); }}
          className="flex-1 overflow-y-auto space-y-5 relative bg-[#FAFAFA] flex flex-col"
        >
          <div className="w-full px-4 md:px-6 flex flex-col space-y-4 pt-4 mt-auto">
          {status === "LoadingMore" && (
             <div className="flex justify-center my-2 text-xs text-gray-400 animate-pulse">Nalagam starejša sporočila...</div>
          )}
          {messages.length === 0 && status !== "LoadingFirstPage" && (
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
                     className={`group/msg flex flex-col relative max-w-[85%] md:max-w-[75%] ${isMe ? "items-end" : "items-start"}`}
                     onContextMenu={(e) => { e.preventDefault(); setActiveReactionMessageId(msg._id); }}
                  >
                    {!isMe && (
                       <span className="text-[11px] text-gray-500 font-bold mb-1 ml-1 tracking-wide">
                          {msg.author.split(' ')[0]} {/* Shorter, more visible names */}
                       </span>
                    )}
                    
                    {/* Inner wrapper specifically for the bubble to perfectly center the heart icon */}
                    <div className="relative flex items-center group/bubble">
                        {/* Quick Action Button for OTHERS (renders on the left of their bubble) */}
                        {!isMe && (() => {
                            const myReactionObj = msg.reactions?.find(r => r.users.includes(author));
                            const myReactionEmoji = myReactionObj ? myReactionObj.emoji : null;
                            
                            return (
                              <div className="absolute top-1/2 -translate-y-1/2 -right-10 opacity-100 z-10 flex items-center justify-center">
                                 <button 
                                    onClick={(e) => { 
                                       e.stopPropagation(); 
                                       handleReaction(msg._id, myReactionEmoji || "❤️"); 
                                    }}
                                    onMouseEnter={() => {
                                       setTimeout(() => { setActiveReactionMessageId(msg._id); }, 300);
                                    }}
                                    className={`relative w-8 h-8 rounded-full border shadow-sm flex items-center justify-center transition-colors text-sm ${myReactionEmoji ? 'bg-[#5BA582]/10 border-[#5BA582]/30 text-[#5BA582]' : 'bg-white border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200'}`}
                                 >
                                    {myReactionEmoji ? myReactionEmoji : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>}
                                 
                                    {/* Reaction Popup Menu for Others */}
                                    {activeReactionMessageId === msg._id && (
                                       <div 
                                          className="absolute z-50 right-0 top-full mt-2 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] rounded-full px-2 py-1.5 flex items-center space-x-1 animate-in zoom-in-95 origin-top-right border border-gray-100 cursor-default"
                                          onClick={(e) => e.stopPropagation()}
                                       >
                                          {(() => {
                                             return ["👍", "❤️", "😂", "😮", "😢", "😡"].map(emoji => (
                                               <div 
                                                  key={emoji} 
                                                  onClick={(e) => { e.stopPropagation(); handleReaction(msg._id, emoji); setActiveReactionMessageId(null); }} 
                                                  className={`text-xl hover:scale-125 transition-all px-1 cursor-pointer rounded-full ${myReactionEmoji === emoji ? 'bg-gray-100 scale-110 shadow-sm' : ''}`}
                                               >
                                                  {emoji}
                                               </div>
                                             ));
                                          })()}
                                          <div onClick={(e) => { e.stopPropagation(); togglePin({ messageId: msg._id }); setActiveReactionMessageId(null); }} className="text-gray-400 hover:text-gray-600 px-2 border-l border-gray-100 pr-1 cursor-pointer">📌</div>
                                       </div>
                                    )}
                                 </button>
                              </div>
                            );
                        })()}

                        {/* Rich Message: Location */}
                        {msg.type === "location" && msg.locationData ? (
                          <div className={`p-1 shadow-sm border ${isPinned ? "bg-[#fef9f0] border-[#dba032]/20 rounded-2xl rounded-br-sm" : isMe ? "bg-[#ebf4ef] border-[#5BA582]/20 rounded-2xl rounded-br-sm" : "bg-white border-gray-100 rounded-2xl rounded-bl-sm"}`}>
                             <div 
                               className="rounded-xl overflow-hidden bg-gray-100 relative w-[240px] h-[160px] cursor-pointer group" 
                               onClick={(e) => { e.stopPropagation(); window.open(`https://www.google.com/maps?q=${msg.locationData?.lat},${msg.locationData?.lng}`, '_blank'); }}
                             >
                                <iframe 
                                   className="w-full h-full pointer-events-none"
                                   src={`https://www.openstreetmap.org/export/embed.html?bbox=${msg.locationData.lng-0.0015}%2C${msg.locationData.lat-0.0015}%2C${msg.locationData.lng+0.0015}%2C${msg.locationData.lat+0.0015}&layer=mapnik&marker=${msg.locationData.lat}%2C${msg.locationData.lng}`}
                                />
                                <div className="absolute inset-0 bg-transparent group-hover:bg-black/5 transition-colors flex flex-col justify-end">
                                  <div className="bg-white/90 backdrop-blur-sm text-xs font-bold text-[#5BA582] text-center py-2 w-full truncate border-t border-gray-100">
                                    Odpri v Google Maps
                                  </div>
                                </div>
                             </div>
                          </div>
                        ) : msg.type === "poll" && msg.pollData ? (
                          /* Rich Message: Poll (Compact) */
                          <div className={`w-[240px] md:w-[280px] p-4 shadow-sm border ${isPinned ? "bg-[#fef9f0] border-[#dba032]/20 rounded-2xl rounded-br-sm" : isMe ? "bg-[#ebf4ef] border-[#5BA582]/20 rounded-2xl rounded-br-sm" : "bg-white border-gray-100 rounded-2xl rounded-bl-sm"}`}>
                             <h4 className="font-bold text-gray-800 text-[14px] leading-tight mb-3 flex items-start">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#ECA245] mr-1.5 flex-shrink-0"><path fillRule="evenodd" d="M3 2.25a.75.75 0 0 1 .75.75v16.5h17.25a.75.75 0 0 1 0 1.5H3.75A1.5 1.5 0 0 1 2.25 19.5V3a.75.75 0 0 1 .75-.75Zm6.75 14.25a.75.75 0 0 1 .75-.75h11.25a.75.75 0 0 1 0 1.5H10.5a.75.75 0 0 1-.75-.75Zm0-4.5a.75.75 0 0 1 .75-.75h11.25a.75.75 0 0 1 0 1.5H10.5a.75.75 0 0 1-.75-.75Zm0-4.5a.75.75 0 0 1 .75-.75h11.25a.75.75 0 0 1 0 1.5H10.5a.75.75 0 0 1-.75-.75Zm0-4.5a.75.75 0 0 1 .75-.75h11.25a.75.75 0 0 1 0 1.5H10.5a.75.75 0 0 1-.75-.75Z" clipRule="evenodd"/></svg>
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
                          <div className={`px-4 py-2.5 text-sm md:text-[15px] leading-relaxed break-words shadow-sm border border-gray-100/50 ${isPinned ? "bg-[#fef9f0] text-gray-800 rounded-2xl rounded-br-sm" : isMe ? "bg-[#5BA582] text-white font-medium rounded-2xl rounded-br-sm" : "bg-white text-gray-700 rounded-2xl rounded-bl-sm"}`}>
                            {renderMessageText(msg.text, isMe, participantsList)}
                          </div>
                        )}

                        {/* Quick Action Button for ME (renders on the left of my bubble) */}
                        {isMe && (() => {
                            const myReactionObj = msg.reactions?.find(r => r.users.includes(author));
                            const myReactionEmoji = myReactionObj ? myReactionObj.emoji : null;
                            
                            return (
                              <div className="absolute top-1/2 -translate-y-1/2 -left-10 opacity-100 z-10 flex items-center justify-center">
                                 <button 
                                    onClick={(e) => { 
                                       e.stopPropagation(); 
                                       handleReaction(msg._id, myReactionEmoji || "❤️"); 
                                    }}
                                    onMouseEnter={() => {
                                       setTimeout(() => { setActiveReactionMessageId(msg._id); }, 300);
                                    }}
                                    className={`relative w-8 h-8 rounded-full border shadow-sm flex items-center justify-center transition-colors text-sm ${myReactionEmoji ? 'bg-[#5BA582]/10 border-[#5BA582]/30 text-[#5BA582]' : 'bg-white border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200'}`}
                                 >
                                    {myReactionEmoji ? myReactionEmoji : <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>}
                                 
                                    {/* Reaction Popup Menu for Me */}
                                    {activeReactionMessageId === msg._id && (
                                       <div 
                                          className="absolute z-50 left-0 top-full mt-2 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.15)] rounded-full px-2 py-1.5 flex items-center space-x-1 animate-in zoom-in-95 origin-top-left border border-gray-100 cursor-default"
                                          onClick={(e) => e.stopPropagation()}
                                       >
                                          {(() => {
                                             return ["👍", "❤️", "😂", "😮", "😢", "😡"].map(emoji => (
                                               <div 
                                                  key={emoji} 
                                                  onClick={(e) => { e.stopPropagation(); handleReaction(msg._id, emoji); setActiveReactionMessageId(null); }} 
                                                  className={`text-xl hover:scale-125 transition-all px-1 cursor-pointer rounded-full ${myReactionEmoji === emoji ? 'bg-gray-100 scale-110 shadow-sm' : ''}`}
                                               >
                                                  {emoji}
                                               </div>
                                             ));
                                          })()}
                                          <div onClick={(e) => { e.stopPropagation(); togglePin({ messageId: msg._id }); setActiveReactionMessageId(null); }} className="text-gray-400 hover:text-gray-600 px-2 border-l border-gray-100 cursor-pointer">📌</div>
                                          <div onClick={(e) => { e.stopPropagation(); handleDeleteMessage(msg._id); setActiveReactionMessageId(null); }} className="text-red-400 hover:text-red-600 pl-2 border-l border-gray-100 cursor-pointer">🗑️</div>
                                       </div>
                                    )}
                                 </button>
                              </div>
                            );
                        })()}
                    </div>

                    {/* Reactions Display below message */}
                    {msg.reactions && msg.reactions.length > 0 && (
                       <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          {msg.reactions.map((r) => (
                             <button 
                                key={r.emoji} 
                                onClick={(e) => { e.stopPropagation(); handleReaction(msg._id, r.emoji); }}
                                className={`group relative text-[10px] font-bold px-1.5 py-0.5 rounded-full border flex items-center ${r.users.includes(author) ? 'bg-[#5BA582]/10 border-[#5BA582]/30 text-[#5BA582]' : 'bg-white border-gray-200 text-gray-500'}`}
                             >
                                <span className="mr-0.5">{r.emoji}</span>
                                {r.users.length > 1 && <span>{r.users.length}</span>}
                                {/* Custom Tooltip for Reaction Users */}
                                <div className="absolute top-full mb-2 hidden group-hover:flex group-active:flex flex-col items-center z-50 mt-1.5 left-1/2 -translate-x-1/2 pointer-events-none">
                                   <div className="bg-white border border-gray-200 text-gray-700 text-[10px] font-semibold px-2.5 py-1.5 rounded-lg shadow-sm whitespace-nowrap">
                                      {r.users.join(', ')}
                                   </div>
                                </div>
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
        {unreadCount > 0 && (
          <div className="absolute bottom-[80px] md:bottom-[100px] left-1/2 transform -translate-x-1/2 z-30">
            <button onClick={scrollToBottomContext} className="bg-[#ECA245] hover:bg-[#D99133] text-white font-bold text-xs py-2 px-5 rounded-full shadow-lg border border-[#ECA245] transition-transform animate-bounce flex items-center space-x-2">
              <span>Nova sporočila ({unreadCount})</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
            </button>
          </div>
        )}

        {/* Modern Mobile-Optimized Input Area */}
        <footer className="bg-white border-t border-gray-100 flex-shrink-0 z-20 w-full mt-auto">
          {/* Quick Actions Panel */}
          <div className={`overflow-hidden transition-all duration-300 ease-in-out bg-[#FAFAFA] border-b border-gray-100 ${isQuickActionsOpen ? (quickActionTab === "poll" ? "h-[220px]" : quickActionTab === "event" ? "h-[180px]" : quickActionTab === "emoji" ? "h-[135px]" : "h-[110px]") : "h-0"}`}>
            <div className="p-3 w-full">
              <div className="w-full">
               <div className="flex w-full mb-3 overflow-x-auto scrollbar-hide space-x-4 border-b border-gray-200 pb-2 px-1">
                   {(["emoji", "text", "event", "poll", "location"] as const).map(tab => (
                     <button key={tab} type="button" onClick={() => setQuickActionTab(tab)} className={`text-[12px] font-bold tracking-wide focus:outline-none transition-all ${quickActionTab === tab ? "text-[#5BA582] border-b-2 border-[#5BA582] pb-[7px] -mb-[9px]" : "text-gray-400 hover:text-gray-600"}`}>
                        {tab === 'emoji' ? 'Emoji' : tab === 'text' ? 'Tekst' : tab === 'event' ? 'Dogodek' : tab === 'poll' ? 'Anketa' : 'Lokacija'}
                     </button>
                  ))}
               </div>

               <div className={`flex w-full overflow-x-auto scrollbar-hide items-center ${quickActionTab === "poll" ? "h-[160px]" : quickActionTab === "event" ? "h-[120px]" : quickActionTab === "emoji" ? "h-[80px]" : "h-[50px] mt-1"}`}>
                 {quickActionTab === "emoji" && (
                   <div className="grid grid-rows-2 grid-flow-col gap-y-2 gap-x-2 w-full px-1 items-center pb-1">
                     {['👍', '👎', '👏', '🙌', '🤝', '⏳', '😂', '😅', '🤣', '🥲', '🤔', '😮', '😡', '🤬', '🤯', '🤢', '😴', '🥳', '🤩', '😎', '🤦', '🤷', '🟨', '🟥', '⚽', '🏀', '🎾', '🏓', '🥊', '🏃', '🚴', '🎽', '⏱️', '🍻', '🏆', '🔥', '💪', '💯', '🎯', '🏁', '🛶', '🎿', '🏒', '🏸', '🏐', '🎱', '🎳', '🏄', '🧗', '🥇'].map(emoji => (
                        <button key={emoji} type="button" onClick={() => setNewMessageText(prev => prev + emoji)} className="w-8 h-8 flex items-center justify-center text-lg hover:scale-110 active:scale-95 bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-gray-100 flex-shrink-0 focus:outline-none transition-transform">{emoji}</button>
                     ))}
                   </div>
                 )}
                 {quickActionTab === "text" && (
                   <div className="flex items-center space-x-2 w-full px-1">
                     {["Danes si bil zanič! 👎", "Dobra igra! 👏", "Častiš pivo! 🍻", "Spet zamujaš! ⏳", "Špilferdeber!", "Kdo ma žogo?", "Spet izgovori...", "Sodnik je kriv! 🙈", "Kje je kondicija? 🥵", "Gremo na polno! 💪", "Rabmo menjavo! 🔄"].map(txt => (
                        <button key={txt} type="button" onClick={() => setNewMessageText(prev => prev + (prev.endsWith(' ') || prev === '' ? '' : ' ') + txt + ' ')} className="text-[13px] font-semibold bg-white text-gray-700 px-4 py-2 rounded-full whitespace-nowrap border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] active:scale-95 h-fit focus:outline-none transition-transform">{txt}</button>
                     ))}
                   </div>
                 )}
                 {quickActionTab === "poll" && (
                   <form className="flex flex-col w-full space-y-3 h-full overflow-y-auto pr-2 pb-2 px-1" onSubmit={handleSendPoll}>
                     <input type="text" placeholder="Kako se glasi vprašanje?..." value={pollQuestion} onChange={e => setPollQuestion(e.target.value)} className="w-full text-[15px] font-semibold py-2 px-0 border-b-2 border-gray-200 focus:border-[#5BA582] rounded-none focus:outline-none bg-transparent placeholder-gray-400 transition-colors" />
                     <div className="grid grid-cols-2 gap-3 mt-2">
                       {pollOptions.map((opt, i) => (
                         <div key={i} className="relative flex items-center">
                            <span className="absolute left-3 text-xs font-bold text-gray-300">{i+1}.</span>
                            <input type="text" placeholder={`Odgovor`} value={opt} onChange={e => { const newOpts = [...pollOptions]; newOpts[i] = e.target.value; setPollOptions(newOpts); }} className="w-full text-sm py-2 pl-8 pr-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5BA582]/20 focus:border-[#5BA582] shadow-sm transition-all" />
                         </div>
                       ))}
                     </div>
                     <div className="flex justify-between items-center mt-2 pt-1">
                       <button type="button" onClick={() => setPollOptions([...pollOptions, ""])} disabled={pollOptions.length >= 4} className="text-xs text-[#5BA582] font-extrabold hover:text-[#4a8a6b] px-2 py-1 transition-colors flex items-center disabled:opacity-30 disabled:cursor-not-allowed">
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                         Dodaj opcijo
                       </button>
                       <button type="submit" disabled={!pollQuestion.trim() || pollOptions.filter(o => o.trim()).length < 2} className="bg-[#5BA582] text-white text-[13px] font-bold px-5 py-2 rounded-full shadow-md disabled:opacity-40 disabled:scale-100 hover:scale-105 active:scale-95 transition-all">Objavi</button>
                     </div>
                   </form>
                 )}
                 {quickActionTab === "event" && (
                   <form className="flex flex-col w-full space-y-3 h-full overflow-visible px-1" onSubmit={handleSendEvent}>
                      <div className="flex items-center space-x-3 w-full">
                         <input type="text" placeholder="Ime dogodka (npr. Trening, Zbor, Liga)" value={eventTitle} onChange={e => setEventTitle(e.target.value)} className="flex-1 w-full text-[15px] font-semibold py-2 px-0 border-b-2 border-gray-200 focus:border-[#5BA582] rounded-none focus:outline-none bg-transparent placeholder-gray-400 transition-colors" />
                      </div>
                      <div className="flex items-center space-x-3 w-full">
                         <input type="datetime-local" value={eventDate} onChange={e => setEventDate(e.target.value)} className="flex-1 text-sm py-2 px-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5BA582]/20 focus:border-[#5BA582] shadow-sm transition-all text-gray-700" />
                         <button type="submit" disabled={!eventTitle.trim() || !eventDate} className="bg-[#5BA582] text-white text-[13px] font-bold px-6 py-2.5 rounded-full shadow-md disabled:opacity-40 disabled:scale-100 hover:scale-105 active:scale-95 transition-all">Ustvari Dogodek</button>
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

          <div className="p-1 pt-2 md:p-4 w-full bg-white relative">
            {/* Mention Autocomplete Dropdown */}
            {mentionQuery !== null && mentionedUsers.length > 0 && (
               <div className="absolute bottom-[105%] left-2 right-2 md:left-4 md:right-4 bg-white rounded-xl shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-gray-100 overflow-hidden z-50 animate-in slide-in-from-bottom-2 fade-in">
                  <ul>
                    {mentionedUsers.map((u, idx) => (
                       <li 
                          key={u._id} 
                          onClick={() => handleMentionSelect(u)}
                          className={`px-4 py-2.5 flex items-center space-x-3 cursor-pointer transition-colors ${idx === mentionIndex ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                       >
                          {u._id === "all" ? (
                             <div className="w-6 h-6 rounded-full bg-[#5BA582]/20 text-[#5BA582] flex items-center justify-center font-bold text-[10px]">VSI</div>
                          ) : (
                             <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                                {u.image ? <img src={u.image} alt={u.name} className="w-full h-full object-cover" /> : <div className="w-full h-full bg-[#5BA582]/20" />}
                             </div>
                          )}
                          <span className="text-sm font-semibold text-gray-800">{u.name === "vsi" ? "Vsi" : u.name}</span>
                       </li>
                    ))}
                  </ul>
               </div>
            )}

            <form onSubmit={handleSendMessage} className="w-full flex items-end bg-transparent gap-1.5 md:gap-2 px-1 md:px-2">
                <button type="button" onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)} className={`p-1.5 md:p-2 rounded-full transition-colors flex-shrink-0 focus:outline-none ${isQuickActionsOpen ? "bg-gray-100 text-[#5BA582]" : "text-gray-400 hover:text-[#5BA582]"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-5 h-5 md:w-6 md:h-6 transition-transform ${isQuickActionsOpen ? "rotate-45" : ""}`}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                </button>
                <input ref={inputRef} onKeyDown={(e) => {
                   if (mentionQuery !== null && mentionedUsers.length > 0) {
                      if (e.key === "ArrowUp") { e.preventDefault(); setMentionIndex(prev => Math.max(0, prev - 1)); }
                      else if (e.key === "ArrowDown") { e.preventDefault(); setMentionIndex(prev => Math.min(mentionedUsers.length - 1, prev + 1)); }
                      else if (e.key === "Tab") { e.preventDefault(); handleMentionSelect(mentionedUsers[mentionIndex]); }
                      else if (e.key === "Escape") { e.preventDefault(); setMentionQuery(null); }
                   }
                }} type="text" className="flex-1 bg-gray-50 text-gray-800 font-medium rounded-[20px] md:rounded-2xl px-3 py-1.5 md:px-4 md:py-2.5 focus:outline-none focus:ring-2 focus:ring-[#5BA582]/30 border border-gray-200 text-[13px] md:text-sm shadow-inner" placeholder={t.send + "..."} value={newMessageText} onChange={handleInputChange} />
                <button type="submit" disabled={!newMessageText.trim()} className="bg-[#5BA582] text-white rounded-full md:rounded-2xl w-8 h-8 md:w-10 md:h-10 mb-0.5 md:mb-0 transition-all disabled:opacity-40 flex-shrink-0 shadow-md flex items-center justify-center focus:outline-none">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5 -rotate-45 relative md:-left-0.5 -top-0.5 md:-top-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
             </form>
          </div>
        </footer>
        </div>
      </div>

      {/* Participants Modal */}
      {isParticipantsModalOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsParticipantsModalOpen(false)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:w-[400px] max-h-[85vh] flex flex-col shadow-xl animate-in slide-in-from-bottom-5 sm:slide-in-from-bottom-0 sm:zoom-in-95" onClick={(e) => e.stopPropagation()}>
             <div className="flex justify-between items-center p-4 border-b border-gray-100">
               <h3 className="font-bold text-gray-800 text-lg" style={{fontFamily: 'var(--font-montserrat)'}}>Udeleženci klepeta</h3>
               <button onClick={() => setIsParticipantsModalOpen(false)} className="text-gray-400 hover:bg-gray-100 p-1.5 rounded-full transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
             </div>
             <div className="overflow-y-auto p-2 flex-1 divide-y divide-gray-100">
               {participantsList === undefined ? (
                  <div className="flex justify-center p-8"><div className="w-5 h-5 border-2 border-[#5BA582] border-t-white rounded-full animate-spin"></div></div>
               ) : !participantsList || participantsList.length === 0 ? (
                  <p className="text-center text-gray-500 text-sm py-4">Ni udeležencev.</p>
               ) : (
                  participantsList.map(p => {
                     // Check presence
                     const isOnline = p.lastSeen && (Date.now() - p.lastSeen < 300000); // 5 minutes
                     return (
                       <div key={p._id} className="flex items-center space-x-3 py-3 px-2 hover:bg-gray-50/50 transition-colors rounded-lg">
                          <div className="relative w-10 h-10 shrink-0">
                             {p.image ? (
                                <img src={p.image} className="w-full h-full object-cover rounded-full border border-gray-200" alt={p.name} />
                             ) : (
                                <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-sm">
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
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setSelectedPollForDetails(null)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:w-[400px] max-h-[85vh] flex flex-col shadow-xl animate-in slide-in-from-bottom-5 sm:slide-in-from-bottom-0 sm:zoom-in-95" onClick={(e) => e.stopPropagation()}>
             <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/80 rounded-t-2xl">
               <div className="flex flex-col pr-4">
                 <h3 className="font-bold text-gray-800 text-sm md:text-base leading-tight flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#ECA245] mr-1.5 flex-shrink-0"><path fillRule="evenodd" d="M3 2.25a.75.75 0 0 1 .75.75v16.5h17.25a.75.75 0 0 1 0 1.5H3.75A1.5 1.5 0 0 1 2.25 19.5V3a.75.75 0 0 1 .75-.75Zm6.75 14.25a.75.75 0 0 1 .75-.75h11.25a.75.75 0 0 1 0 1.5H10.5a.75.75 0 0 1-.75-.75Zm0-4.5a.75.75 0 0 1 .75-.75h11.25a.75.75 0 0 1 0 1.5H10.5a.75.75 0 0 1-.75-.75Zm0-4.5a.75.75 0 0 1 .75-.75h11.25a.75.75 0 0 1 0 1.5H10.5a.75.75 0 0 1-.75-.75Zm0-4.5a.75.75 0 0 1 .75-.75h11.25a.75.75 0 0 1 0 1.5H10.5a.75.75 0 0 1-.75-.75Z" clipRule="evenodd"/></svg>
                    <span>{selectedPollForDetails.question}</span>
                 </h3>
                 <span className="text-xs text-[#5BA582] font-semibold mt-1 ml-6">
                   Skupaj: {formatGlasovi(selectedPollForDetails.options.reduce((sum: number, o: any) => sum + o.votes.length, 0))}
                 </span>
               </div>
               <button onClick={() => setSelectedPollForDetails(null)} className="text-gray-400 hover:bg-gray-200 bg-white shadow-sm p-1.5 rounded-full transition-colors shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
             </div>
             <div className="overflow-y-auto p-4 flex-1 space-y-4">
               {selectedPollForDetails.options.map((opt: any) => (
                 <div key={opt.id} className="flex flex-col">
                    <div className="flex justify-between items-center mb-1 pb-1 border-b border-gray-100/50">
                      <span className="font-bold text-gray-700 text-sm">{opt.text}</span>
                      <span className="bg-gray-100 text-gray-500 text-[11px] font-bold px-2 py-0.5 rounded-full">{formatGlasovi(opt.votes.length)}</span>
                    </div>
                    {opt.votes.length > 0 ? (
                      <div className="flex flex-col divide-y divide-gray-50/50">
                         {opt.votes.map((voterName: string, idx: number) => {
                            const p = participantsList?.find(u => u.name === voterName);
                            return (
                               <div key={idx} className="flex items-center space-x-2 py-2 px-1 hover:bg-gray-50/50 transition-colors rounded-lg">
                                  <div className="w-6 h-6 shrink-0">
                                     {p?.image ? (
                                        <img src={p.image} className="w-full h-full object-cover rounded-full border border-gray-200" alt={voterName} />
                                     ) : (
                                        <div className="w-full h-full bg-[#5BA582]/10 text-[#5BA582] rounded-full flex items-center justify-center font-bold text-[10px]">
                                           {voterName.substring(0, 2).toUpperCase()}
                                        </div>
                                     )}
                                  </div>
                                  <span className="text-sm font-semibold text-gray-800 truncate">{voterName}</span>
                               </div>
                            );
                         })}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic py-1">Ni glasov.</span>
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
