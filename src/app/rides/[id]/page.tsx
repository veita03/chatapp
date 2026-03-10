"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Head from "next/head";
import Header from "@/components/Header";
import { useLanguage } from "@/components/LanguageContext";
import { GoogleMap, useJsApiLoader, DirectionsRenderer } from '@react-google-maps/api';

const libraries: "places"[] = ["places"];

export default function RideDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  
  const ride = useQuery(api.rides.getRide, id ? { id: id as any } : "skip");
  
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);

  useEffect(() => {
    if (isLoaded && ride && ride.departureLat && ride.departureLng && ride.destinationLat && ride.destinationLng) {
      const directionsService = new google.maps.DirectionsService();
      
      const origin = new google.maps.LatLng(ride.departureLat, ride.departureLng);
      const destination = new google.maps.LatLng(ride.destinationLat, ride.destinationLng);
      
      directionsService.route(
        {
          origin: origin,
          destination: destination,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK && result) {
            setDirectionsResponse(result);
          }
        }
      );
    }
  }, [isLoaded, ride]);

  if (!isLoaded || ride === undefined) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] font-sans flex flex-col pt-32 pb-20 items-center">
         <div className="w-10 h-10 border-4 border-[#5BA582] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  
  if (ride === null) {
    return (
      <div className="min-h-screen bg-[#F4F6F8] font-sans flex flex-col items-center justify-center p-8">
         <div className="text-gray-500 bg-gray-50 p-8 rounded-xl">{t.teamDoesNotExist || "Prevoz ne obstaja."}</div>
         <button onClick={() => router.push("/rides")} className="mt-4 text-[#5BA582] font-bold">Nazaj</button>
      </div>
    );
  }

  const dt = new Date(ride.departureTime);
  const formattedDate = dt.toLocaleDateString('sl-SI');
  const formattedTime = dt.toLocaleTimeString('sl-SI', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-[#F4F6F8] font-sans flex flex-col relative pb-20">
      <Head>
        <title>Podrobnosti prevoza | Sport2Go</title>
      </Head>
      <Header />
      <div className="h-[100px] md:h-[60px]" />

       <div className="w-full" style={{background: '#f4c361'}}>
         <div className="max-w-6xl mx-auto px-4 sm:px-8 py-5 flex items-center space-x-3">
           <button onClick={() => router.back()} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors mr-2">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
           </button>
           <h1 className="text-2xl md:text-[28px] font-bold text-white tracking-wide" style={{fontFamily: 'var(--font-montserrat)'}}>
              Podrobnosti prevoza
           </h1>
         </div>
       </div>

       <div className="max-w-6xl mx-auto w-full px-4 sm:px-8 mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="ui-card p-6 md:p-8 flex flex-col h-full">
            <div className="flex-1 flex flex-col space-y-6">
              
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.departure}</span>
                <p className="text-lg font-bold text-gray-800">{ride.departure}</p>
              </div>
              
              <div className="space-y-1">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.destination}</span>
                <p className="text-lg font-bold text-gray-800">{ride.destination}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Datum Odhoda</span>
                  <div className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-lg text-gray-800 font-bold">
                    {formattedDate}
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.departureTime}</span>
                  <div className="bg-slate-50 border border-slate-100 px-4 py-3 rounded-lg text-gray-800 font-bold">
                    {formattedTime}
                  </div>
                </div>
              </div>

              {ride.comment && (
                <div className="space-y-1 pt-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Komentar / Navodila</span>
                  <p className="bg-blue-50/50 border border-blue-100/50 p-4 rounded-lg text-gray-700 italic">
                    "{ride.comment}"
                  </p>
                </div>
              )}
              
            </div>
          </div>
          
          <div className="flex flex-col h-full">
             <div className="ui-card p-4 flex flex-col flex-1">
                {ride.distanceText && ride.durationText && (
                  <div className="flex bg-slate-50 border border-slate-100 rounded-xl p-4 justify-between items-center mb-4 shrink-0">
                    <div className="flex flex-col">
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.distance}</span>
                       <span className="text-xl font-black text-[#5BA582]">{ride.distanceText}</span>
                    </div>
                    <div className="h-10 w-px bg-slate-200"></div>
                    <div className="flex flex-col items-end">
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.duration}</span>
                       <span className="text-xl font-black text-slate-700">{ride.durationText}</span>
                    </div>
                  </div>
                )}
                
                <div className="rounded-xl overflow-hidden shadow-inner border border-gray-200 bg-gray-100 flex-1 min-h-[400px]">
                  <GoogleMap
                    mapContainerStyle={{ width: '100%', height: '100%' }}
                    center={ride.departureLat && ride.departureLng ? { lat: ride.departureLat, lng: ride.departureLng } : {lat: 46.0569, lng: 14.5058}}
                    zoom={14}
                    options={{
                      disableDefaultUI: true,
                      zoomControl: true,
                      styles: [
                        { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }
                      ]
                    }}
                  >
                    {directionsResponse && (
                      <DirectionsRenderer
                         directions={directionsResponse}
                         options={{
                           suppressMarkers: false,
                           polylineOptions: {
                             strokeColor: '#3b82f6',
                             strokeWeight: 5,
                             strokeOpacity: 0.8
                           }
                         }}
                      />
                    )}
                  </GoogleMap>
                </div>
             </div>
          </div>

       </div>
    </div>
  );
}
