"use client";

import Header from "@/components/Header";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/LanguageContext";
import { translations } from "@/app/i18n";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import Head from "next/head";

export default function RidesPage() {
  const router = useRouter();
  const { language: currentLang } = useLanguage();
  const t = translations[currentLang];
  const rides = useQuery(api.rides.getRides);
  const deleteRide = useMutation(api.rides.deleteRide);
  
  // Quick auth check
  const currentUser = useQuery(api.users.current);
  
  const [rideToDelete, setRideToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!rideToDelete) return;
    setIsDeleting(true);
    try {
      await deleteRide({ id: rideToDelete as any });
      setRideToDelete(null);
    } catch (err) {
      console.error(err);
      alert(t.errorDeletingTeam); // Reusing generic error text or can make new one
    } finally {
      setIsDeleting(false);
    }
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleString('sl-SI', {
      day: 'numeric', month: 'numeric', year: 'numeric', 
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] font-sans flex flex-col relative pb-20">
      <Head>
        <title>{t.ridesTitle} | Sport2Go</title>
      </Head>
      <Header />
      <div className="h-[100px] md:h-[60px]" />

      {/* Banner */}
      <div className="w-full" style={{background: '#f4c361'}}>
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-5 flex items-center space-x-3">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7 text-white/90">
             <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v1.365m12 0v5.625" />
           </svg>
           <h1 className="text-2xl md:text-[28px] font-bold text-white tracking-wide" style={{fontFamily: 'var(--font-montserrat)'}}>
              {t.ridesBanner}
           </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-4 sm:px-8 mt-8">
        <div className="ui-card p-6 md:p-8">
           <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <h2 className="ui-page-title flex items-center space-x-2">
                 <span>{t.ridesTitle}</span>
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-[#5BA582]">
                   <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                 </svg>
              </h2>
              <button 
                onClick={() => router.push('/rides/create')}
                className="mt-4 sm:mt-0 flex items-center justify-center space-x-1.5 bg-[#6db592] hover:bg-[#5b9e7e] text-white px-5 py-2.5 rounded-lg font-bold transition-colors shadow-sm text-sm"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" /></svg>
                 <span>{t.addRide}</span>
              </button>
           </div>
           
           {rides === undefined ? (
             <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-[#5BA582] border-t-white rounded-full animate-spin"></div></div>
           ) : currentUser === undefined ? (
             <div className="flex justify-center p-8"><div className="w-6 h-6 border-2 border-[#5BA582] border-t-white rounded-full animate-spin"></div></div>
           ) : currentUser === null ? (
             <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl">{t.loginToViewTeams}</div>
           ) : rides.length === 0 ? (
             <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
               {t.noRidesYet}
             </div>
           ) : (
             <div className="space-y-4">
                 {rides.map((ride) => (
                    <div key={ride._id} className="flex flex-col sm:flex-row bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-[#eeb054]/50 transition-colors shadow-sm group">
                        
                        {/* Driver Profile Style matches Team Image style */}
                        <div className="w-full sm:w-40 min-h-[96px] bg-[#fdfaf1] flex flex-col items-center justify-center shrink-0 border-b sm:border-b-0 sm:border-r border-gray-100 p-4">
                           {ride.authorImage ? (
                              <img src={ride.authorImage} alt="Voznik" className="w-[52px] h-[52px] rounded-full object-cover shadow-sm mb-1.5 ring-2 ring-white" />
                           ) : (
                              <div className="w-[52px] h-[52px] rounded-full bg-slate-200 flex flex-col items-center justify-center text-slate-400 mb-1.5 ring-2 ring-white">
                                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" /></svg>
                              </div>
                           )}
                           <span className="text-[11px] font-bold text-gray-700 text-center w-full px-1 truncate leading-tight dark:text-gray-800 tracking-tight">{ride.authorName}</span>
                        </div>
                        
                        {/* Details */}
                        <div className="p-5 flex-1 flex flex-col justify-center items-center sm:items-start text-center sm:text-left">
                           <h3 className="text-base sm:text-lg font-bold text-gray-800 tracking-wide flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                               <span className="text-gray-600 truncate break-words" title={ride.departure}>{ride.departure.split(',')[0]}</span>
                               <span className="hidden sm:inline-block"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg></span>
                               <span className="sm:hidden text-gray-400 my-1"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 mx-auto transform rotate-90"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" /></svg></span>
                               <span className="text-gray-800 truncate break-words" title={ride.destination}>{ride.destination.split(',')[0]}</span>
                           </h3>
                           
                           <div className="flex flex-wrap items-center justify-center sm:justify-start mt-3 gap-2">
                                <span className="inline-flex items-center text-xs font-bold text-gray-600 bg-gray-50 px-2.5 py-1 rounded-md border border-gray-200">
                                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 mr-1 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Z" /></svg>
                                   {formatTime(ride.departureTime)}
                                </span>
                                <span className="inline-flex items-center text-xs font-bold text-[#eeb054] bg-[#fdfaf1] px-2.5 py-1 rounded-md border border-[#f3ebcd]">
                                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>
                                   {ride.distanceText || '? km'}
                                </span>
                                <span className="inline-flex items-center text-xs font-bold text-[#eeb054] bg-[#fdfaf1] px-2.5 py-1 rounded-md border border-[#f3ebcd]">
                                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5 mr-1"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>
                                   {ride.durationText || '? min'}
                                </span>
                           </div>
                           
                           {ride.comment && (
                               <p className="mt-3 text-sm text-gray-500 italic truncate w-full max-w-sm sm:max-w-md" title={ride.comment}>"{ride.comment}"</p>
                           )}
                        </div>
                        
                        {/* Actions aligned like Teams */}
                        <div className="p-4 sm:p-5 flex flex-wrap gap-2.5 items-center justify-center sm:justify-start sm:border-l border-gray-100 bg-gray-50/50 sm:bg-transparent rounded-b-xl sm:rounded-none w-full sm:w-auto">
                           {ride.authorId !== currentUser?._id && (
                             <button className="h-10 px-4 border border-[#5BA582]/30 text-[#5BA582] font-bold text-sm bg-white rounded-lg hover:bg-[#5BA582]/10 transition-colors whitespace-nowrap md:min-w-[120px]">
                               Pošlji sporočilo
                             </button>
                           )}
                           
                           {ride.authorId === currentUser?._id && (
                              <div className="flex gap-2.5">
                                <button 
                                  onClick={() => router.push(`/rides/${ride._id}/edit`)}
                                  title={t.editRideTooltip}
                                  className="w-10 h-10 border border-gray-200 text-gray-500 hover:text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center flex-shrink-0"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path d="M2.695 14.763l-1.262 3.152a.5.5 0 00.65.65l3.151-1.262a4 4 0 001.343-.885L17.5 5.5a2.121 2.121 0 00-3-3L3.58 13.42a4 4 0 00-.885 1.343z" /></svg>
                                </button>
                                <button 
                                  onClick={() => setRideToDelete(ride._id)}
                                  title={t.deleteRideTooltip}
                                  className="w-10 h-10 border border-red-100 text-red-400 hover:text-red-500 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center flex-shrink-0"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" /></svg>
                                </button>
                              </div>
                           )}
                        </div>
                    </div>
                 ))}
             </div>
           )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {rideToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <div className="p-6 text-center">
               <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-[0_0_0_4px_rgba(239,68,68,0.1)]">
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8"><path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z" clipRule="evenodd" /></svg>
               </div>
               <h3 className="text-xl font-bold text-gray-800 mb-2 tracking-wide" style={{fontFamily: 'var(--font-montserrat)'}}>{t.deleteRideConfirmTitle}</h3>
               <p className="text-gray-500 text-sm">{t.deleteRideConfirmDesc}</p>
             </div>
             <div className="bg-gray-50 p-4 flex items-center space-x-3">
                <button 
                  onClick={() => setRideToDelete(null)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-700 font-bold text-xs sm:text-sm hover:bg-gray-50 disabled:opacity-50 transition-colors shadow-sm"
                >
                  {t.cancelBtn}
                </button>
                <button 
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg font-bold text-xs sm:text-sm hover:bg-red-600 shadow-sm flex items-center justify-center space-x-2 disabled:opacity-50 transition-colors"
                >
                  {isDeleting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                  <span>{t.yesDelete}</span>
                </button>
             </div>
           </div>
        </div>
      )}

    </div>
  );
}
