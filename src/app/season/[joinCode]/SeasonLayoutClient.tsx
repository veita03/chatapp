"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { useQuery, useConvexAuth } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import SeasonTeamSwitcher from "@/components/SeasonTeamSwitcher";

export default function SeasonLayoutClient({
  children,
  joinCode,
}: {
  children: React.ReactNode;
  joinCode: string;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();

  const data = useQuery(api.seasons.getSeasonByJoinCode, { joinCode });

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  if (isAuthLoading || data === undefined) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#F4F6F8]">
        <div className="animate-pulse flex space-x-3 items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[#eeb054]/40"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#eeb054]/70"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#eeb054]"></div>
        </div>
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="min-h-[100dvh] bg-[#F4F6F8] font-sans flex flex-col relative pb-20">
        <Header />
        <div className="h-[100px] md:h-[60px]" />
        <div className="text-center py-20">
           <h2 className="text-2xl font-bold text-gray-800">Sezona ne obstaja</h2>
           <p className="text-gray-500 mb-6 mt-2">Povezava je napačna ali pa je bila sezona izbrisana.</p>
           <button onClick={() => router.push('/teams')} className="text-[#3b879c] underline font-bold">Vrnite se na Ekipe</button>
        </div>
      </div>
    );
  }

  const { season, team } = data;

  return (
    <div className="min-h-[100dvh] bg-[#F4F6F8] font-sans flex flex-col relative overflow-hidden">
      
      {/* GLOBAL HEADER WITH SWITCHERS */}
      <Header leftElement={<SeasonTeamSwitcher currentTeam={team} currentSeason={season} />} />
      
      {/* 60px spacer since global Header is absolute top-0 */}
      <div className="h-[60px] shrink-0" />

      {/* MID SECTION: Sidebar + Content */}
      <div className="flex flex-1 h-[calc(100dvh-60px)] overflow-hidden">
        
        {/* LEFT SIDEBAR */}
        <aside className="hidden md:flex flex-col w-64 bg-[#dba032] text-white shrink-0 overflow-y-auto z-10 pt-6">
          {/* Team Context Profile */}
          <div className="flex flex-col items-center px-6 mb-8 text-center px-2">
              <div className="w-24 h-24 rounded-full bg-white/20 p-1 mb-3">
                 <div className="w-full h-full rounded-full bg-white overflow-hidden flex items-center justify-center shadow-inner">
                    {team?.image ? (
                       <img src={team.image} alt={team.name} className="w-full h-full object-cover" />
                    ) : (
                       <span className="text-[#dba032] font-bold text-3xl">
                         {team?.name?.charAt(0)?.toUpperCase()}
                       </span>
                    )}
                 </div>
              </div>
              <h3 className="font-bold text-lg leading-tight line-clamp-2" title={team?.name}>{team?.name}</h3>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex-1 px-4 space-y-2 pb-6">
              <Link 
                href={`/season/${joinCode}`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/20 font-semibold transition-colors shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>
                Sezona
              </Link>
              <Link 
                href={`/season/${joinCode}/standings`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 font-medium transition-colors opacity-80 hover:opacity-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
                Lestvica
              </Link>
              <Link 
                href={`/season/${joinCode}/payments`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 font-medium transition-colors opacity-80 hover:opacity-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>
                Plačila
              </Link>
              <Link 
                href={`/season/${joinCode}/settings`}
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 font-medium transition-colors opacity-80 hover:opacity-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99L4.227 8.252a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Nastavitve
              </Link>
          </nav>
        </aside>

        {/* MAIN CONTENT PORTION */}
        <main className="flex-1 overflow-y-auto w-full p-4 md:p-8">
          {children}
        </main>
      </div>

    </div>
  );
}
