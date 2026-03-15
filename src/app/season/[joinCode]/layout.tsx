import React from "react";
import Link from "next/link";

export default function SeasonLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { joinCode: string };
}) {
  const { joinCode } = params;

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row bg-[#F4F6F8] font-sans overflow-hidden">
      {/* LEFT SIDEBAR (Hidden on mobile by default, will need a toggle later) */}
      <aside className="hidden md:flex flex-col w-64 bg-[#dba032] text-white shrink-0 shadow-lg z-20">
        {/* Logo Area */}
        <div className="p-6">
          <Link href="/teams" className="flex items-center gap-2">
             <img src="/logo_white.svg" alt="Sport2Go" className="h-6" />
             <span className="font-bold text-xl tracking-tight hidden">SPORT2GO</span>
          </Link>
        </div>

        {/* Team/User Context Profile */}
        <div className="flex flex-col items-center mt-4 px-6 mb-8 text-center">
            <div className="w-24 h-24 rounded-full bg-white/20 p-1 mb-3">
               <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
                  <span className="text-gray-400 font-bold text-2xl">Team</span>
               </div>
            </div>
            <h3 className="font-bold text-lg leading-tight">Ime Ekipe</h3>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 px-4 space-y-2">
            <Link 
              href={`/season/${joinCode}`}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/20 font-semibold transition-colors"
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

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col h-[100dvh] overflow-hidden">
        
        {/* TOP HEADER */}
        <header className="h-16 md:h-20 bg-[#ecc56e] flex items-center justify-between px-4 md:px-8 shrink-0 z-10 relative">
           
           {/* Mobile Only Logo (when sidebar hidden) */}
           <div className="md:hidden flex items-center">
             <Link href="/teams">
               <span className="font-bold text-white">SPORT2GO</span>
             </Link>
           </div>
           
           {/* Center Context Switchers */}
           <div className="hidden md:flex flex-1 justify-center items-center gap-4">
              <button className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                EKIPA: N/A
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
              </button>
              
              <button className="flex items-center gap-2 bg-[#d7931f] hover:bg-[#c2841c] text-white font-bold px-4 py-2 rounded-lg transition-colors text-sm shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                SEZONA: N/A
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
              </button>
           </div>

           {/* Right Nav Actions */}
           <div className="flex items-center gap-3">
             <Link href="/teams" className="flex flex-col items-center justify-center text-white/90 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" /></svg>
                <span className="text-[10px] font-bold uppercase mt-0.5">Ekipe</span>
             </Link>
             <Link href="/profile" className="flex flex-col items-center justify-center text-white/90 hover:text-white transition-colors ml-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                <span className="text-[10px] font-bold uppercase mt-0.5">Profil</span>
             </Link>
             <button className="w-8 h-8 rounded-full ml-2 overflow-hidden border border-white/20">
                <img src="https://flagcdn.com/w40/si.png" alt="SL" className="w-full h-full object-cover" />
             </button>
           </div>

        </header>

        {/* PAGE CONTENT CONTAINER */}
        <main className="flex-1 overflow-y-auto w-full p-4 md:p-8">
          {children}
        </main>

      </div>
    </div>
  );
}
