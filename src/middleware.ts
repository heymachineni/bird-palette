import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Bird slug URLs only — skip static files like /birds/nesillas-aldabrana.png */
function isBirdSlugPath(pathname: string): boolean {
  if (!/^\/birds\/[^/]+\/?$/.test(pathname)) return false;
  const segment = pathname.replace(/^\/birds\//, "").replace(/\/$/, "");
  return !/\.[a-z0-9]+$/i.test(segment);
}

/** Dev / SSR: serve home at `/birds/{slug}` without generating static bird pages. */
export function middleware(request: NextRequest) {
  if (process.env.STATIC_EXPORT === "true") {
    return NextResponse.next();
  }

  if (isBirdSlugPath(request.nextUrl.pathname)) {
    return NextResponse.rewrite(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/birds/:slug*"],
};
