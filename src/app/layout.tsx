import type { Metadata, Viewport } from "next";
import { Montserrat, Cabin } from "next/font/google";
import "./globals.css";

import ConvexClientProvider from "./ConvexClientProvider";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import { LanguageProvider } from "@/components/LanguageContext";
import PageTitleUpdater from "@/components/PageTitleUpdater";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const cabin = Cabin({
  variable: "--font-cabin",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sport2GO",
  description: "Sport2GO - Manj stresa, več časa za igro",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="en">
        <body
          className={`${montserrat.variable} ${cabin.variable} font-sans antialiased`}
        >
          <LanguageProvider>
            <PageTitleUpdater />
            <ConvexClientProvider>
              {children}
            </ConvexClientProvider>
          </LanguageProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
