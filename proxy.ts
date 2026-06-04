import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);
const isAdminApiRoute = createRouteMatcher(["/api/admin(.*)"]);

export default clerkMiddleware(
  async (auth, req) => {
    const { pathname } = req.nextUrl;

    if (isAdminRoute(req) || isAdminApiRoute(req)) {
      const { userId, sessionClaims } = await auth();

      // ── No session at all → go sign in, then come back ──
      if (!userId) {
        const signInUrl = new URL("/sign-in", req.url);
        signInUrl.searchParams.set("redirect_url", req.url);
        return NextResponse.redirect(signInUrl);
      }

      // ── Check role from publicMetadata ──
      // In Clerk Dashboard → Users → your user → Public Metadata, set:
      // { "role": "admin" }
      // This gets embedded in the JWT automatically — no JWT template needed.
      // Try both paths — covers all Clerk SDK versions
      const claims = sessionClaims as Record<string, unknown> | null;
      const metadata = (claims?.metadata ?? claims?.publicMetadata) as { role?: string } | undefined;
      const role = metadata?.role;

      

      if (role !== "admin") {
        console.warn(
          `[ADMIN BLOCKED] userId="${userId}" role="${role ?? "none"}" tried "${pathname}" at ${new Date().toISOString()}`
        );
        return NextResponse.redirect(new URL("/", req.url));
      }

      // ── Authorised ──
      const response = NextResponse.next();
      response.headers.set("X-Frame-Options", "DENY");
      response.headers.set("X-Content-Type-Options", "nosniff");
      response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
      return response;
    }

    return NextResponse.next();
  },
  {
    signInUrl: "/sign-in",
    signUpUrl: "/sign-up",
  }
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/(.*)",
  ],
};