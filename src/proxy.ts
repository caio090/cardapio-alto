import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  ATTRIBUTION_COOKIE,
  ATTRIBUTION_MAX_AGE_SECONDS,
  extractAttributionFromSearchParams,
} from "@/lib/attribution";
import { ADMIN_SESSION_COOKIE, isValidAdminSessionToken } from "@/lib/admin/session";

// Next.js 16 renamed `middleware.ts` to `proxy.ts` — this refreshes the
// Supabase session on every request, captures first-touch UTM/gclid/fbclid
// attribution into a first-party cookie, gates /app/* behind Supabase auth,
// and gates /admin/* behind the separate admin session cookie (see
// src/lib/admin/session.ts — unrelated to Supabase auth, its own password).
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAppRoute = pathname.startsWith("/app");
  const isLoginRoute = pathname === "/entrar";
  const isAdminProtectedRoute = pathname.startsWith("/admin/");

  let finalResponse = response;

  if (isAppRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/entrar";
    url.searchParams.set("next", pathname);
    finalResponse = NextResponse.redirect(url);
  } else if (isLoginRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/app";
    url.searchParams.delete("next");
    finalResponse = NextResponse.redirect(url);
  } else if (isAdminProtectedRoute) {
    const hasValidSession = await isValidAdminSessionToken(
      request.cookies.get(ADMIN_SESSION_COOKIE)?.value
    );
    if (!hasValidSession) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin";
      url.search = "";
      finalResponse = NextResponse.redirect(url);
    }
  }

  // First-touch attribution, applied last so it survives whichever response
  // object ends up being returned (plain pass-through or a redirect). Only
  // written once per visitor — an internal navigation must not overwrite
  // the campaign that actually brought them in.
  const utmParams = extractAttributionFromSearchParams(request.nextUrl.searchParams);
  const hasUtmParams = Object.keys(utmParams).length > 0;
  const alreadyAttributed = request.cookies.has(ATTRIBUTION_COOKIE);

  if (hasUtmParams && !alreadyAttributed) {
    const attribution = {
      ...utmParams,
      landing_page: pathname + request.nextUrl.search,
      referrer: request.headers.get("referer") ?? undefined,
    };
    finalResponse.cookies.set(ATTRIBUTION_COOKIE, JSON.stringify(attribution), {
      maxAge: ATTRIBUTION_MAX_AGE_SECONDS,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }

  return finalResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|logo-badge.png|logo-horizontal.png).*)"],
};
