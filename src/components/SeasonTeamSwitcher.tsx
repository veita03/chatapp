"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Id } from "../../convex/_generated/dataModel";

interface SeasonTeamSwitcherProps {
  currentTeam: any;
  currentSeason: any;
}

export default function SeasonTeamSwitcher({ currentTeam, currentSeason }: SeasonTeamSwitcherProps) {
  const router = useRouter();
  const [openDropdown, setOpenDropdown] = useState<'team' | 'season' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const myTeams = useQuery(api.teams.getUserTeams) || [];
  const teamSeasons = useQuery(api.seasons.getSeasonsByTeam, currentTeam ? { teamId: currentTeam._id } : "skip") || [];

  const handleTeamClick = (team: any) => {
    setOpenDropdown(null);
    if (team._id !== currentTeam?._id) {
       router.push(`/team/${team._id}`);
    }
  };

  const handleSeasonClick = (season: any) => {
    setOpenDropdown(null);
    if (season._id !== currentSeason?._id) {
       router.push(`/season/${season.joinCode}`);
    }
  };

  return (
    <div className="flex items-center gap-2 md:gap-4" ref={containerRef}>
      
      {/* TEAM SWITCHER */}
      <div className="relative">
        <button 
          onClick={() => setOpenDropdown(openDropdown === 'team' ? null : 'team')}
          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-medium px-3 md:px-4 h-[36px] md:h-[42px] rounded-[8px] md:rounded-[10px] transition-colors max-w-[200px] md:max-w-[250px]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 shrink-0 hidden sm:block"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
          <div className="truncate text-left border-l border-white/20 pl-2 ml-1 flex flex-col justify-center pt-px">
             <span className="text-[8px] md:text-[9px] uppercase font-bold text-white/80 block leading-none tracking-wider mb-px" style={{fontFamily: 'var(--font-cabin)'}}>EKIPA</span>
             <span className="truncate block font-bold text-white text-[11px] md:text-[13px] leading-tight" style={{fontFamily: 'var(--font-cabin)'}}>{currentTeam?.name || "Nalaganje..."}</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-3.5 h-3.5 shrink-0 transition-transform ${openDropdown === 'team' ? 'rotate-180' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
        </button>

        {openDropdown === 'team' && (
          <div className="absolute top-full left-0 mt-3 w-[340px] sm:w-[380px] bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
             {/* Caret arrow pointing up */}
             <div className="absolute -top-2 left-8 w-4 h-4 bg-white rotate-45 rounded-sm border-l border-t border-gray-100"></div>
             
             <h3 className="text-[22px] font-bold text-gray-800 mb-4 px-1 leading-none" style={{fontFamily: 'var(--font-montserrat)'}}>Ekipe</h3>
             
             <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto hide-scrollbar">
                {myTeams.map((t: any) => (
                   <div key={t._id} onClick={() => handleTeamClick(t)} className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer group transition-colors ${currentTeam?._id === t._id ? 'bg-[#f8f9fa] shadow-sm ring-1 ring-gray-100' : 'bg-gray-50/60 hover:bg-gray-100'}`}>
                       <div className="w-12 h-12 rounded-full border-2 border-[#efc463] bg-white shrink-0 overflow-hidden flex items-center justify-center shadow-sm">
                          {t?.image ? (
                             <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                          ) : (
                             <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                          )}
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 text-[15px] truncate leading-tight">{t.name}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">Ustvarjeno: {new Date(t._creationTime).toLocaleDateString('sl-SI')}</p>
                       </div>
                       <div className="flex items-center gap-1.5 shrink-0">
                          <div className="w-7 h-7 rounded-full bg-[#efc463]/15 flex items-center justify-center text-[#d8993c] hover:bg-[#efc463] hover:text-white transition-colors" title="Pregled gumb" onClick={(e) => { e.stopPropagation(); router.push(`/team/${t._id}`); setOpenDropdown(null); }}>
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" /><path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                          </div>
                          {t.userRole === 'admin' && (
                             <div className="w-7 h-7 rounded-full bg-[#efc463]/15 flex items-center justify-center text-[#d8993c] hover:bg-[#efc463] hover:text-white transition-colors" title="Uredi ekipo" onClick={(e) => { e.stopPropagation(); router.push(`/team/${t._id}/edit`); setOpenDropdown(null); }}>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path d="M2.695 14.763l-1.262 3.152a.5.5 0 00.65.65l3.151-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" /></svg>
                             </div>
                          )}
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[#efc463] opacity-60 group-hover:opacity-100 ml-0.5 transition-opacity"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg>
                       </div>
                   </div>
                ))}
             </div>

             <div className="mt-4 pt-4 border-t border-gray-100">
                <Link href="/teams/create" onClick={() => setOpenDropdown(null)} className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-[#3b879c] rounded-xl text-sm font-bold transition-colors">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
                   Nova ekipa
                </Link>
             </div>
          </div>
        )}
      </div>

      {/* SEASON SWITCHER */}
      <div className="relative">
        <button 
          onClick={() => setOpenDropdown(openDropdown === 'season' ? null : 'season')}
          className="flex items-center gap-2 bg-[#d8993c] hover:bg-[#c98e37] text-white px-3 md:px-4 h-[36px] md:h-[42px] rounded-[8px] md:rounded-[10px] transition-colors shadow-inner max-w-[200px] md:max-w-[250px]"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 shrink-0 hidden sm:block"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
          <div className="truncate text-left border-l border-white/20 pl-2 ml-1 flex flex-col justify-center pt-px">
             <span className="text-[8px] md:text-[9px] uppercase font-bold text-white/90 block leading-none tracking-wider mb-px" style={{fontFamily: 'var(--font-cabin)'}}>SEZONA</span>
             <span className="truncate block font-bold text-white text-[11px] md:text-[13px] leading-tight" style={{fontFamily: 'var(--font-cabin)'}}>{currentSeason?.name || "Nalaganje..."}</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-3.5 h-3.5 shrink-0 transition-transform ${openDropdown === 'season' ? 'rotate-180' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
        </button>

        {openDropdown === 'season' && (
          <div className="absolute top-full left-0 mt-3 w-[340px] sm:w-[380px] bg-white rounded-2xl shadow-xl border border-gray-100 p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
             {/* Caret arrow pointing up */}
             <div className="absolute -top-2 left-10 w-4 h-4 bg-white rotate-45 rounded-sm border-l border-t border-gray-100"></div>
             
             <h3 className="text-[22px] font-bold text-gray-800 mb-4 px-1 leading-none" style={{fontFamily: 'var(--font-montserrat)'}}>Sezone</h3>
             
             <div className="flex flex-col gap-2 max-h-[350px] overflow-y-auto hide-scrollbar">
                {teamSeasons.map((season: any) => (
                   <div key={season._id} onClick={() => handleSeasonClick(season)} className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer group transition-colors ${currentSeason?._id === season._id ? 'bg-[#f8f9fa] shadow-sm ring-1 ring-gray-100' : 'bg-gray-50/60 hover:bg-gray-100'}`}>
                       <div className="w-12 h-12 rounded-full border-2 border-[#efc463] bg-white shrink-0 overflow-hidden flex items-center justify-center shadow-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400">
                             <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                          </svg>
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 text-[15px] truncate leading-tight">{season.name}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">Ustvarjeno: {new Date(season._creationTime).toLocaleDateString('sl-SI')}</p>
                       </div>
                       <div className="flex items-center gap-1.5 shrink-0">
                          <div className="w-7 h-7 rounded-full bg-[#efc463]/15 flex items-center justify-center text-[#d8993c] hover:bg-[#efc463] hover:text-white transition-colors" title="Pregled gumb" onClick={(e) => { e.stopPropagation(); router.push(`/season/${season.joinCode}`); setOpenDropdown(null); }}>
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" /><path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                          </div>
                          <div className="w-7 h-7 rounded-full bg-[#efc463]/15 flex items-center justify-center text-[#d8993c] hover:bg-[#efc463] hover:text-white transition-colors" title="Uredi sezono" onClick={(e) => { e.stopPropagation(); router.push(`/team/${currentTeam._id}/seasons/${season._id}/edit`); setOpenDropdown(null); }}>
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path d="M2.695 14.763l-1.262 3.152a.5.5 0 00.65.65l3.151-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" /></svg>
                          </div>
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[#efc463] opacity-60 group-hover:opacity-100 ml-0.5 transition-opacity"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" /></svg>
                       </div>
                   </div>
                ))}
             </div>

             <div className="mt-4 pt-4 border-t border-gray-100">
                <Link href={`/team/${currentTeam?._id}/seasons/create`} onClick={() => setOpenDropdown(null)} className="flex items-center justify-center gap-2 w-full py-2.5 bg-gray-50 hover:bg-gray-100 text-[#3b879c] rounded-xl text-sm font-bold transition-colors">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
                   Nova sezona
                </Link>
             </div>
          </div>
        )}
      </div>

    </div>
  );
}
