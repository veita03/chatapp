"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter, usePathname } from "next/navigation";
import { translations, Language } from "../app/i18n";
import { useConvexAuth } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useLanguage } from "@/components/LanguageContext";

const languageOptions: { key: Language; label: string }[] = [
  { key: 'de', label: 'Deutsch' },
  { key: 'at', label: 'Deutsch (AT)' },
  { key: 'en', label: 'English' },
  { key: 'us', label: 'English (US)' },
  { key: 'es', label: 'Español' },
  { key: 'ar', label: 'Español (AR)' },
  { key: 'mx', label: 'Español (MX)' },
  { key: 'fr', label: 'Français' },
  { key: 'el', label: 'Ελληνικά' },
  { key: 'hr', label: 'Hrvatski' },
  { key: 'it', label: 'Italiano' },
  { key: 'nl', label: 'Nederlands' },
  { key: 'sl', label: 'Slovenščina' },
  { key: 'sr', label: 'Srpski' },
  { key: 'tr', label: 'Türkçe' },
];

interface HeaderProps {
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
}

export default function Header({ onLoginClick, onRegisterClick }: HeaderProps) {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  const pathname = usePathname();
  const { language: currentLang, setLanguage } = useLanguage();
  
  const [isLangOpen, setIsLangOpen] = useState(false);
  const t = translations[currentLang];

  const handleLangChange = (lang: Language) => {
    setLanguage(lang);
    setIsLangOpen(false);
  };

  const NavButton = ({ icon, text, onClick, active }: { icon: React.ReactNode, text?: string, onClick: () => void, active?: boolean }) => (
    <button 
      onClick={onClick}
      title={text}
      className={`flex flex-col items-center justify-center w-[36px] h-[36px] md:w-[42px] md:h-[42px] rounded-[8px] md:rounded-[10px] transition-all shadow-sm group ${active ? 'bg-[#d8993c]' : 'bg-[#eeb054] hover:bg-[#d8993c]'}`}
    >
      <div className={`text-white transition-transform flex items-center justify-center ${active ? '' : 'group-hover:-translate-y-0.5'} ${!text ? 'scale-110' : 'mb-[1px]'}`}>
        {icon}
      </div>
      {text && (
        <span className="text-[7px] md:text-[7.5px] font-bold text-white uppercase tracking-wide max-w-[90%] overflow-hidden text-ellipsis whitespace-nowrap leading-none" style={{fontFamily: 'var(--font-cabin)'}}>
          {text}
        </span>
      )}
    </button>
  );

  return (
    <header className="absolute top-0 left-0 right-0 z-50 flex flex-col md:flex-row items-center justify-between px-4 md:px-8 lg:px-12 py-3 md:py-0 gap-3 md:gap-0" style={{minHeight: '60px', background: 'linear-gradient(90deg, #eeaf53 0%, #edca78 50%, #ecdf9b 100%)'}}>
      {/* Logo */}
      <a href="/" className="flex items-center space-x-2 hover:opacity-90 transition-opacity">
        <img src="https://www.sport2go.app/image/logo.svg" alt="SPORT2GO Logo" className="h-7 md:h-10 w-auto brightness-0 invert"/>
        <span className="text-2xl md:text-[28px] text-white tracking-wide leading-none drop-shadow-sm flex items-baseline select-none" style={{fontFamily: 'var(--font-montserrat)'}}>
          <span className="pr-0.5" style={{fontWeight: 400}}>SPORT</span>
          <span className="opacity-90" style={{fontWeight: 600}}>2GO</span>
        </span>
      </a>

      {/* Right nav */}
      <div className="flex items-center gap-1.5 md:gap-2">
        {!isAuthenticated ? (
           <>
             {onLoginClick && <button onClick={onLoginClick} className="text-white hover:text-white/80 font-medium text-sm md:text-[15px] transition-colors uppercase tracking-wide cursor-pointer" style={{fontFamily: 'var(--font-cabin)'}}>{t.login}</button>}
             {onRegisterClick && <button onClick={onRegisterClick} className="bg-[#31574d] hover:bg-[#25423a] text-white text-sm md:text-[15px] px-5 py-1.5 rounded-sm transition-all uppercase tracking-wide cursor-pointer" style={{fontFamily: 'var(--font-cabin)'}}>{t.register}</button>}
           </>
        ) : (
           <>
             {/* EKIPE */}
             <NavButton 
               active={pathname.startsWith("/team") || pathname.startsWith("/season")}
               onClick={() => router.push("/teams")} 
               text={(t as any).navTeams || "Ekipe"}
               icon={
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
                 </svg>
               }
             />
             {/* PREVOZI */}
             {/* PREVOZI (Temporarily hidden)
             <NavButton 
               active={pathname.startsWith("/rides")}
               onClick={() => router.push("/rides")} 
               text={(t as any).navRides || "Prevozi"}
               icon={
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v1.365m12 0v5.625" />
                 </svg>
               }
             />
             */}
             {/* CHAT */}
             <NavButton 
               active={pathname === "/chat"}
               onClick={() => router.push("/chat")} 
               text={(t as any).navChat || "Chat"}
               icon={
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                 </svg>
               }
             />
             {/* PROFIL */}
             <NavButton 
               active={pathname === "/profile"}
               onClick={() => router.push("/profile")} 
               text={(t as any).navProfile || "Profil"}
               icon={
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                 </svg>
               }
             />
           </>
        )}

        {/* LOGOUT (only if authenticated) */}
        {isAuthenticated && (
          <div className="relative">
             <NavButton 
               onClick={async () => {
                 await signOut();
                 if (pathname !== "/") {
                   router.push("/");
                 }
               }}  
               text={(t as any).navLogout || "Odjava"}
               icon={
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-[18px] h-[18px] md:w-[20px] md:h-[20px]">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
                 </svg>
               }
             />
          </div>
        )}

        {/* Language Dropdown Area */}
        <div className="relative">
          <NavButton 
             onClick={() => setIsLangOpen(!isLangOpen)} 
             icon={
               <img src={`/flags/${currentLang}.png`} alt={currentLang} className="w-[18px] h-[18px] md:w-[22px] md:h-[22px] object-cover rounded-full shadow-sm"/>
             }
          />
          
          {isLangOpen && (
            <>
              <div className="fixed inset-0 z-30" onClick={() => setIsLangOpen(false)}></div>
              <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-2xl py-2 z-40 border border-gray-100 animate-in fade-in zoom-in-95 duration-150 max-h-[600px] overflow-y-auto style-scrollbar">
                {languageOptions.map((lang) => (
                  <button 
                    key={lang.key}
                    onClick={() => handleLangChange(lang.key)} 
                    className={`w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between border-b border-gray-50 last:border-0 transition-colors ${currentLang === lang.key ? 'bg-orange-50/50' : ''}`}
                  >
                    <div className="flex items-center space-x-3">
                      <img src={`/flags/${lang.key}.png`} alt={lang.label} className="w-5 h-5 object-cover rounded-full shadow-sm"/>
                      <span style={{fontFamily: 'var(--font-cabin)'}} className={currentLang === lang.key ? 'font-bold' : 'font-medium'}>{lang.label}</span>
                    </div>
                    {currentLang === lang.key && (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4 text-[#eeaf53]">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
