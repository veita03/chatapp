"use client";

import { useMutation, useQuery, useConvexAuth } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import ImageCropper from "@/components/ImageCropper";
import { translations, Language } from "@/app/i18n";
import { useLanguage } from "@/components/LanguageContext";

const SPORTS = [
  { id: "badminton", name: "Badminton", icon: "🏸" },
  { id: "basketball", name: "Košarka", icon: "🏀" },
  { id: "tableTennis", name: "Namizni tenis", icon: "🏓" },
  { id: "football", name: "Nogomet", icon: "⚽" },
  { id: "volleyball", name: "Odbojka", icon: "🏐" },
  { id: "padel", name: "Padel", icon: "🎾" },
  { id: "tennis", name: "Tenis", icon: "🎾" }
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
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const { language: currentLang } = useLanguage();
  const t = (translations[currentLang as Language] || translations.sl) as any;
  
  const createTeam = useMutation(api.teams.createTeam);

  const [formData, setFormData] = useState({
    name: "",
    seasonName: "",
    sport: "",
    desc: "",
    image: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{name?: string, seasonName?: string, sport?: string}>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const seasonNameInputRef = useRef<HTMLInputElement>(null);
  const sportInputRef = useRef<HTMLDivElement>(null);
  const [baseUrl, setBaseUrl] = useState("https://www.sport2go.app");
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);

  const currentUser = useQuery(api.users.current);
  const generateNextJoinCode = useMutation(api.users.generateNextJoinCode);
  const [joinCode, setJoinCode] = useState("");
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    setBaseUrl(window.location.origin);
  }, []);

  useEffect(() => {
    // Sync joinCode with the fetched user profile data
    if (currentUser?.nextSeasonJoinCode) {
      setJoinCode(currentUser.nextSeasonJoinCode);
    }
  }, [currentUser?.nextSeasonJoinCode]);

  useEffect(() => {
    let mounted = true;

    async function ensureJoinCode() {
      // Only trigger if we definitely have a user but they are missing the code
      if (currentUser && !currentUser.nextSeasonJoinCode && !joinCode) {
        try {
          const code = await generateNextJoinCode();
          if (mounted && code) {
            setJoinCode(code);
          }
        } catch (e) {
          console.error("Failed to ensure join code:", e);
        }
      }
    }

    ensureJoinCode();

    return () => {
      mounted = false;
    };
  }, [currentUser, joinCode]); // depend on currentUser to trigger when user loads

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

  const isValidEmail = (email: string) => {
    return email === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
    
    // Validate
    setSubmitError(null);
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = t.fillRequired;
    if (!formData.seasonName.trim()) newErrors.seasonName = t.fillRequired;
    if (!formData.sport) newErrors.sport = t.fillRequired;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Scroll to the first error
      if (newErrors.name && nameInputRef.current) {
        nameInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (newErrors.seasonName && seasonNameInputRef.current) {
        seasonNameInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else if (newErrors.sport && sportInputRef.current) {
        sportInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Check for invalid emails before submitting
    const hasInvalidEmails = players.some(p => p.email && !isValidEmail(p.email));
    if (hasInvalidEmails) {
      setSubmitError("Prosimo, popravite neveljavne e-poštne naslove preden nadaljujete.");
      return;
    }

    setErrors({});

    setIsSubmitting(true);
    try {
      const validPlayers = players.filter(p => p.firstName || p.lastName || p.email);
      const newTeamId = await createTeam({
        ...formData,
        seasonJoinCode: joinCode,
        newPlayers: validPlayers
      });
      router.push(`/teams`); // Redirect back to teams dashboard after creation
    } catch (error: any) {
       console.error(error);
       setSubmitError(error.message || t.errorCreatingTeam);
       window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  if (isAuthLoading || !isAuthenticated) {
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

  return (
    <div className="min-h-screen bg-[#F4F6F8] font-sans flex flex-col relative pb-20">
      <Header />
      <div className="h-[100px] md:h-[60px]" />

      {/* Banner */}
      <div className="w-full" style={{background: '#efc463'}}>
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-5 flex items-center space-x-3">
           <button onClick={() => router.push('/teams')} className="text-white hover:bg-white/20 p-2 rounded-full transition-colors mr-2">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
               <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
             </svg>
           </button>
           <h1 className="text-2xl md:text-[28px] font-bold text-white tracking-wide" style={{fontFamily: 'var(--font-montserrat)'}}>
              {t.createTeamBanner}
           </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-8 mt-8 pb-12">
        <div className="ui-card p-6 md:p-10 flex flex-col">
          <div className="flex items-center space-x-3 mb-8 pb-4 border-b border-gray-100">
             <h2 className="text-[22px] font-bold text-[#353b41]" style={{fontFamily: 'var(--font-montserrat)'}}>{t.addNewTeamAndSeason}</h2>
          </div>

          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-8">
              
              {/* Left Column Data */}
              <div className="space-y-6">
                 
                 <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-1.5">
                       <label className="ui-label m-0">{t.teamName} <span className="text-[#d29729]">*</span></label>
                       <InfoTooltip text={t.teamNameTooltip} />
                    </div>
                    <input
                      ref={nameInputRef}
                      type="text"
                      value={formData.name}
                      onChange={e => { setFormData({...formData, name: e.target.value}); setErrors({...errors, name: undefined}); }}
                      placeholder={t.teamNamePlaceholder}
                      className={`ui-input bg-white text-sm py-2.5 px-3 ${errors.name ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : ''}`}
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center"><svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{errors.name}</p>}
                 </div>

                 <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-1.5">
                       <label className="ui-label m-0">{t.seasonName} <span className="text-[#d29729]">*</span></label>
                       <InfoTooltip text={t.seasonNameTooltip} />
                    </div>
                    <input
                      ref={seasonNameInputRef}
                      type="text"
                      value={formData.seasonName}
                      onChange={e => { setFormData({...formData, seasonName: e.target.value}); setErrors({...errors, seasonName: undefined}); }}
                      placeholder={t.seasonNamePlaceholder}
                      className={`ui-input bg-white text-sm py-2.5 px-3 ${errors.seasonName ? 'border-red-400 focus:ring-red-400 focus:border-red-400' : ''}`}
                    />
                    {errors.seasonName && <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center"><svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{errors.seasonName}</p>}
                 </div>

                 <div className="flex flex-col">
                    <div className="flex justify-between items-center mb-2.5">
                       <label className="ui-label m-0">{t.selectSport} <span className="text-[#d29729]">*</span></label>
                       <InfoTooltip text={t.selectSportTooltip} />
                    </div>
                    <div ref={sportInputRef} className={`ui-input bg-white py-4 px-3 flex flex-wrap justify-center gap-2.5 ${errors.sport ? 'border-red-400' : ''}`}>
                       {SPORTS.map((sport, idx) => (
                         <button
                           key={sport.id}
                           type="button"
                           onClick={() => { setFormData({...formData, sport: sport.id}); setErrors({...errors, sport: undefined}); }}
                           className={`px-4 py-2 rounded-md border transition-all text-sm font-medium ${
                             (formData.sport === sport.id || formData.sport === sport.name)
                               ? 'border-[#eeb054] text-[#dba032] shadow-[0_0_0_1px_rgba(238,176,84,0.3)] bg-[#fdfaf1]' 
                               : 'border-[#f3ebcd] text-gray-500 hover:border-[#eeb054]/50 hover:text-gray-700 hover:bg-gray-50 bg-white'
                           }`}
                         >
                           <span className="mr-1.5">{sport.icon}</span>{t.sports ? t.sports[sport.id] : sport.name}
                         </button>
                       ))}
                    </div>
                    {errors.sport && <p className="text-red-500 text-xs mt-1.5 font-medium flex items-center"><svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>{errors.sport}</p>}
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

            {/* Invite Section */}
            <div className="flex flex-col pt-6 border-t border-gray-100 mb-8">
               <div className="flex justify-between items-center mb-4">
                  <label className="ui-label block m-0">{t.addPlayersOptional}</label>
                  <InfoTooltip text={t.addPlayersTooltip} />
               </div>
               
               <div className="bg-[#fcfaf5] border border-[#f3ebcd] rounded-xl p-6 sm:p-8 text-center relative overflow-hidden flex flex-col items-center">
                  
                  <h4 className="text-[#eeb054] font-bold text-[15px] mb-2 flex items-center justify-center">
                    {t.inviteInApp}
                    <InfoTooltip text={t.inviteLinkTooltip} />
                  </h4>

                  {/* Social Share Buttons */}
                  <div className="flex items-center justify-center gap-3 md:gap-4 my-5">
                    {/* SMS */}
                    <button type="button" onClick={() => window.open(`sms:?body=Pridruži se moji ekipi na Sport2Go! Povezava: https://www.sport2go.app/sezona/${joinCode}`)} className="w-10 h-10 rounded-full bg-[#eeb054] hover:bg-[#dba032] flex items-center justify-center text-white transition-colors shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>
                    </button>
                    {/* Messenger */}
                    <button type="button" onClick={() => window.open(`fb-messenger://share/?link=https://www.sport2go.app/sezona/${joinCode}`)} className="w-10 h-10 rounded-full bg-[#eeb054] hover:bg-[#dba032] flex items-center justify-center text-white transition-colors shadow-sm">
                       <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M12 2C6.477 2 2 6.145 2 11.26c0 2.91 1.488 5.498 3.795 7.182V22l3.456-1.895c.877.24 1.801.375 2.749.375 5.523 0 10-4.145 10-9.26S17.523 2 12 2zm1.18 12.03-3.085-3.296-6.023 3.296 6.64-7.034 3.195 3.181 5.912-3.181-6.639 7.034z"/></svg>
                    </button>
                    {/* WhatsApp */}
                    <button type="button" onClick={() => window.open(`https://wa.me/?text=Pridruži se moji ekipi na Sport2Go! Povezava: https://www.sport2go.app/sezona/${joinCode}`)} className="w-10 h-10 rounded-full bg-[#eeb054] hover:bg-[#dba032] flex items-center justify-center text-white transition-colors shadow-sm">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.001 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    </button>
                    {/* Viber */}
                    <button type="button" onClick={() => window.open(`viber://forward?text=Pridruži se moji ekipi na Sport2Go! Povezava: https://www.sport2go.app/sezona/${joinCode}`)} className="w-10 h-10 rounded-full bg-[#eeb054] hover:bg-[#dba032] flex items-center justify-center text-white transition-colors shadow-sm">
                      <svg viewBox="0 0 512 512" fill="currentColor" className="w-[22px] h-[22px] mb-[1px]"><path d="M444 49.9C431.3 38.2 379.9.9 265.3.4c0 0-135.1-8.1-200.9 52.3C27.8 89.3 14.9 143 13.5 209.5c-1.4 66.5-3.1 191.1 117 224.9h.1l-.1 51.6s-.8 20.9 13 25.1c16.6 5.2 26.4-10.7 42.3-27.8 8.7-9.4 20.7-23.2 29.8-33.7 82.2 6.9 145.3-8.9 152.5-11.2 16.6-5.4 110.5-17.4 125.7-142 15.8-128.6-7.6-209.8-49.8-246.5zM457.9 287c-12.9 104-89 110.6-103 115.1-6 1.9-61.5 15.7-131.2 11.2 0 0-52 62.7-68.2 79-5.3 5.3-11.1 4.8-11-5.7 0-6.9.4-85.7.4-85.7-.1 0-.1 0 0 0-101.8-28.2-95.8-134.3-94.7-189.8 1.1-55.5 11.6-101 42.6-131.6 55.7-50.5 170.4-43 170.4-43 96.9.4 143.3 29.6 154.1 39.4 35.7 30.6 53.9 103.8 40.6 211.1zm-139-80.8c.4 8.6-12.5 9.2-12.9.6-1.1-22-11.4-32.7-32.6-33.9-8.6-.5-7.8-13.4.7-12.9 27.9 1.5 43.4 17.5 44.8 46.2zm20.3 11.3c1-42.4-25.5-75.6-75.8-79.3-8.5-.6-7.6-13.5.9-12.9 58 4.2 88.9 44.1 87.8 92.5-.1 8.6-13.1 8.2-12.9-.3zm47 13.4c.1 8.6-12.9 8.7-12.9.1-.6-81.5-54.9-125.9-120.8-126.4-8.5-.1-8.5-12.9 0-12.9 73.7.5 133 51.4 133.7 139.2zM374.9 329v.2c-10.8 19-31 40-51.8 33.3l-.2-.3c-21.1-5.9-70.8-31.5-102.2-56.5-16.2-12.8-31-27.9-42.4-42.4-10.3-12.9-20.7-28.2-30.8-46.6-21.3-38.5-26-55.7-26-55.7-6.7-20.8 14.2-41 33.3-51.8h.2c9.2-4.8 18-3.2 23.9 3.9 0 0 12.4 14.8 17.7 22.1 5 6.8 11.7 17.7 15.2 23.8 6.1 10.9 2.3 22-3.7 26.6l-12 9.6c-6.1 4.9-5.3 14-5.3 14s17.8 67.3 84.3 84.3c0 0 9.1.8 14-5.3l9.6-12c4.6-6 15.7-9.8 26.6-3.7 14.7 8.3 33.4 21.2 45.8 32.9 7 5.7 8.6 14.4 3.8 23.6z"/></svg>
                    </button>
                    {/* Native Share / General */}
                    <button type="button" onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: 'Sport2Go',
                            text: 'Pridruži se moji ekipi!',
                            url: `${baseUrl}/season/${joinCode}`
                          });
                        } else {
                          window.open(`mailto:?subject=Vabilo v ekipo na Sport2Go&body=Pridruži se moji ekipi na Sport2Go! Povezava: ${baseUrl}/season/${joinCode}`);
                        }
                    }} className="w-10 h-10 rounded-full bg-[#eeb054] hover:bg-[#dba032] flex items-center justify-center text-white transition-colors shadow-sm" title="Deli preko drugih aplikacij">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
                    </button>
                  </div>

                  <div className="w-full border-t-2 border-[#f3ebcd] my-5 mt-2 rounded-full"></div>

                  <h4 className="text-[#eeb054] font-bold text-[15px] mb-4 mt-2">
                    {t.orCopyLink}
                  </h4>
                  
                  {/* Join Code Box (Exact Mockup Match) */}
                  <div className="mb-6 w-full flex justify-center cursor-pointer group/code" onClick={() => { navigator.clipboard.writeText(`${joinCode}`); setIsCopied(true); setTimeout(() => setIsCopied(false), 2500); }} title="Klikni in kopiraj kodo">
                    <div className="inline-block bg-[#fdfaf1] border-2 border-[#eeb054]/30 rounded-xl px-10 py-5 shadow-sm relative overflow-hidden transition-all group-hover/code:border-[#eeb054] group-hover/code:shadow-md">
                       <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#eeb054] to-[#dba032]" />
                       <span className="text-[36px] leading-none font-black text-[#353b41] tracking-[0.15em] font-mono select-none text-center flex justify-center w-full min-w-[180px] mt-1">
                         {joinCode ? joinCode : <div className="w-8 h-8 border-4 border-[#eeb054]/30 border-t-[#eeb054] rounded-full animate-spin my-2" />}
                       </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center w-full max-w-[400px]">
                    <div className="flex items-center w-full border border-gray-200 bg-white rounded-lg overflow-hidden shadow-sm mt-1">
                      <input 
                         type="text" 
                         readOnly 
                         value={`${baseUrl}/season/${joinCode}`} 
                         className="flex-1 bg-white text-gray-500 text-[14px] px-4 py-2.5 outline-none" 
                      />
                      <button type="button" onClick={() => { navigator.clipboard.writeText(`${baseUrl}/season/${joinCode}`); setIsCopied(true); setTimeout(() => setIsCopied(false), 2500); }} className="bg-[#6db592] hover:bg-[#5b9e7e] text-white px-5 py-2.5 font-bold text-sm transition-colors flex items-center gap-1.5 focus:outline-none h-full border-l border-[#6db592]">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /></svg>
                        {t.copyBtn}
                      </button>
                    </div>
                    
                    {/* Inline Success Message for Copying */}
                    <div className={`mt-2 text-[#6db592] text-sm font-bold flex items-center space-x-1.5 transition-all duration-300 ${isCopied ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                      <span>{t.linkCopiedMsg || "Povezava uspešno kopirana!"}</span>
                    </div>
                  </div>

                  <div className="w-full mt-4 pt-6 border-t-2 border-[#f3ebcd] flex flex-col items-center">
                    <h4 className="text-[#eeb054] font-bold text-[15px] mb-4 flex items-center justify-center">
                       {t.orSendEmailInvite}
                       <InfoTooltip text={t.sendEmailInviteTooltip} />
                    </h4>
                    
                    <div className="w-full space-y-3">
                      {players.map((p, i) => {
                         const hasAnyInput = p.firstName || p.lastName || p.email;
                         const isEmailValid = isValidEmail(p.email);
                         const isManual = (p.firstName || p.lastName) && !p.email;
                         
                         return (
                           <div key={i} className="flex flex-col">
                              <div className="flex flex-col sm:flex-row gap-2">
                                <input type="text" placeholder={t.firstNamePlaceholder} value={p.firstName} onChange={e => updatePlayer(i, 'firstName', e.target.value)} className="ui-input flex-1 bg-white focus:ring-[#eeb054]/50" />
                                <input type="text" placeholder={t.lastNamePlaceholder} value={p.lastName} onChange={e => updatePlayer(i, 'lastName', e.target.value)} className="ui-input flex-1 bg-white focus:ring-[#eeb054]/50" />
                                <input type="email" placeholder={t.emailPlaceholder} value={p.email} onChange={e => updatePlayer(i, 'email', e.target.value.trim())} className={`ui-input flex-1 bg-white focus:ring-[#eeb054]/50 ${!isEmailValid ? 'border-red-300 focus:border-red-400 focus:ring-red-400' : ''}`} />
                                <button type="button" onClick={() => removePlayerRow(i)} className="px-3 py-2 bg-red-50 text-red-400 hover:bg-red-100 font-medium text-sm rounded-lg transition-colors border border-red-100 shrink-0 select-none">
                                  {t.removeBtn}
                                </button>
                              </div>
                              
                              <div className="text-left text-xs mt-1.5 pl-1 min-h-[16px]">
                                {hasAnyInput && (
                                  <>
                                    {!isEmailValid ? (
                                      <span className="text-red-500 font-medium">{t.invalidEmail}</span>
                                    ) : p.email ? (
                                      <span className="text-gray-400 tracking-wide">{t.emailInviteMode}</span>
                                    ) : isManual ? (
                                      <span className="text-gray-400 tracking-wide">{t.manualEntryMode}</span>
                                    ) : null}
                                  </>
                                )}
                              </div>
                           </div>
                         );
                      })}
                    </div>
                    
                    <button type="button" onClick={addPlayerRow} className="mt-5 bg-[#eeb054] hover:bg-[#dba032] text-white font-bold text-sm px-5 py-2.5 rounded-lg shadow-sm transition-colors flex items-center space-x-1.5">
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
                       <span>{t.addNewPlayerBtn}</span>
                    </button>
                  </div>

               </div>
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
                 <span>{t.createTeamBtn}</span>
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
