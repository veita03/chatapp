# Navodila za Prijavo in Registracijo (Login & Register Flow)

Ta dokument vsebuje celovita pravila in arhitekturo sistema za prijavo in registracijo v aplikaciji Sport2GO. Namenjen je kot referenca za preprečevanje zmede pri prihodnjih spremembah.

## Temeljna Pravila Vmesnika
1. **Ločitev zaslonov**: Registracija in prijava sta strogo ločeni (prikaz preko modalnega okna ali ločene poti).
2. **Možne metode**: Podprta sta tako klasična prijava (e-pošta in geslo) kot tudi prijava z računom Google.
3. **Prikaz gesla**: Vedno obstaja opcija za prikaz ali skritje vpisanega gesla.
4. **Potrditev preko e-pošte (OTP)**: Po uspešni registraciji z obema metodama račun (oz. e-pošta) še NI potrjen. Slediti mora obvezno dokončanje profila, kjer uporabnik izpolni ime in priimek ter vnese **6-mestno potrditveno kodo**. Uporabnik **ne sme imeti dostopa do nobene druge strani** razen profila, dokler tega ne dokonča.
5. **Dvojni vpis gesla**: Pri registraciji je nujno preverjanje gesla z dvojnim vnosom ("Potrdi geslo").
6. **"Zapomni si me"**: Uporabnikom mora biti na voljo gumb/checkbox za podaljšanje seje, zato se jim ni treba vsakič znova prijavljati.
7. **Obveščanje o napakah**: Prikazana morajo biti ustrezna sistemska opozorila v primeru:
   - Napačnih prijavnih podatkov,
   - Nepravilne oblike e-poštnega naslova,
   - Neujemanja potrditvenega gesla,
   - Če uporabniški račun / e-pošta že obstaja.
8. **Preusmeritve**:
   - Po vnosu in potrditvi vseh potrebnih podatkov (torej profil velja za narejen) uporabnika preusmeri na stran **Ekipe**.
   - Če ob prijavi ali po novi registraciji uporabnik še nima dokončanega profila, mora nemudoma preusmeriti na stran profila za vnos kode.
9. **Pozdravni E-mail**: Takoj ko uporabnik uspešno potrdi profil z OTP kodo in se registrira, nujno prejme "Welcome" e-mail z vizualno predlogo.
10. **Pozabljeno geslo**: _(Manjkajoča funkcionalnost)_ Oblikovati obnovo preko zunanjega vmesnika, kjer sistem preko enake Resend API logike izda kodo za potrditev, pošlje stiliziran email za menjavo in nato omogoči vnos novega gesla na platformi.

--- 
## Uporabniški Raw Zapis (Original Reference)
> _"torej da sedaj razumeš stukturo prijave/registracije ter da jo lahko v celoti zajameš ter optimiziraš kodo in delovanje. glavno je da se ve točke - te si prosim v md mapi zapiši v login_instructions.md:
> - možna je tako klasična kot google registracija
> - registracija in prijava sta ločeni
> - imamo opcijo da se lahko prikaže/skrije vpisano geslo
> - po registraciji z obema metodama še račun/email ni potrjen - zato ne sme imeti do nikoder dostopa - samo do strani profila kjer mora izpolnit obvezne podatke (ime, priimek) ter potrditveno kodo
> - pri registraciji se zahteva potrditev gesla, torej da se dvakrat vpiše
> - pri prijavi je na voljo Zapomni si me (userom je pomembno da se ne rabijo vedno znova prijavljat)
> - ustrezno se morajo izpisati opozorila če. se prijavlja z napačnimi podatki, če oblika maila ni pravilna, če se gesli ne ujemata, če račun že obstaja
> - potrditveno kodo dobi na mail preko resend sistema
> - po uspešni registraciji se pošlje mail z dobrodošlico
> - po registraciji uporabnika preusmeri na dokončanje profila, če še ta ni izpolnjen
> - po registraciji/prijavi uporabnika, če je že dokončl profil, ga preusmeri na stran Ekipe"_

### Naslednji Koraki:
- Razmisliti o implementaciji "Forgot Password" poti z generacijo zaščitne kode v bazi in stiliziranim email sporočilom, da zmanjšamo število spam poizvedb za obnovo.
