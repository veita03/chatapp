"use client";

import { useQuery, useConvexAuth } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";
import Header from "@/components/Header";
import { translations, Language } from "@/app/i18n";
import { useLanguage } from "@/components/LanguageContext";
import PageTitleUpdater from "@/components/PageTitleUpdater";

const SPORTS = [
  { id: "badminton", name: "Badminton", icon: "🏸" },
  { id: "basketball", name: "Košarka", icon: "🏀" },
  { id: "tableTennis", name: "Namizni tenis", icon: "🏓" },
  { id: "football", name: "Nogomet", icon: "⚽" },
  { id: "volleyball", name: "Odbojka", icon: "🏐" },
  { id: "padel", name: "Padel", icon: "🎾" },
  { id: "tennis", name: "Tenis", icon: "🎾" }
];

export default function TeamDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const { language: currentLang } = useLanguage();
  const t = (translations[currentLang as Language] || translations.sl) as any;
  
  const teamId = params.id as Id<"teams">;
  
  // Note: We need a query that returns team details + creator details + active season stats.
  // For now, let's use getTeam and assume we have the raw data to build the subheader.
  const team = useQuery(api.teams.getTeam, { teamId });

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  if (isAuthLoading || !isAuthenticated) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-[#F4F6F8]">
        <div className="animate-pulse flex space-x-3 items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[#eeb054]/40"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#eeb054]/70"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#eeb054]"></div>
        </div>
      </div>
    );
  }

  if (team === undefined) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] font-sans flex flex-col relative pb-20">
        <Header />
        <div className="h-[100px] md:h-[60px]" />
        <div className="flex h-64 items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#eeb054]/30 border-t-[#eeb054] rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (team === null) {
     return (
        <div className="min-h-screen bg-[#F4F6F8] font-sans flex flex-col relative pb-20">
          <Header />
          <div className="h-[100px] md:h-[60px]" />
          <div className="text-center py-20">
             <h2 className="text-2xl font-bold text-gray-800">{t.teamDoesNotExist || "Ekipa ne obstaja"}</h2>
             <button onClick={() => router.push('/teams')} className="mt-4 text-[#3b879c] underline font-bold">{t.backToTeams || "Nazaj na ekipe"}</button>
          </div>
        </div>
     );
  }

  const s = SPORTS.find(sp => sp.id === team.sport || sp.name === team.sport);
  const displaySportName = s ? (t.sports ? t.sports[s.id] : s.name) : team.sport;
  const teamCreationDate = new Intl.DateTimeFormat(currentLang, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(team._creationTime));

  return (
    <div className="min-h-[100dvh] bg-[#F4F6F8] font-sans flex flex-col relative pb-20">
      <PageTitleUpdater />
      <Header />
      <div className="h-[100px] md:h-[60px]" />

      {/* Legacy Subheader / Banner Design */}
      <div className="w-full bg-[#eab355] relative z-10 font-sans">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-6 flex flex-col relative md:min-h-[140px] justify-center">
           
           <div className="flex flex-col md:flex-row md:items-center gap-6">
              
              {/* Team Avatar */}
              <div className="w-[84px] h-[84px] md:w-[100px] md:h-[100px] rounded-full bg-white border-[3px] border-white shadow-sm flex-shrink-0 flex items-center justify-center overflow-hidden relative">
                {team.image ? (
                   <img src={team.image} alt={team.name} className="w-full h-full object-cover" />
                ) : (
                   <span className="text-3xl font-bold text-[#eab355] uppercase">{team.name.charAt(0)}</span>
                )}
              </div>

              {/* Team Info Container */}
              <div className="flex-1 flex flex-col text-white">
                
                {/* Title & Actions Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 w-full">
                   <div className="flex flex-col mt-1">
                     <h1 className="text-[26px] font-bold tracking-wide leading-none drop-shadow-sm mb-1.5" style={{fontFamily: 'var(--font-montserrat)'}}>
                        {team.name}
                     </h1>
                     {team.desc && (
                       <p className="text-white/90 text-[13px] max-w-2xl leading-relaxed font-normal">
                         {team.desc}
                       </p>
                     )}
                   </div>
                   
                   <div className="flex items-center gap-2.5 shrink-0 mt-1 md:mt-0">
                       <button onClick={() => router.push('/teams')} className="px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-md text-white font-bold text-[13px] transition-colors border border-white/40 hidden sm:flex items-center gap-2 shadow-sm">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-[14px] h-[14px]"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                           <span>{t.backToTeams || "Nazaj na ekipe"}</span>
                       </button>
                       {team.userRole === "admin" && (
                         <div className="flex gap-2">
                           <button onClick={() => router.push(`/teams/${team._id}/edit`)} className="w-[34px] h-[34px] bg-white text-gray-600 hover:bg-gray-50 rounded-md shadow-sm flex items-center justify-center transition-colors">
                               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-[14px] h-[14px]"><path d="M2.695 14.763l-1.262 3.152a.5.5 0 00.65.65l3.151-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" /></svg>
                           </button>
                           <button onClick={() => { /* Placeholder for team delete */ }} className="w-[34px] h-[34px] bg-[#fde9eb] text-[#ef506d] hover:bg-[#fad1d5] rounded-md shadow-sm flex items-center justify-center transition-colors">
                               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-[14px] h-[14px]"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4z" clipRule="evenodd" /></svg>
                           </button>
                         </div>
                       )}
                   </div>
                </div>

                {/* Subheader Badges (Role, Seasons, Sport, Creator, Date) */}
                <div className="flex flex-wrap gap-2.5 mt-auto pt-3">
                   
                   {/* Members Count */}
                   <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full text-[#4a5568] text-[11px] font-bold shadow-sm whitespace-nowrap">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-[#9cb1c9]"><path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" /></svg>
                      {team.memberCount}
                   </div>

                   {/* Add Season Count */}
                   <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full text-[#4a5568] text-[11px] font-bold shadow-sm whitespace-nowrap">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-[#9cb1c9]"><path fillRule="evenodd" d="M14.5 4V3.25a.75.75 0 0 0-1.5 0V4h-6V3.25a.75.75 0 0 0-1.5 0V4H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.5zM4 6h12v2H4V6zm0 3.5h12V16H4V9.5z" clipRule="evenodd" /></svg>
                      {team.seasonCount} <span className="font-semibold">{t.seasons === 'Sezone' ? 'sezon' : (t.seasons || 'sezon')}</span>
                   </div>

                   {/* Sport */}
                   <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full text-[#4a5568] text-[11px] font-bold shadow-sm whitespace-nowrap">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 text-[#9cb1c9]"><path fillRule="evenodd" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" clipRule="evenodd"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                      {displaySportName}
                   </div>
                   
                   {/* Date Created */}
                   <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full text-[#4a5568] text-[11px] font-bold shadow-sm whitespace-nowrap">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-[#9cb1c9]"><path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" /></svg>
                      {teamCreationDate}
                   </div>
                </div>

              </div>
           </div>

        </div>
      </div>

      {/* Main Content Area (Seasons & Players will go here) */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-8 mt-8 space-y-8">
          
          {/* Seasons Block Placeholder */}
          <div>
            <div className="flex items-center justify-between mb-4">
               <h2 className="text-2xl font-bold text-[#353b41]" style={{fontFamily: 'var(--font-montserrat)'}}>
                 {t.seasons || "Sezone"}
               </h2>
               <button className="bg-[#5BA582] hover:bg-[#4d8f70] transition-colors text-white font-bold text-sm px-4 py-2 rounded-lg shadow-sm flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
                 {t.newSeason || "Nova sezona"}
               </button>
            </div>
            
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-gray-500 shadow-sm min-h-[150px] flex items-center justify-center">
               Tukaj bo kmalu seznam sezon...
            </div>
          </div>

          {/* Players Block Placeholder */}
          <div>
            <h2 className="text-2xl font-bold text-[#353b41] mb-4" style={{fontFamily: 'var(--font-montserrat)'}}>
               {t.playersInTeam || "Igralci v ekipi"}
            </h2>
            <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-gray-500 shadow-sm min-h-[150px] flex items-center justify-center">
               Tukaj bo kmalu seznam igralcev...
            </div>
          </div>

      </div>

    </div>
  );
}
