import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

// Resend instance initialized with the environment variable from convex dashboard
const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");

const SENDER = "Sport2GO <info@chat.sport2go.app>"; // Must be a verified domain in Resend

import { generateHtmlTemplate } from "./emailTemplates";

export const sendVerificationEmail = action({
  args: {
    email: v.string(),
    code: v.string(),
    lang: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    if (!process.env.RESEND_API_KEY) {
      console.warn("Skipping email send: RESEND_API_KEY is not defined");
      return { success: false, reason: "No API Key" };
    }

    const currentLang = args.lang || "sl";

    const translations: Record<string, any> = {
      sl: {
        subject: "Sport2GO - Potrditvena koda za dokončanje registracije",
        title: "Dobrodošli na platformi! 👋",
        body: "Za nadaljevanje registracije in potrditev vašega e-poštnega naslova, prosimo vnesite spodnjo kodo v aplikacijo:",
        btn: "Dokončaj registracijo >",
        footer: "Če tega niste zahtevali, prosimo ignorirajte to sporočilo.",
        platformTag: "Sport2GO — platforma za organizacijo športa."
      },
      en: {
        subject: "Sport2GO - Verification code to complete registration",
        title: "Welcome to the platform! 👋",
        body: "To continue registration and confirm your email address, please enter the code below in the application:",
        btn: "Complete registration >",
        footer: "If you did not request this, please ignore this message.",
        platformTag: "Sport2GO — sports organization platform."
      },
      de: {
        subject: "Sport2GO - Bestätigungscode zum Abschluss der Registrierung",
        title: "Willkommen auf der Plattform! 👋",
        body: "Um die Registrierung fortzusetzen und Ihre E-Mail-Adresse zu bestätigen, geben Sie bitte den folgenden Code in der App ein:",
        btn: "Registrierung abschließen >",
        footer: "Wenn Sie dies nicht angefordert haben, ignorieren Sie bitte diese Nachricht.",
        platformTag: "Sport2GO — Sportorganisationsplattform."
      },
      hr: {
        subject: "Sport2GO - Potvrdni kod za dovršetak registracije",
        title: "Dobrodošli na platformu! 👋",
        body: "Za nastavak registracije i potvrdu vaše e-mail adrese, molimo unesite donji kod u aplikaciju:",
        btn: "Dovrši registraciju >",
        footer: "Ako ovo niste zatražili, molimo zanemarite ovu poruku.",
        platformTag: "Sport2GO — platforma za organizaciju sporta."
      },
      sr: {
        subject: "Sport2GO - Potvrdni kod za završetak registracije",
        title: "Dobrodošli na platformu! 👋",
        body: "Za nastavak registracije i potvrdu vaše e-mail adrese, molimo unesite donji kod u aplikaciju:",
        btn: "Završi registraciju >",
        footer: "Ako ovo niste zatražili, molimo zanemarite ovu poruku.",
        platformTag: "Sport2GO — platforma za organizaciju sporta."
      },
      it: {
        subject: "Sport2GO - Codice di verifica per completare la registrazione",
        title: "Benvenuto sulla piattaforma! 👋",
        body: "Per continuare la registrazione e confermare il tuo indirizzo email, inserisci il codice sottostante nell'applicazione:",
        btn: "Completa la registrazione >",
        footer: "Se non hai richiesto questo, ti preghiamo di ignorare questo messaggio.",
        platformTag: "Sport2GO — piattaforma per l'organizzazione sportiva."
      },
      fr: {
        subject: "Sport2GO - Code de vérification pour terminer l'inscription",
        title: "Bienvenue sur la plateforme ! 👋",
        body: "Pour poursuivre l'inscription et confirmer votre adresse e-mail, veuillez entrer le code ci-dessous dans l'application :",
        btn: "Terminer l'inscription >",
        footer: "Si vous n'avez pas demandé cela, veuillez ignorer ce message.",
        platformTag: "Sport2GO — plateforme d'organisation sportive."
      },
      es: {
        subject: "Sport2GO - Código de verificación para completar el registro",
        title: "¡Bienvenido a la plataforma! 👋",
        body: "Para continuar con el registro y confirmar su dirección de correo electrónico, ingrese el código a continuación en la aplicación:",
        btn: "Completar el registro >",
        footer: "Si no solicitó esto, por favor ignore este mensaje.",
        platformTag: "Sport2GO — plataforma de organización deportiva."
      },
      mx: {
        subject: "Sport2GO - Código de verificación para completar el registro",
        title: "¡Bienvenido a la plataforma! 👋",
        body: "Para continuar con el registro y confirmar su dirección de correo electrónico, ingrese el código a continuación en la aplicación:",
        btn: "Completar el registro >",
        footer: "Si no solicitó esto, por favor ignore este mensaje.",
        platformTag: "Sport2GO — plataforma de organización deportiva."
      },
      ar: {
        subject: "Sport2GO - رمز التحقق لإكمال التسجيل",
        title: "مرحبًا بك في المنصة! 👋",
        body: "لمواصلة التسجيل وتأكيد عنوان بريدك الإلكتروني، يرجى إدخال الرمز أدناه في التطبيق:",
        btn: "إكمال التسجيل >",
        footer: "إذا لم تطلب هذا، يرجى تجاهل هذه الرسالة.",
        platformTag: "Sport2GO — منصة تنظيم الرياضة."
      },
      nl: {
        subject: "Sport2GO - Verificatiecode om registratie te voltooien",
        title: "Welkom op het platform! 👋",
        body: "Om de registratie voort te zetten en uw e-mailadres te bevestigen, voert u de onderstaande code in de applicatie in:",
        btn: "Voltooi registratie >",
        footer: "Als u dit niet heeft aangevraagd, negeer dan dit bericht.",
        platformTag: "Sport2GO — platform voor sportorganisatie."
      },
      tr: {
        subject: "Sport2GO - Kaydı tamamlamak için doğrulama kodu",
        title: "Platforma hoş geldiniz! 👋",
        body: "Kayda devam etmek ve e-posta adresinizi onaylamak için lütfen aşağıdaki kodu uygulamaya girin:",
        btn: "Kaydı tamamla >",
        footer: "Bunu siz talep etmediyseniz, lütfen bu mesajı dikkate almayın.",
        platformTag: "Sport2GO — spor organizasyon platformu."
      },
      el: {
        subject: "Sport2GO - Κωδικός επαλήθευσης για την ολοκλήρωση της εγγραφής",
        title: "Καλώς ήρθατε στην πλατφόρμα! 👋",
        body: "Για να συνεχίσετε την εγγραφή και να επιβεβαιώσετε τη διεύθυνση email σας, εισαγάγετε τον παρακάτω κωδικό στην εφαρμογή:",
        btn: "Ολοκλήρωση εγγραφής >",
        footer: "Εάν δεν το ζητήσατε αυτό, παρακαλούμε αγνοήστε αυτό το μήνυμα.",
        platformTag: "Sport2GO — πλατφόρμα οργάνωσης αθλημάτων."
      },
      us: {
        subject: "Sport2GO - Verification code to complete registration",
        title: "Welcome to the platform! 👋",
        body: "To continue registration and confirm your email address, please enter the code below in the application:",
        btn: "Complete registration >",
        footer: "If you did not request this, please ignore this message.",
        platformTag: "Sport2GO — sports organization platform."
      },
      at: {
        subject: "Sport2GO - Bestätigungscode zum Abschluss der Registrierung",
        title: "Willkommen auf der Plattform! 👋",
        body: "Um die Registrierung fortzusetzen und Ihre E-Mail-Adresse zu bestätigen, geben Sie bitte den folgenden Code in der App ein:",
        btn: "Registrierung abschließen >",
        footer: "Wenn Sie dies nicht angefordert haben, ignorieren Sie bitte diese Nachricht.",
        platformTag: "Sport2GO — Sportorganisationsplattform."
      }
    };

    const t = translations[currentLang] || translations["en"];
    const title = t.title;
    const bodyHtml = `
      <h1 style="font-size: 24px; font-weight: 800; color: #353b41; margin-top: 0; margin-bottom: 16px;">
        ${t.title}
      </h1>
      <p style="font-size: 16px; color: #555; line-height: 1.5; margin-bottom: 24px;">
        ${t.body}
      </p>
      <div style="background-color: #fffbf2; border: 1px dashed #eeb054; border-radius: 8px; padding: 20px; text-align: center; display: inline-block; margin-bottom: 24px; min-width: 200px;">
        <span style="font-size: 32px; font-weight: 800; letter-spacing: 4px; color: #dba032;">${args.code}</span>
      </div>
      <div>
        <a href="https://chat.sport2go.app/profile" style="color: #dba032; font-weight: 600; text-decoration: underline; font-size: 16px;">
          ${t.btn}
        </a>
      </div>
      <p style="font-size: 14px; color: #888; font-style: italic; margin-top: 32px;">
        ${t.footer}
      </p>
    `;

    const html = generateHtmlTemplate(title, bodyHtml, t.platformTag);

    try {
      console.log("Sending verification email via Resend to:", args.email, "Language:", currentLang);
      const data = await resend.emails.send({
        from: SENDER,
        to: args.email,
        subject: t.subject,
        html: html,
      });
      console.log("Resend response:", data);
      return { success: true };
    } catch (error) {
      console.error("Failed to send verification email. Details:", error);
      return { success: false };
    }
  },
});

