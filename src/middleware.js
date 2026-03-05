import { NextResponse } from "next/server";

export function middleware(request) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";
  const pathname = url.pathname;

  // 1️⃣ Redirect www → non-www
  if (hostname === "www.allexamquestions.com") {
    url.hostname = "allexamquestions.com";
    url.protocol = "https:";
    return NextResponse.redirect(url, 301);
  }

  // 2️⃣ Convert only FAQ and Dashboard paths to lowercase
  if (
    pathname === "/FAQ"

  ) {
    console.log("middleware : ")
    url.pathname = pathname.toLowerCase();
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/FAQ",

    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
};