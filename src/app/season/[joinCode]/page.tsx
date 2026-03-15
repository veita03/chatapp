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
            <button className="flex items-center justify-center space-x-1.5 bg-[#6db592] hover:bg-[#5b9e7e] text-white px-5 py-2.5 rounded-lg font-bold transition-colors shadow-sm text-sm">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
               <span>Nov dogodek</span>
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
            {/* Sample Event Card (Matches Mockup) */}
            <div className="bg-white rounded-[16px] border border-gray-100 shadow-sm flex flex-col overflow-hidden hover:border-gray-200 transition-colors cursor-pointer group">
               {/* Event Header Strip */}
               <div className="flex bg-[#efc463] text-white items-stretch">
                  {/* Date Block */}
                  <div className="flex flex-col items-center justify-center bg-[#e4ba5e] w-[65px] shrink-0 py-1.5 px-2">
                     <span className="text-[10px] font-bold uppercase tracking-wider text-white/90">Avg</span>
                     <span className="text-[22px] font-bold leading-none -mt-0.5">10</span>
                  </div>
                  
                  {/* Title & Tag */}
                  <div className="flex-1 px-4 py-2.5 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <span className="bg-white/25 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide uppercase">Družabno</span>
                        <h3 className="font-bold text-white text-[15px] truncate">Piknik in zaključek sezone</h3>
                     </div>
                     <div className="flex items-center gap-1.5 text-white/90">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-[14px] h-[14px] -mt-0.5"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" /></svg>
                        <span className="text-[13px] font-bold">18:00</span>
                     </div>
                  </div>
               </div>
               
               {/* Event Body */}
               <div className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex items-center gap-4 flex-1">
                     {/* Sport/Event Icon Avatar */}
                     <div className="w-[42px] h-[42px] shrink-0 rounded-full border border-gray-100 flex items-center justify-center bg-[#fcfaf4] shadow-sm text-lg">
                        🍻
                     </div>
                     
                     {/* Location & Details */}
                     <div className="flex flex-col">
                        <p className="text-gray-500 text-[13px] leading-snug line-clamp-2 pr-4">
                           Zbrali se bomo na običajnem mestu za piknike. S seboj prinesite pijačo, hrano pa...
                        </p>
                     </div>
                  </div>
                  
                  {/* Right Action / Location */}
                  <div className="w-full sm:w-auto flex items-center sm:justify-end shrink-0 gap-3 pt-2 sm:pt-0 border-t border-gray-50 sm:border-0 mt-2 sm:mt-0">
                     <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-[12px] h-[12px] text-gray-400 mr-1.5"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11-.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" /></svg>
                        <span className="text-[12px] font-bold text-gray-600">Športni park</span>
                     </div>
                     <div className="flex -space-x-1.5">
                        <div className="w-7 h-7 rounded-full bg-green-100 border-2 border-white flex items-center justify-center text-green-600 text-[10px] font-bold z-10">4</div>
                        <div className="w-7 h-7 rounded-full bg-red-100 border-2 border-white flex items-center justify-center text-red-600 text-[10px] font-bold z-0">1</div>
                     </div>
                  </div>
               </div>
            </div>
            
            {/* Sample Event Card 2 */}
            <div className="bg-white rounded-[16px] border border-gray-100 shadow-sm flex flex-col overflow-hidden hover:border-gray-200 transition-colors cursor-pointer group mb-4">
               {/* Event Header Strip (Gray Variant) */}
               <div className="flex bg-[#6db59c] text-white items-stretch">
                  <div className="flex flex-col items-center justify-center bg-[#5ca087] w-[65px] shrink-0 py-1.5 px-2">
                     <span className="text-[10px] font-bold uppercase tracking-wider text-white/90">Sep</span>
                     <span className="text-[22px] font-bold leading-none -mt-0.5">02</span>
                  </div>
                  <div className="flex-1 px-4 py-2.5 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <span className="bg-white/25 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide uppercase">Trening</span>
                        <h3 className="font-bold text-white text-[15px] truncate">Redni trening - kondicija</h3>
                     </div>
                     <div className="flex items-center gap-1.5 text-white/90">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-[14px] h-[14px] -mt-0.5"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" /></svg>
                        <span className="text-[13px] font-bold">19:30</span>
                     </div>
                  </div>
               </div>
               {/* Event Body */}
               <div className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                  <div className="flex items-center gap-4 flex-1">
                     <div className="w-[42px] h-[42px] shrink-0 rounded-full border border-gray-100 flex items-center justify-center bg-teal-50 shadow-sm text-teal-600">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" /><path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" /></svg>
                     </div>
                     <div className="flex flex-col">
                        <p className="text-gray-500 text-[13px] leading-snug line-clamp-2 pr-4">
                           Začnemo z ogrevanjem pol ure prej, nato dolgi teki in kondicijska priprava za prvo ligo.
                        </p>
                     </div>
                  </div>
                  <div className="w-full sm:w-auto flex items-center sm:justify-end shrink-0 gap-3 pt-2 sm:pt-0 border-t border-gray-50 sm:border-0 mt-2 sm:mt-0">
                     <div className="flex items-center bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-[12px] h-[12px] text-gray-400 mr-1.5"><path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11-.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.273 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" /></svg>
                        <span className="text-[12px] font-bold text-gray-600">Glavni stadion</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      {/* RIGHT COLUMN: Players (Igralci) */}
      <div className="w-full lg:w-[320px] xl:w-[380px] flex flex-col h-full shrink-0">
         <div className="flex items-center justify-between mb-6 shrink-0 mt-2">
            <h2 className="text-[26px] font-bold text-gray-800 flex items-center gap-3 tracking-tight" style={{fontFamily: 'var(--font-montserrat)'}}>
              Igralci <span className="flex items-center justify-center bg-[#f0c265] text-white text-[15px] font-bold w-8 h-8 rounded-full leading-none pt-px">15</span>
            </h2>
            <button className="flex items-center justify-center space-x-1.5 bg-[#6db592] hover:bg-[#5b9e7e] text-white px-5 py-2.5 rounded-lg font-bold transition-colors shadow-sm text-sm">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]"><path d="M11 5a3 3 0 11-6 0 3 3 0 016 0zM2.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 018 18a9.953 9.953 0 01-5.385-1.572zM16.25 5.75a.75.75 0 00-1.5 0v2h-2a.75.75 0 000 1.5h2v2a.75.75 0 001.5 0v-2h2a.75.75 0 000-1.5h-2v-2z" /></svg>
               <span>Dodaj igralce</span>
            </button>
         </div>

         {/* Players List Container */}
         <div className="bg-white rounded-[20px] shadow-sm border border-gray-100 flex-1 flex flex-col p-4">
            
            {/* Birthday Alert Block */}
            <div className="flex items-stretch mb-5 overflow-hidden">
               <div className="flex-1 bg-[#fbf1ce] rounded-l-[8px] py-2.5 px-3 flex items-center justify-center gap-2 text-[#e5b352]">
                  {/* Unambiguous classic Birthday Cake icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 shrink-0">
                     <path d="M12 2C11.4477 2 11 2.44772 11 3V5.59088C10.0818 5.86797 9.5 6.46743 9.5 7.5C9.5 8.3516 10.1557 9.38076 11 10.364V12H7C5.34315 12 4 13.3431 4 15V19C4 20.1046 4.89543 21 6 21H18C19.1046 21 20 20.1046 20 19V15C20 13.3431 18.6569 12 17 12H13V10.364C13.8443 9.38076 14.5 8.3516 14.5 7.5C14.5 6.46743 13.9182 5.86797 13 5.59088V3C13 2.44772 12.5523 2 12 2ZM9 15C9.55228 15 10 14.5523 10 14H14C14 14.5523 14.4477 15 15 15C15.5523 15 16 14.5523 16 14H17C17.5523 14 18 14.4477 18 15V16C16.8954 16 16 16.8954 16 18C16 19.1046 16.8954 20 18 20H6C7.10457 20 8 19.1046 8 18C8 16.8954 7.10457 16 6 16V15C6 14.4477 6.44772 14 7 14H8C8 14.5523 8.44772 15 9 15ZM12 7C12.3333 7 12.5 7.16667 12.5 7.5C12.5 7.95758 12.1895 8.71803 11.5 9.47959C10.8105 8.71803 10.5 7.95758 10.5 7.5C10.5 7.16667 10.6667 7 11 7H12Z" />
                  </svg>
                  <span className="text-[10px] font-bold tracking-wide truncate">Naslednji časti: Žiga Kirsanov 06.09.2026</span>
               </div>
               <div className="w-[5px] bg-[#efc463] shadow-inner rounded-r-[3px]"></div>
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
