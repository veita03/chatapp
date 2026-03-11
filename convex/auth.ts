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
        apiKey: process.env.RESEND_API_KEY,
        maxAge: 60 * 15, // 15 minutes
        async generateVerificationToken() {
          return Math.floor(100000 + Math.random() * 900000).toString();
        },
        async sendVerificationRequest({ identifier: email, provider, token, url }) {
          const title = "Sport2GO - Obnova gesla";
          const bodyHtml = `
            <h1 style="font-size: 24px; font-weight: 800; color: #353b41; margin-top: 0; margin-bottom: 16px;">
              Zahteva za obnovo gesla 🔑
            </h1>
            <p style="font-size: 16px; color: #555; line-height: 1.5; margin-bottom: 24px;">
              Sistem je prejel zahtevo za ponastavitev gesla za vaš račun. Prosimo, vnesite spodnjo kodo v aplikacijo:
            </p>
            <div style="background-color: #fffbf2; border: 1px dashed #eeb054; border-radius: 8px; padding: 20px; text-align: center; display: inline-block; margin-bottom: 24px; min-width: 200px;">
              <span style="font-size: 32px; font-weight: 800; letter-spacing: 4px; color: #dba032;">${token}</span>
            </div>
            <p style="font-size: 14px; color: #888; font-style: italic; margin-top: 32px;">
              Če te zahteve niste sprožili vi, lahko to sporočilo varno ignorirate in vaše geslo bo ostalo nespremenjeno.
            </p>
          `;
          const html = generateHtmlTemplate(title, bodyHtml);
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
