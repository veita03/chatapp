# SPORT2GO - Architecture & Context

## 🏗️ Tech Stack
- **Framework**: Next.js 16.1.6 (App Router)
- **Database/Backend**: Convex (Real-time syncing, Queries, Mutations)
- **Styling**: Tailwind CSS, Vanilla CSS (`globals.css`)
- **Authentication**: `@convex-dev/auth`
- **State Management**: React Hooks + React Context API

## 📂 Key Directories & Files
- `/src/app`: Next.js App Router root.
  - `/teams`: Main teams dashboard (`page.tsx`), team creation (`create/page.tsx`), and team editing (`[id]/edit/page.tsx`).
  - `/chat`: Realtime group chat interface.
  - `/i18n`: Global translations setup. Contains `i18n.ts` and `/locales` (`sl.ts`, `en.ts`, `nl.ts`, `de.ts`, `el.ts`).
- `/src/components`: Reusable UI components.
  - `Header.tsx`: Global navigation and language switcher.
  - `LanguageContext.tsx`: React Context providing reactive language state to the entire app without full page reloads.
- `/convex`: Backend logic.
  - `schema.ts`: Database definitions.
  - `teams.ts`, `users.ts`, `messages.ts`: API endpoints for frontend hooks.

## 🌍 Important Implementations
- **Internationalization**: We recently transitioned from static cookie-based language reading (`Cookies.get('NEXT_LOCALE')`) to a reactive `LanguageProvider`. All texts and even dynamic lists (like the Sports list: Badminton, Basketball, etc.) are now driven by the `<LanguageProvider>` and localized immediately upon selection in the `Header`.
- **Join Codes**: Teams utilize unique join codes. The logic for sharing supports native mobile share APIs as well as WhatsApp, Viber, Messenger, and SMS integrations.
- **Image Cropper**: Custom image upload handling built into the Create/Edit Team pages.
