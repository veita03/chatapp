"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "@/components/Header";
import ImageCropper from "@/components/ImageCropper";
import { translations, Language } from "@/app/i18n";
import Cookies from "js-cookie";
import { Id } from "../../../../../convex/_generated/dataModel";

const SPORTS = [
  { name: "Badminton", icon: "🏸" },
  { name: "Košarka", icon: "🏀" },
  { name: "Namizni tenis", icon: "🏓" },
  { name: "Nogomet", icon: "⚽" },
  { name: "Odbojka", icon: "🏐" },
  { name: "Padel", icon: "🎾" },
  { name: "Tenis", icon: "🎾" }
];

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

export default function EditTeamPage() {
  const router = useRouter();
  const params = useParams();
  const currentLang = Cookies.get("NEXT_LOCALE") || "sl";
  const t = (translations[currentLang as Language] || translations.sl) as typeof translations.sl;
  
  const teamId = params.id as Id<"teams">;
  const team = useQuery(api.teams.getTeam, { teamId });
  const updateTeam = useMutation(api.teams.updateTeam);

  const [formData, setFormData] = useState({
    name: "",
    sport: "",
    desc: "",
    image: "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);

  // Sync formData with loaded team data
  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name,
        sport: team.sport,
        desc: team.desc || "",
        image: team.image || "",
      });
    }
  }, [team]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
         setTempImageSrc(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedImage: string) => {
    setFormData(prev => ({ ...prev, image: croppedImage }));
    setTempImageSrc(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sport) {
      alert(t.fillRequired);
      return;
    }

    setIsSubmitting(true);
    try {
      await updateTeam({
        teamId,
        ...formData
      });
      router.push(`/teams`); 
    } catch (error: any) {
       console.error(error);
       alert(error.message || t.errorEditingTeam);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (team === undefined) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] font-sans flex flex-col relative pb-20">
        <Header />
        <div className="h-[100px] md:h-[60px]" />
        <div className="flex h-64 items-center justify-center">
            <div className="w-8 h-8 border-4 border-[#eeb054]/30 border-t-[#eeb054] rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (team === null) {
     return (
        <div className="min-h-screen bg-[#F4F6F8] font-sans flex flex-col relative pb-20">
          <Header />
          <div className="h-[100px] md:h-[60px]" />
          <div className="text-center py-20">
             <h2 className="text-2xl font-bold text-gray-800">{t.teamDoesNotExist}</h2>
             <button onClick={() => router.push('/teams')} className="mt-4 text-[#3b879c] underline font-bold">{t.backToTeams}</button>
          </div>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] font-sans flex flex-col relative pb-20">
      <Header />
      <div className="h-[100px] md:h-[60px]" />

      {/* Banner */}
      <div className="w-full" style={{background: '#f4c361'}}>
        <div className="max-w-5xl mx-auto px-4 sm:px-8 py-5 flex items-center space-x-3">
           <button onClick={() => router.push('/teams')} className="text-white hover:bg-white/20 p-2 rounded-full transition-colors mr-2">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
               <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
             </svg>
           </button>
           <h1 className="text-2xl md:text-[28px] font-bold text-white tracking-wide" style={{fontFamily: 'var(--font-montserrat)'}}>
              {t.editTeamBanner}
           </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-8 mt-8 pb-12">
        <div className="ui-card p-6 md:p-10 flex flex-col">
          <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-gray-100">
             <h2 className="text-[22px] font-bold text-[#353b41]" style={{fontFamily: 'var(--font-montserrat)'}}>{t.editTeamData}</h2>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-8">
              
              {/* Left Column Data */}
              <div className="space-y-6">
                 
                 <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-1.5">
                       <label className="ui-label m-0">{t.teamName} <span className="text-[#d29729]">*</span></label>
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder={t.teamNamePlaceholder}
                      className="ui-input bg-white text-sm py-2.5 px-3"
                    />
                 </div>

                 <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-2.5">
                       <label className="ui-label m-0">{t.selectSport} <span className="text-[#d29729]">*</span></label>
                    </div>
                    <div className="ui-input bg-white py-4 px-3 flex flex-wrap justify-center gap-2.5">
                       {SPORTS.map((sport, idx) => (
                         <button
                           key={sport.name}
                           type="button"
                           onClick={() => setFormData({...formData, sport: sport.name})}
                           className={`px-4 py-1.5 rounded-md border transition-all text-[13px] font-medium max-w-[140px] truncate ${
                             formData.sport === sport.name 
                               ? 'border-[#eeb054] text-[#dba032] shadow-[0_0_0_1px_rgba(238,176,84,0.3)] bg-[#fdfaf1]' 
                               : 'border-[#f3ebcd] text-gray-500 hover:border-[#eeb054]/50 hover:text-gray-700 hover:bg-gray-50'
                           }`}
                         >
                           <span className="mr-1.5">{sport.icon}</span>{sport.name}
                         </button>
                       ))}
                    </div>
                 </div>

              </div>

              {/* Right Column Image */}
              <div className="flex flex-col">
                 <div className="flex justify-between items-center mb-1.5">
                    <label className="ui-label m-0">{t.teamImage}</label>
                    <InfoTooltip text={t.teamImageTooltip} />
                 </div>
                 
                 <label className={`block w-full flex-1 min-h-[220px] bg-white border-2 border-dashed rounded-xl overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors flex flex-col items-center justify-center relative group ${formData.image ? 'border-[#eeb054]/30' : 'border-[#f3ebcd] hover:border-[#eeb054]/50'}`}>
                    {formData.image ? (
                      <>
                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover absolute inset-0" />
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[#dba032] text-sm font-bold">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 mb-2"><path d="M2.695 14.763l-1.262 3.152a.5.5 0 00.65.65l3.151-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" /></svg>
                          {t.changeImage}
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-6 h-full w-full">
                        <svg className="w-12 h-12 text-[#eeb054]/80 mb-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                        </svg>
                        <p className="text-gray-500 text-sm font-medium">{t.dropImageHere}</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                 </label>
              </div>

            </div>

            {/* Description Area */}
            <div className="flex flex-col mb-10">
               <label className="ui-label mb-1.5">{t.teamDesc}</label>
               <textarea
                 value={formData.desc}
                 onChange={e => setFormData({...formData, desc: e.target.value})}
                 placeholder={t.teamDescPlaceholder}
                 className="ui-input bg-white min-h-[100px] resize-y text-sm py-3 px-3 w-full"
               />
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end space-x-4 border-t border-gray-100 pt-6">
               <button 
                 type="button" 
                 onClick={() => router.push('/teams')}
                 className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-bold transition-all shadow-sm"
               >
                 {t.cancelBtn}
               </button>
               <button 
                 onClick={handleSubmit}
                 disabled={isSubmitting}
                 className="bg-[#6db592] hover:bg-[#5b9e7e] text-white disabled:opacity-70 font-bold text-sm px-8 py-2.5 rounded-lg transition-colors shadow-sm flex items-center space-x-2"
               >
                 {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                 ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                 )}
                 <span>{t.saveChangesBtn}</span>
               </button>
            </div>
          </form>
        </div>
      </div>

      {/* Image Cropper Overlay */}
      {tempImageSrc && (
        <ImageCropper 
          imageSrc={tempImageSrc} 
          onCropComplete={handleCropComplete} 
          onCancel={() => setTempImageSrc(null)} 
          aspectRatio={4/3}
        />
      )}

    </div>
  );
}
