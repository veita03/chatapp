---
description: Optimizacija in refaktoriranje kode za boljšo zmogljivost in berljivost
---
# Optimizacija kode in Refaktoriranje

Ko uporabnik zahteva `/optimizacija` za specifičen del kode, upoštevaj naslednja pravila:

1. **Čitljivost kode (Clean Code):** Identificiraj in odpravi podvojeno kodo (DRY princip) ter razbij prevelike funkcije na manjše, bolj razumljive dele.
2. **Hitrost in zmogljivost (Performance):** Preveri kompleksnost algoritmov (Big O), odpravi nepotrebne zanke, zmanjšaj število renderjev v Reactu (če je primerno) ter optimiziraj poizvedbe v bazo.
3. **Pomožne funkcije (Helpers):** Če opaziš ponavljajočo se logiko, jo takoj prestavi v ločeno util/helper datoteko.
4. **Odstranjevanje neuporabnega:** Odstrani "mrtvo" kodo (dead code), neuporabljene importe in zakomentirane bloke kode, ki smetijo datoteko.
5. **Izvedba:** Namesto ustvarjanja poročila pri tem ukazu kodo **neposredno uredi** z orodjem za urejanje kode (`replace_file_content` ali `multi_replace_file_content`). V opisu spremembe jasno navedi, zakaj je nova koda hitrejša/boljša.
