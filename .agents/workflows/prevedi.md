---
description: Samodejno iskanje hardcoded besedil in prevajanje v vse podprte jezike (i18n)
---
# Avtomatsko prevajanje in i18n integracija

Ko uporabnik zahteva `/prevedi` za določeno datoteko, komponento ali mapo, dosledno izvedi naslednje korake v natanko tem vrstnem redu:

1. **Odstranjevanje hardcoded besedil:** Preglej izbrano kodo in poišči vse *hardcoded* slovenske (ali angleške) nize, ki so vidni končnemu uporabniku (teksti, gumbi, opozorila, 'placeholder' besedila, tabele). Zamenjaj jih z ustreznimi klici prevajalske funkcije (npr. `t('modul.kljuc')` ali ustrezen i18n / prehodni mehanizem, ki ga projekt uporablja).
2. **Sistematična ekstrakcija ključev:** Vse najdene tekste zberi in zanje ustvari logične, hierarhične prevajalske ključe (npr. `chat.list.add_button`, `chat.edit.title`).
3. **Popoln prevod v VSE jezike:** Obvezno preveri, kateri jeziki so že podprti v projektu (identificiraj vse .json ali .ts jezikovne datoteke). **Za VSAK nov ključ samodejno in takoj generiraj visokokakovosten prevod za PRAV VSE podprte jezike.** Ne izpusti niti enega jezika in niti enega manjšega gumba!
4. **Posodobitev i18n datotek:** S pomočjo orodij za urejanje (replace_file_content) neposredno uredi vse ustrezne jezikovne datoteke (npr. `sl.json`, `en.json`, `de.json`, `el.json` itd.) ter vanje zapiši nove prevode.
5. **Popravljanje starih napak (Zero Tolerance):** Pri pregledu preveri celoten izbran modul (npr. celoten Chat). Če so od prej ostali neprevedeni ključi v kateremkoli od jezikov, jih prav tako prevedi v tem prehodu.

**Glavno pravilo:** Uporabnik ne sme NIKOLI več ročno prositi za prevod manjkajočega jezika ali opozarjati na hardcoded string v neki obskurni komponenti. Klic `/prevedi` pomeni 100% integracijo vseh jezikov za izbran modul brez dodatnih vprašanj.
