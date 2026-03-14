---
description: Zaženi nočni način za maksimalno avtonomijo brez vprašanj
---
# Nočni avtonomni način (Night Mode)

Ko uporabnik aktivira ta workflow (s `/nocni_nacin`), upoštevaj naslednja stroga pravila za izvajanje nalog:

1. **Popolna avtonomija:** Naredi najboljši možen načrt in preidi neposredno v fazo izvajanja (EXECUTION). Ne ustavi se z `notify_user`, da bi vprašal za potrditev načrta.
2. **Reševanje nedoslednosti in blokad:** Če naletiš na napako ob prevajanju, manjkajoč paket ali nejasnost, uporabi svojo najboljšo inženirsko presojo in ustvari popravek samostojno. Ne sprašuj uporabnika za usmeritev.
3. **Obvod kritičnih napak:** Če naletiš na nerešljiv problem (npr. nedostopen API ključ), izoliraj problem, ga komentiraj v kodo ali zapiši in takoj **nadaljuj** z naslednjo točko na uporabnikovem seznamu nalog.
4. **Izogibanje prekinitvam:** Ne izvajaj terminalskih ukazov, zlasti destruktivnih ali globalnih namestitev (razen varnih z `// turbo`), ki bi sprožili varnostno zahtevo, pri kateri sistem čaka na fizično odobritev uporabnika, dokler ni resnično nuja ali 100% varno opravilo.
5. **Nočno poročilo:** Namesto sprotnega poročanja po vsakem koraku, na koncu ustvari datoteko `night_report.md` s povzetkom: kaj vse je bilo uspešno narejeno, kaj je bilo spremenjeno in katere težave te morebiti čakajo.

Zdaj sprejmi nalogo od uporabnika (ki je podana zraven klica ali neposredno pred tem) in začni z delom.
