---
description: Temeljit pregled kode in iskanje skritih hroščev (Code Review)
---
# Pregled in analiza kode (Code Review)

Ko uporabnik zahteva `/pregled_kode` za določeno datoteko ali mapo, sledi tem korakom:

1. **Analiza strukture:** Preveri, ali koda sledi uveljavljenim arhitekturnim vzorcem (npr. ločevanje logike od UI).
2. **Varnostni pregled (Security Check):** Aktivno poišči morebitne varnostne ranljivosti (npr. XSS, SQL injection, nezaščiteni API endpointi).
3. **Iskanje hroščev (Bug Hunt):** Identificiraj robne pogoje (edge cases), ki trenutno niso pokriti z logiko, in predlagaj popravke.
4. **Skladnost s standardi:** Preveri uporabo tipov (TypeScript), poimenovanje spremenljivk, in ustrezno obravnavo napak (error handling).
5. **Poročilo:** Ustvari datoteko `code_review_report.md` z natančnim in konstruktivnim seznamom pripomb ter konkretnimi predlogi kode za izboljšavo. Na koncu obvesti uporabnika z `notify_user` in vključi poročilo v `PathsToReview`.
