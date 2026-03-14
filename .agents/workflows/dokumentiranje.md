---
description: Samodejno generiranje komentarjev, tipov in dokumentacije
---
# Avtomatsko dokumentiranje kode

Ko uporabnik uporabi ukaz `/dokumentiranje`, je tvoj primarni cilj izboljšati razumljivost kode za druge razvijalce:

1. **JSDoc/Docstring komentarji:** Vsaki pomembnejši funkciji, razredu ali vmesniku (Interface) dodaj standardizirane komentarje, ki pojasnjujejo parametre (`@param`), povratne vrednosti (`@returns`) in namen abstrakcije.
2. **Komentarji logike (Why, not What):** Ne dodajaj komentarjev k očitnim vrsticam kode (npr. ob `let i = 0`). Komentiraj le kompleksne ali nekonvencionalne rešitve (razloži *zakaj* je nekaj narejeno na določen način, in ne *kaj* koda dela).
3. **Readme posodobitve:** Po potrebi posodobi glavno mapo ali komponento z `README.md` datoteko, kjer razložiš osnovno uporabo modula in njegove odvisnosti.
4. **Tipi:** Če opaziš, da v TypeScript/Javacript datotekah manjkajo ključne definicije tipov (npr. uporablja se `any`), poskusi te tipe eksplicitno določiti in dokumentirati.
5. **Brez spreminjanja logike:** Pri tem workflowu strogo pazi, da **ne spreminjaš dejanskega izvajanja programske kode**, ampak vanjo dodajaš izključno sintaktično pravilne komentarje.
