import React, { useState } from 'react';
import { useLanguage } from "@/components/LanguageContext";
import { translations, Language } from "@/app/i18n";

interface SeasonModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  seasonData?: any; // If provided, it's edit mode
}

export default function SeasonModal({ isOpen, onClose, teamId, seasonData }: SeasonModalProps) {
  const { language: currentLang } = useLanguage();
  const t = (translations[currentLang as Language] || translations.sl) as any;
  
  const [formData, setFormData] = useState({
    name: seasonData?.name || '',
    desc: seasonData?.desc || '',
    dateStart: seasonData?.dateStart || '',
    dateEnd: seasonData?.dateEnd || '',
    isActive: seasonData ? seasonData.isActive : true,
  });

  if (!isOpen) return null;

  const isEditMode = !!seasonData;
  const modalTitle = isEditMode ? "Uredi sezono" : "Dodaj novo sezono";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (status: boolean) => {
    setFormData(prev => ({ ...prev, isActive: status }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: implement save logic
    console.log("Saving season", formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-gray-100">
          <h2 className="text-[22px] font-bold text-[#353b41]" style={{fontFamily: 'var(--font-montserrat)'}}>
            {modalTitle}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 text-[#eeb054] hover:bg-[#eeb054]/10 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto bg-[#fdfaf2] p-6 sm:p-8">
          <form id="seasonForm" onSubmit={handleSubmit} className="space-y-6">
            
            {/* Top Row: Title, Start Date, End Date */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
               
               {/* Title */}
               <div className="md:col-span-6 space-y-2">
                 <label className="block text-[13px] font-bold text-[#dba032]">
                   Naslov sezone *
                 </label>
                 <input 
                   type="text" 
                   name="name"
                   value={formData.name}
                   onChange={handleChange}
                   placeholder="npr. 2025/2026 / Poletna liga 2026 / Torkov termin / Jesen 2025"
                   className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#eeb054]/50 focus:border-[#eeb054] transition-all shadow-sm"
                   required
                 />
               </div>

               {/* Start Date */}
               <div className="md:col-span-3 space-y-2">
                 <label className="block text-[13px] font-bold text-[#dba032]">
                   Datum začetka *
                 </label>
                 <div className="relative">
                   <input 
                     type="date" 
                     name="dateStart"
                     value={formData.dateStart}
                     onChange={handleChange}
                     className="w-full px-4 py-3 bg-white border border-gray-200 border-r-0 rounded-l-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#eeb054]/50 focus:border-[#eeb054] transition-all shadow-sm"
                     required
                   />
                   <div className="absolute right-0 top-0 bottom-0 px-3 bg-[#faedd4] border border-gray-200 border-l-0 rounded-r-lg flex items-center justify-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[#dba032]">
                        <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
                      </svg>
                   </div>
                 </div>
               </div>

               {/* End Date */}
               <div className="md:col-span-3 space-y-2">
                 <label className="block text-[13px] font-bold text-[#dba032]">
                   Datum konca *
                 </label>
                 <div className="relative">
                   <input 
                     type="date" 
                     name="dateEnd"
                     value={formData.dateEnd}
                     onChange={handleChange}
                     className="w-full px-4 py-3 bg-white border border-gray-200 border-r-0 rounded-l-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#eeb054]/50 focus:border-[#eeb054] transition-all shadow-sm"
                     required
                   />
                   <div className="absolute right-0 top-0 bottom-0 px-3 bg-[#faedd4] border border-gray-200 border-l-0 rounded-r-lg flex items-center justify-center pointer-events-none">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[#dba032]">
                        <path fillRule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clipRule="evenodd" />
                      </svg>
                   </div>
                 </div>
               </div>
            </div>

            {/* Second Row: Description & Status */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Description */}
              <div className="md:col-span-6 space-y-2">
                <label className="block text-[13px] font-bold text-[#dba032]">
                  Opis sezone
                </label>
                <textarea 
                  name="desc"
                  value={formData.desc}
                  onChange={handleChange}
                  placeholder="npr. V novi sezoni bomo igrali v..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#eeb054]/50 focus:border-[#eeb054] transition-all shadow-sm resize-none"
                />
              </div>

              {/* Status */}
              <div className="md:col-span-6 space-y-2">
                <label className="block text-[13px] font-bold text-[#dba032]">
                  Status
                </label>
                <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm w-fit">
                   <button 
                     type="button"
                     onClick={() => handleStatusChange(true)}
                     className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${
                       formData.isActive 
                         ? 'bg-[#5ba582] text-white shadow-sm' 
                         : 'text-[#dba032] hover:bg-gray-50'
                     }`}
                   >
                     Aktivno
                   </button>
                   <button 
                     type="button"
                     onClick={() => handleStatusChange(false)}
                     className={`px-5 py-2 rounded-md text-sm font-bold transition-all ${
                       !formData.isActive 
                         ? 'bg-[#eeb054] text-white shadow-sm' 
                         : 'text-[#dba032] hover:bg-gray-50'
                     }`}
                   >
                     Neaktivno
                   </button>
                </div>
              </div>

            </div>

            {/* Invite Players Block (Only when creating new season) */}
            {!isEditMode && (
              <div className="mt-8 border-t border-[#eeb054]/20 pt-6">
                <div className="flex items-center space-x-2 mb-4">
                  <h3 className="text-[14px] font-bold text-[#dba032]">
                    Dodaj igralce v sezono (opcijsko)
                  </h3>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[#4a8a9a]">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                  </svg>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm flex flex-col items-center">
                   
                   <p className="text-[#dba032] text-sm font-bold mb-3 flex items-center gap-1.5">
                     Povabi člane preko unikatne povezave
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-[#4a8a9a]">
                       <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                     </svg>
                   </p>
                   
                   <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-2">
                      <div className="px-6 py-2.5 text-2xl font-bold text-[#5ba582] tracking-wider">
                        PMGDXG
                      </div>
                      <button type="button" className="bg-[#5ba582] text-white px-4 flex items-center justify-center hover:bg-[#4d8f70] transition-colors tooltip-trigger relative group">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                        </svg>
                        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                          Kopiraj
                        </span>
                      </button>
                   </div>
                   <p className="text-gray-400 text-xs mb-8">Klikni in kopiraj povezavo</p>

                   <p className="text-[#dba032] text-sm font-bold w-full text-center border-t border-gray-100 pt-6 mb-4 flex items-center justify-center gap-1.5">
                     Ali pošlji povabilo preko elektronske pošte:
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-[#4a8a9a]">
                       <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                     </svg>
                   </p>
                   
                   {/* Single Invite Row Layout example */}
                   <div className="w-full flex flex-col md:flex-row gap-3 mb-2">
                     <input type="text" placeholder="Ime" className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-300" />
                     <input type="text" placeholder="Priimek" className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-300" />
                     <input type="email" placeholder="E-pošta" className="flex-[1.5] px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-gray-300" />
                     <button type="button" className="shrink-0 px-4 py-2.5 bg-[#fde9eb] text-[#ef506d] hover:bg-[#fad1d5] transition-colors rounded-lg text-sm font-medium flex items-center justify-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        Odstrani
                     </button>
                   </div>
                   <p className="w-full text-left text-xs text-gray-400 mb-6">
                     Vnesi e-pošto za povabilo ali ime/priimek za ročni vnos brez povabila.
                   </p>

                   <button type="button" className="bg-[#eeb054]/90 hover:bg-[#eab355] text-white font-bold text-sm px-5 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
                      Dodaj novega člana
                   </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="bg-[#fdfaf2] border-t border-[#eeb054]/20 p-5 sm:p-6 flex items-center justify-end gap-6 shadow-[0_-4px_6px_-6px_rgba(0,0,0,0.1)] relative z-10 w-full rounded-b-2xl">
           <button 
             type="button" 
             onClick={onClose}
             className="text-gray-600 font-bold text-sm hover:text-gray-800 transition-colors"
           >
             Prekliči
           </button>
           <button 
             type="submit" 
             form="seasonForm"
             className="bg-[#5BA582] hover:bg-[#4d8f70] transition-colors text-white font-bold px-6 py-2.5 rounded-md shadow-sm flex items-center gap-2"
           >
             {isEditMode ? "Shrani" : (
               <>
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                 Ustvari novo sezono
               </>
             )}
           </button>
        </div>

      </div>
    </div>
  );
}
