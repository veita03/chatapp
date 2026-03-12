"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { translations } from "@/app/i18n";
import { useLanguage } from "./LanguageContext";

export default function PageTitleUpdater() {
  const pathname = usePathname();
  const { language } = useLanguage();
  
  useEffect(() => {
    if (!pathname) return;
    
    const t = (translations as any)[language] || translations["sl"];
    let moduleName = "";
    
    if (pathname === "/") {
      moduleName = ""; // Base case, just Sport2GO
    } else if (pathname.startsWith("/profile")) {
      moduleName = t.navProfile || "Profil";
    } else if (pathname.startsWith("/teams")) {
      moduleName = t.navTeams || "Ekipe";
    } else if (pathname.startsWith("/chat")) {
      moduleName = t.chatTab || t.navChat || "Chat";
    } else if (pathname.startsWith("/rides")) {
      moduleName = t.navRides || "Prevozi";
    } else if (pathname.startsWith("/events")) {
      moduleName = "Dogodki"; 
    }

    if (moduleName) {
      document.title = `${moduleName} - Sport2GO`;
    } else {
      document.title = "Sport2GO";
    }
  }, [pathname, language]);

  return null;
}
