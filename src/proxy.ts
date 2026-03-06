import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";
import { type NextRequest } from "next/server";

const m = convexAuthNextjsMiddleware(undefined, {
  shouldHandleCode: async (request: NextRequest) => {
    // Only intercept code if it's NOT the OAuth callback (which goes to Convex HTTP)
    if (request.nextUrl.pathname.startsWith("/api/auth/callback")) {
      return false;
    }
    return true;
  },
});
export const proxy = m;
export default m;

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
