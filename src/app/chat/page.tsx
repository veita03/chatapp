"use client";

import { useQuery } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useEffect } from "react";
import Header from "../../components/Header";
import { useRouter } from 'next/navigation';
import { translations, Language } from "../i18n";
import { useLanguage } from "@/components/LanguageContext";

export default function ChatInboxPage() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const currentUser = useQuery(api.users.current, isAuthenticated ? {} : "skip");
  const userTeams = useQuery(api.teams.getUserTeams);
  const router = useRouter();
  
  const { language: currentLang } = useLanguage();
  const t = (translations as any)[currentLang] || translations["sl"];

  // Authentication check
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    } else if (isAuthenticated && currentUser !== undefined && !currentUser?.isProfileComplete) {
      router.push("/profile");
    }
  }, [isLoading, isAuthenticated, currentUser, router]);

  const formatRelativeTime = (timestampMs: number) => {
    const diffInSeconds = Math.round((Date.now() - timestampMs) / 1000);
    const diffInMinutes = Math.round(diffInSeconds / 60);
    const diffInHours = Math.round(diffInMinutes / 60);

    if (Math.abs(diffInSeconds) < 60) return "pravkar";
    if (Math.abs(diffInMinutes) < 60) return `pred ${Math.abs(diffInMinutes)} min`;
    if (Math.abs(diffInHours) < 24) return `pred ${Math.abs(diffInHours)} h`;

    const messageDate = new Date(timestampMs);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (messageDate.getDate() === yesterday.getDate() && messageDate.getMonth() === yesterday.getMonth() && messageDate.getFullYear() === yesterday.getFullYear()) {
      return "Včeraj";
    }

    return new Intl.DateTimeFormat("sl-SI", { day: "numeric", month: "short" }).format(messageDate);
  };

  if (isLoading || !isAuthenticated || (currentUser !== undefined && !currentUser?.isProfileComplete)) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-[#F4F6F8]">
        <div className="animate-pulse flex space-x-3 items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[#5BA582]/40"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#5BA582]/70"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#5BA582]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] font-sans flex flex-col relative pb-20">
      <Header />
      <div className="h-[100px] md:h-[60px]" />

      <div className="w-full" style={{background: '#f4c361'}}>
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-5 flex items-center space-x-3">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7 text-white/90">
             <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
           </svg>
           <h1 className="text-2xl md:text-[28px] font-bold text-white tracking-wide" style={{fontFamily: 'var(--font-montserrat)'}}>
              Klepeti
           </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-8 mt-6">
        {userTeams === undefined ? (
           <div className="flex justify-center p-12"><div className="w-6 h-6 border-2 border-[#eeb054] border-t-white rounded-full animate-spin"></div></div>
        ) : !userTeams || userTeams.length === 0 ? (
           <div className="text-center py-16 text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100">
             <div className="text-4xl mb-4">💬</div>
             <p className="text-lg font-bold mb-2">Trenutno niste v nobeni ekipi.</p>
             <p className="text-sm">Za klepet se morate pridružiti ekipi ali ustvariti novo.</p>
             <button onClick={() => router.push('/teams')} className="mt-6 bg-[#6db592] hover:bg-[#5b9e7e] text-white px-6 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm">
                Pojdi na ekipe
             </button>
           </div>
        ) : (
           <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
             {userTeams.map(team => {
               const lastMsg = team.lastMessage;
               let previewText = "Ni sporočil ...";
               if (lastMsg) {
                 if (lastMsg.type === "poll") previewText = `📊 Anketa`;
                 else if (lastMsg.type === "location") previewText = `📍 Lokacija`;
                 else previewText = lastMsg.text || "Pripeta datoteka";
               }
               
               return (
                 <button 
                   key={team._id}
                   onClick={() => router.push(`/chat/${team._id}`)}
                   className="w-full flex flex-row items-center px-4 py-4 hover:bg-gray-50/80 transition-all text-left group relative"
                 >
                   <div className="w-14 h-14 shrink-0 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-200 shadow-sm relative mr-4">
                      {team.image ? (
                        <img src={team.image} className="w-full h-full object-cover" alt={team.name} />
                      ) : (
                        <span className="text-[#dba032] font-bold text-lg">{team.name.substring(0, 2).toUpperCase()}</span>
                      )}
                   </div>
                   
                   <div className="flex-1 min-w-0 pr-2 pb-1">
                     <div className="flex justify-between items-baseline mb-1">
                       <h3 className="text-[17px] font-bold text-gray-800 truncate" style={{fontFamily: 'var(--font-montserrat)'}}>{team.name}</h3>
                       {lastMsg && (
                         <span className="text-[11px] font-semibold text-gray-400 shrink-0 ml-2">
                           {formatRelativeTime(lastMsg.creationTime)}
                         </span>
                       )}
                     </div>
                     <p className={`text-[14px] truncate flex items-center ${lastMsg ? 'text-gray-500' : 'text-gray-400 italic'}`}>
                       {lastMsg && <span className="text-gray-400 mr-1.5 font-medium">{lastMsg.author.split(' ')[0]}:</span>}
                       <span className="truncate">{previewText}</span>
                     </p>
                   </div>
                 </button>
               );
             })}
           </div>
        )}
      </div>
    </div>
  );
}
