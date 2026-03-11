"use client";

import { ReactNode, useEffect } from "react";
import { ConvexReactClient } from "convex/react";
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { useAuthActions } from "@convex-dev/auth/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

function SessionManager({ children }: { children: ReactNode }) {
  const { signOut } = useAuthActions();

  useEffect(() => {
    // Run once on client mount
    if (typeof window !== "undefined") {
      const isEphemeral = localStorage.getItem("ephemeralLogin") === "true";
      const sessionActive = sessionStorage.getItem("sessionActive") === "true";

      if (isEphemeral && !sessionActive) {
        // Browser was closed and reopened: expire the session
        signOut().catch(console.error);
        localStorage.removeItem("ephemeralLogin");
      }
      // Mark current tab session as active
      sessionStorage.setItem("sessionActive", "true");
    }
  }, [signOut]);

  return <>{children}</>;
}

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ConvexAuthNextjsProvider client={convex}>
      <SessionManager>{children}</SessionManager>
    </ConvexAuthNextjsProvider>
  );
}
