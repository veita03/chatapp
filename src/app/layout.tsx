import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";

import ConvexClientProvider from "./ConvexClientProvider";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SPORT2GO Chat",
  description: "SPORT2GO Realtime Group Chat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} font-sans antialiased`}
      >
        <ConvexClientProvider>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
