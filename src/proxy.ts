import { NextRequest, NextResponse, userAgent } from "next/server";

const ADMIN_PREFIX = '/mcgh-admin-control';
const ADMIN_SIGNIN = `${ADMIN_PREFIX}/signin`;

export const config = {
  matcher: [
    '/mcgh-admin-control',
    '/mcgh-admin-control/:path*',
    '/admin',
    '/admin/:path*',
  ],
};

const HIDDEN_404_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>404: This page could not be found.</title>
<style>
  * { box-sizing: border-box; }
  body {
    margin: 0; color: #111827; background: #f9fafb;
    font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial;
    min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 2rem;
  }
  @media (prefers-color-scheme: dark) {
    body { background: #030712; color: #e5e7eb; }
    .card { background: #111827 !important; border-color: #1f2937 !important; }
    .muted { color: #9ca3af !important; }
  }
  .card {
    background: #ffffff; border: 1px solid #e5e7eb;
    border-radius: 16px; padding: 3rem 2.5rem; max-width: 520px; width: 100%; box-shadow: 0 1px 3px rgba(0,0,0,.05);
  }
  h1 { margin: 0 0 .5rem; font-size: 2.25rem; font-weight: 800; letter-spacing: -.025em; }
  .code { display: inline-block; padding: .125rem .5rem; font-size: .875rem; font-weight: 600; border-radius: 9999px; background: #f3f4f6; color: #111827; margin-right: .5rem; margin-bottom: .75rem; border: 1px solid #e5e7eb; }
  @media (prefers-color-scheme: dark) {
    .code { background: #1f2937; color: #f9fafb; border-color: #374151; }
  }
  p { margin: .25rem 0; line-height: 1.6; }
  .muted { color: #6b7280; font-size: .875rem; }
  a { color: inherit; text-decoration: none; }
  .back { margin-top: 1.5rem; display: inline-flex; align-items: center; gap: .5rem; padding: .625rem 1rem; border: 1px solid #e5e7eb; border-radius: 12px; font-weight: 600; font-size: .875rem; background: #fff; color: #111827; }
  @media (prefers-color-scheme: dark) { .back { background: #0b1220; border-color: #1f2937; color: #e5e7eb; } }
</style>
</head>
<body>
  <div class="card">
    <span class="code">404</span>
    <h1>This page could not be found.</h1>
    <p>The page you are looking for does not exist or has been moved.</p>
    <p class="muted">If you typed the URL manually, please double-check the spelling and try again.</p>
    <a class="back" href="/">← Go back home</a>
  </div>
</body>
</html>
`;

// Next.js 16 proxy (replaces "middleware")
export function proxy(req: NextRequest) {
  const { nextUrl } = req;
  const pathname = nextUrl.pathname;
  const ua = userAgent(req);

  const secureToken = req.cookies.get('__Secure-next-auth.session-token')?.value;
  const localToken = req.cookies.get('next-auth.session-token')?.value;
  const hasSessionCookie = Boolean(secureToken || localToken);

  const isAuthPage = pathname.startsWith(ADMIN_SIGNIN);
  const isProtectedRoute =
    pathname.startsWith(ADMIN_PREFIX) && !isAuthPage;
  const isOldAdminPath = pathname.startsWith('/admin');

  // === Signin page handling ===
  if (isAuthPage) {
    if (hasSessionCookie) {
      return NextResponse.redirect(new URL(ADMIN_PREFIX, req.url));
    }
    return NextResponse.next();
  }

  // === Hidden 404 renderer for "there's nothing here" paths ===
  // IMPORTANT: Do NOT use NextResponse.rewrite(new URL('/404', req.url)) — the
  // catch-all [sellerId] route would pick up sellerId='404' and try fetching
  // seller data from Firestore, causing noisy errors.
  // Instead, return a raw Response with a self-contained 404 HTML page so the
  // request never touches any Next.js route handler at all.
  const renderHidden404 = () =>
    new Response(HIDDEN_404_HTML, {
      status: 404,
      headers: {
        'content-type': 'text/html; charset=utf-8',
        'cache-control': 'no-store, max-age=0',
        'x-content-type-options': 'nosniff',
      },
    });

  // === Old /admin* URLs ===
  // If you have a cookie → redirect to equivalent URL under new prefix.
  // If no cookie → pretend there is nothing here (404).
  if (isOldAdminPath) {
    if (!hasSessionCookie) {
      return renderHidden404();
    }
    const relative = pathname === '/admin' ? '' : pathname.slice('/admin'.length);
    const dest = `${ADMIN_PREFIX}${relative}${nextUrl.search}`;
    return NextResponse.redirect(new URL(dest, req.url));
  }

  // === Protected new-prefix admin URLs ===
  // Bots / headless / no cookie → hidden 404. Both humans and bots get the
  // same response so there's no signal to distinguish "this URL is special".
  if (isProtectedRoute) {
    if (!hasSessionCookie) {
      const looksLikeBot = !ua.ua || ua.ua.length < 20 || ua.isBot;
      void looksLikeBot;
      return renderHidden404();
    }
  }

  return NextResponse.next();
}

export default proxy;
