"use client";

import { useMutation, useQuery } from "convex/react";
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
  const t = (translations[currentLang as Language] || translations.sl) as typeof translations.sl;
  
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
  const [baseUrl, setBaseUrl] = useState("https://www.sport2go.app");
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);

  const currentUser = useQuery(api.users.current);
  const generateNextJoinCode = useMutation(api.users.generateNextJoinCode);
  const [joinCode, setJoinCode] = useState("");

  useEffect(() => {
    if (currentUser !== undefined) {
      if (currentUser?.nextSeasonJoinCode) {
        setJoinCode(currentUser.nextSeasonJoinCode);
      } else if (currentUser && !joinCode) {
        // Guarantee we fetch/generate exactly one string for the session
        generateNextJoinCode().then((code) => setJoinCode(code));
      }
    }
  }, [currentUser, generateNextJoinCode, joinCode]);

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
    
    // Validate
    const newErrors: any = {};
    if (!formData.name.trim()) newErrors.name = t.fillRequired;
    if (!formData.seasonName.trim()) newErrors.seasonName = t.fillRequired;
    if (!formData.sport) newErrors.sport = t.fillRequired;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
    } catch (error) {
       console.error(error);
       alert(t.errorCreatingTeam);
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
              {t.createTeamBanner}
           </h1>
        </div>
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-8 mt-8 pb-12">
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
                    <div className={`ui-input bg-white py-4 px-3 flex flex-wrap justify-center gap-2.5 ${errors.sport ? 'border-red-400' : ''}`}>
                       {SPORTS.map((sport, idx) => (
                         <button
                           key={sport.name}
                           type="button"
                           onClick={() => { setFormData({...formData, sport: sport.name}); setErrors({...errors, sport: undefined}); }}
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
                    <button type="button" onClick={() => window.open(`sms:?body=Pridruži se moji ekipi na Sport2Go! Povezava: https://www.sport2go.app/sezona/${joinCode}`)} className="w-12 h-12 rounded-full bg-[#eeb054] hover:bg-[#dba032] flex items-center justify-center text-white transition-colors shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>
                    </button>
                    {/* Messenger */}
                    <button type="button" onClick={() => window.open(`fb-messenger://share/?link=https://www.sport2go.app/sezona/${joinCode}`)} className="w-12 h-12 rounded-full bg-[#eeb054] hover:bg-[#dba032] flex items-center justify-center text-white transition-colors shadow-sm">
                       <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 2C6.477 2 2 6.145 2 11.26c0 2.91 1.488 5.498 3.795 7.182V22l3.456-1.895c.877.24 1.801.375 2.749.375 5.523 0 10-4.145 10-9.26S17.523 2 12 2zm1.18 12.03-3.085-3.296-6.023 3.296 6.64-7.034 3.195 3.181 5.912-3.181-6.639 7.034z"/></svg>
                    </button>
                    {/* WhatsApp */}
                    <button type="button" onClick={() => window.open(`https://wa.me/?text=Pridruži se moji ekipi na Sport2Go! Povezava: https://www.sport2go.app/sezona/${joinCode}`)} className="w-12 h-12 rounded-full bg-[#eeb054] hover:bg-[#dba032] flex items-center justify-center text-white transition-colors shadow-sm">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12.031 2.052c-5.516 0-9.996 4.48-9.996 9.996 0 1.763.459 3.484 1.332 5.006L2.305 21l4.053-1.063c1.472.793 3.141 1.211 4.881 1.211l.004-.001c5.511 0 9.992-4.48 9.992-9.994 0-2.67-1.039-5.181-2.927-7.07-1.888-1.889-4.398-2.928-7.068-2.928...zM12.031 18.252l-.004.001c-1.492 0-2.955-.401-4.238-1.161l-.304-.18-3.148.825.84-3.069-.198-.314c-.836-1.328-1.278-2.861-1.278-4.43 0-4.609 3.753-8.36 8.365-8.36 2.233 0 4.331.869 5.91 2.449 1.578 1.58 2.447 3.679 2.447 5.912 0 4.609-3.753 8.36-8.365 8.36..."/></svg>
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
                    }} className="w-12 h-12 rounded-full bg-[#eeb054] hover:bg-[#dba032] flex items-center justify-center text-white transition-colors shadow-sm" title="Deli preko drugih aplikacij">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" /></svg>
                    </button>
                  </div>

                  <div className="w-full border-t border-gray-100/60 my-4"></div>

                  <h4 className="text-gray-500 font-bold text-sm mb-3">
                    {t.orCopyLink}
                  </h4>
                  <div className="flex items-center w-full max-w-[400px] border border-gray-200 bg-white rounded-lg overflow-hidden shadow-sm">
                    <div className="flex-1 text-gray-500 text-[14px] truncate px-4 py-2.5 bg-gray-50/50">
                       {baseUrl}/season/{joinCode}
                    </div>
                    <button type="button" onClick={() => { navigator.clipboard.writeText(`${baseUrl}/season/${joinCode}`); alert(t.linkCopiedMsg || "Povezava kopirana!"); }} className="bg-[#6db592] hover:bg-[#5b9e7e] text-white px-5 py-2.5 font-bold text-sm transition-colors flex items-center gap-1.5 focus:outline-none h-full border-l border-[#6db592]">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" /></svg>
                      {t.copyBtn}
                    </button>
                  </div>

                  <div className="w-full mt-6 pt-6 border-t border-gray-100 flex flex-col items-center">
                    <h4 className="text-[#eeb054] font-bold text-[15px] mb-4 flex items-center justify-center">
                       {t.orSendEmailInvite}
                       <InfoTooltip text={t.sendEmailInviteTooltip} />
                    </h4>
                    
                    <div className="w-full space-y-3">
                      {players.map((p, i) => (
                        <div key={i} className="flex flex-col">
                           <div className="flex flex-col sm:flex-row gap-2">
                             <input type="text" placeholder={t.firstNamePlaceholder} value={p.firstName} onChange={e => updatePlayer(i, 'firstName', e.target.value)} className="ui-input flex-1 bg-white focus:ring-[#eeb054]/50" />
                             <input type="text" placeholder={t.lastNamePlaceholder} value={p.lastName} onChange={e => updatePlayer(i, 'lastName', e.target.value)} className="ui-input flex-1 bg-white focus:ring-[#eeb054]/50" />
                             <input type="email" placeholder={t.emailPlaceholder} value={p.email} onChange={e => updatePlayer(i, 'email', e.target.value)} className="ui-input flex-1 bg-white focus:ring-[#eeb054]/50" />
                             <button type="button" onClick={() => removePlayerRow(i)} className="px-3 py-2 bg-red-50 text-red-400 hover:bg-red-100 font-medium text-sm rounded-lg transition-colors border border-red-100 shrink-0 select-none">
                               {t.removeBtn}
                             </button>
                           </div>
                           {(p.firstName || p.lastName) && !p.email && (
                              <div className="text-left text-xs text-[#6db592] mt-1.5 pl-1 font-medium bg-[#6db592]/10 py-1 px-2.5 rounded-md self-start inline-block border border-[#6db592]/20">
                                {t.manualEntryMode}
                              </div>
                           )}
                        </div>
                      ))}
                    </div>
                    
                    <button type="button" onClick={addPlayerRow} className="mt-5 bg-[#eeb054] hover:bg-[#dba032] text-white font-bold text-sm px-5 py-2.5 rounded-lg shadow-sm transition-colors flex items-center space-x-1.5">
                       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
                       <span>{t.addNewPlayerBtn}</span>
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
