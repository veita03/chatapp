"use client";

import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import Header from "../../components/Header";
import { api } from "../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { translations, Language } from "../i18n";
import { useLanguage } from "@/components/LanguageContext";

import PhoneInput, { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";

const AVATAR_OPTIONS = [
  "/avatars/uniform/m1.png",
  "/avatars/uniform/m2.png",
  "/avatars/uniform/m3.png",
  "/avatars/uniform/m4.png",
  "/avatars/uniform/f1.png",
  "/avatars/uniform/f2.png",
  "/avatars/uniform/f3.png",
  "/avatars/uniform/f4.png",
];

function OtpBlock({ email, otpCode, setOtpCode, generateOtp, error }: { email: string | undefined; otpCode: string; setOtpCode: (c: string) => void; generateOtp: () => Promise<any>; error?: string }) {
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    setCooldown(60);
    try {
      await generateOtp();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col pt-3 pb-2 animate-in fade-in slide-in-from-top-2">
       <div className="bg-[#fffbf2] border-2 border-[#eeb054] rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#eeb054]"></div>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-[17px] font-bold text-gray-800 mb-1.5 tracking-tight flex items-center gap-2" style={{fontFamily: 'var(--font-montserrat)'}}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-[#dba032]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.909A2.25 2.25 0 0 1 2.25 6.993V6.75m19.5 0v.243m0 0a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.909A2.25 2.25 0 0 1 2.25 6.993V6.75m0 0v.243" />
                </svg>
                Potrditev E-pošte
              </h3>
              <p className="text-[14px] text-gray-600 mb-4 font-normal leading-relaxed" style={{fontFamily: 'var(--font-cabin)'}}>
                Na zgornji naslov smo pravkar poslali <strong>6-mestno varnostno kodo</strong>. Prosimo, preverite svoj nabiralnik in jo vnesite spodaj za dokončanje registracije.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="relative">
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="000 000"
                className="w-[180px] text-center text-3xl tracking-[0.25em] font-bold text-[#dba032] py-3.5 bg-white border-2 border-dashed border-[#eeb054]/60 rounded-xl focus:outline-none focus:border-[#dba032] focus:ring-4 focus:ring-[#eeb054]/20 transition-all shadow-inner placeholder:text-gray-200 placeholder:tracking-normal"
              />
            </div>

            <div className="flex flex-col gap-2 items-center md:items-start text-sm md:ml-2">
               <span className="text-gray-500 italic max-w-xs text-center md:text-left text-[12.5px]">
                 Niste prejeli kode? Preverite tudi mapo "Vsiljena pošta".
               </span>
               <button
                 type="button"
                 onClick={handleResend}
                 disabled={cooldown > 0}
                 className={`px-4 py-1.5 rounded-md font-bold text-[13px] transition-colors border ${cooldown > 0 ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white text-[#d29729] border-[#d29729] hover:bg-[#fffbf2] shadow-sm'}`}
                 style={{fontFamily: 'var(--font-cabin)'}}
               >
                  {cooldown > 0 ? `Počakajte (${cooldown}s)` : "Pošlji znova"}
               </button>
            </div>
          </div>
          
          {otpCode.length > 0 && otpCode.length < 6 && (
            <p className="text-left text-[12px] text-red-500 mt-2.5 font-bold ml-1">Koda mora vsebovati 6 številk.</p>
          )}
          {error && (
            <p className="text-left text-[13px] text-red-500 mt-2.5 font-bold ml-1 bg-red-50 px-2 py-1 rounded inline-block">{error}</p>
          )}
       </div>
    </div>
  );
}

export default function ProfilePage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const currentUser = useQuery(api.users.current, isAuthenticated ? {} : "skip");
  const updateProfile = useMutation(api.users.updateProfile);
  const router = useRouter();

  const generateOtp = useMutation(api.users.generateOtp);

  const { language: currentLang } = useLanguage();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState<string>("");
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  const [errors, setErrors] = useState<{global?: string, firstName?: string, lastName?: string, otp?: string}>({});
  const [isSaving, setIsSaving] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  const t = (translations as any)[currentLang] || translations["sl"];
  const defaultCountry = currentLang === "sl" ? "SI" : "US";

  // Sync current user data
  useEffect(() => {
    if (currentUser) {
      if (currentUser.firstName) setFirstName(currentUser.firstName);
      if (currentUser.lastName) setLastName(currentUser.lastName);
      if (currentUser.phone) setPhone(currentUser.phone);
      if (currentUser.dateOfBirth) setDateOfBirth(currentUser.dateOfBirth);
      if (currentUser.gender) setGender(currentUser.gender);
      if (currentUser.image) setSelectedAvatar(currentUser.image);
    }
  }, [currentUser]);

  const needsOtp = currentUser ? (currentUser.email && !currentUser.isAnonymous && !currentUser.emailVerificationTime) : false;

  useEffect(() => {
    if (needsOtp && !otpSent) {
      setOtpSent(true);
      generateOtp().catch(console.error);
    }
  }, [needsOtp, otpSent, generateOtp]);

  // Auth Protection
  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthLoading, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    let hasClientError = false;
    const newErrors: typeof errors = {};

    if (!firstName.trim()) {
      newErrors.firstName = t.fillRequired || "To polje je obvezno.";
      hasClientError = true;
    }
    if (!lastName.trim()) {
      newErrors.lastName = t.fillRequired || "To polje je obvezno.";
      hasClientError = true;
    }
    if (phone && !isValidPhoneNumber(phone)) {
      newErrors.global = t.phoneInvalid || "Neveljavna telefonska številka.";
      hasClientError = true;
    }
    if (needsOtp && otpCode.length !== 6) {
      newErrors.otp = "Prosimo, vnesite pravilno 6-mestno kodo z emaila.";
      hasClientError = true;
    }

    if (hasClientError) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    try {
      const result = await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone || undefined,
        dateOfBirth: dateOfBirth || undefined,
        gender: gender || undefined,
        image: selectedAvatar || undefined,
        otpCode: needsOtp ? otpCode : undefined,
      });
      
      if (result && !result.success) {
        if (result.error?.includes("Neveljavna ali prazna potrditvena koda")) {
          setErrors({ otp: result.error });
        } else {
          setErrors({ global: result.error || "Prišlo je do neznane napake." });
        }
        setIsSaving(false);
        return;
      }
      
      // On success, go to teams
      router.push("/teams");
    } catch (err: unknown) {
      console.error(err);
      const msg = err instanceof Error 
        ? err.message.replace("Uncaught Error: ", "").replace("[CONVEX M(users:updateProfile)] ", "") 
        : "Prišlo je do napake pri shranjevanju.";
      setErrors({ global: msg });
    } finally {
      setIsSaving(false);
    }
  };

  if (isAuthLoading || !isAuthenticated || !currentUser) {
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

  // Parse date pieces
  const [bYear, bMonth, bDay] = dateOfBirth ? dateOfBirth.split("-") : ["", "", ""];
  
  const handleDateChange = (type: "year" | "month" | "day", val: string) => {
    let y = bYear || new Date().getFullYear().toString();
    let m = bMonth || "01";
    let d = bDay || "01";
    if (type === "year") y = val;
    if (type === "month") m = val;
    if (type === "day") d = val;
    setDateOfBirth(`${y}-${m}-${d}`);
  };

  const handleCustomImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Resize image to max 300x300 and convert to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 300;
        
        if (width > height) {
          if (width > maxDim) {
            height *= maxDim / width;
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width *= maxDim / height;
            height = maxDim;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);
        setSelectedAvatar(dataUrl);
        setIsAvatarModalOpen(false); // close modal after custom selection
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] font-sans flex flex-col relative pb-20">
      
      {/* Absolute base Header */}
      <Header />

      {/* spacer to ignore absolute header */}
      <div className="h-[100px] md:h-[60px]" />

      {/* Title block */}
      <div className="w-full" style={{background: '#f4c361'}}>
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-5 flex items-center space-x-3">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7 text-white/90">
             <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
           </svg>
           <h1 className="text-2xl md:text-[28px] font-bold text-white tracking-wide" style={{fontFamily: 'var(--font-montserrat)'}}>
              {t.profileTitle}
           </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-8 mt-8 flex flex-col md:flex-row gap-8">
        
        {/* LEFT COLUMN */}
        <div className="w-full md:w-[320px] flex flex-col gap-6 shrink-0">
          
          {/* Avatar Card */}
          <div className="ui-card p-8 flex flex-col items-center relative">
             <p className="ui-section-title mb-6 text-center">{t.chooseProfilePic || "Izberi prikazno sliko"}</p>
             
             <div className="relative mb-6">
                <div className="w-36 h-36 rounded-full overflow-hidden border-[6px] border-[#a0e4cc]/20 shadow-md bg-gray-50 flex items-center justify-center">
                  {selectedAvatar ? (
                    <img src={selectedAvatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl font-bold text-[#eeb054]">{firstName ? firstName[0] : (currentUser.email ? currentUser.email[0].toUpperCase() : "U")}</span>
                  )}
                </div>
                {/* Edit Button */}
                <button 
                   onClick={() => setIsAvatarModalOpen(true)}
                   className="absolute bottom-1 right-1 w-9 h-9 bg-[#eeb054] hover:bg-[#dba032] transition-colors rounded-full flex items-center justify-center shadow-lg border-2 border-white text-white"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                     <path d="M2.695 14.763l-1.262 3.152a.5.5 0 00.65.65l3.151-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" />
                   </svg>
                </button>
             </div>

             <h2 className="text-2xl font-bold text-gray-800 tracking-tight" style={{fontFamily: 'var(--font-montserrat)'}}>
                {firstName || lastName ? `${firstName} ${lastName}`.trim() : "Nov Uporabnik"}
             </h2>

             {currentUser.email && (
               <div className="mt-3 bg-[#eeb054] px-4 py-1.5 rounded-md shadow-sm">
                 <span className="text-white font-medium text-sm tracking-wide">{currentUser.email}</span>
               </div>
             )}
          </div>

          {/* Registration Info Card */}
          <div className="ui-card p-6 flex flex-col relative">
             <p className="ui-section-title mb-4 text-left">{t.registration || "Registracija"}</p>
             <div className="flex items-center justify-between">
                <span className="text-gray-600 font-bold text-sm tracking-wide">
                  {new Date(currentUser._creationTime).toLocaleDateString("sl-SI")}
                </span>
                
                {/* Just mimicking the Google provider image from the screenshot */}
                <div className="flex items-center bg-[#4285F4] px-2 py-1 rounded text-white text-xs font-bold space-x-1 shadow-sm">
                   <div className="bg-white p-0.5 rounded-sm">
                     <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="12px" height="12px">
                       <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                       <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
                       <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                       <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                     </svg>
                   </div>
                   <span>Google</span>
                </div>
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="flex-1 ui-card p-6 md:p-10">
           
           <div className="flex items-center space-x-3 mb-8">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[#dba032]">
                 <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
              </svg>
               <h2 className="ui-page-title">{t.personalData || "Osebni podatki"}</h2>
           </div>

           <form onSubmit={handleSubmit} className="ui-form-box space-y-6">
              {errors.global && (
                <div className="bg-red-50 text-red-500 text-sm font-bold px-4 py-3 rounded-lg border border-red-100 mb-6">
                  {errors.global}
                </div>
              )}

              {/* Grid rows logic -> label takes 30%, input takes 70% */}
              <div className="flex flex-col md:flex-row md:items-center py-2 border-b border-[#f3ebcd]">
                 <label className="w-full md:w-[35%] ui-label mb-2 md:mb-0 pr-4">{t.firstName} <span className="text-[#d29729]">*</span></label>
                 <div className="w-full md:w-[65%]">
                   <input
                     type="text"
                     value={firstName}
                     onChange={(e) => { setFirstName(e.target.value); setErrors(p => ({...p, firstName: undefined})); }}
                     className={`ui-input ${errors.firstName ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                     placeholder={t.enterName || "Vnesite ime"}
                   />
                   {errors.firstName && <p className="text-red-500 text-xs mt-1.5 font-bold ml-1">{errors.firstName}</p>}
                 </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center py-2 border-b border-[#f3ebcd]">
                 <label className="w-full md:w-[35%] ui-label mb-2 md:mb-0 pr-4">{t.lastName} <span className="text-[#d29729]">*</span></label>
                 <div className="w-full md:w-[65%]">
                   <input
                     type="text"
                     value={lastName}
                     onChange={(e) => { setLastName(e.target.value); setErrors(p => ({...p, lastName: undefined})); }}
                     className={`ui-input ${errors.lastName ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
                     placeholder={t.enterSurname || "Vnesite priimek"}
                   />
                   {errors.lastName && <p className="text-red-500 text-xs mt-1.5 font-bold ml-1">{errors.lastName}</p>}
                 </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center py-2 border-b border-[#f3ebcd]">
                 <label className="w-full md:w-[35%] ui-label mb-2 md:mb-0 pr-4">{t.emailAlreadyEntered || "Email (že vpisan)"}</label>
                 <div className="w-full md:w-[65%]">
                   <input
                     type="email"
                     value={currentUser.email || ""}
                     readOnly
                     className="ui-input bg-white/60 text-gray-500 cursor-not-allowed border-gray-200 shadow-none focus:ring-0"
                   />
                 </div>
              </div>

              {needsOtp && (
                <OtpBlock 
                  email={currentUser?.email} 
                  otpCode={otpCode} 
                  setOtpCode={(code) => { setOtpCode(code); setErrors(p => ({...p, otp: undefined})); }} 
                  generateOtp={generateOtp}
                  error={errors.otp}
                />
              )}

              <div className="flex flex-col md:flex-row md:items-center py-2 border-b border-[#f3ebcd]">
                 <label className="w-full md:w-[35%] ui-label mb-2 md:mb-0 pr-4">{t.phone}</label>
                 <div className="w-full md:w-[65%] flex">
                    <div className="flex-1 bg-white border border-gray-200 rounded-lg px-4 py-1.5 focus-within:ring-2 focus-within:ring-[#eeb054]/50 transition-all">
                      <PhoneInput
                        placeholder="Telefonska številka"
                        value={phone}
                        onChange={(val) => setPhone(val || "")}
                        defaultCountry={defaultCountry as any}
                        international
                        className="w-full bg-transparent text-gray-800 text-sm h-8"
                      />
                    </div>
                 </div>
                 <style jsx global>{`
                    .PhoneInputInput { border: none; background: transparent; outline: none; width: 100%; margin-left: 10px; font-size: 0.875rem; color: #1f2937; }
                    .PhoneInputCountry { margin-right: 5px; }
                 `}</style>
              </div>

              <div className="flex flex-col md:flex-row md:items-center py-2 border-b border-[#f3ebcd]">
                 <label className="w-full md:w-[35%] ui-label mb-2 md:mb-0 pr-4">{t.dob}</label>
                 <div className="w-full md:w-[65%] grid grid-cols-3 gap-2">
                    <div className="relative">
                      <select 
                        value={bDay} onChange={(e) => handleDateChange("day", e.target.value)}
                        className="w-full bg-white text-gray-700 rounded-lg px-3 py-2.5 border border-gray-200 text-sm appearance-none outline-none focus:border-[#eeb054]"
                      >
                         <option value="">{t.day || "Dan"}</option>
                         {Array.from({length: 31}, (_, i) => (i+1).toString().padStart(2, "0")).map(day => <option key={day} value={day}>{day}</option>)}
                      </select>
                      <span className="absolute right-3 top-3 pointer-events-none text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                      </span>
                    </div>
                    <div className="relative">
                      <select 
                        value={bMonth} onChange={(e) => handleDateChange("month", e.target.value)}
                        className="w-full bg-white text-gray-700 rounded-lg px-3 py-2.5 border border-gray-200 text-sm appearance-none outline-none focus:border-[#eeb054]"
                      >
                         <option value="">{t.month || "Mesec"}</option>
                         {Array.from({length: 12}, (_, i) => (i+1).toString().padStart(2, "0")).map(month => <option key={month} value={month}>{month}</option>)}
                      </select>
                      <span className="absolute right-3 top-3 pointer-events-none text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                      </span>
                    </div>
                    <div className="relative">
                      <select 
                        value={bYear} onChange={(e) => handleDateChange("year", e.target.value)}
                        className="w-full bg-white text-gray-700 rounded-lg px-3 py-2.5 border border-gray-200 text-sm appearance-none outline-none focus:border-[#eeb054]"
                      >
                         <option value="">{t.year || "Leto"}</option>
                         {Array.from({length: 100}, (_, i) => (new Date().getFullYear() - i).toString()).map(year => <option key={year} value={year}>{year}</option>)}
                      </select>
                      <span className="absolute right-3 top-3 pointer-events-none text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
                      </span>
                    </div>
                 </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center py-2 border-b border-[#f3ebcd]">
                 <label className="w-full md:w-[35%] text-[#d29729] font-bold text-sm mb-2 md:mb-0 pr-4">{t.gender}</label>
                 <div className="w-full md:w-[65%] flex">
                    <label className={`flex-1 flex items-center justify-center space-x-2 py-2.5 bg-white border border-gray-200 text-sm cursor-pointer rounded-l-lg transition-colors ${gender === "male" ? "text-gray-800" : "text-gray-500"}`}>
                       <input 
                         type="radio" name="gender" value="male" 
                         checked={gender === "male"} onChange={(e) => setGender(e.target.value)}
                         className="hidden" 
                       />
                       <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${gender === "male" ? "border-[#eeb054] bg-[#eeb054]" : "border-gray-300"}`}>
                         {gender === "male" && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-3 h-3"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>}
                       </div>
                       <span className="font-semibold">{t.genderMale}</span>
                    </label>
                    <label className={`flex-1 flex items-center justify-center space-x-2 py-2.5 bg-white border border-gray-200 border-l-0 text-sm cursor-pointer rounded-r-lg transition-colors ${gender === "female" ? "text-gray-800" : "text-gray-500"}`}>
                       <input 
                         type="radio" name="gender" value="female" 
                         checked={gender === "female"} onChange={(e) => setGender(e.target.value)}
                         className="hidden" 
                       />
                       <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${gender === "female" ? "border-[#eeb054] bg-[#eeb054]" : "border-gray-300"}`}>
                         {gender === "female" && <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-3 h-3"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>}
                       </div>
                       <span className="font-semibold">{t.genderFemale}</span>
                    </label>
                 </div>
              </div>

              <div className="flex justify-center pt-8 border-t border-[#f3ebcd] mt-8">
                 <button
                   type="submit"
                   disabled={isSaving}
                   className="bg-[#6db592] hover:bg-[#5b9e7e] disabled:opacity-70 text-white font-bold text-sm py-2.5 px-8 rounded-lg transition-all flex items-center justify-center space-x-2"
                   style={{fontFamily: 'var(--font-cabin)'}}
                 >
                   {isSaving ? (
                     <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>{t.savingBtn}</span>
                     </>
                   ) : (
                     <>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                        <span>{t.save || "Shrani"}</span>
                     </>
                   )}
                 </button>
              </div>

           </form>
        </div>
      </div>

      {/* Avatar Selection Modal */}
      {isAvatarModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
           <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-lg w-full animate-in fade-in zoom-in-95 duration-200">
              <h3 className="text-xl font-bold text-gray-800 mb-6 text-center" style={{fontFamily: 'var(--font-montserrat)'}}>{t.chooseProfilePic || "Izberi prikazno sliko"}</h3>
              <div className="grid grid-cols-4 gap-4 mb-6">
                {AVATAR_OPTIONS.map((avatar, i) => (
                  <button 
                    key={i}
                    onClick={() => setSelectedAvatar(avatar)}
                    className={`w-full aspect-square rounded-full overflow-hidden border-4 transition-all ${selectedAvatar === avatar ? 'border-[#eeb054] scale-105 shadow-md' : 'border-transparent hover:border-gray-200'}`}
                  >
                     <img src={avatar} className="w-full h-full object-cover" alt="Avatar option" />
                  </button>
                ))}
              </div>
              
              <div className="mb-8 border-t border-gray-100 pt-6">
                 <label className="flex items-center justify-center w-full px-4 py-3 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-100 hover:border-gray-400 transition-colors text-gray-600 font-medium text-sm text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 mr-2">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    Naloži svojo sliko (Max 5MB)
                    <input type="file" accept="image/*" className="hidden" onChange={handleCustomImageUpload} />
                 </label>
              </div>

              <div className="flex justify-center space-x-4">
                 <button 
                    type="button"
                    onClick={() => setIsAvatarModalOpen(false)}
                    className="btn-secondary"
                 >
                    {t.cancel || "Prekliči"}
                 </button>
                 <button 
                    type="button"
                    onClick={() => setIsAvatarModalOpen(false)}
                    className="btn-primary"
                 >
                    {t.confirm || "Potrdi"}
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  );
}
