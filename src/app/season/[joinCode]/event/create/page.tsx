'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CreateEventPage({ params }: { params: Promise<{ joinCode: string }> }) {
  const router = useRouter();
  const { joinCode } = use(params);
  const [eventType, setEventType] = useState<'Tekma' | 'Trening' | 'Ostalo'>('Tekma');
  const [eventStatus, setEventStatus] = useState<'Objavljeno' | 'Neobjavljeno' | 'Odpade'>('Objavljeno');
  const [duration, setDuration] = useState<string>('1,5h');
  const [closeRegTime, setCloseRegTime] = useState<string>('');
  const [periodicDays, setPeriodicDays] = useState<string[]>([]);

  // Accordion states
  const [isBasicExpanded, setIsBasicExpanded] = useState(true);
  const [isRegExpanded, setIsRegExpanded] = useState(false);
  const [isPeriodicExpanded, setIsPeriodicExpanded] = useState(false);

  return (
    <div className="absolute inset-0 z-10 font-sans flex flex-col bg-transparent">
      
      {/* Scrollable Form Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 md:px-8 pt-3 pb-2 w-full">
        <div className="w-full">
           
           {/* Top Header section */}
           <div className="flex items-center justify-between mb-6 shrink-0 mt-0">
              <h1 className="text-[26px] font-bold text-gray-800 tracking-tight leading-none" style={{ fontFamily: 'var(--font-montserrat)' }}>
                Ustvari dogodek
              </h1>
              <button 
                onClick={() => router.push(`/season/${joinCode}`)}
                className="w-8 h-8 rounded-full bg-[#eec87e] hover:bg-[#e4ba5e] text-white flex items-center justify-center transition-colors shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
           </div>
           
           {/* Form Containers */}
           <div className="space-y-4">
              
              {/* Accordion 1: Osnovni podatki */}
              <div className="bg-[#fdfaf1] rounded-2xl border border-[#f5e3b8] overflow-hidden shadow-sm">
                <button 
                  onClick={() => setIsBasicExpanded(!isBasicExpanded)}
                  className="w-full flex items-center justify-between p-4 sm:px-6 bg-[#fdfaf1] hover:bg-[#fbf4de] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#efc463] text-white flex items-center justify-center text-[12px] font-bold shadow-sm">1</div>
                    <h2 className="text-[16px] font-bold text-gray-800">Osnovni podatki</h2>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-5 h-5 text-[#e5b352] transition-transform ${isBasicExpanded ? 'rotate-180' : ''}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
                
                {isBasicExpanded && (
                  <div className="p-4 sm:p-6 border-t border-[#f5e3b8]/50 space-y-6 bg-white rounded-b-2xl border-x border-b">
                    {/* Info alert */}
                    <div className="bg-[#e4f6fb] text-[#559daf] p-3 sm:px-4 rounded-lg text-[12px] sm:text-[13px] font-bold tracking-wide leading-relaxed border border-[#cbeaf4]">
                      Vnesi osnovne podatke o dogodku. Shrani dogodek ali ga shrani in pošlji vabila vsem igralcem, ki so vključeni v sezono. Nato boš preusmerjen na kartico dogodka, kjer upravljaš odzive na povabilo, ekipe, rezultate, obračun plačil.
                    </div>

                    {/* Row 1: Ime dogodka, Min, Max */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                      <div className="md:col-span-8 flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold tracking-wide text-[#e5b352]">Ime dogodka</label>
                        <input type="text" placeholder="Fuzbal 9.3.2026" className="w-full h-[40px] px-3 border border-[#f0dfb3] rounded-md text-gray-700 text-sm focus:outline-none focus:border-[#e5b352] focus:ring-1 focus:ring-[#e5b352]/50 placeholder-gray-400" />
                      </div>
                      <div className="md:col-span-2 flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold tracking-wide text-[#e5b352]">MIN igralcev</label>
                        <input type="number" placeholder="0" className="w-full h-[40px] px-3 border border-[#f0dfb3] rounded-md text-gray-700 text-sm focus:outline-none focus:border-[#e5b352] focus:ring-1 focus:ring-[#e5b352]/50 placeholder-gray-400" />
                      </div>
                      <div className="md:col-span-2 flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold tracking-wide text-[#e5b352]">MAX igralcev</label>
                        <input type="number" placeholder="12" className="w-full h-[40px] px-3 border border-[#f0dfb3] rounded-md text-gray-700 text-sm focus:outline-none focus:border-[#e5b352] focus:ring-1 focus:ring-[#e5b352]/50 placeholder-gray-400" />
                      </div>
                    </div>

                    {/* Row 2: Date Pickers & Duration Pickers */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-end">
                      <div className="md:col-span-3 flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold tracking-wide text-[#e5b352]">Začetek *</label>
                        <div className="relative">
                          <input type="text" placeholder="09.03.2026 20:00" className="w-full h-[40px] pl-3 pr-10 border border-[#f0dfb3] rounded-md text-gray-700 text-sm focus:outline-none focus:border-[#e5b352] focus:ring-1 focus:ring-[#e5b352]/50" />
                          <button className="absolute right-0 top-0 bottom-0 w-10 bg-[#fdf3da] border-l border-[#f0dfb3] rounded-r-md flex items-center justify-center text-[#e5b352] hover:bg-[#fcecbd] transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]"><path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" /><path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" /></svg>
                          </button>
                        </div>
                      </div>
                      <div className="md:col-span-3 flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold tracking-wide text-[#e5b352]">Konec *</label>
                        <div className="relative">
                          <input type="text" placeholder="09.03.2026 21:30" className="w-full h-[40px] pl-3 pr-10 border border-[#f0dfb3] rounded-md text-gray-700 text-sm focus:outline-none focus:border-[#e5b352] focus:ring-1 focus:ring-[#e5b352]/50" />
                          <button className="absolute right-0 top-0 bottom-0 w-10 bg-[#fdf3da] border-l border-[#f0dfb3] rounded-r-md flex items-center justify-center text-[#e5b352] hover:bg-[#fcecbd] transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]"><path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" /><path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" /></svg>
                          </button>
                        </div>
                      </div>
                      <div className="md:col-span-6 flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold tracking-wide text-[#e5b352] flex items-center gap-1.5">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M11.983 1.907a.75.75 0 00-1.292-.656l-8.5 9.5A.75.75 0 002.75 12h6.572l-1.305 6.093a.75.75 0 001.292.656l8.5-9.5A.75.75 0 0017.25 8h-6.572l1.305-6.093z" /></svg>
                          Trajanje dogodka (hitra izbira):
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {['0,5h', '1h', '1,5h', '2h', 'Poljubno'].map(d => (
                            <button 
                              key={d} 
                              onClick={() => setDuration(d)}
                              className={`h-[40px] px-4 rounded-md text-[13px] font-bold transition-colors ${duration === d ? 'bg-[#fcdc83] text-[#a47b1e] shadow-sm' : 'bg-[#fdf3da] text-[#cca044] hover:bg-[#fae6a5]'}`}
                            >
                              {d}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Row 3: Event Type & Status Tabs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold tracking-wide text-[#e5b352]">Tip dogodka</label>
                        <div className="flex items-stretch border border-[#f0dfb3] rounded-md h-[40px] overflow-hidden bg-white">
                          {['Tekma', 'Trening', 'Ostalo'].map((t) => (
                            <button 
                              key={t}
                              onClick={() => setEventType(t as any)}
                              className={`flex-1 text-[13px] font-bold transition-colors ${eventType === t ? 'bg-[#ebf8f2] text-[#6db59c] border-x border-[#bce0d0] first:border-l-0 last:border-r-0' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold tracking-wide text-[#e5b352]">Status</label>
                        <div className="flex items-stretch border border-[#f0dfb3] rounded-md h-[40px] overflow-hidden bg-white">
                          {['Objavljeno', 'Neobjavljeno', 'Odpade'].map((s) => (
                            <button 
                              key={s}
                              onClick={() => setEventStatus(s as any)}
                              className={`flex-1 text-[13px] font-bold transition-colors ${eventStatus === s ? 'bg-[#ebf8f2] text-[#6db59c] border-x border-[#bce0d0] first:border-l-0 last:border-r-0' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Row 4: Izberi lokacijo */}
                    <div className="flex flex-col gap-1.5 relative border border-[#f0dfb3] p-4 rounded-lg bg-white mt-2">
                      <label className="absolute -top-2.5 left-3 px-1 bg-white text-[12px] font-bold tracking-wide text-[#e5b352]">Izberi lokacijo *</label>
                      
                      {/* Selected Location Pill */}
                      <div className="flex items-center justify-between bg-[#ebf8f2] border border-[#bce0d0] rounded-md p-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-[#6db59c] text-white flex items-center justify-center shadow-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                          </div>
                          <div>
                            <h4 className="font-bold text-[#356f5a] text-[13.5px] leading-tight">Športno društvo studenci Maribor</h4>
                            <p className="text-[11px] text-[#559a7f] font-medium leading-none mt-1">Na Poljanah 20, Maribor, Slovenija</p>
                          </div>
                        </div>
                        <button className="w-6 h-6 rounded-full bg-[#f8e4e3] text-[#cd5c5a] hover:bg-[#cd5c5a] hover:text-white transition-colors flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.5a.75.75 0 010 1.5H3.75A.75.75 0 013 10z" clipRule="evenodd" /></svg>
                        </button>
                      </div>
                      
                      <div className="flex justify-end">
                        <button className="bg-[#e4ba5e] hover:bg-[#d8a846] text-white text-[12px] font-bold px-4 py-1.5 rounded-md flex items-center gap-1.5 shadow-sm transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>
                          Dodaj novo lokacijo
                        </button>
                      </div>
                    </div>

                    {/* Accordion 2: Zaključek prijav (Nested) */}
                    <div className="border border-[#f0dfb3] rounded-lg bg-[#fdfaf1]">
                      <button 
                        onClick={() => setIsRegExpanded(!isRegExpanded)}
                        className="w-full flex items-center justify-between p-3.5 sm:px-4 hover:bg-[#fbf4de] transition-colors rounded-lg"
                      >
                        <div className="flex items-center gap-3 text-[#e5b352]">
                          <div className="w-5 h-5 rounded-full bg-[#efc463] text-white flex items-center justify-center">
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                          </div>
                          <span className="font-bold text-[13px] tracking-wide">Zaključek prijav</span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[#e5b352]/50"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                      </button>
                      {isRegExpanded && (
                        <div className="p-4 bg-white border-t border-[#f0dfb3] rounded-b-lg">
                           <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                             <div className="md:col-span-1 flex flex-col gap-1.5">
                                <label className="text-[12px] font-bold tracking-wide text-[#e5b352]">Konec</label>
                                <div className="relative">
                                  <input type="text" placeholder="DD.MM.YYYY" className="w-full h-[40px] pl-3 pr-10 border border-[#f0dfb3] rounded-md text-gray-700 text-sm focus:outline-none focus:border-[#e5b352] focus:ring-1 focus:ring-[#e5b352]/50" />
                                  <button className="absolute right-0 top-0 bottom-0 w-10 bg-[#fdf3da] border-l border-[#f0dfb3] rounded-r-md flex items-center justify-center text-[#e5b352] hover:bg-[#fcecbd] transition-colors"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]"><path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" /><path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" /></svg></button>
                                </div>
                             </div>
                             <div className="md:col-span-3 flex flex-col gap-1.5">
                                <label className="text-[12px] font-bold tracking-wide text-[#e5b352] flex items-center gap-1.5">
                                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M11.983 1.907a.75.75 0 00-1.292-.656l-8.5 9.5A.75.75 0 002.75 12h6.572l-1.305 6.093a.75.75 0 001.292.656l8.5-9.5A.75.75 0 0017.25 8h-6.572l1.305-6.093z" /></svg>
                                   Koliko časa pred začetkom dogodka se prijave zaprejo (hitra izbira):
                                </label>
                                <div className="flex flex-wrap gap-2">
                                   {['2h', '4h', '6h', '8h', '24h', 'Poljubno'].map(d => (
                                     <button 
                                       key={d} 
                                       onClick={() => setCloseRegTime(d)}
                                       className={`h-[40px] px-4 rounded-md text-[13px] font-bold transition-colors ${closeRegTime === d ? 'bg-[#fcdc83] text-[#a47b1e] shadow-sm' : 'bg-[#fdf3da] text-[#cca044] hover:bg-[#fae6a5]'}`}
                                     >
                                       {d}
                                     </button>
                                   ))}
                                </div>
                             </div>
                           </div>
                        </div>
                      )}
                    </div>

                    {/* Accordion 3: Dodaj periodični dogodek */}
                    <div className="border border-[#f0dfb3] rounded-lg bg-[#fdfaf1]">
                      <button 
                        onClick={() => setIsPeriodicExpanded(!isPeriodicExpanded)}
                        className="w-full flex items-center justify-between p-3.5 sm:px-4 hover:bg-[#fbf4de] transition-colors rounded-lg"
                      >
                        <div className="flex items-center gap-3 text-[#e5b352]">
                          <div className="w-5 h-5 rounded-full bg-[#efc463] text-white flex items-center justify-center">
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                          </div>
                          <span className="font-bold text-[13px] tracking-wide">Dodaj periodični dogodek</span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[#e5b352]/50"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                      </button>
                      {isPeriodicExpanded && (
                        <div className="p-4 bg-white border-t border-[#f0dfb3] rounded-b-lg space-y-4">
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-[600px]">
                             <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-bold tracking-wide text-[#e5b352]">Začetni datum</label>
                                <div className="relative">
                                  <input type="text" placeholder="DD.MM.YYYY" className="w-full h-[40px] pl-3 pr-10 border border-[#f0dfb3] rounded-md text-gray-700 text-sm focus:outline-none focus:border-[#e5b352] focus:ring-1 focus:ring-[#e5b352]/50" />
                                  <button className="absolute right-0 top-0 bottom-0 w-10 bg-[#fdf3da] border-l border-[#f0dfb3] rounded-r-md flex items-center justify-center text-[#e5b352] hover:bg-[#fcecbd] transition-colors"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]"><path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" /><path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" /></svg></button>
                                </div>
                             </div>
                             <div className="flex flex-col gap-1.5">
                                <label className="text-[12px] font-bold tracking-wide text-[#e5b352]">Končni datum</label>
                                <div className="relative">
                                  <input type="text" placeholder="DD.MM.YYYY" className="w-full h-[40px] pl-3 pr-10 border border-[#f0dfb3] rounded-md text-gray-700 text-sm focus:outline-none focus:border-[#e5b352] focus:ring-1 focus:ring-[#e5b352]/50" />
                                  <button className="absolute right-0 top-0 bottom-0 w-10 bg-[#fdf3da] border-l border-[#f0dfb3] rounded-r-md flex items-center justify-center text-[#e5b352] hover:bg-[#fcecbd] transition-colors"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-[18px] h-[18px]"><path d="M12.75 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM7.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM8.25 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM9.75 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM10.5 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM12.75 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM14.25 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 17.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 15.75a.75.75 0 100-1.5.75.75 0 000 1.5zM15 12.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM16.5 13.5a.75.75 0 100-1.5.75.75 0 000 1.5z" /><path fillRule="evenodd" d="M6.75 2.25A.75.75 0 017.5 3v1.5h9V3A.75.75 0 0118 3v1.5h.75a3 3 0 013 3v11.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V7.5a3 3 0 013-3H6V3a.75.75 0 01.75-.75zm13.5 9a1.5 1.5 0 00-1.5-1.5H5.25a1.5 1.5 0 00-1.5 1.5v7.5a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5v-7.5z" clipRule="evenodd" /></svg></button>
                                </div>
                             </div>
                           </div>
                           <div className="flex flex-col gap-1.5">
                              <label className="text-[12px] font-bold tracking-wide text-[#e5b352]">Izberi dneve za ponovitev dogodka</label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                 {['PON', 'TOR', 'SRE', 'ČET', 'PET', 'SOB', 'NED'].map(day => (
                                    <button 
                                       key={day}
                                       onClick={() => {
                                          if(periodicDays.includes(day)) {
                                             setPeriodicDays(periodicDays.filter(d => d !== day));
                                          } else {
                                             setPeriodicDays([...periodicDays, day]);
                                          }
                                       }}
                                       className={`w-[46px] h-[36px] flex items-center justify-center rounded-md text-[11px] font-bold transition-colors shadow-sm ${periodicDays.includes(day) ? 'bg-[#fcdc83] text-[#a47b1e]' : 'bg-[#fdf3da] text-[#cca044] hover:bg-[#fae6a5]'}`}
                                    >
                                       {day}
                                    </button>
                                 ))}
                              </div>
                           </div>
                        </div>
                      )}
                    </div>

                    {/* Opombe */}
                    <div className="flex flex-col gap-1.5 relative border border-[#f0dfb3] p-4 rounded-lg bg-white mt-2">
                      <label className="absolute -top-2.5 left-3 px-1 bg-white text-[12px] font-bold tracking-wide text-[#e5b352]">Opombe</label>
                      <textarea 
                        placeholder="Vnesite opombe za sodelujoče" 
                        rows={2} 
                        className="w-full text-[13px] text-gray-700 placeholder-gray-300 focus:outline-none resize-y border-b border-white focus:border-[#f0dfb3] transition-colors"
                      ></textarea>
                      <div className="absolute bottom-1 right-2 w-3 h-3 text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-full h-full rotate-45"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>
                      </div>
                    </div>

                  </div>
                )}
              </div>
              
              {/* Spacer at the bottom so content doesn't get hidden behind footer */}
              <div className="h-8"></div>
           </div>
        </div>
      </div>
      
      {/* Sticky Bottom Footer */}
      <div className="shrink-0 bg-white border-t border-gray-100 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)] px-4 py-3 md:px-8">
         <div className="w-full flex items-center justify-center sm:justify-between flex-wrap gap-4">
            
            <button 
               onClick={() => router.push(`/season/${joinCode}`)}
               className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-bold transition-colors order-2 sm:order-1"
            >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
               Nazaj
            </button>
            
            <div className="flex items-center gap-3 order-1 sm:order-2 w-full sm:w-auto justify-center">
               <button className="flex-1 sm:flex-none bg-[#6db59c] hover:bg-[#5b9e7e] text-white px-8 py-2.5 rounded-md font-bold transition-colors shadow-sm text-sm tracking-wide">
                  Shrani
               </button>
               <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#7aa3de] hover:bg-[#6c93cc] text-white px-6 py-2.5 rounded-md font-bold transition-colors shadow-sm text-sm tracking-wide">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0l2.77-.693a14.451 14.451 0 014.66-.043l2.318.463a14.451 14.451 0 004.66-.043L21 14.25V4.5l-2.77.693a14.451 14.451 0 01-4.66.043l-2.318-.463a14.451 14.451 0 00-4.66.043L3 5.25" /></svg>
                  Na zaključek
               </button>
            </div>
            
         </div>
      </div>
      
    </div>
  );
}
