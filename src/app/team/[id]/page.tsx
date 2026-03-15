"use client";

import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
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
  const [teamToDelete, setTeamToDelete] = useState<Id<"teams"> | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteTeam = useMutation(api.teams.deleteTeam);

  const [seasonToDelete, setSeasonToDelete] = useState<Id<"seasons"> | null>(null);
  const [isDeletingSeason, setIsDeletingSeason] = useState(false);
  const deleteSeason = useMutation(api.seasons.deleteSeason);
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const teamId = params.id as Id<"teams">;
  
  const handleDelete = async () => {
    if (!teamToDelete) return;
    setIsDeleting(true);
    try {
      await deleteTeam({ teamId: teamToDelete });
      router.push('/teams');
    } catch (error) {
      console.error(error);
      alert(t.errorDeletingTeam || "Napaka pri brisanju ekipe");
    } finally {
      setIsDeleting(false);
      setTeamToDelete(null);
    }
  };

  const handleDeleteSeason = async () => {
    if (!seasonToDelete) return;
    setIsDeletingSeason(true);
    try {
      await deleteSeason({ seasonId: seasonToDelete });
    } catch (error) {
      console.error(error);
      alert("Napaka pri brisanju sezone");
    } finally {
      setIsDeletingSeason(false);
      setSeasonToDelete(null);
    }
  };
  // For now, let's use getTeam and assume we have the raw data to build the subheader.
  const team = useQuery(api.teams.getTeam, { teamId });
  const seasons = useQuery(api.seasons.getSeasonsByTeam, { teamId });

  const filteredSeasons = seasons ? seasons.filter(season => {
    if (filterStartDate && (!season.dateEnd || season.dateEnd < filterStartDate)) return false;
    if (filterEndDate && (!season.dateStart || season.dateStart > filterEndDate)) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === 'name') {
      const cmp = a.name.localeCompare(b.name, 'sl');
      return sortOrder === 'asc' ? cmp : -cmp;
    } else {
      const dA = a.dateStart ? new Date(a.dateStart).getTime() : 0;
      const dB = b.dateStart ? new Date(b.dateStart).getTime() : 0;
      return sortOrder === 'asc' ? dA - dB : dB - dA;
    }
  }) : undefined;

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

  const formatSeasonDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat(currentLang, { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
  };

  const getIgralciText = (count: number) => {
    const n = Math.abs(count) % 100;
    if (n === 1) return `${count} pooblascenec/ekipa (TBD)`;
    // To match screenshot which says "3 igralcev" (?) It said 'Nogometna ekipa' -> "1 sezon", user said "1 igralec, 2 igralca, 3/4 igralci, 5 6,7+igralcev" 
    if (n === 1) return `${count} igralec`;
    if (n === 2) return `${count} igralca`;
    if (n === 3 || n === 4) return `${count} igralci`;
    return `${count} igralcev`;
  };

  const getSezoneText = (count: number) => {
    const n = Math.abs(count) % 100;
    if (n === 1) return `${count} sezona`;
    if (n === 2) return `${count} sezoni`;
    if (n === 3 || n === 4) return `${count} sezone`;
    return `${count} sezon`;
  };

  return (
    <div className="min-h-[100dvh] bg-[#F4F6F8] font-sans flex flex-col relative pb-20">
      <PageTitleUpdater />
      <Header />
      <div className="h-[100px] md:h-[60px]" />

      {/* Legacy Subheader / Banner Design */}
      <div className="w-full relative z-10" style={{background: '#efc463'}}>
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6 md:py-8 flex flex-col relative">
           
           <div className="flex flex-col gap-5">
              
              {/* Top Row: Avatar + Title & Desc */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">
                  <div className="flex items-center gap-4 md:gap-5">
                      {/* Team Avatar */}
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white border-4 border-white shadow-md flex-shrink-0 flex items-center justify-center overflow-hidden relative">
                        {team.image ? (
                           <img src={team.image} alt={team.name} className="w-full h-full object-cover" />
                        ) : (
                           <span className="text-xl md:text-2xl font-bold text-[#eeb054] uppercase">{team.name.charAt(0)}</span>
                        )}
                      </div>

                      {/* Team Info Container */}
                      <div className="flex flex-col justify-center text-white">
                        <h1 className="text-2xl md:text-[28px] font-bold tracking-wide leading-tight drop-shadow-sm mb-1" style={{fontFamily: 'var(--font-montserrat)'}}>
                           {team.name}
                        </h1>
                        {/* Description */}
                        {team.desc && (
                          <p className="text-white/95 text-sm md:text-[15px] max-w-2xl leading-snug m-0 pr-4">
                            {team.desc}
                          </p>
                        )}
                      </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center gap-2 self-start md:self-start ml-[5rem] md:ml-0 mt-1 md:mt-0">
                      <button onClick={() => router.push('/teams')} className="px-3 md:px-4 py-2 bg-white text-[#dba032] hover:bg-[#fdfaf1] rounded-lg font-bold text-[13px] md:text-sm transition-colors border border-[#f3ebcd] flex items-center gap-1.5 shadow-sm whitespace-nowrap">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                          <span>{t.backToTeams || "Seznam ekip"}</span>
                      </button>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => router.push(`/team/${team._id}/edit`)}
                          title={t.editTeamTooltip || "Uredi ekipo"}
                          className="w-9 h-9 md:w-10 md:h-10 border border-gray-200 text-gray-500 hover:text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center flex-shrink-0 shadow-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M2.695 14.763l-1.262 3.152a.5.5 0 00.65.65l3.151-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" /></svg>
                        </button>
                        <button 
                          onClick={() => setTeamToDelete(team._id)}
                          title={t.deleteTeamTooltip || "Izbriši ekipo"}
                          className="w-9 h-9 md:w-10 md:h-10 border border-red-100 text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center flex-shrink-0 shadow-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" /></svg>
                        </button>
                      </div>
                  </div>
              </div>

              {/* Bottom Row: Subheader Badges */}
              <div className="flex flex-wrap items-center gap-2">
                 
                 {/* Members Count */}
                 {team.memberCount > 0 && (
                   <div className="flex items-center gap-2 px-3 py-1.5 bg-white/95 rounded-full text-gray-700 text-[13px] font-bold shadow-sm whitespace-nowrap">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-500"><path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" /></svg>
                      {getIgralciText(team.memberCount)}
                   </div>
                 )}

                 {/* Add Season Count */}
                 {team.seasonCount > 0 && (
                   <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 rounded-full text-gray-700 text-[13px] font-bold shadow-sm whitespace-nowrap">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-500"><path fillRule="evenodd" d="M14.5 4V3.25a.75.75 0 0 0-1.5 0V4h-6V3.25a.75.75 0 0 0-1.5 0V4H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.5zM4 6h12v2H4V6zm0 3.5h12V16H4V9.5z" clipRule="evenodd" /></svg>
                      {getSezoneText(team.seasonCount)}
                   </div>
                 )}

                 {/* Sport */}
                 <div className="flex items-center gap-2 px-3 py-1.5 bg-white/95 rounded-full text-gray-700 text-[13px] font-bold shadow-sm whitespace-nowrap">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-500"><path fillRule="evenodd" d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" clipRule="evenodd"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                    {displaySportName}
                 </div>
                 
                 {/* Creator Badge */}
                 {team.creatorName && (
                   <div className="flex items-center gap-2 px-3 py-1.5 bg-white/95 rounded-full text-gray-700 text-[13px] font-bold shadow-sm whitespace-nowrap">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-500"><path fillRule="evenodd" d="M12 3a1 1 0 0 1 .894.553l2.844 5.688 6.132.863a1 1 0 0 1 .554 1.706l-4.43 4.225 1.045 5.925a1 1 0 0 1-1.45 1.054L12 20.026l-5.589 2.988a1 1 0 0 1-1.45-1.054l1.045-5.925-4.43-4.225a1 1 0 0 1 .554-1.706l6.132-.863 2.844-5.688A1 1 0 0 1 12 3Z" clipRule="evenodd"/></svg>
                      {team.creatorName}
                   </div>
                 )}
                 
                 {/* Date Created */}
                 <div className="flex items-center gap-2 px-3 py-1.5 bg-white/95 rounded-full text-gray-700 text-[13px] font-bold shadow-sm whitespace-nowrap">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-500"><path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" /></svg>
                    {teamCreationDate}
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
               <button 
                 onClick={() => router.push(`/team/${teamId}/seasons/create`)}
                 className="bg-[#5BA582] hover:bg-[#4d8f70] transition-colors text-white font-bold text-sm px-4 py-2 rounded-lg shadow-sm flex items-center gap-2"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
                 {t.newSeason || "Nova sezona"}
               </button>
            </div>
            
            {seasons === undefined ? (
               <div className="bg-white rounded-xl border border-gray-100 p-6 text-center text-gray-500 shadow-sm min-h-[150px] flex items-center justify-center">
                  <div className="animate-pulse flex space-x-2 items-center">
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                  </div>
               </div>
            ) : seasons.length === 0 ? (
               <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-500 shadow-sm min-h-[150px] flex flex-col items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-300 mb-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  <p className="font-medium">Ekipa še nima dodanih sezon.</p>
                  <p className="text-sm mt-1">Klikni na gumb "Nova sezona" za ustvarjanje prve.</p>
               </div>
            ) : (
               <>
                 <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex flex-col md:flex-row gap-4 items-end md:items-center justify-between">
                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                       <div className="flex flex-col gap-1.5 text-sm w-full md:w-auto">
                          <label className="text-gray-500 font-medium text-xs">Datum od:</label>
                          <input 
                            type="date" 
                            value={filterStartDate} 
                            onChange={(e) => setFilterStartDate(e.target.value)}
                            className="border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 outline-none focus:border-[#5BA582] transition-colors"
                          />
                       </div>
                       <div className="flex flex-col gap-1.5 text-sm w-full md:w-auto">
                          <label className="text-gray-500 font-medium text-xs">Datum do:</label>
                          <input 
                            type="date" 
                            value={filterEndDate} 
                            onChange={(e) => setFilterEndDate(e.target.value)}
                            className="border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 outline-none focus:border-[#5BA582] transition-colors"
                          />
                       </div>
                       <div className="flex flex-col gap-1.5 text-sm w-full md:w-auto">
                          <label className="text-gray-500 font-medium text-xs">Razvrsti po:</label>
                          <div className="flex gap-2">
                            <select 
                              value={sortBy} 
                              onChange={(e) => setSortBy(e.target.value as 'name' | 'date')}
                              className="border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 outline-none focus:border-[#5BA582] transition-colors bg-white cursor-pointer"
                            >
                              <option value="date">Datumu začetka</option>
                              <option value="name">Imenu</option>
                            </select>
                            <button 
                              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                              className="border border-gray-200 rounded-lg px-2 py-1.5 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors bg-white shadow-sm"
                              title={sortOrder === 'asc' ? "Naraščajoče" : "Padajoče"}
                            >
                              {sortOrder === 'asc' ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h9.75m4.5-4.5v12m0 0l-3.75-3.75M17.25 21L21 17.25" /></svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4.5h14.25M3 9h9.75M3 13.5h5.25m5.25-.75L17.25 9m0 0L21 12.75M17.25 9v12" /></svg>
                              )}
                            </button>
                          </div>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg self-end shrink-0 hidden md:flex">
                       <button 
                         onClick={() => setViewMode('grid')}
                         className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                         title="Mrežni pogled"
                       >
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
                       </button>
                       <button 
                         onClick={() => setViewMode('list')}
                         className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
                         title="Seznamski pogled"
                       >
                         <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" /></svg>
                       </button>
                    </div>
                 </div>

                 {filteredSeasons && filteredSeasons.length === 0 ? (
                   <div className="bg-white rounded-xl border border-gray-100 p-10 text-center text-gray-500 shadow-sm flex flex-col items-center justify-center">
                      <p className="font-medium">Nobena sezona ne ustreza iskalnim filtrom.</p>
                   </div>
                 ) : (
                   <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4" : "flex flex-col gap-4"}>
                      {filteredSeasons?.map((season) => (
                    <div key={season._id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.1)] transition-all flex flex-col group relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-1 h-full bg-[#dba032]" />
                       
                       <div className="flex justify-between items-start mb-3 ml-2">
                          <h3 className="font-bold text-gray-800 text-[16px] pr-2">{season.name}</h3>
                          <span className={`px-2.5 py-1 rounded-md text-[10px] uppercase font-bold tracking-wider whitespace-nowrap ${season.isActive ? 'bg-[#5ba582]/10 text-[#5ba582]' : 'bg-gray-100 text-gray-500'}`}>
                             {season.isActive ? 'Aktivno' : 'Neaktivno'}
                          </span>
                       </div>

                       <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-5 ml-2">
                          {season.dateStart && season.dateEnd && (
                             <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-gray-400"><path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" /></svg>
                                <span>{formatSeasonDate(season.dateStart)} - {formatSeasonDate(season.dateEnd)}</span>
                             </div>
                          )}
                          <div className="flex items-center gap-1.5" title="Število članov">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-gray-400"><path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" /></svg>
                            <span className="font-medium text-xs">{season.memberCount || 0}</span>
                          </div>
                       </div>
                       
                       <div className="mt-auto ml-2 flex items-center justify-between border-t border-gray-50 pt-3">
                          <div className="text-xs text-gray-400 font-mono tracking-wider font-semibold">
                             Koda: <span className="text-[#dba032]">{season.joinCode}</span>
                          </div>
                          
                          {team.userRole === "admin" && (
                            <div className="flex items-center gap-1.5 p-1">
                               <button 
                                 onClick={() => router.push(`/team/${teamId}/seasons/${season._id}/edit`)}
                                 className="w-8 h-8 flex items-center justify-center bg-white border border-gray-100 text-gray-400 hover:text-gray-600 hover:border-gray-200 hover:bg-gray-50 rounded-lg transition-colors shadow-sm"
                                 title="Uredi sezono"
                               >
                                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path d="M2.695 14.763l-1.262 3.152a.5.5 0 00.65.65l3.151-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" /></svg>
                               </button>
                               <button 
                                 onClick={() => setSeasonToDelete(season._id)}
                                 className="w-8 h-8 flex items-center justify-center bg-red-50 border border-red-100 text-red-400 hover:text-red-500 hover:border-red-200 hover:bg-red-100 rounded-lg transition-colors shadow-sm"
                                 title="Izbriši sezono"
                               >
                                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" /></svg>
                               </button>
                            </div>
                          )}
                       </div>
                    </div>
                  ))}
                   </div>
                 )}
               </>
            )}
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

      {/* Delete Confirmation Modal */}
      {teamToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <div className="p-6 text-center">
               <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-[0_0_0_4px_rgba(239,68,68,0.1)]">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" /></svg>
               </div>
               <h3 className="text-xl font-bold text-gray-800 mb-2 tracking-wide" style={{fontFamily: 'var(--font-montserrat)'}}>{t.deleteTeamConfirmTitle || "Izbriši ekipo"}</h3>
               <p className="text-gray-500 text-sm">
                 {t.deleteTeamConfirmDesc || "Aler si prepričan, da želiš izbrisati to ekipo? Tega dejanja ni mogoče razveljaviti."}
               </p>
             </div>
             <div className="bg-gray-50 p-4 flex items-center space-x-3">
                <button 
                  onClick={() => setTeamToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 font-bold text-xs sm:text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {t.cancelBtn || "Prekliči"}
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg font-bold text-xs sm:text-sm hover:bg-red-600 shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50 transition-colors"
                >
                  {isDeleting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                  <span>{t.deleteBtn || "Izbriši"}</span>
                </button>
             </div>
           </div>
        </div>
      )}

      {/* Delete Season Confirmation Modal */}
      {seasonToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <div className="p-6 text-center">
               <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-[0_0_0_4px_rgba(239,68,68,0.1)]">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" /></svg>
               </div>
               <h3 className="text-xl font-bold text-gray-800 mb-2 tracking-wide" style={{fontFamily: 'var(--font-montserrat)'}}>Izbriši sezono</h3>
               <p className="text-gray-500 text-sm">
                 Ali si prepričan, da želiš izbrisati to sezono in s tem odstraniti vse udeležence v njej? Tega dejanja ni mogoče razveljaviti.
               </p>
             </div>
             <div className="bg-gray-50 p-4 flex items-center space-x-3">
                <button 
                  onClick={() => setSeasonToDelete(null)}
                  disabled={isDeletingSeason}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 font-bold text-xs sm:text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {t.cancelBtn || "Prekliči"}
                </button>
                <button 
                  onClick={handleDeleteSeason}
                  disabled={isDeletingSeason}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg font-bold text-xs sm:text-sm hover:bg-red-600 shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50 transition-colors"
                >
                  {isDeletingSeason ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                  <span>{t.deleteBtn || "Izbriši"}</span>
                </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
}
