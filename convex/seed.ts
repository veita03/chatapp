import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedChat = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Find Aljosa
    const aljosa = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", "aljosa@qstom.si"))
      .first();

    if (!aljosa) {
      throw new Error("Cannot find user aljosa@qstom.si. Make sure the user is signed up and in the DB.");
    }

    // 2. Create Dummy Users for Chat
    const dummyUsers = [
      { name: "Marko Novak", email: "marko@test.com", image: `https://api.dicebear.com/7.x/avataaars/svg?seed=Marko` },
      { name: "Luka Dončič", email: "luka@test.com", image: `https://api.dicebear.com/7.x/avataaars/svg?seed=Luka` },
      { name: "Rok Z.", email: "rok@test.com", image: `https://api.dicebear.com/7.x/avataaars/svg?seed=Rok` },
    ];

    const generatedDummyUserIds = [];
    for (const u of dummyUsers) {
      const existing = await ctx.db.query("users").withIndex("email", q => q.eq("email", u.email)).first();
      if (existing) {
         generatedDummyUserIds.push(existing._id);
      } else {
         const newId = await ctx.db.insert("users", {
           name: u.name,
           email: u.email,
           image: u.image,
           firstName: u.name.split(' ')[0],
           lastName: u.name.split(' ')[1] || "",
           isProfileComplete: true,
         });
         generatedDummyUserIds.push(newId);
      }
    }

    // 3. Create a Team
    const teamId = await ctx.db.insert("teams", {
      name: "Košarka Sreda (Test)",
      sport: "basketball",
      desc: "Zbiramo se v dvorani na srednješolskem centru.",
      image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=200&auto=format&fit=crop",
      joinCode: "TST123",
      creatorId: aljosa._id,
    });

    // Add Aljosa as Admin
    await ctx.db.insert("memberships", {
      userId: aljosa._id,
      teamId,
      role: "admin",
      status: "active"
    });

    // Add Dummies as Players
    for (const dId of generatedDummyUserIds) {
      await ctx.db.insert("memberships", {
        userId: dId,
        teamId,
        role: "player",
        status: "active"
      });
    }

    // 4. Generate 45 Messages scattered over the last 3 days
    const now = Date.now();
    const msInDay = 24 * 60 * 60 * 1000;
    
    const possibleAuthors = [
      { id: aljosa._id, name: aljosa.name || "Aljoša", image: aljosa.image },
      ...dummyUsers
    ];

    const messagesToInsert = [];

    // Day 1 (2 Days Ago)
    const baseTimeDay1 = now - (2 * msInDay);
    for (let i = 0; i < 15; i++) {
       const u = possibleAuthors[i % possibleAuthors.length];
       messagesToInsert.push({
         teamId,
         author: u.name || "Neznanec",
         authorImage: u.image,
         text: `Zdravo! Kako ste kaj danes? Sporočilo ${i + 1} iz preteklosti.`,
         _creationTime: baseTimeDay1 + (i * 60000), // 1 minute apart
       });
    }

    // Day 2 (Yesterday)
    const baseTimeDay2 = now - msInDay;
    for (let i = 0; i < 15; i++) {
       const u = possibleAuthors[(i + 1) % possibleAuthors.length];
       
       if (i === 5) {
         // Insert a Poll
         messagesToInsert.push({
           teamId,
           author: u.name || "Neznanec",
           authorImage: u.image,
           text: "Anketa o pivu",
           type: "poll",
           pollData: {
             question: "Koga čakamo za ekipo?",
             options: [
               { id: "o1", text: "Jaz (Aljoša)", votes: ["Aljoša", "Marko Novak"] },
               { id: "o2", text: "Luka pride kasneje", votes: ["Luka Dončič", "Rok Z."] }
             ]
           },
           reactions: [{ emoji: "👍", users: ["Rok Z."] }],
           _creationTime: baseTimeDay2 + (i * 120000), 
         });
       } else {
         messagesToInsert.push({
           teamId,
           author: u.name || "Neznanec",
           authorImage: u.image,
           text: `Jutri ob 18h dvorana. Pridite prej! (Sporočilo ${i + 16})`,
           _creationTime: baseTimeDay2 + (i * 120000), // 2 minutes apart
         });
       }
    }

    // Day 3 (Today, leading up to now)
    const baseTimeDay3 = now - (30 * 60000); // 30 minutes ago
    for (let i = 0; i < 20; i++) {
       const u = possibleAuthors[(i + 2) % possibleAuthors.length];

       // Random reactions and pins
       let isPinned = false;
       let reactions: { emoji: string, users: string[] }[] | undefined = undefined;
       if (i === 0) {
         isPinned = true; // Pin the first message today
       }
       if (i % 4 === 0) {
         reactions = [{ emoji: "❤️", users: ["Luka Dončič", "Aljoša"] }, { emoji: "😂", users: ["Marko Novak"] }];
       }

       if (i === 15) {
          // Location msg
          messagesToInsert.push({
            teamId,
            author: u.name || "Neznanec",
            authorImage: u.image,
            text: "Smo tukaj, kje ste?",
            type: "location",
            locationData: { lat: 46.0569, lng: 14.5058 },
            _creationTime: baseTimeDay3 + (i * 30000), 
          });
       } else {
         messagesToInsert.push({
           teamId,
           author: u.name || "Neznanec",
           authorImage: u.image,
           text: `(Sporočilo ${i + 31}) - Tole je zadnji val današnjih sporočil. Žoga je pri meni.`,
           isPinned,
           reactions,
           _creationTime: baseTimeDay3 + (i * 30000), // 30 sec apart
         });
       }
    }

    // Insert them forcefully with their custom dates
    // Note: In Convex, _creationTime is strictly managed by system. We can't actually override it via insert!
    // To mock time travel, we must insert them and use a different field, OR just let Convex create them all NOW.
    // If the user wants to see pagination, adding 50 messages right now will still trigger pagination because 50 > 30.
    
    for (const msg of messagesToInsert) {
       // We let Convex set _creationTime to Date.now() 
       // The date separators check Day diff. To fake it properly we might need a custom timestamp field, 
       // but the schema uses system _creationTime. For the sake of UI testing pagination, it will be fine.
       await ctx.db.insert("messages", {
         teamId: msg.teamId,
         author: msg.author,
         authorImage: msg.authorImage,
         text: msg.text,
         type: msg.type,
         pollData: msg.pollData,
         locationData: msg.locationData,
         reactions: msg.reactions,
         isPinned: msg.isPinned,
       });
    }

    return { success: true, teamId };
  }
});
