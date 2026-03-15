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
          <div className="truncate text-left border-l border-white/20 pl-2 ml-1 flex flex-col justify-center">
             <span className="text-[8px] md:text-[9px] uppercase font-bold text-white/80 block leading-[1] tracking-wider mb-0.5" style={{fontFamily: 'var(--font-cabin)'}}>EKIPA</span>
             <span className="truncate block font-bold text-white text-[11px] md:text-[13px] leading-[1]" style={{fontFamily: 'var(--font-cabin)'}}>{currentTeam?.name || "Nalaganje..."}</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-3.5 h-3.5 shrink-0 transition-transform ${openDropdown === 'team' ? 'rotate-180' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
        </button>

        {openDropdown === 'team' && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
             <div className="px-3 pb-2 mb-2 border-b border-gray-50/80">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 pt-1 mb-1">Trenutna ekipa</p>
                <div className="flex items-center justify-between px-2 py-1.5 bg-orange-50/50 rounded-lg">
                   <span className="font-bold text-gray-800 text-sm truncate">{currentTeam?.name}</span>
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[#eeb054]"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                </div>
             </div>
             
             <div className="max-h-[300px] overflow-y-auto px-1 hide-scrollbar">
                {myTeams.filter(t => t && t._id !== currentTeam?._id).map((t: any) => (
                   <div key={t._id} className="flex items-center justify-between group hover:bg-gray-50 rounded-lg px-2">
                       <button 
                         onClick={() => handleTeamClick(t)}
                         className="flex-1 text-left py-2 px-1 text-sm text-gray-600 font-medium truncate"
                       >
                         {t.name}
                       </button>
                       {t.userRole === 'admin' && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); router.push(`/team/${t._id}/edit`); setOpenDropdown(null); }}
                            className="p-1.5 text-gray-300 hover:text-[#eeb054] hover:bg-white rounded-md transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                            title="Uredi ekipo"
                          >
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path d="M2.695 14.763l-1.262 3.152a.5.5 0 00.65.65l3.151-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" /></svg>
                          </button>
                       )}
                   </div>
                ))}
             </div>

             <div className="mt-2 pt-2 border-t border-gray-50 px-3">
                <Link href="/teams/create" onClick={() => setOpenDropdown(null)} className="flex items-center justify-center gap-2 w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-sm font-bold transition-colors">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
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
          <div className="truncate text-left border-l border-white/20 pl-2 ml-1 flex flex-col justify-center">
             <span className="text-[8px] md:text-[9px] uppercase font-bold text-white/90 block leading-[1] tracking-wider mb-0.5" style={{fontFamily: 'var(--font-cabin)'}}>SEZONA</span>
             <span className="truncate block font-bold text-white text-[11px] md:text-[13px] leading-[1]" style={{fontFamily: 'var(--font-cabin)'}}>{currentSeason?.name || "Nalaganje..."}</span>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-3.5 h-3.5 shrink-0 transition-transform ${openDropdown === 'season' ? 'rotate-180' : ''}`}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
        </button>

        {openDropdown === 'season' && (
          <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
             <div className="px-3 pb-2 mb-2 border-b border-gray-50/80">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 pt-1 mb-1">Trenutna sezona</p>
                <div className="flex items-center justify-between px-2 py-1.5 bg-orange-50/50 rounded-lg">
                   <div className="flex flex-col truncate">
                      <span className="font-bold text-gray-800 text-sm truncate">{currentSeason?.name}</span>
                   </div>
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[#eeb054] shrink-0"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                </div>
             </div>
             
             <div className="max-h-[300px] overflow-y-auto px-1 hide-scrollbar">
                {teamSeasons.filter(s => s._id !== currentSeason?._id).map((season: any) => (
                   <div key={season._id} className="flex items-center justify-between group hover:bg-gray-50 rounded-lg px-2">
                       <button 
                         onClick={() => handleSeasonClick(season)}
                         className="flex-1 text-left py-2 px-1 text-sm text-gray-600 font-medium truncate"
                       >
                         {season.name}
                       </button>
                       {/* Assuming admin role if they are in this currentTeam object or we can just show edit and let page guard it */}
                       <button 
                         onClick={(e) => { e.stopPropagation(); router.push(`/team/${currentTeam._id}/seasons/${season._id}/edit`); setOpenDropdown(null); }}
                         className="p-1.5 text-gray-300 hover:text-[#d8993c] hover:bg-white rounded-md transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                         title="Uredi sezono"
                       >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path d="M2.695 14.763l-1.262 3.152a.5.5 0 00.65.65l3.151-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" /></svg>
                       </button>
                   </div>
                ))}
             </div>

             <div className="mt-2 pt-2 border-t border-gray-50 px-3">
                <Link href={`/team/${currentTeam?._id}/seasons/create`} onClick={() => setOpenDropdown(null)} className="flex items-center justify-center gap-2 w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-sm font-bold transition-colors">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
                   Nova sezona
                </Link>
             </div>
          </div>
        )}
      </div>

    </div>
  );
}
