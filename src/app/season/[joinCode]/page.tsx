"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { use } from "react";

export default function SeasonDashboardPage({ params }: { params: Promise<{ joinCode: string }> }) {
  const { joinCode } = use(params);

  // Temporary mock data layout until we connect backend queries
  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      
      {/* CENTER COLUMN: Events (Dogodki) */}
      <div className="flex-1 flex flex-col h-full bg-transparent overflow-hidden">
         <div className="flex items-center justify-between mb-6 shrink-0 mt-2">
            <h1 className="text-[26px] font-bold text-gray-800 tracking-tight" style={{fontFamily: 'var(--font-montserrat)'}}>
              Dogodki
            </h1>
            <button className="bg-[#6db59c] hover:bg-[#5ca087] transition-colors text-white font-medium h-[40px] px-4 rounded-lg text-[14px] flex items-center gap-1.5 shadow-sm">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
               Nov dogodek
            </button>
         </div>

         {/* Filters Row */}
         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 flex items-center gap-4 shrink-0">
            <div className="flex-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Status</label>
              <select className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none focus:border-[#5ba582]">
                 <option>Vsi statusi</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Tip dogodka</label>
              <select className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none focus:border-[#5ba582]">
                 <option>Vsi tipi dogodkov</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">Lokacija</label>
              <select className="w-full bg-gray-50 border border-gray-100 rounded-lg px-3 py-2 text-sm text-gray-600 outline-none focus:border-[#5ba582]">
                 <option>Vse lokacije</option>
              </select>
            </div>
         </div>

         {/* Events List Scrollable Area */}
         <div className="flex-1 overflow-y-auto pr-2 space-y-4 pb-10">
            {/* Empty State / Placeholder */}
            <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500 shadow-sm flex flex-col items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 text-gray-300 mb-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                <p className="font-bold text-gray-700">Ni ustvarjenih dogodkov</p>
                <p className="text-sm mt-1 max-w-sm mx-auto">Kliknite na gumb "Nov dogodek" za ustvarjanje prve tekme ali treninga v tej sezoni.</p>
            </div>
         </div>
      </div>

      {/* RIGHT COLUMN: Players (Igralci) */}
      <div className="w-full lg:w-[320px] xl:w-[380px] flex flex-col h-full shrink-0">
         <div className="flex items-center justify-between mb-6 shrink-0 mt-2">
            <h2 className="text-[26px] font-bold text-gray-800 flex items-center gap-3 tracking-tight" style={{fontFamily: 'var(--font-montserrat)'}}>
              Igralci <span className="flex items-center justify-center bg-[#f0c265] text-white text-[15px] font-bold w-8 h-8 rounded-full leading-none pt-px">15</span>
            </h2>
            <button className="bg-[#6db59c] hover:bg-[#5ca087] transition-colors text-white font-medium h-[40px] px-4 rounded-lg text-[14px] flex items-center gap-1.5 shadow-sm">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]"><path d="M11 5a3 3 0 11-6 0 3 3 0 016 0zM2.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 018 18a9.953 9.953 0 01-5.385-1.572zM16.25 5.75a.75.75 0 00-1.5 0v2h-2a.75.75 0 000 1.5h2v2a.75.75 0 001.5 0v-2h2a.75.75 0 000-1.5h-2v-2z" /></svg>
               Dodaj igralce
            </button>
         </div>

         {/* Players List Container */}
         <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 flex-1 flex flex-col p-4">
            
            {/* Birthday Alert Block */}
            <div className="flex items-stretch mb-5 overflow-hidden">
               <div className="flex-1 bg-[#fbf1ce] rounded-l-[8px] py-3 px-4 flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px] text-[#efc463] shrink-0"><path fillRule="evenodd" d="M11 2a1 1 0 011 1v1.171a3.001 3.001 0 012 2.829h1a3.001 3.001 0 012-2.829V3a1 1 0 112 0v1.171a5.002 5.002 0 00-6-3.172V3a1 1 0 01-1-1zm-4 4.171a5.004 5.004 0 013-1.168V3a1 1 0 112 0v2.003L12 5h1a2 2 0 10-2-2 1 1 0 112 0 4 4 0 01-4 4H7a2 2 0 10-2-2 1 1 0 112 0 4 4 0 01-4 4v2a2 2 0 002 2h14a2 2 0 002-2v-2A6 6 0 005 6.171z" clipRule="evenodd" /></svg>
                  <span className="text-[11px] sm:text-[12px] text-[#efc463] font-bold tracking-wide truncate">Naslednji časti: Žiga Kirsanov 06.09.2026</span>
               </div>
               <div className="w-[8px] bg-[#efc463] shadow-sm rounded-r-[3px]"></div>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-1">
               {/* Empty Players State */}
               <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 py-10">
                  <p className="font-medium text-sm">V tej sezoni še ni igralcev.</p>
               </div>
            </div>
         </div>
      </div>
      
    </div>
  );
}
