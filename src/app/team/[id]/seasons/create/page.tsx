"use client";

import { useMutation, useQuery, useConvexAuth } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/components/Header";
import { translations, Language } from "@/app/i18n";
import { useLanguage } from "@/components/LanguageContext";

const InfoTooltip = ({ text }: { text: string }) => (
  <div className="group relative inline-flex items-center ml-1.5 cursor-help">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-[#008f91] opacity-70 hover:opacity-100 transition-opacity">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
    </svg>
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-64 bg-slate-800 text-white text-xs font-normal rounded-lg p-2.5 shadow-xl z-50 text-center pointer-events-none">
      {text}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
    </div>
  </div>
);

export default function CreateSeasonPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const { language: currentLang } = useLanguage();
  const t = (translations[currentLang as Language] || translations.sl) as any;
  
  const teamId = params.id as Id<"teams">;
  const team = useQuery(api.teams.getTeam, { teamId });

  const createSeason = useMutation(api.seasons.createSeason);

  const [formData, setFormData] = useState({
    name: "",
    desc: "",
    dateStart: "",
    dateEnd: "",
    isActive: true,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{name?: string, dateStart?: string, dateEnd?: string}>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const nameInputRef = useRef<HTMLInputElement>(null);
  const dateStartInputRef = useRef<HTMLInputElement>(null);
  const dateEndInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate
    setSubmitError(null);
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = t.fillRequired || "Obvezno polje";
    if (!formData.dateStart) newErrors.dateStart = t.fillRequired || "Obvezno polje";
    if (!formData.dateEnd) newErrors.dateEnd = t.fillRequired || "Obvezno polje";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to the first error
      if (newErrors.name && nameInputRef.current) {
        nameInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (newErrors.dateStart && dateStartInputRef.current) {
        dateStartInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (newErrors.dateEnd && dateEndInputRef.current) {
        dateEndInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (new Date(formData.dateStart) > new Date(formData.dateEnd)) {
      setSubmitError("Datum konca ne more biti pred datumom začetka.");
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    
    try {
      const result = await createSeason({
        teamId,
        name: formData.name.trim(),
        desc: formData.desc.trim() || undefined,
        dateStart: formData.dateStart,
        dateEnd: formData.dateEnd,
        isActive: formData.isActive
      });
      router.push(`/season/${result.joinCode}`); // Redirect to new season dashboard
    } catch (error: any) {
       console.error(error);
       setSubmitError(error.message || "Napaka pri ustvarjanju sezone");
       window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading || !isAuthenticated || team === undefined) {
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

  if (team === null) {
     return (
        <div className="min-h-screen bg-[#F4F6F8] font-sans flex flex-col relative pb-20">
          <Header />
          <div className="h-[60px] md:h-[60px]" />
          <div className="text-center py-20">
             <h2 className="text-2xl font-bold text-gray-800">Ekipa ne obstaja</h2>
             <button onClick={() => router.push('/teams')} className="mt-4 text-[#3b879c] underline font-bold">{t.backToTeams || "Nazaj na ekipe"}</button>
          </div>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] font-sans flex flex-col relative pb-20">
      <Header />
      <div className="h-[60px] md:h-[60px]" />

      {/* Banner */}
      <div className="w-full" style={{background: '#efc463'}}>
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-5 flex items-center space-x-3">
           <button onClick={() => router.push(`/team/${teamId}`)} className="text-white hover:bg-white/20 p-2 rounded-full transition-colors mr-2">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
               <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
             </svg>
           </button>
           <h1 className="text-2xl md:text-[28px] font-bold text-white tracking-wide" style={{fontFamily: 'var(--font-montserrat)'}}>
              Ustvari novo sezono za {team.name}
           </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-8 mt-8 pb-12">
        <div className="ui-card p-6 md:p-10 flex flex-col">
          <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-gray-100">
             <h2 className="text-[22px] font-bold text-[#353b41]" style={{fontFamily: 'var(--font-montserrat)'}}>Nova sezona</h2>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-8">
              
              {/* Left Column Data */}
              <div className="space-y-6">
                 
                 <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-1.5">
                       <label className="ui-label m-0">Naslov sezone <span className="text-[#d29729]">*</span></label>
                    </div>
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={formData.name}
                      onChange={e => { setFormData({...formData, name: e.target.value}); setErrors({...errors, name: undefined}); }}
                      placeholder="npr. Poletna liga 2026 / Jesen 2025"
                      className={`ui-input bg-white text-sm py-2.5 px-3 ${errors.name ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : ''}`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center"><svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{errors.name}</p>}
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                     <div className="flex flex-col">
                        <div className="flex justify-between items-center mb-1.5">
                           <label className="ui-label m-0">Začetek <span className="text-[#d29729]">*</span></label>
                        </div>
                        <input
                          ref={dateStartInputRef}
                          type="date"
                          value={formData.dateStart}
                          onChange={e => { setFormData({...formData, dateStart: e.target.value}); setErrors({...errors, dateStart: undefined}); }}
                          className={`ui-input bg-white text-sm py-2.5 px-3 ${errors.dateStart ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : ''}`}
                        />
                        {errors.dateStart && <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center"><svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{errors.dateStart}</p>}
                     </div>

                     <div className="flex flex-col">
                        <div className="flex justify-between items-center mb-1.5">
                           <label className="ui-label m-0">Konec <span className="text-[#d29729]">*</span></label>
                        </div>
                        <input
                          ref={dateEndInputRef}
                          type="date"
                          value={formData.dateEnd}
                          onChange={e => { setFormData({...formData, dateEnd: e.target.value}); setErrors({...errors, dateEnd: undefined}); }}
                          className={`ui-input bg-white text-sm py-2.5 px-3 ${errors.dateEnd ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : ''}`}
                        />
                         {errors.dateEnd && <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center"><svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{errors.dateEnd}</p>}
                     </div>
                 </div>

              </div>

              {/* Right Column Misc */}
              <div className="flex flex-col space-y-6">
                 
                 {/* Status Toggle */}
                 <div className="flex flex-col">
                    <label className="ui-label mb-1.5">Status sezone</label>
                    <div className="flex bg-gray-50 rounded-lg p-1 border border-gray-200 shadow-sm w-fit">
                       <button 
                         type="button"
                         onClick={() => setFormData(prev => ({ ...prev, isActive: true }))}
                         className={`px-6 py-2.5 rounded-md text-sm font-bold transition-all ${
                           formData.isActive 
                             ? 'bg-[#5ba582] text-white shadow-sm' 
                             : 'text-[#dba032] hover:bg-gray-100'
                         }`}
                       >
                         Aktivno
                       </button>
                       <button 
                         type="button"
                         onClick={() => setFormData(prev => ({ ...prev, isActive: false }))}
                         className={`px-6 py-2.5 rounded-md text-sm font-bold transition-all ${
                           !formData.isActive 
                             ? 'bg-[#eeb054] text-white shadow-sm' 
                             : 'text-[#dba032] hover:bg-gray-100'
                         }`}
                       >
                         Neaktivno
                       </button>
                    </div>
                 </div>

              </div>

            </div>

            {/* Description Area */}
            <div className="flex flex-col mb-10">
               <label className="ui-label mb-1.5">Opis sezone</label>
               <textarea
                 value={formData.desc}
                 onChange={e => setFormData({...formData, desc: e.target.value})}
                 placeholder="npr. V novi sezoni bomo igrali v..."
                 className="ui-input bg-white min-h-[100px] resize-y text-sm py-3 px-3 w-full"
               />
            </div>

            {/* Error Message Display */}
            {submitError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3 animate-in fade-in">
                <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd"/>
                </svg>
                <p className="text-sm font-medium text-red-800">{submitError}</p>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex justify-end space-x-4 border-t border-gray-100 pt-6">
               <button 
                 type="button" 
                 onClick={() => router.push(`/team/${teamId}`)}
                 className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-bold transition-all shadow-sm"
               >
                 {t.cancelBtn || "Prekliči"}
               </button>
               <button 
                 type="submit"
                 disabled={isSubmitting}
                 className="bg-[#6db592] hover:bg-[#5b9e7e] text-white disabled:opacity-70 font-bold text-sm px-8 py-2.5 rounded-lg transition-colors shadow-sm flex items-center space-x-2"
               >
                 {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                 ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                 )}
                 <span>Ustvari sezono</span>
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
