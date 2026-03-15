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
            {/* Sample Event Card 1 (Matches Complex Mockup) */}
            <div className="bg-white rounded-[16px] border border-gray-100 shadow-sm flex flex-col overflow-hidden hover:border-gray-200 transition-colors cursor-pointer group mb-4">
               {/* Event Header Strip */}
               <div className="flex bg-[#efc463] text-white items-stretch">
                  <div className="flex flex-col items-center justify-center bg-[#e4ba5e] w-[65px] shrink-0 py-1.5 px-2">
                     <span className="text-[10px] font-bold uppercase tracking-wider text-white/90">Avg</span>
                     <span className="text-[22px] font-bold leading-none -mt-0.5">10</span>
                  </div>
                  <div className="flex-1 px-4 py-2.5 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <span className="bg-white/25 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide uppercase">Družabno</span>
                        <h3 className="font-bold text-white text-[15px] truncate">Piknik in zaključek sezone</h3>
                     </div>
                     <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                        {/* Top Right Action Buttons from Mockup */}
                        <button className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
                        </button>
                        <button className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white text-[11px] font-bold tracking-wide">
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-[14px] h-[14px]"><path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" /><path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                           Ogled dogodka
                        </button>
                        <button className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path d="M3 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM8.5 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM15.5 8.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" /></svg>
                        </button>
                     </div>
                  </div>
               </div>
               
               {/* Event Body */}
               <div className="p-4 sm:p-5 flex flex-col gap-4">
                  {/* Row 1: Time and Location details */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-gray-400 font-medium text-[13px]">
                     <div className="flex items-center gap-2 border-r border-gray-100 pr-3 sm:pr-5">
                        <div className="bg-[#fdfaf1] text-[#efc463] p-1.5 rounded-md border border-[#fbf1ce]">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[14px] h-[14px]"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" /></svg>
                        </div>
                        <span>Ponedeljek, 10.08.2026</span>
                     </div>
                     <div className="flex items-center gap-2 border-r border-gray-100 pr-3 sm:pr-5">
                        <div className="bg-[#fdfaf1] text-[#efc463] p-1.5 rounded-md border border-[#fbf1ce]">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[14px] h-[14px]"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <span>18:00 - 22:00</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="bg-[#fdfaf1] text-[#efc463] p-1.5 rounded-md border border-[#fbf1ce]">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[14px] h-[14px]"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                        </div>
                        <span>Športni park Studenci Maribor</span>
                     </div>
                  </div>
                  
                  <hr className="border-t border-dashed border-gray-200" />
                  
                  {/* Row 2: Statuses and Avatars */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                     <div className="flex flex-col gap-2.5">
                        <div className="flex items-center gap-2.5 text-[#e5b352]">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[15px] h-[15px]"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3zM10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" /></svg>
                           <span className="text-[13px] font-medium tracking-wide">Ni roka za prijavo</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-[#5ba582]">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[15px] h-[15px]"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>
                           <span className="text-[13px] font-medium tracking-wide">Dogodek ni plačljiv.</span>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-1 shrink-0 bg-transparent pr-2">
                        <div className="flex -space-x-3">
                           {[1, 2, 3, 4, 5, 6].map((i) => (
                              <div key={i} className="w-[30px] h-[30px] rounded-full bg-teal-100 border-[2.5px] border-white overflow-hidden flex items-center justify-center shrink-0 shadow-sm relative z-0">
                                 {/* Simple silhouette for mock */}
                                 <svg className="w-5 h-5 text-teal-600 mt-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                              </div>
                           ))}
                        </div>
                        <div className="bg-[#e4ba5e] text-white text-[13px] font-bold px-3 py-1 pb-1.5 rounded-full relative -ml-1 z-10 shadow-sm" style={{clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 15% 100%, 0 50%)', paddingLeft: '14px', marginRight: '-6px'}}>
                           6 / 14
                        </div>
                     </div>
                  </div>
                  
                  <hr className="border-t border-dashed border-gray-200" />
                  
                  {/* Row 3: Action Buttons */}
                  <div className="bg-[#fefaf3] rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full">
                     <span className="text-[#e5b352] text-[14px] font-bold flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 -scale-x-100"><path fillRule="evenodd" d="M14.707 9.293a1 1 0 00-1.414 0L11 11.586V3a1 1 0 00-2 0v8.586L6.707 9.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 000-1.414z" clipRule="evenodd" /></svg>
                        Odzovi se:
                     </span>
                     <div className="flex items-center gap-3">
                        <button className="bg-white border-[1.5px] border-[#6db59c] text-[#6db59c] px-6 py-1.5 rounded-full font-bold text-[14px] hover:bg-[#6db59c] hover:text-white transition-colors shadow-sm tracking-wide">
                           Pridem
                        </button>
                        <button className="bg-white border-[1.5px] border-[#e18e8a] text-[#e18e8a] px-5 py-1.5 rounded-full font-bold text-[14px] hover:bg-[#e18e8a] hover:text-white transition-colors shadow-sm tracking-wide">
                           Ne pridem
                        </button>
                     </div>
                  </div>
               </div>
            </div>
            
            {/* Sample Event Card 2 (Already RSVP'd State) */}
            <div className="bg-white rounded-[16px] border border-gray-100 shadow-sm flex flex-col overflow-hidden hover:border-gray-200 transition-colors cursor-pointer group mb-4">
               {/* Event Header Strip (Gray Variant) */}
               <div className="flex bg-[#6db59c] text-white items-stretch">
                  <div className="flex flex-col items-center justify-center bg-[#5ca087] w-[65px] shrink-0 py-1.5 px-2">
                     <span className="text-[10px] font-bold uppercase tracking-wider text-white/90">Sep</span>
                     <span className="text-[22px] font-bold leading-none -mt-0.5">02</span>
                  </div>
                  <div className="flex-1 px-4 py-2.5 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <span className="bg-white/25 text-white text-[10px] font-bold px-2 py-0.5 rounded-md tracking-wide uppercase">Trening</span>
                        <h3 className="font-bold text-white text-[15px] truncate">Redni trening - kondicija</h3>
                     </div>
                     <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
                        <button className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
                        </button>
                        <button className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white text-[11px] font-bold tracking-wide">
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-[14px] h-[14px]"><path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" /><path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                           Ogled dogodka
                        </button>
                        <button className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path d="M3 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM8.5 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM15.5 8.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" /></svg>
                        </button>
                     </div>
                  </div>
               </div>
               {/* Event Body */}
               <div className="p-4 sm:p-5 flex flex-col gap-4">
                  <div className="flex flex-wrap items-center gap-3 sm:gap-5 text-gray-400 font-medium text-[13px]">
                     <div className="flex items-center gap-2 border-r border-gray-100 pr-3 sm:pr-5">
                        <div className="bg-[#fcfaf4] text-[#e5b352] p-1.5 rounded-md border border-gray-100">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[14px] h-[14px]"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" /></svg>
                        </div>
                        <span>Ponedeljek, 02.09.2026</span>
                     </div>
                     <div className="flex items-center gap-2 border-r border-gray-100 pr-3 sm:pr-5">
                        <div className="bg-[#fcfaf4] text-[#e5b352] p-1.5 rounded-md border border-gray-100">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[14px] h-[14px]"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <span>19:30 - 21:00</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <div className="bg-[#fcfaf4] text-[#e5b352] p-1.5 rounded-md border border-gray-100">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[14px] h-[14px]"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                        </div>
                        <span>Glavni stadion Maribor</span>
                     </div>
                  </div>
                  
                  <hr className="border-t border-dashed border-gray-200" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                     <div className="flex flex-col gap-2.5">
                        <div className="flex items-center gap-2.5 text-[#e5b352]">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[15px] h-[15px]"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3zM10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" /></svg>
                           <span className="text-[13px] font-medium tracking-wide">Rok za prijavo do jutri.</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-[#5ba582]">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[15px] h-[15px]"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>
                           <span className="text-[13px] font-medium tracking-wide">Dogodek ni plačljiv.</span>
                        </div>
                     </div>
                     <div className="flex items-center gap-1 shrink-0 bg-transparent pr-2">
                        <div className="flex -space-x-3">
                           {[1, 2, 3].map((i) => (
                              <div key={i} className="w-[30px] h-[30px] rounded-full bg-orange-100 border-[2.5px] border-white overflow-hidden flex items-center justify-center shrink-0 shadow-sm relative z-0">
                                 <svg className="w-5 h-5 text-orange-400 mt-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                              </div>
                           ))}
                        </div>
                        <div className="bg-[#5ba582] text-white text-[13px] font-bold px-3 py-1 pb-1.5 rounded-full relative -ml-1 z-10 shadow-sm" style={{clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 15% 100%, 0 50%)', paddingLeft: '14px', marginRight: '-6px'}}>
                           14 / 14
                        </div>
                     </div>
                  </div>
                  
                  <hr className="border-t border-dashed border-gray-200" />
                  
                  {/* Row 3: Action Buttons (Already accepted state) */}
                  <div className="bg-[#fefaf3] rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 w-full shadow-inner border border-[#fef1d8]">
                     <span className="text-[#e5b352] text-[14px] font-bold flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 -scale-x-100"><path fillRule="evenodd" d="M14.707 9.293a1 1 0 00-1.414 0L11 11.586V3a1 1 0 00-2 0v8.586L6.707 9.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 000-1.414z" clipRule="evenodd" /></svg>
                        Tvoj odziv:
                     </span>
                     <div className="flex items-center gap-3">
                        <button className="bg-[#6db59c] text-white px-8 py-1.5 rounded-full font-bold text-[14px] hover:bg-[#5b9e7e] transition-colors flex items-center gap-2 shadow-md hover:shadow-lg">
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-[18px] h-[18px]"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                           Pridem
                        </button>
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
