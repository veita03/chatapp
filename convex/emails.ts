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
  },
  handler: async (ctx, args) => {
    if (!process.env.RESEND_API_KEY) {
      console.warn("Skipping email send: RESEND_API_KEY is not defined");
      return { success: false, reason: "No API Key" };
    }

    const title = "Sport2GO - Potrditvena koda za dokončanje registracije";
    const bodyHtml = `
      <h1 style="font-size: 24px; font-weight: 800; color: #353b41; margin-top: 0; margin-bottom: 16px;">
        Dobrodošli na platformi! 👋
      </h1>
      <p style="font-size: 16px; color: #555; line-height: 1.5; margin-bottom: 24px;">
        Za nadaljevanje registracije in potrditev vašega e-poštnega naslova, prosimo vnesite spodnjo kodo v aplikacijo:
      </p>
      <div style="background-color: #fffbf2; border: 1px dashed #eeb054; border-radius: 8px; padding: 20px; text-align: center; display: inline-block; margin-bottom: 24px; min-width: 200px;">
        <span style="font-size: 32px; font-weight: 800; letter-spacing: 4px; color: #dba032;">${args.code}</span>
      </div>
      <div>
        <a href="https://chat.sport2go.app/profile" style="color: #dba032; font-weight: 600; text-decoration: underline; font-size: 16px;">
          Dokončaj registracijo &gt;
        </a>
      </div>
      <p style="font-size: 14px; color: #888; font-style: italic; margin-top: 32px;">
        Če tega niste zahtevali, prosimo ignorirajte to sporočilo.
      </p>
    `;

    const html = generateHtmlTemplate(title, bodyHtml);

    try {
      console.log("Sending verification email via Resend to:", args.email);
      const data = await resend.emails.send({
        from: SENDER,
        to: args.email,
        subject: title,
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
  },
  handler: async (ctx, args) => {
    if (!process.env.RESEND_API_KEY) {
      return { success: false, reason: "No API Key" };
    }

    const title = "Uspešna registracija";
    const bodyHtml = `
      <h1 style="font-size: 26px; font-weight: 800; color: #353b41; margin-top: 0; margin-bottom: 16px;">
        Hej ${args.name}! 🏆
      </h1>
      <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 24px;">
        Tvoj profil je sedaj potrjen. Dobrodošel v <strong>Sport2GO</strong>, 
        aplikaciji, ki organizira tvoj športni teden, da se ti lahko osredotočiš le na igro!
      </p>
      <img src="https://www.sport2go.app/image/demo/intro3.png" alt="Sport2GO Illustration" style="max-width: 80%; border-radius: 12px; margin-bottom: 24px;" />
      <p style="font-size: 16px; color: #555; line-height: 1.6;">
        Tvoj prvi korak: ustvari ali se pridruži obstoječi ekipi tako, da vneseš kodo na glavni nadzorni plošči.
      </p>
      <div style="margin-top: 32px;">
        <a href="https://chat.sport2go.app" style="background-color: #5BA582; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 15px; display: inline-block;">
          Odpri Aplikacijo
        </a>
      </div>
    `;

    const html = generateHtmlTemplate(title, bodyHtml);

    try {
      console.log("Sending welcome email via Resend to:", args.email);
      const data = await resend.emails.send({
        from: SENDER,
        to: args.email,
        subject: "Dobrodošli v Sport2GO 🚀",
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
