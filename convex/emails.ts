import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

// Resend instance initialized with the environment variable from convex dashboard
const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");

const SENDER = "Sport2GO <info@chat.sport2go.app>"; // Must be a verified domain in Resend

// Master template with placeholder for email content
const generateHtmlTemplate = (title: string, bodyHtml: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;800&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f4f6f8;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .wrapper {
      width: 100%;
      background-color: #f4f6f8;
      padding: 40px 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.05);
    }
    .header {
      background: linear-gradient(to right, #F0CA68, #EAA145);
      padding: 24px;
      text-align: center;
    }
    .logo {
      height: 32px;
      max-width: 100%;
      object-fit: contain;
      vertical-align: middle;
      display: inline-block;
      margin-right: 8px;
    }
    .logo-text {
      color: white;
      font-size: 24px;
      font-family: 'Montserrat', sans-serif;
      font-weight: 600;
      vertical-align: middle;
      letter-spacing: 0.5px;
      display: inline-block;
    }
    .content {
      padding: 40px;
      text-align: center;
      color: #333333;
    }
    .footer {
      background-color: #31574d;
      padding: 24px;
      text-align: center;
      color: #a3b8b1;
      font-size: 13px;
    }
    .footer a {
      color: white;
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <!-- Header -->
      <div class="header">
        <img src="https://www.sport2go.app/image/logo.svg" alt="Logo" width="32" height="32" style="width: 32px; height: 32px; vertical-align: middle; filter: brightness(0) invert(1);" />
        <div class="logo-text">
          <span style="font-weight: 400">SPORT</span><span>2GO</span>
        </div>
      </div>
      
      <!-- Body -->
      <div class="content">
        ${bodyHtml}
      </div>

      <!-- Footer -->
      <div class="footer">
        <p style="margin: 0 0 4px 0;">Sport2GO — platforma za organizacijo športa.</p>
        <p style="margin: 0;"><a href="mailto:info@sport2go.si">info@sport2go.si</a></p>
      </div>
    </div>
  </div>
</body>
</html>
`;

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
