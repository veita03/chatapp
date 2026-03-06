import { convexAuthNextjsMiddleware } from "@convex-dev/auth/nextjs/server";

const m = convexAuthNextjsMiddleware();
export const proxy = m;
export default m;

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
