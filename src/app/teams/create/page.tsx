"use client";

import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import ImageCropper from "@/components/ImageCropper";
import { translations, Language } from "@/app/i18n";
import Cookies from "js-cookie";

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

export default function CreateTeamPage() {
  const router = useRouter();
  const currentLang = Cookies.get("NEXT_LOCALE") || "sl";
  const t = translations[currentLang as Language] || translations.sl;
  
  const createTeam = useMutation(api.teams.createTeam);

  const [formData, setFormData] = useState({
    name: "",
    seasonName: "",
    sport: "",
    desc: "",
    image: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);

  const [joinCode, setJoinCode] = useState("");
  useEffect(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setJoinCode(result);
  }, []);

  const [players, setPlayers] = useState([{ firstName: "", lastName: "", email: "" }]);
  
  const addPlayerRow = () => {
    setPlayers([...players, { firstName: "", lastName: "", email: "" }]);
  };
  
  const removePlayerRow = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index));
  };
  
  const updatePlayer = (index: number, field: string, value: string) => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], [field]: value };
    setPlayers(newPlayers);
  };

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
    if (!formData.name || !formData.seasonName || !formData.sport) {
      alert("Izpolnite vsa obvezna polja.");
      return;
    }

    setIsSubmitting(true);
    try {
      const validPlayers = players.filter(p => p.firstName || p.lastName || p.email);
      const newTeamId = await createTeam({
        ...formData,
        seasonJoinCode: joinCode,
        newPlayers: validPlayers
      });
      router.push(`/teams`); // Redirect back to teams dashboard after creation
    } catch (error) {
       console.error(error);
       alert("Napaka pri ustvarjanju ekipe.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
              Ustvari Ekipo
           </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-8 mt-8 pb-12">
        <div className="ui-card p-6 md:p-10 flex flex-col">
          <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-gray-100">
             <h2 className="text-[22px] font-bold text-[#353b41]" style={{fontFamily: 'var(--font-montserrat)'}}>Dodaj novo ekipo in sezono</h2>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-8">
              
              {/* Left Column Data */}
              <div className="space-y-6">
                 
                 <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-1.5">
                       <label className="ui-label m-0">Ime ekipe <span className="text-[#d29729]">*</span></label>
                       <InfoTooltip text="Ime ekipe lahko kadarkoli spremeniš/dopolniš" />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      placeholder="npr. Nogometna ekipa"
                      className="ui-input bg-white text-sm py-2.5 px-3"
                    />
                 </div>

                 <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-1.5">
                       <label className="ui-label m-0">Ime sezone <span className="text-[#d29729]">*</span></label>
                       <InfoTooltip text="Ime sezone se uporablja za ločevanje statistike in zgodovinskega pregleda (npr. 'Jesen 2025' ali 'Liga I. faza', torkov termin). Trajanje in ime sezone lahko kadarkoli prilagodite." />
                    </div>
                    <input
                      type="text"
                      required
                      value={formData.seasonName}
                      onChange={e => setFormData({...formData, seasonName: e.target.value})}
                      placeholder="npr. 2025/2026 / Poletna liga 2026 / Torkov termin"
                      className="ui-input bg-white text-sm py-2.5 px-3"
                    />
                 </div>

                 <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-2.5">
                       <label className="ui-label m-0">Izberi šport iz seznama <span className="text-[#d29729]">*</span></label>
                       <InfoTooltip text="Izbereš lahko samo en šport, ker sta točkovanje in statistika prilagojena dotičnemu športu." />
                    </div>
                    <div className="ui-input bg-white py-4 px-3 flex flex-wrap justify-center gap-2.5">
                       {SPORTS.map((sport, idx) => (
                         <button
                           key={sport.name}
                           type="button"
                           onClick={() => setFormData({...formData, sport: sport.name})}
                           className={`px-4 py-2 rounded-md border transition-all text-sm font-medium ${
                             formData.sport === sport.name 
                               ? 'border-[#eeb054] text-[#dba032] shadow-[0_0_0_1px_rgba(238,176,84,0.3)] bg-[#fdfaf1]' 
                               : 'border-[#f3ebcd] text-gray-500 hover:border-[#eeb054]/50 hover:text-gray-700 hover:bg-gray-50 bg-white'
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
                    <label className="ui-label m-0">Slika ekipe</label>
                    <InfoTooltip text="Po želji lahko dodaš tudi fotografijo ekipe, pri čemer je zaželeno razmerje 4:3. Fotografijo je seveda mogoče dodati tudi kasneje." />
                 </div>
                 
                 <label className={`block w-full flex-1 min-h-[220px] bg-white border-2 border-dashed rounded-xl overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors flex flex-col items-center justify-center relative group ${formData.image ? 'border-[#eeb054]/30' : 'border-[#f3ebcd] hover:border-[#eeb054]/50'}`}>
                    {formData.image ? (
                      <>
                        <img src={formData.image} alt="Preview" className="w-full h-full object-cover absolute inset-0" />
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-[#dba032] text-sm font-bold">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-8 h-8 mb-2"><path d="M2.695 14.763l-1.262 3.152a.5.5 0 00.65.65l3.151-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" /></svg>
                          Spremeni sliko
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-6 h-full w-full">
                        <svg className="w-12 h-12 text-[#eeb054]/80 mb-3" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
                        </svg>
                        <p className="text-gray-500 text-sm font-medium">Spusti sliko sem ali klikni za izbor</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                 </label>
              </div>

            </div>

            {/* Description Area */}
            <div className="flex flex-col mb-10">
               <label className="ui-label mb-1.5">Opis ekipe</label>
               <textarea
                 value={formData.desc}
                 onChange={e => setFormData({...formData, desc: e.target.value})}
                 placeholder="npr. Dvakrat tedensko termin malega nogometa"
                 className="ui-input bg-white min-h-[100px] resize-y text-sm py-3 px-3 w-full"
               />
            </div>

            {/* Invite Section */}
            <div className="flex flex-col pt-6 border-t border-gray-100 mb-8">
               <div className="flex justify-between items-center mb-4">
                  <label className="ui-label block m-0">Dodaj igralce v ekipo in sezono (opcijsko)</label>
                  <InfoTooltip text="Člane lahko dodaš takoj po ustvaritvi ekipe preko unikatne povezave, elektronske pošte ali pa jih vneseš ročno (za člane brez digitalnega dostopa)." />
               </div>
               
               <div className="bg-[#fcfaf5] border border-[#f3ebcd] rounded-xl p-6 sm:p-8 text-center relative overflow-hidden flex flex-col items-center">
                  
                  <h4 className="text-[#eeb054] font-bold text-[15px] mb-2 flex items-center justify-center">
                    Povabi člane preko unikatne povezave
                    <InfoTooltip text="To je povezava do sezone. Kopiraj jo in jo pošlji preko želenega kanala." />
                  </h4>
                  <div className="flex items-center space-x-2 border opacity-90 border-[#eeb054]/50 bg-white rounded-lg p-1.5 px-3 max-w-[280px] w-full mx-auto select-none mt-2">
                    <div className="flex-1 font-bold text-[#eeb054] tracking-widest text-lg md:text-xl truncate select-text">{joinCode || "......"}</div>
                    <button type="button" onClick={() => { navigator.clipboard.writeText(`https://www.sport2go.app/sezona/${joinCode}`); alert("Povezava kopirana!"); }} className="bg-[#6db592] hover:bg-[#5b9e7e] text-white p-2.5 rounded-md cursor-pointer transition-colors" title="Kopiraj povezavo">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" /><path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" /></svg>
                    </button>
                  </div>
                  <div className="text-xs text-gray-400 mt-2 cursor-pointer hover:text-gray-500" onClick={() => { navigator.clipboard.writeText(`https://www.sport2go.app/sezona/${joinCode}`); alert("Povezava kopirana!"); }}>
                     Klikni in kopiraj povezavo
                  </div>

                  <div className="w-full mt-6 pt-6 border-t border-gray-100 flex flex-col items-center">
                    <h4 className="text-[#eeb054] font-bold text-[15px] mb-4 flex items-center justify-center">
                       Ali pošlji povabilo preko elektronske pošte:
                       <InfoTooltip text="Vnesi e-pošto za povabilo ali ime/priimek za ročni vnos brez povabila." />
                    </h4>
                    
                    <div className="w-full space-y-3">
                      {players.map((p, i) => (
                        <div key={i} className="flex flex-col">
                           <div className="flex flex-col sm:flex-row gap-2">
                             <input type="text" placeholder="Ime" value={p.firstName} onChange={e => updatePlayer(i, 'firstName', e.target.value)} className="ui-input flex-1 bg-white focus:ring-[#eeb054]/50" />
                             <input type="text" placeholder="Priimek" value={p.lastName} onChange={e => updatePlayer(i, 'lastName', e.target.value)} className="ui-input flex-1 bg-white focus:ring-[#eeb054]/50" />
                             <input type="email" placeholder="E-pošta" value={p.email} onChange={e => updatePlayer(i, 'email', e.target.value)} className="ui-input flex-1 bg-white focus:ring-[#eeb054]/50" />
                             <button type="button" onClick={() => removePlayerRow(i)} className="px-3 py-2 bg-red-50 text-red-400 hover:bg-red-100 font-medium text-sm rounded-lg transition-colors border border-red-100 shrink-0 select-none">
                               ✕ Odstrani
                             </button>
                           </div>
                           {(p.firstName || p.lastName) && !p.email && (
                              <div className="text-left text-xs text-[#6db592] mt-1.5 pl-1 font-medium bg-[#6db592]/10 py-1 px-2.5 rounded-md self-start inline-block border border-[#6db592]/20">
                                Način: Ročni vnos (brez povabila — e-pošta ni zahtevana).
                              </div>
                           )}
                        </div>
                      ))}
                    </div>
                    
                    <button type="button" onClick={addPlayerRow} className="mt-5 bg-[#eeb054] hover:bg-[#dba032] text-white font-bold text-sm px-5 py-2.5 rounded-lg shadow-sm transition-colors flex items-center space-x-1.5">
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
                       <span>Dodaj novega igralca</span>
                    </button>
                  </div>

               </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end space-x-4 border-t border-gray-100 pt-6">
               <button 
                 type="button" 
                 onClick={() => router.push('/teams')}
                 className="px-6 py-2.5 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-lg text-sm font-bold transition-all shadow-sm"
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
                 <span>Ustvari ekipo</span>
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