export const sendWelcomeEmail = action({
  args: {
    email: v.string(),
    name: v.string(),
    lang: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    if (!process.env.RESEND_API_KEY) {
      return { success: false, reason: "No API Key" };
    }

    const currentLang = args.lang || "sl";
    
    const translations: Record<string, any> = {
      sl: {
        title: "Uspešna registracija",
        subject: "Dobrodošli v Sport2GO 🚀",
        greeting: `Hej ${args.name}! 🏆`,
        body1: `Tvoj profil je sedaj potrjen. Dobrodošel v <strong>Sport2GO</strong>, 
        aplikaciji, ki organizira tvoj športni teden, da se ti lahko osredotočiš le na igro!`,
        body2: `Tvoj prvi korak: ustvari ali se pridruži obstoječi ekipi tako, da vneseš kodo na glavni nadzorni plošči.`,
        btn: "Odpri Aplikacijo",
        platformTag: "Sport2GO — platforma za organizacijo športa."
      },
      en: {
        title: "Successful Registration",
        subject: "Welcome to Sport2GO 🚀",
        greeting: `Hey ${args.name}! 🏆`,
        body1: `Your profile is now confirmed. Welcome to <strong>Sport2GO</strong>, the app that organizes your sports week so you can focus only on the game!`,
        body2: `Your first step: create or join an existing team by entering the code on the main dashboard.`,
        btn: "Open Application",
        platformTag: "Sport2GO — sports organization platform."
      },
      de: {
        title: "Erfolgreiche Registrierung",
        subject: "Willkommen bei Sport2GO 🚀",
        greeting: `Hey ${args.name}! 🏆`,
        body1: `Dein Profil ist jetzt bestätigt. Willkommen bei <strong>Sport2GO</strong>, der App, die deine Sportwoche organisiert, damit du dich nur auf das Spiel konzentrieren kannst!`,
        body2: `Dein erster Schritt: Erstelle oder trete einem bestehenden Team bei, indem du den Code im Haupt-Dashboard eingibst.`,
        btn: "App öffnen",
        platformTag: "Sport2GO — Sportorganisationsplattform."
      },
      hr: {
        title: "Uspješna registracija",
        subject: "Dobrodošli u Sport2GO 🚀",
        greeting: `Hej ${args.name}! 🏆`,
        body1: `Tvoj profil je sada potvrđen. Dobrodošao u <strong>Sport2GO</strong>, aplikaciju koja organizira tvoj sportski tjedan kako bi se mogao usredotočiti samo na igru!`,
        body2: `Tvoj prvi korak: izradi ili se pridruži postojećoj ekipi unosom koda na glavnoj nadzornoj ploči.`,
        btn: "Otvori Aplikaciju",
        platformTag: "Sport2GO — platforma za organizaciju sporta."
      },
      sr: {
        title: "Uspešna registracija",
        subject: "Dobrodošli u Sport2GO 🚀",
        greeting: `Hej ${args.name}! 🏆`,
        body1: `Tvoj profil je sada potvrđen. Dobrodošao u <strong>Sport2GO</strong>, aplikaciju koja organizuje tvoju sportsku nedelju kako bi mogao da se fokusiraš samo na igru!`,
        body2: `Tvoj prvi korak: napravi ili se pridruži postojećem timu unosom koda na glavnoj kontrolnoj tabli.`,
        btn: "Otvori Aplikaciju",
        platformTag: "Sport2GO — platforma za organizaciju sporta."
      },
      it: {
        title: "Registrazione avvenuta",
        subject: "Benvenuto in Sport2GO 🚀",
        greeting: `Ehi ${args.name}! 🏆`,
        body1: `Il tuo profilo è confermato. Benvenuto in <strong>Sport2GO</strong>, l'app che organizza la tua settimana sportiva così puoi concentrarti solo sul gioco!`,
        body2: `Il tuo primo passo: crea o unisciti a una squadra esistente inserendo il codice nella dashboard principale.`,
        btn: "Apri l'app",
        platformTag: "Sport2GO — piattaforma per l'organizzazione sportiva."
      },
      fr: {
        title: "Inscription réussie",
        subject: "Bienvenue sur Sport2GO 🚀",
        greeting: `Salut ${args.name}! 🏆`,
        body1: `Votre profil est confirmé. Bienvenue sur <strong>Sport2GO</strong>, l'application qui organise votre semaine sportive pour que vous puissiez vous concentrer sur le jeu !`,
        body2: `Votre première étape : créez ou rejoignez une équipe existante en entrant le code sur le tableau de bord principal.`,
        btn: "Ouvrir l'application",
        platformTag: "Sport2GO — plateforme d'organisation sportive."
      },
      es: {
        title: "Registro exitoso",
        subject: "Bienvenido a Sport2GO 🚀",
        greeting: `¡Hola ${args.name}! 🏆`,
        body1: `Tu perfil está confirmado. ¡Bienvenido a <strong>Sport2GO</strong>, la aplicación que organiza tu semana deportiva para que solo te concentres en el juego!`,
        body2: `Tu primer paso: crea o únete a un equipo existente ingresando un código en el panel principal.`,
        btn: "Abrir la aplicación",
        platformTag: "Sport2GO — plataforma de organización deportiva."
      },
      mx: {
        title: "Registro exitoso",
        subject: "Bienvenido a Sport2GO 🚀",
        greeting: `¡Hola ${args.name}! 🏆`,
        body1: `Tu perfil está confirmado. ¡Bienvenido a <strong>Sport2GO</strong>, la aplicación que organiza tu semana deportiva para que solo te enfoques en el juego!`,
        body2: `Tu primer evento: crea o únete a un equipo ingresando el código en tu panel.`,
        btn: "Abre la aplicación",
        platformTag: "Sport2GO — plataforma de organización deportiva."
      },
      ar: {
        title: "Registro exitoso",
        subject: "Bienvenido a Sport2GO 🚀",
        greeting: `¡Hola ${args.name}! 🏆`,
        body1: `Tu perfil está confirmado. ¡Bienvenido a <strong>Sport2GO</strong>! Concéntrate en el juego, que nosotros organizamos tu semana.`,
        body2: `Tu primer paso: crea o únete a un equipo desde el panel principal.`,
        btn: "Abrir la app",
        platformTag: "Sport2GO — منصة تنظيم الرياضة."
      },
      nl: {
        title: "Succesvolle registratie",
        subject: "Welkom bij Sport2GO 🚀",
        greeting: `Hé ${args.name}! 🏆`,
        body1: `Je profiel is bevestigd. Welkom bij <strong>Sport2GO</strong>, de app die je sportweek organiseert!`,
        body2: `Je eerste stap: maak een nieuw team aan of word er lid van op het dashboard.`,
        btn: "Open App",
        platformTag: "Sport2GO — platform voor sportorganisatie."
      },
      tr: {
        title: "Başarılı Kayıt",
        subject: "Sport2GO'ya Hoş Geldiniz 🚀",
        greeting: `Merhaba ${args.name}! 🏆`,
        body1: `Profiliniz onaylandı. Sadece oyuna odaklanmanızı sağlayan <strong>Sport2GO</strong> uygulamasına hoş geldiniz!`,
        body2: `İlk adımınız: yeni bir takım oluşturun veya var olan bir takıma katılın.`,
        btn: "Uygulamayı Aç",
        platformTag: "Sport2GO — spor organizasyon platformu."
      },
      el: {
        title: "Επιτυχής Εγγραφή",
        subject: "Καλώς ήρθατε στο Sport2GO 🚀",
        greeting: `Γεια σου ${args.name}! 🏆`,
        body1: `Το προφίλ σας επιβεβαιώθηκε. Καλώς ήρθατε στο <strong>Sport2GO</strong>!`,
        body2: `Το πρώτο σας βήμα: δημιουργήστε ή γίνετε μέλος σε μια ομάδα από τον πίνακα ελέγχου.`,
        btn: "Άνοιγμα Εφαρμογής",
        platformTag: "Sport2GO — πλατφόρμα οργάνωσης αθλημάτων."
      },
      us: {
        title: "Successful Registration",
        subject: "Welcome to Sport2GO 🚀",
        greeting: `Hey ${args.name}! 🏆`,
        body1: `Your profile is now confirmed. Welcome to <strong>Sport2GO</strong>, the app that organizes your sports week!`,
        body2: `Your first step: create or join an existing team on the dashboard.`,
        btn: "Open App",
        platformTag: "Sport2GO — sports organization platform."
      },
      at: {
        title: "Erfolgreiche Registrierung",
        subject: "Willkommen bei Sport2GO 🚀",
        greeting: `Hey ${args.name}! 🏆`,
        body1: `Dein Profil ist bestätigt. Willkommen bei <strong>Sport2GO</strong>!`,
        body2: `Dein erster Schritt: Erstelle oder trete einem bestehenden Team auf dem Dashboard bei.`,
        btn: "App öffnen",
        platformTag: "Sport2GO — Sportorganisationsplattform."
      }
    };
    
    const t = translations[currentLang] || translations["en"];
    const title = t.title;

    const bodyHtml = `
      <h1 style="font-size: 26px; font-weight: 800; color: #353b41; margin-top: 0; margin-bottom: 16px;">
        ${t.greeting}
      </h1>
      <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 24px;">
        ${t.body1}
      </p>
      <img src="https://www.sport2go.app/image/demo/intro3.png" alt="Sport2GO Illustration" style="max-width: 80%; border-radius: 12px; margin-bottom: 24px;" />
      <p style="font-size: 16px; color: #555; line-height: 1.6;">
        ${t.body2}
      </p>
      <div style="margin-top: 32px;">
        <a href="https://chat.sport2go.app" style="background-color: #5BA582; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px; display: inline-block;">
          ${t.btn}
        </a>
      </div>
    `;

    const html = generateHtmlTemplate(title, bodyHtml, t.platformTag);

    try {
      console.log("Sending welcome email via Resend to:", args.email, "Language:", currentLang);
      const data = await resend.emails.send({
        from: SENDER,
        to: args.email,
        subject: t.subject,
        html: html,
      });
      console.log("Resend welcome response:", data);
      return { success: true };
    } catch (error) {
      console.error("Failed to send welcome email. Details:", error);
      return { success: false };
    }
  },
});
