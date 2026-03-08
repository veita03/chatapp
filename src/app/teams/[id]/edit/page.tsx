"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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

export default function EditTeamPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const currentLang = Cookies.get("NEXT_LOCALE") || "sl";
  const t = translations[currentLang as Language] || translations.sl;
  
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
      alert("Izpolnite vsa obvezna polja.");
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
       alert(error.message || "Napaka pri urejanju ekipe.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (team === undefined) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] font-sans flex flex-col relative pb-20">
        <Header />
        <div className="h-[60px]" />
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
          <div className="h-[60px]" />
          <div className="text-center py-20">
             <h2 className="text-2xl font-bold text-gray-800">Ekipa ne obstaja ali nimate pravic.</h2>
             <button onClick={() => router.push('/teams')} className="mt-4 text-[#3b879c] underline font-bold">Nazaj na ekipe</button>
          </div>
        </div>
     );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] font-sans flex flex-col relative pb-20">
      <Header />
      <div className="h-[60px]" />

      {/* Banner */}
      <div className="w-full" style={{background: '#f4c361'}}>
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-5 flex items-center space-x-3">
           <button onClick={() => router.push('/teams')} className="text-white hover:bg-white/20 p-2 rounded-full transition-colors mr-2">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
               <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
             </svg>
           </button>
           <h1 className="text-2xl md:text-[28px] font-bold text-white tracking-wide" style={{fontFamily: 'var(--font-montserrat)'}}>
              Uredi Ekipo
           </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-8 mt-8 flex flex-col md:flex-row gap-8">
        
        {/* LEFT COLUMN - Image */}
        <div className="w-full md:w-[320px] flex flex-col gap-6 shrink-0">
          <div className="ui-card p-8 flex flex-col items-center relative">
             <div className="w-full flex justify-between items-center mb-6">
                <p className="ui-section-title m-0">Slika ekipe</p>
                <InfoTooltip text="Po želji lahko dodaš tudi fotografijo ekipe, pri čemer je zaželeno razmerje 4:3." />
             </div>
             
             <label className="block w-full aspect-[4/3] bg-white border-4 border-[#a0e4cc]/20 rounded-2xl overflow-hidden cursor-pointer hover:border-[#a0e4cc]/40 transition-colors flex items-center justify-center relative shadow-sm group">
                {formData.image ? (
                  <>
                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-bold">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6 mb-1"><path d="M2.695 14.763l-1.262 3.152a.5.5 0 00.65.65l3.151-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" /></svg>
                      Spremeni
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-6 bg-gray-50 h-full w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-[#eeb054] mb-3"><path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM6.31 15.117A6.745 6.745 0 0 1 12 12a6.745 6.745 0 0 1 6.709 7.498.75.75 0 0 1-.372.568A12.696 12.696 0 0 1 12 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 0 1-.372-.568 6.787 6.787 0 0 1 1.019-4.38Z" clipRule="evenodd" /><path d="M5.082 14.254a8.287 8.287 0 0 0-1.308 5.135 9.687 9.687 0 0 1-1.764-.44l-.115-.04a.563.563 0 0 1-.373-.487l-.01-.121a3.75 3.75 0 0 1 3.57-4.047ZM20.226 19.389a8.287 8.287 0 0 0-1.308-5.135 3.75 3.75 0 0 1 3.57 4.047l-.01.121a.563.563 0 0 1-.373.486l-.115.04c-.56.195-1.15.349-1.764.441Z" /></svg>
                    <p className="text-gray-500 text-xs font-medium">Klikni za nalaganje (4:3)</p>
                  </div>
                )}
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
             </label>
          </div>
        </div>

        {/* RIGHT COLUMN - Form */}
        <div className="flex-1 ui-card p-6 md:p-10 flex flex-col">
          <div className="flex items-center space-x-3 mb-8">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[#dba032]">
                <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 0 1 1.06 0l4.5 4.5a.75.75 0 0 1-1.06 1.06l-3.22-3.22V16.5a.75.75 0 0 1-1.5 0V4.81L8.03 8.03a.75.75 0 0 1-1.06-1.06l4.5-4.5ZM3 15.75a.75.75 0 0 1 .75.75v2.25a1.5 1.5 0 0 0 1.5 1.5h13.5a1.5 1.5 0 0 0 1.5-1.5V16.5a.75.75 0 0 1 1.5 0v2.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V16.5a.75.75 0 0 1 .75-.75Z" clipRule="evenodd" />
             </svg>
             <h2 className="ui-page-title m-0">Podatki o ekipi</h2>
          </div>

          <form onSubmit={handleSubmit} className="ui-form-box space-y-6 flex-1 flex flex-col">
             
             <div className="flex flex-col md:flex-row md:items-center py-2 border-b border-[#f3ebcd]">
                <div className="w-full md:w-[35%] flex items-center mb-2 md:mb-0 pr-4">
                  <label className="ui-label m-0">Ime ekipe <span className="text-[#d29729]">*</span></label>
                </div>
                <div className="w-full md:w-[65%]">
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="npr. Nogometna ekipa"
                    className="ui-input"
                  />
                </div>
             </div>

             <div className="flex flex-col md:flex-row py-4 border-b border-[#f3ebcd]">
                <div className="w-full md:w-[35%] flex items-start mt-2 mb-2 md:mb-0 pr-4">
                  <label className="ui-label m-0">Izberi šport <span className="text-[#d29729]">*</span></label>
                </div>
                <div className="w-full md:w-[65%]">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                     {SPORTS.map(sport => (
                       <button
                         key={sport.name}
                         type="button"
                         onClick={() => setFormData({...formData, sport: sport.name})}
                         className={`relative p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition-all ${
                           formData.sport === sport.name 
                             ? 'border-[#eeb054] bg-[#fdfaf1] shadow-sm transform scale-[1.02]' 
                             : 'border-transparent bg-gray-50 hover:bg-gray-100 hover:border-gray-200'
                         }`}
                       >
                         {formData.sport === sport.name && (
                           <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#eeb054] rounded-full flex items-center justify-center">
                             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-3 h-3"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                           </div>
                         )}
                         <span className="text-2xl">{sport.icon}</span>
                         <span className={`text-xs font-bold text-center ${formData.sport === sport.name ? 'text-[#dba032]' : 'text-gray-600'}`}>{sport.name}</span>
                       </button>
                     ))}
                  </div>
                </div>
             </div>

             <div className="flex flex-col md:flex-row py-4 border-b border-[#f3ebcd]">
                <div className="w-full md:w-[35%] mb-2 md:mb-0 pr-4">
                  <label className="ui-label m-0">Opis ekipe</label>
                </div>
                <div className="w-full md:w-[65%]">
                  <textarea
                    value={formData.desc}
                    onChange={e => setFormData({...formData, desc: e.target.value})}
                    placeholder="npr. Dvakrat tedensko termin malega nogometa"
                    className="ui-input min-h-[100px] resize-y"
                  />
                </div>
             </div>
             
             {/* Footer Buttons */}
             <div className="flex-1 flex flex-col justify-end">
               <div className="flex items-center justify-end space-x-4 mt-8 pt-6 border-t border-[#f3ebcd]">
                  <button 
                    type="button" 
                    onClick={() => router.push('/teams')}
                    className="btn-secondary px-6"
                  >
                    Prekliči
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
                    <span>Shrani spremembe</span>
                  </button>
               </div>
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
