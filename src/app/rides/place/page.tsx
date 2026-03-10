"use client";

import React, { useState, useEffect, useRef } from "react";
import Header from "@/components/Header";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/components/LanguageContext";
import { translations } from "@/app/i18n";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";
import GooglePlacesAutocomplete, { geocodeByAddress, getLatLng } from "react-google-places-autocomplete";

const libraries: "places"[] = ["places"];

export default function RidesPlacePage() {
  const router = useRouter();
  const { language: currentLang } = useLanguage();
  const t = translations[currentLang];
  
  // Enforce English/Slovenian maps for consistent UX based on user language
  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
    language: currentLang === 'sl' ? 'sl' : 'en', 
  });

  const rides = useQuery(api.rides.getRides);
  const currentUser = useQuery(api.users.current);

  const [mapCenter, setMapCenter] = useState({ lat: 46.1199, lng: 14.8153 }); // Default center: Slovenia Focus
  const [mapZoom, setMapZoom] = useState(8);
  const [searchValue, setSearchValue] = useState<any>(null);
  
  const [selectedRide, setSelectedRide] = useState<any | null>(null);

  // Focus map on selected address
  useEffect(() => {
    if (searchValue && searchValue.label) {
      geocodeByAddress(searchValue.label)
        .then(results => getLatLng(results[0]))
        .then(({ lat, lng }) => {
          setMapCenter({ lat, lng });
          setMapZoom(12); // Zoom in on the specific city/place
        })
        .catch(error => console.error("Error geocoding:", error));
    }
  }, [searchValue]);

  const mapContainerStyle = {
    width: "100%",
    height: "calc(100vh - 160px)"
  };

  const formatTime = (ts: number) => {
    return new Date(ts).toLocaleString(currentLang === 'sl' ? 'sl-SI' : 'en-US', {
      day: 'numeric', month: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] font-sans flex flex-col relative pb-0">
      <Head>
        <title>{t.searchByLocation || 'Išči po lokaciji'} | Sport2Go</title>
      </Head>
      <Header />
      <div className="h-[100px] md:h-[60px]" />

      <div className="w-full flex-grow flex flex-col relative h-[calc(100vh-60px)]">
        {/* Search Header Overlay */}
        <div className="absolute top-4 left-0 right-0 z-10 px-4 md:px-0 flex justify-center pointer-events-none">
           <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl border border-gray-100 p-3 flex flex-col pointer-events-auto">
              <div className="flex items-center gap-3 mb-2">
                 <button 
                   onClick={() => router.push('/rides')}
                   className="p-2 bg-gray-50 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
                 </button>
                 <h1 className="text-lg font-bold text-gray-800" style={{fontFamily: 'var(--font-montserrat)'}}>
                    {t.searchByLocation || 'Search Rides by Location'}
                 </h1>
              </div>

              {isLoaded ? (
                 <div className="w-full relative">
                    <GooglePlacesAutocomplete
                      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
                      selectProps={{
                        value: searchValue,
                        onChange: setSearchValue,
                        placeholder: t.destination || "Vnesite mesto ali lokacijo...",
                        isClearable: true,
                        styles: {
                          control: (provided) => ({
                            ...provided,
                            borderRadius: '0.5rem',
                            border: '1px solid #e2e8f0',
                            minHeight: '44px',
                            boxShadow: 'none',
                            '&:hover': {
                              borderColor: '#cbd5e1'
                            }
                          }),
                        }
                      }}
                    />
                 </div>
              ) : (
                <div className="h-11 bg-gray-100 animate-pulse rounded-lg w-full"></div>
              )}
           </div>
        </div>

        {/* The Map itself */}
        <div className="w-full flex-grow relative z-0">
          {(loadError || (!isLoaded && rides === undefined)) && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="w-8 h-8 border-4 border-[#5BA582] border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}

          {isLoaded && (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              zoom={mapZoom}
              center={mapCenter}
              options={{
                disableDefaultUI: true,
                zoomControl: true,
                streetViewControl: false,
                mapTypeControl: false,
                styles: [
                  // Optional: minimal styling to make pins pop
                  { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }
                ]
              }}
              onClick={() => setSelectedRide(null)}
            >
              {rides && rides.map(ride => (
                <Marker
                  key={ride._id}
                  position={{ lat: ride.destinationLat, lng: ride.destinationLng }}
                  onClick={() => {
                    setSelectedRide(ride);
                    setMapCenter({ lat: ride.destinationLat, lng: ride.destinationLng });
                  }}
                  icon={{
                    url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#5BA582" width="40px" height="40px">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                        <circle cx="12" cy="9" r="2.5" fill="white"/>
                      </svg>
                    `),
                    scaledSize: new window.google.maps.Size(40, 40),
                    anchor: new window.google.maps.Point(20, 40),
                  }}
                />
              ))}

              {selectedRide && (
                <InfoWindow
                  position={{ lat: selectedRide.destinationLat, lng: selectedRide.destinationLng }}
                  onCloseClick={() => setSelectedRide(null)}
                  options={{
                    pixelOffset: new window.google.maps.Size(0, -40),
                  }}
                >
                  <div className="p-1 max-w-[200px] md:max-w-xs font-sans">
                    <div className="flex items-center gap-2 mb-2">
                       {selectedRide.authorImage ? (
                         <img src={selectedRide.authorImage} alt="a" className="w-8 h-8 rounded-full border border-gray-200" />
                       ) : (
                         <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#5BA582] to-[#4a8a6c] flex items-center justify-center text-white font-bold text-xs ring-2 ring-white">
                            {selectedRide.authorName?.charAt(0).toUpperCase()}
                         </div>
                       )}
                       <div>
                          <p className="text-sm font-bold text-gray-800 leading-tight">{selectedRide.authorName}</p>
                          <p className="text-[10px] text-gray-500 font-semibold">{formatTime(selectedRide.departureTime)}</p>
                       </div>
                    </div>
                    
                    <div className="mt-2 text-xs text-gray-700 bg-gray-50 rounded p-2 border border-gray-100">
                      <div className="font-bold text-gray-900 truncate" title={selectedRide.departure}>Od: {selectedRide.departure.split(',')[0]}</div>
                      <div className="font-bold text-[#5BA582] truncate" title={selectedRide.destination}>Do: {selectedRide.destination.split(',')[0]}</div>
                    </div>

                    <button 
                      onClick={() => router.push(`/rides/${selectedRide._id}`)}
                      className="mt-3 w-full bg-[#5BA582] hover:bg-[#4a8a6c] text-white py-1.5 rounded text-xs font-bold transition-colors"
                    >
                       Pregled podrobnosti
                    </button>
                  </div>
                </InfoWindow>
              )}
            </GoogleMap>
          )}
        </div>
      </div>
    </div>
  );
}
