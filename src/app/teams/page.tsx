"use client";

import { useQuery, useMutation, useConvexAuth } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { translations, Language } from "@/app/i18n";
import { useLanguage } from "@/components/LanguageContext";

const SPORTS = [
  { id: "badminton", name: "Badminton", icon: "🏸" },
  { id: "basketball", name: "Košarka", icon: "🏀" },
  { id: "tableTennis", name: "Namizni tenis", icon: "🏓" },
  { id: "football", name: "Nogomet", icon: "⚽" },
  { id: "volleyball", name: "Odbojka", icon: "🏐" },
  { id: "padel", name: "Padel", icon: "🎾" },
  { id: "tennis", name: "Tenis", icon: "🎾" }
];

export default function TeamsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const { language: currentLang } = useLanguage();
  const t = (translations[currentLang as Language] || translations.sl) as any;
  const teams = useQuery(api.teams.getUserTeams);
  const deleteTeam = useMutation(api.teams.deleteTeam);

  const [filterQuery, setFilterQuery] = useState("");
  const [teamToDelete, setTeamToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!teamToDelete) return;
    setIsDeleting(true);
    try {
      await deleteTeam({ teamId: teamToDelete as any });
      setTeamToDelete(null);
    } catch (err: any) {
      alert(err.message || t.errorDeletingTeam);
    } finally {
      setIsDeleting(false);
    }
  };
  const filteredTeams = teams?.filter(team => {
    const s = SPORTS.find(sp => sp.id === team.sport || sp.name === team.sport);
    const displaySportName = s ? (t.sports ? t.sports[s.id] : s.name) : team.sport;
    return team.name.toLowerCase().includes(filterQuery.toLowerCase()) || 
           displaySportName.toLowerCase().includes(filterQuery.toLowerCase());
  });

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

  // Helper for proper Slovenian grammatical pluralization of "members"
  const getMembersSlovenian = (count: number) => {
    if (count === 1) return `${count} član`;
    if (count === 2) return `${count} člana`;
    if (count === 3 || count === 4) return `${count} člani`;
    return `${count} članov`; // Covers 0, 5, 6, 7...
  };

  const getMembersText = (count: number) => {
     if (currentLang === 'sl') return getMembersSlovenian(count);
     return `${count} ${count === 1 ? 'member' : 'members'}`;
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] font-sans flex flex-col relative pb-20">
      <Header />
      <div className="h-[100px] md:h-[60px]" />

      {/* Banner */}
      <div className="w-full" style={{background: '#f4c361'}}>
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-5 flex items-center space-x-3">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7 text-white/90">
             <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
           </svg>
           <h1 className="text-2xl md:text-[28px] font-bold text-white tracking-wide" style={{fontFamily: 'var(--font-montserrat)'}}>
              {t.teamsBanner}
           </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-8 mt-8">
        <div className="ui-card p-6 md:p-8">
           
           <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <h2 className="ui-page-title flex items-center space-x-2">
                 <span>{t.teamList}</span>
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[#dba032]">
                   <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                 </svg>
              </h2>
              <button 
                onClick={() => router.push('/teams/create')}
                className="mt-4 sm:mt-0 flex items-center justify-center space-x-1.5 bg-[#6db592] hover:bg-[#5b9e7e] text-white px-5 py-2.5 rounded-lg font-bold transition-colors shadow-sm text-sm"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
                 <span>{t.newTeam}</span>
              </button>
           </div>
           
           {/* Filtering Bar */}
           <div className="mb-6 h-12 relative flex items-center bg-gray-50 border border-gray-200 rounded-lg px-4 focus-within:ring-2 focus-within:ring-[#eeb054]/50 focus-within:bg-white transition-all shadow-sm max-w-sm">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-400 absolute left-4">
               <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
             </svg>
             <input 
               type="text"
               value={filterQuery}
               onChange={(e) => setFilterQuery(e.target.value)}
               placeholder={t.searchTeamPlaceholder}
               className="w-full h-full bg-transparent pl-8 pr-4 text-sm outline-none text-gray-700"
             />
           </div>

           {teams === undefined ? (
             <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-[#eeb054] border-t-white rounded-full animate-spin"></div></div>
           ) : !teams ? (
             <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl">{t.loginToViewTeams}</div>
           ) : teams.length === 0 ? (
             <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
               {t.noTeamsYet}
             </div>
           ) : (
             <div className="space-y-4">
               {filteredTeams && filteredTeams.length === 0 ? (
                 <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                   {t.noTeamsMatch}
                 </div>
               ) : (
                 filteredTeams?.map((team, idx) => (
                   <div key={team._id} className="flex flex-col sm:flex-row sm:items-center bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-[#eeb054]/50 transition-colors shadow-sm group">
                     {/* Card Content ... */}
                     <div className="w-full sm:w-40 h-32 sm:h-28 bg-[#fdfaf1] flex items-center justify-center shrink-0 border-b sm:border-b-0 sm:border-r border-gray-100 relative">
                       <svg className="absolute top-2 left-2 w-5 h-5 text-[#eeb054]/30" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418"/></svg>
                       {team.image ? (
                          <img src={team.image} alt={team.name} className="w-full h-full object-cover" />
                       ) : (
                          <div className="flex flex-col items-center text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 mb-1 opacity-50"><path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM6.31 15.117A6.745 6.745 0 0 1 12 12a6.745 6.745 0 0 1 6.709 7.498.75.75 0 0 1-.372.568A12.696 12.696 0 0 1 12 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 0 1-.372-.568 6.787 6.787 0 0 1 1.019-4.38Z" clipRule="evenodd" /><path d="M5.082 14.254a8.287 8.287 0 0 0-1.308 5.135 9.687 9.687 0 0 1-1.764-.44l-.115-.04a.563.563 0 0 1-.373-.487l-.01-.121a3.75 3.75 0 0 1 3.57-4.047ZM20.226 19.389a8.287 8.287 0 0 0-1.308-5.135 3.75 3.75 0 0 1 3.57 4.047l-.01.121a.563.563 0 0 1-.373.486l-.115.04c-.56.195-1.15.349-1.764.441Z" /></svg>
                          </div>
                       )}
                     </div>
                     <div className="p-5 flex-1 flex flex-col justify-center items-center sm:items-start text-center sm:text-left">
                       <h3 className="text-lg font-bold text-gray-800 tracking-wide" style={{fontFamily: 'var(--font-montserrat)'}}>{team.name}</h3>
                       <div className="flex flex-wrap items-center justify-center sm:justify-start mt-3 gap-2">
                          <span className="inline-flex items-center text-xs font-bold text-[#eeb054] bg-[#fdfaf1] px-2.5 py-1 rounded-md border border-[#f3ebcd]">
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 mr-1"><path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" /></svg>
                             {getMembersText(team.memberCount)}
                          </span>
                          <span className="inline-flex items-center text-xs font-bold text-[#eeb054] bg-[#fdfaf1] px-2.5 py-1 rounded-md border border-[#f3ebcd]">
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 mr-1"><path fillRule="evenodd" d="M14.5 4V3.25a.75.75 0 0 0-1.5 0V4h-6V3.25a.75.75 0 0 0-1.5 0V4H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-1.5zM4 6h12v2H4V6zm0 3.5h12V16H4V9.5z" clipRule="evenodd" /></svg>
                             {team.seasonCount} {team.seasonCount === 1 ? t.seasonCountSingle : t.seasonCountPlural}
                          </span>
                          {team.userRole === "admin" && (
                            <span className="inline-flex items-center text-xs font-bold text-indigo-500 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-md shadow-sm">
                               {t.superAdmin}
                            </span>
                          )}
                       </div>
                     </div>
                     <div className="p-4 sm:p-5 flex flex-wrap gap-2.5 items-center justify-center sm:justify-start sm:border-l border-gray-100 bg-gray-50/50 sm:bg-transparent rounded-b-xl sm:rounded-none w-full sm:w-auto">
                        <button 
                          onClick={() => router.push(`/chat/${team._id}`)}
                          title="Klepet"
                          className="relative w-10 h-10 border border-[#5BA582]/30 text-[#5BA582] bg-white rounded-lg hover:bg-[#5BA582]/10 transition-colors flex items-center justify-center flex-shrink-0"
                        >
                          {(team as any).unreadCount > 0 && (
                             <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
                               {(team as any).unreadCount > 99 ? '99+' : (team as any).unreadCount}
                             </span>
                          )}
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" /></svg>
                        </button>
                        <button 
                          onClick={() => router.push(`/teams/${team._id}`)}
                          className="h-10 px-4 border border-[#f3ebcd] text-[#dba032] font-bold text-sm bg-white rounded-lg hover:bg-[#fdfaf1] transition-colors whitespace-nowrap grow sm:grow-0"
                        >
                          {t.viewSeasons || "Prikaži sezone"}
                        </button>
                        <div className="flex gap-2.5">
                          <button 
                            onClick={() => router.push(`/teams/${team._id}/edit`)}
                            title={t.editTeamTooltip}
                            className="w-10 h-10 border border-gray-200 text-gray-500 hover:text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center flex-shrink-0"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M2.695 14.763l-1.262 3.152a.5.5 0 00.65.65l3.151-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" /></svg>
                          </button>
                          <button 
                            onClick={() => setTeamToDelete(team._id)}
                            title={t.deleteTeamTooltip}
                            className="w-10 h-10 border border-red-100 text-red-400 hover:text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center flex-shrink-0"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" /></svg>
                          </button>
                        </div>
                     </div>
                   </div>
                 ))
               )}
             </div>
           )}

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
               <h3 className="text-xl font-bold text-gray-800 mb-2 tracking-wide" style={{fontFamily: 'var(--font-montserrat)'}}>{t.deleteTeamConfirmTitle}</h3>
               <p className="text-gray-500 text-sm">
                 {t.deleteTeamConfirmDesc}
               </p>
             </div>
             <div className="bg-gray-50 p-4 flex items-center space-x-3">
                <button 
                  onClick={() => setTeamToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 font-bold text-xs sm:text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {t.cancelBtn}
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg font-bold text-xs sm:text-sm hover:bg-red-600 shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50 transition-colors"
                >
                  {isDeleting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                  <span>{t.yesDelete}</span>
                </button>
             </div>
           </div>
        </div>
      )}

    </div>
  );
}
