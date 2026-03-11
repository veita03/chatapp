"use client";

import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { useState, useRef, useEffect } from "react";
import { useAuthActions } from "@convex-dev/auth/react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { translations, Language } from "./i18n";
import Header from "../components/Header";

function DualAuthLogin({ initialTab = "login", onClose, currentLang = "sl" }: { initialTab?: "login"|"register", onClose: () => void, currentLang?: Language }) {
  const { signIn } = useAuthActions();
  const [tab, setTab] = useState<"login" | "register">(initialTab);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const t = translations[currentLang];
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (tab === "register" && password !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    if (password.length < 8) {
      setError(t.passwordLength);
      return;
    }

    setIsLoading(true);
    try {
      // By default Convex auth sessions last a long time, but can be configured if needed. 
      // The Convex provider handles 'password' as the underlying method.
      const flow = tab === "login" ? "signIn" : "signUp";
      await signIn("password", { email, password, flow });
      
      if (!rememberMe) {
        localStorage.setItem("ephemeralLogin", "true");
        sessionStorage.setItem("sessionActive", "true");
      } else {
        localStorage.removeItem("ephemeralLogin");
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      const msg = err?.message || String(err);
      if (msg.includes("Invalid credentials") || msg.toLowerCase().includes("password")) {
        setError(tab === "login" ? "Napačna e-pošta ali geslo." : "Napaka pri registraciji.");
      } else {
        setError(tab === "login" ? "Prijava ni uspela. Preverite podatke." : "Neznana napaka pri registraciji (morda e-pošta že obstaja).");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/50 backdrop-blur-sm overflow-y-auto w-full h-full"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md relative animate-in fade-in zoom-in-95 duration-200 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute right-4 top-3 text-white/80 hover:text-white z-20 p-2 bg-black/10 rounded-full hover:bg-black/20 transition-colors"
        >
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col">
          {/* Modern Header with Logo + Text */}
          <div className="bg-gradient-to-r from-[#F0CA68] to-[#EAA145] px-6 py-4 flex items-center justify-center space-x-3 shadow-inner">
            <img 
              src="https://www.sport2go.app/image/logo.svg" 
              alt="SPORT2GO Logo" 
              className="h-8 w-auto brightness-0 invert"
            />
            <span className="text-xl md:text-2xl text-white tracking-wide leading-none drop-shadow-sm flex items-baseline select-none" style={{fontFamily: 'var(--font-montserrat)'}}>
              <span className="pr-0.5" style={{fontWeight: 400}}>SPORT</span>
              <span className="opacity-95" style={{fontWeight: 600}}>2GO</span>
            </span>
          </div>

          {/* Tab Selection area below header */}
          <div className="bg-gray-50 border-b border-gray-100 p-3">
             <div className="flex bg-gray-200/50 rounded-xl p-1 gap-1">
               <button
                 onClick={() => { setTab("login"); setError(null); }}
                 className={`flex-1 py-2.5 text-xs font-bold tracking-wider uppercase transition-all rounded-lg ${
                   tab === "login" 
                   ? "bg-white text-[#5BA582] shadow-sm transform scale-[1.02]" 
                   : "text-gray-500 hover:text-gray-700 active:scale-95"
                 }`}
                 style={{fontFamily: 'var(--font-cabin)'}}
               >
                 {t.login}
               </button>
               <button
                 onClick={() => { setTab("register"); setError(null); }}
                 className={`flex-1 py-2.5 text-xs font-bold tracking-wider uppercase transition-all rounded-lg ${
                   tab === "register" 
                   ? "bg-white text-[#5BA582] shadow-sm transform scale-[1.02]" 
                   : "text-gray-500 hover:text-gray-700 active:scale-95"
                 }`}
                 style={{fontFamily: 'var(--font-cabin)'}}
               >
                 {t.register}
               </button>
             </div>
          </div>

          <div className="p-6 sm:p-8 pt-5">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 tracking-tight uppercase leading-none" style={{fontFamily: 'var(--font-cabin)'}}>
                {tab === "login" ? t.login : t.register}
              </h2>
              <p className="text-xs text-gray-400 mt-2 font-medium" style={{fontFamily: 'var(--font-cabin)'}}>
                {tab === "login" ? "Pozdravljeni nazaj! Prosimo, vpišite svoje podatke." : "Ustvarite račun in se pridružite skupnosti."}
              </p>
            </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-500 text-xs font-bold px-4 py-3 rounded-xl border border-red-100 flex items-start space-x-2 animate-in fade-in zoom-in duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 flex-shrink-0 mt-0.5">
                  <path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.748c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">{t.email}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-gray-50 text-gray-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5BA582]/50 border border-gray-200 transition-all text-sm"
                placeholder="ime@primer.si"
              />
            </div>

            <div className="relative">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">{t.password}</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-gray-50 text-gray-800 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-[#5BA582]/50 border border-gray-200 transition-all text-sm"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {tab === "register" && (
              <div className="relative animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">{t.confirmPassword}</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full bg-gray-50 text-gray-800 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-[#5BA582]/50 border border-gray-200 transition-all text-sm"
                    placeholder="••••••••"
                  />
                  {confirmPassword.length > 0 && (
                     <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 transition-colors">
                       {password === confirmPassword ? (
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-[#5BA582] animate-in zoom-in">
                           <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 11.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
                         </svg>
                       ) : (
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-400 animate-in zoom-in">
                           <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm-1.72 6.97a.75.75 0 1 0-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 1 0 1.06 1.06L12 13.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L13.06 12l1.72-1.72a.75.75 0 1 0-1.06-1.06L12 10.94l-1.72-1.72Z" clipRule="evenodd" />
                         </svg>
                       )}
                     </div>
                  )}
                </div>
              </div>
            )}

            {tab === "login" && (
              <div className="flex items-center space-x-2 pt-1 pb-2">
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-[#5BA582] bg-gray-50 border-gray-300 rounded focus:ring-[#5BA582] focus:ring-2 accent-[#5BA582]"
                />
                <label htmlFor="remember" className="text-xs font-medium text-gray-500 cursor-pointer select-none">
                  {t.rememberMe}
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || (tab === "register" && password !== confirmPassword)}
              className="w-full bg-[#5BA582] hover:bg-[#4d8c6f] disabled:opacity-50 disabled:hover:bg-[#5BA582] text-white font-bold text-[15px] py-3.5 px-6 rounded-xl shadow-[0_4px_14px_rgba(91,165,130,0.3)] transition-all flex items-center justify-center space-x-2 active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : tab === "login" ? t.loginBtn : t.registerBtn}
            </button>
          </form>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-xs font-bold text-gray-400 uppercase tracking-widest">{t.or}</span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

            <button
              onClick={() => void signIn("google")}
              className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-bold text-[14px] py-3.5 px-6 rounded-xl transition-all flex items-center justify-center space-x-3 active:scale-[0.98] shadow-sm"
            >
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                <path d="M1 1h22v22H1z" fill="none"/>
              </svg>
              <span>{t.continueGoogle}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LandingPage() {
  const [authModal, setAuthModal] = useState<"login" | "register" | null>(null);
  
  // Set initial state from cookie or default to sl
  const [currentLang, setCurrentLang] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = Cookies.get("lang") as Language;
      if (saved && ["sl", "en", "es", "it", "fr", "hr", "sr", "de", "tr", "ar", "mx", "at", "us"].includes(saved)) return saved;
    }
    return "sl";
  });
  
  const t = translations[currentLang];

  return (
    <div className="min-h-[100dvh] bg-white font-sans flex flex-col overflow-x-hidden">
       <Header 
         onLoginClick={() => setAuthModal("login")} 
         onRegisterClick={() => setAuthModal("register")} 
       />

       {/* Hero Section */}
       <section id="slider-wrapper" className="relative w-full overflow-hidden bg-white">
          <div id="slider" className="relative w-full min-h-[500px] md:min-h-0 md:h-auto pt-[120px] md:pt-[110px] md:pb-[90px] flex flex-col">
             
             {/* Background Overlay */}
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[3000px] h-full bg-[#efc463] z-0" style={{ borderRadius: '50% / 0 0 100% 100%' }}></div>

             {/* Container */}
             <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col md:flex-row items-center justify-between">
                
                {/* Text Content */}
                <div className="w-full md:w-[50%] text-center md:text-left flex flex-col items-center md:items-start space-y-4 lg:space-y-5 z-20 mb-8 md:mb-0 mt-8 md:mt-0 relative">
                  <h1 className="text-[1.8rem] sm:text-[2.2rem] md:text-[2.8rem] lg:text-[45px] font-bold text-white tracking-tight leading-[1.1] drop-shadow-sm" style={{fontFamily: 'var(--font-montserrat)'}}>
                    {t.heroTitle1}<br className="hidden md:block"/> {t.heroTitle2}
                  </h1>
                  <p className="text-[14px] sm:text-base md:text-[17px] text-white/95 max-w-[420px] leading-relaxed font-light" style={{fontFamily: 'var(--font-cabin)'}}>
                    {t.heroSubtitle}
                  </p>
                  <button 
                    onClick={() => setAuthModal("register")}
                    className="bg-[#31574d] hover:bg-[#25423a] text-white font-semibold text-sm md:text-[15px] px-8 py-3 rounded-[4px] shadow-sm hover:shadow-md transition-all active:scale-95 uppercase tracking-wider mt-2"
                    style={{fontFamily: 'var(--font-cabin)'}}
                  >
                    {t.joinBtn}
                  </button>
                </div>

                {/* Illustration */}
                <div className="w-full sm:w-[80%] md:w-[60%] lg:w-[55%] flex justify-center md:justify-end z-10 pointer-events-none relative md:absolute md:right-0 md:top-1/2 md:-translate-y-[45%]">
                  <img 
                    src="https://www.sport2go.app/image/demo/intro3.png" 
                    alt="Sports Illustration" 
                    className="w-[110%] md:w-[110%] lg:w-[120%] max-w-[900px] object-contain drop-shadow-2xl relative translate-x-0 md:translate-x-[5%] animate-flyin -mt-6 md:-mt-10" 
                  />
                </div>
             </div>
          </div>
       </section>

       {/* Features Section */}
       <section className="bg-[#fffbf2] pt-16 pb-20 md:pt-20 md:pb-28 relative z-30 flex-1">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 lg:gap-16 text-center">
               
               {/* Feature 1 */}
               <div className="flex flex-col items-center">
                  <div className="w-36 h-36 md:w-48 md:h-48 rounded-full bg-white flex items-center justify-center mb-8 shadow-none border-none ring-0 outline-none">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[72px] h-[72px] text-[#2c4740]">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
                     </svg>
                  </div>
                  <div className="flex-1 flex flex-col justify-between w-full">
                     <div>
                       <h3 className="text-2xl md:text-[28px] font-bold text-[#353b41] mb-4" style={{fontFamily: 'var(--font-montserrat)'}}>{t.feature1Title}</h3>
                       <p className="text-gray-500 text-[16px] md:text-[17px] font-light md:px-4 leading-relaxed mb-8" style={{fontFamily: 'var(--font-cabin)'}}>{t.feature1Desc}</p>
                     </div>
                     <div>
                       <button className="bg-[#ecc06b] hover:bg-[#dcae58] text-white font-bold text-sm px-10 py-2.5 rounded-sm uppercase tracking-widest transition-colors shadow-sm" style={{fontFamily: 'var(--font-cabin)'}}>{t.moreBtn}</button>
                     </div>
                  </div>
               </div>
               
               {/* Feature 2 */}
               <div className="flex flex-col items-center">
                  <div className="w-36 h-36 md:w-48 md:h-48 rounded-full bg-white flex items-center justify-center mb-8 shadow-none border-none ring-0 outline-none">
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[72px] h-[72px] text-[#2c4740]">
                       <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                     </svg>
                  </div>
                  <div className="flex-1 flex flex-col justify-between w-full">
                     <div>
                       <h3 className="text-2xl md:text-[28px] font-bold text-[#353b41] mb-4" style={{fontFamily: 'var(--font-montserrat)'}}>{t.feature2Title}</h3>
                       <p className="text-gray-500 text-[16px] md:text-[17px] font-light md:px-4 leading-relaxed mb-8" style={{fontFamily: 'var(--font-cabin)'}}>{t.feature2Desc}</p>
                     </div>
                     <div>
                       <button className="bg-[#ecc06b] hover:bg-[#dcae58] text-white font-bold text-sm px-10 py-2.5 rounded-sm uppercase tracking-widest transition-colors shadow-sm" style={{fontFamily: 'var(--font-cabin)'}}>{t.moreBtn}</button>
                     </div>
                  </div>
               </div>

               {/* Feature 3 */}
               <div className="flex flex-col items-center">
                  <div className="w-36 h-36 md:w-48 md:h-48 rounded-full bg-white flex items-center justify-center mb-8 shadow-none border-none ring-0 outline-none">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-[72px] h-[72px] text-[#2c4740]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 0 1 7.5 5.25h9a2.25 2.25 0 0 1 2.25 2.25v9a2.25 2.25 0 0 1-2.25 2.25h-9a2.25 2.25 0 0 1-2.25-2.25v-9Z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.75 10.5h1.5a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-1.5M7.5 5.25c0-1.516.425-2.923 1.15-4.103a.375.375 0 0 1 .634-.01 5.952 5.952 0 0 0 1.258 1.637c.451.41.97.77 1.58.985a6.685 6.685 0 0 0 2.756.284 3.75 3.75 0 0 1 1.144.17c.504.168.895.503 1.15.938" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 8.25v8.25M12 8.25v8.25M15.75 8.25v8.25" />
                     </svg>
                  </div>
                  <div className="flex-1 flex flex-col justify-between w-full">
                     <div>
                       <h3 className="text-2xl md:text-[28px] font-bold text-[#353b41] mb-4" style={{fontFamily: 'var(--font-montserrat)'}}>{t.feature3Title}</h3>
                       <p className="text-gray-500 text-[16px] md:text-[17px] font-light md:px-4 leading-relaxed mb-8" style={{fontFamily: 'var(--font-cabin)'}}>{t.feature3Desc}</p>
                     </div>
                     <div>
                       <button className="bg-[#ecc06b] hover:bg-[#dcae58] text-white font-bold text-sm px-10 py-2.5 rounded-sm uppercase tracking-widest transition-colors shadow-sm" style={{fontFamily: 'var(--font-cabin)'}}>{t.moreBtn}</button>
                     </div>
                  </div>
               </div>
            </div>
          </div>
       </section>

       {/* Kako začeti Section (Hardware Mockups) */}
       <section className="bg-gradient-to-br from-[#eeaf53] to-[#e4a142] pt-16 pb-16 md:pt-24 md:pb-20 relative">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="bg-white rounded-[24px] overflow-visible shadow-2xl flex flex-col md:flex-row items-center relative pr-4 lg:pr-12 pl-8 lg:pl-16 py-12 lg:py-16">
              <div className="w-full md:w-5/12 z-10 space-y-5 pb-4 md:pb-0">
                <h2 className="text-3xl md:text-[34px] font-bold text-[#353b41]" style={{fontFamily: 'var(--font-montserrat)'}}>{t.howToStart}</h2>
                <p className="text-gray-500 text-base leading-relaxed max-w-sm font-light" style={{fontFamily: 'var(--font-cabin)'}}>
                  {t.howToStartDesc}
                </p>
                <div className="pt-2">
                  <button className="bg-[#31574d] hover:bg-[#25423a] text-white px-6 py-2.5 text-xs font-bold uppercase rounded-sm tracking-widest shadow-lg transition-colors" style={{fontFamily: 'var(--font-cabin)'}}>
                    {t.benefitsBtn}
                  </button>
                </div>
              </div>
              
              <div className="w-full md:w-7/12 relative -mt-12 md:mt-0 right-0 flex justify-end">
                <div className="relative w-full md:w-[120%] max-w-[800px] h-[300px] md:h-[400px] -mr-4 md:-mr-16">
                   {/* Fallback mockup positioning matching original site layout */}
                   <img src="/demo/screens.png" alt="Sport2Go screens" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[45%] md:-translate-y-[50%] w-full h-auto object-contain z-10 origin-left" />
                </div>
              </div>
            </div>
          </div>
       </section>

       {/* Bottom Badges */}
       <section className="bg-[#fffbf2] border-b border-[#efc463]/20">
         <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-center items-stretch divide-y md:divide-y-0 md:divide-x divide-[#efc463]/30">
            <div className="flex flex-col items-center py-6 md:py-6 px-12 min-w-[280px]">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-[#efc463] mb-4">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M16.712 4.33a9.027 9.027 0 0 1 1.652 1.306c.51.51.944 1.064 1.306 1.652M9.252 2.982a9.022 9.022 0 0 1 2.748-.482v.002a9.022 9.022 0 0 1 2.748.482M4.33 7.288a9.027 9.027 0 0 1 1.306-1.652c.51-.51 1.064-.944 1.652-1.306M2.5 12a9.022 9.022 0 0 1 .482-2.748h.002A9.022 9.022 0 0 1 2.982 12m18.036 4.712a9.027 9.027 0 0 1-1.652 1.306c-.51.51-.944 1.064-1.306 1.652M14.748 21.018a9.022 9.022 0 0 1-2.748.482v-.002a9.022 9.022 0 0 1-2.748-.482M19.67 16.712a9.027 9.027 0 0 1-1.306 1.652c-.51.51-1.064.944-1.652 1.306M21.5 12c0 .93-.162 1.825-.482 2.748h-.002A9.022 9.022 0 0 1 21.018 12M12 12v6m0-12v2m-6 4h2m10 0h-2m-4.596 4.596 1.414-1.414m-5.656-5.656L7.404 9.404m12.728 0-1.414 1.414m-5.656-5.656 1.414 1.414" />
               </svg>
               <span className="text-sm text-[#efc463] tracking-wide text-center" style={{fontFamily: 'var(--font-cabin)'}}>
                 <span className="font-bold">{t.footerSupport.split(' ')[0]}</span> <span className="font-medium">{t.footerSupport.split(' ').slice(1).join(' ')}</span>
               </span>
            </div>
            <div className="flex flex-col items-center py-6 md:py-6 px-12 min-w-[280px]">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-[#efc463] mb-4">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z" />
               </svg>
               <span className="text-sm text-[#efc463] tracking-wide text-center" style={{fontFamily: 'var(--font-cabin)'}}>
                 <span className="font-medium">{t.footerSecurity1}</span> <span className="font-bold">{t.footerSecurity2}</span>
               </span>
            </div>
            <div className="flex flex-col items-center py-6 md:py-6 px-12 min-w-[280px]">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 text-[#efc463] mb-4">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M11.412 15.655 9.75 21.75l3.745-4.012M9.257 13.5H3.75l2.659-2.849m2.048-2.194L14.25 2.25 12 10.5h8.25l-4.707 5.043M8.457 8.457 3 3m5.457 5.457 7.086 7.086m0 0L21 21" />
               </svg>
               <span className="text-sm text-[#efc463] tracking-wide text-center" style={{fontFamily: 'var(--font-cabin)'}}>
                 <span className="font-bold">{t.footerUptime1}</span> <span className="font-medium">{t.footerUptime2}</span>
               </span>
            </div>
         </div>
       </section>
       
       {/* Footer */}
       <footer className="bg-white py-12 pb-16">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
             <div className="col-span-1">
                <span className="text-2xl text-gray-400 tracking-wide leading-none flex items-baseline select-none mb-4" style={{fontFamily: 'var(--font-montserrat)'}}>
                  <span className="pr-0.5 font-light" style={{fontWeight: 300}}>SPORT</span>
                  <span className="opacity-90 font-medium" style={{fontWeight: 500}}>2GO</span>
                </span>
                <p className="text-xs text-gray-400 hover:text-gray-600 transition-colors cursor-pointer inline-block" style={{fontFamily: 'var(--font-cabin)'}}>info@sport2go.app</p>
             </div>
             <div className="col-span-1 flex flex-col space-y-4">
               <a href="#" className="text-base font-bold text-gray-800 hover:text-[#eeaf53] transition-colors" style={{fontFamily: 'var(--font-cabin)'}}>{t.footerLinks.solutions}</a>
               <a href="#" className="text-base font-bold text-gray-800 hover:text-[#eeaf53] transition-colors" style={{fontFamily: 'var(--font-cabin)'}}>{t.footerLinks.contact}</a>
             </div>
             <div className="col-span-1 flex flex-col space-y-4">
               <a href="#" className="text-base font-bold text-gray-800 hover:text-[#eeaf53] transition-colors" style={{fontFamily: 'var(--font-cabin)'}}>{t.footerLinks.gdpr}</a>
               <a href="#" className="text-base font-bold text-gray-800 hover:text-[#eeaf53] transition-colors" style={{fontFamily: 'var(--font-cabin)'}}>{t.footerLinks.terms}</a>
             </div>
             <div className="col-span-1">
                <h4 className="text-sm font-bold text-gray-800 mb-4" style={{fontFamily: 'var(--font-cabin)'}}>{t.comingSoon}</h4>
                <div className="flex flex-row md:flex-col lg:flex-row space-x-2 md:space-x-0 lg:space-x-3 space-y-0 md:space-y-3 lg:space-y-0">
                   {/* App Store Buttons */}
                   <div className="bg-black/95 rounded-md text-white px-2 py-1.5 flex items-center justify-center cursor-pointer hover:bg-black/80 transition-colors w-[155px] min-w-[155px] max-w-[155px] shrink-0 border border-gray-800">
                     <svg className="w-[26px] h-[26px] mr-2 shrink-0" viewBox="0 0 384 512" fill="currentColor"><path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/></svg>
                     <div className="flex flex-col items-start leading-none pr-1">
                       <span className="text-[9px] uppercase tracking-wider whitespace-nowrap opacity-90">GET IT ON</span>
                       <span className="text-[13px] font-semibold tracking-wide whitespace-nowrap">App Store</span>
                     </div>
                   </div>
                   <div className="bg-black/95 rounded-md text-white px-2 py-1.5 flex items-center justify-center cursor-pointer hover:bg-black/80 transition-colors w-[155px] min-w-[155px] max-w-[155px] shrink-0 border border-gray-800">
                     <svg className="w-6 h-6 mr-1.5 shrink-0" viewBox="0 0 512 512" fill="currentColor"><path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58.9-34.1-65.7 64.5 65.7 64.5 60.1-34.1c18-14.3 18-46.5-1.2-60.8zM104.6 499l280.8-161.2-60.1-60.1L104.6 499z"/></svg>
                     <div className="flex flex-col items-start leading-none ml-0.5 pr-1">
                       <span className="text-[9px] uppercase tracking-wider whitespace-nowrap opacity-90">GET IT ON</span>
                       <span className="text-[13px] font-semibold tracking-wide whitespace-nowrap">Google Play</span>
                     </div>
                   </div>
                </div>
             </div>
          </div>
          <div className="text-center text-[10px] text-gray-400 font-light" style={{fontFamily: 'var(--font-cabin)'}}>
             {t.rights}
          </div>
       </footer>

       {authModal && (
         <DualAuthLogin initialTab={authModal} onClose={() => setAuthModal(null)} currentLang={currentLang} />
       )}
    </div>
  );
}

export default function Home() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const currentUser = useQuery(api.users.current, isAuthenticated ? {} : "skip");
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && currentUser !== undefined) {
      if (currentUser?.isProfileComplete) {
        router.push("/teams");
      } else {
        router.push("/profile");
      }
    }
  }, [isAuthenticated, currentUser, router]);

  if (isLoading || (isAuthenticated && currentUser === undefined)) {
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-[#F4F6F8]">
        <div className="animate-pulse flex space-x-3 items-center">
          <div className="w-2.5 h-2.5 rounded-full bg-[#5BA582]/40"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#5BA582]/70 animate-[pulse_1s_ease-in-out_infinite_200ms]"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-[#5BA582] animate-[pulse_1s_ease-in-out_infinite_400ms]"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return (
    <div className="flex h-[100dvh] items-center justify-center bg-[#F4F6F8]">
      <div className="animate-pulse flex space-x-3 items-center">
        <div className="w-2.5 h-2.5 rounded-full bg-[#5BA582]/40"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-[#5BA582]/70 animate-[pulse_1s_ease-in-out_infinite_200ms]"></div>
        <div className="w-2.5 h-2.5 rounded-full bg-[#5BA582] animate-[pulse_1s_ease-in-out_infinite_400ms]"></div>
      </div>
    </div>
  );
}
