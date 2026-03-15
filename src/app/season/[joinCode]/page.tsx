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
            <button className="bg-[#6db59c] hover:bg-[#5ca087] transition-colors text-white font-medium px-4 py-2.5 rounded-[10px] text-[15px] flex items-center gap-1.5 shadow-sm">
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
            <button className="bg-[#6db59c] hover:bg-[#5ca087] transition-colors text-white font-medium px-4 py-2.5 rounded-[10px] text-[15px] flex items-center gap-1.5 shadow-sm">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]"><path d="M11 5a3 3 0 11-6 0 3 3 0 016 0zM2.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 018 18a9.953 9.953 0 01-5.385-1.572zM16.25 5.75a.75.75 0 00-1.5 0v2h-2a.75.75 0 000 1.5h2v2a.75.75 0 001.5 0v-2h2a.75.75 0 000-1.5h-2v-2z" /></svg>
               Dodaj igralce
            </button>
         </div>

         {/* Players List Container */}
         <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 flex-1 flex flex-col p-4">
            
            {/* Birthday Alert Block */}
            <div className="flex items-stretch mb-5 overflow-hidden">
               <div className="flex-1 bg-[#fbf1ce] rounded-l-[8px] py-3 px-4 flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px] text-[#efc463] shrink-0"><path fillRule="evenodd" d="M11.25 2.25a.75.75 0 0 1 1.5 0v2.818c.335-.114.68-.198 1.036-.245.986-.131 1.956.12 2.688.753.692.599 1.026 1.487 1.026 2.424 0 .937-.334 1.825-1.026 2.424-.492.426-1.077.674-1.683.743L14.75 14.5a.75.75 0 0 1-1.5 0v-4h-2.5v4a.75.75 0 0 1-1.5 0v-3.332c-.606-.069-1.191-.317-1.683-.743-.692-.599-1.026-1.487-1.026-2.424 0-.937.334-1.825 1.026-2.424.732-.633 1.702-.884 2.688-.753.355.047.7.131 1.036.245V2.25Zm-3.5 13.5c-1.397.058-2.529.434-3.264 1.025-.572.46-.861 1.066-.861 1.725s.289 1.265.861 1.725c1.076.866 3.193 1.375 5.464 1.375s4.388-.509 5.464-1.375c.572-.46.861-1.065.861-1.725s-.289-1.265-.861-1.725c-.735-.591-1.867-.967-3.264-1.025v2.25a.75.75 0 0 1-1.5 0v-2.25h-2.5v2.25a.75.75 0 0 1-1.5 0v-2.25ZM11.054 7c.48.096.945.244 1.392.443a.75.75 0 0 1-.39 1.4c-.606-.234-1.258-.2-1.834.19-.516.349-.722.846-.722 1.341s.206.992.722 1.34c.734.498 1.666.498 2.399 0 .516-.348.722-.845.722-1.34 0-.495-.206-.992-.722-1.341a.75.75 0 1 1 .843-1.246c.928.628 1.385 1.583 1.385 2.587 0 1.004-.457 1.96-1.385 2.587-1.127.763-2.618.763-3.744 0C8.328 10.59 8.8 8.8 8.8 8.8c0-1.004.457-1.959 1.385-2.587A4.62 4.62 0 0 1 11.054 7Z" clipRule="evenodd" /></svg>
                  <span className="text-[13px] sm:text-[14px] text-[#efc463] font-bold tracking-wide truncate">Naslednji časti: Žiga Kirsanov 06.09.2026</span>
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
