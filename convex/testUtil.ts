import { mutation } from "./_generated/server";

const SL_NAMES = ["Marko", "Luka", "Tomaž", "Matej", "Dejan", "Simon", "Rok"];
const SL_TEXTS = [
  "Gremo pubeci danes?",
  "A ma kdo kako žogo viška? Moja je pustošla.",
  "Danes ob 20:00 velja?",
  "Jaz sem zraven! 💪",
  "Ne morem, dežuje pa mam prehlajeno grlo 😅",
  "Kdo pobira drese po tekmi?",
  "Ena pijača po fuzbalu danes? 🍻",
  "Pridem 10 minut kasneje, gužva je na obvoznici.",
  "Zadnjič smo res dobr igrali, ajmo danes ponovit! 🔥",
  "A lahko pridem z bratrancem, rabi trening?",
  "Kdo bo golman? Meni se ne da danes.",
  "Ej nabavimo kake prave mrežice končno?",
  "Dajte potrdit rsvp čimprej da vemo kolko nas bo.",
  "Jaz snem danes kako hudo akcjo 📱",
  "Jebeš dež, mi smo šampioni!",
  "Kdaj gremo na tisti turnir v soboto?",
  "Kdo zrihta markirke?",
  "Švica bo tekla, prnesite vodo!",
  "Iščemo še enega, rabi kdo povabilo?",
  "Sodnik rabi piščalko... samo pravim."
];

export const insertTestMessages = mutation({
  args: {},
  handler: async (ctx) => {
    // Fetch some test teams to spam messages into
    const teams = await ctx.db.query("teams").order("desc").take(3);
    
    let count = 0;
    for (const team of teams) {
      // Add a randomized amount of natural, realistic messages
      const numMessages = Math.floor(Math.random() * 15) + 8; // between 8 and 22 
      
      for (let i = 1; i <= numMessages; i++) {
         const randomName = SL_NAMES[Math.floor(Math.random() * SL_NAMES.length)];
         const randomText = SL_TEXTS[Math.floor(Math.random() * SL_TEXTS.length)];
         
         await ctx.db.insert("messages", {
           teamId: team._id,
           author: randomName,
           text: randomText,
         });
         count++;
      }
    }
    return `Uspešno dodanih ${count} testnih sporočil z realnimi besedili!`;
  }
});

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

export const addRandomReactions = mutation({
  args: {},
  handler: async (ctx) => {
    // Fetch recent messages
    const messages = await ctx.db.query("messages").order("desc").take(50);
    
    let count = 0;
    for (const msg of messages) {
       // 30% chance to add reactions to a message
       if (Math.random() < 0.3) {
          const numReactions = Math.floor(Math.random() * 3) + 1; // 1 to 3 different emojis
          
          let currentReactions = msg.reactions || [];
          
          for (let i = 0; i < numReactions; i++) {
             const randomEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
             
             // Check if emoji already exists
             const existingIdx = currentReactions.findIndex(r => r.emoji === randomEmoji);
             
             // Generate random reacting users
             const numUsers = Math.floor(Math.random() * 4) + 1; // 1 to 4 users
             const users = [];
             for (let j = 0; j < numUsers; j++) {
                users.push(SL_NAMES[Math.floor(Math.random() * SL_NAMES.length)]);
             }
             
             // Unique users
             const uniqueUsers = Array.from(new Set(users));
             
             if (existingIdx !== -1) {
                // Add users to existing
                const existingUsers = currentReactions[existingIdx].users;
                const combined = Array.from(new Set([...existingUsers, ...uniqueUsers]));
                currentReactions[existingIdx].users = combined;
             } else {
                currentReactions.push({ emoji: randomEmoji, users: uniqueUsers });
             }
          }
          
          await ctx.db.patch(msg._id, { reactions: currentReactions });
          count++;
       }
    }
    return `Uspešno dodanih random reakcij na ${count} sporočil!`;
  }
});

export const insertTestMessagesWithReactions = mutation({
  args: {},
  handler: async (ctx) => {
    // Fetch some test teams to spam messages into
    const teams = await ctx.db.query("teams").order("desc").take(3);
    
    let count = 0;
    for (const team of teams) {
      // Add a randomized amount of natural, realistic messages: 3 to 8
      const numMessages = Math.floor(Math.random() * 6) + 3; 
      
      for (let i = 1; i <= numMessages; i++) {
         const randomName = SL_NAMES[Math.floor(Math.random() * SL_NAMES.length)];
         const randomText = SL_TEXTS[Math.floor(Math.random() * SL_TEXTS.length)];
         
         // Generate random reactions for this new message
         const numReactions = Math.floor(Math.random() * 3) + 1; // 1 to 3 different emojis
         let currentReactions: { emoji: string; users: string[] }[] = [];
         
         for (let j = 0; j < numReactions; j++) {
            const randomEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
            
            // Check if emoji already exists in our fresh array
            const existingIdx = currentReactions.findIndex(r => r.emoji === randomEmoji);
            
            // Generate random reacting users (1 to 3)
            const numUsers = Math.floor(Math.random() * 3) + 1; 
            const users = [];
            for (let k = 0; k < numUsers; k++) {
               users.push(SL_NAMES[Math.floor(Math.random() * SL_NAMES.length)]);
            }
            const uniqueUsers = Array.from(new Set(users));
            
            if (existingIdx !== -1) {
               const existingUsers = currentReactions[existingIdx].users;
               currentReactions[existingIdx].users = Array.from(new Set([...existingUsers, ...uniqueUsers]));
            } else {
               currentReactions.push({ emoji: randomEmoji, users: uniqueUsers });
            }
         }
         
         await ctx.db.insert("messages", {
           teamId: team._id,
           author: randomName,
           text: randomText,
           reactions: currentReactions
         });
         count++;
      }
    }
    return `Uspešno dodanih ${count} testnih sporočil z REAKCIJAMI!`;
  }
});
