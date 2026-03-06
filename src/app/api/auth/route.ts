import { NextResponse } from "next/server";

// This is a dummy route handler. 
// Vercel's Edge network strictly returns a 404 for POST requests to paths that 
// do not exist physically in the codebase, bypassing the middleware.ts intercept.
// By having this file, Vercel allows the request through, and middleware.ts 
// can successfully proxy the authentication flow to Convex.
export async function POST() {
  return NextResponse.json({ error: "Not intercepted by middleware" }, { status: 500 });
}
