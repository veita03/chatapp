# Dokumentacija Chat Modula (V3)
*Zadnja posodobitev: Marec 2026*

Chat modul služi kot ključno komunikacijsko središče med igralci in administratorji posameznih športnih ekip. Namesto globalnega chata je arhitektura zasnovana **izključno na nivoju ekipe** (vsaka ekipa ima svojo izolirano klepetalnico).

---

## 1. Arhitektura in Poti (Routing)
- **/chat**: Predal prejetih sporočil (Inbox). Zlista vse ekipe, v katerih je prijavljen uporabnik član. Prikazuje zadnje sporočilo, relativen čas (npr. "pred 5 min") ter oranžno značko z neprebranimi sporočili.
- **/chat/[teamId]**: Glavni vmesnik klepeta za posamezno ekipo. Vsebuje prostor z zgodovino sporočil, vrstico z uporabniškimi vnosnimi polji (Quick Actions) in okna (Modali) za pregled udeležencev in anket.

## 2. Podatkovna Shema (Convex)
Klepet temelji predvsem na naslednjih relacijah v bazi:
- `messages`: Hrani dejanska sporočila (`teamId`, `author`, `text`, `type`, `pollData`, `locationData`, `reactions`, `isPinned`, `creationTime`).
- `memberships`: Povezovalna tabela med posameznikom in ekipo. Ključno vlogo nosi polje **`lastReadTime`**, ki omogoča izračun neprebranih sporočil.
- `teams` & `users`: Vir profilnih podatkov in ekipnih metapodatkov (slike, imena).

## 3. Neprebrana Sporočila (Unread Logic)
- Sistem ob vstopu v posamični chat (`/chat/[teamId]`) preko `useEffect` klica konstantno osvežuje `lastReadTime` za tega uporabnika v tabeli `memberships` na trenutni čas.
- Vsi drugi prikazi (npr. na `page.tsx` inboxu) preverjajo filtracijo `msg._creationTime > membership.lastReadTime` za izris indikatorjev "X novih sporočil".

## 4. Bogata Sporočila (Rich Message Types)
Vnosno polje vsebuje gumb "Plus (+)", ki razkrije meni hitrih akcij (Quick Actions). Podprti so sledeči tipi (strukturirani v `type` polju baze):

1. **Običajno besedilo (`text`)**:
   - Omogoča samodejno obarvanje in zaznavo spletnih povezav (Auto-link).
   - **Oznake (Mentions)**: Uporaba afne `@Ime Priimek` ali `@Vsi`. Sistem dinamično pretvori seznam prisotnih igralcev ekipe v Regex in inteligentno izlušči označeno ime (kljub presledkom in znakom). Obarva jih zeleno.

2. **Lokacija (`location`)**:
   - Shrani koordinati (`lat`, `lng`).
   - Uporabniku izriše **OpenStreetMap iFrame** s predogledom zemljevida.
   - Povezava za Google Maps poti je dodana s precej natančnim `bbox` povečanjem za pogled ulic (zoom factor).

3. **Anketa (`poll`)**:
   - Prikazuje vprašanje in zbirane glasove preko vrstic (Options).
   - Na dnu ankete je interaktiven gumb `Ogled glasov`.
   - Modalo "Ogled glasov" prikaže kdo glasuje. Modalo uporablja **Slovensko sklanjatev** (1 glas, 2 glasa, 3 glasovi, 5 glasov). Igralci so prikazani v urejeni preprosti listi z avatarji (enako kot pri modal-u Udeleženci).

4. **Dogodek (Event) - *V pripravi* **:
   - Osnutek je postavljen in grafično pripravljen, a trenutno neaktiven, saj čaka na popolno implementacijo "Sezon", s katerim bo dogodek relacijsko povezan.

5. **Reakcije (Reactions / Emojis)**:
   - Na objave je mogoče odgovarjati s smeški na lebdečem meniju (👍, 👏, 😂, 🔥, 👎) ob kliku ikone na posameznem mehurčku sporočila. Reakcije se grupirajo z ikonami in števci.

6. **Pripeto sporočilo (Pin)**:
   - Admin ali avtor lahko pripneta eno (ali več) sporočil, ki se obarvajo in poudarijo (Pinned tag). Uporaba posebne Convex funkcije za pripenjanje.

## 5. Uporabniška Izkušnja in UI/UX
- **Mobilnemu prikazu prijazno**: Celoten dizajn prevzema logiko modernih platform ala Viber / WhatsApp, s skritimi zunanjimi robovi in gladkim "slide-in" dizajnom.
- **Samodejen preskok**: Pri odpiranju velikega chata se zaslon "zascrolla" povsem na dno do najnovejšega sporočila.
- **Zapiranje oken na klik izven (Backdrop dismiss)**: Vsa pop-up okna (seznam sodelujočih in ogled anketnih glasov) podpirajo ti. "click-off" logiko.
- Ikone v menijih za Ankete uporabljajo izključno novo, stilsko oranžno SVG grafiko in ne starih "emoji" besedilnih znakov.

## 6. Znane omejitve in Roadmap (Še čaka na implementacijo):
- [] **Dinamično nalaganje starih sporočil (Pagination / Infinite Scroll)**: Trenutno chat avtomatsko potegne vsa aktivna sporočila. Za optimalno delovanje v ekipah z nekaj tisoč sporočili bo potrebno dodati lazy loading na "scroll up".
- [] **Osveževanje imenika v chatu**: Trenutno ima `messages` v bazi fiksiran `author` kot string poleg `authorId`. Treba bo avtomatizirati spremembe, če si uporabnik preimenuje globalni profil, da se to zrcalno odraža v starih chat mehurčkih.
- [] **Real-time Push Notifikacije**: Neprebrana sporočila znotraj aplikacije že delujejo perfektno, za zaklenjen zaslon ob prejetem sporočilu ("ding") pa bo kdaj potrebno vključiti Firebase ali standardne PWA web notifications service workerje.
- [] **Vklop modula Sezone in Dogodkov**: Pripenjanje dogodka v chat (za RSVP-je) je naslednja logična faza razvoja.

---
*Zaključek modula Chat: Vsi vizualni (spacing, animacije, barvne sheme, responsive) postopki, navedeni v prejšnjih nalogah, so uspešno rešeni, vključno z live "Seeding" funkcijami testnih podatkov.*
