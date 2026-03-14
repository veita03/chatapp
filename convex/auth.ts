import { convexAuth } from "@convex-dev/auth/server";
import Google from "@auth/core/providers/google";
import { Password } from "@convex-dev/auth/providers/Password";
import { Email } from "@convex-dev/auth/providers/Email";
import { Resend } from "resend";
import { generateHtmlTemplate } from "./emailTemplates";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    Google({
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
      // Force account selection on every login to prevent auto-skipping
      authorization: { params: { prompt: "select_account" } }
    }),
    Password({
      reset: Email({
        id: "resend-otp-reset",
        apiKey: process.env.RESEND_API_KEY || "dummy_key",
        async generateVerificationToken() {
          return Math.floor(100000 + Math.random() * 900000).toString();
        },
        async sendVerificationRequest({ identifier: email, provider, token, url }) {
          const u = new URL(url);
          const lang = u.searchParams.get("lang") || "sl";
          
          const translations: Record<string, any> = {
            sl: { subject: "Sport2GO - Obnova gesla", title: "Zahteva za obnovo gesla 🔑", body: "Sistem je prejel zahtevo za ponastavitev gesla za vaš račun. Prosimo, vnesite spodnjo kodo v aplikacijo:", footer: "Če te zahteve niste sprožili vi, lahko to sporočilo varno ignorirate in vaše geslo bo ostalo nespremenjeno." , platformTag: "Sport2GO — platforma za organizacijo športa." },
            en: { subject: "Sport2GO - Password Reset", title: "Password Reset Request 🔑", body: "We received a request to reset the password for your account. Please enter the code below in the application:", footer: "If you did not initiate this request, you can safely ignore this message and your password will remain unchanged." , platformTag: "Sport2GO — sports organization platform." },
            de: { subject: "Sport2GO - Passwort zurücksetzen", title: "Anfrage zum Zurücksetzen des Passworts 🔑", body: "Wir haben eine Anfrage zum Zurücksetzen des Passworts für Ihr Konto erhalten. Bitte geben Sie den folgenden Code in der App ein:", footer: "Wenn Sie diese Anfrage nicht initiiert haben, können Sie diese Nachricht sicher ignorieren und Ihr Passwort bleibt unverändert." , platformTag: "Sport2GO — Sportorganisationsplattform." },
            hr: { subject: "Sport2GO - Ponovno postavljanje lozinke", title: "Zahtjev za ponovno postavljanje lozinke 🔑", body: "Dobili smo zahtjev za ponovno postavljanje lozinke za vaš račun. Molimo unesite donji kod u aplikaciju:", footer: "Ako niste pokrenuli ovaj zahtjev, možete sigurno zanemariti ovu poruku i vaša će lozinka ostati nepromijenjena." , platformTag: "Sport2GO — platforma za organizaciju sporta." },
            sr: { subject: "Sport2GO - Ponovno postavljanje lozinke", title: "Zahtev za ponovno postavljanje lozinke 🔑", body: "Dobili smo zahtev za ponovno postavljanje lozinke za vaš nalog. Molimo unesite donji kod u aplikaciju:", footer: "Ako niste pokrenuli ovaj zahtev, možete sigurno zanemariti ovu poruku i vaša će lozinka ostati nepromenjena." , platformTag: "Sport2GO — platforma za organizaciju sporta." },
            it: { subject: "Sport2GO - Reimpostazione della password", title: "Richiesta di reimpostazione della password 🔑", body: "Abbiamo ricevuto una richiesta per reimpostare la password del tuo account. Inserisci il codice sottostante nell'applicazione:", footer: "Se non hai avviato questa richiesta, puoi tranquillamente ignorare questo messaggio e la tua password rimarrà invariata." , platformTag: "Sport2GO — piattaforma per l'organizzazione sportiva." },
            fr: { subject: "Sport2GO - Réinitialisation du mot de passe", title: "Demande de réinitialisation du mot de passe 🔑", body: "Nous avons reçu une demande de réinitialisation du mot de passe de votre compte. Veuillez entrer le code ci-dessous dans l'application :", footer: "Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer ce message en toute sécurité et votre mot de passe restera inchangé." , platformTag: "Sport2GO — plateforme d'organisation sportive." },
            es: { subject: "Sport2GO - Restablecimiento de contraseña", title: "Solicitud de restablecimiento de contraseña 🔑", body: "Hemos recibido una solicitud para restablecer la contraseña de su cuenta. Ingrese el código a continuación en la aplicación:", footer: "Si no inició esta solicitud, puede ignorar este mensaje de forma segura y su contraseña permanecerá sin cambios." , platformTag: "Sport2GO — plataforma de organización deportiva." },
            mx: { subject: "Sport2GO - Restablecimiento de contraseña", title: "Solicitud de restablecimiento de contraseña 🔑", body: "Hemos recibido una solicitud para restablecer la contraseña de su cuenta. Ingrese el código a continuación en la aplicación:", footer: "Si no inició esta solicitud, puede ignorar este mensaje de forma segura y su contraseña permanecerá sin cambios." , platformTag: "Sport2GO — plataforma de organización deportiva." },
            ar: { subject: "Sport2GO - إعادة تعيين كلمة المرور", title: "طلب إعادة تعيين كلمة المرور 🔑", body: "لقد تلقينا طلبًا لإعادة تعيين كلمة المرور لحسابك. يرجى إدخال الرمز أدناه في التطبيق:", footer: "إذا لم تقم ببدء هذا الطلب، يمكنك تجاهل هذه الرسالة بأمان وستبقى كلمة المرور الخاصة بك دون تغيير." , platformTag: "Sport2GO — منصة تنظيم الرياضة." },
            nl: { subject: "Sport2GO - Wachtwoord resetten", title: "Verzoek om wachtwoord te resetten 🔑", body: "We hebben een verzoek ontvangen om het wachtwoord voor uw account te resetten. Voer de onderstaande code in de applicatie in:", footer: "Als u dit verzoek niet heeft gestart, kunt u dit bericht veilig negeren en blijft uw wachtwoord ongewijzigd." , platformTag: "Sport2GO — platform voor sportorganisatie." },
            tr: { subject: "Sport2GO - Şifre Sıfırlama", title: "Şifre Sıfırlama İsteği 🔑", body: "Hesabınızın şifresini sıfırlama isteği aldık. Lütfen aşağıdaki kodu uygulamaya girin:", footer: "Bu isteği siz başlatmadıysanız, bu mesajı güvenle yoksayabilirsiniz ve şifreniz değişmeden kalacaktır." , platformTag: "Sport2GO — spor organizasyon platformu." },
            el: { subject: "Sport2GO - Επαναφορά Κωδικού", title: "Αίτημα επαναφοράς κωδικού πρόσβασης 🔑", body: "Λάβαμε ένα αίτημα για την επαναφορά του κωδικού πρόσβασης για τον λογαριασμό σας. Εισαγάγετε τον παρακάτω κωδικό στην εφαρμογή:", footer: "Εάν δεν ξεκινήσατε αυτό το αίτημα, μπορείτε να αγνοήσετε με ασφάλεια αυτό το μήνυμα και ο κωδικός πρόσβασής σας θα παραμείνει αμετάβλητος." , platformTag: "Sport2GO — πλατφόρμα οργάνωσης αθλημάτων." },
            us: { subject: "Sport2GO - Password Reset", title: "Password Reset Request 🔑", body: "We received a request to reset the password for your account. Please enter the code below in the application:", footer: "If you did not initiate this request, you can safely ignore this message and your password will remain unchanged." , platformTag: "Sport2GO — sports organization platform." },
            at: { subject: "Sport2GO - Passwort zurücksetzen", title: "Anfrage zum Zurücksetzen des Passworts 🔑", body: "Wir haben eine Anfrage zum Zurücksetzen des Passworts für Ihr Konto erhalten. Bitte geben Sie den folgenden Code in der App ein:", footer: "Wenn Sie diese Anfrage nicht initiiert haben, können Sie diese Nachricht sicher ignorieren und Ihr Passwort bleibt unverändert." , platformTag: "Sport2GO — Sportorganisationsplattform." }
          };

          const t = translations[lang] || translations["en"];
          const title = t.subject;
          const bodyHtml = `
            <h1 style="font-size: 24px; font-weight: 800; color: #353b41; margin-top: 0; margin-bottom: 16px;">
              ${t.title}
            </h1>
            <p style="font-size: 16px; color: #555; line-height: 1.5; margin-bottom: 24px;">
              ${t.body}
            </p>
            <div style="background-color: #fffbf2; border: 1px dashed #eeb054; border-radius: 8px; padding: 20px; text-align: center; display: inline-block; margin-bottom: 24px; min-width: 200px;">
              <span style="font-size: 32px; font-weight: 800; letter-spacing: 4px; color: #dba032;">${token}</span>
            </div>
            <p style="font-size: 14px; color: #888; font-style: italic; margin-top: 32px;">
              ${t.footer}
            </p>
          `;
          const html = generateHtmlTemplate(title, bodyHtml, t.platformTag);
          const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");
          const SENDER = "Sport2GO <info@chat.sport2go.app>";
          
          console.log("Sending password reset email via Resend to:", email);
          await resend.emails.send({
            from: SENDER,
            to: email,
            subject: title,
            html,
          });
        }
      })
    }),
  ],
  callbacks: {
    async createOrUpdateUser(ctx, args) {
      if (args.existingUserId) {
        return args.existingUserId;
      }
      
      // Filter out undefined values that crash the schema
      const userData: any = {
        email: args.profile.email,
        isProfileComplete: false,
      };
      
      return await ctx.db.insert("users", userData);
    },
  },
});
