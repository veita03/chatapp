"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Header from "@/components/Header";
import { useRouter, useParams } from "next/navigation";
import { useLanguage } from "@/components/LanguageContext";
import { GoogleMap, useJsApiLoader, DirectionsRenderer, Autocomplete } from "@react-google-maps/api";
import { useMutation, useQuery } from "convex/react";
import { translations } from "@/app/i18n";
import { api } from "../../../../../convex/_generated/api";
import Head from "next/head";

const defaultCenter = { lat: 46.0569, lng: 14.5058 }; // Ljubljana
const libraries: ("places" | "geometry")[] = ["places"];

export default function EditRidePage() {
  const router = useRouter();
  const { id } = useParams();
  const rideId = typeof id === "string" ? id : id?.[0];
  
  const { language: currentLang } = useLanguage();
  const t = translations[currentLang];
  const ride = useQuery(api.rides.getRide, rideId ? { id: rideId as any } : "skip");
  const updateRide = useMutation(api.rides.updateRide);
  
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
    language: "sl", // Enforce Slovenian labels
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsResponse, setDirectionsResponse] = useState<google.maps.DirectionsResult | null>(null);
  
  const departureRef = useRef<google.maps.places.Autocomplete | null>(null);
  const destinationRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Form State
  const [departureString, setDepartureString] = useState("");
  const [departureLat, setDepartureLat] = useState<number | null>(null);
  const [departureLng, setDepartureLng] = useState<number | null>(null);
  
  const [destinationString, setDestinationString] = useState("");
  const [destinationLat, setDestinationLat] = useState<number | null>(null);
  const [destinationLng, setDestinationLng] = useState<number | null>(null);
  
  const [departureDate, setDepartureDate] = useState("");
  const [departureTime, setDepartureTime] = useState("");
  const [comment, setComment] = useState("");
  
  const [distanceText, setDistanceText] = useState("");
  const [durationText, setDurationText] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const onMapLoad = useCallback((m: google.maps.Map) => setMap(m), []);

  const calculateRoute = async (
    originStr: string, destStr: string,
    orgLat: number, orgLng: number,
    dstLat: number, dstLng: number
  ) => {
    if (!originStr || !destStr || !isLoaded) return;
    
    // eslint-disable-next-line no-undef
    const directionsService = new google.maps.DirectionsService();
    
    try {
      const results = await directionsService.route({
        origin: { lat: orgLat, lng: orgLng },
        destination: { lat: dstLat, lng: dstLng },
        // eslint-disable-next-line no-undef
        travelMode: google.maps.TravelMode.DRIVING,
      });
      
      setDirectionsResponse(results);
      if (results.routes && results.routes[0] && results.routes[0].legs[0]) {
        setDistanceText(results.routes[0].legs[0].distance?.text || "");
        setDurationText(results.routes[0].legs[0].duration?.text || "");
      }
    } catch (err) {
      console.error("Directions request failed due to ", err);
    }
  };

  // Initialize form with backend data
  useEffect(() => {
    if (ride && isLoaded && !isInitialized) {
      setDepartureString(ride.departure);
      setDepartureLat(ride.departureLat);
      setDepartureLng(ride.departureLng);
      
      setDestinationString(ride.destination);
      setDestinationLat(ride.destinationLat);
      setDestinationLng(ride.destinationLng);
      
      if (ride.distanceText) setDistanceText(ride.distanceText);
      if (ride.durationText) setDurationText(ride.durationText);
      if (ride.comment) setComment(ride.comment);
      
      const dt = new Date(ride.departureTime);
      setDepartureDate(dt.toISOString().split('T')[0]);
      setDepartureTime(dt.toTimeString().split(' ')[0].substring(0, 5));
      
      calculateRoute(
        ride.departure, ride.destination,
        ride.departureLat, ride.departureLng,
        ride.destinationLat, ride.destinationLng
      );
      
      setIsInitialized(true);
    }
  }, [ride, isLoaded, isInitialized]);

  const onDepartureChanged = () => {
    if (departureRef.current) {
      const place = departureRef.current.getPlace();
      if (place && place.geometry && place.geometry.location) {
        setDepartureString(place.formatted_address || place.name || "");
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setDepartureLat(lat);
        setDepartureLng(lng);
        
        if (destinationString && destinationLat && destinationLng) {
          calculateRoute(place.formatted_address || "", destinationString, lat, lng, destinationLat, destinationLng);
        } else {
           map?.panTo({ lat, lng });
           map?.setZoom(14);
        }
      }
    }
  };

  const onDestinationChanged = () => {
    if (destinationRef.current) {
      const place = destinationRef.current.getPlace();
      if (place && place.geometry && place.geometry.location) {
        setDestinationString(place.formatted_address || place.name || "");
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setDestinationLat(lat);
        setDestinationLng(lng);
        
        if (departureString && departureLat && departureLng) {
           calculateRoute(departureString, place.formatted_address || "", departureLat, departureLng, lat, lng);
        } else {
           map?.panTo({ lat, lng });
           map?.setZoom(14);
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rideId || !departureString || !destinationString || !departureLat || !departureLng || !destinationLat || !destinationLng || !departureDate || !departureTime) {
      alert(t.fillRequired);
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Create timestamp from inputs
      const datetimeString = `${departureDate}T${departureTime}:00`;
      const ts = new Date(datetimeString).getTime();
      
      await updateRide({
        id: rideId as any,
        departure: departureString,
        departureLat,
        departureLng,
        destination: destinationString,
        destinationLat,
        destinationLng,
        departureTime: ts,
        distanceText,
        durationText,
        comment
      });
      
      router.push("/rides");
    } catch (error) {
      console.error(error);
      alert("Napaka pri shranjevanju prevoza");
    } finally {
      setIsSubmitting(false);
    }
  };

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
         <div className="text-gray-500 bg-gray-50 p-8 rounded-xl">{t.teamDoesNotExist}</div>
         <button onClick={() => router.push("/rides")} className="mt-4 text-[#5BA582] font-bold">Nazaj</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F4F6F8] font-sans flex flex-col relative pb-20">
      <Head>
        <title>{t.editRide} | Sport2Go</title>
      </Head>
      <Header />
      <div className="h-[100px] md:h-[60px]" />

       <div className="w-full" style={{background: '#5BA582'}}>
         <div className="max-w-4xl mx-auto px-4 sm:px-8 py-5 flex items-center space-x-3">
           <button onClick={() => router.back()} className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors mr-2">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
           </button>
           <h1 className="text-2xl md:text-[28px] font-bold text-white tracking-wide" style={{fontFamily: 'var(--font-montserrat)'}}>
              {t.editRide}
           </h1>
         </div>
       </div>

       <div className="max-w-4xl mx-auto w-full px-4 sm:px-8 mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="ui-card p-6 md:p-8 flex flex-col">
             <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
               <div className="flex-1 space-y-6">
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">{t.departure}</label>
                   <Autocomplete
                     onLoad={(autocomplete) => { departureRef.current = autocomplete; }}
                     onPlaceChanged={onDepartureChanged}
                   >
                     <input
                       type="text"
                       placeholder={t.departure}
                       className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#5BA582]/50 focus:border-[#5BA582] transition-all"
                       defaultValue={departureString}
                       onChange={(e) => {
                         setDepartureString(e.target.value);
                       }}
                     />
                   </Autocomplete>
                 </div>
                 
                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">{t.destination}</label>
                   <Autocomplete
                     onLoad={(autocomplete) => { destinationRef.current = autocomplete; }}
                     onPlaceChanged={onDestinationChanged}
                   >
                     <input
                       type="text"
                       placeholder={t.destination}
                       className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#5BA582]/50 focus:border-[#5BA582] transition-all"
                       defaultValue={destinationString}
                       onChange={(e) => setDestinationString(e.target.value)}
                     />
                   </Autocomplete>
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">{t.day}</label>
                      <input
                        type="date"
                        value={departureDate}
                        onChange={e => setDepartureDate(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#5BA582]/50 focus:border-[#5BA582] transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">{t.departureTime}</label>
                      <input
                        type="time"
                        value={departureTime}
                        onChange={e => setDepartureTime(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#5BA582]/50 focus:border-[#5BA582] transition-all"
                        required
                      />
                    </div>
                 </div>

                 <div>
                   <label className="block text-sm font-bold text-gray-700 mb-2">Komentar / Navodila</label>
                   <textarea
                     value={comment}
                     onChange={e => setComment(e.target.value)}
                     placeholder={t.rideCommentPlaceholder}
                     rows={3}
                     className="w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#5BA582]/50 focus:border-[#5BA582] transition-all resize-none"
                   />
                 </div>
               </div>

               <div className="pt-4 border-t border-gray-100 flex items-center justify-end space-x-4 mt-auto">
                 <button
                   type="button"
                   onClick={() => router.back()}
                   className="px-6 py-3 text-gray-500 font-bold hover:text-gray-700 transition"
                 >
                   {t.cancelBtn}
                 </button>
                 <button
                   type="submit"
                   disabled={isSubmitting || !departureLat || !destinationLat}
                   className="px-6 py-3 bg-[#5BA582] text-white font-bold rounded-lg hover:bg-[#4b8a6a] transition-all shadow-md active:scale-95 disabled:opacity-50 flex items-center space-x-2"
                 >
                   {isSubmitting ? (
                     <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                   ) : (
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                   )}
                   <span>{t.editRide}</span>
                 </button>
               </div>
             </form>
          </div>
          
          <div className="space-y-4">
             <div className="ui-card p-4">
               {distanceText && durationText && (
                 <div className="flex bg-slate-50 border border-slate-100 rounded-xl p-4 justify-between items-center mb-4">
                   <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.distance}</span>
                      <span className="text-xl font-black text-[#5BA582]">{distanceText}</span>
                   </div>
                   <div className="h-10 w-px bg-slate-200"></div>
                   <div className="flex flex-col items-end">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.duration}</span>
                      <span className="text-xl font-black text-slate-700">{durationText}</span>
                   </div>
                 </div>
               )}
               
               <div className="rounded-xl overflow-hidden shadow-inner border border-gray-200 bg-gray-100" style={{height: 400}}>
                 <GoogleMap
                   mapContainerStyle={{ width: '100%', height: '100%' }}
                   center={departureLat && departureLng ? { lat: departureLat, lng: departureLng } : defaultCenter}
                   zoom={12}
                   onLoad={onMapLoad}
                   options={{
                     disableDefaultUI: true,
                     zoomControl: true,
                     streetViewControl: false,
                     mapTypeControl: false,
                   }}
                 >
                   {directionsResponse && (
                     <DirectionsRenderer 
                       directions={directionsResponse} 
                       options={{
                          suppressMarkers: false,
                          polylineOptions: { strokeColor: '#5BA582', strokeWeight: 5 }
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
