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
         <div className="flex items-center justify-between mb-4 shrink-0 mt-0">
            <h1 className="text-[26px] font-bold text-gray-800 tracking-tight" style={{fontFamily: 'var(--font-montserrat)'}}>
              Dogodki
            </h1>
            <button className="flex items-center justify-center space-x-1.5 bg-[#6db592] hover:bg-[#5b9e7e] text-white px-5 py-2.5 rounded-lg font-bold transition-colors shadow-sm text-sm">
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
               <span>Nov dogodek</span>
            </button>
         </div>

         {/* Filters Row */}
         <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3 mb-4 flex items-center gap-4 shrink-0">
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
         <div className="flex-1 overflow-y-auto pr-2 space-y-3 pb-10 custom-scrollbar">
            {/* Sample Event Card 1 (Matches Complex Mockup) */}
            <div className="bg-white rounded-[14px] border border-gray-100 shadow-sm flex flex-col overflow-hidden hover:border-gray-200 transition-colors cursor-pointer group">
               {/* Event Header Strip */}
               <div className="flex bg-[#efc463] text-white items-stretch">
                  <div className="flex flex-col items-center justify-center bg-[#e4ba5e] w-[60px] shrink-0 py-1.5 px-2">
                     <span className="text-[9px] font-bold uppercase tracking-wider text-white/90">Avg</span>
                     <span className="text-xl font-bold leading-none -mt-0.5">10</span>
                  </div>
                  <div className="flex-1 px-4 py-2 flex items-center justify-between relative">
                     <div className="flex items-center gap-2">
                        <span className="bg-white/25 text-white text-[9px] font-bold px-2 py-0.5 rounded-md tracking-wide uppercase">Družabno</span>
                        <h3 className="font-bold text-white text-[14px] truncate">Piknik in zaključek sezone</h3>
                     </div>
                     <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5">
                        {/* Share Button with Dropdown Mockup */}
                        <div className="relative group/share">
                           <button className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[11px] h-[11px]"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
                           </button>
                           {/* Popup Window positioned below */}
                           <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 p-4 opacity-0 invisible group-hover/share:opacity-100 group-hover/share:visible transition-all z-50">
                              <h4 className="text-center font-bold text-gray-600 text-[13px] mb-3">Povabi v aplikaciji</h4>
                              <div className="flex items-center justify-center gap-3 mb-4">
                                 <button className="w-9 h-9 rounded-full bg-[#efc463] text-white flex items-center justify-center hover:bg-[#e4ba5e] transition-colors"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg></button>
                                 <button className="w-9 h-9 rounded-full bg-[#efc463] text-white flex items-center justify-center hover:bg-[#e4ba5e] transition-colors"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75C10.669 21.75 9.68 21.5 8.752 21.05l-4.437.88a.75.75 0 01-.89-.893l.876-4.445A9.704 9.704 0 012.25 12zm13.12-2.348a.75.75 0 00-1.04-.207l-3.329 2.22-1.942-1.942a.75.75 0 00-1.06 0l-3 3a.75.75 0 101.06 1.06l1.942-1.942 3.328 2.22a.75.75 0 001.06 0l4-4a.75.75 0 00-.207-1.04l-.013-.008z" clipRule="evenodd" /></svg></button>
                                 <button className="w-9 h-9 rounded-full bg-[#efc463] text-white flex items-center justify-center hover:bg-[#e4ba5e] transition-colors"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223zM8.25 10.875a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25zM10.875 12a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0zm4.875-1.125a1.125 1.125 0 100 2.25 1.125 1.125 0 000-2.25z" clipRule="evenodd" /></svg></button>
                                 <button className="w-9 h-9 rounded-full bg-[#efc463] text-white flex items-center justify-center hover:bg-[#e4ba5e] transition-colors"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M4.848 2.771A49.144 49.144 0 0112 2.25c2.43 0 4.817.178 7.152.52 1.978.292 3.348 2.024 3.348 3.97v6.02c0 1.946-1.37 3.678-3.348 3.97-1.94.284-3.916.455-5.922.505a.39.39 0 00-.266.112L8.78 21.53A.75.75 0 017.5 21v-3.955a48.842 48.842 0 01-2.652-.316c-1.978-.29-3.348-2.024-3.348-3.97V6.741c0-1.946 1.37-3.68 3.348-3.97zM6.75 8.25a.75.75 0 01.75-.75h9a.75.75 0 010 1.5h-9a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5H12a.75.75 0 000-1.5H7.5z" clipRule="evenodd" /></svg></button>
                              </div>
                              <h4 className="text-center font-bold text-gray-600 text-[13px] mb-2">ali kopiraj povezavo</h4>
                              <div className="flex bg-gray-50 rounded-lg p-1 border border-gray-200">
                                 <input type="text" readOnly value="https://www.sport2go.app/ev..." className="bg-transparent text-[11px] px-2 flex-1 text-gray-600 outline-none w-full" />
                                 <button className="bg-[#6db59c] hover:bg-[#5b9e7e] text-white text-[12px] font-bold px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /></svg>
                                    Kopiraj
                                 </button>
                              </div>
                           </div>
                        </div>

                        <button className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white text-[10px] font-bold tracking-wide">
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" /><path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                           Ogled dogodka
                        </button>
                        <button className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-[11px] h-[11px]"><path d="M3 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM8.5 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM15.5 8.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" /></svg>
                        </button>
                     </div>
                  </div>
               </div>
               
               {/* Event Body */}
               <div className="p-3 sm:p-4 sm:pb-3 flex flex-col gap-2">
                  {/* Row 1: Time and Location details */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-gray-400 font-medium text-[12px]">
                     <div className="flex items-center gap-1.5 border-r border-gray-100 pr-2 sm:pr-4">
                        <div className="bg-[#fdfaf1] text-[#efc463] p-1.5 rounded-md border border-[#fbf1ce]">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" /></svg>
                        </div>
                        <span>10.08.2026</span>
                     </div>
                     <div className="flex items-center gap-1.5 border-r border-gray-100 pr-2 sm:pr-4">
                        <div className="bg-[#fdfaf1] text-[#efc463] p-1.5 rounded-md border border-[#fbf1ce]">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <span>18:00 - 22:00</span>
                     </div>
                     <div className="flex items-center gap-1.5">
                        <div className="bg-[#fdfaf1] text-[#efc463] p-1.5 rounded-md border border-[#fbf1ce]">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                        </div>
                        <span className="truncate max-w-[150px]">Športni park Studenci Maribor</span>
                     </div>
                  </div>
                  
                  <hr className="border-t border-dashed border-gray-100" />
                  
                  {/* Row 2: Statuses and Avatars */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                     <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2 text-[#e5b352]">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3zM10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" /></svg>
                           <span className="text-[11px] font-medium tracking-wide">Ni roka za prijavo</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#5ba582]">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>
                           <span className="text-[11px] font-medium tracking-wide">Dogodek ni plačljiv.</span>
                        </div>
                     </div>
                     
                     <div className="flex items-center gap-1 shrink-0 bg-transparent pr-1">
                        <div className="flex -space-x-2.5">
                           {[1, 2, 3, 4, 5, 6].map((i) => (
                              <div key={i} className="w-[24px] h-[24px] rounded-full bg-teal-100 border-2 border-white overflow-hidden flex items-center justify-center shrink-0 shadow-sm relative z-0">
                                 {/* Simple silhouette for mock */}
                                 <svg className="w-4 h-4 text-teal-600 mt-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                              </div>
                           ))}
                        </div>
                        <div className="bg-[#e4ba5e] text-white text-[11px] font-bold px-2 py-0.5 pb-1 rounded-full relative -ml-1 z-10 shadow-sm" style={{clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 15% 100%, 0 50%)', paddingLeft: '10px', marginRight: '-4px'}}>
                           6 / 14
                        </div>
                     </div>
                  </div>
                  
                  <hr className="border-t border-dashed border-gray-100" />
                  
                  {/* Row 3: Action Buttons */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full pt-1">
                     <span className="text-gray-500 text-[12px] font-semibold flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-[14px] h-[14px] -scale-x-100"><path fillRule="evenodd" d="M14.707 9.293a1 1 0 00-1.414 0L11 11.586V3a1 1 0 00-2 0v8.586L6.707 9.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 000-1.414z" clipRule="evenodd" /></svg>
                        Odzovi se:
                     </span>
                     <div className="flex items-center gap-2">
                        <button className="bg-white border text-[#6db59c] border-[#6db59c] px-4 py-1.5 rounded-full font-bold text-[12px] hover:bg-[#6db59c] hover:text-white transition-colors shadow-sm tracking-wide">
                           Pridem
                        </button>
                        <button className="bg-white border text-[#e18e8a] border-[#e18e8a] px-4 py-1.5 rounded-full font-bold text-[12px] hover:bg-[#e18e8a] hover:text-white transition-colors shadow-sm tracking-wide">
                           Ne pridem
                        </button>
                     </div>
                  </div>
               </div>
            </div>
            
            {/* Sample Event Card 2 (Already RSVP'd State) */}
            <div className="bg-white rounded-[14px] border border-gray-100 shadow-sm flex flex-col overflow-hidden hover:border-gray-200 transition-colors cursor-pointer group mb-3">
               {/* Event Header Strip (Gray Variant) */}
               <div className="flex bg-[#6db59c] text-white items-stretch">
                  <div className="flex flex-col items-center justify-center bg-[#5ca087] w-[60px] shrink-0 py-1.5 px-2">
                     <span className="text-[9px] font-bold uppercase tracking-wider text-white/90">Sep</span>
                     <span className="text-xl font-bold leading-none -mt-0.5">02</span>
                  </div>
                  <div className="flex-1 px-4 py-2 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <span className="bg-white/25 text-white text-[9px] font-bold px-2 py-0.5 rounded-md tracking-wide uppercase">Trening</span>
                        <h3 className="font-bold text-white text-[14px] truncate">Redni trening - kondicija</h3>
                     </div>
                     <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5">
                        <button className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[11px] h-[11px]"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
                        </button>
                        <button className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors text-white text-[10px] font-bold tracking-wide">
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" /><path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                           Ogled dogodka
                        </button>
                        <button className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-[11px] h-[11px]"><path d="M3 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM8.5 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zM15.5 8.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" /></svg>
                        </button>
                     </div>
                  </div>
               </div>
               {/* Event Body */}
               <div className="p-3 sm:p-4 sm:pb-3 flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-gray-400 font-medium text-[12px]">
                     <div className="flex items-center gap-1.5 border-r border-gray-100 pr-2 sm:pr-4">
                        <div className="bg-[#fcfaf4] text-[#e5b352] p-1.5 rounded-md border border-gray-100">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" /></svg>
                        </div>
                        <span>02.09.2026</span>
                     </div>
                     <div className="flex items-center gap-1.5 border-r border-gray-100 pr-2 sm:pr-4">
                        <div className="bg-[#fcfaf4] text-[#e5b352] p-1.5 rounded-md border border-gray-100">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <span>19:30 - 21:00</span>
                     </div>
                     <div className="flex items-center gap-1.5">
                        <div className="bg-[#fcfaf4] text-[#e5b352] p-1.5 rounded-md border border-gray-100">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                        </div>
                        <span className="truncate max-w-[150px]">Glavni stadion Maribor</span>
                     </div>
                  </div>
                  
                  <hr className="border-t border-dashed border-gray-100" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                     <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2 text-[#e5b352]">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3zM10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" /></svg>
                           <span className="text-[11px] font-medium tracking-wide">Rok za prijavo do jutri.</span>
                        </div>
                        <div className="flex items-center gap-2 text-[#5ba582]">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>
                           <span className="text-[11px] font-medium tracking-wide">Dogodek ni plačljiv.</span>
                        </div>
                     </div>
                     <div className="flex items-center gap-1 shrink-0 bg-transparent pr-1">
                        <div className="flex -space-x-2.5">
                           {[1, 2, 3].map((i) => (
                              <div key={i} className="w-[24px] h-[24px] rounded-full bg-orange-100 border-2 border-white overflow-hidden flex items-center justify-center shrink-0 shadow-sm relative z-0">
                                 <svg className="w-4 h-4 text-orange-400 mt-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                              </div>
                           ))}
                        </div>
                        <div className="bg-[#5ba582] text-white text-[11px] font-bold px-2 py-0.5 pb-1 rounded-full relative -ml-1 z-10 shadow-sm" style={{clipPath: 'polygon(15% 0, 100% 0, 100% 100%, 15% 100%, 0 50%)', paddingLeft: '10px', marginRight: '-4px'}}>
                           14 / 14
                        </div>
                     </div>
                  </div>
                  
                  <hr className="border-t border-dashed border-gray-100" />
                  
                  {/* Row 3: Action Buttons (Already accepted state) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full pt-1">
                     <span className="text-gray-500 text-[12px] font-semibold flex items-center gap-1.5">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-[14px] h-[14px] -scale-x-100"><path fillRule="evenodd" d="M14.707 9.293a1 1 0 00-1.414 0L11 11.586V3a1 1 0 00-2 0v8.586L6.707 9.293a1 1 0 10-1.414 1.414l4 4a1 1 0 001.414 0l4-4a1 1 0 000-1.414z" clipRule="evenodd" /></svg>
                        Tvoj odziv:
                     </span>
                     <div className="flex items-center gap-2">
                        <button className="bg-[#6db59c] text-white px-6 py-1.5 rounded-full font-bold text-[12px] hover:bg-[#5b9e7e] transition-colors flex items-center gap-1.5 shadow-md hover:shadow-lg">
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                           Pridem
                        </button>
                     </div>
                  </div>
               </div>
            </div>
            
            {/* Sample Event Card 3 (Finished / Red variant) */}
            <div className="bg-white rounded-[14px] border border-gray-100 shadow-sm flex flex-col overflow-hidden opacity-80 hover:opacity-100 transition-opacity cursor-pointer group mb-3">
               {/* Event Header Strip (Red Variant) */}
               <div className="flex bg-[#fcf2f2] text-[#cd5c5a] border-b border-[#faeaea] items-stretch">
                  <div className="flex flex-col items-center justify-center bg-[#f8e4e3] border-r border-[#faeaea] w-[60px] shrink-0 py-1.5 px-2">
                     <span className="text-[9px] font-bold uppercase tracking-wider text-[#cd5c5a]/90">Feb</span>
                     <span className="text-xl font-bold leading-none -mt-0.5">23</span>
                  </div>
                  <div className="flex-1 px-4 py-2 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <span className="bg-[#eaf1ff] text-[#548bf2] text-[9px] font-bold px-2 py-0.5 rounded-md tracking-wide uppercase">Tekma</span>
                        <h3 className="font-bold text-gray-800 text-[14px] truncate">Fuzbal 23.2.2026</h3>
                        <span className="bg-[#cd5c5a] text-white text-[9px] font-bold px-2 py-0.5 rounded-md tracking-wide uppercase ml-1">Zaključeno</span>
                     </div>
                     <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5">
                        <button className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f8e4e3] hover:bg-[#facccc] transition-colors text-[#cd5c5a] text-[10px] font-bold tracking-wide">
                           <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" /><path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                           Ogled dogodka
                        </button>
                     </div>
                  </div>
               </div>
               
               {/* Event Body */}
               <div className="p-3 sm:p-4 sm:pb-3 flex flex-col gap-2 bg-[#fff6f5]">
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-gray-400 font-medium text-[12px]">
                     <div className="flex items-center gap-1.5 border-r border-[#fadee0] pr-2 sm:pr-4">
                        <div className="bg-[#fffcfc] text-[#efc463] p-1.5 rounded-md border border-[#faeaea]">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" /></svg>
                        </div>
                        <span>Ponedeljek, 23.02.2026</span>
                     </div>
                     <div className="flex items-center gap-1.5 border-r border-[#fadee0] pr-2 sm:pr-4">
                        <div className="bg-[#fffcfc] text-[#efc463] p-1.5 rounded-md border border-[#faeaea]">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <span>20:00 - 21:30</span>
                     </div>
                     <div className="flex items-center gap-1.5">
                        <div className="bg-[#fffcfc] text-[#efc463] p-1.5 rounded-md border border-[#faeaea]">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                        </div>
                        <span className="truncate max-w-[150px]">Športno društvo studenci Maribor</span>
                     </div>
                  </div>
                  
                  <hr className="border-t border-dashed border-[#fadee0]" />
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                     <div className="flex items-center gap-1.5 text-[#cd5c5a]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>
                        <span className="text-[12px] font-bold tracking-wide">Tvoj strošek: €</span>
                     </div>
                  </div>
               </div>
            </div></div>
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
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
               {/* Player Item - Paid Full */}
               <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group border border-transparent hover:border-gray-100">
                  <div className="relative">
                     <div className="w-10 h-10 rounded-full bg-[#fdfaf1] border border-[#fbf1ce] flex items-center justify-center text-[#efc463] font-bold shadow-sm">
                        ŽK
                     </div>
                     <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                     <h4 className="text-[13px] font-bold text-gray-800 truncate group-hover:text-[#efc463] transition-colors">Žiga Kirsanov</h4>
                     <p className="text-[11px] text-gray-400 font-medium truncate">Vezist • 22 nastopov</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                     <span className="bg-[#eef8f3] text-[#5ba582] text-[10px] font-bold px-2 py-0.5 rounded-md">Plačano</span>
                  </div>
               </div>

               {/* Player Item - Debt */}
               <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group border border-transparent hover:border-gray-100">
                  <div className="relative">
                     <div className="w-10 h-10 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 font-bold shadow-sm">
                        MV
                     </div>
                     <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                     <h4 className="text-[13px] font-bold text-gray-800 truncate group-hover:text-blue-500 transition-colors">Marko Vršič</h4>
                     <p className="text-[11px] text-gray-400 font-medium truncate">Napadalec • 18 nastopov</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                     <span className="bg-[#fcf2f2] text-[#cd5c5a] text-[10px] font-bold px-2 py-0.5 rounded-md">-15 €</span>
                  </div>
               </div>
               
               {/* Player Item - Missing */}
               <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group border border-transparent hover:border-gray-100 opacity-60">
                  <div className="relative">
                     <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 font-bold shadow-sm">
                        JN
                     </div>
                     <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-gray-400 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                     <h4 className="text-[13px] font-bold text-gray-600 truncate">Jure Novak</h4>
                     <p className="text-[11px] text-gray-400 font-medium truncate">Branilec • 12 nastopov</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                     <span className="text-gray-400 text-[10px] font-bold">Odsoten</span>
                  </div>
               </div>
               
               {/* Player Item - Normal */}
               <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group border border-transparent hover:border-gray-100">
                  <div className="relative">
                     <div className="w-10 h-10 rounded-full bg-[#fdfaf1] border border-[#fbf1ce] flex items-center justify-center text-[#efc463] font-bold shadow-sm">
                        AV
                     </div>
                     <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                     <h4 className="text-[13px] font-bold text-gray-800 truncate group-hover:text-[#efc463] transition-colors">Aljoša Veit</h4>
                     <p className="text-[11px] text-gray-400 font-medium truncate">Vratar • 25 nastopov</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                     <span className="bg-[#eef8f3] text-[#5ba582] text-[10px] font-bold px-2 py-0.5 rounded-md">Plačano</span>
                  </div>
               </div>
               
               {/* Player Item - Normal */}
               <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group border border-transparent hover:border-gray-100">
                  <div className="relative">
                     <div className="w-10 h-10 rounded-full bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-500 font-bold shadow-sm">
                        TB
                     </div>
                     <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-yellow-400 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                     <h4 className="text-[13px] font-bold text-gray-800 truncate group-hover:text-purple-500 transition-colors">Tomaž Bizjak</h4>
                     <p className="text-[11px] text-gray-400 font-medium truncate">Vezist • 20 nastopov</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                     <span className="bg-[#fcf2f2] text-[#cd5c5a] text-[10px] font-bold px-2 py-0.5 rounded-md">-5 €</span>
                  </div>
               </div>
               
               {/* Player Item - Normal */}
               <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group border border-transparent hover:border-gray-100">
                  <div className="relative">
                     <div className="w-10 h-10 rounded-full bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-500 font-bold shadow-sm">
                        LM
                     </div>
                     <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                     <h4 className="text-[13px] font-bold text-gray-800 truncate group-hover:text-pink-500 transition-colors">Luka Mlakar</h4>
                     <p className="text-[11px] text-gray-400 font-medium truncate">Napadalec • 15 nastopov</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                     <span className="text-gray-400 text-[10px] font-bold"></span>
                  </div>
               </div>
            </div>
         </div>
      </div>
      
    </div>
  );
}
