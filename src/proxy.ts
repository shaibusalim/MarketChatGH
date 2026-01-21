import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function proxy(req: NextRequest) {
	const { pathname } = req.nextUrl;

	const isProtectedRoute = pathname.startsWith('/admin') && !pathname.startsWith('/admin/signin');
	const isAuthPage = pathname.startsWith('/admin/signin');

	// Decode the NextAuth JWT (works in middleware/edge)
	const token = await getToken({ req });

	if (isProtectedRoute) {
		if (!token || !(token as any).isAdmin) {
			// Serve 404 to hide admin surface
			const url = new URL('/404', req.url);
			return NextResponse.rewrite(url);
		}
	} else if (isAuthPage && token && (token as any).isAdmin) {
		const url = new URL('/admin', req.url);
		return NextResponse.redirect(url);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ['/admin/:path*'],
};
