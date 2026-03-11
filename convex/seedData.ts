import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const seedProductionTeams = mutation({
  args: {
     email: v.string()
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", args.email))
      .unique();

    if (!user) {
       throw new Error("Uporabnik ne obstaja v bazi.");
    }

    const teammateNames = [
      "Marko", "Dejan", "Simon", "Rok", "Miha", 
      "Luka", "Tomaž", "Gregor", "Primož", "Nejc", "Borut"
    ];

    const messagesContentSports = [
      { text: "Fantje, kdaj imamo danes trening?", author: "Marko" },
      { text: "Mislim da ob 19:00 kot ponavadi.", author: "Dejan" },
      { text: "A kdo pobere drese po tekmi? Jaz ne utegnem.", author: "Simon", pin: true },
      { text: "Jaz lahko! Ni problema.", author: "Rok", reaction: { emoji: "👍", users: ["Simon", "Marko"] } },
      { text: "@Rok super, hvala ti! Kaj pa žoge?", author: "Marko" },
      { text: "Žoge imam jaz v prtljažniku. Se vidimo pol!", author: "Luka" },
      { text: "Mislim, da bo švica tekla danes! Prnesite zadosti vode. 💧", author: "Tomaž" },
      { text: "A ima kdo ekstra flaško? Pozabil svojo...", author: "Gregor" },
      { text: "Mam jaz rezervno, ti posodim.", author: "Primož", reaction: { emoji: "👏", users: ["Gregor"] } },
      { text: "Kdo ma žogo? Pridite malo prej, da se ogrejemo.", author: "Nejc" },
      { text: "Spet izgovori... 😅", author: "Borut" },
      { text: "Špilferdeber! 😂 Gremo na zmago danes!", author: "Marko", pin: true },
      { text: "A gremo po tekmi na pico? 🍕", author: "Luka" },
      {
        text: "Kje sploh igramo danes?",
        author: "Gregor",
        type: "location",
        locationData: { lat: 46.056946, lng: 14.505751 }
      },
      {
        text: "Anketa o hrani",
        author: "Rok",
        type: "poll",
        pollData: {
          question: "Kaj jemo po tekmi?",
          options: [
            { id: "o1", text: "Pica", votes: ["Marko", "Dejan", "Luka"] },
            { id: "o2", text: "Čevapi", votes: ["Simon", "Borut", "Nejc"] },
            { id: "o3", text: "Grem domov", votes: ["Gregor"] }
          ]
        }
      },
      { text: "Torej očitno bo vojna med pico in čevapi! 😂", author: "Marko", reaction: { emoji: "😂", users: ["Luka", "Simon", "Borut"] } }
    ];

    const generateJoinCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

    // TEAM 1: Nogomet
    const team1Id = await ctx.db.insert("teams", {
      name: "Torkov Fuzbal LIGA",
      sport: "football",
      joinCode: generateJoinCode(),
      creatorId: user._id,
      image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=200&auto=format&fit=crop"
    });

    await ctx.db.insert("memberships", {
      userId: user._id,
      teamId: team1Id,
      role: "admin",
      status: "active"
    });

    // Create teammates models blindly for pure chat visual purposes. 
    // They are not real auth users but we need them in `users` to mention/ping correctly maybe, 
    // but the `author` field on message is a string anyway.
    
    // TEAM 2: Košarka
    const team2Id = await ctx.db.insert("teams", {
      name: "Košarka KK Veterani",
      sport: "basketball",
      joinCode: generateJoinCode(),
      creatorId: user._id,
      image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=200&auto=format&fit=crop"
    });

    await ctx.db.insert("memberships", {
      userId: user._id,
      teamId: team2Id,
      role: "admin",
      status: "active"
    });

    // Seed Messages for Team 1
    let time1Ms = Date.now() - 1000 * 60 * 60 * 24 * 2; // start 2 days ago
    for (const msg of messagesContentSports) {
      time1Ms += 1000 * 60 * 25; // add 25 minutes space
      await ctx.db.insert("messages", {
        teamId: team1Id,
        author: msg.author,
        text: msg.text,
        type: msg.type || "text",
        locationData: msg.locationData as any,
        pollData: msg.pollData as any,
        isPinned: msg.pin,
        reactions: msg.reaction ? [msg.reaction] : [],
      });
    }

    // Add a couple of messages directly from the current user
    await ctx.db.insert("messages", {
      teamId: team1Id,
      author: user.name || "Test",
      text: "Fantje jaz bom malenkost zamudil, me šef še nekaj gnjavi. 🙄",
      type: "text",
      reactions: [{ emoji: "👎", users: ["Marko", "Rok"] }]
    });

    // Seed Messages for Team 2 (slightly altered variation)
    // We will just reverse the array and change names slightly
    let time2Ms = Date.now() - 1000 * 60 * 60 * 24 * 5; // start 5 days ago
    for (const msg of [...messagesContentSports].reverse()) {
      time2Ms += 1000 * 60 * 15;
      await ctx.db.insert("messages", {
        teamId: team2Id,
        author: msg.author === "Marko" ? "Miha" : msg.author,
        text: msg.text.replace("fuzbal", "košarka").replace("drezi", "markirke"),
        type: msg.type || "text",
        locationData: msg.locationData as any,
        pollData: msg.pollData as any,
        isPinned: msg.pin,
        reactions: msg.reaction ? [msg.reaction] : [],
      });
    }

     // Inject the active user somewhere
     await ctx.db.insert("messages", {
      teamId: team2Id,
      author: user.name || "Test",
      text: "@Vsi ne pozabite mesečne članarine prinesti prosim! 💸",
      type: "text",
      isPinned: true
    });

    return { success: true };
  }
});

export const getUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  }
});
