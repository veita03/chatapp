# Pošiljanje E-pošte v Sport2GO

V sistemu trenutno pošiljamo **3 tipe** sistemskih e-poštnih sporočil. Vsa sporočila se pošiljajo preko servisa **Resend**, koda pa je v celoti nameščena in vodena v zaledni mapi `convex/`.

Vsa tri sporočila se ovijejo v enotno vizualno HTML HTML predlogo, ki se nahaja v:
- 📄 **`convex/emailTemplates.ts`** 
*(Ta datoteka vsebuje glavo (logotip) ter sprocesira in vključi dinamično tektonsko nogo sporočila - t.i. `platformTag`, npr.: "Sport2GO — platforma za organizacijo športa.", ki je prenašan iz vsake funkcije, da ustreza izbranemu jeziku).*

---

## 1. Registracijsko sporočilo (Potrditvena OTP koda)
Pošlje se, ko se uporabnik ustvari račun s e-poštno prijavo in mora potrditi svoj predal.

- **Kje se integrirano sproži (Trigger):** `convex/users.ts` -> znotraj mutacije `generateOtp`. Kliče ga UI (iz `src/app/profile/page.tsx`).
- **Kje se nahaja sestavljanje (HTML, teksti & Resend klic):** `convex/emails.ts` -> znotraj Convex backend akcije `sendVerificationEmail`.
- **Jeziki:** Vsebuje lasten JSON slovar pod imenom `translations`, kjer je vseh 15 lokalizacij naslova in vsebine (vključno s Footer textom).

## 2. Pozdravno sporočilo (Dobrodošlica / Welcome Email)
Pošlje se takoj po tem, ko uporabnik vnese kodo in prvič uspešno izpolni svoje podrobnosti na `/profile` in s tem "aktivira" svoj profil.

- **Kje se integrirano sproži (Trigger):** `convex/users.ts` -> na koncu mutacije `updateProfile` (kjer preveri `needsOtp`).
- **Kje se nahaja sestavljanje (HTML, teksti & Resend klic):** `convex/emails.ts` -> znotraj Convex backend akcije `sendWelcomeEmail`.
- **Jeziki:** Podobno kot OTP del, vsebuje lasten slovar za prevode, prilagodi se na jezik, ki ga izstreli UI aplikacija z ukazom ob shranjevanju.

## 3. Sporočilo za obnovo gesla (Password Reset OTP)
Pošlje varnostno kodo, ki velja kot gumb za posodobitev gesla tistemu, ki pritisne v UI, da je pozabil svojo kodo. To je precej drugačna implementacija od prvih dveh.

- **Kje se integrirano sproži (Trigger):** To je sistemsko integrirano na front-endu `src/app/page.tsx`, kjer uporabnik s klikom sproži Convexov React ukaz: `signIn("password", { flow: "reset", redirectTo: "/?lang=" + lang })`.
- **Kje se nahaja sestavljanje (HTML, teksti & Resend klic):** V datoteki **`convex/auth.ts`**. Logika je vtkana neposredno v `Password` provider -> parametru `Email({ sendVerificationRequest: async (...) => {...} })`.
- **Kako brcne pravi jezik v BackEnd:** Zaradi varnosti in omejitev Auth providerja `redirectTo` začasno obdrži URL v prijavnem procesu. V `sendVerificationRequest` ta url razbijemo z regex-om `u.searchParams.get("lang")` in izluščimo tisti jezik. Prevodna logika za teh 15 jezikov (Zadeva, Tekst, HTML) živi znotraj funkcije `Password` prav tako noter v tej isti `convex/auth.ts` datoteki.
